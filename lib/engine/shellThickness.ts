// lib/engine/shellThickness.ts

import type { DesignCaseKey } from "../storage/projectDraft";

export type Units = "SI" | "US";
export type Standard = "API_650" | "API_620";

export interface ShellCaseInput {
  key: DesignCaseKey;
  liquidHeight: number; // SI: m, US: ft
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
  minNominalThickness: number; // SI: mm, US: in (excluding CA)
  adoptedThicknesses: number[]; // SI: mm, US: in (nominal incl CA assumed)

  activeCases: ShellCaseInput[];
}

export interface CourseResult {
  courseNo: number;
  courseHeight: number;
  bottomElevation: number;

  requiredByCase: Partial<Record<DesignCaseKey, number>>; // thickness nominal incl CA
  governingCase: DesignCaseKey;
  tRequired: number; // nominal incl CA, min applied

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
    notes.push("Untuk tahap awal, internal pressure diabaikan (umumnya near-atmospheric).");
  } else {
    notes.push("API 620: pendekatan hoop stress berbasis thin-walled cylinder (P_total = P_internal + P_hydrostatic).");
    notes.push("External pressure/vacuum buckling check belum di-cover pada tahap ini (akan masuk modul stabilitas).");
  }

  const results: CourseResult[] = [];

  for (let i = 0; i < courseCount; i++) {
    const courseNo = i + 1;
    const bottomElevation = sum(input.courses.slice(0, i));
    const courseHeight = input.courses[i];

    const requiredByCase: Partial<Record<DesignCaseKey, number>> = {};

    let governingCase: DesignCaseKey = input.activeCases[0]?.key ?? "operating";
    let governingReq = 0;

    for (const c of input.activeCases) {
      const liquidHeight = c.liquidHeight;

      // Depth above bottom seam of this course
      const depthAboveSeam = Math.max(0, liquidHeight - bottomElevation);

      // One-foot evaluation point offset
      const H_eff = Math.max(0, depthAboveSeam - offset);

      const isHydrotest = c.key === "hydrotest";
      const G = isHydrotest ? 1.0 : input.specificGravity;

      const S = isHydrotest ? input.allowableStressTest : input.allowableStressDesign;

      let tReq = 0;

      if (input.standard === "API_650") {
        if (input.units === "SI") {
          // t (mm) = (4.9 * D(m) * (H-0.3)(m) * G) / (S(MPa)*E) + CA(mm)
          tReq = (constantSI * input.diameter * H_eff * G) / (S * E) + ca;
        } else {
          // t (in) = (2.6 * D(ft) * (H-1)(ft) * G) / (S(psi)*E) + CA(in)
          tReq = (constantUS * input.diameter * H_eff * G) / (S * E) + ca;
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

        // Internal pressure: gunakan designPressure untuk case "operating" (dan steamout jika aktif),
        // hydrotest dan empty cases diasumsikan 0 pada tahap ini.
        const isEmptyCase = c.key === "empty_wind" || c.key === "empty_seismic";
        const P_int =
          isHydrotest || isEmptyCase ? 0 : Math.max(0, input.designPressure);

        const P_total = P_int + P_hydro;

        if (input.units === "SI") {
          // SI: gunakan MPa dan mm
          const P_MPa = P_total / 1000; // kPa -> MPa
          const R_mm = (input.diameter * 1000) / 2; // m -> mm

          const denom = S * E - 0.6 * P_MPa;
          if (denom <= 0) {
            tReq = Number.POSITIVE_INFINITY;
          } else {
            tReq = (P_MPa * R_mm) / denom + ca; // mm
          }
        } else {
          // US: gunakan psi dan inch
          const R_in = input.diameter * 6; // D(ft) -> R(in): D*12/2
          const denom = S * E - 0.6 * P_total;
          if (denom <= 0) {
            tReq = Number.POSITIVE_INFINITY;
          } else {
            tReq = (P_total * R_in) / denom + ca; // inch
          }
        }
      }

      // apply minimum nominal thickness (excluding CA) + CA
      const tReqMinApplied = Math.max(tReq, minWithCA);

      requiredByCase[c.key] = tReqMinApplied;

      if (tReqMinApplied >= governingReq) {
        governingReq = tReqMinApplied;
        governingCase = c.key;
      }
    }

    const tAdopted = input.adoptedThicknesses[i];
    const utilization = tAdopted > 0 ? governingReq / tAdopted : Number.POSITIVE_INFINITY;
    const status: "OK" | "NOT OK" = tAdopted >= governingReq ? "OK" : "NOT OK";

    results.push({
      courseNo,
      courseHeight,
      bottomElevation,
      requiredByCase,
      governingCase,
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
