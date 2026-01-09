"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 re-geo">
      <div className="mx-auto max-w-5xl relative">
        <section className="rounded-3xl re-card p-8 md:p-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/80 border border-black/10 flex items-center justify-center overflow-hidden">
              <Image
                src="/re-logo.png"
                alt="Rekayasa Engineering Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <div className="text-sm re-muted">API 650 Tank Calculator</div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-1">
                <span className="re-gradient-text">TankCalc</span>{" "}
                <span className="re-muted font-semibold">Web App</span>
              </h1>
              <div className="text-sm re-muted mt-2">
                Tema: Rekayasa Engineering (Blue / Green / Orange)
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl re-muted mt-6 max-w-2xl">
            Web app interaktif untuk perhitungan tangki (SI/US), hasil table
            course, dan export report.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white shadow
                         bg-[rgb(var(--re-blue))] hover:opacity-95 transition"
            >
              Buka Kalkulator
            </Link>

            <button
              type="button"
              className="px-6 py-3 rounded-2xl text-sm font-semibold border border-black/10
                         bg-white/70 hover:bg-white/90 transition"
              onClick={() => alert("Info: API 650 TankCalc — coming soon ✨")}
            >
              Info
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs re-muted">
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--re-blue))]" />
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--re-green))]" />
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--re-orange))]" />
            Brand colors applied
          </div>
        </section>
      </div>
    </main>
  );
}
