# Vehicle Search CLI and OpenCode Harness — Design

## Intent

Build a TypeScript command-line client that lets an authenticated user search a vehicle catalog, search insured-car records, or combine both searches. OpenCode will invoke the same CLI through shell commands and consume JSON output. A local mock API will make the proposed contract demonstrable before the real services are connected.

## Goals

- Provide a small CLI with browser-based Clerk login and read-only GET searches.
- Authenticate through Clerk-hosted OAuth using a public client and PKCE; send Clerk OAuth access tokens as `Authorization: Bearer` to both APIs.
- Support exact and match search modes, filters combined with AND, JSON output, and pagination.
- Join insured-car records to catalog details through `vehicleId`.
- Include a local mock implementation of both APIs and setup examples for OpenCode shell use.

## Non-goals

- Implement or modify the production vehicle or insured-car APIs.
- Create an OpenCode MCP server or custom tool; OpenCode will call the CLI using shell commands.
- Support writes, updates, deletes, or non-GET operations.
- Add purchase-price minimum/maximum filtering.

## Approaches considered

1. **CLI-only implementation:** simplest package, but search, auth, and API behavior are harder to reuse or demo separately.
2. **Shared TypeScript client + CLI + mock APIs (selected):** reusable API/auth modules underpin the CLI and local mock servers; slightly more structure, but one implementation serves both human shell use and OpenCode and demonstrates the proposed API contract.
3. **OpenCode MCP integration:** direct model tools are possible, but the user chose shell commands, so MCP is out of scope.

## Decisions from discussion

- **Language/runtime:** TypeScript on Node.js 24.
- **CLI and OpenCode interface:** shell commands; JSON is the default output.
- **API topology:** separate vehicle-catalog and insured-car APIs, each with its own configurable base URL. They may be hosted separately.
- **Authentication:** Clerk-hosted SSO using OAuth authorization code + PKCE, a loopback callback, and bearer access tokens from Clerk. All SSO users may access both read-only APIs.
- **Search behavior:** all supplied filters are ANDed. Exact and match modes are available. Match mode uses case-insensitive partial matching for brand and model; identifiers such as VIN, registration number, plate number, customer number, policy number, and vehicle ID remain exact.
- **Pagination:** `--page` and `--limit`, default limit 20.
- **Catalog keys and attributes:** `vehicleId` is an API identifier. `registrationNumber` is a separate unique catalog key, exactly eight alphanumeric characters. `plateNumber` is distinct and can look like `ZH 638871`. `vehicleType` is one field with examples such as passenger vehicle and SUV. Other discussed catalog attributes are VIN, brand, model, model year, first-registration date, seats, and a date-dependent purchase-price indication.
- **Price:** one purchase price in CHF is returned for a selected date; the date defaults to today. No price range filter.
- **Combined search:** search insured-car records first, then enrich each result with the catalog vehicle identified by `vehicleId`.
- **Demo:** include a local mock API for both services.

## Proposed contract (builder call; adapt if real APIs differ)

### Vehicle catalog API

- `GET /vehicles`
- `GET /vehicles/{vehicleId}`
- Query filters: `vehicleId`, `vin`, `registrationNumber`, `brand`, `model`, `vehicleType`, `modelYear`, `firstRegistrationDate`, `seats`, `asOfDate`, `mode`, `page`, and `limit`.
- `mode=exact|match`; match broadens only brand/model text filters to case-insensitive substring matching. Other filters remain exact.
- Every supplied filter applies together.
- Vehicle results include `vehicleId`, `vin`, `registrationNumber`, brand/model, type, year, first-registration date, seats, and `purchasePrice: { amount, currency, asOfDate }`.

### Insured-car API

- `GET /insured-vehicles`
- Query filters: `plateNumber`, `customerNumber`, `policyNumber`, `vehicleId`, `page`, and `limit`.
- Filters use exact matching and are ANDed.
- Each record includes insured record ID, plate number, customer number, policy number, and vehicle ID.

### Combined search

- The CLI calls `GET /insured-vehicles` with insured filters and then resolves each `vehicleId` through the catalog API.
- Catalog filters apply after vehicle enrichment, so all insured and catalog filters apply to the final joined record. Pagination applies to the final filtered results; the client may fetch additional insured pages to fill a requested page.
- Combined output contains the insured record and either its vehicle details or a structured `vehicleLookupError`; one missing catalog vehicle does not discard other insured results.

### CLI shape

- `vehicle-cli auth login|logout|status`
- `vehicle-cli vehicles search [filters] [--mode exact|match] [--as-of YYYY-MM-DD] [--page N] [--limit N]`
- `vehicle-cli insured search [filters] [--page N] [--limit N]`
- `vehicle-cli combined search [insured filters] [catalog filters] [--mode exact|match] [--as-of YYYY-MM-DD] [--page N] [--limit N]`
- Commands emit JSON to stdout by default; diagnostics go to stderr. Exit codes distinguish validation, authentication, network, and API errors.
- Base URLs and Clerk OAuth configuration are environment/config values, never hard-coded.

## Security and operations

- Generate and validate OAuth `state` and PKCE S256 values; bind the one-shot callback to `127.0.0.1`. The port is OS-selected by default; a later user-requested configuration allows a fixed port for exact redirect registration.
- Do not place access tokens in command-line arguments, logs, or callback URLs.
- Store tokens in the OS credential store when available; provide a documented owner-only file fallback.
- Refresh access tokens when needed and clear/revoke credentials on logout where Clerk supports it.
- The mock services are local development aids only and do not represent production authorization.
- Set request timeouts, redact bearer tokens from diagnostics, and return stable JSON errors.

## Builder choices

- Proposed route names and wire schemas are illustrative because no OpenAPI document or real route contract exists yet.
- Vehicle type values will be represented as normalized strings; sample values will include `passenger_vehicle` and `suv`.
- The mock catalog will include purchase-price history with effective dates so `asOfDate` returns one valid price.
- Separate environment variables will configure the two API base URLs, even if the real deployment later uses one host.
- Both APIs will receive the same Clerk OAuth bearer token by default; issuer, audience, and requested scopes will be configurable to match the eventual resource-server validation setup.
- The contract will document plate formatting as a string, preserving spaces and letters; the mock will normalize for comparison by trimming and uppercasing.

## Implementation tracking

See [current implementation status](2026-11-05-implementation-status.md) and [build/install guide](HowToBuild-andInstall.md) for implemented configuration, wire envelopes, limits and verification. The original design above remains the target; production Clerk/API acceptance is separate from local mock verification.

User-approved follow-up: `CLERK_OAUTH_CALLBACK_PORT` selects an optional fixed port (1–65535). The repository uses `8765`, giving `http://127.0.0.1:8765/callback`; an occupied fixed port fails without falling back.
