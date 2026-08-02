# Code Style

Read `docs/maintainer-notes.md` before making broad UI, theme, workbench, scene, or startup changes. It maps where the important systems live and records fork-specific decisions.

Use the Structured Chaos Conventional Commit rules. Common JSketcher scopes are listed in `docs/git-scopes.md`.

## Structured Chaos shell

This fork uses StructuredChaos `css/shared.css`, `js/global-bar.js`, and `js/site-header.js` for public chrome. Keep `web/css/site-shell.css` layout-only; do not restyle the global bar, title header, nav, project links, or collapse tab in this repo.

The app index is the 3D CAD page. The old standalone `sketcher.html` 2D entry has been removed from this fork. Local dev runs on `http://localhost:3001`; production is static `dist/` output, not a Node app.

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
