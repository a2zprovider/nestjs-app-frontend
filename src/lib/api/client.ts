import { get } from "svelte/store";
import { token } from "../stores/auth";
const BASE_URL = "http://localhost:3000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json(); // Try to parse JSON error response
    } catch {
      errorData = { message: "Unknown error occurred" };
    }

    const error = new Error(errorData.message || "API request failed");
    (error as any).status = res.status;
    (error as any).data = errorData;
    throw error;
  }

  return res.json();
}

export async function authApiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const authToken = get(token);

  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  console.log("res : ", res);

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json(); // Try to parse JSON error response
    } catch {
      errorData = { message: "Unknown error occurred" };
    }

    const error = new Error(errorData.message || "API request failed");
    (error as any).status = res.status;
    (error as any).data = errorData;
    throw error;
  }
  let r_json = res.json();
  console.log("res : ", r_json);
  return r_json;
}
