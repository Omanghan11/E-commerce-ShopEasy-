import axios from "axios";
import { getToken } from "./services/authService";

const instance = axios.create();

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
