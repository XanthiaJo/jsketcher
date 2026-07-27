# Maintainer Notes

This file is a practical map for working on this fork. It records where the main systems live, how recent UI/theme changes are wired, and the conventions that are easy to miss when moving around the codebase.

## Runtime Shape

JSketcher is a browser-only CAD app. There is no application server in normal use.

- `web/app/index.js` starts the full CAD app.
- `web/app/sketcher.js` starts the standalone 2D sketcher.
- `webpack.config.js` builds both entry points into `dist/static`.
- `web/` is also served as static content by webpack-dev-server.
- OpenCascade functionality is provided through `jsketcher-occ-engine` and browser-loaded wasm assets.

## Application Startup

The CAD app is assembled through bundles in `web/app/cad/init/startApplication.js`.

- `preUIBundles` define and activate services that must exist before React renders.
- React starts through `web/app/cad/dom/startReact`.
- The remaining bundles activate after React has mounted.
- `context` from `web/app/cad/context` is the shared application object passed through services, streams, and React context.
- `LegacyStructureBundle` still creates some old-style context shape. Do not remove it casually.

When adding a new cross-cutting service, follow the bundle pattern:

1. Define streams, if the service exposes reactive state.
2. Attach the service to `ctx`.
3. Activate it in `startApplication.js` in the right phase.
4. Keep UI-only registration out of domain services.

## Major Directories

- `modules/brep` - BRep/topological geometry primitives and helpers.
- `modules/geom` - geometry algorithms and lower-level geometry types.
- `modules/math` - math primitives and solvers.
- `modules/scene` - Three.js scene setup, controls, scene graph helpers, object metadata.
- `modules/ui` - reusable UI components and global/theme styles.
- `modules/workbenches` - workbench definitions and feature registrations.
- `web/app/cad` - the main CAD application shell, services, model layer, scene views, craft/history, storage, workbench UI.
- `web/app/sketcher` - standalone sketcher tools, constraints, shapes, and sketcher UI.
- `web/css` - global page chrome CSS for entry pages outside CSS modules.
- `docs` - maintainer and feature author documentation.
- `test` - small repo-specific Node tests.

## Workbenches And Ribbon

Workbench registration starts in `modules/workbenches/registry.ts`.

- Add workbenches by exporting a `WorkbenchConfig` and including it in `WorkbenchRegistry`.
- The default workbench is currently hard-coded as `modeler` in `web/app/cad/workbench/workbenchService.ts`.
- Workbench feature commands live under `modules/workbenches/<workbench>/features`.
- Each feature should have its operation file, optional icon asset, and docs folder.
- The modeler ribbon is defined in `modules/workbenches/modeler/index.ts`.

The top ribbon is not owned by the generic toolbar component. The generic toolbar only renders action refs. Change the top ribbon by editing the active workbench's `ui.toolbar` list.

Action refs can be:

- `'ActionId'` for a normal action.
- `'-'` for a splitter.
- `'|'` for a toolbar breaker.
- `['ActionId', overrides]` for per-toolbar label/icon overrides.
- Nested arrays for grouped buttons.

`web/app/cad/dom/components/PlugableToolbar.jsx` renders those refs. Keep this component generic; do not hard-code specific CAD commands here.

## Actions

Actions are registered through `ctx.actionService`.

- Core/global actions live in `web/app/cad/actions`.
- Workbench-specific actions can be registered through a workbench config.
- Operation-backed feature actions are registered by `web/app/cad/craft/operationBundle.ts`.
- Toolbar/menu entries should refer to action ids, not directly call operation code.

An action generally has:

- `id`
- `appearance`
- `invoke`
- optional state/enablement streams

Prefer adding behavior to the action or operation layer, then exposing it through toolbar/menu config.

## UI Layout

The main CAD viewport composition lives in `web/app/cad/dom/components/View3d.jsx`.

Important overlays:

- `HeadsUpToolbar` - top ribbon/quick controls.
- `HeadsUpHelper` - contextual helper prompt.
- `ViewCube` - top-right orientation cube.
- `FloatView` - floating panels such as explorer/history/expressions.
- `WizardManager` - operation dialogs.
- Sketcher overlays are only active inside `SketcherMode`.

The bottom camera/control bar has been removed in this fork. Do not reintroduce bottom-bar controls unless that is an explicit UI direction.

## Icons

This fork uses simple flat ribbon icons through `lucide-react`.

- Ribbon icons in the modeler workbench are configured in `modules/workbenches/modeler/index.ts`.
- Global quick-action icons are configured in `web/app/cad/workbench/uiConfigBundle.js`.
- Use `getSizeInPx` from `cad/icons/DeclarativeIcon` so icon sizing follows the existing toolbar size model.
- Use thin, readable strokes. Current ribbon helper uses `strokeWidth: 1.8`.
- Keep icon choices descriptive rather than decorative.

Avoid replacing the generic toolbar renderer to change an icon. Prefer action appearance or per-toolbar overrides.

## Theme System

The theme system is CSS-custom-property based.

- `modules/ui/styles/theme.less` defines the default dark theme in `:root`.
- `modules/ui/styles/theme-light.less` defines the light override under `body.theme-light`.
- `modules/ui/styles/global/index.less` imports both theme files.
- `modules/ui/styles/theme.ts` exposes runtime CSS variable reads to JavaScript.
- `test/theme.test.js` checks that dark/light variables stay structurally aligned.

Theme persistence:

- `web/app/cad/actions/coreActions.js` defines `ToggleTheme`.
- The selected theme is saved as `localStorage['jsketcher.theme']`.
- `web/app/cad/dom/components/WebApplication.jsx` restores `body.theme-light` on startup when the saved value is `light`.

The Three.js renderer background does not update automatically from CSS. It is synced through:

- `modules/scene/sceneSetup.ts` - `updateClearColor()`
- `web/app/cad/scene/viewer.ts` - `updateClearColor()`

Any new theme toggle must call `viewer.updateClearColor()` after changing body classes.

See `docs/theme/theme-system.md` for the full theme documentation.

## View Cube

The orientation cube is a DOM overlay, not a Three.js object.

- Component: `web/app/cad/dom/components/ViewCube.tsx`
- Styles: `web/app/cad/dom/components/ViewCube.less`
- Mounted by: `web/app/cad/dom/components/View3d.jsx`

It listens to `sceneSetup.sceneRendered$` and derives a CSS transform from the active camera. Face clicks run existing standard view actions such as `StandardViewFront` and `StandardViewTop`.

Keep the cube as a lightweight UI control. Camera math and view changes should stay in existing viewer/action services.

## Plane Highlight Grid

The Fusion-style floor grid is only displayed while a plane-based face is highlighted.

- Factory: `web/app/cad/scene/views/planeGridView.js`
- Hook: `web/app/cad/scene/views/faceView.js`

`SketchingView.mark('highlight')` shows the grid when `model.isPlaneBased` is true. `withdraw('highlight')` hides it. `dispose()` removes and disposes the grid.

Keep this behavior highlight-scoped. Do not make permanent construction grids part of `FaceView` unless the product decision changes.

## Styling Conventions

- Global theme tokens belong in `modules/ui/styles/theme.less` and `modules/ui/styles/theme-light.less`.
- Reusable Less variables should map to CSS variables in `theme.less`.
- CSS modules are used for app/components under `modules` and `web/app`.
- Global, non-module CSS is used under `web/css` and `modules/ui/styles/global`.
- Avoid Less color functions such as `darken(var(...))`; Less cannot compute on runtime CSS variables.
- Define explicit token variants instead, such as `--color-accent` and `--color-accent-dark`.

## TypeScript And JavaScript

This repo is mixed JS/JSX/TS/TSX.

- `tsconfig.json` has `allowJs: true`.
- Path aliases resolve from `modules`, `web/app`, and `node_modules`.
- Prefer existing aliases such as `cad/...`, `scene/...`, `ui/...`, and `workbenches/...` over deep relative imports when nearby code already uses them.
- React is currently React 16. Do not introduce React 18-only APIs.
- Existing class components are common. Do not rewrite to hooks unless the change needs it.

Code style:

- 2-space indentation.
- 120-column target from `.editorconfig`.
- No `var`; use `const` or `let`.
- Prefer `const` where possible.
- No underscore prefix for private members unless a getter/setter collision forces it.
- Keep generic renderers generic. Put feature-specific decisions in config, actions, or operations.

## Validation

Useful commands:

```bash
npm start
node test/theme.test.js
node ./node_modules/eslint/bin/eslint.js web/app modules
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/webpack/bin/webpack.js --config webpack.config.js --progress --profile
```

Notes:

- `npm run pack` currently includes `--colors`, which may fail with the installed webpack CLI. Use the direct webpack command above if that happens.
- Full TypeScript checking may surface dependency or legacy-code issues unrelated to a UI change. Use targeted checks when working in a dirty branch, but still run the broader checks before a clean merge.
- Webpack may warn about conflicting star exports from `react-icons/all.js`; this is pre-existing in sketcher actions.

## Git Hygiene For This Fork

- Keep this fork based on upstream JSketcher.
- Do not copy source from unrelated forks into this fork.
- Similar UI ideas are acceptable, but implement them with this repo's own components, actions, and styles.
- Avoid broad branch checkouts from experimental branches. Copy specific files or patch specific hunks.
- The worktree may contain staged and unstaged changes at the same time. Check `git status --short` before editing and do not revert unrelated user work.

## Where To Put New Notes

- Add feature-author docs to the feature's `docs/index.md`.
- Add theme details to `docs/theme/theme-system.md`.
- Add broad maintainer/process notes here.
- Add future architecture proposals to `DESIGN.md`.
- Add agent-facing style rules to `AGENTS.md`.
- Add commit scope guidance to `docs/git-scopes.md`.
