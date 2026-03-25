"use client";

import { useEffect, useRef, useState } from "react";
import { LotteryResultItem } from "@/lib/types";

const SESSION_KEY = "history_authed";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onUnlock();
      } else {
        setError("密碼錯誤，請再試一次");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("網路錯誤，請重試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">歷史紀錄</h2>
        <p className="text-sm text-gray-500 mb-6">請輸入密碼以繼續</p>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="輸入密碼"
          className={`w-full px-4 py-3 rounded-xl border text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition mb-3 ${
            error ? "border-red-300 bg-red-50" : "border-gray-200"
          }`}
        />
        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          {loading ? "驗證中..." : "進入"}
        </button>
        <a href="/" className="block mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回抽籤
        </a>
      </div>
    </div>
  );
}

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
  const [authed, setAuthed] = useState(false);
  const [runs, setRuns] = useState<LotteryRunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<LotteryRunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [processRunId, setProcessRunId] = useState<string | null>(null);
  const [processDetail, setProcessDetail] = useState<LotteryRunDetail | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  // folder rename
  const [folderLabels, setFolderLabels] = useState<Record<string, string>>({});
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  // delete run confirm
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // delete folder confirm
  const [pendingDeleteFolder, setPendingDeleteFolder] = useState<string | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  // Load history once authed
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([
      fetch("/api/history").then((r) => r.json()),
      fetch("/api/history/folder-labels").then((r) => r.json()),
    ])
      .then(([histData, labelData]) => {
        const list: LotteryRunSummary[] = histData.runs || [];
        setRuns(list);
        setFolderLabels(labelData.labels || {});
        const folders = new Set(list.map((r) => folderKey(r)));
        setOpenFolders(folders);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;

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

  const startRename = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingKey(key);
    setRenameValue(folderLabels[key] ?? key);
    setTimeout(() => renameInputRef.current?.select(), 30);
  };

  const commitRename = async () => {
    if (!renamingKey) return;
    const label = renameValue.trim();
    if (!label) { setRenamingKey(null); return; }
    await fetch("/api/history/folder-labels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: renamingKey, label }),
    });
    setFolderLabels((prev) => ({ ...prev, [renamingKey]: label }));
    setRenamingKey(null);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/history/${pendingDeleteId}`, { method: "DELETE" });
      setRuns((prev) => prev.filter((r) => r.id !== pendingDeleteId));
      if (selectedRun?.id === pendingDeleteId) setSelectedRun(null);
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const handleDeleteFolder = async () => {
    if (!pendingDeleteFolder) return;
    setDeletingFolder(true);
    const ids = (grouped[pendingDeleteFolder] ?? []).map((r) => r.id);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/history/${id}`, { method: "DELETE" })));
      setRuns((prev) => prev.filter((r) => folderKey(r) !== pendingDeleteFolder));
      if (selectedRun && ids.includes(selectedRun.id)) setSelectedRun(null);
    } finally {
      setDeletingFolder(false);
      setPendingDeleteFolder(null);
    }
  };

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    setSelectedRun(data.run);
  };

  const toggleProcess = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processRunId === id) { setProcessRunId(null); return; }
    setProcessRunId(id);
    if (processDetail?.id === id) return;
    setProcessLoading(true);
    const res = await fetch(`/api/history/${id}`);
    const data = await res.json();
    setProcessDetail(data.run);
    setProcessLoading(false);
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
      a.download = `${detail.year}${detail.semester}-${detail.courseName || "抽籤結果"}.xlsx`;
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
                <div className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFolder(key)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className={`transition-transform duration-200 shrink-0 ${openFolders.has(key) ? "rotate-90" : "rotate-0"}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                    </svg>
                    {renamingKey === key ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); commitRename(); }
                          if (e.key === "Escape") setRenamingKey(null);
                        }}
                        onBlur={commitRename}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-gray-800 bg-white border border-indigo-400 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0 flex-1"
                      />
                    ) : (
                      <span className="font-semibold text-gray-800 truncate">
                        {folderLabels[key] ?? key}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                      {grouped[key].length} 筆
                    </span>
                  </button>
                  {/* Rename button */}
                  <button
                    type="button"
                    onClick={(e) => startRename(key, e)}
                    title="重新命名資料夾"
                    className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Delete folder button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteFolder(key); }}
                    title="刪除整個資料夾"
                    className="ml-1 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Folder contents */}
                {openFolders.has(key) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {grouped[key].map((run) => (
                      <div key={run.id} className="border-b border-gray-50 last:border-0">
                        <div
                          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors cursor-pointer"
                          onClick={() => loadDetail(run.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate">{run.courseName}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(run.createdAt).toLocaleString("zh-TW")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
                            <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                              報名 {run.totalRegistrants} 人
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                              錄取 {run.totalQuota} 人
                            </span>
                            {/* Process toggle */}
                            <button
                              type="button"
                              onClick={(e) => toggleProcess(run.id, e)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                                processRunId === run.id
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              抽籤過程
                            </button>
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
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPendingDeleteId(run.id); }}
                              title="刪除此紀錄"
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Inline process panel */}
                        {processRunId === run.id && (
                          <div className="px-6 pb-5 bg-indigo-50/40 border-t border-indigo-100">
                            {processLoading && processDetail?.id !== run.id ? (
                              <p className="text-xs text-gray-400 py-4 text-center">載入中...</p>
                            ) : processDetail?.id === run.id ? (() => {
                              const byType = (type: string) =>
                                processDetail.results.filter((r) => r.admissionType === type);
                              const section = (title: string, bg: string, items: LotteryResultItem[], extra?: string) => (
                                items.length > 0 ? (
                                  <div className={`rounded-xl p-3 ${bg}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="text-xs font-semibold text-gray-700">{title}</span>
                                      <span className="text-xs text-gray-400 bg-white/70 px-1.5 py-0.5 rounded-full">{items.length} 人</span>
                                      {extra && <span className="text-xs text-gray-400">{extra}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {items.map((r) => (
                                        <span key={r.name} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700">{r.name}</span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null
                              );
                              return (
                                <div className="pt-4 space-y-2">
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    {[
                                      { label: "總報名", value: run.totalRegistrants },
                                      { label: "已排除", value: run.excludedCount },
                                      { label: "有效報名", value: run.totalRegistrants - run.excludedCount },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="bg-white rounded-xl px-3 py-2 border border-gray-100 text-center">
                                        <p className="text-lg font-bold text-gray-800">{value}</p>
                                        <p className="text-xs text-gray-400">{label}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {section("直接錄取（優先錄取）", "bg-purple-50", byType("direct"))}
                                  {section("免抽籤錄取", "bg-blue-50", byType("exemption"))}
                                  {section("志工名額抽籤 — 抽中", "bg-emerald-50", byType("volunteer_lottery"))}
                                  {section("一般抽籤 — 抽中", "bg-gray-100", byType("general_lottery"))}
                                  {section("備取名單", "bg-amber-50", byType("waitlist"))}
                                </div>
                              );
                            })() : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {pendingDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPendingDeleteId(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">確定要刪除？</h3>
              <p className="text-sm text-gray-500 mb-6">此操作無法復原，該筆抽籤紀錄將永久刪除。</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? "刪除中..." : "確定刪除"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Folder Confirm Modal */}
        {pendingDeleteFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPendingDeleteFolder(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">刪除整個資料夾？</h3>
              <p className="text-sm text-gray-500 mb-1">
                「{folderLabels[pendingDeleteFolder] ?? pendingDeleteFolder}」
              </p>
              <p className="text-sm text-red-500 mb-6">
                將刪除資料夾內 <span className="font-bold">{grouped[pendingDeleteFolder]?.length ?? 0}</span> 筆紀錄，此操作無法復原。
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDeleteFolder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFolder}
                  disabled={deletingFolder}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingFolder ? "刪除中..." : "確定刪除"}
                </button>
              </div>
            </div>
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
