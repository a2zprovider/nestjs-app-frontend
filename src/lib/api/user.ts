import { apiFetch } from "./client";

export function loginUser(credentials: { email: string; password: string }) {
  return apiFetch("auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
