"use client";

import { useState } from "react";
import { LotteryResultItem, PointsEntry, LotteryStats } from "@/lib/types";
import PointsTableSection from "./PointsTableSection";

interface ResultsTableProps {
  results: LotteryResultItem[];
  courseName: string;
  originalPoints: PointsEntry[];
  updatedPoints: PointsEntry[];
  stats: LotteryStats | null;
  onExportResults: () => void;
  onExportPoints: () => void;
  onReset: () => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  direct: { label: "直接錄取", color: "bg-purple-100 text-purple-700" },
  exemption: { label: "免抽籤", color: "bg-blue-100 text-blue-700" },
  volunteer_lottery: { label: "志工抽籤", color: "bg-emerald-100 text-emerald-700" },
  general_lottery: { label: "一般抽籤", color: "bg-gray-100 text-gray-700" },
  waitlist: { label: "備取", color: "bg-amber-100 text-amber-700" },
};

function NameList({ names, emptyText = "（無）" }: { names: string[]; emptyText?: string }) {
  if (names.length === 0) return <span className="text-gray-400 text-xs">{emptyText}</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {names.map((n) => (
        <span key={n} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
          {n}
        </span>
      ))}
    </div>
  );
}

function ReportSection({ title, color, count, children }: { title: string; color: string; count: number; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">{count} 人</span>
      </div>
      {children}
    </div>
  );
}

export default function ResultsTable({
  results,
  courseName,
  originalPoints,
  updatedPoints,
  stats,
  onExportResults,
  onExportPoints,
  onReset,
}: ResultsTableProps) {
  const [showReport, setShowReport] = useState(false);
  const admitted = results.filter((r) => r.admissionType !== "waitlist");
  const waitlisted = results.filter((r) => r.admissionType === "waitlist");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {courseName || "抽籤結果"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            正取 {admitted.length} 人、備取 {waitlisted.length} 人
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={onExportResults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            匯出抽籤結果
          </button>
          <button
            type="button"
            onClick={onExportPoints}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            匯出更新積分表
          </button>
          {stats && (
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                showReport
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              抽籤紀錄報告
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            回首頁
          </button>
        </div>
      </div>

      {/* Lottery Report Card */}
      {showReport && stats && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 space-y-5">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            抽籤紀錄報告
          </h3>

          {/* 資料前處理 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">資料前處理</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {[
                { label: "總報名人數", value: stats.totalRegistrants },
                { label: "已排除（上過課）", value: stats.excludedCount },
                { label: "有效報名人數", value: stats.eligibleCount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl px-4 py-3 border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {stats.excludedCount > 0 && (
              <ReportSection title="已刪除（排除）的學員" color="bg-red-50" count={stats.excludedCount}>
                <NameList names={stats.excludedNames} />
              </ReportSection>
            )}
          </div>

          {/* 抽籤過程 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">抽籤過程</p>
            <div className="space-y-3">
              {stats.directAdmitCount > 0 && (
                <ReportSection title="直接錄取（優先錄取）" color="bg-purple-50" count={stats.directAdmitCount}>
                  <NameList names={stats.directAdmitNames} />
                </ReportSection>
              )}
              {stats.exemptionCount > 0 && (
                <ReportSection title="免抽籤錄取" color="bg-blue-50" count={stats.exemptionCount}>
                  <NameList names={stats.exemptedNames} />
                </ReportSection>
              )}
              <ReportSection title="志工名額抽籤 — 抽中" color="bg-emerald-50" count={stats.volunteerDrawnCount}>
                <NameList names={stats.drawnVolunteerNames} emptyText="（無志工抽中）" />
              </ReportSection>
              {stats.undrawnVolunteerNames.length > 0 && (
                <ReportSection title="未抽中的志工（回放至大眾池）" color="bg-teal-50" count={stats.undrawnVolunteerNames.length}>
                  <NameList names={stats.undrawnVolunteerNames} />
                </ReportSection>
              )}
              <ReportSection title="一般抽籤 — 抽中" color="bg-gray-100" count={stats.generalDrawnCount}>
                <NameList names={stats.generalDrawnNames} emptyText="（無一般抽中）" />
              </ReportSection>
              {stats.waitlistCount > 0 && (
                <ReportSection title="備取名單" color="bg-amber-50" count={stats.waitlistCount}>
                  <NameList names={stats.waitlistedNames} />
                </ReportSection>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lottery results table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">序號</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">姓名</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">電話</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">性別</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">緊急聯絡人</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">緊急聯絡人電話</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">年齡</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">學歷</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">類別</th>
            </tr>
          </thead>
          <tbody>
            {admitted.map((r, i) => (
              <tr
                key={`admitted-${r.name}-${i}`}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-800 font-medium">正取{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.phone}</td>
                <td className="px-4 py-3 text-gray-600">{r.gender}</td>
                <td className="px-4 py-3 text-gray-600">{r.emergencyName}</td>
                <td className="px-4 py-3 text-gray-600">{r.emergencyPhone}</td>
                <td className="px-4 py-3 text-gray-600">{r.age}</td>
                <td className="px-4 py-3 text-gray-600">{r.education}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      TYPE_LABELS[r.admissionType]?.color || ""
                    }`}
                  >
                    {TYPE_LABELS[r.admissionType]?.label || r.admissionType}
                  </span>
                </td>
              </tr>
            ))}
            {waitlisted.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    備取名單
                  </td>
                </tr>
                {waitlisted.map((r, i) => (
                  <tr
                    key={`waitlist-${r.name}-${i}`}
                    className="bg-gray-50/70 border-b border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-500 font-medium">備取{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-500">{r.name}</td>
                    <td className="px-4 py-3 text-gray-400">{r.phone}</td>
                    <td className="px-4 py-3 text-gray-400">{r.gender}</td>
                    <td className="px-4 py-3 text-gray-400">{r.emergencyName}</td>
                    <td className="px-4 py-3 text-gray-400">{r.emergencyPhone}</td>
                    <td className="px-4 py-3 text-gray-400">{r.age}</td>
                    <td className="px-4 py-3 text-gray-400">{r.education}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        備取
                      </span>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Updated points table */}
      <PointsTableSection
        originalPoints={originalPoints}
        updatedPoints={updatedPoints}
        courseName={courseName}
      />
    </div>
  );
}
