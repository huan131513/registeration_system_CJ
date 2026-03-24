"use client";

import { PointsEntry } from "@/lib/types";

interface PointsRow {
  name: string;
  original: number;
  deducted: number;
  updated: number;
}

interface PointsTableSectionProps {
  originalPoints: PointsEntry[];
  updatedPoints: PointsEntry[];
  courseName: string;
}

export default function PointsTableSection({
  originalPoints,
  updatedPoints,
  courseName,
}: PointsTableSectionProps) {
  if (!originalPoints.length || !updatedPoints.length) return null;

  const originalMap = new Map(originalPoints.map((p) => [p.name, p.points]));
  const updatedMap = new Map(updatedPoints.map((p) => [p.name, p.points]));

  // 合併所有姓名
  const allNames = Array.from(
    new Set([...originalPoints.map((p) => p.name), ...updatedPoints.map((p) => p.name)])
  );

  const rows: PointsRow[] = allNames.map((name) => {
    const original = originalMap.get(name) ?? 0;
    const updated = updatedMap.get(name) ?? original;
    const deducted = original - updated;
    return { name, original, deducted, updated };
  });

  // 有扣分的排前面，其餘照原順序
  const sorted = [
    ...rows.filter((r) => r.deducted > 0),
    ...rows.filter((r) => r.deducted === 0),
  ];

  const deductedCount = rows.filter((r) => r.deducted > 0).length;

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">更新後的積分表</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            共 {rows.length} 位學員
            {deductedCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {deductedCount} 位使用免抽籤扣除積分
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600 w-8">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">姓名</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">原始積分</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">扣除點數</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">更新後積分</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const hasDeduction = row.deducted > 0;
              return (
                <tr
                  key={row.name}
                  className={`border-b border-gray-100 transition-colors ${
                    hasDeduction
                      ? "bg-amber-50/60 hover:bg-amber-50"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-gray-300">{i + 1}</td>
                  <td className={`px-4 py-3 font-medium ${hasDeduction ? "text-gray-800" : "text-gray-400"}`}>{row.name}</td>
                  <td className={`px-4 py-3 text-center ${hasDeduction ? "text-gray-600" : "text-gray-400"}`}>{row.original}</td>

                  {/* 扣除點數欄：有扣分才顯示，滑鼠移入顯示 tooltip */}
                  <td className="px-4 py-3 text-center">
                    {hasDeduction ? (
                      <span className="relative group inline-block cursor-default">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                          </svg>
                          {row.deducted}
                        </span>
                        {/* Tooltip */}
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10
                          w-max max-w-[200px] px-3 py-2 rounded-xl bg-gray-800 text-white text-xs text-center
                          opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg whitespace-normal leading-relaxed">
                          用於「{courseName}」<br />免抽籤優先錄取
                          {/* 小三角 */}
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* 更新後積分 */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        hasDeduction ? "text-amber-700" : "text-gray-400"
                      }`}
                    >
                      {row.updated}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
