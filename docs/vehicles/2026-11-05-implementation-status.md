# Implementation and verification — 2026-11-05

The [original design](2026-11-05-vehicle-search-cli-design.md) is implemented in maintained TypeScript modules. The [earlier audit](2026-11-05-implementation-audit.md) is a historical record of the scaffold state.

## Implemented

- Installable `vehicle-cli` and `vehicle-mock` executables, strict TypeScript build, matching manifest/lockfile and isolated package contents.
- Catalog, insured and combined searches with JSON pages, all design filters, AND semantics, exact identifiers, text match mode, date validation, CHF effective-date prices and pagination.
- Separate configurable catalog and insured URLs, authenticated GET requests, bounded response size/time, runtime payload checks and stable JSON errors/exit codes.
- Combined insured-first enrichment, cached vehicle lookups, final-result pagination and structured per-row lookup errors. Tests cross the 1,000-record upstream page boundary.
- Two loopback mock APIs with three catalog vehicles, four insured records, a missing-vehicle fixture, price history, GET-only enforcement and graceful shutdown.
- Public-client OAuth discovery and code exchange with state validation, S256 PKCE, one-shot configurable-fixed-port or OS-selected-port callback, browser/manual opening, refresh rotation, credential status, revocation where supported and local logout cleanup.
- Default native OS credential store and explicit POSIX owner-only file fallback, with context separation by issuer/client ID.
- Build, installation, configuration and OpenCode shell documents. No MCP server or production API implementation.

## Verification evidence

Environment: Node v24.22.0, npm 12.2.0, macOS. OpenCode v2.2.5 is installed.

| Check | Result |
| --- | --- |
| `npm test` | 24 tests pass; includes a clean TypeScript build |
| `npm run verify:install` | Passed: tarball built, installed under temporary global prefix, installed mocks started, installed CLI invoked through `/bin/sh`, expected joined record and exit codes checked |
| Native macOS keyring | Temporary test entry write/read/delete passed; no existing user credentials read or changed |
| OAuth lifecycle | Local provider tests pass for PKCE, state, denial, failed exchange, timeout, browser-child cancellation, refresh, revocation and callback cleanup |
| File credential fallback | Owner-only directory/file, symlink rejection, context mismatch and deletion tested |
| Actual OpenCode agent shell invocation | Passed using the running background service: catalog, insured and combined searches each emitted a completed shell tool event, exit 0 and expected JSON records. The earlier standalone startup timeouts are historical. See [tool verification record](verification/opencode-shell-2026-11-05.json). |
| Live Clerk tenant and real resource APIs | User completed live Clerk login; CLI status confirms saved credentials and refresh availability. Real production resource APIs remain unverified. |

A fresh independent code review found two callback/browser lifecycle bugs. Both were reproduced as failing tests and fixed: malformed callback URLs return 400 rather than crashing, and login completion/timeout aborts the browser launcher. A wrong-price-date catalog response and logout cleanup of corrupt credentials also have regression tests.

## Deliberate implementation choices and limits

- CLI flags use kebab-case; wire query keys use camelCase. `--as-of` defaults to UTC today. Result pages are `{items,total,page,limit}`; documented defaults and ceilings apply.
- Missing/failed lookup rows remain visible under catalog filters; auth failures abort. Combined scans are sequential and held in memory, with a 10,000 upstream-page safety limit. Large production datasets may need a server-side join or bounded streaming design.
- Native keyring is the default. File fallback is explicit to avoid a silent plaintext downgrade; Windows file fallback is disabled because POSIX mode bits do not establish Windows ACL security. Only macOS native keyring was exercised here.
- Obsolete legacy scaffolds were archived outside the repository and removed at the user’s cleanup request. See the [cleanup inventory](2026-11-05-scaffold-cleanup.md) for paths, reasons and recovery. Active editor settings remain.
- Live Clerk acceptance must confirm the registered callback URI, requested scopes/audience, token refresh and real API issuer/audience validation. The repository now uses a fixed callback port to avoid depending on variable-port matching. No production authentication claim is made from local-provider tests.
- No commits, publishing or repository permission changes were performed. Work remains on `codex/vehicle-search-cli` with the pre-existing staged files preserved.

Use the [build/install guide](HowToBuild-andInstall.md) and [OpenCode shell guide](How-To-Connect-to-OpenCode.md) to reproduce checks.

## Environment-file follow-up

The CLI now automatically loads current-directory `.env` without overriding existing shell variables. Use `--env /absolute/path/to/.env` for another location. `config check` validates required URLs/OAuth settings and reports only presence booleans and file loading status, with no network calls or credential values. `.env.example` is versioned; the real `.env` remains ignored and excluded from packaging. Subprocess tests cover file loading, precedence, explicit paths, missing files and redaction.

## Scaffold cleanup

Removed 84 unused scaffold/duplicate files, with a verified recovery archive outside the repository. Build/test/package entry points remain unchanged; obsolete compiler exclusions were removed. The cleanup does not change the known OpenCode startup or live Clerk acceptance limitations.

## Fixed callback-port follow-up

`CLERK_OAUTH_CALLBACK_PORT` optionally selects a validated port (1–65535); unset retains OS-selected behavior. The repository `.env` and template set `8765`. Register `http://127.0.0.1:8765/callback` in Clerk Redirect URIs. `config check` reports the effective `clerk.redirectUri`. Tests cover fixed binding, equal authorization/exchange URIs, listener release, occupied-port failure with no fallback/browser launch, default port selection and invalid configuration. Real Clerk authentication still requires live acceptance; local tests do not assert it succeeded.

## OAuth diagnostic follow-up

Recognized authorization callback errors now include an allowlisted OAuth code and a suggested check; arbitrary provider strings, descriptions and token-bearing callback data remain hidden. A regression test covers recognized/unknown errors and redaction. A read-only check of the configured live issuer confirmed discovery is reachable, issuer matches, requested scopes are advertised, and public-client/PKCE support is advertised. This does not verify application-specific scope assignment, consent, token exchange or successful login. The reported user login failure still requires the specific callback error to diagnose.

## OpenCode connection verification

The repository now provides `/vehicle-search`, project instructions and V2 shell permissions for the CLI search prefixes. `opencode debug config` confirmed they are loaded. An actual OpenCode v2.2.5 agent using `opencode/big-pickle` ran catalog, insured and combined searches successfully through its `shell` tool. Evidence checks assert the exit status and parse the tool output JSON. The verifier supports V2 nested exit metadata and legacy bash metadata. Prior standalone startup timeouts do not apply to the successful background-service verification. No production resource-server authorization is implied by successful searches against mocks.

Repeatable repository verification is available with `VEHICLE_OPENCODE_MODEL=opencode/big-pickle npm run verify:opencode`. Earlier automated OpenCode runs waited indefinitely because the subprocess harness did not close stdin; a failing-then-passing EOF regression test confirmed the cause, and both drivers now close stdin explicitly. Repository verification uses real completed shell events for all three search groups.

The automated repository check now passes all three shell searches after explicitly closing subprocess stdin. Unit/integration tests pass 24/24, including the EOF regression.

The isolated packed CLI OpenCode check also passes with a private server and explicit temporary-project shell workdir: installation, shell invocation, actual OpenCode tool event and expected `ve-002` JSON page all verified. Both harness failures are resolved (stdin EOF and explicit tool workdir).

## User installation

The release tarball is generated under `release/` and the current CLI is installed globally in the active Node.js 24 npm prefix. Installed `vehicle-cli` version/help, configuration check and saved auth status were verified without starting services. The package excludes the real `.env`; explicit `--env` supports invocation outside the checkout. This is the user-selected npm-installable distribution, not a standalone no-Node executable.

## Common / vehicle folder separation

Reusable auth, credentials, HTTP, environment loading, errors, date/number validation and pagination are in `src/common`. Vehicle contracts, search rules, API configuration, clients, fixtures, mock routes and CLI composition are in `src/vehicles`. Mixed core/config/environment modules were split to eliminate common-to-domain dependencies. Public `/common` and `/vehicles` imports were added; existing root client, `/mock` and executable paths are preserved. The compiler and error-handling check now recurse into nested source folders. See [reuse guide](../common/reusing-common.md). Verification uses service-free architecture/behavior and package smoke checks; no services are started for this refactor.

Folder-refactor verification: 20 selected service-free tests, recursive warning check and TypeScript build pass. A separate temporary project installed the tarball, imported all public entry points and compiled a strict TypeScript consumer. The release tarball and global CLI were refreshed; installed configuration still loads correctly. No services were started, and the full network/server test suite was not rerun for this structural change.
