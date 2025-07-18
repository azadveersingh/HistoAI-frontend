import axios from "axios";
import { api as API_BASE } from "../api/api";

export const registerInit = async (firstName: string, lastName:string, email: string, password: string, confirmPassword:string) => {
  const response = await axios.post(`${API_BASE}/api/register-init`, {
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  });
  return response.data;
};

export const signin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/api/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || "Login failed. Please try again.";
    throw new Error(msg);
  }
};


export const verifyOtp = async (otp: string, tempToken: string) => {
  const response = await axios.post(`${API_BASE}/api/register`, {
    otp,
    temp_token: tempToken,
  });
  return response.data;
};

export const googleLogin = async (token: string) => {
  const response = await axios.post(`${API_BASE}/api/google-login`, {
    token,
  });
  return response.data;
};
