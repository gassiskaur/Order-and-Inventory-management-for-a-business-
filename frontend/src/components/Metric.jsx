import "./Metric.css";

/**
 * Large editorial statistic used on dashboards:
 *   ORDERS THIS MONTH
 *   42
 */
export default function Metric({ label, value, accent = false }) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <span className={`metric__value${accent ? " metric__value--accent" : ""}`}>
        {value}
      </span>
    </div>
  );
}
