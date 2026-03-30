const REGISTRATION_HEADERS = [
  "姓名",
  "電話（儘量填手機）",
  "性別",
  "緊急聯絡人姓名",
  "緊急聯絡人電話（儘量填手機）",
  "年齡",
  "學歷",
  "是否為本校志工",
];

const POINTS_HEADERS = ["姓名", "積分"];

export function validateRegistrationHeaders(headers: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  for (const required of REGISTRATION_HEADERS) {
    if (!headers.some((h) => h.includes(required.replace("（儘量填手機）", "")))) {
      missing.push(required);
    }
  }
  return { valid: missing.length === 0, missing };
}

export function validatePointsHeaders(headers: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  for (const required of POINTS_HEADERS) {
    if (!headers.some((h) => h.includes(required))) {
      missing.push(required);
    }
  }
  return { valid: missing.length === 0, missing };
}
