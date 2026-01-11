"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ✅ FIX PATH (4 level, bukan 3)
import {
  loadProjectDraft,
  updateProjectDraft,
  type ProjectDraft,
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
    <span
      className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 ${cls}`}
    >
      {label}
    </span>
  );
}

const fmt = (x: number, dp = 2) => {
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(dp);
};

export default function ResultsPage() {
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const d = loadProjectDraft();
    setDraft(d);
    setHydrated(true);
  }, []);

  const calc = useMemo(() => {
    if (!draft) return null;

    // Guard minimal data
    if (!draft.geometry || !draft.service || !draft.materials) return null;

    const units = draft.units;
    const standard = draft.recommendedStandard ?? "API_650";

    const diameter = draft.geometry.diameter ?? NaN;
    const courses = draft.geometry.courses ?? [];

    const specificGravity = draft.service.specificGravity ?? 1;
    const corrosionAllowance = draft.service.corrosionAllowance ?? (units === "US" ? 0.125 : 2);

    const designPressure = draft.envelope?.designPressure ?? 0;

    const allowableStressDesign = draft.materials.allowableStressDesign ?? (units === "US" ? 20000 : 137);
    const allowableStressTest = draft.materials.allowableStressTest ?? (units === "US" ? 21000 : 154);
    const jointEfficiency = draft.materials.jointEfficiency ?? 0.85;

    const minNominalThickness = draft.materials.minNominalThickness ?? (units === "US" ? 0.25 : 5);

    const adoptedThicknesses = draft.materials.adoptedThicknesses ?? [];

    const activeCases = (draft.designCases
      ? (Object.keys(draft.designCases) as any[]).filter((k) => draft.designCases?.[k])
      : ["operating"]
    ).map((k) => ({
      key: k,
      liquidHeight: draft.service?.liquidHeights?.[k] ?? 0,
    }));

    try {
      return runShellThickness({
        units,
        standard: standard as any,

        diameter,
        courses,

        specificGravity,
        corrosionAllowance,

        designPressure,

        allowableStressDesign,
        allowableStressTest,
        jointEfficiency,

        minNominalThickness,
        adoptedThicknesses,

        activeCases,
      });
    } catch {
      return null;
    }
  }, [draft]);

  const handleSaveProject = () => {
    if (!draft) return;
    updateProjectDraft({ savedAt: new Date().toISOString() as any });
    alert("Project disimpan (local storage).");
  };

  const handleExportCSV = () => {
    if (!calc) return;
    const rows = [
      ["Course", "GoverningCase", "t_calc", "t_required", "t_adopted", "Utilization", "Status"].join(","),
      ...calc.results.map((r) => {
        const unit = calc.units === "SI" ? "mm" : "in";
        const tcalc = r.tCalcGoverning;
        return [
          r.courseNo,
          r.governingCase,
          fmt(tcalc, 4),
          fmt(r.tRequired, 4),
          fmt(r.tAdopted, 4),
          fmt(r.utilization, 4),
          r.status,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tankcalc_shell_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print(); // paling aman dulu: print dialog → Save as PDF
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm re-muted">Memuat hasil...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm text-red-600 font-semibold">Draft project tidak ditemukan.</div>
            <div className="mt-4">
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

  if (!calc) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm text-red-600 font-semibold">
              Data belum lengkap untuk menghitung shell thickness.
            </div>
            <div className="mt-3 text-sm re-muted">
              Pastikan Step 0–3 sudah terisi: envelope, service, geometry, dan materials.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
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
            </div>
          </div>
        </div>
      </main>
    );
  }

  const thicknessUnit = calc.units === "SI" ? "mm" : "in";

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

            <Link
              href="/projects/saved"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Saved Projects
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

        {/* TITLE + SUMMARY */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-xs re-muted">Ringkasan hasil</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
              Shell Thickness — OK/NOT OK per Course
            </h1>
            <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
              Output fokus pada <strong>t_calc</strong> (hasil rumus) vs <strong>t_required</strong> (sesudah min thickness + CA),
              governing case, dan status OK/NOT OK.
            </p>

            {/* ACTIONS */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Actions</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-[rgb(var(--re-blue))] hover:opacity-95 transition"
                >
                  Save Project
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                >
                  Export PDF
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                >
                  Export Excel (CSV)
                </button>
              </div>

              <div className="mt-3 text-xs re-muted">
                PDF export memakai print dialog browser (pilih “Save as PDF”). Excel export berupa CSV.
              </div>
            </div>

            {/* METHOD NOTES */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Metode & catatan</div>
              <div className="mt-2 text-sm re-muted">
                <div className="font-semibold text-[rgb(var(--re-ink))]">Method: {calc.method}</div>
                <ul className="mt-2 list-disc pl-5">
                  {calc.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TABLE */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white/70">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/80">
                    <tr className="text-left text-[rgb(var(--re-ink))]">
                      <th className="px-4 py-3 font-semibold">Course</th>
                      <th className="px-4 py-3 font-semibold">Governing case</th>
                      <th className="px-4 py-3 font-semibold">t_calc ({thicknessUnit})</th>
                      <th className="px-4 py-3 font-semibold">t_required ({thicknessUnit})</th>
                      <th className="px-4 py-3 font-semibold">t_adopted ({thicknessUnit})</th>
                      <th className="px-4 py-3 font-semibold">Utilization</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/10">
                    {calc.results.map((r) => (
                      <tr key={r.courseNo} className="hover:bg-white/60 transition">
                        <td className="px-4 py-3 font-semibold text-[rgb(var(--re-ink))]">{r.courseNo}</td>
                        <td className="px-4 py-3 re-muted">{r.governingCase}</td>

                        <td className="px-4 py-3 text-[rgb(var(--re-blue))] font-semibold">
                          {fmt(r.tCalcGoverning, 2)}
                        </td>

                        <td className="px-4 py-3 text-[rgb(var(--re-blue))] font-semibold">
                          {fmt(r.tRequired, 2)}
                          {r.isMinControlled ? (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-black/10 bg-white/80 text-[rgb(var(--re-orange))]">
                              min thickness
                            </span>
                          ) : null}
                        </td>

                        <td className="px-4 py-3 re-muted">{fmt(r.tAdopted, 2)}</td>
                        <td className="px-4 py-3 re-muted">{fmt(r.utilization, 3)}</td>

                        <td className="px-4 py-3">
                          {r.status === "OK" ? (
                            <span className="font-semibold text-[rgb(var(--re-green))]">OK</span>
                          ) : (
                            <span className="font-semibold text-red-600">NOT OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOT ACTIONS */}
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

          {/* RIGHT SUMMARY CARD */}
          <div className="lg:col-span-4 re-card rounded-[2rem] p-6 md:p-7">
            <div className="text-xs re-muted">Ringkasan project</div>
            <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">Project</div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div><strong className="text-[rgb(var(--re-ink))]">Project:</strong> {draft.projectName}</div>
              <div><strong className="text-[rgb(var(--re-ink))]">Standard:</strong> {draft.recommendedStandard}</div>
              <div><strong className="text-[rgb(var(--re-ink))]">Units:</strong> {draft.units}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div className="font-semibold text-[rgb(var(--re-ink))]">Kenapa t_required bisa “rata”?</div>
              <div className="mt-2">
                Karena engine apply: <strong>t_required = max(t_calc, minNominal + CA)</strong>.
                Kalau semua <strong>t_calc</strong> lebih kecil dari min, hasilnya bakal sama (ketahan min).
              </div>
              <div className="mt-3">
                Di tabel, lo bisa bedain:
                <ul className="mt-2 list-disc pl-5">
                  <li><strong>t_calc</strong>: hasil rumus (trend fisika)</li>
                  <li><strong>t_required</strong>: hasil final setelah aturan minimum</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
