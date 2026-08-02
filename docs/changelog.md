# Changelog

> **v0.4.0** — 8 fork commits · 1792 total commits · HEAD 29d01a5a

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

---

## Interface

### Replace modeler ribbon icons

**v0.2.0.1** · a51f38a1 · 2026-07-27

### Refine slate chrome and view cube controls

**v0.3.0.1** · 23ce306e · 2026-07-27

---

## Documentation

### Add jsketcher commit scopes

**v0.1.0.1** · 0b36ded4 · 2026-07-27

### Move developer guide into docs

**v0.1.0.2** · 38c2e873 · 2026-07-27

---

## Other Changes

### Fix PR #219 build: implement missing functions and remove dead imports

**v0.1.0** · fd047e3e · 2026-07-24

PR #219 added imports for SketchStartBundle and DirectEditBundle but never uploaded those files, causing build failures. Removed the dead imports. Implemented the missing camera functions (fitFaceToOrthoCamera, animateSketchEntry, fitSceneToCamera, fitSceneToCameraAnimated) in usabilityActions.js and getDeflection() in craft/e0/common.js that were referenced but never defined.

---
