"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
  onDelete: (v: string) => void;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  onDelete,
  disabled,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex-1" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${disabled ? "opacity-60 cursor-wait" : "hover:border-indigo-300 cursor-pointer"}
          ${open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"}
        `}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">尚無選項，請點「+ 新增」</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1.5">
              {options.map((opt) => (
                <li key={opt} className="mx-1.5">
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg group transition-colors cursor-pointer
                      ${value === opt
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {/* Option label — click to select */}
                    <span
                      className="flex-1 text-sm font-medium select-none"
                      onClick={() => { onChange(opt); setOpen(false); }}
                    >
                      {value === opt && (
                        <svg className="inline w-3.5 h-3.5 mr-1.5 mb-0.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {opt}
                    </span>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(opt); }}
                      className="w-5 h-5 ml-2 flex-shrink-0 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      aria-label={`刪除 ${opt}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
