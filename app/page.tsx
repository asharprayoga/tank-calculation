"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <main className="min-h-screen re-geo">
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
                    "Changelog (coming soon)\n\nNanti bisa diisi: versi, perubahan rumus, perbaikan UI, dll."
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
                    "Roadmap (coming soon)\n\n• Shell\n• Bottom\n• Roof\n• Wind\n• Seismic\n• Nozzle reinforcement\n• Export PDF/Excel"
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
            {/* LEFT */}
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

              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Tool cepat untuk <strong>desain & verifikasi tangki API 650</strong> —
                input ringkas, hasil jelas, dan siap digunakan untuk proses review (SI / US).
              </p>

              {/* ACTIONS */}
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

              {/* BRAND DOTS */}
              <div className="mt-10 flex items-center gap-3 text-sm re-muted">
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-blue))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-green))]" />
                <span className="h-3 w-3 rounded-full bg-[rgb(var(--re-orange))]" />
                <span>Engineering calculator platform</span>
              </div>
            </div>

            {/* RIGHT: Bilingual capabilities panel */}
            <div className="lg:col-span-5">
              <div
                className="
                  rounded-[1.75rem]
                  border border-[rgba(var(--re-blue),0.18)]
                  bg-[rgba(var(--re-blue),0.04)]
                  p-6 md:p-7
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs re-muted">Sorotan • Highlights</div>
                    <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                      Kapabilitas Utama • Core Capabilities
                    </div>
                  </div>

                  <span
                    className="
                      px-3 py-1.5 rounded-2xl text-xs font-semibold
                      border border-[rgba(var(--re-blue),0.30)]
                      bg-[rgba(var(--re-blue),0.08)]
                      text-[rgb(var(--re-blue))]
                    "
                  >
                    API 650
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {/* Card 1 — Blue tint */}
                  <div
                    className="
                      rounded-2xl
                      border border-[rgba(var(--re-blue),0.20)]
                      bg-[rgba(var(--re-blue),0.05)]
                      p-4
                    "
                  >
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Sistem Satuan (SI / US)
                    </div>
                    <div className="mt-1 text-sm re-muted leading-relaxed">
                      Mendukung sistem satuan SI dan US untuk menjaga konsistensi perhitungan
                      dari input hingga output.
                    </div>

                    <div className="mt-3 pt-3 border-t border-[rgba(var(--re-blue),0.18)]">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Unit System (SI / US)
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Supports SI and US units to ensure consistent calculations from input
                        through output.
                      </div>
                    </div>
                  </div>

                  {/* Card 2 — Green tint */}
                  <div
                    className="
                      rounded-2xl
                      border border-[rgba(var(--re-green),0.22)]
                      bg-[rgba(var(--re-green),0.06)]
                      p-4
                    "
                  >
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Verifikasi per Course
                    </div>
                    <div className="mt-1 text-sm re-muted leading-relaxed">
                      Menyajikan ketebalan minimum yang dibutuhkan serta status kelulusan
                      (OK / NOT OK) untuk setiap shell course.
                    </div>

                    <div className="mt-3 pt-3 border-t border-[rgba(var(--re-green),0.18)]">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Per-Course Verification
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Provides required minimum thickness and pass/fail status (OK / NOT OK)
                        for each shell course.
                      </div>
                    </div>
                  </div>

                  {/* Card 3 — Orange tint */}
                  <div
                    className="
                      rounded-2xl
                      border border-[rgba(var(--re-orange),0.25)]
                      bg-[rgba(var(--re-orange),0.06)]
                      p-4
                    "
                  >
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Arsitektur Modular
                    </div>
                    <div className="mt-1 text-sm re-muted leading-relaxed">
                      Dikembangkan dengan pendekatan modular: Shell → Bottom → Roof → Wind →
                      Seismic → Nozzle, sehingga mudah diperluas secara bertahap.
                    </div>

                    <div className="mt-3 pt-3 border-t border-[rgba(var(--re-orange),0.18)]">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Modular Architecture
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Built with a modular approach: Shell → Bottom → Roof → Wind → Seismic →
                        Nozzle, making it easy to extend incrementally.
                      </div>
                    </div>
                  </div>

                  {/* Quick Note — Blue/neutral tint */}
                  <div
                    className="
                      rounded-2xl
                      border border-[rgba(var(--re-blue),0.18)]
                      bg-[rgba(var(--re-blue),0.035)]
                      p-4
                    "
                  >
                    <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                      Catatan Implementasi
                    </div>
                    <div className="mt-1 text-sm re-muted leading-relaxed">
                      Perhitungan dimulai dari modul Shell. Modul lainnya telah disiapkan
                      secara struktural agar dapat ditambahkan tanpa perubahan besar pada antarmuka.
                    </div>

                    <div className="mt-3 pt-3 border-t border-[rgba(var(--re-blue),0.16)]">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Implementation Note
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Calculations start from the Shell module. Other modules are structurally
                        prepared to be added without major UI changes.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="
                      px-4 py-2 rounded-2xl text-sm font-semibold
                      border border-[rgba(var(--re-blue),0.22)]
                      bg-[rgba(var(--re-blue),0.06)]
                      hover:bg-[rgba(var(--re-blue),0.10)]
                      transition
                    "
                    onClick={() =>
                      alert(
                        "Dokumentasi Teknis / Technical Documentation (coming soon)\n\nNanti bisa diisi: clause reference, asumsi, definisi simbol, contoh kasus."
                      )
                    }
                  >
                    Dokumentasi Teknis • Technical Documentation
                  </button>

                  <button
                    type="button"
                    className="
                      px-4 py-2 rounded-2xl text-sm font-semibold
                      border border-[rgba(var(--re-green),0.22)]
                      bg-[rgba(var(--re-green),0.07)]
                      hover:bg-[rgba(var(--re-green),0.12)]
                      transition
                    "
                    onClick={() =>
                      alert(
                        "Bantuan & Dukungan / Help & Support (coming soon)\n\nNanti bisa diisi: cara lapor bug, request fitur, kontak PIC, dsb."
                      )
                    }
                  >
                    Bantuan & Dukungan • Help & Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT MODAL */}
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
                <div className="text-xs re-muted">Tentang • About</div>
                <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                  TankCalc (API 650)
                </div>
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                onClick={() => setOpenInfo(false)}
              >
                Tutup • Close
              </button>
            </div>

            <div className="mt-4 text-sm re-muted leading-relaxed">
              <div className="font-semibold text-[rgb(var(--re-ink))]">
                Bahasa Indonesia
              </div>
              <div className="mt-1">
                TankCalc adalah platform kalkulator untuk kebutuhan desain/cek tangki sesuai API 650.
                Targetnya: input cepat, hasil jelas, dan struktur modular untuk pengembangan fitur lanjutan.
              </div>

              <div className="mt-4 font-semibold text-[rgb(var(--re-ink))]">
                English
              </div>
              <div className="mt-1">
                TankCalc is a calculation platform for API 650 tank design/check workflows.
                The goal is fast input, clear output, and a modular structure to support future enhancements.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
