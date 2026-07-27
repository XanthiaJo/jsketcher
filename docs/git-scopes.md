# Git Scopes

Use these scopes with the Structured Chaos Conventional Commit rules. Scopes are not enforced, but using the same names keeps changelogs readable.

## Common Scopes

| Scope | Use for |
|---|---|
| `actions` | Action definitions, action registration, action invocation behavior |
| `build` | Webpack, Babel, TypeScript config, package scripts, generated build wiring |
| `cad` | Broad CAD application behavior when no narrower scope fits |
| `craft` | Feature history, operations, wizards, production/craft services |
| `docs` | README, maintainer notes, guides, feature docs |
| `icons` | Icon choices, icon declarations, icon rendering helpers |
| `model` | CAD model entities, topology-facing model classes, entity behavior |
| `ribbon` | Top toolbar/ribbon composition and workbench toolbar config |
| `scene` | Three.js scene setup, viewer, view cube, camera, highlighting, rendered object views |
| `sketcher` | Standalone sketcher and in-place sketcher tools, constraints, shape UI |
| `storage` | Browser project persistence, import/export persistence format |
| `theme` | Theme tokens, light/dark switching, CSS variable theme wiring |
| `ui` | Shared UI components, panels, layout, CSS modules not specific to the ribbon |
| `workbench` | Workbench registration, switching, feature/action catalogues |
| `tests` | Test files and validation helpers |

## Commit Type Guidance

- Use `feat` for user-visible capability changes, such as adding a view cube or plane highlight grid.
- Use `fix` for broken behavior, regressions, persistence bugs, blank screens, or build failures.
- Use `docs` for documentation-only changes.
- Use `refactor` for code movement or cleanup with no behavior change.
- Use `test` for adding or changing tests.
- Use `chore` for dependency, package, or repository maintenance.
- Use `ui` for visual/layout/icon changes without behavior changes.

## Examples

```text
feat(scene): add orientation view cube
feat(theme): restore persisted light and dark themes
ui(ribbon): replace modeler toolbar icons with lucide icons
docs(docs): add maintainer notes and git scopes
test(theme): add theme variable coverage
chore(build): add lucide icon dependency
```
