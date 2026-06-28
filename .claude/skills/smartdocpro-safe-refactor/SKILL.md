---
name: smartdocpro-safe-refactor
description: Use this skill whenever working on SmartDocPro's refactor from the legacy AppLegacy.jsx monolith to feature-based components — extracting a component, fixing props after a file split, touching anything in components/_wip/, adding new state/variables to AppLegacy.jsx or utils/helpers.jsx, deciding whether an ESLint error is real, or about to declare a change "done." This codebase has a specific, repeatable bug pattern from past extractions (missing props causing ReferenceError, duplicate `var` declarations silently overwriting state) — always consult this skill before touching AppLegacy.jsx or its extracted components, and before merging any refactor branch.
---

# SmartDocPro — Safe Refactor Skill

## Context you need before touching this codebase

`src/features/document-export/AppLegacy.jsx` is the surviving core of an ~11,000-line
monolith (`AppLegacy_original.jsx`, no longer in the repo) that is being incrementally
split into smaller components under `src/features/document-export/components/`. The
split is **partial and ongoing** — AppLegacy.jsx still owns most state, handlers, and
`useState`/`useEffect` calls. Extracted components receive everything via props; they do
not manage their own state for anything that used to live in AppLegacy.jsx's closure.

`src/shared/` holds anything genuinely cross-feature (layout, the Zustand store). Future
features (e.g. a planned `qlda` feature) will sit alongside `document-export` and must
not import from it directly — shared logic goes in `shared/`.

## The #1 recurring bug: dropped props after extraction

When a chunk of JSX is pulled out of `AppLegacy.jsx` into its own file, every variable or
function that JSX used via closure (no declaration needed inside the monolith) has to be
explicitly threaded through as a prop. It is **very easy to forget one** — this has
caused real `ReferenceError` crashes multiple times in this project (e.g. `saveAs`,
`setActiveMainTab`, `showToast`, `SDE_UID` going missing across different components).

**Before considering ANY extraction or prop-related fix done:**

1. List every identifier the new/changed component references that it does not declare
   itself.
2. Confirm each one is in the component's destructured prop list.
3. Confirm each one is passed as `prop={value}` at every place the component is rendered
   in `AppLegacy.jsx` (there can be more than one call site).
4. Run `npm run lint` and confirm **zero** `no-undef` errors. This rule reliably catches
   this entire bug class in components that destructure named props — treat any
   `no-undef` as a real bug, not noise.

### Exception: components that take a generic `(props)` parameter

A few legacy-era components (notably `WorkspaceTab.jsx` in `components/_wip/tabs/`) take
a single `(props)` argument and access `props.xxx` inline, instead of destructuring named
props. **`no-undef` will NOT catch a missing or mistyped prop here** — `props.typo` just
silently evaluates to `undefined`, no error, no warning. For any component shaped this
way:

- Manually grep every `props\.` usage in the file and build an explicit map back to the
  real variable name in `AppLegacy.jsx` before wiring it in.
- Do not trust a clean build/lint as proof of correctness — it isn't, for this shape of
  component. Hand-testing every affected UI path is mandatory.
- Wire it in behind `React.lazy` + `Suspense`, and comment out (don't delete) the old
  inline JSX it replaces until it's been manually verified across all its features for at
  least a few real sessions.

## Other known gotchas in this codebase

- **`var` redeclaration**: large legacy functions in `AppLegacy.jsx` / `utils/helpers.jsx`
  use `var` heavily. `var` is function-scoped and silently allows two declarations of the
  same name to coexist — this has caused a real bug before (two `currentProjectId`
  states, one of them dead and silently never read). Before adding any new `var` inside
  an existing large function, grep that function for the name first.
- **Empty `catch (e) {}` blocks**: don't add one. Always `console.warn("description:", e)`
  at minimum — several pre-existing empty catches were swallowing real errors silently.
- **External doc-processing libraries** (`jszip`, `pizzip`, `xlsx`, `file-saver`,
  `docx-preview`, `mammoth`, `html-docx-js`, `pako`) are loaded as `window.X` globals via
  `<script defer>` tags in `index.html`, not as npm imports. Any reference to one of these
  globals must live inside an event handler, async function, or `useEffect` — never at
  component-body top level — or deferred loading will break it.

## `components/_wip/` is not dead code

Files in `components/_wip/` (currently: layout, tabs, modals subfolders) are unfinished
extraction work, not leftover junk, even though nothing imports them yet. Before deleting
or rewriting one:

- Confirm with `grep -rn "ComponentName" src/` that it's genuinely unreferenced.
- Compare it against the equivalent still-inline JSX block in `AppLegacy.jsx` (search for
  distinctive label/field text from the `_wip` file) to find the line range it would
  replace, and check whether `AppLegacy.jsx`'s inline version has evolved since the `_wip`
  file was written — they can drift out of sync.
- Never delete a `_wip` file or wire it in without flagging the plan first — these
  decisions need human sign-off, not autonomous action.

## ESLint noise vs. real bugs

This project uses `eslint-plugin-react-hooks`'s "React Compiler readiness" rule set
(setState-in-effect, use-before-declared, impure-function-in-render). **The project does
not use React Compiler** (no `babel-plugin-react-compiler` in `package.json`) — these are
forward-looking advisories with no runtime effect today. Do not spend time "fixing" them
unless explicitly asked to. The rules that DO indicate real bugs in this codebase:
`no-undef` and `no-redeclare` — always treat those as real.

## Verification ritual — do this before saying a task is done

1. `npm run build` — must be 0 errors.
2. `npm run lint` — `no-undef` and `no-redeclare` counts must not increase from baseline.
3. Hand-test in the browser (`npm run dev`), not just build/lint, for anything touching
   AppLegacy.jsx or its extracted components — this is where prop-shape bugs and
   `Suspense`/lazy-load issues actually surface. Specifically exercise: Word export, Excel
   export, and any modal/tab the change could plausibly affect.
4. For risky/large changes (full-section rewires like `WorkspaceTab`), work on a dedicated
   git branch, keep the replaced code commented out rather than deleted until verified
   over real usage, and don't merge to `main` without explicit sign-off.

## Quick checklist for "I'm about to extract/wire in a component"

- [ ] Grepped every external identifier the component needs
- [ ] All present in destructured props (or mapped manually if it's a `(props)`-style file)
- [ ] All passed at every render call site in `AppLegacy.jsx`
- [ ] `npm run build` clean
- [ ] `npm run lint` — no new `no-undef`/`no-redeclare`
- [ ] Hand-tested the actual feature in the browser
- [ ] If risky/large: on its own branch, old code commented not deleted, sign-off pending
