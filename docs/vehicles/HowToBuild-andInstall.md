# Build and installation

## Installed CLI and release archive

The current release is npm-installable and requires Node.js 24 or newer. It installs `vehicle-cli` and `vehicle-mock` as executable commands; invoking `node dist/cli.js` is no longer necessary for normal use. This is an npm CLI package, not a self-contained native executable.

Create a distributable archive from the repository root:

```sh
mkdir -p release
npm pack --pack-destination release
npm install --global ./release/vehicle-search-harness-0.1.0.tgz
vehicle-cli --version
```

The archive can be copied to another machine with Node.js 24+ and installed with the same `npm install --global /path/to/archive.tgz` command. Installation resolves runtime dependencies from npm (a connection or populated npm cache is needed). The private `.env` and saved OS credentials are not included; configure and log in separately on another machine.

Use the installed CLI from this repository, where `.env` is loaded automatically:

```sh
vehicle-cli config check
vehicle-cli auth status
vehicle-cli vehicles search --brand Tesla
vehicle-cli combined search --customer-number C001
```

Or use it from another directory with an explicit configuration path:

```sh
vehicle-cli --env /Users/Lolo/git/car-models-harness/.env config check
vehicle-cli --env /Users/Lolo/git/car-models-harness/.env combined search --customer-number C001
```

Start services yourself when needed, each in its own terminal:

```sh
vehicle-mock catalog 4010
```

```sh
vehicle-mock insured 4011
```

Installing the package does not start services. The `.env` still points to local mock APIs until you configure real API URLs. With nvm, global commands belong to the active Node installation; reinstall after switching to a different Node version if the commands disappear. Uninstall with `npm uninstall --global vehicle-search-harness`.

## Requirements and build

Use Node.js 24 or newer and npm. Run commands from the repository root:

```sh
npm ci
npm run build
npm test
npm run verify:install
```

The build compiles maintained `src/**/*.ts` into a clean `dist/` directory and marks the CLI and mock entry points executable. Obsolete legacy scaffolds have been removed; see the [cleanup inventory](2026-11-05-scaffold-cleanup.md). Tests use Node's test runner and ephemeral loopback ports; no Clerk account or real API credentials are required. `verify:install` packs the project, installs the tarball under a temporary prefix, starts the installed mock executables, exercises the installed CLI from `/bin/sh`, and removes the temporary installation. The verifier requires a POSIX shell.

Install for normal use:

```sh
npm install --global .
vehicle-cli --help
```

The mock executable uses positional arguments: `vehicle-mock catalog|insured [port]`. For a local development link, use `npm link` instead of the global installation. Choose an npm prefix writable by your user; do not use sudo to work around prefix permissions.

To distribute a package, run `npm pack`; the tarball contains compiled ESM/declarations and usage documents, not the old scaffolds. Install the resulting tarball with `npm install --global ./vehicle-search-harness-0.1.0.tgz`.

## Local mock demonstration

In two terminals, after building:

```sh
# Terminal 1
node dist/mock.js catalog 4010
```

```sh
# Terminal 2
node dist/mock.js insured 4011
```

Each server binds only to `127.0.0.1` and prints its URL as one JSON line. Port `0` selects an available port. Stop with Ctrl-C. Mock APIs are development fixtures, accept only GET, and do not validate bearer credentials. They are not production servers.

In a third terminal:

```sh
export VEHICLE_MOCK=1
export VEHICLE_CATALOG_URL=http://127.0.0.1:4010
export VEHICLE_INSURED_URL=http://127.0.0.1:4011
node dist/cli.js vehicles search --brand tes --mode match
node dist/cli.js insured search --plate-number 'ZH 638871'
node dist/cli.js combined search --customer-number C001 --brand Tesla --as-of 2025-06-01
```

After installing, replace `node dist/cli.js` with `vehicle-cli`. The final example returns two joined Tesla records. Prices for that date are CHF 38,000 and CHF 47,000. The fixtures include three catalog vehicles and four insured records; `in-004` intentionally references a missing catalog vehicle.

## Configuration

Place `.env` in the repository root (`/Users/Lolo/git/car-models-harness/.env`) and run the CLI from that directory. A private template has been created there with empty Clerk issuer/client fields. For another checkout, use `cp .env.example .env` and `chmod 600 .env`.

Fill these entries in `.env` with your **OAuth public application's** values:

```dotenv
VEHICLE_MOCK=0
CLERK_OAUTH_ISSUER=https://your-clerk-issuer.example
CLERK_OAUTH_CLIENT_ID=your-public-oauth-client-id
CLERK_OAUTH_SCOPES="openid profile"
CLERK_OAUTH_CALLBACK_PORT=8765
# CLERK_OAUTH_AUDIENCE=your-api-audience
VEHICLE_CATALOG_URL=http://127.0.0.1:4010
VEHICLE_INSURED_URL=http://127.0.0.1:4011
```

The loopback API URLs target the local mocks; replace them for real APIs. These are OAuth settings, not Clerk publishable (`pk_...`) or secret (`sk_...`) API keys. No client secret is used.

The CLI automatically reads `.env` in its **current working directory**, including an installed `vehicle-cli`. Existing shell variables take precedence over file values. It does not search parent directories or load `.env.local`. For invocation from elsewhere, select the file explicitly:

```sh
node /Users/Lolo/git/car-models-harness/dist/cli.js --env /Users/Lolo/git/car-models-harness/.env config check
```

From the repository root, verify loading and configuration before login:

```sh
node dist/cli.js config check
node dist/cli.js auth login
node dist/cli.js auth status
```

`config check` returns `valid:true`, `envFile.loaded:true`, the file path, the effective fixed `clerk.redirectUri` (or `null` for automatic port selection), and boolean indicators such as `clerk.issuerConfigured` and `clerk.clientIdConfigured`. It never displays setting values or stored tokens, and makes no network requests. Missing/invalid settings exit 2; real issuer/client compatibility is checked separately by interactive login. The newly created template will correctly report missing Clerk settings until you fill them in. Keep the real `.env` private: Git ignores it, and npm packaging excludes it. `.env.example` contains only empty/example values.

After changing source, build before invoking `node dist/cli.js`; reinstall a previously copied global installation to pick up these new commands. OpenCode should run from the same directory or pass `--env` explicitly; OpenCode itself does not need to parse this file.

| Variable | Meaning / default |
| --- | --- |
| `VEHICLE_CATALOG_URL` | Required catalog base URL, optional path prefix |
| `VEHICLE_INSURED_URL` | Required insured API base URL, optional path prefix |
| `VEHICLE_MOCK` | `1` enables a local development bearer value; `0` or unset uses OAuth credentials; mock mode rejects remote API URLs |
| `VEHICLE_TIMEOUT_MS` | Per-request timeout, including response body; default `10000`, maximum `300000` |
| `CLERK_OAUTH_ISSUER` | Clerk authorization-server issuer; discovery uses `/.well-known/oauth-authorization-server` |
| `CLERK_OAUTH_CLIENT_ID` | Public OAuth application's client ID; no client secret |
| `CLERK_OAUTH_SCOPES` | Requested space-separated scopes; default `openid profile` |
| `CLERK_OAUTH_CALLBACK_PORT` | Optional fixed loopback callback port, integer 1–65535; unset selects an available port. Repository `.env` and template use `8765` |
| `CLERK_OAUTH_AUDIENCE` | Optional authorization-request audience parameter; must match the eventual resource-server contract |
| `VEHICLE_LOGIN_TIMEOUT_MS` | Browser/callback deadline; default `180000`, maximum `600000` |
| `VEHICLE_CREDENTIAL_STORE` | `keyring` (default) or explicit `file` fallback |
| `VEHICLE_CREDENTIAL_FILE` | File fallback path; default `~/.config/vehicle-cli/credentials.json` |

URLs must use HTTPS except for loopback development. Usernames/passwords, fragments and base-URL queries are rejected. The API URLs are not hard-coded. Both services receive the same bearer access token. Issuer/audience authorization enforcement belongs to the real APIs; the CLI does not treat decoded JWT contents as verified identity.

## Clerk login and credential storage

Create/configure a Clerk OAuth application as a **public client** with **Require PKCE** enabled. Set the issuer, client ID, and allowed scopes. The CLI discovers the authorization, token and optional revocation endpoints; it exchanges and refreshes tokens without a client secret. See [Clerk's OAuth documentation](https://clerk.com/docs/guides/configure/auth-strategies/oauth/how-clerk-implements-oauth).

```sh
unset VEHICLE_MOCK
export CLERK_OAUTH_ISSUER=https://your-clerk-issuer.example
export CLERK_OAUTH_CLIENT_ID=your-public-client-id
export VEHICLE_CATALOG_URL=https://your-catalog-api.example
export VEHICLE_INSURED_URL=https://your-insured-api.example
vehicle-cli auth login
vehicle-cli auth status
vehicle-cli vehicles search --brand Tesla
vehicle-cli auth logout
```

These URLs are placeholders, not working services. Set `CLERK_OAUTH_CALLBACK_PORT=8765` in `.env`. In your Clerk OAuth application's **Redirect URIs**, enter exactly:

```text
http://127.0.0.1:8765/callback
```

Use `127.0.0.1`, HTTP, port `8765`, and `/callback` without a trailing slash. The same URI is sent in both the authorization request and code exchange. The listener binds only to loopback and closes after success, failure or timeout. If port 8765 is occupied, login exits with an authentication error; it does not switch to an unregistered port. Free the port or choose another valid port and update both `.env` and Clerk registration.

The callback setting is optional: if absent, the OS selects an available port, preserving the original design's native-client flow. A provider must support changing loopback ports for that mode; the fixed setting avoids relying on that behavior. Empty, non-integer, zero and out-of-range settings fail validation. Shell variables override `.env`, so unset any older exported callback-port setting if it differs. `config check` reports the effective fixed redirect URI without contacting Clerk or trying to bind the port. `auth login --no-browser` prints the authorization URL to stderr for manual opening and waits for the same local callback. No dynamic client registration is implemented.

Credentials are stored under a context derived from issuer/client ID in macOS Keychain, Windows Credential Manager, or Linux Secret Service through optional `@napi-rs/keyring`. OS-store failures fail safely with instructions to select the file fallback; they never silently write plaintext. For a POSIX machine without a working keyring:

```sh
export VEHICLE_CREDENTIAL_STORE=file
vehicle-cli auth login
```

The fallback creates an owner-only directory (0700) and atomically replaces a 0600 file. Existing directories must already be owner-only. Symlink credential files and insecure file permissions are rejected on reads. Windows uses the OS store; the POSIX file fallback is disabled there. Tokens are not accepted as CLI arguments or printed by status. Access tokens refresh automatically within 30 seconds of expiry. Logout clears local credentials even if remote revocation fails; a revocation failure exits nonzero, while a provider without revocation support returns `revoked:false`.

## Command contract

Use `vehicle-cli <group> search --help` for flags. Catalog flags: `--vehicle-id`, `--vin`, `--registration-number`, `--brand`, `--model`, `--vehicle-type`, `--model-year`, `--first-registration-date`, `--seats`, `--as-of`, `--mode`, `--page`, `--limit`. Insured flags: `--plate-number`, `--customer-number`, `--policy-number`, `--vehicle-id`, `--page`, `--limit`. Combined accepts their union. Duplicate flags and unknown options fail validation.

All filters are ANDed. `--mode match` broadens only brand/model to case-insensitive substrings; other fields remain exact. Plates are trimmed and uppercased, preserving internal spaces. Registration numbers contain exactly eight alphanumeric characters. Dates are valid `YYYY-MM-DD` values; `--as-of` defaults to the current UTC date. Positive integer page/limit values default to 1/20; limit is capped at 1000. No purchase-price range flags exist.

Search stdout is a JSON page: `{items,total,page,limit}`. Catalog items include a single `purchasePrice: {amount,currency:"CHF",asOfDate}`. Combined items contain `{insured,vehicle}` or `{insured,vehicleLookupError}`. Combined search fetches insured pages, caches catalog lookups per vehicle ID, filters after enrichment, then paginates the final results. Missing/failed lookup rows are retained even with catalog filters, so clients can see unresolved records; authentication failures abort the search. Combined scanning is sequential, keeps results in memory, and rejects scans exceeding 10,000 upstream pages rather than silently truncating them.

Errors go to stderr as `{error:{code,message,status?}}`, with no raw server body or bearer token. Exit codes: `0` success, `1` internal failure, `2` validation, `3` authentication, `4` network/timeout, `5` API response failure. A combined page containing lookup errors is still a successful page; inspect each row. Help/version are human-readable stdout.

The mock contract is `GET /vehicles`, `GET /vehicles/{vehicleId}?asOfDate=...`, and `GET /insured-vehicles`, using camelCase query keys from the design. Detail lookup accepts only `asOfDate`. A requested price before fixture history begins returns API status 422.

## Troubleshoot OAuth authorization errors

`config check` validates local settings; it does not prove that Clerk grants this application access. A callback AUTH error occurs after discovery and redirect, before exchanging a valid code. The CLI reports recognized provider error codes with safe hints:

| Error | Check |
| --- | --- |
| `invalid_scope` | Enable the requested scopes in this exact Clerk OAuth application's settings; instance discovery advertising a scope is not the same as assigning it to the application |
| `access_denied` | Complete/allow consent, or inspect the authorization server's policy; this code does not necessarily mean the user clicked Deny |
| `unauthorized_client` | Enable Public and the appropriate authorization-code flow for the OAuth application |
| `invalid_request` | Check client ID/instance, scopes, PKCE configuration and exact Redirect URI |

Unknown provider error strings and all raw descriptions are intentionally hidden. After updating the CLI, rerun `node dist/cli.js auth login` and use the returned recognized code to narrow the dashboard change. Share only the error text when troubleshooting, never the complete callback URL, authorization code or tokens. A successful public discovery check is not successful user authentication.

Reusable libraries are exported as `vehicle-search-harness/common` and `vehicle-search-harness/vehicles`. See [reuse documentation](../common/reusing-common.md). The existing executable names, configuration values and credential context are unchanged by the folder refactor.
