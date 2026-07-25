import "./Input.css";

/**
 * Underline-only text input used across all forms (Create Order, Add
 * Customer, Add Vendor, Inventory, Login). `label` renders above the
 * field as a metadata-style eyebrow.
 */
export function Input({ label, id, className = "", ...rest }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <input id={id} className="field__control" {...rest} />
    </div>
  );
}

export function Select({ label, id, children, className = "", ...rest }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <select id={id} className="field__control field__control--select" {...rest}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, id, className = "", ...rest }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <textarea id={id} className="field__control field__control--textarea" {...rest} />
    </div>
  );
}

export default Input;
