const statusStyles = {
  available:
    "bg-green-50 text-green-700",
  confirmed:
    "bg-[var(--primary-light)] text-[var(--primary)]",
  pending:
    "bg-amber-50 text-amber-700",
  cancelled:
    "bg-red-50 text-red-700",
  info:
    "bg-blue-50 text-blue-700",
};

function Badge({
  children,
  status = "info",
}) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-2xl px-2.5 py-1
        text-xs font-medium gap-5
        ${statusStyles[status]}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;