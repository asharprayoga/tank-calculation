"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  // Mini preview data (dummy) biar landing page kerasa "tool beneran"
  const preview = useMemo(
    () => [
      { course: 1, req: 13.5, adopt: 16, status: "OK" },
      { course: 2, req: 12.0, adopt: 14, status: "OK" },
      { course: 3, req: 10.5, adopt: 14, status: "OK" },
      { course: 4, req: 9.0, adopt: 12, status: "OK" },
    ],
    []
  );

  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-5xl">
        <section className="re-card rounded-3xl p-8 md:p-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* LOGO (RECTANGLE / LANDSCAPE) — jangan diubah */}
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

            {/* TITLE */}
            <div className="flex-1">
              <div className="text-sm re-muted">API 650 Tank Calculator</div>

              <h1 className="mt-2 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              {/* Subheadline: lebih "product-ish" */}
              <p className="mt-4 max-w-2xl text-sm md:text-base re-muted leading-relaxed">
                Hitung <strong>shell thickness per course</strong> + verifikasi{" "}
                <strong>OK / NOT OK</strong> dengan alur yang rapi dan siap dikembangkan
                (Bottom, Roof, Wind, Seismic, Nozzle).
              </p>
            </div>
          </div>

          {/* BODY GRID */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Description + Features + Actions */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-black/10 bg-white/55 p-6 md:p-7">
                <p className="text-base md:text-lg re-muted leading-relaxed">
                  Web-based engineering tool untuk perhitungan desain tangki silinder
                  vertikal sesuai <strong>API 650</strong>. Mendukung{" "}
                  <strong>SI / US</strong>, dan output yang bisa dipakai buat review cepat.
                </p>

                {/* Feature chips (lebih “scan-able” daripada bullet panjang) */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                    Shell per course
                  </span>
                  <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                    OK / NOT OK check
                  </span>
                  <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                    Unit SI / US
                  </span>
                  <span className="px-3 py-1.5 rounded-2xl text-xs border border-black/10 bg-white/70 re-muted">
                    Modular (Bottom/Roof/Wind/Seismic/Nozzle)
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/calculator"
                    className="px-8 py-3.5 rounded-2xl text-sm font-semibold text-white
                               bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                  >
                    Buka Kalkulator
                  </Link>

                  {/* Info jadi modal (lebih proper dari alert) */}
                  <button
                    type="button"
                    className="px-6 py-3.5 rounded-2xl text-sm font-semibold
                               border border-black/10 bg-white/70 hover:bg-white/90 transition"
                    onClick={() => setOpenInfo(true)}
                    aria-haspopup="dialog"
                    aria-expanded={openInfo}
                  >
                    Info
                  </button>

                  <div className="text-xs re-muted">
                    Tip: mulai dari <strong>Shell</strong>, modul lain nyusul.
                  </div>
                </div>

                {/* BRAND DOTS */}
                <div className="mt-7 flex items-center gap-3 text-xs re-muted">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-blue))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-green))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-orange))]" />
                  <span>Engineering calculator platform</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Mini Preview (Results snapshot) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-black/10 bg-white/55 p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs re-muted">Preview Output</div>
                    <div className="mt-1 text-base font-semibold text-[rgb(var(--re-ink))]">
                      Shell course check
                    </div>
                  </div>

                  <div className="shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/70">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[rgb(var(--re-green))]" />
                    PASS
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
                  <div className="grid grid-cols-4 gap-2 px-4 py-3 text-[11px] re-muted border-b border-black/10">
                    <div>Course</div>
                    <div>Req t (mm)</div>
                    <div>Adopt t (mm)</div>
                    <div className="text-right">Status</div>
                  </div>

                  <div className="divide-y divide-black/10">
                    {preview.map((r) => (
                      <div
                        key={r.course}
                        className="grid grid-cols-4 gap-2 px-4 py-3 text-sm"
                      >
                        <div className="text-[rgb(var(--re-ink))]">{r.course}</div>
                        <div className="re-muted">{r.req}</div>
                        <div className="re-muted">{r.adopt}</div>
                        <div className="text-right">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-black/10 bg-white/80">
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs re-muted leading-relaxed">
                  Preview ini contoh tampilan hasil. Di kalkulator, data akan ikut parameter input lo.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* INFO MODAL */}
      {openInfo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Info TankCalc"
          onClick={() => setOpenInfo(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl rounded-3xl re-card p-6 md:p-7 border border-black/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs re-muted">Info</div>
                <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                  TankCalc (API 650)
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setOpenInfo(false)}
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Core</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Unit: SI / US</li>
                  <li>• Output: Shell per course</li>
                  <li>• Status: OK / NOT OK</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Roadmap</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Bottom / Roof</li>
                  <li>• Wind / Seismic</li>
                  <li>• Nozzle reinforcement</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-xs re-muted leading-relaxed">
              Catatan: struktur UI dibuat modular biar gampang nambah clause/logic API 650 berikutnya.
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
