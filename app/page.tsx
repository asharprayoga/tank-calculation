"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ModalKey = "about" | "changelog" | "roadmap" | "internal" | "support" | null;
type StandardKey = "650" | "620";
type UnitKey = "SI" | "US";

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-3xl re-card p-6 md:p-7 border border-black/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="text-lg font-semibold text-[rgb(var(--re-blue))]">
            {title}
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/85 hover:bg-white transition"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-3 text-sm re-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function SegmentedButton({
  active,
  label,
  onClick,
  tone = "blue",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: "blue" | "green" | "orange";
}) {
  const toneMap: Record<string, string> = {
    blue: "text-[rgb(var(--re-blue))]",
    green: "text-[rgb(var(--re-green))]",
    orange: "text-[rgb(var(--re-orange))]",
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-2xl text-sm font-semibold border transition",
        "border-black/10",
        active ? "bg-white shadow-sm" : "bg-white/60 hover:bg-white/80",
        active ? toneMap[tone] : "re-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKey>(null);

  // Quick start state (homepage -> wizard)
  const [standard, setStandard] = useState<StandardKey>("650");
  const [units, setUnits] = useState<UnitKey>("SI");

  const modalContent = useMemo(() => {
    switch (modal) {
      case "about":
        return {
          title: "Tentang TankCalc",
          body: (
            <>
              <div>
                TankCalc adalah tool internal untuk mendukung{" "}
                <strong className="text-[rgb(var(--re-blue))]">
                  perhitungan & verifikasi desain tangki
                </strong>{" "}
                mengacu pada{" "}
                <strong className="text-[rgb(var(--re-green))]">
                  API 650 / API 620
                </strong>
                . Fokusnya: workflow yang rapih (project → input → design cases → run),
                hasil jelas, dan siap untuk proses review.
              </div>
              <div className="mt-3">
                Prinsipnya: bukan cuma “keluar angka”, tapi bikin hasil{" "}
                <strong>traceable</strong> (governing case + ringkasan check OK/NOT OK).
              </div>
            </>
          ),
        };
      case "changelog":
        return {
          title: "Changelog",
          body: (
            <>
              Placeholder untuk catatan perubahan versi.
              <ul className="mt-2 list-disc pl-5">
                <li>v0.1 — Homepage + struktur modul</li>
                <li>v0.2 — Wizard input + project (planned)</li>
                <li>v0.3 — Shell thickness per course + table result (planned)</li>
                <li>v0.4 — Export/report ringkas (planned)</li>
              </ul>
            </>
          ),
        };
      case "roadmap":
        return {
          title: "Roadmap",
          body: (
            <>
              Rencana pengembangan modul (bertahap):
              <ul className="mt-2 list-disc pl-5">
                <li>
                  <strong className="text-[rgb(var(--re-blue))]">Project workflow</strong>{" "}
                  (wizard + design cases)
                </li>
                <li>
                  <strong className="text-[rgb(var(--re-blue))]">Shell</strong>{" "}
                  (core)
                </li>
                <li>Bottom / annular</li>
                <li>Roof</li>
                <li>Wind</li>
                <li>Seismic</li>
                <li>Nozzle reinforcement</li>
                <li>Export PDF/Excel + report ringkas</li>
              </ul>
            </>
          ),
        };
      case "internal":
        return {
          title: "Internal RE",
          body: (
            <>
              Tool ini ditujukan untuk penggunaan internal divisi Mechanical.
              Kalau mau dipakai lintas tim atau external, biasanya perlu:
              <ul className="mt-2 list-disc pl-5">
                <li>Dokumentasi asumsi & mapping referensi clause</li>
                <li>Benchmark contoh kasus (hand calc / existing sheet)</li>
                <li>Checklist review & approval flow</li>
              </ul>
            </>
          ),
        };
      case "support":
        return {
          title: "Bantuan & Dukungan",
          body: (
            <>
              Kalau nemu bug / butuh fitur:
              <ul className="mt-2 list-disc pl-5">
                <li>Catat input yang dipakai</li>
                <li>Screenshot hasil</li>
                <li>Tulis langkah reproduksi</li>
              </ul>
              <div className="mt-2">
                (Placeholder) Nanti bisa diarahkan ke channel internal / PIC.
              </div>
            </>
          ),
        };
      default:
        return null;
    }
  }, [modal]);

  const safePush = (path: string) => {
    router.push(path);
  };

  const startNewProjectHref = useMemo(() => {
    // Route ideal (yang nanti lo bikin): /projects/new
    // Query ini ngebantu prefill wizard step-1
    const qs = new URLSearchParams({
      standard: standard,
      units: units,
    }).toString();
    return `/projects/new?${qs}`;
  }, [standard, units]);

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <section className="rounded-[2rem]">
          {/* TOP BAR */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              {/* LOGO — jangan diubah */}
              <div className="shrink-0">
                <div className="h-16 w-44 md:h-20 md:w-56 rounded-3xl bg-white/90 border border-black/10 shadow-sm flex items-center justify-center px-3">
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
                <div className="text-xs md:text-sm re-muted">
                  Tank Design Calculator (API 650 / API 620)
                </div>
                <div className="mt-1 text-sm re-muted">
                  Internal tool • Mechanical Engineering
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setModal("changelog")}
              >
                Changelog
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setModal("roadmap")}
              >
                Roadmap
              </button>

              <button
                type="button"
                className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/60 hover:bg-white/90 transition re-muted"
                onClick={() => setModal("internal")}
              >
                Internal RE
              </button>
            </div>
          </div>

          {/* GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT: HERO + WORKFLOW */}
            <div className="lg:col-span-7 re-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
              {/* subtle highlight */}
              <div className="pointer-events-none absolute -top-24 -right-28 h-64 w-64 rounded-full bg-[rgb(var(--re-blue))]/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-28 h-64 w-64 rounded-full bg-[rgb(var(--re-green))]/10 blur-2xl" />

              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                <span className="px-3 py-1.5 rounded-2xl border border-black/10 bg-white/70 re-muted">
                  Project-based workflow
                </span>
                <span className="px-3 py-1.5 rounded-2xl border border-black/10 bg-white/70 text-[rgb(var(--re-green))] font-semibold">
                  API 650 / 620
                </span>
                <span className="px-3 py-1.5 rounded-2xl border border-black/10 bg-white/70 text-[rgb(var(--re-orange))] font-semibold">
                  SI / US
                </span>
              </div>

              <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Mulai dari <strong>design basis</strong> → tentukan{" "}
                <strong>tank configuration</strong> → susun{" "}
                <strong>design cases</strong> → jalankan kalkulasi → review hasil{" "}
                <strong className="text-[rgb(var(--re-blue))]">OK / NOT OK</strong>{" "}
                dan siapkan ringkasan untuk proses engineering review.
              </p>

              {/* Workflow snapshot */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    n: "01",
                    t: "Design Basis",
                    d: "Standard, edition, units, project meta",
                  },
                  {
                    n: "02",
                    t: "Tank & Service",
                    d: "Geometry, roof/bottom, fluid, CA, P/V",
                  },
                  {
                    n: "03",
                    t: "Design Cases",
                    d: "Operating, hydrotest, empty + wind/seismic",
                  },
                  {
                    n: "04",
                    t: "Results & Report",
                    d: "Course table, governing case, export (planned)",
                  },
                ].map((x) => (
                  <div
                    key={x.n}
                    className="rounded-2xl border border-black/10 bg-white/60 p-4 hover:bg-white/75 transition"
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                        {x.t}
                      </div>
                      <div className="text-xs font-bold re-muted">{x.n}</div>
                    </div>
                    <div className="mt-1 text-sm re-muted leading-relaxed">
                      {x.d}
                    </div>
                  </div>
                ))}
              </div>

              {/* Primary actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => safePush(startNewProjectHref)}
                  className="px-10 py-4 rounded-2xl text-base md:text-lg font-semibold text-white
                             bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                >
                  Start New Project
                </button>

                <Link
                  href="/calculator"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold border border-black/10
                             bg-white/70 hover:bg-white/90 transition text-[rgb(var(--re-ink))]"
                >
                  Quick Calculator
                </Link>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold text-[rgb(var(--re-blue))] hover:opacity-90 transition"
                  onClick={() => setModal("about")}
                >
                  Tentang
                </button>
              </div>

              {/* Brand dots */}
              <div className="mt-10 flex items-center gap-3 text-sm re-muted">
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-blue))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-green))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-orange))]" />
                <span>Engineering calculator platform (internal)</span>
              </div>
            </div>

            {/* RIGHT: QUICK START + SCOPE */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Start Card */}
              <div className="re-card rounded-[2rem] p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs re-muted">Mulai cepat</div>
                    <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">
                      Quick Start Wizard
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/80 text-[rgb(var(--re-green))]">
                    Prefill
                  </span>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                    Standard
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SegmentedButton
                      active={standard === "650"}
                      label="API 650"
                      tone="green"
                      onClick={() => setStandard("650")}
                    />
                    <SegmentedButton
                      active={standard === "620"}
                      label="API 620"
                      tone="green"
                      onClick={() => setStandard("620")}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">
                    Unit system
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SegmentedButton
                      active={units === "SI"}
                      label="SI"
                      tone="orange"
                      onClick={() => setUnits("SI")}
                    />
                    <SegmentedButton
                      active={units === "US"}
                      label="US"
                      tone="orange"
                      onClick={() => setUnits("US")}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => safePush(startNewProjectHref)}
                    className="px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                  >
                    Start Wizard
                  </button>

                  <button
                    type="button"
                    className="px-5 py-3 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition text-[rgb(var(--re-blue))]"
                    onClick={() => setModal("support")}
                  >
                    Bantuan
                  </button>

                  <button
                    type="button"
                    className="px-5 py-3 rounded-2xl text-sm font-semibold border border-black/10 bg-white/60 hover:bg-white/85 transition re-muted"
                    onClick={() =>
                      safePush(
                        "/calculator?template=default"
                      )
                    }
                  >
                    Template Input
                  </button>
                </div>

                <div className="mt-4 text-sm re-muted leading-relaxed">
                  Wizard ini idealnya jadi jalur utama:{" "}
                  <strong>design basis → cases → input → run → results</strong>.
                </div>
              </div>

              {/* Scope & Status Card */}
              <div className="re-card rounded-[2rem] p-6 md:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs re-muted">Status modul</div>
                    <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-blue))]">
                      Scope & Development
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/80 text-[rgb(var(--re-orange))]">
                    Modular
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { name: "Project workflow (wizard)", status: "Planned", tone: "orange" },
                    { name: "Shell (course verification)", status: "In progress", tone: "blue" },
                    { name: "Bottom / annular", status: "Planned", tone: "orange" },
                    { name: "Roof", status: "Planned", tone: "orange" },
                    { name: "Wind", status: "Planned", tone: "orange" },
                    { name: "Seismic", status: "Planned", tone: "orange" },
                    { name: "Nozzle reinforcement", status: "Planned", tone: "orange" },
                    { name: "Export (PDF/Excel)", status: "Planned", tone: "orange" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
                    >
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        {m.name}
                      </div>
                      <span
                        className={[
                          "px-3 py-1 rounded-2xl text-xs font-semibold border border-black/10 bg-white/80",
                          m.tone === "blue"
                            ? "text-[rgb(var(--re-blue))]"
                            : m.tone === "orange"
                              ? "text-[rgb(var(--re-orange))]"
                              : "text-[rgb(var(--re-green))]",
                        ].join(" ")}
                      >
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-blue))] border border-black/10 hover:bg-white/70 transition"
                    onClick={() => safePush("/docs")}
                  >
                    Dokumentasi Teknis
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-sm font-semibold text-[rgb(var(--re-green))] border border-black/10 hover:bg-white/70 transition"
                    onClick={() => setModal("support")}
                  >
                    Bantuan & Dukungan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL RENDER */}
      {modalContent ? (
        <Modal title={modalContent.title} onClose={() => setModal(null)}>
          {modalContent.body}
        </Modal>
      ) : null}
    </main>
  );
}
