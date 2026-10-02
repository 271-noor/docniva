
const statusStyles = {
  available:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",

  confirmed:
    "bg-[var(--primary-light)] text-[var(--primary)]",

  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",

  cancelled:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",

  info:
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

function Badge({
  children,
  status = "info",
}) {
  return (
    <span
      className={`
        inline-flex items-center
        gap-1.5
        rounded-2xl
        px-2.5 py-1
        text-xs font-medium
        ${statusStyles[status] || statusStyles.info}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;

