import { request } from "./httpClient";
export type Role = { name: string; description?: string | null };
export function getRoles(): Promise<Role[]> {
  return request("/roles");
}
export function createRole(input: Role): Promise<Role> {
  return request("/roles", { method: "POST", body: input });
}
