import { useState } from "react";
import CalendarPopup from "./CalendarPopup";
import "./StatusSelector.css";

const STATUS_OPTIONS = ["Created", "Processing", "Dispatched", "Delivered"];

/**
 * Props:
 *   status: current Status value
 *   deliveryDate: current Delivery date value (used to pre-select the calendar)
 *   onChangeStatus(newStatus): called for non-Delivered transitions
 *   onDeliver(deliveryDateIso): called once a delivery date is chosen after
 *     selecting "Delivered" — the caller is responsible for saving both
 *     Status and Delivery date together.
 */
export default function StatusSelector({ status, deliveryDate, onChangeStatus, onDeliver }) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleChange(event) {
    const newStatus = event.target.value;
    if (newStatus === "Delivered") {
      setCalendarOpen(true);
      return;
    }
    onChangeStatus(newStatus);
  }

  function handleDateSelect(isoDate) {
    setCalendarOpen(false);
    onDeliver(isoDate);
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

      {calendarOpen && (
        <CalendarPopup
          value={deliveryDate}
          onSelect={handleDateSelect}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
}
