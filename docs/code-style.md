# Code Style Baselines

This document defines the conventions for writing code in JSketcher. The
goal is consistency: when every function, class, and module follows the
same patterns, the codebase is easier to read, easier to search, and less
likely to accumulate subtle bugs.

For fork-specific style rules (no underscore prefix, shared shell
constraints), see [AGENTS.md](../AGENTS.md). For practical maintainer
conventions, see [maintainer-notes.md](./maintainer-notes.md).

## Formatting

Enforced by `.editorconfig`:

- 2-space indentation, no tabs.
- 120-column target line length.
- UTF-8 charset, LF line endings.
- No final newline (per `.editorconfig`).

## Language Mix

The repo is mixed JS/JSX/TS/TSX. `tsconfig.json` has `allowJs: true`.

- Use TypeScript for new files in `web/app/cad/` and `modules/` where
  neighboring files are already TypeScript.
- Use JSX/TSX for React components, matching the neighboring files.
- Path aliases resolve from `modules`, `web/app`, and `node_modules`.
  Prefer existing aliases (`cad/...`, `scene/...`, `ui/...`,
  `workbenches/...`) over deep relative imports when nearby code already
  uses them.
- React is currently React 16. Do not introduce React 18-only APIs (no
  `useSyncExternalStore`, no concurrent features, no automatic batching
  assumptions).
- Existing class components are common. Do not rewrite to hooks unless the
  change needs it.

## Variable Declarations

- No `var`. Use `const` or `let`.
- Prefer `const` wherever possible.
- Declare at the point of first use, not at the top of the function,
  unless the declaration is genuinely shared.

```ts
// good
const face = params.face;
const dir = params.direction || face.normal();

// bad
var face = params.face;
let dir;
if (params.direction) {
  dir = params.direction;
} else {
  dir = face.normal();
}
```

## Naming

- **Classes**: PascalCase — `MShell`, `ShellView`, `CadScene`.
- **Interfaces / types**: PascalCase — `ApplicationContext`,
  `OperationDescriptor`.
- **Enums**: PascalCase with PascalCase members — `EntityKind.FACE`,
  `ViewMode.SHADED`.
- **Functions / methods**: camelCase — `findFace`, `sketchToFaces`,
  `applyBooleanModifier`.
- **Constants (module-level)**: UPPER_SNAKE_CASE — `ORTHOGRAPHIC_CAMERA_FACTOR`,
  `DEFAULT_PROJECT_HISTORY`.
- **Streams**: suffix with `$` — `models$`, `modifications$`,
  `sceneRendered$`. This is a universal convention in this codebase.
- **Private members**: no underscore prefix. See [AGENTS.md](../AGENTS.md).
  Only use `_` when a public getter collides with the backing field name.

```ts
// good
private mouseDown = false;
private handleClick(e: MouseEvent): void { ... }

// bad
private _mouseDown = false;
private _handleClick(e: MouseEvent): void { ... }

// ok — getter forces the underscore
private _selected: boolean = false;
get selected(): boolean { return this._selected; }
```

## Functions

### Size and responsibility

- Keep functions short and focused. A function should do one thing.
- If a function exceeds ~40 lines, consider extracting helpers — but only
  if the extracted pieces are genuinely reusable or independently
  testable. Don't split for the sake of splitting.
- Prefer pure functions for logic that doesn't need `ctx` or DOM access.
  Put them in `modules/` or a `utils/` file, not in React components.

### Parameters

- Destructure params objects when the function receives an operation
  params object or a config object:
  ```ts
  function paramsToPlane({ orientation, datum, depth }) { ... }
  ```
- For service/context-heavy functions, pass `ctx: ApplicationContext` as
  the second argument after params:
  ```ts
  run: (params: ExtrudeParams, ctx: ApplicationContext) => { ... }
  ```
- Avoid boolean flag parameters that change function behavior
  fundamentally. If you need two behaviors, write two functions.

### Return values

- Operation `run` functions must return `{ consumed: MObject[], created:
  MObject[] }`. This is non-negotiable — the pipeline depends on it.
- Prefer returning explicit objects over `undefined`/`null` for
  "not found" cases when the caller expects an object. Use `null` only
  when the type signature explicitly allows it.
- Async functions should return `Promise<T>`. If a `run` function is
  sync, return the plain object — the pipeline handles both via
  `result.then ? result : Promise.resolve(result)`.

### Error handling

- Handle errors at the right boundary. Don't wrap every line in
  try/catch.
- Operation failures should throw `CadError` with a `userMessage` so the
  wizard can display it:
  ```ts
  throw new CadError({
    kind: CadError.KIND.INVALID_PARAMS,
    userMessage: 'selected face has no sketch'
  });
  ```
- Top-level async flows (pipeline, project load) catch and log. Inner
  functions should let errors propagate.
- Never swallow errors silently. If you catch and ignore, add a comment
  explaining why (e.g. "storage may be unavailable; fall back to
  default").

### Arrow vs declared functions

- Use arrow functions for callbacks and short one-liners.
- Use `function` declarations for top-level module functions and class
  methods.
- Use arrow functions for class properties when you need `this` binding
  (common in React class components and services):
  ```ts
  requestRender = () => { this.sceneSetup.requestRender(); };
  ```

## Classes

### Structure

Order members logically:

1. Static properties and type constants (`static TYPE = EntityKind.SHELL`)
2. Instance properties
3. Constructor
4. Getters
5. Methods
6. Static methods

### Disposal

Classes that own resources (Three.js geometry, stream attachments, event
listeners) must implement a `dispose()` method and call all disposers.
Use the `createFunctionList` pattern from `gems/func`:

```ts
import {createFunctionList} from 'gems/func';

class MyView extends View {
  disposers = createFunctionList();

  constructor(ctx, model) {
    super(ctx, model);
    this.addDisposer(someStream.attach(() => this.update()));
  }

  dispose() {
    this.disposers.call();
    super.dispose();
  }
}
```

Always call `super.dispose()` if the parent has disposal logic.

## Streams (lstream)

### When to use which type

- `state(initial)` — most state. Holds a value, emits on change.
- `externalState(get, set)` — bridging external state (localStorage,
  Three.js camera mode) into the stream system.
- `stream()` — pure event streams (no current value needed), e.g.
  `highlightEvents`, `update$`.
- `distinctState(initial)` — when equality checks prevent redundant
  updates (rare; default `state` is usually fine).

### Conventions

- Always suffix stream variable names with `$`.
- `.attach()` returns a detacher — always capture it and call it on
  dispose. Use `addDisposer()` in views, `useEffect` cleanup in hooks.
- `StateStream.attach()` fires immediately with the current value. If
  you only want future updates, track that in your observer or use
  `.pairwise()`.
- Use `.mutate()` for in-place object/array updates; use `.update()` for
  replacement. Don't call `.next(this.value)` manually — use `.mutate()`.
- Use `intercept()` (from `lstream/intercept`) when you need to run
  async logic before observers are notified (e.g. the craft pipeline).
  Always call `next(value)` to proceed, or the stream stalls.

### React integration

- In function components: `useStream(ctx => ctx.streams.some.state)`.
- In class components: `connect(streams => streams.some.state)(Component)`.
- Don't call `.attach()` directly in render — use the hooks/HOC so
  cleanup is automatic.

## Operations (Feature Commands)

### Structure

Every operation is an `OperationDescriptor` exported from its feature
folder. Follow the template in [index.md](./index.md) and the existing
operations in `modules/workbenches/modeler/features/`.

### Rules

- **`id`** must be unique and uppercase: `EXTRUDE`, `PRIMITIVE_BOX`,
  `DATUM_CREATE`.
- **`run`** must return `{ consumed, created }`. Even if nothing is
  consumed, return `{ consumed: [], created: [...] }`.
- **`schema`** is derived from `form` if not provided explicitly. Prefer
  using `form` (declarative UI) over hand-writing `schema`.
- **Entity references** in params are stored as string IDs and
  materialized to `MObject` instances via `materializeParams()`. Don't
  store MObject instances in history — they won't survive serialization.
- **`paramsInfo`** should be concise: `({length}) => \`(${r(length)})\``.
  Used in history tooltips.
- **Preview** via `previewGeomProvider` should be lightweight — it runs
  on every param change.
- **OCC calls** go through `ctx.occService.commandInterface` (aliased as
  `oci` in most operations). Don't call the WASM engine directly.
- **Boolean modifier**: use `occ.utils.applyBooleanModifier(tools,
  params.boolean)` instead of manual `bcommon`/`bcut`/`bfuse` calls.

### OCC command interface

```ts
const occ = ctx.occService;
const oci = occ.commandInterface;

// create a box
oci.box("myBox", "-min", 0, 0, 0, "-size", w, h, d);

// extrude a face
oci.prism("result", faceName, ...extrusionVector);

// boolean
occ.utils.applyBooleanModifier(tools, params.boolean);
```

The Proxy auto-converts `MObject` arguments to their IDs and pushes
models to OCC if not already there. Don't manually stringify or push.

## Actions

### Structure

```ts
{
  id: 'MyAction',
  appearance: {
    icon: footerIcon(SomeLucideIcon),
    label: 'my action',
    info: 'tooltip text',
  },
  // optional: state/enablement driven by a stream
  listens: ctx => ctx.streams.selection.face,
  update: (state, data, ctx) => {
    state.enabled = data.single !== null;
  },
  invoke: ctx => {
    // do the thing
  }
}
```

### Rules

- **`id`** must be unique. Core actions are uppercase
  (`TOGGLE_CAMERA_MODE`); workbench actions match the operation id.
- **`appearance.icon`** uses `footerIcon(Icon)` for footer icons or
  `ribbonIcon(id)` for ribbon icons. Use `lucide-react` icons.
- **`invoke`** should be thin — delegate to services. Don't put business
  logic in actions.
- **`listens` + `update`** for conditional enablement/visibility. The
  `update` function mutates the state object in place.
- Toolbar/menu entries reference action ids, not function calls.

## Scene Views

### Rules

- One view class per model type, extending `View` (or `MarkTracker(View)`).
- The view creates Three.js objects in its constructor and disposes them
  in `dispose()`.
- `model.ext.view = this` is set in the `View` constructor — don't
  override this.
- `mark(type)` / `withdraw(type)` control selection/highlight colors.
  `updateVisuals()` applies the current mark color.
- Use `addDisposer()` for stream attachments so they clean up
  automatically.
- Camera math and view changes stay in `viewer`/`sceneSetup`/actions,
  not in views. Views are rendering, not control.

## React Components

### Rules

- Match the style of neighboring files. If they're class components, use
  a class. If they're function components with hooks, use hooks.
- Use `useStream(ctx => ...)` for stream subscriptions in function
  components. Don't call `.attach()` in render.
- Use `connect(streams => ...)` for class components.
- Access the application context via `useContext(ReactApplicationContext)`
  or the `connect` HOC — don't import the singleton `context` object
  directly in components (it breaks testability).
- Keep components presentational. Business logic goes in services,
  actions, or operations.
- CSS modules (`.less` files co-located with components) for component
  styles. Global styles only in `modules/ui/styles/global/`.

## Imports

### Order

1. External packages (`react`, `three`, `lucide-react`, `lodash`)
2. `modules/` imports (`scene/...`, `math/...`, `geom/...`, `lstream/...`)
3. `cad/...` imports (alias for `web/app/cad/...`)
4. Relative imports (`./`, `../`)

### Style

- Use path aliases (`cad/context`, `scene/sceneSetup`, `ui/effects`)
  when the file is in a different top-level directory.
- Use relative imports (`./Foo`, `../utils`) within the same feature
  folder.
- Don't import types and values separately if they come from the same
  module — combine them.

## Comments

- Do NOT add or remove comments unless asked. If you find that you've
  accidentally deleted an existing comment, put it back.
- Comments should explain *why*, not *what*. The code already says what.
- Use `//` for inline comments, `/** */` for JSDoc on public APIs.
- Don't leave commented-out code in the codebase. If it's dead, delete
  it. If you need to preserve it, git history has it.

## Git Conventions

Use Conventional Commits. See [git-scopes.md](./git-scopes.md) for
JSketcher-specific scopes and [the Structured Chaos git
rules](../StructuredChaos/docs/git-rules.md) for the full format.

Quick reference:

```
<type>(<scope>): <description>

<optional body>
```

- `feat` → minor version bump
- `fix` → patch version bump
- `docs`, `refactor`, `test`, `chore`, `ui` → revision only
- `!` or `BREAKING CHANGE:` → major version bump

Common scopes: `actions`, `scene`, `sketcher`, `craft`, `ribbon`, `ui`,
`theme`, `docs`, `build`, `model`, `storage`, `workbench`.

## Validation

Before considering work complete, run:

```bash
node ./node_modules/eslint/bin/eslint.js web/app modules
node ./node_modules/typescript/bin/tsc --noEmit
```

Notes:

- Full TypeScript checking may surface pre-existing errors unrelated to
  your change. Check that your changed files have no errors; don't try to
  fix unrelated pre-existing errors unless asked.
- Do not import from `react-icons/all`. Its star re-exports collide
  across icon sets and trigger Webpack "conflicting star exports"
  warnings. Import each icon from its own set subpath (e.g.
  `react-icons/gr`, `react-icons/bi`) instead.
- For targeted lint checks on specific files:
  ```bash
  node ./node_modules/eslint/bin/eslint.js path/to/file1 path/to/file2
  ```
