"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  loadProjectDraft,
  type ProjectDraft,
  type DesignCaseKey,
} from "../../../../lib/storage/projectDraft";

import { runShellThickness } from "../../../../lib/engine/shellThickness";

function StepPill({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "next";
}) {
  const cls =
    state === "done"
      ? "bg-white/85 text-[rgb(var(--re-green))]"
      : state === "active"
        ? "bg-white shadow-sm text-[rgb(var(--re-blue))]"
        : "bg-white/60 re-muted";

  return (
    <span className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 ${cls}`}>
      {label}
    </span>
  );
}

const CASE_NAME: Record<DesignCaseKey, string> = {
  operating: "Operating",
  hydrotest: "Hydrotest",
  empty_wind: "Empty + Wind",
  empty_seismic: "Empty + Seismic",
  vacuum: "Vacuum",
  steamout: "Steam-out",
};

function getActiveCases(draft: ProjectDraft): DesignCaseKey[] {
  const dc = draft.designCases;
  if (!dc) return ["operating"];
  return (Object.keys(dc) as DesignCaseKey[]).filter((k) => dc[k]);
}

export default function NewProjectResultsPage() {
  const [draft, setDraft] = useState<ProjectDraft | null>(null);

  useEffect(() => {
    setDraft(loadProjectDraft());
  }, []);

  const thkUnit = useMemo(() => (draft?.units === "US" ? "in" : "mm"), [draft]);

  const calc = useMemo(() => {
    if (!draft) return null;
    if (!draft.geometry || !draft.service || !draft.materials) return null;

    const activeCases = getActiveCases(draft);

    const activeCaseInputs = activeCases.map((k) => ({
      key: k,
      liquidHeight: draft.service?.liquidHeights?.[k] ?? 0,
    }));

    return runShellThickness({
      units: draft.units,
      standard: draft.recommendedStandard === "API_620" ? "API_620" : "API_650",
      diameter: draft.geometry.diameter,
      courses: draft.geometry.courses,
      specificGravity: draft.service.specificGravity,
      corrosionAllowance: draft.service.corrosionAllowance,
      designPressure: draft.envelope.designPressure,
      allowableStressDesign: draft.materials.allowableStressDesign,
      allowableStressTest: draft.materials.allowableStressTest,
      jointEfficiency: draft.materials.jointEfficiency,
      minNominalThickness: draft.materials.minNominalThickness,
      adoptedThicknesses: draft.materials.courseNominalThickness,
      activeCases: activeCaseInputs,
    });
  }, [draft]);

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!draft) m.push("Draft project tidak ditemukan. Kembali ke Step 0.");
    if (draft && !draft.geometry) m.push("Step 2 belum lengkap: geometry kosong.");
    if (draft && !draft.service) m.push("Step 2 belum lengkap: service kosong.");
    if (draft && !draft.materials) m.push("Step 3 belum lengkap: materials kosong.");
    return m;
  }, [draft]);

  const fmt = (x: number) => {
    if (!Number.isFinite(x)) return "∞";
    return draft?.units === "US" ? x.toFixed(4) : x.toFixed(2);
  };

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <div className="h-14 w-40 md:h-16 md:w-52 rounded-3xl bg-white/90 border border-black/10 shadow-sm flex items-center justify-center px-3">
                <Image
                  src="/re-logo.png"
                  alt="Rekayasa Engineering"
                  width={560}
                  height={200}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-xs md:text-sm re-muted">Projects • New</div>
              <div className="mt-1 text-sm re-muted">Step 4 — Shell Thickness Results</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects/new/materials"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali (Step 3)
            </Link>
          </div>
        </div>

        {/* STEPPER */}
        <div className="mt-6 flex flex-wrap gap-2">
          <StepPill label="Step 0 • Initiation" state="done" />
          <StepPill label="Step 1 • Config & Cases" state="done" />
          <StepPill label="Step 2 • Service & Geometry" state="done" />
          <StepPill label="Step 3 • Materials" state="done" />
          <StepPill label="Step 4 • Results" state="active" />
        </div>

        {/* CONTENT */}
        <div className="mt-8 re-card rounded-[2rem] p-7 md:p-9">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="text-xs re-muted">Ringkasan hasil</div>
              <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
                Shell Thickness — OK/NOT OK per Course
              </h1>
              <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
                Output ini fokus pada perhitungan kebutuhan tebal shell per course dan menentukan governing case.
              </p>
            </div>

            {draft ? (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-4 text-sm re-muted">
                <div><strong className="text-[rgb(var(--re-ink))]">Project:</strong> {draft.projectName}</div>
                <div><strong className="text-[rgb(var(--re-ink))]">Standard:</strong> {draft.recommendedStandard}</div>
                <div><strong className="text-[rgb(var(--re-ink))]">Units:</strong> {draft.units}</div>
              </div>
            ) : null}
          </div>

          {missing.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-white/80 p-5">
              <div className="text-sm font-semibold text-red-600">Data belum lengkap</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                {missing.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {calc ? (
            <>
              <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Metode & catatan</div>
                <div className="mt-2 text-sm re-muted">
                  <div><strong>Method:</strong> {calc.method}</div>
                  <ul className="mt-2 list-disc pl-5">
                    {calc.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-[900px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {["Course", "Governing case", `t_required (${thkUnit})`, `t_adopted (${thkUnit})`, "Utilization", "Status"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-bold re-muted px-4 py-3 border-b border-black/10 bg-white/60"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calc.results.map((r) => (
                      <tr key={r.courseNo} className="bg-white/70">
                        <td className="px-4 py-3 text-sm font-semibold text-[rgb(var(--re-ink))] border-b border-black/10">
                          {r.courseNo}
                        </td>
                        <td className="px-4 py-3 text-sm re-muted border-b border-black/10">
                          {CASE_NAME[r.governingCase]}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[rgb(var(--re-blue))] border-b border-black/10">
                          {fmt(r.tRequired)}
                        </td>
                        <td className="px-4 py-3 text-sm re-muted border-b border-black/10">
                          {fmt(r.tAdopted)}
                        </td>
                        <td className="px-4 py-3 text-sm re-muted border-b border-black/10">
                          {Number.isFinite(r.utilization) ? r.utilization.toFixed(3) : "∞"}
                        </td>
                        <td
                          className={[
                            "px-4 py-3 text-sm font-semibold border-b border-black/10",
                            r.status === "OK" ? "text-[rgb(var(--re-green))]" : "text-red-600",
                          ].join(" ")}
                        >
                          {r.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                  Detail per case (per course)
                </div>
                <p className="mt-2 text-sm re-muted">
                  Untuk debugging/review, Anda bisa lihat t_required per design case (sebelum dipilih governing).
                </p>

                <div className="mt-4 space-y-3">
                  {calc.results.map((r) => (
                    <div key={r.courseNo} className="rounded-2xl border border-black/10 bg-white/70 p-4">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Course {r.courseNo}
                      </div>
                      <div className="mt-2 text-sm re-muted">
                        {Object.entries(r.requiredByCase).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-3">
                            <span>{CASE_NAME[k as DesignCaseKey]}</span>
                            <span className="font-semibold text-[rgb(var(--re-blue))]">
                              {fmt(v)} {thkUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/projects/new/materials"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Edit Materials (Step 3)
            </Link>

            <Link
              href="/projects/new/service"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Edit Service & Geometry (Step 2)
            </Link>

            <Link
              href="/"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
