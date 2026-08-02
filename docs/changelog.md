# Changelog

> **v0.7.0** — 19 fork commits · 1803 total commits · HEAD 557de613

> Only commits unique to this fork are listed. Upstream history is excluded.
> Generated from conventional commits using `git cherry upstream/main HEAD`.

_Last generated: 2026-08-02_

---

## Features

### Restore persisted light and dark themes

**v0.2.0** · c7f6bcb0 · 2026-07-27

### Add view cube and plane highlight grid

**v0.3.0** · 79fb0900 · 2026-07-27

### Add origin floor grid

**v0.4.0** · 29d01a5a · 2026-07-27

### Add turntable/trackball orbit mode toggle

**v0.5.0** · b08de976 · 2026-08-02

- add OrbitMode enum and persisted orbitMode\$ state to Viewer with localStorage persistence
- add toggleOrbitMode action and apply turntable/trackball rotation mode to CADTrackballControls
- add orbit mode icon helper in coreActions and reflect active mode on the ToggleOrbitMode button via uiConfigBundle
- add CameraControl component and cameraControlRenderer wiring for the orbit mode UI
- guard zoomIn, zoomOut, lookAt, dispose, and orbit mode init against missing renderer/trackballControls so the viewer stays safe when WebGL is unavailable

### Refresh light theme and site shell

**v0.6.0** · 6b91f4ce · 2026-08-02

- refresh light theme tokens and styles
- add site-shell.css for Structured Chaos family chrome
- wire View3d, WebApplication, and MenuHolder to the refreshed theme

### Generate changelog HTML fragment matching KS pattern

**v0.7.0** · 557de613 · 2026-08-02

- add --format=html to generate-changelog.mjs producing panels, chips, and sidebar blocks (Change Types, Versions) matching the KnitStitch changelog structure
- update changelog.html to fetch the pre-generated HTML fragment instead of rendering markdown client-side with marked.js
- add gen-changelog grunt task that generates both md and html during build
- update npm changelog script and webhook deploy commands to generate both formats

---

## Fixes

### Handle WebGL unavailable gracefully

**v0.4.1** · de7e5485 · 2026-08-02

- check WebGL support in SceneSetUp before initialising renderer, controls, and animation loop
- show a warning overlay with troubleshooting steps when WebGL context creation fails
- guard renderer-dependent methods (render, updateClearColor, updateViewportSize, domElement) with null checks
- activate DomBundle and SceneBundle first inside the startReact callback so the viewer container exists and WebGL availability can be checked before activating dependent bundles
- skip WebGL-dependent bundles (MouseEventSystem, Marker, PickControl, EntityContext, ViewSync, Highlight, Assembly, Debug, Preview, UIConfig) when WebGL is not available
- provide dummy highlightService, cadScene, pickControl, and modelMouseEventSystem in SceneBundle so non-WebGL bundles and React components do not crash
- guard MouseEventSystemBundle against missing domElement and trackballControls
- guard PickControlBundle and DomBundle tab switch against a missing renderer
- guard ExportBundle image/png export against a missing renderer or cadScene
- guard Viewer dispose against a missing renderer

---

## Interface

### Replace modeler ribbon icons

**v0.2.0.1** · a51f38a1 · 2026-07-27

### Refine slate chrome and view cube controls

**v0.3.0.1** · 23ce306e · 2026-07-27

### Migrate action icons to lucide-react

**v0.5.0.1** · 04ca86dc · 2026-08-02

- replace react-icons and FontAwesome css icons with lucide-react footer icons in usabilityActions
- add modelerRibbonIcon and sketcherRibbonIcon components
- update menuConfig to use the new icon components

### Restyle view cube and heads-up toolbar

**v0.5.0.2** · 3ed0bd1e · 2026-08-02

- restyle view cube faces, home button, and hover states with a lighter palette
- update ViewCube component to match the new styling
- refresh heads-up toolbar layout and styles
- adjust control bar and bottom stack spacing

---

## Documentation

### Add jsketcher commit scopes

**v0.1.0.1** · 0b36ded4 · 2026-07-27

### Move developer guide into docs

**v0.1.0.2** · 38c2e873 · 2026-07-27

### Add architecture, roadmap, and maintainer notes

**v0.6.0.1** · bcd89ccf · 2026-08-02

- add architecture, code-style, feature-preservation, and roadmap docs
- expand maintainer notes with system maps and fork-specific decisions
- add changelog and roadmap html pages
- update README, AGENTS, git-scopes, and docs index

### Add nginx config and VPS setup scripts

**v0.6.0.5** · 15ebfdc0 · 2026-08-02

- add www.jsketcher.misssponto.me.uk nginx config (root dist/, /webhook proxy to 3004)
- add www.auth.misssponto.me.uk nginx config (root BetterAuth, /webhook proxy to 3002, / proxy to 3000)
- add setup scripts for nvm, SSH keys, and git credentials used during VPS provisioning

---

## Refactors

### Misc model, workbench, and craft cleanup

**v0.6.0.3** · 5bfcf0f6 · 2026-08-02

- tidy deleteBody operation and modeler index
- adjust mdatum and mopenFace model handling
- update openFaceView and sketcherUIContrib
- minor craftBundle and Wizard tweaks
- extend projectBundle load handling

---

## Maintenance

### Remove standalone sketcher entry and update config

**v0.6.0.2** · e2ece5c9 · 2026-08-02

- remove standalone sketcher.html 2D entry (app index is now the 3D CAD page)
- remove .vscode/launch.json
- update webpack, grunt, and package config for the consolidated entry
- add scripts and shared shell fallback js
- update index.html shell wiring

### Add GitHub webhook server for VPS auto-deploy

**v0.6.0.4** · b7522ef2 · 2026-08-02

- add scripts/webhook-server.mjs (no-dep Node.js server, verifies HMAC-SHA256, deploys on push to main)
- add ecosystem.config.cjs for PM2 (jsketcher-webhook on port 3004)
- add .env.example with GITHUB_WEBHOOK_SECRET template
- add .env to .gitignore
- document setup, nginx config, and manual fallback in AGENTS.md

---

## Other Changes

### Fix PR #219 build: implement missing functions and remove dead imports

**v0.1.0** · fd047e3e · 2026-07-24

PR #219 added imports for SketchStartBundle and DirectEditBundle but never uploaded those files, causing build failures. Removed the dead imports. Implemented the missing camera functions (fitFaceToOrthoCamera, animateSketchEntry, fitSceneToCamera, fitSceneToCameraAnimated) in usabilityActions.js and getDeflection() in craft/e0/common.js that were referenced but never defined.

---
