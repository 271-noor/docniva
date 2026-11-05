export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Kabhi throw nahi karta. Hamesha { ok, status, data } deta hai.
export async function api(path, { method = "GET", body, token, signal } = {}) {
  const headers = { "X-Requested-With": "docniva" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: `Request failed (${response.status})` };
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, status: 0, aborted: true, data: {} };
    }
    return {
      ok: false,
      status: 0,
      data: {
        message: "Unable to connect to the server. Please check your internet connection.",
      },
    };
  }
}