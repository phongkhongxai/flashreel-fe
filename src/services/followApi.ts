import { request } from "./httpClient";

export function getFollowStatus(
  authorId: string,
): Promise<{ following: boolean }> {
  return request(`/users/${encodeURIComponent(authorId)}/follow`);
}

export function followAuthor(authorId: string): Promise<void> {
  return request(`/users/${encodeURIComponent(authorId)}/follow`, {
    method: "POST",
  });
}

export function unfollowAuthor(authorId: string): Promise<void> {
  return request(`/users/${encodeURIComponent(authorId)}/follow`, {
    method: "DELETE",
  });
}
