import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { resolve } from "node:path";
import { AppError } from "./core.js";
import { apiConfig, authConfig, safeUrl } from "./config.js";
export function loadEnvironment(explicitPath?: string) {
  const path = resolve(explicitPath ?? ".env");
  try {
    const parsed = parseEnv(readFileSync(path, "utf8"));
    for (const [key, value] of Object.entries(parsed))
      if (process.env[key] === undefined) process.env[key] = value;
    return { path, loaded: true };
  } catch (error) {
    if (!explicitPath && (error as NodeJS.ErrnoException).code === "ENOENT")
      return { path, loaded: false };
    throw new AppError(
      "VALIDATION",
      "Cannot read environment file; check its path and permissions",
    );
  }
}
export function checkConfiguration(env: NodeJS.ProcessEnv) {
  const missing = [
    "VEHICLE_CATALOG_URL",
    "VEHICLE_INSURED_URL",
    ...(env.VEHICLE_MOCK === "1"
      ? []
      : ["CLERK_OAUTH_ISSUER", "CLERK_OAUTH_CLIENT_ID"]),
  ].filter((key) => !env[key]?.trim());
  if (missing.length)
    throw new AppError(
      "VALIDATION",
      `Missing configuration: ${missing.join(", ")}`,
    );
  apiConfig(env);
  const config = authConfig(env);
  if (config.issuer) safeUrl(config.issuer, "CLERK_OAUTH_ISSUER");
  if (config.issuer && new URL(config.issuer).search)
    throw new AppError(
      "VALIDATION",
      "OAuth issuer must not have query parameters",
    );
  if (
    env.VEHICLE_CREDENTIAL_STORE &&
    !["keyring", "file"].includes(env.VEHICLE_CREDENTIAL_STORE)
  )
    throw new AppError(
      "VALIDATION",
      "VEHICLE_CREDENTIAL_STORE must be keyring or file",
    );
  return {
    valid: true,
    mock: env.VEHICLE_MOCK === "1",
    clerk: {
      issuerConfigured: !!config.issuer?.trim(),
      clientIdConfigured: !!config.clientId?.trim(),
      scopesConfigured: !!config.scopes?.trim(),
      audienceConfigured: !!config.audience?.trim(),
      redirectUri:
        config.callbackPort === undefined
          ? null
          : `http://127.0.0.1:${config.callbackPort}/callback`,
    },
    apis: { catalogConfigured: true, insuredConfigured: true },
  };
}
