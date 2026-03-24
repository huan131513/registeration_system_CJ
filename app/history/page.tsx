"use client";

import { useEffect, useState } from "react";
import { LotteryResultItem } from "@/lib/types";

interface LotteryRunSummary {
  id: string;
  courseName: string;
  totalQuota: number;
  volunteerSlots: number;
  waitlistSlots: number;
  totalRegistrants: number;
  excludedCount: number;
  directAdmitCount: number;
  exemptionCount: number;
  createdAt: string;
  _count: { results: number };
}

interface LotteryRunDetail extends Omit<LotteryRunSummary, "_count"> {
  results: LotteryResultItem[];
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  direct: { label: "直接錄取", color: "bg-purple-100 text-purple-700" },
  exemption: { label: "免抽籤", color: "bg-blue-100 text-blue-700" },
  volunteer_lottery: { label: "志工抽籤", color: "bg-emerald-100 text-emerald-700" },
  general_lottery: { label: "一般抽籤", color: "bg-gray-100 text-gray-700" },
  waitlist: { label: "備取", color: "bg-amber-100 text-amber-700" },
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<LotteryRunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<LotteryRunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setRuns(data.runs || []))
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    setSelectedRun(data.run);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">歷史紀錄</h1>
            <p className="text-sm text-gray-500 mt-0.5">查看過去的抽籤結果</p>
          </div>
          <a
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            ← 返回抽籤
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400">載入中...</div>
        ) : runs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">尚無抽籤紀錄</p>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <div
                key={run.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loadDetail(run.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {run.courseName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(run.createdAt).toLocaleString("zh-TW")}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                      報名 {run.totalRegistrants} 人
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      錄取 {run.totalQuota} 人
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 font-medium">
                      結果 {run._count.results} 筆
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedRun(null)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedRun.courseName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(selectedRun.createdAt).toLocaleString("zh-TW")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRun(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">序號</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">姓名</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">電話</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">性別</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">年齡</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">類別</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRun.results.map((r, i) => (
                      <tr
                        key={r.name + i}
                        className={`border-b border-gray-100 ${
                          r.admissionType === "waitlist" ? "bg-gray-50/70" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-500">
                          {r.admissionType === "waitlist" ? `備${r.order}` : i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                        <td className="px-4 py-3 text-gray-600">{r.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{r.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{r.age}</td>
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
