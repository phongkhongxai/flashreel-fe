import { request } from "./httpClient";
import type { CommentResponse, CursorPage } from "../types/api";
export const getCommentsCursor = (
  videoId: string,
  cursor?: string,
): Promise<CursorPage<CommentResponse>> =>
  request(`/videos/${encodeURIComponent(videoId)}/comments/cursor`, {
    query: { cursor, size: 20 },
  });
export const createComment = (
  videoId: string,
  content: string,
): Promise<CommentResponse> =>
  request(`/videos/${encodeURIComponent(videoId)}/comments`, {
    method: "POST",
    body: { content },
  });
export const deleteComment = (
  videoId: string,
  commentId: string,
): Promise<void> =>
  request(
    `/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
export const getComments = (
  videoId: string,
  params?: { page?: number; size?: number },
) =>
  request<import("../types/api").PageResponse<CommentResponse>>(
    `/videos/${encodeURIComponent(videoId)}/comments`,
    { query: params },
  );
