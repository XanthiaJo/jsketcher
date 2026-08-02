// PM2 config for the JSketcher webhook server.
//
// The webhook server is a tiny Node.js HTTP server that listens for GitHub
// push events and runs the deploy commands (git fetch + reset, npm ci,
// changelog regen, grunt build). nginx serves the built dist/ directory
// directly as static files — there is no Node app process to reload.
//
// Setup:
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup

const { readdirSync, existsSync, statSync } = require('node:fs');
const { join } = require('node:path');

// Build a PATH that includes nvm-managed Node.js binaries so PM2 can find
// `node`, `npm`, and `npx` even when it was started from a minimal shell.
function nodePath() {
  const extra = ['/usr/local/bin', '/usr/bin', '/bin'];
  const home = process.env.HOME || `/home/${process.env.USER || 'jsketcher'}`;
  const nvmDir = join(home, '.nvm/versions/node');
  if (existsSync(nvmDir)) {
    for (const entry of readdirSync(nvmDir)) {
      const nvmBin = join(nvmDir, entry, 'bin');
      if (existsSync(nvmBin) && statSync(nvmBin).isDirectory()) {
        extra.push(nvmBin);
      }
    }
  }
  let path = process.env.PATH || '';
  for (const p of extra) {
    if (existsSync(p) && !path.includes(p)) {
      path += `:${p}`;
    }
  }
  return path;
}

module.exports = {
  apps: [
    {
      name: 'jsketcher-webhook',
      script: 'scripts/webhook-server.mjs',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        WEBHOOK_PORT: 3004,
        PATH: nodePath(),
      },
    },
  ],
};
