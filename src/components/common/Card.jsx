function Card({
  children,
  className = "",
  padding = true,
}) {
  return (
    <div
      className={`
        rounded-xl
        border border-var(--border)
        bg-var(--card)
        shadow-sm
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
