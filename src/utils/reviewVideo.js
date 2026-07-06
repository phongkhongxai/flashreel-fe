import { API_BASE_URL } from '../config/env';
import { statusToApi } from '../constants/reviewConfig';

export function mapReviewVideo(video, index) {
  return {
    id: video.id,
    title: video.title || video.id,
    author: video.authorNickname || video.authorEmail || 'Unknown',
    authorAvatar: video.authorAvatar || '',
    email: video.authorEmail || '',
    uploadedAt: video.uploadTime || '',
    status: statusToApi[video.status] || video.status,
    file: video.videoPreviewUrl || video.coverUrl || 'Video',
    duration: '--:--',
    views: video.viewCount || 0,
    likes: video.likeCount || 0,
    comments: video.commentCount || 0,
    palette: ['night', 'green', 'rose'][index % 3],
    videoPreviewUrl: video.videoPreviewUrl,
    coverUrl: video.coverUrl
  };
}

export function createEmptyVideo(t) {
  return {
    id: '',
    title: t('table.empty'),
    author: '',
    email: '',
    uploadedAt: '',
    status: 'REVIEWING',
    file: '',
    duration: '--:--',
    views: 0,
    likes: 0,
    comments: 0,
    palette: 'night'
  };
}

export function getVideoTitle(video, t) {
  if (video.title) return video.title;
  if (video.titleKey) return t(video.titleKey);
  return video.id || '';
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return new URL(url.replace(/^\/+/, ''), `${API_BASE_URL.replace(/\/+$/, '')}/`).toString();
}
