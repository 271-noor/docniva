
const variants = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",

  secondary:
    "bg-[var(--primary-light)] text-[var(--primary)] hover:opacity-90",

  outline:
    "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]",

  danger:
    "bg-[var(--danger)] text-white hover:bg-red-700",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-xl font-medium
        transition-colors duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-[var(--primary)]/30
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

