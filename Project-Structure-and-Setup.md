# Project structure

One Node.js 24 TypeScript package supplies a shared client, CLI and two mock API processes. OpenCode invokes the CLI through its shell capability.

| Path | Responsibility |
| --- | --- |
| `src/core.ts` | Contracts, validation, filtering, JSON errors and pagination |
| `src/fixtures.ts` | Three catalog vehicles, effective-date price history and four insured records |
| `src/mock.ts` | Loopback GET-only catalog/insured API executable and reusable server lifecycle |
| `src/client.ts` | Authenticated requests, payload checks and insured-first combined enrichment |
| `src/env.ts` | Current-directory or explicit environment-file loading and safe configuration checks |
| `src/config.ts`, `src/http.ts` | Environment configuration, URL policy, timeouts and safe HTTP errors |
| `src/auth.ts` | OAuth discovery, PKCE, one-shot callback, browser launch, refresh and revocation |
| `src/credentials.ts` | Native credential-store adapter and explicit owner-only file fallback |
| `src/cli.ts` | CLI command tree, options, JSON stdout and exit codes |
| `bin/build.mjs`, `tsconfig.json` | Clean TypeScript build to `dist/` |
| `tests/*.test.mjs` | Executable contract/auth/client/CLI tests |
| `scripts/verify-install.mjs`, `scripts/verify-opencode.mjs` | Packed installation/shell verification and repeatable actual OpenCode searches |
| `package.json`, `package-lock.json` | Matching runtime/build dependencies, scripts and executable mappings |
| `opencode.json`, `docs/opencode-instructions.md` | Loaded OpenCode shell permissions, instructions and `/vehicle-search` command; no MCP integration |
| `docs/` | Original design, historical audit, implementation plan and current status |

`dist/` is generated and replaced by the build. The shipped package includes only compiled output and selected documentation.

The unused legacy JavaScript, Maven, MCP/IDE subprojects, placeholder tests and duplicate documentation have been removed after checking references. See the [cleanup inventory and recovery archive](docs/2026-11-05-scaffold-cleanup.md). Root `.idea/` remains as active user editor configuration; it is not part of the Node build. No GraphQL, Fastify, OpenTelemetry authentication or MCP server is implemented.

See [build/install](HowToBuild-andInstall.md), [OpenCode connection](How-To-Connect-to-OpenCode.md) and [current status](docs/2026-11-05-implementation-status.md).
