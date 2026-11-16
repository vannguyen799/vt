# Go — critical traps only

- **Exported API:** moving an exported identifier across packages is a breaking change for importers outside the
  repo. Within the module, a type alias (`type Old = new.T`) keeps the old name compiling during the move.
- **Interfaces:** define them where they are consumed and keep them small. Don't introduce an interface that has a
  single implementation and no test seam.
- **Dead-code proof:** `go vet ./...` plus `staticcheck` (U1000) when available. Also grep reflection and code
  generation (`//go:generate`, struct tags) before you delete.
- **Verify:** `go build ./...` and `go test` on the changed packages only (`go test ./path/...`).
