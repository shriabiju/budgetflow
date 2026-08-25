// In production (Cloudflare Pages), set VITE_API_BASE in your project's env vars
// to your deployed Render backend URL, e.g. https://budgetflow-api.onrender.com
// Locally, it falls back to localhost:8080.
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'