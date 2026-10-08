import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  maxDate?: string; // YYYY-MM-DD
  minDate?: string; // YYYY-MM-DD
  placeholder?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  id = "date",
  name = "date",
  required = false,
  disabled = false,
  maxDate,
  minDate = "2020-01-01",
  placeholder = "Select date of work...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayString();
  const initialDate = value ? new Date(value) : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [viewYear, setViewYear] = useState<number>(validInitialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(validInitialDate.getMonth());

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [value]);

  // Lock body scroll on mobile when modal sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Close calendar popover on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (year: number, month: number, day: number) => {
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const selected = `${year}-${mStr}-${dStr}`;

    if (maxDate && selected > maxDate) return;
    if (minDate && selected < minDate) return;

    onChange(selected);
    setIsOpen(false);
  };

  const handleQuickSelectToday = () => {
    const today = getTodayString();
    if (maxDate && today > maxDate) return;
    onChange(today);
    setIsOpen(false);
  };

  const handleQuickSelectYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (minDate && yStr < minDate) return;
    onChange(yStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  // Open native picker fallback
  const handleOpenNativePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (nativeInputRef.current) {
        if ("showPicker" in HTMLInputElement.prototype) {
          nativeInputRef.current.showPicker();
        } else {
          nativeInputRef.current.focus();
        }
      }
    } catch {
      // Fallback stays in current picker
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native input synchronized with state */}
      <input
        ref={nativeInputRef}
        type="date"
        id={id}
        name={name}
        value={value}
        max={maxDate}
        min={minDate}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        style={{ colorScheme: "dark" }}
      />

      {/* Main Touch-Friendly Trigger Input */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Select date of work"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`group w-full min-h-[52px] px-4 py-3 bg-[#0a0a0a] border rounded-xl flex items-center justify-between text-left transition-all select-none cursor-pointer touch-manipulation active:scale-[0.99] ${
          isOpen
            ? "border-white ring-2 ring-white/20 shadow-lg shadow-white/5"
            : "border-white/10 hover:border-white/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              value
                ? "bg-white text-black shadow-sm"
                : "bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>

          <div className="min-w-0 truncate">
            {value ? (
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm sm:text-base leading-tight">
                  {formatDisplayDate(value)}
                </span>
                <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {value}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 text-sm sm:text-base font-normal">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-300 group-hover:bg-white/10 group-hover:text-white transition-colors">
            {isOpen ? "Close" : "Choose"}
          </span>
        </div>
      </div>

      {/* Calendar: Mobile Bottom Sheet + Desktop Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Calendar Container */}
            <motion.div
              initial={{
                opacity: 0,
                y: window.innerWidth < 640 ? "100%" : 8,
                scale: window.innerWidth < 640 ? 1 : 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: window.innerWidth < 640 ? "100%" : 8,
                scale: window.innerWidth < 640 ? 1 : 0.98,
              }}
              transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:top-full sm:left-0 sm:right-auto sm:mt-2 w-full sm:w-[350px] bg-[#141414] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl p-5 sm:p-4 shadow-2xl shadow-black/90 z-50 text-white font-sans max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Swipe / Drag Indicator */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

              {/* Mobile Header Title */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 sm:hidden">
                <div>
                  <h3 className="text-base font-bold text-white">Select Date</h3>
                  <p className="text-xs text-gray-400">
                    {value ? formatDisplayDate(value) : "Choose date of work"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Month/Year Navigation Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="flex-1 bg-[#0a0a0a] text-white text-sm sm:text-xs font-bold px-3 py-2.5 sm:py-1.5 sm:px-2 rounded-xl border border-white/10 focus:outline-none focus:border-white cursor-pointer hover:bg-white/5 transition-colors touch-manipulation"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx} className="bg-[#141414] text-white">
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="w-24 bg-[#0a0a0a] text-white text-sm sm:text-xs font-bold px-3 py-2.5 sm:py-1.5 sm:px-2 rounded-xl border border-white/10 focus:outline-none focus:border-white cursor-pointer hover:bg-white/5 transition-colors touch-manipulation"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y} className="bg-[#141414] text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:bg-white/25 text-gray-200 hover:text-white transition-colors touch-manipulation"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:bg-white/25 text-gray-200 hover:text-white transition-colors touch-manipulation"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons (Thumb-friendly on mobile) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleQuickSelectToday}
                  className="py-2.5 sm:py-1.5 px-3 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/15 active:bg-white/25 text-gray-200 hover:text-white border border-white/5 transition-all text-center touch-manipulation flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleQuickSelectYesterday}
                  className="py-2.5 sm:py-1.5 px-3 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/15 active:bg-white/25 text-gray-200 hover:text-white border border-white/5 transition-all text-center touch-manipulation"
                >
                  Yesterday
                </button>
              </div>

              {/* Days of Week Row */}
              <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                {DAYS_OF_WEEK.map((day) => (
                  <span
                    key={day}
                    className="text-xs sm:text-[11px] font-bold text-gray-400 py-1"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid with 44px+ mobile touch targets */}
              <div className="grid grid-cols-7 gap-1">
                {/* Previous month trailing days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                  return (
                    <div
                      key={`prev-${i}`}
                      className="h-11 sm:h-9 flex items-center justify-center text-xs text-gray-600 select-none"
                    >
                      {dayNum}
                    </div>
                  );
                })}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
                    2,
                    "0"
                  )}-${String(dayNum).padStart(2, "0")}`;
                  const isSelected = value === dateStr;
                  const isToday = todayStr === dateStr;
                  const isFuture = maxDate ? dateStr > maxDate : false;
                  const isPastLimit = minDate ? dateStr < minDate : false;
                  const isDisabled = isFuture || isPastLimit;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectDate(viewYear, viewMonth, dayNum)}
                      className={`h-11 sm:h-9 w-full rounded-xl flex flex-col items-center justify-center text-sm sm:text-xs font-semibold transition-all relative touch-manipulation active:scale-95 ${
                        isSelected
                          ? "bg-white text-black font-extrabold shadow-lg shadow-white/20 scale-105 z-10"
                          : isDisabled
                          ? "text-gray-600 cursor-not-allowed opacity-30"
                          : "text-gray-200 hover:bg-white/15 active:bg-white/25 hover:text-white"
                      } ${
                        isToday && !isSelected
                          ? "border border-white/40 text-white font-bold"
                          : ""
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-black" : "bg-white"
                          } -mt-0.5`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer with Device Picker fallback + Done */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs pb-safe">
                <button
                  type="button"
                  onClick={handleOpenNativePicker}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white active:text-white transition-colors py-2 px-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 touch-manipulation"
                  title="Open phone native calendar wheel or dialog"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Phone picker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
