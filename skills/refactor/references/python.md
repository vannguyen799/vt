# Python — critical traps only

- **Moving a module:** keep the old import path working by re-exporting from the old module, and list the names in
  `__all__`. Watch for import cycles that a new shared util can introduce: keep utils dependency-free.
- **Dead-code proof:** grep for `getattr`, string-based registries (entry points in `pyproject.toml`, plugin or
  CLI tables, Django/Celery autodiscovery) and `__init__` re-exports. Static "unused" reports miss these.
- **Monkeypatch targets:** tests that patch `pkg.module.name` break when `name` moves. Patch where it is looked up,
  and update the patch path together with the move.
- **Types:** use `Protocol` / `TypedDict` for shared shapes, not base classes made only for typing. Run the repo's
  checker (mypy/pyright) only on the changed packages.
