# Reusing the vehicle client

Use these exports for catalog searches, insured records and joined results:

```ts
import { VehicleClient } from "vehicle-search-harness/vehicles";
import type { Vehicle, Insured, Joined } from "vehicle-search-harness/vehicles";
import { startMock } from "vehicle-search-harness/mock";
```

The original `import { VehicleClient } from "vehicle-search-harness"` remains supported. `/vehicles` additionally exposes search validation, API configuration and mock helpers. Neither `/vehicles` nor `/mock` starts a server when imported; call `startMock` explicitly. CLI composition is excluded from these library exports.

Vehicle records, filters, fixtures and joins live in `src/vehicles`. The associated client, search, CLI/configuration, integration and architecture tests live in `tests/vehicles`. Packaging/OpenCode verification drivers and vehicle-fixture evidence checks live in `scripts/vehicles`.

Shared OAuth, HTTP, credentials and generic utilities are documented in the [common reuse guide](../common/reusing-common.md). See [installation/configuration](HowToBuild-andInstall.md) for the vehicle CLI and mock APIs.
