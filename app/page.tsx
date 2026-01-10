"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <main className="min-h-screen re-geo">
      {/* Background padding biar napas */}
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <section className="re-card rounded-[2rem] p-8 md:p-12">
          {/* TOP BAR */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
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

              <div className="hidden sm:block">
                <div className="text-xs md:text-sm re-muted">
                  API 650 Tank Calculator
                </div>
                <div className="mt-1 text-sm re-muted">
                  Internal tool • Mechanical Engineering
                </div>
              </div>
            </div>

            {/* SMALL LINKS */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold
                           border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() =>
                  alert(
                    "Changelog (coming soon)\n\nNanti bisa isi: versi, perubahan rumus, perbaikan UI, dll."
                  )
                }
              >
                Changelog
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold
                           border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() =>
                  alert(
                    "Roadmap (coming soon)\n\n• Bottom\n• Roof\n• Wind\n• Seismic\n• Nozzle reinforcement\n• Export PDF/Excel"
                  )
                }
              >
                Roadmap
              </button>
              <span className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/60 re-muted">
                Internal RE
              </span>
            </div>
          </div>

          {/* HERO GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT: Headline + CTA */}
            <div className="lg:col-span-7">
              <div className="text-xs md:text-sm re-muted">Tank design & check</div>

              <h1 className="mt-3 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              {/* Catchy, general */}
              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Tool cepat untuk <strong>desain & verifikasi tangki API 650</strong> —
                input ringkas, hasil jelas, dan siap dipakai buat review (SI / US).
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/calculator"
                  className="px-10 py-4 rounded-2xl text-base md:text-lg font-semibold text-white
                             bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
                >
                  Buka Kalkulator
                </Link>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold
                             border border-black/10 bg-white/70 hover:bg-white/90 transition"
                  onClick={() => setOpenInfo(true)}
                  aria-haspopup="dialog"
                  aria-expanded={openInfo}
                >
                  Tentang
                </button>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold
                             border border-black/10 bg-white/70 hover:bg-white/90 transition"
                  onClick={() =>
                    alert(
                      "Template Input (coming soon)\n\nIde: preset parameter umum + contoh pembagian course."
                    )
                  }
                >
                  Template Input
                </button>
              </div>

              {/* Brand dots */}
              <div className="mt-10 flex items-center gap-3 text-sm re-muted">
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-blue))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-green))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-orange))]" />
                <span>Engineering calculator platform</span>
              </div>
            </div>

            {/* RIGHT: Feature panel biar page keisi */}
            <div className="lg:col-span-5">
              <div className="rounded-[1.75rem] border border-black/10 bg-white/55 p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs re-muted">Highlights</div>
                    <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                      Core capabilities
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/70 re-muted">
                    API 650
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Unit system
                    </div>
                    <div className="mt-1 text-sm re-muted">
                      Pilih SI / US, biar konsisten dari input sampai output.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Per-course verification
                    </div>
                    <div className="mt-1 text-sm re-muted">
                      Output tebal minimum & status OK / NOT OK per course.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Modular roadmap
                    </div>
                    <div className="mt-1 text-sm re-muted">
                      Shell → Bottom → Roof → Wind → Seismic → Nozzle (bertahap).
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4">
                  <div className="text-xs re-muted">Quick note</div>
                  <div className="mt-1 text-sm re-muted leading-relaxed">
                    Mulai dari <strong>Shell</strong> dulu. Modul lain disiapin biar nanti tinggal
                    “colok” rumus/clause tanpa bongkar UI.
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-sm font-semibold
                               border border-black/10 bg-white/70 hover:bg-white/90 transition"
                    onClick={() =>
                      alert(
                        "Dokumentasi (coming soon)\n\nNanti bisa isi: clause reference, asumsi, definisi simbol, contoh kasus."
                      )
                    }
                  >
                    Dokumentasi
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-sm font-semibold
                               border border-black/10 bg-white/70 hover:bg-white/90 transition"
                    onClick={() =>
                      alert(
                        "Support (coming soon)\n\nNanti bisa isi: cara lapor bug, request fitur, dll."
                      )
                    }
                  >
                    Support
                  </button>
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
            className="relative w-full max-w-lg rounded-3xl re-card p-6 md:p-7 border border-black/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs re-muted">Tentang</div>
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

            <div className="mt-4 text-sm re-muted leading-relaxed">
              TankCalc adalah platform kalkulator untuk kebutuhan desain/cek tangki sesuai API 650.
              Targetnya: input cepat, hasil jelas, dan struktur modular buat pengembangan fitur lanjutan.
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Saat ini</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Unit SI / US</li>
                  <li>• Output per course + OK/NOT OK</li>
                  <li>• Struktur modul siap</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/55 p-4">
                <div className="text-xs re-muted">Next</div>
                <ul className="mt-2 space-y-1 re-muted">
                  <li>• Wind / Seismic</li>
                  <li>• Bottom / Roof</li>
                  <li>• Export PDF/Excel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
