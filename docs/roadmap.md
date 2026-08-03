# JSketcher Roadmap

A high-level feature roadmap organised by area. Checked items are shipped; unchecked items are planned or in progress.

_Last updated: 2026-08-03_

---

## Shipped — UI Shell and Navigation

- [x] Structured Chaos shared shell (global bar, site header, shared CSS)
- [x] Changelog page mirroring the KnitStitch and Box of Dragons layout
- [x] View cube (top-right orientation cube, DOM overlay)
- [x] Plane highlight grid (Fusion-style floor grid on plane-based face highlight)
- [x] Origin floor grid
- [x] Persisted light and dark themes with `localStorage` restore on startup
- [x] Slate chrome refinements for the view cube and surrounding controls

---

## Shipped — Ribbon Icons

- [x] Modeler ribbon icons replaced with flat `lucide-react` icons
- [x] Centralized `modelerRibbonIcons` map and `ribbonIcon(id)` helper in `web/app/cad/workbench/modelerRibbonIcon.tsx`
- [x] Global quick-action icons (Save, STL Export, Theme toggle) using `lucide-react`
- [x] Sketcher ribbon icons following the same pattern as the modeler ribbon (`sketcherRibbonIcons` map and `sketcherRibbonIcon(id)` helper in `web/app/cad/workbench/sketcherRibbonIcon.tsx`)

---

## Planned — Icon Consistency

Make every ribbon, toolbar, and workbench use the same icon family and sizing model so the UI reads as a single product.

- [ ] Audit all workbench toolbars for non-lucide or missing icons
- [ ] Replace remaining sketcher action `appearance.icon` custom SVGs with lucide equivalents where the ribbon override is not the only consumer
- [ ] Add ribbon icon overrides for constraint actions (currently commented out in the sketcher toolbar) using lucide icons
- [ ] Ensure every action that appears in a ribbon has a `ribbonIcon` entry so no fallback text-stub icons render
- [ ] Document the icon mapping convention in `docs/maintainer-notes.md` so new workbenches follow it by default
- [ ] Consider a shared `ribbonIcon` helper that falls back across both the modeler and sketcher icon maps for shared actions like `LookAtFace`

---

## Planned — Action Previews

Improve the visual feedback when a user hovers or activates a modeling action (Extrude, Cut, Revolve, Loft, Sweep, Boolean, etc.) so the expected result is clearer before committing.

- [ ] Show a live preview of the operation result in the 3D viewport while the wizard dialog is open (some operations already preview on parameter change; make this consistent across all)
- [ ] Add pullable extrusion handles so users can drag extrusion depth directly in the viewport before committing
- [ ] Add hover tooltips with a short description and icon for every ribbon action
- [ ] Add visual cursor or mode indicator when a tool is active (e.g. sketch tools show the active tool state)
- [ ] Improve wizard dialog layout with inline previews of the selected geometry and the projected result
- [ ] Add preview-on-hover for ribbon buttons showing a small rendered example of the operation (stretch goal)

---

## Planned — Project Persistence

- [ ] Save projects to the database so signed-in users can access their work across devices and browser sessions
- [ ] Keep local browser storage as a fallback when database saving is unavailable

---

## Planned — Touchscreen and Pen Workflow

- [ ] Improve native touchscreen and pen interaction for sketching, selection, viewport navigation, and command entry
- [ ] Add touch-friendly UI affordances for common CAD workflows without compromising desktop precision

---

## Planned — Sketch Mode

- [ ] Re-enable constraint actions in the sketcher ribbon with lucide icons
- [ ] Add section labels to the sketcher ribbon matching the `HeadsUpToolbar` section pattern (Views, Create, Modify, Constraints, Measure)
- [ ] Improve sketch entity selection consistency (see KnitStitch AGENTS notes on entity-based selection)
- [ ] Add keyboard shortcuts for common sketch tools

---

## Planned — Z-Up Coordinate System

Switch the world up-axis from Y to Z so the convention matches industry-standard CAD tools (Fusion 360, SolidWorks, Onshape, etc.) where Z is up and the ground plane is XY. The viewer is currently Y-up (`camera.up = (0,1,0)`, floor on the XZ plane).

- [ ] Change the camera up vector to `(0,0,1)` and rework the default view orientation so Z is vertical
- [ ] Move the origin/floor grid from the XZ plane to the XY plane
- [ ] Update plane-based face highlight grids (`planeGridView`) to draw on the correct plane for the new convention
- [ ] Audit sketch plane handling so sketches on the "ground" sit on XY rather than XZ
- [ ] Update the view cube face labels and default camera angles for the new up-axis
- [ ] Audit model import/export (STEP, STL, DXF) for up-axis conversion so external files still load correctly
- [ ] Update maintainer notes and any coordinate-system references in the docs

---

## Planned — Workbench Framework

- [ ] Allow workbench switching from the ribbon (currently hard-coded to `modeler`)
- [ ] Add a workbench selector dropdown in the quick-action area
- [ ] Support per-workbench ribbon icon maps without duplicating the helper

---

## Planned — Documentation

- [x] Maintainer notes covering runtime shape, shell, startup, workbenches, actions, UI layout, icons, theme, view cube, plane grid
- [x] Git scopes reference
- [x] Theme system documentation
- [x] Roadmap page linked into the site nav
- [ ] Architecture overview document (system diagram, bundle startup order, service dependencies)
- [ ] Feature author guide update covering the ribbon icon pattern

---

## Planned — Build and Deployment

- [x] Webpack build to `dist/` static output
- [x] Grunt copy pipeline for static `web/` resources into `dist/`
- [ ] GitHub webhook auto-deploy for the VPS (matching the Structured Chaos family pattern)
- [ ] PM2 ecosystem config for any server-side process if needed
- [ ] Automated changelog generation from conventional commits (matching KnitStitch and Box of Dragons)
