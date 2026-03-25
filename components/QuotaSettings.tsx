"use client";

import { useState, useEffect } from "react";

interface QuotaSettingsProps {
  courseName: string;
  totalQuota: number;
  volunteerSlots: number;
  waitlistSlots: number;
  year: string;
  semester: string;
  onCourseNameChange: (v: string) => void;
  onTotalQuotaChange: (v: number) => void;
  onVolunteerSlotsChange: (v: number) => void;
  onWaitlistSlotsChange: (v: number) => void;
  onYearChange: (v: string) => void;
  onSemesterChange: (v: string) => void;
}

export default function QuotaSettings({
  courseName,
  totalQuota,
  volunteerSlots,
  waitlistSlots,
  year,
  semester,
  onCourseNameChange,
  onTotalQuotaChange,
  onVolunteerSlotsChange,
  onWaitlistSlotsChange,
  onYearChange,
  onSemesterChange,
}: QuotaSettingsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<string[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [addYearError, setAddYearError] = useState("");
  const [addCourseError, setAddCourseError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/options/years").then((r) => r.json()).then((data) => setYears(data.years ?? [])),
      fetch("/api/options/courses").then((r) => r.json()).then((data) => setCourses(data.courses ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  const validate = (field: string, value: number) => {
    const newErrors = { ...errors };
    if (field === "volunteerSlots" && value > totalQuota) {
      newErrors.volunteerSlots = "志工名額不可超過總錄取人數";
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleDeleteYear = async (y: string) => {
    setLoading(true);
    await fetch("/api/options/years", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: y }),
    });
    setYears((prev) => prev.filter((v) => v !== y));
    if (year === y) onYearChange("");
    setLoading(false);
  };

  const handleDeleteCourse = async (c: string) => {
    setLoading(true);
    await fetch("/api/options/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: c }),
    });
    setCourses((prev) => prev.filter((v) => v !== c));
    if (courseName === c) onCourseNameChange("");
    setLoading(false);
  };

  const handleAddCourse = async () => {
    const name = newCourse.trim();
    if (!name) return;
    setLoading(true);
    const res = await fetch("/api/options/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: name }),
    });
    setLoading(false);
    if (res.status === 409 || courses.includes(name)) {
      setAddCourseError(`「${name}」已存在`);
      setTimeout(() => {
        setAddCourseError("");
        setShowAddCourse(false);
        setNewCourse("");
      }, 1500);
      return;
    }
    setCourses([...courses, name]);
    onCourseNameChange(name);
    setNewCourse("");
    setShowAddCourse(false);
  };

  const handleAddYear = async () => {
    const y = newYear.trim();
    if (!y) return;
    setLoading(true);
    const res = await fetch("/api/options/years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: y }),
    });
    setLoading(false);
    if (res.status === 409 || years.includes(y)) {
      setAddYearError(`「${y}」已存在`);
      setTimeout(() => {
        setAddYearError("");
        setShowAddYear(false);
        setNewYear("");
      }, 1500);
      return;
    }
    setYears([...years, y].sort());
    onYearChange(y);
    setNewYear("");
    setShowAddYear(false);
  };

  return (
    <div className={`space-y-5 ${loading ? "cursor-wait" : ""}`}>
      {/* Year & Semester */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            選擇年份
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div
            className={`rounded-2xl transition-all duration-200 ${
              showAddYear ? "bg-indigo-50 p-3 ring-1 ring-indigo-100" : ""
            }`}
          >
            <div className="flex gap-2">
              <select
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
              >
                <option value="">請選擇年份</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowAddYear(!showAddYear);
                  setNewYear("");
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  showAddYear
                    ? "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                {showAddYear ? "取消" : "+ 新增"}
              </button>
            </div>

            {showAddYear && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {years.map((y) => (
                    <span
                      key={y}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-sm font-medium"
                    >
                      {y}
                      <button
                        type="button"
                        onClick={() => handleDeleteYear(y)}
                        className="w-4 h-4 rounded-full hover:bg-red-100 flex items-center justify-center text-indigo-400 hover:text-red-500 transition-colors"
                        aria-label={`刪除 ${y}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => { setNewYear(e.target.value); setAddYearError(""); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddYear();
                      }
                    }}
                    placeholder="輸入年份（如 116）"
                    className={`flex-1 px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${addYearError ? "border-red-400" : "border-gray-200"}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddYear}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    確定
                  </button>
                </div>
                {addYearError && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{addYearError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            選擇季度
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-2">
            {["春季", "秋季"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSemesterChange(s)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  semester === s
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          課程名稱
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div
          className={`rounded-2xl transition-all duration-200 ${
            showAddCourse ? "bg-indigo-50 p-3 ring-1 ring-indigo-100" : ""
          }`}
        >
          <div className="flex gap-2">
            <select
              value={courseName}
              onChange={(e) => onCourseNameChange(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
            >
              <option value="">請選擇課程</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setShowAddCourse(!showAddCourse);
                setNewCourse("");
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                showAddCourse
                  ? "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              {showAddCourse ? "取消" : "+ 新增"}
            </button>
          </div>

          {showAddCourse && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {courses.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-sm font-medium"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(c)}
                      className="w-4 h-4 rounded-full hover:bg-red-100 flex items-center justify-center text-indigo-400 hover:text-red-500 transition-colors"
                      aria-label={`刪除 ${c}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => { setNewCourse(e.target.value); setAddCourseError(""); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCourse();
                    }
                  }}
                  placeholder="輸入新課程名稱"
                  className={`flex-1 px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${addCourseError ? "border-red-400" : "border-gray-200"}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  確定
                </button>
              </div>
              {addCourseError && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{addCourseError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quotas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            總錄取人數
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={totalQuota || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              onTotalQuotaChange(v);
            }}
            placeholder="例：25"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            志工優先名額
          </label>
          <input
            type="number"
            min={0}
            value={volunteerSlots || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              onVolunteerSlotsChange(v);
              validate("volunteerSlots", v);
            }}
            placeholder="例：5"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              errors.volunteerSlots ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.volunteerSlots && (
            <p className="mt-1 text-xs text-red-500">{errors.volunteerSlots}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            備取人數
          </label>
          <input
            type="number"
            min={0}
            value={waitlistSlots || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              onWaitlistSlotsChange(v);
            }}
            placeholder="例：5"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>
    </div>
  );
}
