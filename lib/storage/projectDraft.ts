// lib/storage/projectDraft.ts

import type {
  EnvelopeInput,
  StandardDecision,
  UnitKey,
  StandardKey,
} from "../domain/standardSelector";

export type RoofType = "fixed_cone" | "fixed_dome" | "open_top" | "floating_roof";
export type BottomType = "flat" | "annular";
export type AnchorageType = "anchored" | "unanchored";

export interface TankConfigurationDraft {
  tankForm: "vertical_cylindrical";
  roofType: RoofType;
  bottomType: BottomType;
  anchorage: AnchorageType;
  notes?: string;
}

export type DesignCaseKey =
  | "operating"
  | "hydrotest"
  | "empty_wind"
  | "empty_seismic"
  | "vacuum"
  | "steamout";

export type DesignCasesDraft = Record<DesignCaseKey, boolean>;

export interface ProjectDraft {
  id: string;
  createdAt: string;
  updatedAt?: string;

  projectName: string;
  location?: string;

  units: UnitKey;

  envelope: EnvelopeInput;
  decision: StandardDecision;
  recommendedStandard: StandardKey;

  // Step 1 output
  tankConfig?: TankConfigurationDraft;
  designCases?: DesignCasesDraft;
}

const STORAGE_KEY = "tankcalc:projectDraft";

const sanitizeNumber = (x: unknown, fallback = 0) => {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
};

function sanitizeDraft(raw: any): ProjectDraft | null {
  if (!raw || typeof raw !== "object") return null;

  // Envelope: pastikan semua angka valid (hindari null akibat JSON dari NaN)
  const env = raw.envelope ?? {};
  const decision = raw.decision ?? {};
  const normalized = decision.normalized ?? {};

  const draft: ProjectDraft = {
    id: String(raw.id ?? `draft-${Date.now()}`),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,

    projectName: String(raw.projectName ?? ""),
    location: raw.location ? String(raw.location) : undefined,

    units: (raw.units === "US" ? "US" : "SI") as UnitKey,

    envelope: {
      units: (raw.units === "US" ? "US" : "SI") as UnitKey,
      designPressure: sanitizeNumber(env.designPressure, 0),
      designVacuum: sanitizeNumber(env.designVacuum, 0),
      tMin: sanitizeNumber(env.tMin, 0),
      tMax: sanitizeNumber(env.tMax, 0),
    },

    decision: {
      recommended: decision.recommended ?? raw.recommendedStandard ?? "API_650",
      confidence: decision.confidence ?? "Sedang",
      reasons: Array.isArray(decision.reasons) ? decision.reasons : [],
      warnings: Array.isArray(decision.warnings) ? decision.warnings : [],
      normalized: {
        designPressure_kPa: sanitizeNumber(normalized.designPressure_kPa, 0),
        designVacuum_kPa: sanitizeNumber(normalized.designVacuum_kPa, 0),
        tMin_C: sanitizeNumber(normalized.tMin_C, 0),
        tMax_C: sanitizeNumber(normalized.tMax_C, 0),
      },
    },

    recommendedStandard: raw.recommendedStandard ?? decision.recommended ?? "API_650",
    tankConfig: raw.tankConfig,
    designCases: raw.designCases,
  };

  if (!draft.projectName) return null;
  return draft;
}

export function saveProjectDraft(draft: ProjectDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadProjectDraft(): ProjectDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return sanitizeDraft(parsed);
  } catch {
    return null;
  }
}

export function updateProjectDraft(patch: Partial<ProjectDraft>): ProjectDraft | null {
  const existing = loadProjectDraft();
  if (!existing) return null;

  const merged: ProjectDraft = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  saveProjectDraft(merged);
  return merged;
}

export function clearProjectDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
