First off, you're awesome. Thanks for wanting to help contribute to JSketcher!

This is a personal project that I'm working on for fun, so the codebase will change frequently as I experiment with different approaches. That said, contributions are welcome if you want to help improve the UI, workflow, or fix bugs.

## Guidelines

To keep things manageable, please follow these guidelines:

### Git Workflow

1. **Conventional Commits** — All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat(cad): add extrusion preview`, `fix(ui): correct ribbon icon alignment`). See the git rules in the project docs for the full format and version bump rules.
2. **Scope your changes** — Use appropriate scopes for your commits (e.g., `cad`, `ui`, `docs`, `build`). See the project's AGENTS.md for common scopes used in this repo.
3. **Merge commits are fine** — No need to rebase everything. Merge commits are acceptable.

### Code Style

1. **Indent is always 2 spaces** — Consistent with the existing codebase.
2. **No unnecessary formatting** — Only format the neighborhood of your actual change. Don't reformat entire files unless that's the specific change you're making.
3. **No underscore prefix on private members** — Use `private mouseDown` instead of `private _mouseDown` unless you have a public getter that collides with the field name.

### Quality Checks

1. **Run linting** — Execute `npm run before-main-branch-merge` to statically check and lint the code before submitting.
2. **Test your changes** — Make sure your changes work as expected and don't break existing functionality.

### What to Expect

- I'll do my best to review and merge contributions that align with the project direction.
- Feature requests may not align with my priorities since I'm building this for myself.
- Breaking changes are common as I experiment with different approaches.
- Documentation may lag behind implementation.

If you're unsure about something, feel free to open an issue to discuss it before diving in. Thanks again for contributing!