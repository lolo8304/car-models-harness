# Vehicle Search CLI Implementation Plan

> Execution: implement inline with test-first verification; perform a fresh final review.

**Goal:** Deliver the existing vehicle-search design as an installable CLI plus local mock APIs.
**Architecture:** Shared TypeScript contract, validation and client modules; native Node HTTP mocks; Commander CLI; OAuth PKCE and secure credential storage behind injectable interfaces.
**Tech stack:** Node.js 24, TypeScript, Commander, Node test runner. Compile only maintained TypeScript entry points; preserve legacy scaffold files outside compilation/package output.
**Spec:** docs/2026-11-05-vehicle-search-cli-design.md

## Constraints and decisions

GET-only searches; exact identifiers; case-insensitive substring matching only for brand/model; AND filters; CHF prices by selected date; final-result pagination for combined searches; default limit 20. No MCP. No production writes. Separate API URLs and shared bearer token.

Use `src/core.ts` for contract/validation, `src/fixtures.ts` and `src/mock.ts` for APIs, `src/client.ts` for API access/join, `src/auth.ts` and `src/credentials.ts` for auth, `src/cli.ts` for executable commands. Output compiled ESM under dist. Native OS credential facilities when available, explicit owner-only file fallback. Mock mode restricted to loopback URLs.

## Review focus

Invalid dates/numbers and unknown flags must fail predictably. Combined filters must paginate after enrichment and retain missing-vehicle errors. Expired credentials must refresh without printing tokens. OAuth callback state, timeout and errors must clean up the listener. HTTP failures and unexpected payloads must produce safe structured errors.

## Tasks

- [x] 1. Contract/mocks: write failing `tests/search.test.mjs` covering all filter types, date prices, pagination, invalid input and GET-only routes; implement core/fixtures/mock modules; compile and pass tests.
- [x] 2. Client/CLI: write failing integration tests covering bearer forwarding, insured-first join, pagination and lookup failure, JSON stdout, error exit classes; implement `VehicleClient`, configuration and Commander CLI; pass tests.
- [x] 3. OAuth/storage: write failing local OAuth provider tests covering PKCE/state, callback rejection, refresh, logout and file permissions; implement discovery/public-client exchange, browser launch and secure persistence; pass tests.
- [x] 4. Package/shell: add clean build and packaging verification, install tarball under temporary prefix, start separate mocks, invoke installed CLI from a shell and test OpenCode invocation if provider access is available.
- [x] 5. Update build/install/connection documents and audit with observed results, remaining live-integration limits and exact configuration; check links; run clean install/build/tests/package verification and fresh review.

No commits will be made over the user's pre-existing staged tree. Preserve old scaffold paths as legacy; remove obsolete generated dist output only through the clean build. Real Clerk/resource-server authorization remains a separate live acceptance check requiring supplied configuration.

## Execution record

- Initial checks confirmed missing build/test scripts and mixed-module startup failure. OpenCode v2.2.5 is installed. Branch created without resetting the staged files.

- Contract/mocks, client/CLI and OAuth/storage tests were introduced before implementation and observed failing on missing modules, then passed.
- Ruling: native keyring default with explicit file fallback — avoid silently writing plaintext when a keyring is unavailable — headless users must select file mode.
- Ruling: preserve legacy scaffolds outside maintained compilation/package paths — protect the pre-existing staged work — legacy entry points remain unsupported.
- Final fresh review: two P2 callback/launcher findings reproduced by failing tests and fixed; wrong catalog price date also covered by a failing test and fixed.
- Final: fixed malformed callback URL — raw TCP callback regression RED→GREEN.
- Final: fixed hanging browser launcher — real child abort regression RED→GREEN.
- Final: fixed catalog-list price date mismatch — wrong-date response regression RED→GREEN.
- Additional logout corruption regression RED→GREEN; suite 14/14.
- Native macOS credential store temporary-entry write/read/delete passed; temporary tarball installation and installed shell invocation passed.

- Final verification: clean npm ci, build and 15 tests pass. Packed installation and shell invocation pass. Actual OpenCode attempted twice; both timed out in standalone startup with no tool events. This external acceptance check remains unverified and is documented, not reported as passed.

- Follow-up user-authorized cleanup: archived and removed obsolete scaffolds and duplicate docs; historical preservation decisions above describe the earlier implementation phase. See docs/2026-11-05-scaffold-cleanup.md.

- OpenCode follow-up: V2 project commands/instructions and narrow search permissions configured; actual catalog/insured/combined tool calls verified. Automated repository and isolated packed CLI checks pass after closing stdin explicitly and setting the isolated tool workdir. Unit/integration suite24/24. See docs/verification/opencode-shell-2026-11-05.json.
