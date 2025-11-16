import axios from "axios";

const API = axios.create({
  baseURL: "https://shopeasy-backend-sagk.onrender.com/api", // backend base URL
  withCredentials: true, // if using auth cookies
});

export default API;



