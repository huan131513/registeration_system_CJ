import * as XLSX from "xlsx";

export function parseAttendance(buffer: ArrayBuffer): {
  persons: { name: string; phone: string }[];
  names: string[];
  error?: string;
} {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    // Auto-detect header row (search first 10 rows for a cell containing "姓名")
    let nameCol = 1; // fallback: column B
    let phoneCol = -1;
    let dataStartRow = 4; // fallback: row 5

    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      if (!row) continue;
      const nameIdx = row.findIndex((cell) => String(cell ?? "").includes("姓名"));
      if (nameIdx >= 0) {
        nameCol = nameIdx;
        dataStartRow = i + 1;
        // Find phone column in same header row (exclude 緊急聯絡人電話)
        phoneCol = row.findIndex(
          (cell) =>
            String(cell ?? "").includes("電話") &&
            !String(cell ?? "").includes("緊急")
        );
        break;
      }
    }

    const persons: { name: string; phone: string }[] = [];

    for (let i = dataStartRow; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[nameCol]) {
        const name = String(row[nameCol]).trim();
        const phone =
          phoneCol >= 0 && row[phoneCol]
            ? String(row[phoneCol]).trim()
            : "";
        if (name) persons.push({ name, phone });
      }
    }

    if (persons.length === 0) {
      return {
        persons: [],
        names: [],
        error: "上課名單中沒有找到學員姓名（請確認格式是否正確）",
      };
    }

    return { persons, names: persons.map((p) => p.name) };
  } catch {
    return {
      persons: [],
      names: [],
      error: "無法解析上課名單檔案，請確認檔案格式是否正確",
    };
  }
}
