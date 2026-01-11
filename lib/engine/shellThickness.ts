// lib/engine/shellThickness.ts

import type { DesignCaseKey } from "../storage/projectDraft";

export type Units = "SI" | "US";
export type Standard = "API_650" | "API_620";

export interface ShellCaseInput {
  key: DesignCaseKey;
  liquidHeight: number; // SI: m, US: ft (diukur dari bottom tank)
}

export interface ShellCalcInput {
  units: Units;
  standard: Standard;

  diameter: number; // SI: m, US: ft
  courses: number[]; // SI: m, US: ft (bottom→top)

  specificGravity: number; // design SG
  corrosionAllowance: number; // SI: mm, US: in

  // design pressure from Step 0
  designPressure: number; // SI: kPa(g), US: psi(g)

  // Materials (Step 3)
  allowableStressDesign: number; // SI: MPa, US: psi
  allowableStressTest: number; // SI: MPa, US: psi
  jointEfficiency: number; // 0..1
  minNominalThickness: number; // SI: mm, US: in (EXCLUDING CA)
  adoptedThicknesses: number[]; // SI: mm, US: in (nominal thickness yang dipilih, biasanya sudah termasuk CA secara praktik)

  activeCases: ShellCaseInput[];
}

/**
 * tCalc: hasil rumus (incl CA) sebelum minimum thickness diterapkan
 * tRequired: hasil final sesudah max(tCalc, minWithCA)
 */
export interface CourseResult {
  courseNo: number;
  courseHeight: number;
  bottomElevation: number;

  // NEW: transparansi hasil per case
  tCalcByCase: Partial<Record<DesignCaseKey, number>>; // incl CA, BEFORE min thickness floor
  requiredByCase: Partial<Record<DesignCaseKey, number>>; // BACKWARD COMPAT: sama dengan tRequiredByCase
  tRequiredByCase: Partial<Record<DesignCaseKey, number>>; // incl CA, AFTER min thickness floor

  governingCase: DesignCaseKey;

  tCalcGoverning: number; // governing dari tCalc (sebelum min), berguna buat debug/trend fisika
  tRequired: number; // governing dari tRequiredByCase (sesudah min), dipakai untuk OK/NOT OK

  tAdopted: number;
  utilization: number; // tRequired / tAdopted
  status: "OK" | "NOT OK";
}

export interface ShellCalcResult {
  units: Units;
  standard: Standard;
  method: string;

  courseCount: number;
  results: CourseResult[];

  notes: string[];
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const clampFinite = (x: number) => (Number.isFinite(x) ? x : Number.POSITIVE_INFINITY);

export function runShellThickness(input: ShellCalcInput): ShellCalcResult {
  const notes: string[] = [];

  const E = input.jointEfficiency;
  if (!(E > 0 && E <= 1)) {
    throw new Error("Joint efficiency (E) harus berada pada rentang (0, 1].");
  }

  const courseCount = input.courses.length;
  if (input.adoptedThicknesses.length !== courseCount) {
    throw new Error("Jumlah adopted thickness harus sama dengan jumlah courses.");
  }

  // offsets for API 650 one-foot method
  const offset = input.units === "SI" ? 0.3 : 1.0; // m or ft
  const constantSI = 4.9; // API 650 SI form (mm)
  const constantUS = 2.6; // API 650 US form (inch)

  const ca = input.corrosionAllowance;
  const minWithCA = input.minNominalThickness + ca;

  if (input.standard === "API_650") {
    notes.push("API 650: One-Foot Method (evaluasi head pada 0.3 m / 1 ft di atas seam bawah tiap course).");
    notes.push("Engine menghitung tCalc (rumus+CA) dan tRequired (max(tCalc, minNominal+CA)) agar trend fisika tetap terlihat.");
    notes.push("Untuk tahap awal, internal pressure diabaikan (umumnya near-atmospheric).");
  } else {
    notes.push("API 620: pendekatan hoop stress berbasis thin-walled cylinder (P_total = P_internal + P_hydrostatic).");
    notes.push("Engine menghitung tCalc (rumus+CA) dan tRequired (max(tCalc, minNominal+CA)) agar output traceable.");
    notes.push("External pressure/vacuum buckling check belum di-cover pada tahap ini (akan masuk modul stabilitas).");
  }

  const results: CourseResult[] = [];

  for (let i = 0; i < courseCount; i++) {
    const courseNo = i + 1;
    const bottomElevation = sum(input.courses.slice(0, i)); // bottom seam elevation untuk course i
    const courseHeight = input.courses[i];

    const tCalcByCase: Partial<Record<DesignCaseKey, number>> = {};
    const tRequiredByCase: Partial<Record<DesignCaseKey, number>> = {};
    const requiredByCase: Partial<Record<DesignCaseKey, number>> = {}; // alias/backward compat

    // Governing untuk tCalc (sebelum floor)
    let governingCaseCalc: DesignCaseKey = input.activeCases[0]?.key ?? "operating";
    let governingCalc = 0;

    // Governing untuk tRequired (sesudah floor)
    let governingCaseReq: DesignCaseKey = input.activeCases[0]?.key ?? "operating";
    let governingReq = 0;

    for (const c of input.activeCases) {
      const liquidHeight = c.liquidHeight; // harus dari bottom tank, bukan per-course

      // Depth above bottom seam of this course (ketinggian cairan di atas seam bawah course tsb)
      const depthAboveSeam = Math.max(0, liquidHeight - bottomElevation);

      // One-foot evaluation point offset (evaluasi pada 0.3 m / 1 ft di atas seam)
      const H_eff = Math.max(0, depthAboveSeam - offset);

      const isHydrotest = c.key === "hydrotest";
      const G = isHydrotest ? 1.0 : input.specificGravity;
      const S = isHydrotest ? input.allowableStressTest : input.allowableStressDesign;

      let tCalc = 0; // incl CA, BEFORE min thickness floor

      if (input.standard === "API_650") {
        if (input.units === "SI") {
          // t (mm) = (4.9 * D(m) * (H-0.3)(m) * G) / (S(MPa)*E) + CA(mm)
          tCalc = (constantSI * input.diameter * H_eff * G) / (S * E) + ca;
        } else {
          // t (in) = (2.6 * D(ft) * (H-1)(ft) * G) / (S(psi)*E) + CA(in)
          tCalc = (constantUS * input.diameter * H_eff * G) / (S * E) + ca;
        }
      } else {
        // API 620 (simplified hoop stress basis)
        // P_hydro:
        //  SI: ~9.80665 kPa per meter water head
        //  US: ~0.433 psi per ft water head
        const P_hydro =
          input.units === "SI"
            ? 9.80665 * G * H_eff // kPa
            : 0.433 * G * H_eff; // psi

        // Internal pressure: gunakan designPressure untuk case non-hydrotest dan non-empty
        const isEmptyCase = c.key === "empty_wind" || c.key === "empty_seismic";
        const P_int = isHydrotest || isEmptyCase ? 0 : Math.max(0, input.designPressure);

        const P_total = P_int + P_hydro;

        if (input.units === "SI") {
          // SI: gunakan MPa dan mm
          const P_MPa = P_total / 1000; // kPa -> MPa
          const R_mm = (input.diameter * 1000) / 2; // m -> mm

          const denom = S * E - 0.6 * P_MPa;
          if (denom <= 0) {
            tCalc = Number.POSITIVE_INFINITY;
          } else {
            tCalc = (P_MPa * R_mm) / denom + ca; // mm
          }
        } else {
          // US: gunakan psi dan inch
          const R_in = input.diameter * 6; // D(ft) -> R(in): D*12/2
          const denom = S * E - 0.6 * P_total;
          if (denom <= 0) {
            tCalc = Number.POSITIVE_INFINITY;
          } else {
            tCalc = (P_total * R_in) / denom + ca; // inch
          }
        }
      }

      tCalc = clampFinite(tCalc);

      // AFTER min thickness floor
      const tReq = Math.max(tCalc, minWithCA);

      tCalcByCase[c.key] = tCalc;
      tRequiredByCase[c.key] = tReq;
      requiredByCase[c.key] = tReq; // backward compat

      // Governing tCalc
      if (tCalc > governingCalc) {
        governingCalc = tCalc;
        governingCaseCalc = c.key;
      }

      // Governing tRequired
      if (tReq > governingReq) {
        governingReq = tReq;
        governingCaseReq = c.key;
      }
    }

    const tAdopted = input.adoptedThicknesses[i];
    const utilization = tAdopted > 0 ? governingReq / tAdopted : Number.POSITIVE_INFINITY;
    const status: "OK" | "NOT OK" = tAdopted >= governingReq ? "OK" : "NOT OK";

    results.push({
      courseNo,
      courseHeight,
      bottomElevation,

      tCalcByCase,
      tRequiredByCase,
      requiredByCase,

      governingCase: governingCaseReq,
      tCalcGoverning: governingCalc,
      tRequired: governingReq,

      tAdopted,
      utilization,
      status,
    });
  }

  return {
    units: input.units,
    standard: input.standard,
    method: input.standard === "API_650" ? "API 650 One-Foot Method" : "API 620 Hoop Stress Basis",
    courseCount,
    results,
    notes,
  };
}
