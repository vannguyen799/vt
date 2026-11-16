# Vue / Nuxt — critical traps only

Read `typescript.md` too.

- **Auto-imports:** Nuxt auto-imports components, `composables/` and `utils/`. So:
  - Dead-code proof must grep PascalCase and kebab-case component names, plus bare composable and util names in
    templates.
  - Every exported name in `utils/` becomes a global. Don't export generic names (`Point`, `Box`, `Tool`) from new
    util modules. Prefix them or keep them module-private.
  - Tests that load a file outside Nuxt see no auto-imports. Add an explicit import where a test loads the module.
- **Splitting a component:** the parent-facing contract (props, emits, slots, `defineExpose`) must stay identical.
  A child split pays a props/emits tax, so extract **logic into composables first** and template children second.
- **Mount timing changes behaviour:** moving a `v-if` or `onMounted` fetch into a child changes when data loads and
  when state resets. List any such change as a behaviour difference.
- **Visual parity:** don't change classes, layout or styles in a refactor. Verify with before/after screenshots, or
  state that none were taken.
- **Typecheck:** `nuxt typecheck` (vue-tsc). It is heavy, so run it serialised and only once per area.
