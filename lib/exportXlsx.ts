import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
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

export async function generateAttendanceXlsx(
  year: string,
  semester: string,
  courseName: string,
  students: { name: string; gender: string }[],
  dates: string[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const totalCols = 3 + (dates.length || 1);
  const sheetName = `${year}${semester}-${courseName}`.slice(0, 31);
  const ws = wb.addWorksheet(sheetName);

  const colWidths = [6.0, 11.44140625, 6.77734375, 15.77734375, 13.0, 13.0];
  for (let i = 1; i <= totalCols; i++) {
    ws.getColumn(i).width = colWidths[i - 1] ?? 15.77734375;
  }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  const applyStyle = (cell: ExcelJS.Cell) => {
    cell.font = { name: "新細明體", size: 12 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  };

  // Row 1: Title
  const titleRow = ws.addRow([
    `${year}年度前金樂齡學習中心-${semester}班學員點名單`,
    ...Array(totalCols - 1).fill(""),
  ]);
  titleRow.height = 40.05;
  ws.mergeCells(1, 1, 1, totalCols);

  // Row 2: Class info
  const classRow = ws.addRow([
    `班別：${courseName}`,
    ...Array(totalCols - 1).fill(""),
  ]);
  classRow.height = 30;
  ws.mergeCells(2, 1, 2, totalCols);

  // Row 3: Headers
  const headerRow = ws.addRow(["序號", "姓名", "性別", ...dates]);
  headerRow.height = 30;

  // Student rows
  students.forEach((s, i) => {
    const row = ws.addRow([
      String(i + 1),
      s.name,
      s.gender,
      ...Array(dates.length || 1).fill(""),
    ]);
    row.height = 30;
  });

  ws.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      applyStyle(cell);
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
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
