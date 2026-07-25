import { useState } from "react";
import CalendarPopup from "./CalendarPopup";
import "./StatusSelector.css";

const STATUS_OPTIONS = ["Created", "Processing", "Dispatched", "Delivered"];

/**
 * Status and its paired date are always set together: choosing
 * "Dispatched" here opens a calendar for Dispatch date, choosing
 * "Delivered" opens one for Delivery date. Created/Processing have no
 * paired date and apply immediately.
 *
 * Props:
 *   status: current Status value
 *   dispatchDate: current Dispatch date value (pre-selects the calendar)
 *   deliveryDate: current Delivery date value (pre-selects the calendar)
 *   onChangeStatus(newStatus): called for Created / Processing
 *   onSetDispatchDate(isoDate): called once a date is chosen after selecting "Dispatched"
 *   onSetDeliveryDate(isoDate): called once a date is chosen after selecting "Delivered"
 */
export default function StatusSelector({
  status,
  dispatchDate,
  deliveryDate,
  onChangeStatus,
  onSetDispatchDate,
  onSetDeliveryDate,
}) {
  const [calendarMode, setCalendarMode] = useState(null); // null | "dispatch" | "delivery"

  function handleChange(event) {
    const newStatus = event.target.value;
    if (newStatus === "Dispatched") {
      setCalendarMode("dispatch");
      return;
    }
    if (newStatus === "Delivered") {
      setCalendarMode("delivery");
      return;
    }
    onChangeStatus(newStatus);
  }

  function handleDateSelect(isoDate) {
    if (calendarMode === "dispatch") {
      onSetDispatchDate(isoDate);
    } else if (calendarMode === "delivery") {
      onSetDeliveryDate(isoDate);
    }
    setCalendarMode(null);
  }

  return (
    <div className="status-selector">
      <select
        className={`status-selector__control status-selector__control--${status.toLowerCase()}`}
        value={status}
        onChange={handleChange}
        aria-label="Order status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {calendarMode && (
        <CalendarPopup
          value={calendarMode === "dispatch" ? dispatchDate : deliveryDate}
          onSelect={handleDateSelect}
          onClose={() => setCalendarMode(null)}
        />
      )}
    </div>
  );
}
