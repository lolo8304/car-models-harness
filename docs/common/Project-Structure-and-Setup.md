# Project structure

The source separates reusable infrastructure from vehicle-specific behavior:

```text
src/
├── common/
│   ├── auth.ts          # OAuth/PKCE lifecycle and browser launch
│   ├── config.ts        # URL policy, OAuth config and legacy env adapter
│   ├── credentials.ts   # OS/file storage, store interface and context
│   ├── env.ts           # Generic .env loading
│   ├── errors.ts        # AppError, JSON errors and exit codes
│   ├── http.ts          # Bounded HTTP requests and safe error translation
│   ├── pagination.ts    # Generic Page<T> and array pagination
│   ├── validation.ts    # Date and positive-integer validation
│   └── index.ts         # Public common library; no CLI execution
├── vehicles/
│   ├── types.ts         # Vehicle, insured and combined contracts
│   ├── search.ts        # Vehicle filters, matching and search validation
│   ├── config.ts        # API URL config and vehicle config check
│   ├── client.ts        # Catalog/insured client and enrichment
│   ├── fixtures.ts      # Vehicle and insurance demo data
│   ├── mock.ts          # Mock routes/lifecycle; startup is explicit
│   ├── cli.ts           # Vehicle CLI composition and command handlers
│   └── index.ts         # Public domain library; excludes CLI execution
├── cli.ts               # Thin executable entry point
└── mock.ts              # Thin executable entry point and compatibility exports
```

`common` has no imports from `vehicles`. Vehicle code consumes shared facilities; another domain can do the same without importing catalog fixtures, joins, filters or command registration. See [reuse examples](reusing-common.md).

| Other paths | Responsibility |
| --- | --- |
| `bin/build.mjs`, `tsconfig.json` | Recursively compile maintained TypeScript into `dist/` |
| `tests/common/*.test.mjs`, `tests/vehicles/*.test.mjs` | Contract/auth/client/CLI checks and common/domain boundary tests |
| `scripts/common/` | Reusable subprocess helper and recursive error-handling check |
| `scripts/vehicles/` | Vehicle package/shell/OpenCode verification and fixture evidence checks |
| `package.json`, `package-lock.json` | Package exports, dependencies and executable mappings |
| `opencode.json`, `docs/vehicles/opencode-instructions.md` | OpenCode shell permissions, instructions and `/vehicle-search` |
| `docs/common/` | Shared reuse guidance, architecture and common refactor plans |
| `docs/vehicles/` | Vehicle design, build/install/OpenCode guides, verification, audit and cleanup |

The build generates `dist/common/` and `dist/vehicles/`. Existing executable paths `dist/cli.js` and `dist/mock.js`, installed commands `vehicle-cli` and `vehicle-mock`, package root client imports, and the `/mock` library import are preserved. Private direct imports of old flat files such as `dist/auth.js` must use the public `/common` export instead.

`dist/`, `node_modules/` and `release/` are generated/installed outputs ignored by Git. The old JavaScript/Maven/MCP scaffolds were removed; see the [cleanup record](../vehicles/2026-11-05-scaffold-cleanup.md). Active root `.idea/` is editor state, not an application dependency.

See [build/install](../vehicles/HowToBuild-andInstall.md), [OpenCode connection](../vehicles/How-To-Connect-to-OpenCode.md) and [current status](../vehicles/2026-11-05-implementation-status.md).
