import * as XLSX from "xlsx";
import { LotteryResultItem, PointsEntry } from "./types";

const TYPE_LABELS: Record<string, string> = {
  direct: "直接錄取",
  exemption: "免抽籤",
  volunteer_lottery: "志工抽籤",
  general_lottery: "一般抽籤",
  waitlist: "備取",
};

export function generateResultXlsx(
  results: LotteryResultItem[],
  courseName: string
): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    "序號",
    "姓名",
    "電話",
    "性別",
    "緊急聯絡人姓名",
    "緊急聯絡人電話",
    "年齡",
    "學歷",
    "錄取類別",
  ];

  const admitted = results.filter((r) => r.admissionType !== "waitlist");
  const waitlisted = results.filter((r) => r.admissionType === "waitlist");

  let admitCounter = 1;
  let waitlistCounter = 1;

  const rows = [...admitted, ...waitlisted].map((r) => {
    const isWaitlist = r.admissionType === "waitlist";
    const label = isWaitlist ? `備取${waitlistCounter++}` : `正取${admitCounter++}`;
    return [
      label,
      r.name,
      r.phone,
      r.gender,
      r.emergencyName,
      r.emergencyPhone,
      r.age,
      r.education,
      TYPE_LABELS[r.admissionType] || r.admissionType,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws["!cols"] = [
    { wch: 8 },
    { wch: 10 },
    { wch: 15 },
    { wch: 6 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, courseName || "抽籤結果");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}

export function generateAttendanceXlsx(
  year: string,
  semester: string,
  courseName: string,
  students: { name: string; gender: string }[],
  dates: string[]
): Buffer {
  const wb = XLSX.utils.book_new();
  const totalCols = 3 + (dates.length || 1);

  const titleRow = [
    `${courseName} 學員點名單`,
    ...Array(totalCols - 1).fill(""),
  ];
  const emptyRow = Array(totalCols).fill("");
  const classRow = [`  ${year}年度前金樂齡學習中心-${semester}班`, ...Array(totalCols - 1).fill("")];
  const headerRow = ["序號", "姓名", "性別", ...dates];
  const studentRows = students.map((s, i) => [
    String(i + 1),
    s.name,
    s.gender,
    ...Array(dates.length || 1).fill(""),
  ]);

  const aoa = [titleRow, emptyRow, classRow, headerRow, ...studentRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
  ];

  ws["!cols"] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 6 },
    ...Array(dates.length || 1).fill({ wch: 8 }),
  ];

  ws["!rows"] = [
    { hpt: 40 },
    { hpt: 6 },
    { hpt: 22 },
    { hpt: 18 },
  ];

  const sheetName = `${year}${semester}-${courseName}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}

export function generatePointsXlsx(
  updatedPoints: PointsEntry[]
): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = ["姓名", "積分"];
  const rows = updatedPoints.map((p) => [p.name, p.points]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws["!cols"] = [
    { wch: 12 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "積分表");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}
