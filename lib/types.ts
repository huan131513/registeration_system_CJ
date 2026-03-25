export interface Registrant {
  timestamp: string;
  name: string;
  phone: string;
  gender: string;
  emergencyName: string;
  emergencyPhone: string;
  age: string;
  education: string;
  volunteerStatus: string;
  consent: string;
  lotteryExemption: string;
}

export interface PointsEntry {
  name: string;
  points: number;
}

export interface LotteryConfig {
  courseName: string;
  year: string;
  semester: string;
  totalQuota: number;
  volunteerSlots: number;
  waitlistSlots: number;
  directAdmitNames: string[];
}

export interface LotteryResultItem {
  name: string;
  phone: string;
  gender: string;
  emergencyName: string;
  emergencyPhone: string;
  age: string;
  education: string;
  admissionType:
    | "direct"
    | "exemption"
    | "volunteer_lottery"
    | "general_lottery"
    | "waitlist";
  order: number;
}

export interface LotteryOutput {
  results: LotteryResultItem[];
  updatedPoints: PointsEntry[];
  stats: {
    totalRegistrants: number;
    excludedCount: number;
    eligibleCount: number;
    directAdmitCount: number;
    exemptionCount: number;
    volunteerCount: number;
    volunteerDrawnCount: number;
    generalDrawnCount: number;
    waitlistCount: number;
  };
}
