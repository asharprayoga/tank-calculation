"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        {/* FRAME luar (tanpa glass putih) */}
        <section className="rounded-[2rem]">
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

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
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
                className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
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

          {/* GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT = glass card */}
            <div className="lg:col-span-7 re-card rounded-[2rem] p-8 md:p-10">
              <div className="text-xs md:text-sm re-muted">
                Desain & verifikasi tangki
              </div>

              <h1 className="mt-3 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                <span className="re-title">
                  <span className="tank">Tank</span>
                  <span className="calc">Calc</span>
                  <span className="dot" aria-hidden="true" />
                </span>{" "}
                <span className="text-[rgb(var(--re-ink))]">Web App</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base md:text-lg re-muted leading-relaxed">
                Platform kalkulator untuk{" "}
                <strong>perhitungan dan verifikasi desain tangki</strong> mengacu
                pada <strong>API 650</strong>—input ringkas, hasil jelas, dan siap
                untuk proses review (SI / US).
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
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold transition re-btn-blue"
                  onClick={() => setOpenInfo(true)}
                  aria-haspopup="dialog"
                  aria-expanded={openInfo}
                >
                  Tentang
                </button>

                <button
                  type="button"
                  className="px-8 py-4 rounded-2xl text-base md:text-lg font-semibold transition re-btn-green"
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

            {/* RIGHT = colored panel with shapes */}
            <div className="lg:col-span-5">
              <div className="re-right p-6 md:p-7">
                <div className="re-right-content">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs re-muted">Sorotan</div>
                      <div className="mt-1 text-lg font-semibold text-[rgb(var(--re-ink))]">
                        Kapabilitas Utama
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-black/10 bg-white/70">
                      API 650
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3">
                    <div className="re-right-item re-accent-blue p-4 pl-7">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Sistem Satuan (SI / US)
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Mendukung SI dan US untuk menjaga konsistensi perhitungan dari input hingga output.
                      </div>
                    </div>

                    <div className="re-right-item re-accent-green p-4 pl-7">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Verifikasi per Course
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Menampilkan kebutuhan tebal minimum dan status kelulusan (OK / NOT OK) per course.
                      </div>
                    </div>

                    <div className="re-right-item re-accent-orange p-4 pl-7">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Struktur Modular
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Dirancang modular (Shell → Bottom → Roof → Wind → Seismic → Nozzle) untuk pengembangan bertahap.
                      </div>
                    </div>

                    <div className="re-right-item re-accent-blue p-4 pl-7">
                      <div className="text-sm font-semibold text-[rgb(var(--re-ink))]">
                        Catatan
                      </div>
                      <div className="mt-1 text-sm re-muted leading-relaxed">
                        Mulai dari modul Shell. Modul lain disiapkan agar penambahan fitur tidak mengubah UI secara signifikan.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                      onClick={() =>
                        alert(
                          "Dokumentasi Teknis (coming soon)\n\nNanti bisa diisi: referensi clause, asumsi, definisi simbol, contoh kasus."
                        )
                      }
                    >
                      Dokumentasi Teknis
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
                      onClick={() =>
                        alert(
                          "Bantuan & Dukungan (coming soon)\n\nNanti bisa diisi: cara lapor bug, request fitur, kontak PIC, dsb."
                        )
                      }
                    >
                      Bantuan & Dukungan
                    </button>
                  </div>
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
          aria-label="Tentang TankCalc"
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
              TankCalc adalah platform kalkulator internal untuk mendukung proses desain dan verifikasi tangki
              mengacu pada API 650. Fokus utama: alur input ringkas, hasil yang jelas, serta struktur modular
              untuk pengembangan fitur lanjutan.
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
