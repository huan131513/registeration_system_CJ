"use client";

import { useCallback, useRef, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import FileUploadSection from "@/components/FileUploadSection";
import QuotaSettings from "@/components/QuotaSettings";
import DirectAdmissionArea from "@/components/DirectAdmissionArea";
import ConfirmationModal from "@/components/ConfirmationModal";
import ResultsTable from "@/components/ResultsTable";
import { Registrant, PointsEntry, LotteryResultItem, LotteryStats } from "@/lib/types";

type Step = "settings" | "upload" | "confirm" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("settings");
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback((next: Step) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setStep(next);
      setFading(false);
    }, 500); // 500ms out + 500ms in ≈ 1s total
  }, []);

  // Settings state
  const [year, setYear] = useState(String(new Date().getFullYear() - 1911));
  const [semester, setSemester] = useState("春季");
  const [courseName, setCourseName] = useState("");
  const [totalQuota, setTotalQuota] = useState(20);
  const [volunteerSlots, setVolunteerSlots] = useState(0);
  const [waitlistSlots, setWaitlistSlots] = useState(5);
  const [directAdmitNames, setDirectAdmitNames] = useState<string[]>([]);

  // Upload state
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [pointsTable, setPointsTable] = useState<PointsEntry[]>([]);
  const [attendanceNames, setAttendanceNames] = useState<string[]>([]);

  // Modal & results state
  const [showConfirm, setShowConfirm] = useState(false);
  const [lotteryLoading, setLotteryLoading] = useState(false);
  const [results, setResults] = useState<LotteryResultItem[]>([]);
  const [updatedPoints, setUpdatedPoints] = useState<PointsEntry[]>([]);
  const [lotteryStats, setLotteryStats] = useState<LotteryStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canProceedToUpload = courseName !== "" && year !== "" && totalQuota > 0;
  const canProceedToConfirm = registrants.length > 0 && pointsTable.length > 0;

  const handleStartLottery = () => {
    navigateTo("confirm");
    setTimeout(() => setShowConfirm(true), 500);
  };

  const handleConfirmLottery = async () => {
    setLotteryLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lottery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrants,
          pointsTable,
          excludedNames: attendanceNames,
          config: {
            courseName,
            year,
            semester,
            totalQuota,
            volunteerSlots,
            waitlistSlots,
            directAdmitNames,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "抽籤失敗");
        return;
      }

      setResults(data.results);
      setUpdatedPoints(data.updatedPoints || []);
      setLotteryStats(data.stats || null);
      setShowConfirm(false);
      navigateTo("results");
    } catch {
      setError("網路錯誤，請重試");
    } finally {
      setLotteryLoading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, courseName, exportType: "results" }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}${semester}-${courseName || "抽籤結果"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("匯出失敗，請重試");
    }
  };

  const handleExportPoints = async () => {
    try {
      const pointsFileName = `${year}${semester}積分表`;
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportType: "points",
          updatedPoints,
          pointsFileName,
        }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pointsFileName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("匯出失敗，請重試");
    }
  };

  const handleReset = () => {
    navigateTo("settings");
    setRegistrants([]);
    setPointsTable([]);
    setAttendanceNames([]);
    setCourseName("");
    setYear(String(new Date().getFullYear() - 1911));
    setSemester("春季");
    setTotalQuota(20);
    setVolunteerSlots(0);
    setWaitlistSlots(5);
    setDirectAdmitNames([]);
    setResults([]);
    setUpdatedPoints([]);
    setLotteryStats(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              前金樂齡學習中心
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">課程報名抽籤系統</p>
          </div>
          <a
            href="/history"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            歷史紀錄 →
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <StepIndicator currentStep={step} />

        <div className={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}>

        {/* Step 1: Settings */}
        {step === "settings" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              設定名額
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              設定年份、季度、課程名稱與各類名額
            </p>

            <QuotaSettings
              courseName={courseName}
              totalQuota={totalQuota}
              volunteerSlots={volunteerSlots}
              waitlistSlots={waitlistSlots}
              year={year}
              semester={semester}
              onCourseNameChange={setCourseName}
              onTotalQuotaChange={setTotalQuota}
              onVolunteerSlotsChange={setVolunteerSlots}
              onWaitlistSlotsChange={setWaitlistSlots}
              onYearChange={setYear}
              onSemesterChange={setSemester}
            />

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!canProceedToUpload}
                onClick={() => navigateTo("upload")}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload (was Step 1) */}
        {step === "upload" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              上傳檔案
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              請上傳
              <span className="text-indigo-600 font-medium mx-0.5">
                {courseName}
              </span>
              報名表單與積分表（必填），過去上課名單為選填
            </p>

            <FileUploadSection
              onRegistrationParsed={setRegistrants}
              onPointsParsed={setPointsTable}
              onAttendanceParsed={setAttendanceNames}
              registrationCount={registrants.length}
              pointsCount={pointsTable.length}
              attendanceNames={attendanceNames}
            />

            <div className="mt-6 pt-6 border-t border-gray-100">
              <DirectAdmissionArea
                registrants={registrants}
                directAdmitNames={directAdmitNames}
                onDirectAdmitNamesChange={setDirectAdmitNames}
              />
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => navigateTo("settings")}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← 上一步
              </button>
              <button
                type="button"
                disabled={!canProceedToConfirm}
                onClick={handleStartLottery}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                確認並抽籤
              </button>
            </div>
          </div>
        )}

        </div>{/* end transition wrapper */}

        {/* Step 3: Confirm Modal */}
        <ConfirmationModal
          open={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            navigateTo("upload");
          }}
          onConfirm={handleConfirmLottery}
          loading={lotteryLoading}
          registrants={registrants}
          pointsTable={pointsTable}
          excludedNames={attendanceNames}
          directAdmitNames={directAdmitNames}
          courseName={courseName}
          totalQuota={totalQuota}
          volunteerSlots={volunteerSlots}
          waitlistSlots={waitlistSlots}
        />

        {/* Step 4: Results */}
        {step === "results" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <ResultsTable
              results={results}
              courseName={courseName}
              originalPoints={pointsTable}
              updatedPoints={updatedPoints}
              stats={lotteryStats}
              onExportResults={handleExportResults}
              onExportPoints={handleExportPoints}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400" suppressHydrationWarning>
        前金樂齡學習中心 © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
