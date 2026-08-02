# Feature Preservation Checklist

Use this file to track core JSketcher features that should remain available while the fork evolves its own theme, ribbon, and layout. Treat unchecked or warning-marked items as regression risks to verify before committing UI changes.

## CAD Shell And Layout

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| Main CAD viewport | Keep | `web/app/cad/dom/components/View3d.jsx` | `#viewer-container` is the Three.js mount point. Do not cover it permanently with UI chrome. |
| Top heads-up ribbon | Keep | `web/app/cad/dom/components/HeadsUpToolbar.jsx`, `modules/workbenches/modeler/index.ts` | Workbench toolbar actions render here. Icon/style changes are fine; action ids should stay intact. |
| Quick actions in top ribbon | Keep | `web/app/cad/workbench/uiConfigBundle.js` | Includes save, STL export, theme toggle, and workbench menu. |
| Theme toggle | Keep | `web/app/cad/actions/coreActions.js`, `web/app/cad/dom/components/WebApplication.jsx` | Must persist with `localStorage` key `jsketcher.theme`. |
| Floating panel host | Keep | `web/app/cad/dom/components/FloatView.jsx` | Required for model, history, expressions, and selection panels. |
| Selected modification popover | Keep | `web/app/cad/craft/ui/SelectedModificationInfo.jsx` | Shows operation-specific info and edit/remove controls. |
| View cube | Keep | `web/app/cad/dom/components/ViewCube.tsx` | Should remain synced with camera and positioned below wrapping ribbon. |
| Origin/floor grid | Keep | `modules/scene/sceneSetup.ts` | Persistent floor grid at the origin plane. |
| Default origin datum | Keep | `web/app/cad/craft/craftBundle.ts`, `web/app/cad/model/mdatum.ts` | A single implicit datum exists at the origin with fixed id `D:ORIGIN`. Manual datum creation is still available for advanced modelling. |

## History And Craft

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| Parametric feature history model | Keep | `web/app/cad/craft/craftBundle.ts`, `web/app/cad/craft/wizard/wizardBundle.ts` | Core CAD behavior. Operations must remain rebuildable and editable. |
| Bottom history timeline toolbar | Keep | `web/app/cad/craft/ui/HistoryTimeline.jsx`, `web/app/cad/craft/ui/HistoryTimeline.less` | This is the toolbar with rebuild, step backward, step forward, fast forward, operation items, and add button. It is mounted through `BottomStack` in `View3d.jsx`. |
| History floating panel | Keep | `web/app/cad/craft/ui/OperationHistory.jsx`, `web/app/cad/workbench/uiConfigBundle.js` | Registered as float view id `history` with title `Modifications`. This is separate from the bottom timeline. |
| Operation insert/edit wizard | Keep | `web/app/cad/craft/wizard/components/WizardManager.tsx` | Drives feature creation and history editing flows. |
| Operation parameters/info | Keep | `docs/index.md`, operation `paramsInfo` definitions | Used in history UI and feature docs. |
| Rebuild and history travel controls | Keep | `web/app/cad/craft/ui/HistoryTimeline.jsx` | Required for moving through model history and returning to end-of-history. |

## Modeler Workbench

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| Standard views | Keep | `modules/workbenches/modeler/index.ts` | Front, top, right, and three-way views. |
| View modes | Keep | `modules/workbenches/modeler/index.ts` | Wireframe, shaded, shaded with edges. |
| Look at face | Keep | `modules/workbenches/modeler/index.ts` | Camera/view utility. |
| Datum and reference plane creation | Keep | `modules/workbenches/modeler/index.ts` | The fork starts with one origin datum, but still exposes manual datum and plane creation in the ribbon. |
| Sketch on face | Keep | `modules/workbenches/modeler/index.ts`, `web/app/cad/sketch` | Opens in-place sketching flow. |
| Extrude and cut | Keep | `modules/workbenches/modeler/features/extrude` | Primary solid modelling operations. |
| Revolve, loft, sweep | Keep | `modules/workbenches/modeler/features/revolve`, `features/loft`, `features/sweep` | Core feature operations. |
| Boolean operations | Keep | `modules/workbenches/modeler/features/boolean` | Boolean, union, subtract, intersect. |
| Shell, fillet, scale body | Keep | `modules/workbenches/modeler/features/shell`, `features/fillet`, `features/scaleBody` | Editing operations. |
| Mirror and patterns | Keep | `modules/workbenches/modeler/features/mirrorBody`, `features/patternLinear`, `features/patternRadial` | Body duplication tools. |
| Move body | Keep | `modules/workbenches/modeler/features/moveBody` | Body transform operation. |
| Primitive solids | Keep | `modules/workbenches/modeler/features/primitiveBox`, `primitiveCone`, `primitiveCylinder`, `primitiveSphere`, `primitiveTorus` | Box, cone, cylinder, sphere, torus. |
| Hole tool | Keep | `modules/workbenches/modeler/features/hole` | Manufacturing-style cut feature. |
| Import/delete body | Keep | `modules/workbenches/modeler/features/importModel`, `features/deleteBody` | File and cleanup operations. |
| Defeature remove face | Keep | `modules/workbenches/modeler/features/defeatureRemoveFace` | Direct geometry simplification. |
| Wire line | Keep | `modules/workbenches/modeler/features/wireLine` | Wire construction tool. |
| Export BREP | Keep | `modules/workbenches/modeler/actions/exportBREP` | CAD export action. |
| Get info | Keep | `modules/workbenches/modeler/actions/getInfo` | Inspection action. |

## Sketching

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| In-place sketcher | Keep | `web/app/cad/sketch/components/InplaceSketcher`, `web/app/cad/sketch/components/SketcherMode` | Embedded sketching inside CAD viewport. |
| Standalone sketcher app | Keep | `web/app/sketcher.js`, `web/app/sketcher/components/SketcherApp.jsx` | Separate sketcher entry point. |
| Sketcher top toolbar | Keep | `web/app/sketcher/uiConfig.js`, `web/app/sketcher/components/SketcherToolbar.jsx` | Common tools, object tools, measurements, export. |
| Sketcher right constraint toolbar | Keep | `web/app/sketcher/uiConfig.js` | Constraint global actions. |
| Contextual sketch controls | Keep | `web/app/sketcher/components/ContextualControls.jsx` | Selection-specific tools. |
| Constraint explorer/editor | Keep | `web/app/sketcher/components/ConstraintExplorer`, `web/app/sketcher/components/ConstraintEditor` | Constraint management UI. |
| Sketch object explorer | Keep | `web/app/sketcher/components/SketchObjectExplorer` | Lists sketch geometry. |
| Sketch history undo/redo | Keep | `web/app/sketcher/history.js` | Standalone sketcher edit history. |
| SVG/DXF export | Keep | `web/app/sketcher/actions/exportActions`, `web/app/sketcher/components/ExportDialog.jsx` | Sketch export features. |

## Panels And Inspectors

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| Model explorer | Keep | `web/app/cad/dom/components/Explorer` | Registered as float view id `project`. |
| Scene inline object explorer | Keep | `web/app/cad/craft/ui/SceneInlineObjectExplorer` | Overlay model tree when not sketching. |
| Expressions panel | Keep | `web/app/cad/expressions/Expressions`, `web/app/cad/workbench/uiConfigBundle.js` | Registered as float view id `expressions`. |
| Selection panel | Keep | `web/app/cad/dom/components/SelectionView`, `web/app/cad/workbench/uiConfigBundle.js` | Registered as float view id `selection`. |
| Toast notifications | Keep | `web/app/cad/dom/components/View3d.jsx` | `ToastContainer` is mounted in the CAD shell. |

## Storage And Import/Export

| Feature | Status | Primary code | Notes |
|---|---|---|---|
| Save project | Keep | `web/app/cad/actions/coreActions.js`, `web/app/cad/workbench/uiConfigBundle.js` | Quick action in the top ribbon. |
| STL export | Keep | `web/app/cad/actions/coreActions.js`, `web/app/cad/workbench/uiConfigBundle.js` | Quick action in the top ribbon. |
| BREP export | Keep | `modules/workbenches/modeler/actions/exportBREP` | Workbench action. |
| Model import | Keep | `modules/workbenches/modeler/features/importModel` | Workbench feature. |

## Regression Checks Before UI Commits

- Load CAD app and confirm the top ribbon is visible and wraps without covering the view cube.
- Confirm the theme toggle is visible in quick actions and persists after reload.
- Confirm the bottom history timeline toolbar is visible.
- Create at least one operation and confirm it appears in both the bottom timeline and the history float panel.
- Step backward and forward through history, then return to end-of-history.
- Open model, history, expressions, and selection float panels.
- Start a sketch from a plane or face and confirm sketch toolbars/constraint UI still appear.
- Toggle wireframe, shaded, and shaded-with-edges view modes.
- Use the view cube and standard-view actions to confirm camera controls remain synced.
- Verify save/export actions still appear in the UI.
