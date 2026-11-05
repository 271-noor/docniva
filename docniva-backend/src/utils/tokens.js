import jwt from "jsonwebtoken";

const DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions = () => {
  const sameSite = process.env.COOKIE_SAMESITE || "lax";
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
  };
};

export const allowBearer = () => process.env.ALLOW_BEARER_AUTH === "true";

// JWT banata hai aur httpOnly cookie set karta hai
export const issueAuthCookie = (res, { id, role }, remember = false) => {
  const days = remember ? 30 : 1;

  const token = jwt.sign({ id: String(id), role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${days}d`,
  });

  res.cookie("token", token, { ...cookieOptions(), maxAge: days * DAY_MS });
  return token;
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", cookieOptions());
};

// Transition ke time token body me bhi bhejna (purana frontend ke liye)
export const withBearer = (body, token) =>
  allowBearer() ? { ...body, token } : body;