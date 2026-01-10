// lib/api650/nominalCapacity.ts

export type Units = "SI" | "US";
export type CapacityUnit = "m3" | "bbl";

export function capacityUnitFor(units: Units): CapacityUnit {
  return units === "SI" ? "m3" : "bbl";
}

/**
 * Nominal capacity berbasis silinder.
 * - SI: m³ (D dan H dalam meter)
 * - US: barrels (D dan H dalam ft), 1 bbl = 5.615 ft³
 */
export function calcNominalCapacity(units: Units, D: number, H: number): number {
  if (!(D > 0) || !(H > 0)) return NaN;

  const vol = (Math.PI / 4) * D * D * H; // SI: m³, US: ft³
  if (units === "SI") return vol;

  // US -> barrels
  return vol / 5.615;
}

export function formatCapacity(units: Units, cap: number): string {
  if (!Number.isFinite(cap)) return "-";
  if (units === "SI") return `${cap.toFixed(0)} m³`;
  return `${cap.toFixed(0)} bbl`;
}
