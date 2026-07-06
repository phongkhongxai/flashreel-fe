import { tokenStore } from '../auth/tokenStore';
import { followAuthor, getFeed, getPlayback, likeVideo, login, publishVideo, unlikeVideo, updateMyProfile } from './index';

export async function loginExample() {
  const auth = await login('admin@flashreel.vn', 'password');
  tokenStore.setToken(auth.token);
  return auth;
}

export async function updateProfileWithAvatarExample(file: File) {
  return updateMyProfile({ nickname: 'Lan Vy', avatarFile: file });
}

export async function loadFeedExample() {
  return getFeed({ page: 0, size: 20 });
}

export async function openPlaybackExample(videoId: string) {
  return getPlayback(videoId);
}

export async function likeUnlikeExample(videoId: string) {
  const liked = await likeVideo(videoId);
  const unliked = await unlikeVideo(videoId);
  return { liked, unliked };
}

export async function followExample(authorId: string) {
  await followAuthor(authorId);
}

export async function publishVideoExample(file: File) {
  return publishVideo({ title: 'A one-minute slow weekend at a Hanoi cafe', videoFile: file });
}
