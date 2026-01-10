"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openInfo, setOpenInfo] = useState(false);

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

              {/* 1 kalimat highlight */}
              <p className="mt-4 max-w-3xl text-sm md:text-base re-muted leading-relaxed">
                Kalkulator desain tangki API 650 untuk menghitung{" "}
                <strong>shell thickness per course</strong> dan verifikasi{" "}
                <strong>OK / NOT OK</strong> (SI / US).
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/calculator"
              className="px-8 py-3.5 rounded-2xl text-sm font-semibold text-white
                         bg-[rgb(var(--re-blue))] hover:opacity-95 transition shadow"
            >
              Buka Kalkulator
            </Link>

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
          </div>

          {/* BRAND DOTS (opsional, tapi masih minimalis & rapi) */}
          <div className="mt-8 flex items-center gap-3 text-xs re-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-blue))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-green))]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--re-orange))]" />
            <span>Engineering calculator platform</span>
          </div>
        </section>
      </div>

      {/* INFO MODAL (simple) */}
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

            <div className="mt-4 text-sm re-muted leading-relaxed">
              Fokus saat ini: <strong>Shell thickness per course</strong> + status{" "}
              <strong>OK / NOT OK</strong> dengan pilihan unit <strong>SI / US</strong>.
              Modul lanjutan (Bottom/Roof/Wind/Seismic/Nozzle) disiapkan untuk tahap berikutnya.
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
