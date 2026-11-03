// The whole app reads the backend URL from here.
// Local dev uses the fallback; in production (Vercel) we set
// NEXT_PUBLIC_API_URL to the real backend domain.
// NEXT_PUBLIC_ = this value is safe to expose to the browser.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
