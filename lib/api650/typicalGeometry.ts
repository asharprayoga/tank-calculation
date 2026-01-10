// lib/api650/typicalGeometry.ts

export type Units = "SI" | "US";

export type CoursePresetKey = "SI_1800" | "SI_2400" | "US_72" | "US_96";

export interface HeightOption {
  courses: number;     // jumlah course
  shellHeight: number; // total shell height (m / ft)
}

export interface CoursePreset {
  key: CoursePresetKey;
  label: string;
  units: Units;

  courseHeight: number; // 1.8 / 2.4 (m) atau 6 / 8 (ft)
  lengthUnit: "m" | "ft";

  // pilihan header "Tank Height / Number of Courses"
  heightOptions: HeightOption[];

  // untuk modal referensi
  tableTitle: string;
  tableImageSrc: string; // taruh di /public
}

export const API650_DIAMETERS: Record<Units, number[]> = {
  SI: [3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 18, 21, 24, 27, 30, 36, 42, 48, 54, 60, 66],
  US: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220],
};

const makeHeightOptions = (courseHeight: number, minCourses: number, maxCourses: number) => {
  const out: HeightOption[] = [];
  for (let n = minCourses; n <= maxCourses; n++) {
    out.push({
      courses: n,
      shellHeight: courseHeight * n,
    });
  }
  return out;
};

export const API650_COURSE_PRESETS: CoursePreset[] = [
  {
    key: "SI_1800",
    units: "SI",
    label: "1800 mm course (1.8 m) — Table A.1a (SI)",
    courseHeight: 1.8,
    lengthUnit: "m",
    heightOptions: makeHeightOptions(1.8, 2, 10),
    tableTitle: "API 650 — Table A.1a (SI), 1800-mm courses",
    tableImageSrc: "/api650/table-a1a-si-1800.png",
  },
  {
    key: "SI_2400",
    units: "SI",
    label: "2400 mm course (2.4 m) — Table A.2a (SI)",
    courseHeight: 2.4,
    lengthUnit: "m",
    heightOptions: makeHeightOptions(2.4, 2, 8),
    tableTitle: "API 650 — Table A.2a (SI), 2400-mm courses",
    tableImageSrc: "/api650/table-a2a-si-2400.png",
  },
  {
    key: "US_72",
    units: "US",
    label: "72 in course (6 ft) — Table A.1b (US)",
    courseHeight: 6,
    lengthUnit: "ft",
    heightOptions: makeHeightOptions(6, 2, 10),
    tableTitle: "API 650 — Table A.1b (US), 72-in courses",
    tableImageSrc: "/api650/table-a1b-us-72.png",
  },
  {
    key: "US_96",
    units: "US",
    label: "96 in course (8 ft) — Table A.2b (US)",
    courseHeight: 8,
    lengthUnit: "ft",
    heightOptions: makeHeightOptions(8, 2, 8),
    tableTitle: "API 650 — Table A.2b (US), 96-in courses",
    tableImageSrc: "/api650/table-a2b-us-96.png",
  },
];

export function getPresetsByUnits(units: Units) {
  return API650_COURSE_PRESETS.filter((p) => p.units === units);
}

export function getPresetByKey(key: CoursePresetKey) {
  return API650_COURSE_PRESETS.find((p) => p.key === key) ?? null;
}

export function inferPresetKeyFromCourses(units: Units, courses: number[]): CoursePresetKey | null {
  if (!courses.length) return null;
  const h = courses[0];
  const allSame = courses.every((x) => Math.abs(x - h) < 1e-9);
  if (!allSame) return null;

  if (units === "SI") {
    if (Math.abs(h - 1.8) < 1e-9) return "SI_1800";
    if (Math.abs(h - 2.4) < 1e-9) return "SI_2400";
  } else {
    if (Math.abs(h - 6) < 1e-9) return "US_72";
    if (Math.abs(h - 8) < 1e-9) return "US_96";
  }
  return null;
}
