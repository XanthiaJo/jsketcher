# Code Style

Read `docs/maintainer-notes.md` before making broad UI, theme, workbench, scene, or startup changes. It maps where the important systems live and records fork-specific decisions.

Use the Structured Chaos Conventional Commit rules. Common JSketcher scopes are listed in `docs/git-scopes.md`.

## Structured Chaos shell

This fork uses StructuredChaos `css/shared.css`, `js/global-bar.js`, and `js/site-header.js` for public chrome. Keep `web/css/site-shell.css` layout-only; do not restyle the global bar, title header, nav, project links, or collapse tab in this repo.

The app index is the 3D CAD page. The old standalone `sketcher.html` 2D entry has been removed from this fork. Local dev runs on `http://localhost:3001`; production is static `dist/` output, not a Node app.

## VPS Deploy via GitHub Webhook

The VPS auto-deploys when GitHub receives a push to `main`.

`scripts/webhook-server.mjs` is a small Node.js HTTP server (no external dependencies) that:

1. Verifies the GitHub HMAC-SHA256 signature using `GITHUB_WEBHOOK_SECRET` from `.env`
2. Checks that the push is to `refs/heads/main`
3. Runs the deploy commands:
   - `git fetch origin main` + `git reset --hard origin/main`
   - `npm ci`
   - `node scripts/generate-changelog.mjs --root=. --format=md --output=docs/changelog.md`
   - `node scripts/generate-changelog.mjs --root=. --format=html --output=web/changelog-fragment.html`
   - `npx grunt` (regenerates docs/changelog metadata, then builds static output to `dist/`)

nginx serves the `dist/` directory directly as the document root. No Node app process to reload — the webhook server is the only PM2 process.

### Setup

1. Set `GITHUB_WEBHOOK_SECRET` in `.env` on the VPS
2. `pm2 start ecosystem.config.cjs && pm2 save && pm2 startup`
3. Configure nginx:
   - `location /webhook { proxy_pass http://127.0.0.1:3004; }`
   - `location / { root /path/to/jsketcher/dist; try_files $uri $uri/ /index.html; }`
4. In GitHub repo settings → Webhooks → Add webhook:
   - Payload URL: `https://jsketcher.misssponto.me.uk/webhook`
   - Content type: `application/json`
   - Secret: same value as `GITHUB_WEBHOOK_SECRET`
   - Events: Just the push event

### Manual deploy (fallback)

SSH into the VPS and run:

```bash
cd /path/to/jsketcher
git fetch origin main
git reset --hard origin/main
npm ci
node scripts/generate-changelog.mjs --root=. --format=md --output=docs/changelog.md
node scripts/generate-changelog.mjs --root=. --format=html --output=web/changelog-fragment.html
npx grunt
```

## No underscore prefix on private members

Do not use underscore prefix for private fields or methods:

```ts
// bad
private _mouseDown = false;
private _handleClick(e: MouseEvent): void { ... }

// good
private mouseDown = false;
private handleClick(e: MouseEvent): void { ... }
```

Only use underscore when a public getter collides with the backing field name:

```ts
// ok - getter forces the underscore
private _selected: boolean = false;
get selected(): boolean { return this._selected; }
```
