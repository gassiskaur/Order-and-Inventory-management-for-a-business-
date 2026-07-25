import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CalendarPopup.css";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toIsoDate(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  return cells;
}

/**
 * Month-grid date picker. No free-text date entry — Dispatch date and
 * Delivery date are only ever set by clicking a day here.
 *
 * Props:
 *   value: ISO date string ("YYYY-MM-DD") or "" — currently selected date
 *   onSelect(isoDate): called when the user clicks a day
 *   onClose(): called when the popup should close without a change
 */
export default function CalendarPopup({ value, onSelect, onClose }) {
  const initial = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const cells = buildMonthGrid(viewYear, viewMonth);
  const selectedIso = value || "";

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose?.();
    }
  }

  return (
    <div
      className="calendar-popup__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="calendar-popup"
        role="dialog"
        aria-label="Choose a date"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="calendar-popup__header">
          <button
            type="button"
            className="calendar-popup__nav"
            onClick={goPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="calendar-popup__month">
            {MONTH_LABELS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            className="calendar-popup__nav"
            onClick={goNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="calendar-popup__weekdays">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`${label}-${i}`}>{label}</span>
          ))}
        </div>

        <div className="calendar-popup__grid">
          {cells.map((day, index) => {
            if (day === null) {
              return <span key={`empty-${index}`} />;
            }
            const iso = toIsoDate(viewYear, viewMonth, day);
            const isSelected = iso === selectedIso;
            return (
              <button
                type="button"
                key={iso}
                className={`calendar-popup__day${isSelected ? " calendar-popup__day--selected" : ""}`}
                onClick={() => onSelect(iso)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
