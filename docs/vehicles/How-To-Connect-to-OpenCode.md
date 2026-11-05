# OpenCode shell connection

The repository is connected to OpenCode through its existing shell tool. No MCP server is used. The project `opencode.json` loads `docs/vehicles/opencode-instructions.md`, registers `/vehicle-search`, and allows the three read-only CLI search prefixes while leaving unrelated shell commands at `ask`.

## Use it

Start OpenCode from the repository root after building the CLI, completing Clerk login and starting the local APIs:

```sh
cd /Users/Lolo/git/car-models-harness
opencode
```

In OpenCode, enter:

```text
/vehicle-search Find Tesla vehicles insured for customer C001
```

Or ask directly:

> Use the shell tool to run node dist/cli.js combined search --customer-number C001 --brand Tesla and report the JSON results.

The CLI reads the repository `.env` and saved OS credentials itself. OpenCode does not need to read or receive the file or tokens. The project does not change your default model; verification used the available `opencode/big-pickle` model. Choose a model capable of tool use in your OpenCode session.

If the services are stopped, start these in separate terminals:

```sh
node dist/mock.js catalog 4010
```

```sh
node dist/mock.js insured 4011
```

The current `.env` targets those mock APIs. They use sample data and do not enforce production token validation. For real APIs, update the two base URLs and validate their authorization contract separately. See [build/install and Clerk settings](HowToBuild-andInstall.md).

## Verified behavior

An actual OpenCode v2.2.5 agent, using the running background service, executed these commands through the `shell` tool, each with exit code 0:

| Search | Shell command | Result |
| --- | --- | --- |
| Catalog | `node dist/cli.js vehicles search --brand Tesla --as-of 2025-06-01` | Total 2: `ve-001`, `ve-002` |
| Insured | `node dist/cli.js insured search --plate-number "ZH 638871"` | Total 1: `ve-001` |
| Combined | `node dist/cli.js combined search --customer-number C001 --brand tes --mode match --as-of 2025-06-01 --page 2 --limit 1` | Total 2; page 2 contains `ve-002` |

The [verification record](verification/opencode-shell-2026-11-05.json) is derived from successful tool events and parsed JSON output, not the model's claims. Live user login was already saved; the CLI loaded those credentials, while the mocks themselves do not validate them.

## Repeatable verification

```sh
npm run verify:install
VEHICLE_OPENCODE_MODEL=opencode/big-pickle npm run verify:opencode
```

The first command verifies an isolated packed installation and ordinary POSIX shell invocation. The second uses this repository, the saved login and running loopback mocks, and asks OpenCode to perform all three searches. It validates completed tool events, zero exit status and expected JSON pages. It fails before invoking OpenCode if the local APIs/login or fixture data are unavailable. OpenCode gets the invoking shell's environment; the verification driver does not forward values newly loaded from `.env` to the agent process.

`VEHICLE_OPENCODE_EVIDENCE=/absolute/path/events.jsonl` optionally saves raw test events. The verifier accepts legacy `bash` events and V2 `shell` events, requires completion and exit 0, and checks the actual JSON page. Failed calls or model text cannot establish success. The OpenCode subprocess has a two-minute timeout; OpenCode may retain its own session metadata.

The earlier automation timeouts were caused by the harness leaving subprocess stdin open while OpenCode waited for EOF. Both verification drivers now explicitly close stdin; a subprocess regression test reproduces the old hang and verifies the fix. This was a harness issue, not an authentication or CLI search failure.

For an additional test of the packed CLI through an actual OpenCode agent:

```sh
VEHICLE_OPENCODE_MODEL=opencode/big-pickle npm run verify:install -- --opencode
```

This creates a temporary project denying other actions and allowing only the exact test command, supplies only public mock settings and absolute executable paths, and cleans up its mocks/installation on success or failure. It defaults to the running service; `VEHICLE_OPENCODE_STANDALONE=1` opts into private-server startup.

## Project configuration

The configuration uses V2 `permissions` rules and `commands`. Inspection of `opencode debug config` confirmed these are loaded. Search exceptions cover only `node dist/cli.js vehicles search*`, `insured search*`, and `combined search*`, plus configuration/status checks. Existing Git inspection exceptions remain. Read-only search failures are reported from structured stderr; the agent is instructed not to edit configuration, print credentials or invent records.

See [OpenCode V2 permissions](https://dev.opencode.ai/v2/docs/permissions/) and [configuration](https://dev.opencode.ai/v2/docs/config/).

Both `verify:opencode` and the isolated packed `verify:install -- --opencode` check passed after these harness fixes.

## Shorter tool display

The vehicle-search instructions now prefer the globally installed `vehicle-cli`, with the shell tool workdir set to this repository. For example, `vehicle-cli insured search --plate-number 'ZH 638871'` replaces the long absolute `node .../dist/cli.js` command. The shell permissions allow these read-only installed-command prefixes as well as the existing relative-node fallback. The agent is asked to summarize results briefly instead of repeating raw JSON.

The full JSON remains available to the agent and is not truncated. OpenCode owns the expanded tool block's padding/font/height; shortening the command reduces wrapping but does not change those UI dimensions. Start a new chat/session in OpenCode if an existing one keeps following the old instructions. No global OpenCode UI preferences were changed.
