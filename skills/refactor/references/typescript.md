# TypeScript / JavaScript — critical traps only

- **Moving a module:** keep the old path as a re-export (`export { a, b } from "./new"`) while code you may not edit
  still imports it. Use `export type` for types under `isolatedModules` / `verbatimModuleSyntax`.
- **Dead-code proof:** grep the bare name, and also dynamic access (`obj[name]`, string keys in route or command
  tables), the `exports` field of `package.json`, and test files. Generated code may import by name.
- **Shared helper signatures:** a helper that returns `Promise<T>` where callers pass it as a handler expecting `void`
  can break UI typings. Keep return types as narrow as the call sites need.
- **`any` → real type:** derive from the source of truth (`z.infer`, `ReturnType`, Drizzle `$inferSelect`) instead of
  restating shapes.
- **Typecheck scope:** framework typecheck commands (e.g. `nuxt typecheck`) can skip server code. Check which
  tsconfig covers what, and run a second `tsc --noEmit -p <server tsconfig>` if the server is not covered.
- **Decorators / DI:** frameworks that read class or handler shape at build time (route generators, DI metadata)
  break on "harmless" rewrites. Change the generator or registry, not the shape it parses.
