const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Cookie se login wali write requests par custom header zaroori hai.
// Doosri site ka form ya script ye header bhej hi nahi sakta (CORS allowlist rokta hai).
export const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (!req.cookies?.token) return next();

  if (req.get("x-requested-with") !== "docniva") {
    return res.status(403).json({
      success: false,
      message: "Request blocked for security reasons",
    });
  }

  next();
};