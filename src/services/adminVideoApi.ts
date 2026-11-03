import { request } from "./httpClient";
import {
  PageResponse,
  RejectVideoInput,
  VideoResponse,
  VideoReviewResponse,
  VideoStatus,
} from "../types/api";

export function adminGetVideos(params?: {
  status?: VideoStatus;
  page?: number;
  size?: number;
}): Promise<PageResponse<VideoReviewResponse>> {
  return request("/admin/videos", { query: params });
}

export function adminApproveVideo(videoId: string): Promise<VideoResponse> {
  return request(`/admin/videos/${encodeURIComponent(videoId)}/approve`, {
    method: "POST",
  });
}

export function adminRejectVideo(
  videoId: string,
  input: RejectVideoInput,
): Promise<VideoResponse> {
  return request(`/admin/videos/${encodeURIComponent(videoId)}/reject`, {
    method: "POST",
    body: input,
  });
}

export function adminTakeDownVideo(videoId: string): Promise<VideoResponse> {
  return request(`/admin/videos/${encodeURIComponent(videoId)}/take-down`, {
    method: "POST",
  });
}
