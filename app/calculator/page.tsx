"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Unit = "SI" | "US";

type InputState = {
  unit: Unit;
  diameter: number; // m / ft
  height: number; // m / ft
  courses: number;
  designLiquidHeight: number; // m / ft
  specificGravity: number; // -
  corrosionAllowance: number; // mm / in
  fy: number; // MPa / ksi
  jointEfficiency: number; // 0..1
};

type CourseRow = {
  courseNo: number;
  required: number;
  adopted: number;
  status: "OK" | "NG";
};

export default function CalculatorPage() {
  const [input, setInput] = useState<InputState>({
    unit: "SI",
    diameter: 30,
    height: 12,
    courses: 6,
    designLiquidHeight: 11,
    specificGravity: 1.0,
    corrosionAllowance: 2,
    fy: 240,
    jointEfficiency: 1.0,
  });

  // Placeholder kalkulasi: bikin profil tebal dari atas ke bawah (bawah lebih tebal)
  const rows: CourseRow[] = useMemo(() => {
    const n = clampInt(input.courses, 1, 40);

    const base = input.unit === "SI" ? 6 : 0.25; // mm / in
    const step = input.unit === "SI" ? 1.5 : 0.0625;

    return Array.from({ length: n }, (_, i) => {
      const courseNo = i + 1;
      const req = base + (n - courseNo) * step;
      const adopted = roundUpToStandard(req + input.corrosionAllowance, input.unit);
      return {
        courseNo,
        required: round(req),
        adopted: round(adopted),
        status: adopted >= req + input.corrosionAllowance ? "OK" : "NG",
      };
    });
  }, [input]);

  const allOk = rows.every((r) => r.status === "OK");

  const unitLabel = input.unit === "SI"
    ? { D: "m", H: "m", t: "mm", fy: "MPa" }
    : { D: "ft", H: "ft", t: "in", fy: "ksi" };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-70">API 650 Tank Calculator</div>
            <h1 className="text-2xl font-semibold mt-1">Calculator</h1>
          </div>
          <Link className="opacity-80 underline" href="/">Home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <section className="rounded-2xl border border-white/10 bg-black/20 p-6 space-y-4">
            <h2 className="font-medium">Input</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldSelect
                label="Unit System"
                value={input.unit}
                options={[
                  { label: "SI", value: "SI" },
                  { label: "US", value: "US" },
                ]}
                onChange={(v) => setInput((s) => ({ ...s, unit: v as Unit }))}
              />

              <FieldNumber
                label={`Diameter (${unitLabel.D})`}
                value={input.diameter}
                onChange={(v) => setInput((s) => ({ ...s, diameter: v }))}
              />

              <FieldNumber
                label={`Height (${unitLabel.H})`}
                value={input.height}
                onChange={(v) => setInput((s) => ({ ...s, height: v }))}
              />

              <FieldNumber
                label="Number of Courses"
                value={input.courses}
                onChange={(v) => setInput((s) => ({ ...s, courses: clampInt(v, 1, 40) }))}
              />

              <FieldNumber
                label={`Design Liquid Height (${unitLabel.H})`}
                value={input.designLiquidHeight}
                onChange={(v) => setInput((s) => ({ ...s, designLiquidHeight: v }))}
              />

              <FieldNumber
                label="Specific Gravity (-)"
                value={input.specificGravity}
                step="0.01"
                onChange={(v) => setInput((s) => ({ ...s, specificGravity: v }))}
              />

              <FieldNumber
                label={`Corrosion Allowance (${unitLabel.t})`}
                value={input.corrosionAllowance}
                step="0.1"
                onChange={(v) => setInput((s) => ({ ...s, corrosionAllowance: v }))}
              />

              <FieldNumber
                label={`Fy (${unitLabel.fy})`}
                value={input.fy}
                step="1"
                onChange={(v) => setInput((s) => ({ ...s, fy: v }))}
              />

              <FieldNumber
                label="Joint Efficiency (0..1)"
                value={input.jointEfficiency}
                step="0.01"
                onChange={(v) => setInput((s) => ({ ...s, jointEfficiency: clamp(v, 0, 1) }))}
              />
            </div>

            <div className="rounded-xl border border-white/10 p-4 text-sm opacity-80">
              <div className="font-medium mb-1">Catatan</div>
              Ini masih <b>placeholder</b> (belum rumus API 650). Tapi UI + tabel course sudah siap.
              Nanti kita ganti mesin hitungnya modul-per-modul.
            </div>
          </section>

          {/* Output Card */}
          <section className="rounded-2xl border border-white/10 bg-black/20 p-6 space-y-4">
            <h2 className="font-medium">Results</h2>

            <div className={`rounded-xl p-4 border border-white/10 ${allOk ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <div className="font-semibold">{allOk ? "PASS" : "NOT PASS"}</div>
              <div className="text-sm opacity-75">
                Shell course thickness (placeholder) • unit thickness: {unitLabel.t}
              </div>
            </div>

            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-3">Course</th>
                    <th className="text-left p-3">Req t ({unitLabel.t})</th>
                    <th className="text-left p-3">Adopt t ({unitLabel.t})</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.courseNo} className="border-t border-white/10">
                      <td className="p-3">{r.courseNo}</td>
                      <td className="p-3">{r.required}</td>
                      <td className="p-3">{r.adopted}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg ${r.status === "OK" ? "bg-green-500/15" : "bg-red-500/15"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs opacity-60">
              Next step: kita pisahin engine hitung ke `src/lib/api650/` biar gampang tambah bottom/roof/wind/seismic/nozzle.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function FieldNumber(props: {
  label: string;
  value: number;
  step?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-sm opacity-70">{props.label}</div>
      <input
        className="w-full rounded-xl border border-white/10 bg-transparent p-2"
        type="number"
        value={Number.isFinite(props.value) ? props.value : 0}
        step={props.step ?? "1"}
        onChange={(e) => props.onChange(parseFloat(e.target.value || "0"))}
      />
    </label>
  );
}

function FieldSelect(props: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="space-y-1">
      <div className="text-sm opacity-70">{props.label}</div>
      <select
        className="w-full rounded-xl border border-white/10 bg-transparent p-2"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function clamp(x: number, min: number, max: number) {
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function clampInt(x: number, min: number, max: number) {
  const v = Math.floor(clamp(x, min, max));
  return v;
}

function round(x: number) {
  return Math.round(x * 1000) / 1000;
}

// contoh rounding plate standar (placeholder)
function roundUpToStandard(x: number, unit: Unit) {
  if (unit === "SI") {
    const standards = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32];
    return standards.find((s) => s >= x) ?? x;
  }
  const standards = [0.25, 0.3125, 0.375, 0.5, 0.625, 0.75, 1.0];
  return standards.find((s) => s >= x) ?? x;
}
