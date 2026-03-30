"use client";

import { Registrant, PointsEntry } from "@/lib/types";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  registrants: Registrant[];
  pointsTable: PointsEntry[];
  excludedNames: string[]; // composite keys "姓名|電話"
  directAdmitNames: string[];
  courseName: string;
  totalQuota: number;
  volunteerSlots: number;
  waitlistSlots: number;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading,
  registrants,
  excludedNames,
  directAdmitNames,
  courseName,
  totalQuota,
  volunteerSlots,
  waitlistSlots,
}: ConfirmationModalProps) {
  if (!open) return null;

  // Filter eligible by name+phone composite key
  const excludedSet = new Set(excludedNames.map((k) => k.trim()));
  const eligible = registrants.filter(
    (r) => !excludedSet.has(`${r.name}|${r.phone}`)
  );
  const volunteers = eligible.filter(
    (r) => r.volunteerStatus === "樂齡志工" || r.volunteerStatus === "志工團" || r.volunteerStatus === "故事媽媽"
  );
  const exemptions = eligible.filter((r) => r.lotteryExemption === "是");

  const stats = [
    { label: "課程名稱", value: courseName || "未命名", highlight: false },
    { label: "報名總人數", value: `${registrants.length} 人`, highlight: false },
    {
      label: "排除人數（已上過課）",
      value: `${excludedNames.length} 人`,
      highlight: excludedNames.length > 0,
    },
    { label: "合格報名人數", value: `${eligible.length} 人`, highlight: true },
    { label: "直接錄取", value: `${directAdmitNames.length} 人`, highlight: false },
    { label: "申請免抽籤", value: `${exemptions.length} 人`, highlight: false },
    { label: "志工人數", value: `${volunteers.length} 人`, highlight: false },
    { label: "總錄取名額", value: `${totalQuota} 人`, highlight: true },
    { label: "志工優先名額", value: `${volunteerSlots} 人`, highlight: false },
    { label: "備取名額", value: `${waitlistSlots} 人`, highlight: false },
  ];

  // Stagger: all items visible within 2s
  const totalDuration = 2000;
  const itemDelay = totalDuration / stats.length; // ~200ms between items
  const itemDuration = 400; // each item's own fade+slide duration (ms)

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in-95">
          <h2 className="text-xl font-bold text-gray-800 mb-1">確認抽籤資訊</h2>
          <p className="text-sm text-gray-500 mb-6">
            請確認以下資訊無誤後，點擊「開始抽籤」
          </p>

          <div className="space-y-2.5 mb-8">
            {stats.map((s, index) => (
              <div
                key={s.label}
                style={{
                  opacity: 0,
                  animation: `fadeSlideIn ${itemDuration}ms ease forwards`,
                  animationDelay: `${index * itemDelay}ms`,
                }}
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl ${
                  s.highlight ? "bg-indigo-50" : "bg-gray-50"
                }`}
              >
                <span className="text-sm text-gray-600">{s.label}</span>
                <span
                  className={`text-sm font-semibold ${
                    s.highlight ? "text-indigo-700" : "text-gray-800"
                  }`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              上一步
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  抽籤中...
                </>
              ) : (
                "🎲 開始抽籤"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
