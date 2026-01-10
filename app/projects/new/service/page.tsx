"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearProjectDraft,
  loadProjectDraft,
  type ProjectDraft,
} from "../../../../lib/storage/projectDraft";

export default function NewProjectServicePage() {
  const [draft, setDraft] = useState<ProjectDraft | null>(null);

  useEffect(() => {
    setDraft(loadProjectDraft());
  }, []);

  return (
    <main className="min-h-screen re-geo">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <div className="re-card rounded-[2rem] p-7 md:p-9">
          <div className="text-xs re-muted">Projects • New</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[rgb(var(--re-ink))]">
            Step 2 (Placeholder): Service & Geometry
          </h1>

          <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
            Ini placeholder agar workflow Step 0 → Step 1 → Step 2 tersambung. Selanjutnya di sini Anda akan
            mengisi data fluida, SG/density, corrosion allowance, diameter, shell height, dan course.
          </p>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
            <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Ringkasan Draft</div>

            {draft ? (
              <div className="mt-3 text-sm re-muted leading-relaxed">
                <div><strong>Project:</strong> {draft.projectName}</div>
                <div><strong>Standard:</strong> {draft.recommendedStandard}</div>

                <div className="mt-3">
                  <strong>Tank Config:</strong>
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-black/10 bg-white/80 p-4 text-xs">
                    {JSON.stringify(draft.tankConfig ?? {}, null, 2)}
                  </pre>
                </div>

                <div className="mt-3">
                  <strong>Design Cases:</strong>
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-black/10 bg-white/80 p-4 text-xs">
                    {JSON.stringify(draft.designCases ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm re-muted">
                Draft belum ditemukan. Silakan buat project dari Step 0.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/projects/new/config"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali ke Step 1
            </Link>

            <button
              type="button"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition re-muted"
              onClick={() => {
                clearProjectDraft();
                setDraft(null);
              }}
            >
              Hapus Draft
            </button>

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
