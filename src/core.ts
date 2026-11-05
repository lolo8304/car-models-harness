export type ErrorCode = "VALIDATION" | "AUTH" | "NETWORK" | "API" | "INTERNAL";
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}
export const exitCodes: Record<ErrorCode, number> = {
  VALIDATION: 2,
  AUTH: 3,
  NETWORK: 4,
  API: 5,
  INTERNAL: 1,
};
export function errorBody(error: unknown) {
  const e =
    error instanceof AppError
      ? error
      : new AppError("INTERNAL", "Unexpected internal error");
  return {
    error: {
      code: e.code,
      message: e.message,
      ...(e.status ? { status: e.status } : {}),
    },
  };
}
export interface PurchasePrice {
  amount: number;
  currency: "CHF";
  asOfDate: string;
}
export interface Vehicle {
  vehicleId: string;
  vin: string;
  registrationNumber: string;
  brand: string;
  model: string;
  vehicleType: string;
  modelYear: number;
  firstRegistrationDate: string;
  seats: number;
  purchasePrice: PurchasePrice;
}
export interface Insured {
  id: string;
  plateNumber: string;
  customerNumber: string;
  policyNumber: string;
  vehicleId: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
export interface Joined {
  insured: Insured;
  vehicle?: Vehicle;
  vehicleLookupError?: ReturnType<typeof errorBody>["error"];
}
export type Kind = "vehicles" | "insured" | "combined";
export type Search = Record<string, string | number> & {
  page: number;
  limit: number;
  mode?: string;
  asOfDate?: string;
};
export const catalogKeys = [
  "vehicleId",
  "vin",
  "registrationNumber",
  "brand",
  "model",
  "vehicleType",
  "modelYear",
  "firstRegistrationDate",
  "seats",
];
export const insuredKeys = [
  "plateNumber",
  "customerNumber",
  "policyNumber",
  "vehicleId",
];
export function today() {
  return new Date().toISOString().slice(0, 10);
}
export function dateValue(value: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new AppError(
      "VALIDATION",
      "Dates must be valid YYYY-MM-DD calendar dates",
    );
  }
  return value;
}
export function positiveInteger(
  value: string,
  name: string,
  max = Number.MAX_SAFE_INTEGER,
) {
  const n = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(n) || n < 1 || n > max)
    throw new AppError(
      "VALIDATION",
      `${name} must be an integer between 1 and ${max}`,
    );
  return n;
}
export function parseSearch(
  input: Record<string, unknown>,
  kind: Kind,
): Search {
  const keys =
    kind === "insured"
      ? insuredKeys
      : kind === "vehicles"
        ? catalogKeys
        : [...new Set([...catalogKeys, ...insuredKeys])];
  const allowed = new Set([
    ...keys,
    "page",
    "limit",
    ...(kind === "insured" ? [] : ["mode", "asOfDate"]),
  ]);
  const out: Search = { page: 1, limit: 20 };
  if (kind !== "insured")
    Object.assign(out, { mode: "exact", asOfDate: today() });
  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key))
      throw new AppError("VALIDATION", `Unknown filter: ${key}`);
    if (typeof value !== "string" && typeof value !== "number")
      throw new AppError("VALIDATION", `Invalid value for ${key}`);
    const text = String(value);
    if (!text.trim() || text.length > 1024)
      throw new AppError("VALIDATION", `Invalid value for ${key}`);
    if (["page", "limit", "modelYear", "seats"].includes(key)) {
      out[key] = positiveInteger(
        text,
        key,
        key === "limit"
          ? 1000
          : key === "modelYear"
            ? 9999
            : key === "seats"
              ? 1000
              : Number.MAX_SAFE_INTEGER,
      );
    } else if (key === "mode") {
      if (!["exact", "match"].includes(text))
        throw new AppError("VALIDATION", "mode must be exact or match");
      out[key] = text;
    } else if (key === "asOfDate" || key === "firstRegistrationDate")
      out[key] = dateValue(text);
    else if (key === "registrationNumber") {
      if (!/^[A-Za-z0-9]{8}$/.test(text))
        throw new AppError(
          "VALIDATION",
          "registrationNumber must contain exactly eight alphanumeric characters",
        );
      out[key] = text;
    } else out[key] = key === "plateNumber" ? text.trim().toUpperCase() : text;
  }
  if (!Number.isSafeInteger(out.page * out.limit))
    throw new AppError("VALIDATION", "Pagination exceeds supported range");
  return out;
}
export function matchesVehicle(vehicle: Partial<Vehicle>, search: Search) {
  return catalogKeys.every((key) => {
    const value = search[key];
    if (value === undefined) return true;
    const actual = vehicle[key as keyof Vehicle];
    if (search.mode === "match" && ["brand", "model"].includes(key))
      return String(actual ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase());
    return actual === value;
  });
}
export function paginate<T>(items: T[], search: Search): Page<T> {
  return {
    items: items.slice(
      (search.page - 1) * search.limit,
      search.page * search.limit,
    ),
    total: items.length,
    page: search.page,
    limit: search.limit,
  };
}
