import * as XLSX from "xlsx";
import { Registrant } from "./types";
import { validateRegistrationHeaders } from "./validators";

export function parseRegistration(buffer: ArrayBuffer): {
  data: Registrant[];
  error?: string;
} {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    if (rows.length < 2) {
      return { data: [], error: "報名表單內容為空" };
    }

    const headers = rows[0].map((h) => String(h || "").trim());
    const validation = validateRegistrationHeaders(headers);
    if (!validation.valid) {
      return {
        data: [],
        error: `報名表單缺少欄位：${validation.missing.join("、")}`,
      };
    }

    const findCol = (keyword: string) =>
      headers.findIndex((h) => h.includes(keyword));

    const colName = findCol("姓名");
    const colPhone = findCol("電話");
    const colGender = findCol("性別");
    const colEmergencyName = headers.findIndex(
      (h) => h.includes("緊急聯絡人") && h.includes("姓名")
    );
    const colEmergencyPhone = headers.findIndex(
      (h) => h.includes("緊急聯絡人") && h.includes("電話")
    );
    const colAge = findCol("年齡");
    const colEducation = findCol("學歷");
    const colVolunteer = findCol("志工");
    const colConsent = findCol("同意");
    const colExemption = findCol("免抽籤");
    const colTimestamp = findCol("時間");

    const data: Registrant[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[colName]) continue;

      data.push({
        timestamp: String(row[colTimestamp] || ""),
        name: String(row[colName] || "").trim(),
        phone: String(row[colPhone] || "").trim(),
        gender: String(row[colGender] || "").trim(),
        emergencyName: String(row[colEmergencyName] || "").trim(),
        emergencyPhone: String(row[colEmergencyPhone] || "").trim(),
        age: String(row[colAge] || "").trim(),
        education: String(row[colEducation] || "").trim(),
        volunteerStatus: String(row[colVolunteer] || "").trim(),
        consent: String(row[colConsent] || "").trim(),
        lotteryExemption: String(row[colExemption] || "").trim(),
      });
    }

    return { data };
  } catch {
    return { data: [], error: "無法解析報名表單檔案，請確認檔案格式是否正確" };
  }
}
