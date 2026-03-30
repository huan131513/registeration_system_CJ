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
    | "supplemental"
    | "waitlist";
  order: number;
}

export interface LotteryStats {
  totalRegistrants: number;
  excludedCount: number;
  eligibleCount: number;
  directAdmitCount: number;
  exemptionCount: number;
  volunteerCount: number;
  volunteerDrawnCount: number;
  generalDrawnCount: number;
  waitlistCount: number;
  supplementalDrawnCount: number;
  // name lists for the report
  excludedNames: string[];
  directAdmitNames: string[];
  exemptedNames: string[];
  drawnVolunteerNames: string[];
  undrawnVolunteerNames: string[];
  generalDrawnNames: string[];
  supplementalDrawnNames: string[];
  waitlistedNames: string[];
}

export interface LotteryOutput {
  results: LotteryResultItem[];
  updatedPoints: PointsEntry[];
  stats: LotteryStats;
}
