"use client";

import { useState } from "react";
import { Registrant } from "@/lib/types";

interface DirectAdmissionAreaProps {
  registrants: Registrant[];
  directAdmitNames: string[];
  onDirectAdmitNamesChange: (names: string[]) => void;
}

export default function DirectAdmissionArea({
  registrants,
  directAdmitNames,
  onDirectAdmitNamesChange,
}: DirectAdmissionAreaProps) {
  const [input, setInput] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const registrantNames = new Set(registrants.map((r) => r.name));

  const addName = () => {
    const name = input.trim();
    if (!name) return;

    if (!registrantNames.has(name)) {
      setWarning(`「${name}」不在報名表單中`);
      return;
    }

    if (directAdmitNames.includes(name)) {
      setWarning(`「${name}」已在直接錄取名單中`);
      setInput("");
      return;
    }

    setWarning(null);
    onDirectAdmitNamesChange([...directAdmitNames, name]);
    setInput("");
  };

  const removeName = (name: string) => {
    onDirectAdmitNamesChange(directAdmitNames.filter((n) => n !== name));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        直接錄取（選填）
      </label>
      <p className="text-xs text-gray-500">
        輸入姓名後按 Enter 或點擊新增，該學生將直接錄取不經抽籤
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setWarning(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addName();
            }
          }}
          placeholder="輸入學員姓名"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addName}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          新增
        </button>
      </div>

      {warning && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          {warning}
        </p>
      )}

      {directAdmitNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {directAdmitNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
            >
              {name}
              <button
                type="button"
                onClick={() => removeName(name)}
                className="w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
