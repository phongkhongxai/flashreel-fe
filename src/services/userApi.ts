import { request } from "./httpClient";
import { UpdateMyProfileInput, UserResponse } from "../types/api";

export function getMyInfo(): Promise<UserResponse> {
  return request("/users/my-info");
}

export function getMyProfile(): Promise<UserResponse> {
  return request("/users/me/profile");
}

export function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("nickname", input.nickname);
  if (input.avatarFile) formData.append("avatarFile", input.avatarFile as Blob);
  if (input.avatarUrl) formData.append("avatarUrl", input.avatarUrl);
  return request("/users/me/profile", { method: "PUT", body: formData });
}

export function getUserById(userId: string): Promise<UserResponse> {
  return request(`/users/${encodeURIComponent(userId)}`);
}
export function listUsers(): Promise<UserResponse[]> {
  return request("/users");
}
export function updateUser(
  userId: string,
  input: {
    displayName?: string | null;
    nickname?: string;
    bio?: string | null;
    avatarUrl?: string | null;
  },
): Promise<UserResponse> {
  return request(`/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: input,
  });
}
export function deleteUser(userId: string): Promise<string> {
  return request(`/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
}
