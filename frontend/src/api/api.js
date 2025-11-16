import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
  withCredentials: true, // if using auth cookies
});

export default API;
