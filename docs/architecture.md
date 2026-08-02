# Architecture Overview

This document is a top-down map of the whole JSketcher system: what the major
subsystems are, where they live, how they interlink, and what the data flow
looks like end to end. It is written for someone who has never seen the
codebase before.

For a practical fork-specific map (UI wiring, theme, validation commands,
git conventions), see [maintainer-notes.md](./maintainer-notes.md). For the
workbench/feature author guide (operation descriptors, schema fields, form
widgets), see [index.md](./index.md). For code style baselines, see
[code-style.md](./code-style.md).

## System At A Glance

JSketcher is a browser-only parametric 3D CAD modeler. There is no
application server in normal use — everything runs client-side:

- **Three.js** renders the 3D viewport.
- **OpenCascade** (compiled to WASM via `jsketcher-occ-engine`) performs
  BREP solid modeling operations.
- A custom **2D constraint solver** (pure JS/TS) drives sketch geometry.
- A **reactive stream system** (`lstream`) wires state through the app.
- A **bundle system** assembles the application context at startup.
- **React 16** renders the UI shell, toolbars, wizards, and panels.

```
User input
  │
  ▼
Actions ──▶ Wizard (operation params) ──▶ CraftService (history pipeline)
  │                                          │
  │                                          ▼
  │                                     OperationDescriptor.run()
  │                                          │
  │                                          ▼
  │                                     OCC command interface (Proxy)
  │                                          │
  │                                          ▼
  │                                     OpenCascade WASM
  │                                          │
  │                                          ▼
  │                                     OperationResult { consumed, created }
  │                                          │
  │                                          ▼
  │                                     models$ stream ──▶ CadRegistry index
  │                                          │
  │                                          ▼
  │                                     ViewSync ──▶ Scene views ──▶ Three.js render
  ▼
Sketcher (2D constraint solver) ──▶ sketchStorage ──▶ sketchToFaces ──▶ OCC
```

## Directory Layout

```
modules/
  brep/        BRep/topological geometry primitives and helpers
  geom/        geometry algorithms and lower-level geometry types
  math/        math primitives (Vector, CSys, Matrix, Axis) and solvers
  scene/       Three.js scene setup, camera controls, scene graph, object metadata
  ui/          reusable UI components, connect(), useStream(), global/theme styles
  lstream/     reactive stream system (state, externalState, combine, map, etc.)
  workbenches/ workbench definitions and feature (operation) registrations
  bundler/     bundle system (dependency-ordered activation)

web/
  index.html         CAD app entry page (loads shared Structured Chaos chrome)
  app/
    index.js         starts the full CAD app
    cad/
      context/       ApplicationContext composite interface + LegacyStructureBundle
      init/          startApplication.js (bundle activation order), lifecycleBundle
      actions/       core/global action definitions (coreActions, usabilityActions, ...)
      scene/         viewer, cadScene, camera controls, view sync, scene views
      craft/         operation history pipeline, operation registry, OCC integration,
                     wizard system, datum operations, production analysis
      model/         MObject hierarchy (MShell, MFace, MEdge, MVertex, MDatum, ...)
      sketch/        in-place sketcher integration (bridges 2D sketcher into 3D CAD)
      workbench/     workbench service, ribbon icon maps, UI config bundle, menu config
      dom/           React component tree (View3d, toolbars, menus, control bars, ...)
      storage/       localStorage-backed project/sketch storage
      expressions/   expression evaluator (named dimensions / parameters)
      keyboard/      keyboard shortcut handling
      projectBundle.ts   project save/load, default seed history
    sketcher/        standalone 2D sketcher (tools, shapes, constraints, solver, UI)

docs/                maintainer notes, architecture (this file), code style, roadmap,
                     feature preservation, git scopes, theme system, changelog
test/                repo-specific Node tests (theme structure check)
```

## Bundle System And Application Context

The app is assembled from **bundles** — modules that activate in dependency
order and attach services/streams to a shared `ApplicationContext`.

### Bundle interface

```typescript
interface Bundle<WorkingContext> {
  activationDependencies?: string[];  // bundle names that must activate first
  defineStreams?(ctx);                // define streams before any activation
  activate(ctx: WorkingContext);      // attach services, register actions, etc.
  BundleName: string;                 // unique id, e.g. "@Craft"
}
```

### Activation phases

Defined in `web/app/cad/init/startApplication.js`:

1. **LegacyStructureBundle** activates first — creates `ctx.services = {}`
   and `ctx.streams = {}`.
2. **Stream definition** — every bundle with `defineStreams` defines its
   streams before any activation happens (so cross-bundle stream references
   resolve).
3. **Pre-UI bundles** activate (lifecycle, project, storage, actions, UI,
   menu, keyboard, expressions, operations, craft, extensions, sketch
   storage, wizard, preview, craft UI, cad registry, export, exposure, OCC,
   project manager).
4. **React starts** (`startReact`).
5. **Post-UI bundles** activate (DOM, scene, mouse events, marker, pick
   control, entity context, workbenches loader, workbench, sketcher, UI
   config, debug, location, assembly, remote parts, view sync, wizard
   selection, attributes, highlight).
6. **`declareAppReady()`** fires, which triggers `projectService.load()`.

### ApplicationContext shape

`web/app/cad/context/index.ts` composes a single interface from every
bundle's context interface:

```typescript
interface ApplicationContext extends
  LegacyStructureBundleContext,   // services, streams
  ProjectBundleContext,           // projectService
  ActionSystemBundleContext,      // actionService
  CraftBundleContext,             // craftService
  OperationBundleContext,         // operationService
  CadRegistryBundleContext,       // cadRegistry
  SceneBundleContext,             // viewer, cadScene
  WizardBundleContext,            // wizardService
  SketcherBundleContext,          // sketcherService
  SketchStorageBundleContext,     // sketchStorageService
  OCCBundleContext,               // occService, craftEngine
  /* ... ~12 more bundle contexts */
{}
```

### Service attachment patterns

Bundles attach services in one of these patterns:

- **Modern**: `ctx.actionService = {...}; ctx.services.action = ctx.actionService;`
- **Legacy**: `ctx.storageService = {...}; services.storage = ctx.storageService;`
- **Both services + streams**: `ctx.craftService = {...}; ctx.streams.craft = {...};`

Always mirror to `ctx.services.*` for backward compatibility — older code
accesses services through `ctx.services.*` rather than `ctx.*Service`.

## Reactive Stream System (lstream)

`modules/lstream/` is a lightweight reactive stream library. It is the
backbone of state management throughout the app.

### Stream types

| Creator | What it makes | Key methods |
|---|---|---|
| `stream()` | `Emitter` — event stream, no current value | `.next(v)`, `.attach(fn)` |
| `state(initial)` | `StateStream` — holds current value | `.value`, `.next(v)`, `.update(fn)`, `.mutate(fn)`, `.attach(fn)` |
| `externalState(get, set)` | `ExternalStateStream` — bridges external state | `.value` (calls get/set), `.next(v)`, `.attach(fn)` |
| `distinctState(initial)` | `DistinctStateStream` — only emits on change | same as `StateStream` |
| `combine(...streams)` | `CombineStream` — emits array when all inputs have emitted | `.map()`, `.remember()` |
| `merge(...streams)` | `MergeStream` — passes through any input | `.map()` |
| `never()` / `constant(v)` | special streams | — |

### Core semantics

- **`.attach(observer)`** returns a **detacher function**. Always call it on
  dispose to avoid leaks.
- **`StateStream.attach()`** fires immediately with the current value, then
  on every update.
- **`.update(fn)`** replaces the value: `this.value = fn(this.value)`.
- **`.mutate(fn)`** mutates in place: `fn(this.value); this.next(this.value);`
- **`intercept(stream, fn)`** monkey-patches `.next()` to run `fn(value,
  stream, next)` before emission — `next(value)` must be called to proceed.
  Used by `CraftBundle` to make history modifications async (run the
  pipeline before notifying observers).

### Operators (fluent, on all streams)

`.map(fn)`, `.filter(pred)`, `.pairwise(first?)`, `.scan(seed, fn)`,
`.remember(initial)`, `.distinct()`, `.throttle(ms)`, `.pipe(other)`.

### React integration

- **`connect(streamProvider)`** (`modules/ui/connect.js`) — HOC for class
  components. `streamProvider` receives `(streams, ownProps)` and returns a
  stream; the wrapped component re-renders on stream updates.
- **`useStream(getStream)`** (`modules/ui/effects.ts`) — hook for function
  components. `getStream` is a stream or `(ctx) => stream`. Returns current
  value.
- **`useStreamWithUpdater(getStream)`** — returns `[value, updater]`.
- **`useStreamWithPatcher(getStream)`** — returns `[value, patcher]` using
  immer for immutable updates.

## Model Layer (MObjects)

`web/app/cad/model/` — the modelling entities that represent the 3D model.

### EntityKind enum

```typescript
enum EntityKind {
  SHELL, FACE, EDGE, VERTEX, SKETCH_OBJECT, DATUM, DATUM_AXIS, LOOP
}
```

### Class hierarchy

```
MObject (base)
├── MShell          — root BREP container (faces, edges, vertices)
│   └── MBrepShell  — wraps an OCC BREP shell with brepRegistry mapping
├── MOpenFaceShell  — open surface (e.g. a plane for sketching)
├── MFace           — face; has surface, csys, sketchObjects, sketchLoops
│   └── MBrepFace   — wraps a BREP face
├── MEdge           — edge; has brepEdge, adjacentFaces, toDirection()
├── MVertex         — vertex
├── MDatum          — coordinate system datum (csys + X/Y/Z axes)
│   └── MDatumAxis  — single axis within a datum
├── MSketchObject   — sketch primitive reference on a face
└── MLoop           — face boundary loop
    └── MSketchLoop — loop from a sketch contour
```

### ID generation

`MObjectIdGenerator` (`web/app/cad/model/mobject.ts`) generates stable IDs:

- Format: `prefix:counter` (e.g. `S:0`, `D:1`), or `namespace|prefix:counter`
  when inside a pushed context.
- Hierarchical IDs for BREP children: `shellId/F:0`, `shellId/E:0`.
- `reset()` is called on non-additive history changes so rebuilds produce
  stable IDs.
- `pushContext(namespace)` / `popContext()` isolate ID spaces (used by
  operations and part import).

### CadRegistry

`web/app/cad/craft/cadRegistryBundle.ts` indexes all models by ID and
provides lookup:

- `streams.cadRegistry.modelIndex` — `Map<string, MObject>` rebuilt from
  `streams.craft.models` via `model.traverse()`.
- `find(id)`, `findFace(id)`, `findEdge(id)`, `findShell(id)`,
  `findDatum(id)`, `findDatumAxis(id)`, `findSketchObject(id)`,
  `findLoop(id)`, `findEntity(kind, id)`, `getAllShells()`.
- Operations resolve user-selected entity references through these lookups.

## Craft System (Operation History)

The craft system is the heart of the parametric modeler. It maintains a
history of operations, executes them in order, and rebuilds the model from
history on any change.

### Key files

- `web/app/cad/craft/craftBundle.ts` — `CraftService`: history state,
  pipeline execution, `modify()`, `reset()`, `rebuild()`, `historyTravel`.
- `web/app/cad/craft/operationBundle.ts` — `OperationService`: operation
  registry, `registerOperations()`, `get(id)`.
- `web/app/cad/craft/wizard/wizardBundle.ts` — `WizardService`: operation
  param dialogs, preview, param materialization.
- `web/app/cad/craft/e0/` — OCC integration (occService, command interface,
  IO, utils, craftEngine).

### Operation descriptor

Each feature (extrude, box, fillet, etc.) is an `OperationDescriptor`:

```typescript
interface OperationDescriptor<T> {
  id: string;              // e.g. 'EXTRUDE'
  label: string;
  info: string;
  icon: string | object;
  paramsInfo?: (params) => string;   // history tooltip
  schema?: OperationSchema;          // derived from form if absent
  form: FormDefinition;              // UI widget definitions
  run: (params, ctx, rawParams) => OperationResult;  // execution
  previewGeomProvider?: (params) => geometry;        // optional preview
}
```

### Operation result

```typescript
interface OperationResult {
  consumed: MObject[];  // models removed/replaced by this operation
  created: MObject[];   // new models produced
}
```

### Pipeline flow

1. User invokes an action → `wizard.open(operationId)`.
2. Wizard initializes params from schema, shows form.
3. On OK: `craftService.modify({ type, params })` → `addModification()`.
4. `intercept()` on `modifications$` runs `runPipeline()` before notifying
   observers.
5. `runPipeline()` walks history from `beginIndex` to `pointer`, calling
   `runRequest()` for each.
6. Each `runRequest()` materializes params via `materializeParams()`, then
   calls `op.run(params, ctx)`.
7. `consumed` models are removed from the model set; `created` models are
   added with `originatingOperation = i`.
8. `models$.next(sortedArray)` fires, which triggers `CadRegistry` reindex
   and `ViewSync` scene synchronization.

### History travel

`historyTravel` (from `craftBundle`) supports `setPointer`, `begin`, `end`,
`forward`, `backward`. Moving the pointer triggers a rebuild from the
appropriate point. This powers the bottom history timeline.

## OCC Integration (OpenCascade)

`web/app/cad/craft/e0/` bridges the model layer to the OpenCascade WASM
engine.

### OCC service

```typescript
interface OCCService {
  io: OCCIO;               // pushModel, getShell, sketchLoader
  commandInterface: OCI;   // Proxy-based command interface
  utils: OCCUtils;         // sketchToFaces, wiresToFaces, applyBooleanModifier
  engineInterface: any;    // raw WASM engine
}
```

### Command interface (Proxy)

`occCommandInterface.ts` uses a JS `Proxy` to intercept property access.
When you call `oci.box("myBox", "-min", 0, 0, 0, "-size", 10, 10, 10)`:

1. Proxy intercepts `box` property access.
2. MObject arguments are converted to their IDs.
3. Models not yet in OCC are pushed via `engineInterface.io.pushModel()`.
4. Arguments are stringified.
5. Native `CallCommand("box", ["box", ...args])` is invoked.

Available commands are typed in `web/app/cad/craft/e0/OCI.d.ts` (~2500
lines): `box`, `cylinder`, `sphere`, `cone`, `torus`, `prism`, `revol`,
`pipe`, `bcommon`, `bcut`, `bfuse`, `bsection`, `mkplane`, `2dprofile`,
etc.

### Boolean operation flow

`OCCUtils.applyBooleanModifier(tools, booleanDef)`:

1. Push target models to OCC.
2. Clear previous boolean state (`bclearobjects`, `bcleartools`).
3. Add targets (`baddobjects`) and tools (`baddtools`).
4. Configure fuzzy value, simplify, inverted check.
5. `bfillds()` (fill data structure) → `bapibop()` (execute boolean).
6. `getShell("BooleanResult", productionAnalyzer)` retrieves the result as
   an `MShell`.

## Scene And Rendering

### Scene setup

`modules/scene/sceneSetup.ts` (`SceneSetUp`):

- Creates `Scene`, `PerspectiveCamera`, `OrthographicCamera`,
  `WebGLRenderer`, `DirectionalLight`, `AmbientLight`, origin grid.
- Owns `CADTrackballControls` (camera orbit — see
  [maintainer-notes.md](./maintainer-notes.md) "Camera And Orbit Controls").
- `sceneRendered$` stream fires after each render — `ViewCube` and
  `CameraControl` attach to it.
- `requestRender()` sets a flag; the animation loop renders on next frame.

### CadScene

`web/app/cad/scene/cadScene.ts` — scene graph groups:

- `workGroup` — model geometry (shells, datums, open faces).
- `auxGroup` — auxiliary objects (axis arrows, basis CSys).
- `basisGroup` — local coordinate system display.

### Scene views

`web/app/cad/scene/views/` — each `MObject` type has a corresponding `View`
that creates and manages its Three.js representation:

| Model | View | File |
|---|---|---|
| `MShell` / `MBrepShell` | `ShellView` | `shellView.js` |
| `MOpenFaceShell` | `OpenFaceShellView` | `openFaceView.js` |
| `MFace` (sketching) | `SketchingView` | `faceView.js` |
| `MDatum` | `DatumView` | `datumView.js` |
| `MVertex` | `VertexView` | `vertexView.js` |
| `MSketchLoop` | `SketchLoopView` | `sketchLoopView.js` |
| curve-based | `CurveBasedView` | `curveBasedView.js` |

`View` base class (`view.js`): mark/withdraw (selection/highlight colors),
dispose, traverse, addDisposer. `MarkTracker` is a mixin for child mark
tracking.

### View sync

`web/app/cad/scene/viewSyncBundle.js` — `sceneSynchronizer()` runs on every
`cadRegistry.update`:

1. Removes Three.js objects for models no longer in the registry.
2. Creates new `View` instances for new models (dispatches by type).
3. Attaches highlight/selection event listeners.
4. Requests a render.

## Sketcher Subsystem

### Standalone sketcher

`web/app/sketcher/` — a self-contained 2D CAD app:

- `components/SketcherApp.jsx` — main React component.
- `viewer2d.ts` — 2D canvas viewer with layers (ground, sketch, dimensions,
  annotations, labels).
- `shapes/` — geometry objects: `EndPoint`, `Segment`, `Arc`, `Circle`,
  `Ellipse`, `EllipticalArc`, `BezierCurve`, `Dimension`, `Label`.
- `tools/` — drawing tools: segment, circle, arc, rectangle, bezier, drag,
  pan.
- `constr/` — constraint solver (see below).
- `generators/` — parametric generators: mirror, boundary, ground.
- `actions/` — constraint actions, object actions, export actions.

### In-place sketcher

`web/app/cad/sketch/` — bridges the 2D sketcher into the 3D CAD:

- `inPlaceSketcher.js` — `enter(face)` switches to orthographic camera,
  creates an overlay canvas, syncs the 2D coordinate system with the face's
  CSys, loads sketch data, switches to the sketcher workbench. `exit()`
  saves and restores 3D state.
- `sketchBoundaries.js` — extracts 2D boundary from 3D face edges (converts
  NURBS to arcs/circles where possible, transforms to sketch CSys).
- `sketchModel.ts` — `SketchPrimitive` base class with `toNurbs()`,
  `toVerb()`, `toOcc()`. Concrete: `Segment`, `Arc`, `BezierCurve`,
  `EllipticalArc`, `Circle`, `Ellipse`.
- `sketcherBundle.ts` — `sketchFace(face)` enters edit mode;
  `updateSketchForFace(mFace)` reloads and reindexes a face's sketch.

### Constraint solver

`web/app/sketcher/constr/` — hybrid algebraic-numeric solver:

1. **Algebraic phase** (`AlgNumSystem.ts`): converts constraints to
   polynomials, performs symbolic elimination, substitutes linear
   relationships, eliminates fully-determined parameters, detects
   conflicts/redundancies.
2. **Numeric phase** (`solver.js`): Dog-leg optimization (primary),
   Levenberg-Marquardt (fallback). Computes Jacobian, solves via QR
   decomposition.

Constraint definitions (`ANConstraints.ts`): `PCoincident`, `TangentLC`,
`PointOnLine`, `PointOnCircle`, `PointOnBezier`, `TangentLineBezier`,
`Parallel`, `Perpendicular`, `Distance`, `Angle`, `Horizontal`,
`Vertical`, etc. Each has `defineParamsScope`, `collectPolynomials`,
`initialGuess`, `constants`.

`ParametricManager` (`parametric.ts`) manages solve stages (past/current/
future), constant resolution (external expressions), and solver refresh.

### Sketch → 3D integration

1. **Face → Sketch**: `sketchFace(face)` extracts face boundaries as 2D
   geometry in the face's CSys.
2. **Sketch → Face**: `occ.utils.sketchToFaces(sketch, csys)` converts
   sketch contours to OCC wires (`occSketchLoader.ts`), then to faces
   (`wiresToFaces` via `mkplane`).
3. **Storage**: sketches are stored by face ID via
   `sketchStorageService.setSketchData(faceId, json)`.
4. **Reevaluation**: when expressions change, all sketches are reevaluated
   with new constant values and faces are reindexed.

## Actions, Wizard, And UI

### Action system

`web/app/cad/actions/actionSystemBundle.ts`:

- `actionService.registerAction(def)` / `registerActions(defs[])`.
- Each action: `{ id, appearance, invoke, listens?, update? }`.
- `appearance` stream holds `{ label, info, icon }`.
- `state` stream holds `{ enabled, visible, hint }`.
- `listens` returns a stream; `update` mutates state when it fires.
- `run(id)` checks enabled state and calls `invoke(ctx, data)`.

Core/global actions: `web/app/cad/actions/coreActions.js` (save, export,
camera toggle, orbit toggle, theme toggle, info, etc.).
Usability actions: `web/app/cad/actions/usabilityActions.js` (undo, redo,
view modes).
History actions: `web/app/cad/actions/historyActions.js`.

### Wizard system

`web/app/cad/craft/wizard/wizardBundle.ts`:

- `wizard.open(operationId, overrides?)` → initializes params from schema,
  shows the operation form.
- `workingRequest$` — derived from `insertOperation$` + `modifications$`;
  tracks the current operation being created or edited.
- `materializedWorkingRequest$` — materializes params (resolves entity
  references, validates) for preview.
- `updateParams(mutator)` — updates params via immer, triggers preview.
- `wizard.ok()` → `craftService.modify(request)`.
- `wizard.cancel()` → discards.

### UI layout

`web/app/cad/dom/components/View3d.jsx` composes the main viewport:

- `#viewer-container` — Three.js mount point.
- `HeadsUpToolbar` — top ribbon (workbench toolbar + quick actions).
- `HeadsUpHelper` — contextual helper prompt.
- `ViewCube` — top-right orientation cube.
- `FloatView` — floating panels (model, history, expressions, selection).
- `WizardManager` — operation dialogs.
- `BottomStack` — `CameraControl`, `HistoryTimeline`, `PlugableControlBar`.
- `SketcherMode` / `InplaceSketcher` — sketcher overlays (active only in
  sketch mode).

### Toolbars and control bars

- **Top ribbon** (`streams.ui.toolbars.headsUp`) — set by the active
  workbench's `ui.toolbar` list. Action refs: `'ActionId'`, `'-'` (splitter),
  `'|'` (breaker), `['ActionId', overrides]` (per-entry overrides), nested
  arrays (grouped buttons).
- **Bottom control bars** (`streams.ui.controlBars.left` / `.right`) — set
  in `uiConfigBundle.js`. Left: menus (file, craft, boolean, primitives,
  views, view modes, donate, GitHub). Right: info, refresh sketches, show
  sketches, deselect, orbit toggle, camera toggle.
- `PlugableToolbar.jsx` renders the top ribbon; `PlugableControlBar.jsx`
  renders the bottom bars. Both are generic — they only render action refs,
  never hard-code specific commands.

## Workbenches

`modules/workbenches/` — workbench registration:

- `registry.ts` — `WorkbenchRegistry` array of all workbench configs.
- `modeler/index.ts` — default workbench: features (extrude, cut, revolve,
  loft, shell, fillet, boolean, primitives, patterns, etc.), actions (get
  info, export BREP), UI toolbar config.
- Each feature lives in `features/<name>/` with: operation file, optional
  icon, `docs/index.md`.
- `workbenchService.ts` — `registerWorkbench(config)` registers operations
  + actions, `switchWorkbench(id)` swaps the active toolbar.
- `workbenchesLoaderBundle.ts` — registers core operations (plane, datum
  create/move/rotate) then all workbench configs, then switches to default.

## Project And Storage

### Project service

`web/app/cad/projectBundle.ts`:

- `projectService.load()` — loads saved project from localStorage; if none
  exists, seeds `DEFAULT_PROJECT_HISTORY` (origin datum + 3 base planes).
- `projectService.save()` — serializes `{ history, expressions, assembly,
  workbench }` to localStorage.
- `projectService.empty()` — loads truly empty history (used by import
  flow).
- `loadData(data)` — calls `craftService.reset(data.history)`, loads
  expressions and assembly constraints.

### Storage service

`web/app/cad/storage/storageBundle.ts` — localStorage wrapper with
`set/get/exists/getAllKeysFromNamespace`. Keys are prefixed with
`TCAD.projects.`.

### Sketch storage

`web/app/cad/sketch/sketchStorageBundle.ts` — stores sketches by face ID
within a project namespace. Format: `SketchFormat_V3` (objects, dimensions,
labels, stages, constants, metadata, boundary).

## Expressions

`web/app/cad/expressions/` — named parameter/dimension system:

- `expressionService.script$` — the expression script text.
- `expressionService.evaluateExpression(name)` — resolves a named value.
- Sketch constraints can reference expression variables for parametric
  modeling.
- When expressions change, sketches are reevaluated and the model rebuilds.

## How It All Interlinks

A typical user action (e.g. "extrude a sketch") flows through the system
like this:

1. **User clicks Extrude** in the top ribbon → `actionService.run('EXTRUDE')`.
2. **Action invokes** `wizard.open('EXTRUDE')` → `WizardBundle` initializes
   params from the extrude operation's schema.
3. **Wizard form renders** — user selects a face, enters length. Param
   updates flow through `updateParams()` → `workingRequest$` →
   `materializedWorkingRequest$` → preview geometry.
4. **User clicks OK** → `wizard.ok()` → `craftService.modify({ type:
   'EXTRUDE', params })`.
5. **`intercept` on `modifications$`** runs `runPipeline()` before
   notifying observers.
6. **`runRequest()`** materializes params (resolves the face ID to an
   `MFace` via `cadRegistry.findFace()`), then calls
   `ExtrudeOperation.run(params, ctx)`.
7. **Operation executes**: reads sketch from `sketchStorageService`,
   converts to OCC faces via `occ.utils.sketchToFaces()`, calls
   `oci.prism()` to extrude, retrieves result via `occ.io.getShell()`,
   applies boolean modifier.
8. **Operation returns** `{ consumed: [oldShell], created: [newShell] }`.
9. **Pipeline** removes consumed models, adds created models to the model
   set, fires `models$.next()`.
10. **`CadRegistry`** reindexes all models by ID (`modelIndex$` updates).
11. **`ViewSync`** (`sceneSynchronizer`) removes old Three.js objects,
    creates a new `ShellView` for the new shell, requests a render.
12. **Three.js renders** the updated scene.
13. **History timeline** updates (it subscribes to `modifications$`).
14. **`projectService.save()`** persists the new history to localStorage.

This same flow — action → wizard → craft pipeline → operation → OCC →
models → registry → view sync → render — is the central interlink of the
entire system. Every feature (box, fillet, boolean, pattern, etc.) follows
it; only the operation descriptor and OCC commands differ.
