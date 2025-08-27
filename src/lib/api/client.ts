import axios, { AxiosRequestConfig } from "axios";
import { get } from "svelte/store";
import { token } from "../stores/auth";

const BASE_URL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic API fetch (no auth)
export async function apiFetch(
  endpoint: string,
  options: AxiosRequestConfig = {}
) {
  try {
    const response = await axiosInstance.request({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (err: any) {
    const errorData = err.response?.data || {
      message: "Unknown error occurred",
    };
    const error = new Error(errorData.message || "API request failed");
    (error as any).status = err.response?.status || 500;
    (error as any).data = errorData;
    throw error;
  }
}

// Authenticated API fetch
export async function authApiFetch(
  endpoint: string,
  options: AxiosRequestConfig = {}
) {
  const authToken = localStorage.getItem("access_token");

  try {
    const response = await axiosInstance.request({
      url: endpoint,
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
    return response.data;
  } catch (err: any) {
    const errorData = err.response?.data || {
      message: "Unknown error occurred",
    };
    const error = new Error(errorData.message || "API request failed");
    (error as any).status = err.response?.status || 500;
    (error as any).data = errorData;
    throw error;
  }
}
