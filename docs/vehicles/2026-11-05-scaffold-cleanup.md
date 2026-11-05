# Obsolete scaffold cleanup — 2026-11-05

The working TypeScript package no longer depends on the earlier generated scaffolds. Imports, package scripts, compiler inputs and documentation links were checked before cleanup.

## Removed

| Paths | Reason |
| --- | --- |
| `api/`, `cli/`, `src/lib/`, `src/types/`, `src/main-entry.js`, `types/` | Inactive placeholders, broken imports/module syntax and duplicate contracts; replaced by maintained `src/*.ts` |
| `hooks/`, `lib/` | Empty MCP/OpenCode setup stubs; integration uses shell invocation, not MCP |
| `vehicle-api-project/`, `vehicle-harness-cli/` | Invalid Maven descriptors, dummy npm-only build scripts and nonfunctional IDE/MCP settings; not independent application projects |
| `bin/esbuild-config.mjs`, `docs/build.mjs` | Invalid/empty unused build implementations; actual build is `bin/build.mjs` |
| `tests/index.js`, `tests/harness.js`, `tests/setup.js` | Non-running placeholder suite, including an inverted assertion helper; replaced by `tests/*.test.mjs` |
| `FINAL_SUMMARY.md`, `PROJECT_STRUCTURE.md`, `How-To-Use-With-OpenCode.md` | Duplicate summaries/redirect documents; maintained entry points are README, build/install, connection, structure and implementation-status documents |

Removed 84 files from 18 top-level cleanup targets. Removed obsolete compiler exclusions for the deleted source folders.

## Retained

- Maintained TypeScript modules, real test suite, packaging verification scripts, npm manifest/lockfile and build script.
- Original design, historical audit, implementation plan and current verification status. The audit describes files that existed before cleanup.
- `dist/` and `node_modules/`: current build output and installed dependencies, ignored by Git; `npm run build` regenerates dist.
- Root `.idea/`: active editor configuration, which is not required for the application build but is user workspace state. Java/Go-specific settings there are optional editor residue, not application dependencies; no active editor settings were removed.
- `.env`, `.env.example`, Git metadata and existing OpenCode permissions.

## Recovery and repository state

A verified owner-only archive of the removed files is stored outside the repository at:

`/Users/Lolo/.codex/backups/car-models-harness-obsolete-2026-11-05-ac5524a7.zip`

The archive excludes the real `.env`, Git metadata and active editor state. No commits, index resets, publishing or permission changes were performed; staged entries may show working-tree deletions until the cleanup is staged for commit.

See [current project structure](../common/Project-Structure-and-Setup.md) and [verification status](2026-11-05-implementation-status.md).

## Verification after cleanup

`npm test` passed all 17 tests including the clean TypeScript build. `npm run verify:install` passed packed installation and installed CLI shell searches. Maintained JavaScript build/verification scripts pass syntax checks; all 23 local links across nine maintained documents resolve. OpenCode shell integration was subsequently verified through the running background service; see implementation status.
