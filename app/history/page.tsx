"use client";

import { useEffect, useState } from "react";
import { LotteryResultItem } from "@/lib/types";

interface LotteryRunSummary {
  id: string;
  courseName: string;
  year: string;
  semester: string;
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
  direct:           { label: "直接錄取", color: "bg-purple-100 text-purple-700" },
  volunteer_lottery:{ label: "志工抽籤", color: "bg-emerald-100 text-emerald-700" },
  exemption:        { label: "免抽籤",   color: "bg-blue-100 text-blue-700" },
  general_lottery:  { label: "一般抽籤", color: "bg-gray-100 text-gray-700" },
  waitlist:         { label: "備取",     color: "bg-amber-100 text-amber-700" },
};

const TYPE_ORDER: Record<string, number> = {
  direct: 0,
  volunteer_lottery: 1,
  exemption: 2,
  general_lottery: 3,
  waitlist: 4,
};

function sortResults(results: LotteryResultItem[]): LotteryResultItem[] {
  return [...results].sort((a, b) => {
    const ao = TYPE_ORDER[a.admissionType] ?? 99;
    const bo = TYPE_ORDER[b.admissionType] ?? 99;
    if (ao !== bo) return ao - bo;
    return a.order - b.order;
  });
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<LotteryRunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<LotteryRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        const list: LotteryRunSummary[] = data.runs || [];
        setRuns(list);
        // auto-open all folders
        const folders = new Set(list.map((r) => folderKey(r)));
        setOpenFolders(folders);
      })
      .finally(() => setLoading(false));
  }, []);

  const folderKey = (run: LotteryRunSummary) =>
    run.year && run.semester ? `${run.year}年 ${run.semester}` : "未分類";

  // Group runs by year+semester
  const grouped = runs.reduce<Record<string, LotteryRunSummary[]>>((acc, run) => {
    const key = folderKey(run);
    if (!acc[key]) acc[key] = [];
    acc[key].push(run);
    return acc;
  }, {});

  // Sort folder keys: newest year+semester first
  const folderKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a, "zh-TW"));

  const toggleFolder = (key: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    setSelectedRun(data.run);
  };

  const handleExport = async (run: LotteryRunSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setExportingId(run.id);
    try {
      // Load full results
      const res = await fetch(`/api/history/${run.id}`);
      const data = await res.json();
      const detail: LotteryRunDetail = data.run;
      const sorted = sortResults(detail.results);

      const exportRes = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: sorted,
          courseName: detail.courseName,
          exportType: "results",
        }),
      });
      if (!exportRes.ok) return;
      const blob = await exportRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${detail.year}${detail.semester}${detail.courseName || "抽籤結果"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("匯出失敗，請重試");
    } finally {
      setExportingId(null);
    }
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
            {folderKeys.map((key) => (
              <div key={key} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Folder header */}
                <button
                  type="button"
                  onClick={() => toggleFolder(key)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-transform duration-200 ${openFolders.has(key) ? "rotate-90" : "rotate-0"}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                    </svg>
                    <span className="font-semibold text-gray-800">{key}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {grouped[key].length} 筆
                    </span>
                  </div>
                </button>

                {/* Folder contents */}
                {openFolders.has(key) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {grouped[key].map((run) => (
                      <div
                        key={run.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => loadDetail(run.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{run.courseName}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(run.createdAt).toLocaleString("zh-TW")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                            報名 {run.totalRegistrants} 人
                          </span>
                          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                            錄取 {run.totalQuota} 人
                          </span>
                          <button
                            type="button"
                            disabled={exportingId === run.id}
                            onClick={(e) => handleExport(run, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            {exportingId === run.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                            匯出
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    {selectedRun.year && selectedRun.semester
                      ? `${selectedRun.year}年 ${selectedRun.semester}・`
                      : ""}
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
                    {sortResults(selectedRun.results).map((r, i) => (
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
