const API_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";

export default API_URL;
