# Common and vehicles source separation

**Goal:** Reuse auth, credentials, HTTP, environment loading, errors, validation and pagination without importing vehicle domain code.
**Scope:** Structural refactor with existing commands, configuration names, credential context and package root/mock imports preserved. No services are started for verification.

- [x] Split `src/core.ts` into common errors/validation/pagination and vehicle types/search.
- [x] Move auth/credentials/http/env/URL+OAuth configuration into `src/common`; place catalog/insured API configuration and configuration checks in `src/vehicles`.
- [x] Move the vehicle client, fixtures, mock routes and CLI composition into `src/vehicles`; leave thin root CLI/mock executable entry points.
- [x] Publish `/common` and `/vehicles` library exports, retaining root client and `/mock` imports.
- [x] Update recursive TypeScript compilation, error-handling checker, scripts and test imports.
- [x] Verify independent common imports, no common-to-vehicles imports, side-effect-free library imports, service-free behavior tests and installed package compatibility. Update structure/reuse documentation and release.

Common classes keep constructor-based configuration so another domain can supply its own settings and store. Existing environment-adapter names remain compatible. Library barrels exclude executable CLI composition. Mock server startup is explicit; importing its module does not listen on a port.

Verification: build and recursive warning check passed; 20 service-free tests passed; a separate temporary npm consumer imported all public entry points and compiled strict TypeScript declarations. Global CLI and release tarball refreshed; installed version/config checks passed. Independent review found no important regressions. No services were started.
