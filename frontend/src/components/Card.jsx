import "./Card.css";

/**
 * Editorial card: defined by a top border rather than a boxed container.
 * Use for list rows (orders, customers, stock entries) and dashboard tiles.
 */
export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
