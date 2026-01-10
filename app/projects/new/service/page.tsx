"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  loadProjectDraft,
  updateProjectDraft,
  type ProjectDraft,
  type DesignCaseKey,
  type ServiceDraft,
  type GeometryDraft,
} from "../../../../lib/storage/projectDraft";

import {
  API650_DIAMETERS,
  getPresetsByUnits,
  getPresetByKey,
  inferPresetKeyFromCourses,
  type CoursePresetKey,
} from "../../../../lib/api650/typicalGeometry";

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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-5xl rounded-3xl re-card p-4 md:p-6 border border-black/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-lg font-semibold text-[rgb(var(--re-blue))]">{title}</div>
          <button
            type="button"
            className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/85 hover:bg-white transition"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 max-h-[75vh] overflow-auto rounded-2xl border border-black/10 bg-white/70 p-3">
          {children}
        </div>

        <div className="mt-3 text-xs re-muted leading-relaxed">
          Catatan: gambar tabel ini hanya referensi internal untuk pemilihan dimensi tipikal. Verifikasi tetap mengacu pada dokumen API 650 edisi yang dipakai.
        </div>
      </div>
    </div>
  );
}

const toNumberOrNaN = (s: string) => {
  if (s.trim() === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const CASE_LABEL: Record<DesignCaseKey, { title: string; hint: string }> = {
  operating: { title: "Operating", hint: "Kondisi operasi normal." },
  hydrotest: { title: "Hydrotest", hint: "Uji hidrostatik (umumnya lebih tinggi dari operating)." },
  empty_wind: { title: "Empty + Wind", hint: "Empty/minimum level terhadap angin (stabilitas)." },
  empty_seismic: { title: "Empty + Seismic", hint: "Empty/minimum level terhadap gempa (uplift/overturning)." },
  vacuum: { title: "Vacuum / External", hint: "Case khusus vacuum/external pressure (stability check)." },
  steamout: { title: "Steam-out / Cleaning", hint: "Case khusus operasi abnormal/pembersihan." },
};

function getActiveCases(draft: ProjectDraft): DesignCaseKey[] {
  const dc = draft.designCases;
  if (!dc) return ["operating"];
  return (Object.keys(dc) as DesignCaseKey[]).filter((k) => dc[k]);
}

export default function NewProjectServicePage() {
  const router = useRouter();

  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ===== Modal tabel =====
  const [showTable, setShowTable] = useState(false);

  // ===== Service =====
  const [storedProduct, setStoredProduct] = useState("");
  const [sg, setSg] = useState<string>("1");
  const [ca, setCa] = useState<string>("2"); // default SI

  const [liquidHeights, setLiquidHeights] = useState<Record<DesignCaseKey, string>>({
    operating: "",
    hydrotest: "",
    empty_wind: "0",
    empty_seismic: "0",
    vacuum: "0",
    steamout: "0",
  });

  // ===== Geometry berbasis tabel =====
  const [presetKey, setPresetKey] = useState<CoursePresetKey>("SI_1800");
  const [diameterSel, setDiameterSel] = useState<string>("");
  const [courseCountSel, setCourseCountSel] = useState<string>(""); // jumlah course

  useEffect(() => {
    const d = loadProjectDraft();
    setDraft(d);

    if (d) {
      // default by units
      if (d.units === "US") {
        setCa("0.125");
        setPresetKey("US_72");
      } else {
        setCa("2");
        setPresetKey("SI_1800");
      }

      // hydrate service
      if (d.service) {
        setStoredProduct(d.service.storedProduct ?? "");
        setSg(String(d.service.specificGravity ?? 1));
        setCa(String(d.service.corrosionAllowance ?? (d.units === "SI" ? 2 : 0.125)));

        setLiquidHeights((prev) => {
          const next = { ...prev };
          const lh = d.service?.liquidHeights ?? {};
          (Object.keys(next) as DesignCaseKey[]).forEach((k) => {
            if (lh[k] !== undefined) next[k] = String(lh[k]);
          });
          return next;
        });
      }

      // hydrate geometry (kalau sudah pernah diisi)
      if (d.geometry) {
        setDiameterSel(String(d.geometry.diameter ?? ""));

        const inferred = inferPresetKeyFromCourses(d.units, d.geometry.courses ?? []);
        if (inferred) setPresetKey(inferred);

        const n = (d.geometry.courses ?? []).length;
        if (n > 0) setCourseCountSel(String(n));
      }
    }

    setHydrated(true);
  }, []);

  const activeCases = useMemo(() => (draft ? getActiveCases(draft) : []), [draft]);

  const presets = useMemo(() => {
    if (!draft) return [];
    return getPresetsByUnits(draft.units);
  }, [draft]);

  const preset = useMemo(() => getPresetByKey(presetKey), [presetKey]);

  // if units berubah (harusnya gak sering), pastikan presetKey valid
  useEffect(() => {
    if (!draft) return;
    const valid = presets.some((p) => p.key === presetKey);
    if (!valid) {
      setPresetKey(draft.units === "US" ? "US_72" : "SI_1800");
      setCourseCountSel("");
      setDiameterSel("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.units]);

  const lengthUnit = useMemo(() => (draft?.units === "US" ? "ft" : "m"), [draft]);
  const caUnit = useMemo(() => (draft?.units === "US" ? "in" : "mm"), [draft]);

  const diameters = useMemo(() => {
    if (!draft) return [];
    return API650_DIAMETERS[draft.units];
  }, [draft]);

  const heightOptions = useMemo(() => preset?.heightOptions ?? [], [preset]);

  const selectedCourseCount = useMemo(() => {
    const n = Number.parseInt(courseCountSel, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [courseCountSel]);

  const shellHeight = useMemo(() => {
    if (!preset) return NaN;
    if (!Number.isFinite(selectedCourseCount) || selectedCourseCount <= 0) return NaN;
    return preset.courseHeight * selectedCourseCount;
  }, [preset, selectedCourseCount]);

  const coursesArray = useMemo(() => {
    if (!preset) return [];
    if (!Number.isFinite(selectedCourseCount) || selectedCourseCount <= 0) return [];
    return Array.from({ length: selectedCourseCount }, () => preset.courseHeight);
  }, [preset, selectedCourseCount]);

  const fillDefaultsFromShellHeight = () => {
    if (!Number.isFinite(shellHeight) || shellHeight <= 0) return;

    // default: operating 90% shell, hydrotest 100%, empty 0
    const op = Math.max(0, 0.9 * shellHeight);
    const ht = shellHeight;

    setLiquidHeights((prev) => ({
      ...prev,
      operating: prev.operating.trim() ? prev.operating : String(op.toFixed(3)),
      hydrotest: prev.hydrotest.trim() ? prev.hydrotest : String(ht.toFixed(3)),
      empty_wind: prev.empty_wind.trim() ? prev.empty_wind : "0",
      empty_seismic: prev.empty_seismic.trim() ? prev.empty_seismic : "0",
      vacuum: prev.vacuum.trim() ? prev.vacuum : "0",
      steamout: prev.steamout.trim() ? prev.steamout : "0",
    }));
  };

  const warnings = useMemo(() => {
    const w: string[] = [];

    if (draft?.recommendedStandard === "API_620") {
      w.push("Project Anda terpilih API 620. Pemilihan geometry di sini memakai tabel tipikal API 650 sebagai referensi dimensi, bukan sebagai rule desain API 620.");
    }

    if (Number.isFinite(shellHeight)) {
      for (const k of activeCases) {
        const lh = toNumberOrNaN(liquidHeights[k] ?? "");
        if (Number.isFinite(lh) && lh > shellHeight + 1e-6) {
          w.push(`Liquid height case ${CASE_LABEL[k].title} lebih besar dari shell height. Periksa input.`);
        }
      }
    }

    return w;
  }, [draft?.recommendedStandard, shellHeight, activeCases, liquidHeights]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!draft) e.push("Draft project tidak ditemukan. Silakan kembali ke Step 0.");

    const sgN = toNumberOrNaN(sg);
    if (!Number.isFinite(sgN) || sgN <= 0) e.push("Specific gravity (SG) wajib diisi dan > 0.");

    const caN = toNumberOrNaN(ca);
    if (!Number.isFinite(caN) || caN < 0) e.push("Corrosion allowance (CA) wajib diisi dan ≥ 0.");

    const D = toNumberOrNaN(diameterSel);
    if (!Number.isFinite(D) || D <= 0) e.push("Diameter wajib dipilih dari tabel.");
    if (Number.isFinite(D) && draft) {
      const allowed = API650_DIAMETERS[draft.units].includes(D);
      if (!allowed) e.push("Diameter yang dipilih tidak ada di daftar diameter tipikal API 650.");
    }

    if (!preset) e.push("Preset course tidak valid.");
    if (!courseCountSel.trim()) e.push("Tank height / jumlah course wajib dipilih.");
    if (!Number.isFinite(shellHeight) || shellHeight <= 0) e.push("Shell height tidak valid (hasil dari preset + jumlah course).");

    // liquid heights wajib minimal operating/hydrotest jika case aktif
    if (draft) {
      const act = getActiveCases(draft);
      if (act.includes("operating")) {
        const op = toNumberOrNaN(liquidHeights.operating);
        if (!Number.isFinite(op) || op < 0) e.push("Liquid height untuk Operating wajib diisi (angka ≥ 0).");
      }
      if (act.includes("hydrotest")) {
        const ht = toNumberOrNaN(liquidHeights.hydrotest);
        if (!Number.isFinite(ht) || ht < 0) e.push("Liquid height untuk Hydrotest wajib diisi (angka ≥ 0).");
      }
      for (const k of act) {
        const sVal = liquidHeights[k];
        if (sVal.trim() !== "") {
          const nVal = toNumberOrNaN(sVal);
          if (!Number.isFinite(nVal) || nVal < 0) e.push(`Liquid height untuk ${CASE_LABEL[k].title} harus angka ≥ 0.`);
        }
      }
    }

    return e;
  }, [draft, sg, ca, diameterSel, preset, courseCountSel, shellHeight, liquidHeights]);

  const canContinue = hydrated && errors.length === 0;

  const handleSaveContinue = () => {
    if (!draft || !canContinue || !preset) return;

    const sgN = toNumberOrNaN(sg);
    const caN = toNumberOrNaN(ca);
    const D = toNumberOrNaN(diameterSel);

    const act = getActiveCases(draft);
    const lh: Partial<Record<DesignCaseKey, number>> = {};
    for (const k of act) {
      const sVal = liquidHeights[k] ?? "";
      const nVal = toNumberOrNaN(sVal);
      lh[k] = Number.isFinite(nVal) ? nVal : 0;
    }

    const service: ServiceDraft = {
      storedProduct: storedProduct.trim() || undefined,
      specificGravity: sgN,
      corrosionAllowance: caN,
      liquidHeights: lh,
    };

    const geometry: GeometryDraft = {
      diameter: D,
      shellHeight: shellHeight,
      courses: coursesArray,
    };

    updateProjectDraft({ service, geometry });
    router.push("/projects/new/materials");
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen re-geo">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="re-card rounded-[2rem] p-7 md:p-9">
            <div className="text-sm re-muted">Memuat draft project...</div>
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
                href="/projects/new"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Kembali ke Step 0
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
              <div className="mt-1 text-sm re-muted">Step 2 — Service & Geometry</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/projects/new/config"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali (Step 1)
            </Link>
          </div>
        </div>

        {/* STEPPER */}
        <div className="mt-6 flex flex-wrap gap-2">
          <StepPill label="Step 0 • Initiation" state="done" />
          <StepPill label="Step 1 • Config & Cases" state="done" />
          <StepPill label="Step 2 • Service & Geometry" state="active" />
          <StepPill label="Step 3 • Materials" state="next" />
          <StepPill label="Step 4 • Results" state="next" />
        </div>

        {/* CONTENT */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-7 re-card rounded-[2rem] p-7 md:p-9">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
              Service & Geometry
            </h1>

            <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
              Di step ini, geometri tank (D, Hshell, jumlah course) dipilih dari preset tipikal API 650 berdasarkan
              <strong> course height</strong>. Ini bikin input konsisten dan gampang direview.
            </p>

            {/* SERVICE */}
            <div className="mt-7 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Service (Fluida)</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Stored product (opsional)</div>
                  <input
                    value={storedProduct}
                    onChange={(e) => setStoredProduct(e.target.value)}
                    placeholder="Contoh: Diesel / Crude Oil / Water"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Specific gravity (SG) *</div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={sg}
                    onChange={(e) => setSg(e.target.value)}
                    placeholder="Contoh: 0.85 / 1.00"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Corrosion allowance (CA) * ({caUnit})
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={ca}
                    onChange={(e) => setCa(e.target.value)}
                    placeholder={draft.units === "US" ? "Contoh: 0.125" : "Contoh: 2"}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </label>
              </div>
            </div>

            {/* GEOMETRY - TABLE DRIVEN */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Geometry (berdasarkan tabel API 650)</div>
                  <div className="mt-1 text-sm re-muted">
                    Pilih course height → pilih diameter → pilih tank height/jumlah course.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTable(true)}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                >
                  Lihat tabel API 650
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preset */}
                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">Typical course height *</div>
                  <select
                    value={presetKey}
                    onChange={(e) => {
                      setPresetKey(e.target.value as CoursePresetKey);
                      setCourseCountSel("");
                    }}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    {presets.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Diameter */}
                <label className="block">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Diameter tank (D) * ({lengthUnit})
                  </div>
                  <select
                    value={diameterSel}
                    onChange={(e) => setDiameterSel(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Pilih diameter...</option>
                    {diameters.map((d) => (
                      <option key={d} value={String(d)}>
                        {d} {lengthUnit}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Height / courses */}
                <label className="block md:col-span-2">
                  <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                    Tank height / jumlah course * ({lengthUnit})
                  </div>
                  <select
                    value={courseCountSel}
                    onChange={(e) => setCourseCountSel(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Pilih tinggi/jumlah course...</option>
                    {heightOptions.map((o) => (
                      <option key={o.courses} value={String(o.courses)}>
                        H = {o.shellHeight} {lengthUnit}  ({o.courses} courses @ {preset?.courseHeight} {lengthUnit})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs re-muted">
                    Setelah dipilih, course table akan otomatis jadi seragam sesuai preset.
                  </div>
                </label>
              </div>

              {/* Geometry preview */}
              <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Preview geometry</div>
                <div className="mt-2 text-sm re-muted leading-relaxed">
                  <div>
                    <strong className="text-[rgb(var(--re-ink))]">D:</strong>{" "}
                    {diameterSel ? `${diameterSel} ${lengthUnit}` : "-"}
                  </div>
                  <div>
                    <strong className="text-[rgb(var(--re-ink))]">Hshell:</strong>{" "}
                    {Number.isFinite(shellHeight) ? `${shellHeight} ${lengthUnit}` : "-"}
                  </div>
                  <div>
                    <strong className="text-[rgb(var(--re-ink))]">Jumlah course:</strong>{" "}
                    {Number.isFinite(selectedCourseCount) ? selectedCourseCount : "-"}
                  </div>
                  <div>
                    <strong className="text-[rgb(var(--re-ink))]">Course height:</strong>{" "}
                    {preset ? `${preset.courseHeight} ${lengthUnit}` : "-"}
                  </div>
                </div>

                {coursesArray.length > 0 ? (
                  <div className="mt-3 text-xs re-muted">
                    Course table (bottom→top): [{coursesArray.map((x) => String(x)).join(", ")}]
                  </div>
                ) : null}
              </div>
            </div>

            {/* CASE HEIGHTS */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                  Liquid height per design case
                </div>
                <button
                  type="button"
                  onClick={fillDefaultsFromShellHeight}
                  className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                >
                  Isi default dari shell height
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {activeCases.map((k) => (
                  <div
                    key={k}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">{CASE_LABEL[k].title}</div>
                      <div className="text-sm re-muted">{CASE_LABEL[k].hint}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={liquidHeights[k] ?? ""}
                        onChange={(e) =>
                          setLiquidHeights((prev) => ({ ...prev, [k]: e.target.value }))
                        }
                        placeholder="0"
                        className="w-44 rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <span className="text-sm re-muted">{lengthUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ERRORS */}
            {errors.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-white/80 p-5">
                <div className="text-sm font-semibold text-red-600">Periksa sebelum lanjut</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                  {errors.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* WARNINGS */}
            {warnings.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-5">
                <div className="text-sm font-semibold text-[rgb(var(--re-orange))]">Catatan</div>
                <ul className="mt-2 list-disc pl-5 text-sm re-muted">
                  {warnings.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveContinue}
                disabled={!canContinue}
                className={[
                  "px-8 py-4 rounded-2xl text-base font-semibold text-white shadow transition",
                  canContinue ? "bg-[rgb(var(--re-blue))] hover:opacity-95" : "bg-black/30 cursor-not-allowed",
                ].join(" ")}
              >
                Simpan & Lanjut (Step 3)
              </button>

              <Link
                href="/projects/new/config"
                className="px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
              >
                Kembali (Step 1)
              </Link>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="lg:col-span-5 re-card rounded-[2rem] p-6 md:p-7">
            <div className="text-xs re-muted">Ringkasan</div>
            <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">Project Summary</div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm re-muted leading-relaxed">
              <div><strong className="text-[rgb(var(--re-ink))]">Project:</strong> {draft.projectName}</div>
              <div><strong className="text-[rgb(var(--re-ink))]">Units:</strong> {draft.units}</div>
              <div className="mt-2">
                <strong className="text-[rgb(var(--re-ink))]">Standard (auto):</strong>{" "}
                {draft.recommendedStandard === "API_650"
                  ? "API 650"
                  : draft.recommendedStandard === "API_620"
                    ? "API 620"
                    : "Out-of-scope"}
              </div>

              <div className="mt-4">
                <strong className="text-[rgb(var(--re-ink))]">Geometry:</strong>
                <ul className="mt-2 list-disc pl-5">
                  <li>D: {diameterSel ? `${diameterSel} ${lengthUnit}` : "-"}</li>
                  <li>Hshell: {Number.isFinite(shellHeight) ? `${shellHeight} ${lengthUnit}` : "-"}</li>
                  <li>Courses: {Number.isFinite(selectedCourseCount) ? selectedCourseCount : "-"}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4 text-sm re-muted leading-relaxed">
              Step 3 akan minta: <strong>allowable stress</strong>, <strong>joint efficiency</strong>, dan
              <strong> adopted thickness</strong> per course untuk verifikasi OK/NOT OK.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TABLE */}
      {showTable && preset ? (
        <Modal title={preset.tableTitle} onClose={() => setShowTable(false)}>
          <div className="w-full">
            <Image
              src={preset.tableImageSrc}
              alt={preset.tableTitle}
              width={1400}
              height={1000}
              className="w-full h-auto object-contain rounded-2xl"
              priority
            />
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
