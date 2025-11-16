import axios from "axios";
import { api } from "../api";

export const register = async (data) => {
  const res = await axios.post(api.auth.register, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(api.auth.login, data);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
};

export const getToken = () => localStorage.getItem("token");

export const logout = () => localStorage.removeItem("token");
