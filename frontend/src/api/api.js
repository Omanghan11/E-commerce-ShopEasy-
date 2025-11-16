import axios from "axios";

const API = axios.create({
  baseURL: "${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api", // backend base URL
  withCredentials: true, // if using auth cookies
});

export default API;


