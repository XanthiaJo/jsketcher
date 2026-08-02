/**
 * generate-changelog.mjs — JSketcher changelog generator.
 *
 * Generates docs/changelog.md showing only fork-specific commits (commits
 * that exist in the current branch but not in upstream). Uses `git cherry`
 * to identify fork-only commits by patch ID, so it works even when the fork
 * has rebased or rewritten history relative to upstream.
 *
 * Usage:
 *   node scripts/generate-changelog.mjs
 *   node scripts/generate-changelog.mjs --root=. --output=docs/changelog.md
 *   node scripts/generate-changelog.mjs --upstream=upstream/main
 *
 * Parameters:
 *   --root      Repository root path (default: current working directory)
 *   --output    Output file path (default: docs/changelog.md)
 *   --upstream  Upstream ref to compare against (default: upstream/main)
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq !== -1) {
        args[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          args[key] = next;
          i++;
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
}

function git(root, ...args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch (e) {
    throw new Error(`git ${args.join(' ')} failed: ${e.message}`);
  }
}

function getChangelogGroup(subject) {
  if (/BREAKING CHANGE|!:/i.test(subject)) return 'breaking';
  if (/^feat(\([^)]+\))?:/i.test(subject)) return 'feature';
  if (/^fix(\([^)]+\))?:/i.test(subject)) return 'fix';
  if (/^docs(\([^)]+\))?:/i.test(subject)) return 'docs';
  if (/^refactor(\([^)]+\))?:/i.test(subject)) return 'refactor';
  if (/^test(\([^)]+\))?:/i.test(subject)) return 'test';
  if (/^chore(\([^)]+\))?:/i.test(subject)) return 'chore';
  if (/^ui(\([^)]+\))?:/i.test(subject)) return 'ui';
  return 'other';
}

function humanizeCommitSubject(subject) {
  let summary = subject.replace(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i, '');
  summary = summary.trim();
  if (summary === '') return subject;
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}

function cleanCommitDescription(subject, body) {
  body = body.trim();
  if (body === '') return null;

  const lines = body.split(/\r?\n/);

  let hasBullets = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || /^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
      continue;
    }
    if (/^[-*]\s/.test(trimmed)) {
      hasBullets = true;
      break;
    }
  }

  const stripPrefix = (text) => {
    const match = text.match(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i);
    if (match) {
      const rest = text.slice(match[0].length).trim();
      if (rest !== '') return rest;
    }
    return text;
  };

  const summaryPrefix = subject.replace(/^(?:[a-z]+(?:\([^)]+\))?!?:\s*|BREAKING CHANGE:?\s*)/i, '').trim();

  if (hasBullets) {
    const bullets = [];
    let currentBullet = null;

    const processCurrentBullet = () => {
      if (currentBullet === null) return;
      let trimmed = currentBullet.replace(/\s+/g, ' ').trim();
      if (trimmed === '') {
        currentBullet = null;
        return;
      }
      trimmed = stripPrefix(trimmed);
      if (summaryPrefix !== '' && trimmed.toLowerCase().startsWith(summaryPrefix.toLowerCase())) {
        trimmed = trimmed.slice(summaryPrefix.length).trim();
      }
      if (trimmed !== '') bullets.push(trimmed);
      currentBullet = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || /^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
        processCurrentBullet();
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        processCurrentBullet();
        currentBullet = trimmed.replace(/^[-*]\s+/, '');
      } else if (currentBullet !== null) {
        currentBullet += ' ' + trimmed;
      } else {
        currentBullet = trimmed;
      }
    }
    processCurrentBullet();

    return bullets.length > 0 ? bullets : null;
  }

  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }
    if (/^(Signed-off-by:|Co-authored-by:|Reviewed-by:|Acked-by:)/i.test(trimmed)) {
      continue;
    }
    let cleaned = trimmed.replace(/^-\s*/, '').replace(/^\*\s*/, '');
    current.push(cleaned);
  }

  if (current.length > 0) {
    paragraphs.push(current.join(' '));
  }

  for (let paragraph of paragraphs) {
    paragraph = paragraph.replace(/\s+/g, ' ').trim();
    if (paragraph !== '') {
      paragraph = stripPrefix(paragraph);
      if (summaryPrefix !== '' && paragraph.toLowerCase().startsWith(summaryPrefix.toLowerCase())) {
        paragraph = paragraph.slice(summaryPrefix.length).trim();
      }
      if (paragraph === '') continue;
      return paragraph;
    }
  }

  return null;
}

// --- Main ---

const args = parseArgs(process.argv);
const root = args.root ? resolve(args.root) : process.cwd();
const outputPath = args.output ? resolve(args.output) : resolve(root, 'docs/changelog.md');
const upstreamRef = args.upstream || 'upstream/main';
const headRef = args.head || 'HEAD';

// Find fork-only commits using git cherry (compares patch IDs)
let cherryOutput;
try {
  cherryOutput = git(root, 'cherry', upstreamRef, headRef);
} catch (e) {
  console.error(`Could not run 'git cherry ${upstreamRef} ${headRef}'.`);
  console.error(`Make sure the upstream remote exists: git remote add upstream https://github.com/xibyte/jsketcher.git`);
  console.error(`Then: git fetch upstream`);
  process.exit(1);
}

const forkCommitShas = [];
for (const line of cherryOutput.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('+ ')) {
    forkCommitShas.push(trimmed.slice(2));
  }
}

if (forkCommitShas.length === 0) {
  console.error('No fork-specific commits found. All commits exist in upstream.');
  process.exit(0);
}

// Fetch full details for each fork commit (oldest first for chronological order)
// --no-walk ensures we only get the named commits, not their full ancestry
const logOutput = git(root, 'log', '--no-walk', '--pretty=format:%H%x1f%ad%x1f%s%x1f%B%x1e', '--date=short', '--reverse', ...forkCommitShas);

// Parse all fork commit records into a list (oldest first due to --reverse)
const forkCommits = [];
for (const record of logOutput.split('\x1e')) {
  if (record.trim() === '') continue;
  const parts = record.split('\x1f', 4);
  if (parts.length !== 4) continue;
  forkCommits.push({
    sha: parts[0].trim(),
    date: parts[1].trim(),
    subject: parts[2].trim(),
    body: parts[3],
  });
}

// --- Version computation ---
// Walk fork commits oldest-first, starting from the v0.1.0 baseline tag.
// The tag points at the first fork commit; each subsequent commit bumps
// the version per conventional commit rules (feat=minor, fix=patch,
// BREAKING=major, everything else=revision increment).

function getCommitType(subject) {
  if (/BREAKING CHANGE|!:/i.test(subject)) return 'major';
  if (/^feat(\([^)]+\))?:/i.test(subject)) return 'minor';
  if (/^fix(\([^)]+\))?:/i.test(subject)) return 'patch';
  return 'none';
}

function formatVersion(version, revision = 0) {
  if (revision > 0) {
    return `v${version[0]}.${version[1]}.${version[2]}.${revision}`;
  }
  return `v${version[0]}.${version[1]}.${version[2]}`;
}

// Find the baseline tag (v0.1.0) and which commit it points to
let baselineVersion = [0, 1, 0, 0];
let baselineSha = null;
try {
  const tagSha = git(root, 'rev-list', '-n', '1', 'v0.1.0').trim();
  baselineSha = tagSha;
} catch (e) {
  // v0.1.0 tag not found — start from 0.0.0 and let the first commit set it
  baselineVersion = [0, 0, 0, 0];
}

let resolvedVersion = baselineVersion.slice();
let revision = 0;

// If the baseline tag exists, the commit it points to IS v0.1.0 — don't bump it
const changeGroups = {
  breaking: [],
  feature: [],
  fix: [],
  ui: [],
  docs: [],
  refactor: [],
  test: [],
  chore: [],
  other: [],
};

for (const commit of forkCommits) {
  const { sha, date, subject, body } = commit;

  // If this is the baseline commit, it's already v0.1.0 — don't bump
  if (baselineSha && sha === baselineSha) {
    resolvedVersion = baselineVersion.slice();
    revision = 0;
  } else {
    const commitType = getCommitType(subject);
    switch (commitType) {
      case 'major':
        resolvedVersion = [resolvedVersion[0] + 1, 0, 0, 0];
        revision = 0;
        break;
      case 'minor':
        resolvedVersion = [resolvedVersion[0], resolvedVersion[1] + 1, 0, 0];
        revision = 0;
        break;
      case 'patch':
        resolvedVersion = [resolvedVersion[0], resolvedVersion[1], resolvedVersion[2] + 1, 0];
        revision = 0;
        break;
      default:
        revision++;
        break;
    }
  }

  const group = getChangelogGroup(subject);
  changeGroups[group].push({
    version: formatVersion(resolvedVersion, revision),
    sha: sha.slice(0, 8),
    date,
    subject: humanizeCommitSubject(subject),
    description: cleanCommitDescription(subject, body),
  });
}

const currentVersion = formatVersion(resolvedVersion, revision);

// Total commit count and HEAD info (for the snapshot line)
const commitCount = parseInt(git(root, 'rev-list', '--count', headRef).trim(), 10);
const shortSha = git(root, 'rev-parse', '--short', headRef).trim();
const forkCommitCount = forkCommitShas.length;

// Generate markdown
const groupLabels = {
  breaking: 'Breaking Changes',
  feature: 'Features',
  fix: 'Fixes',
  ui: 'Interface',
  docs: 'Documentation',
  refactor: 'Refactors',
  test: 'Tests',
  chore: 'Maintenance',
  other: 'Other Changes',
};

const groupOrder = ['breaking', 'feature', 'fix', 'ui', 'docs', 'refactor', 'test', 'chore', 'other'];

const lines = [];
lines.push('# Changelog');
lines.push('');
lines.push(`> **${currentVersion}** — ${forkCommitCount} fork commits · ${commitCount} total commits · HEAD ${shortSha}`);
lines.push('');
lines.push('> Only commits unique to this fork are listed. Upstream history is excluded.');
lines.push('> Generated from conventional commits using `git cherry ' + upstreamRef + ' ' + headRef + '`.');
lines.push('');
lines.push(`_Last generated: ${new Date().toISOString().slice(0, 10)}_`);
lines.push('');

for (const group of groupOrder) {
  const entries = changeGroups[group];
  if (entries.length === 0) continue;

  lines.push('---');
  lines.push('');
  lines.push(`## ${groupLabels[group]}`);
  lines.push('');

  for (const entry of entries) {
    lines.push(`### ${entry.subject}`);
    lines.push('');
    lines.push(`**${entry.version}** · ${entry.sha} · ${entry.date}`);
    lines.push('');
    if (entry.description) {
      if (Array.isArray(entry.description)) {
        for (const bullet of entry.description) {
          lines.push(`- ${bullet}`);
        }
      } else {
        lines.push(entry.description);
      }
      lines.push('');
    }
  }
}

lines.push('---');
lines.push('');

const content = lines.join('\n');

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content, 'utf8');

console.log(`Generated ${outputPath}`);
console.log(`  Version: ${currentVersion}`);
console.log(`  ${forkCommitCount} fork-only commits (out of ${commitCount} total)`);
console.log(`  Upstream ref: ${upstreamRef}`);
console.log(`  HEAD: ${shortSha}`);
