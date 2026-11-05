# Historical implementation audit — 2026-11-05

This audit records the state **before implementation**. See [current implementation status](2026-11-05-implementation-status.md) for the implemented build and verification.

Baseline: [Vehicle Search CLI design](2026-11-05-vehicle-search-cli-design.md).

## Verdict

The repository contains scaffolding, sample data, and documentation. It does not yet provide a runnable vehicle-search CLI or mock API. File presence and checked-in `dist/` files are not evidence of a successful build. No production API or Clerk connection was verified.

## Design coverage

| Design requirement | Verified implementation | Remaining work |
| --- | --- | --- |
| TypeScript, Node.js 24, shared client | Node v24.22.0 available; one TypeScript interface file; most source is JavaScript | Implement modules, resolve imports, configure compilation |
| Build and installable `vehicle-cli` | `package.json` contains only a name; lockfile describes a different package configuration | Declare dependencies, scripts, module type, executable mapping and package files; regenerate lockfile |
| CLI command tree | Commander constructors and exported functions in `cli/`; no executable dispatch | Register auth, vehicles, insured and combined commands and parse arguments |
| Clerk OAuth + PKCE | Empty `initAuth`; literal `Bearer token-value` placeholder | Browser login, state verification, S256, loopback callback, refresh, secure storage and logout |
| Separate configurable API URLs | No functional HTTP client | Implement authenticated GET requests, configuration, timeouts and safe errors |
| Catalog exact/match and AND filters | Helper stubs; sample catalog record | Implement all filters, validation, dates, pagination and price history |
| Insured search | Empty sample insured array; finder imports nonexistent JSON | Implement records, exact filters and pagination |
| Combined enrichment | Empty combined route stub | Implement client-side join, final-result pagination and lookup errors |
| Mock APIs | Empty server/route functions; no listening server | Implement GET routes, fixtures, local startup and shutdown |
| JSON output and stable exit codes | No executable command handlers | Define output/error envelopes and distinct exit codes |
| OpenCode shell integration | `opencode.json` asks for bash permission except a few inspection commands | Invoke the completed CLI through the shell; MCP is outside the design |
| Automated verification | Test functions return empty objects; assertion helper inverts conditions | Add executable contract, auth and command integration tests |

## Reproduced checks

Run from the repository root with Node v24.22.0 and npm 12.2.0:

| Command | Observed result |
| --- | --- |
| `npm run build` | Fails: missing script `build` |
| `npm test` | Fails: missing script `test` |
| `node cli/index.js` | Fails: `require is not defined in ES module scope` |
| `node --check bin/esbuild-config.mjs` | Fails: `Unexpected token '='` at `export function config = {}` |

Further source inspection found invalid syntax in `src/main-entry.js`, `api/dev-server.js`, and `src/lib/token.js`, unresolved `file:` imports, and TypeScript syntax in `.js` files. `bin/build.mjs` returns a string rather than running a bundler; `docs/build.mjs` is empty. The two nested `build.sh` files run `npm install` and print a success message without compiling or testing anything.

## Documentation corrections

The former guides claimed working APIs, authentication, OpenTelemetry, GraphQL/Fastify, and MCP connectivity without corresponding implementations. They also referenced missing paths and unsupported shell commands. The build, install, structure, and connection guides now distinguish current failures from the intended workflow. The original design remains the target contract.

The nested Maven/IDE directories are scaffolds, not the location of the root CLI/API sources. Their XML and `.gitconfig` examples do not establish an OpenCode connection. Existing files are retained for review; this audit does not delete or repair product code.

## Implementation order

1. Establish a consistent TypeScript package, real build/test scripts and executable entry point.
2. Implement shared validation, fixtures and both local GET APIs.
3. Implement catalog and insured clients and the combined search semantics.
4. Implement Clerk OAuth and credential handling; verify against a configured Clerk application.
5. Verify packaged installation and shell invocation, then replace the blocked instructions with commands tested against that build.

Completion requires a clean install, successful build and meaningful tests, an installed executable smoke test, mock searches covering every filter and join failure, and a separate real Clerk/API integration check. Until then, deployment and authentication claims remain unverified.
