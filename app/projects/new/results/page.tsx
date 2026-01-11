"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { loadProjectDraft } from "../../../../lib/storage/projectDraft";
import { runShellThickness } from "../../../../lib/engine/shellThickness";
import { saveCurrentDraftAsProject } from "../../../../lib/storage/savedProjects";

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

const fmt = (x: number, dp = 2) => {
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(dp);
};

export default function ResultsPage() {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    setDraft(loadProjectDraft());
    setHydrated(true);
  }, []);

  const calc = useMemo(() => {
    if (!draft) return null;
    if (!draft.geometry || !draft.service || !draft.materials) return null;

    const units = draft.units as "SI" | "US";
    const standard = (draft.recommendedStandard ?? "API_650") as "API_650" | "API_620";

    const diameter = Number(draft.geometry.diameter ?? NaN);
    const courses = (draft.geometry.courses ?? []) as number[];

    if (!Number.isFinite(diameter) || diameter <= 0) return null;
    if (!Array.isArray(courses) || courses.length === 0) return null;

    const specificGravity = Number(draft.service.specificGravity ?? 1);
    const corrosionAllowance = Number(draft.service.corrosionAllowance ?? (units === "US" ? 0.125 : 2));

    const designPressure = Number(draft.envelope?.designPressure ?? 0);

    const allowableStressDesign = Number(draft.materials.allowableStressDesign ?? (units === "US" ? 20000 : 137));
    const allowableStressTest = Number(draft.materials.allowableStressTest ?? allowableStressDesign);
    const jointEfficiency = Number(draft.materials.jointEfficiency ?? 0.85);
    const minNominalThickness = Number(draft.materials.minNominalThickness ?? (units === "US" ? 0.25 : 6));

    // ✅ ini yang bener sesuai schema lo:
    let adoptedThicknesses = Array.isArray(draft.materials.courseNominalThickness)
      ? draft.materials.courseNominalThickness.map((x: any) => Number(x))
      : [];

    // kalau belum diisi / mismatch, fallback supaya engine tetap jalan
    const minWithCA = minNominalThickness + corrosionAllowance;
    if (adoptedThicknesses.length !== courses.length) {
      adoptedThicknesses = Array.from({ length: courses.length }, () => minWithCA);
    }

    const activeCaseKeys = draft.designCases
      ? (Object.keys(draft.designCases) as any[]).filter((k) => draft.designCases?.[k])
      : ["operating"];

    const liquidHeights = draft.service?.liquidHeights ?? {};
    const activeCases = activeCaseKeys.map((k) => ({
      key: k,
      liquidHeight: Number(liquidHeights?.[k] ?? 0),
    }));

    return runShellThickness({
      units,
      standard,
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
  }, [draft]);

  const thicknessUnit = calc?.units === "SI" ? "mm" : "in";

  const handleSaveProject = () => {
    const id = saveCurrentDraftAsProject();
    if (!id) {
      alert("Draft project tidak ditemukan untuk disimpan.");
      return;
    }
    alert("Project berhasil disimpan.");
    router.push("/projects/saved");
  };

  const handleExportCSV = () => {
    if (!calc) return;

    const rows = [
      ["Course", "GoverningCase", `t_calc(${thicknessUnit})`, `t_required(${thicknessUnit})`, `t_adopted(${thicknessUnit})`, "Utilization", "Status"].join(","),
      ...calc.results.map((r) =>
        [
          r.courseNo,
          r.governingCase,
          fmt(r.tCalc, 4),
          fmt(r.tRequired, 4),
          fmt(r.tAdopted, 4),
          fmt(r.utilization, 4),
          r.status,
        ].join(",")
      ),
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
    window.print();
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
              Pastikan Step 0–3 sudah terisi: service, geometry, dan materials.
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-8 re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-xs re-muted">Ringkasan hasil</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
              Shell Thickness — OK/NOT OK per Course
            </h1>

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
                PDF export pakai print dialog browser (Save as PDF). Excel export berupa CSV.
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
                          {fmt(r.tCalc, 2)}
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

            {/* QUICK EXPLAIN */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div className="font-semibold text-[rgb(var(--re-ink))]">Kenapa nilai bisa “bulet” / rata?</div>
              <div className="mt-2">
                Karena engine apply <strong>minimum nominal thickness</strong>:
                <strong> t_required = max(t_calc, minNominal + CA)</strong>.
                Jadi kalau <strong>t_calc</strong> kecil (khususnya course atas), dia mentok di minimum.
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 re-card rounded-[2rem] p-6 md:p-7">
            <div className="text-xs re-muted">Ringkasan project</div>
            <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">Project</div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div><strong className="text-[rgb(var(--re-ink))]">Project:</strong> {draft.projectName}</div>
              <div><strong className="text-[rgb(var(--re-ink))]">Standard:</strong> {draft.recommendedStandard}</div>
              <div><strong className="text-[rgb(var(--re-ink))]">Units:</strong> {draft.units}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div className="font-semibold text-[rgb(var(--re-ink))]">Debug cepat</div>
              <div className="mt-2">
                Lihat kolom <strong>t_calc</strong> vs <strong>t_required</strong>.
                Kalau banyak yang ada badge <strong>min thickness</strong>, berarti minimum-nya yang “ngunci” hasil.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
