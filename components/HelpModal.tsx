"use client";

import { useState } from "react";

interface HelpPage {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const PAGES: HelpPage[] = [
  {
    title: "步驟一：設定名額",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>在此步驟設定課程的基本資訊與名額分配：</p>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>年份 / 學期 / 課程名稱：</strong>選擇或新增對應的選項，會用於命名匯出檔案。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>總錄取人數：</strong>本次課程最多錄取幾人（預設 20 人）。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>志工名額：</strong>優先從志工報名者中抽出的名額數量。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>備取人數：</strong>正取額滿後，額外保留的候補名額（預設 5 人）。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>直接錄取名單：</strong>可輸入姓名，此名單中的學員不參與抽籤，直接錄取。</span></li>
        </ul>
      </div>
    ),
  },
  {
    title: "步驟二：上傳檔案",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>上傳抽籤所需的三種 Excel 檔案：</p>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>報名表（必填）：</strong>包含所有學員報名資料的 Excel 檔，欄位需含姓名、電話、性別等。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>積分表（選填）：</strong>記錄學員積分的 Excel 檔，含「免抽籤」或「志工」標記。若未上傳，所有人均參加一般抽籤。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>過去上課名單（選填）：</strong>可上傳多個檔案，系統會自動合併去重。曾上過此課程的學員將被排除於本次抽籤之外。</span></li>
        </ul>
      </div>
    ),
  },
  {
    title: "步驟三：確認抽籤",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>抽籤前的最後確認畫面：</p>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>資料預覽：</strong>顯示已讀取的有效報名人數、排除人數及各類別人數統計。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>抽籤順序：</strong>系統依「直接錄取 → 免抽籤 → 志工名額 → 一般抽籤」的順序決定錄取名單。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>開始抽籤：</strong>確認無誤後按下按鈕，系統會隨機抽出正取及備取名單，結果以動畫逐一顯示。</span></li>
        </ul>
      </div>
    ),
  },
  {
    title: "步驟四：抽籤結果",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>抽籤完成後，可在此頁面查看與匯出結果：</p>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>匯出抽籤結果：</strong>將正取與備取名單匯出為 Excel 檔，檔名格式為「年份學期-課程名稱」。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>匯出更新積分表：</strong>將本次抽籤結果更新至積分表後匯出。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>輸出上課點名單：</strong>輸入上課日期後匯出點名表 Excel，可逐筆新增或用「+下一週」快速新增。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>抽籤紀錄報告：</strong>展開詳細的抽籤過程說明，包含各類別錄取人數與名單。</span></li>
        </ul>
      </div>
    ),
  },
  {
    title: "歷史紀錄",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>點擊右上角「歷史紀錄 →」進入，需輸入密碼驗證。</p>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>資料夾分類：</strong>紀錄依年份與學期自動分組，支援重新命名與刪除整個資料夾。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>每筆紀錄：</strong>可查看抽籤過程、匯出抽籤結果 Excel、匯出上課點名單，或刪除單筆紀錄。</span></li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">·</span><span><strong>資料保存：</strong>所有抽籤結果儲存於共用資料庫，不同裝置皆可查閱。</span></li>
        </ul>
      </div>
    ),
  },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const total = PAGES.length;
  const current = PAGES[page];

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setPage(0); setOpen(true); }}
        title="使用說明"
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-gray-400 transition-colors font-bold text-sm"
      >
        ?
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-indigo-600">
                {current.icon}
                <h2 className="text-base font-bold text-gray-800">{current.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 min-h-[220px]">
              {current.content}
            </div>

            {/* Bottom nav */}
            <div className="px-6 pb-6 flex items-center justify-between">
              {/* Page dots */}
              <div className="flex gap-1.5">
                {PAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={`rounded-full transition-all ${
                      i === page
                        ? "w-5 h-2 bg-indigo-500"
                        : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                >
                  上一頁
                </button>
                {page < total - 1 ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    下一頁
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    完成
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
