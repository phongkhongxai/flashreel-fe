import { request } from './httpClient';
import {
  PageResponse,
  PublishVideoInput,
  ResubmitVideoInput,
  VideoLikeResponse,
  VideoPlaybackResponse,
  VideoResponse,
  VideoStatus
} from './types';

export function getFeed(params?: { page?: number; size?: number }): Promise<PageResponse<VideoResponse>> {
  return request('/videos/feed', { auth: false, query: params });
}

export function getPlayback(videoId: string): Promise<VideoPlaybackResponse> {
  return request(`/videos/${encodeURIComponent(videoId)}/playback`);
}

export function recordView(videoId: string): Promise<void> {
  return request(`/videos/${encodeURIComponent(videoId)}/view`, { method: 'POST', auth: false, responseType: 'void' });
}

export function publishVideo(input: PublishVideoInput): Promise<VideoResponse> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('videoFile', input.videoFile as Blob);
  return request('/videos', { method: 'POST', body: formData });
}

export function getMyVideos(params?: { status?: VideoStatus; page?: number; size?: number }): Promise<PageResponse<VideoResponse>> {
  return request('/videos/my', { query: params });
}

export function resubmitVideo(videoId: string, input: ResubmitVideoInput = {}): Promise<VideoResponse> {
  const formData = new FormData();
  if (input.title) formData.append('title', input.title);
  if (input.videoFile) formData.append('videoFile', input.videoFile as Blob);
  return request(`/videos/${encodeURIComponent(videoId)}/resubmit`, { method: 'POST', body: formData });
}

export function likeVideo(videoId: string): Promise<VideoLikeResponse> {
  return request(`/videos/${encodeURIComponent(videoId)}/like`, { method: 'POST' });
}

export function unlikeVideo(videoId: string): Promise<VideoLikeResponse> {
  return request(`/videos/${encodeURIComponent(videoId)}/like`, { method: 'DELETE' });
}

export function getVideo(videoId: string): Promise<VideoResponse> {
  return request(`/videos/${encodeURIComponent(videoId)}`);
}
