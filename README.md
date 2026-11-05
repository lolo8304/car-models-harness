# Vehicle Search Harness

Node.js 24 TypeScript CLI for read-only catalog, insured-car and combined search. Includes two local HTTP mock APIs and a Clerk-compatible public-client OAuth/PKCE flow. OpenCode uses the same CLI through its shell tool; no MCP server is needed.

```sh
npm ci
npm test
npm run verify:install
```

- [Build, installation and configuration](HowToBuild-andInstall.md)
- [OpenCode shell connection](How-To-Connect-to-OpenCode.md)
- [Target design](docs/2026-11-05-vehicle-search-cli-design.md)
- [Implementation and verification status](docs/2026-11-05-implementation-status.md)
- [Repository structure](Project-Structure-and-Setup.md)

Local tests cover the mock services, CLI, bearer forwarding, combined pagination, OAuth lifecycle and secure file storage. Live Clerk login and production API access require your own configuration and have not been verified against a real service.

In OpenCode launched from this repository, use `/vehicle-search Find Tesla vehicles insured for customer C001`. The shell connection is verified against local mocks; see the [verification record](docs/verification/opencode-shell-2026-11-05.json).

Install the distributable npm package with `npm install --global ./release/vehicle-search-harness-0.1.0.tgz` after running `npm pack --pack-destination release` (create `release/` first). Then use `vehicle-cli` directly. Node.js 24+ is required; no services start during installation.

`npm run check:error-handling` checks maintained source/build scripts for explicit exceptions caught locally in the same function. It runs as part of `npm test` and does not start services.
