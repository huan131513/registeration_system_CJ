"use client";

import { useCallback, useRef, useState } from "react";
import { Registrant, PointsEntry } from "@/lib/types";

interface FileUploadSectionProps {
  onRegistrationParsed: (data: Registrant[]) => void;
  onPointsParsed: (data: PointsEntry[]) => void;
  onAttendanceParsed: (names: string[]) => void;
  registrationCount: number;
  pointsCount: number;
  attendanceNames: string[];
}

interface UploadCardProps {
  title: string;
  description: string;
  required?: boolean;
  accept: string;
  multiple?: boolean;
  count: number | null;
  error: string | null;
  loading: boolean;
  fileName: string | null;
  onUpload: (files: FileList) => void;
}

function UploadCard({
  title,
  description,
  required,
  accept,
  multiple,
  count,
  error,
  loading,
  fileName,
  onUpload,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  // 顯示描述：已上傳成功時顯示檔名，否則顯示預設說明
  const displayDescription = count !== null && fileName ? fileName : description;
  const isFileNameShown = count !== null && fileName;

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
        dragOver
          ? "border-indigo-400 bg-indigo-50"
          : error
          ? "border-red-300 bg-red-50"
          : count !== null
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {required && (
        <span className="absolute top-3 right-3 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          必填
        </span>
      )}

      <div className="mb-3">
        {count !== null ? (
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>

      {/* 上傳成功：顯示檔名；否則顯示說明文字 */}
      <p
        className={`text-xs mb-3 break-all ${
          isFileNameShown
            ? "text-green-700 font-medium"
            : "text-gray-500"
        }`}
      >
        {isFileNameShown && (
          <svg className="w-3 h-3 inline mr-1 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {displayDescription}
      </p>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs">
          {error}
        </div>
      )}

      {count !== null && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
          已載入 {count} 筆資料
        </div>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            處理中...
          </>
        ) : count !== null ? (
          "重新上傳"
        ) : (
          "選擇檔案"
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
          }
        }}
      />
    </div>
  );
}

export default function FileUploadSection({
  onRegistrationParsed,
  onPointsParsed,
  onAttendanceParsed,
  registrationCount,
  pointsCount,
  attendanceNames,
}: FileUploadSectionProps) {
  const [regError, setRegError] = useState<string | null>(null);
  const [ptsError, setPtsError] = useState<string | null>(null);
  const [attError, setAttError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [ptsLoading, setPtsLoading] = useState(false);
  const [attLoading, setAttLoading] = useState(false);

  // 記錄成功上傳的檔名
  const [regFileName, setRegFileName] = useState<string | null>(null);
  const [ptsFileName, setPtsFileName] = useState<string | null>(null);
  const [attFileName, setAttFileName] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    type: string
  ): Promise<{ data?: unknown; error?: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    return res.json();
  };

  const handleRegistration = async (files: FileList) => {
    setRegLoading(true);
    setRegError(null);
    try {
      const result = await uploadFile(files[0], "registration");
      if (result.error) {
        setRegError(result.error as string);
        setRegFileName(null);
      } else {
        setRegFileName(files[0].name);
        onRegistrationParsed(result.data as Registrant[]);
      }
    } catch {
      setRegError("上傳失敗，請重試");
      setRegFileName(null);
    } finally {
      setRegLoading(false);
    }
  };

  const handlePoints = async (files: FileList) => {
    setPtsLoading(true);
    setPtsError(null);
    try {
      const result = await uploadFile(files[0], "points");
      if (result.error) {
        setPtsError(result.error as string);
        setPtsFileName(null);
      } else {
        setPtsFileName(files[0].name);
        onPointsParsed(result.data as PointsEntry[]);
      }
    } catch {
      setPtsError("上傳失敗，請重試");
      setPtsFileName(null);
    } finally {
      setPtsLoading(false);
    }
  };

  const handleAttendance = async (files: FileList) => {
    setAttLoading(true);
    setAttError(null);
    try {
      const allNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i], "attendance");
        if (result.error) {
          setAttError(result.error as string);
          setAttFileName(null);
          return;
        }
        const names = (result as { names: string[] }).names;
        allNames.push(...names);
      }
      // 多檔時顯示「X 個檔案」或單一檔名
      if (files.length === 1) {
        setAttFileName(files[0].name);
      } else {
        setAttFileName(`${files.length} 個檔案`);
      }
      onAttendanceParsed([...new Set(allNames)]);
    } catch {
      setAttError("上傳失敗，請重試");
      setAttFileName(null);
    } finally {
      setAttLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <UploadCard
          title="報名表單"
          description="Google 表單匯出的 .xlsx 檔案"
          required
          accept=".xlsx,.xls"
          count={registrationCount > 0 ? registrationCount : null}
          error={regError}
          loading={regLoading}
          fileName={regFileName}
          onUpload={handleRegistration}
        />
        <UploadCard
          title="積分表"
          description="學員姓名與積分的 .xlsx 檔案"
          required
          accept=".xlsx,.xls"
          count={pointsCount > 0 ? pointsCount : null}
          error={ptsError}
          loading={ptsLoading}
          fileName={ptsFileName}
          onUpload={handlePoints}
        />
        <UploadCard
          title="過去上課名單"
          description="選填，可多選，用於排除已上過課的學員"
          accept=".xlsx,.xls"
          multiple
          count={attendanceNames.length > 0 ? attendanceNames.length : null}
          error={attError}
          loading={attLoading}
          fileName={attFileName}
          onUpload={handleAttendance}
        />
      </div>
    </div>
  );
}
