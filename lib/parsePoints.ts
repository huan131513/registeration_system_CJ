import * as XLSX from "xlsx";
import { PointsEntry } from "./types";
import { validatePointsHeaders } from "./validators";

export function parsePoints(buffer: ArrayBuffer): {
  data: PointsEntry[];
  error?: string;
} {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    if (rows.length < 2) {
      return { data: [], error: "積分表內容為空" };
    }

    const headers = rows[0].map((h) => String(h || "").trim());
    const validation = validatePointsHeaders(headers);
    if (!validation.valid) {
      return {
        data: [],
        error: `積分表缺少欄位：${validation.missing.join("、")}`,
      };
    }

    const colName = headers.findIndex((h) => h.includes("姓名"));
    const colPoints = headers.findIndex((h) => h.includes("積分"));

    const data: PointsEntry[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[colName]) continue;

      data.push({
        name: String(row[colName]).trim(),
        points: Number(row[colPoints]) || 0,
      });
    }

    return { data };
  } catch {
    return { data: [], error: "無法解析積分表檔案，請確認檔案格式是否正確" };
  }
}
