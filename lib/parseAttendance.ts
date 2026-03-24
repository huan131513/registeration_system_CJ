import * as XLSX from "xlsx";

export function parseAttendance(buffer: ArrayBuffer): {
  names: string[];
  error?: string;
} {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    // Student names are in column B (index 1), starting from row 5 (index 4)
    const names: string[] = [];

    for (let i = 4; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[1]) {
        const name = String(row[1]).trim();
        if (name) names.push(name);
      }
    }

    if (names.length === 0) {
      return { names: [], error: "上課名單中沒有找到學員姓名（預期在 B5 起）" };
    }

    return { names };
  } catch {
    return { names: [], error: "無法解析上課名單檔案，請確認檔案格式是否正確" };
  }
}
