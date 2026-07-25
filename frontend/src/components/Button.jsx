import "./Button.css";

/**
 * variant: "primary" | "secondary" | "link"
 * All other props (onClick, type, disabled, etc.) pass through to <button>.
 */
export default function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}) {
  if (variant === "link") {
    return (
      <button className={`btn btn-link ${className}`} {...rest}>
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button className={`btn btn-secondary ${className}`} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <button className={`btn btn-primary ${className}`} {...rest}>
      <span className="btn-primary__overlay" aria-hidden="true" />
      <span className="btn-primary__label">{children}</span>
    </button>
  );
}
