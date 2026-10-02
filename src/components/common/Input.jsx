
function Input({
  label,
  error,
  id,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          w-full rounded-xl border
          bg-[var(--input-background)]
          px-4 py-3 text-sm
          text-[var(--input-text)]
          outline-none
          placeholder:text-[var(--input-placeholder)]
          transition
          ${
            error
              ? "border-[var(--danger)] focus:ring-2 focus:ring-red-500/20"
              : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-xs text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;

