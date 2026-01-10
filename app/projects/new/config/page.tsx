"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearProjectDraft, loadProjectDraft, type ProjectDraft } from "../../../../lib/storage/projectDraft";

export default function NewProjectConfigPage() {
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
            Step 1 (Placeholder): Tank Configuration & Design Cases
          </h1>

          <p className="mt-2 text-sm md:text-base re-muted leading-relaxed">
            Halaman ini placeholder agar flow “Start New Project” tersambung. Selanjutnya Anda bisa
            membangun wizard Step 1 di sini.
          </p>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5">
            <div className="text-sm font-semibold text-[rgb(var(--re-blue))]">Ringkasan Draft</div>

            {draft ? (
              <div className="mt-3 text-sm re-muted leading-relaxed">
                <div><strong>Project:</strong> {draft.projectName}</div>
                <div><strong>Lokasi:</strong> {draft.location ?? "-"}</div>
                <div><strong>Units:</strong> {draft.units}</div>
                <div>
                  <strong>Recommended Standard:</strong>{" "}
                  {draft.recommendedStandard === "API_650"
                    ? "API 650"
                    : draft.recommendedStandard === "API_620"
                      ? "API 620"
                      : "Out-of-scope"}
                </div>
                <div className="mt-3">
                  <strong>Envelope (raw):</strong>
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-black/10 bg-white/80 p-4 text-xs">
                    {JSON.stringify(draft.envelope, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm re-muted">
                Draft belum ditemukan. Silakan buat project dari halaman New Project.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/90 transition"
            >
              Kembali ke Step 0
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
