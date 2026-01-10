// lib/storage/savedProjects.ts

import type { ProjectDraft } from "./projectDraft";
import { sanitizeProjectDraft } from "./projectDraft";

export interface SavedProjectIndexItem {
  id: string;
  projectName: string;
  standard: string;
  units: string;
  createdAt: string;
  updatedAt: string;
}

const INDEX_KEY = "tankcalc:savedProjects:index";
const DATA_PREFIX = "tankcalc:savedProjects:data:";

function readIndex(): SavedProjectIndexItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedProjectIndexItem[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(items: SavedProjectIndexItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(items));
}

export function listSavedProjects(): SavedProjectIndexItem[] {
  return readIndex().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function loadSavedProject(id: string): ProjectDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DATA_PREFIX + id);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return sanitizeProjectDraft(parsed);
  } catch {
    return null;
  }
}

export function deleteSavedProject(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DATA_PREFIX + id);

  const idx = readIndex().filter((x) => x.id !== id);
  writeIndex(idx);
}

/**
 * Save snapshot draft jadi “project”.
 * Kalau existingId ada -> update.
 */
export function saveProjectSnapshot(draft: ProjectDraft, existingId?: string): string {
  if (typeof window === "undefined") return existingId ?? `proj-${Date.now()}`;

  const now = new Date().toISOString();
  const id = existingId ?? draft.savedProjectId ?? `proj-${Date.now()}`;

  const snapshot: ProjectDraft = {
    ...draft,
    savedProjectId: id,
    updatedAt: now,
  };

  window.localStorage.setItem(DATA_PREFIX + id, JSON.stringify(snapshot));

  const index = readIndex();
  const item: SavedProjectIndexItem = {
    id,
    projectName: draft.projectName,
    standard: draft.recommendedStandard,
    units: draft.units,
    createdAt: draft.createdAt,
    updatedAt: now,
  };

  const existing = index.find((x) => x.id === id);
  const next = existing
    ? index.map((x) => (x.id === id ? item : x))
    : [item, ...index];

  writeIndex(next);
  return id;
}
