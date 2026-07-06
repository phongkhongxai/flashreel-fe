import { request } from './httpClient';

export function followAuthor(authorId: string): Promise<void> {
  return request(`/users/${encodeURIComponent(authorId)}/follow`, { method: 'POST' });
}

export function unfollowAuthor(authorId: string): Promise<void> {
  return request(`/users/${encodeURIComponent(authorId)}/follow`, { method: 'DELETE' });
}
