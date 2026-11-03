import {
  getFeedCursor,
  getLatestCursor,
  getMyVideosCursor,
  getPlayback,
  publishVideo,
  resubmitVideo,
  likeVideo,
  unlikeVideo,
  recordView,
  getVideo,
  getUserVideosCursor,
} from "../../../services/videoApi";
import {
  followAuthor,
  unfollowAuthor,
  getFollowStatus,
} from "../../../services/followApi";
import { getUserById } from "../../../services/userApi";
import {
  getCommentsCursor,
  createComment,
  deleteComment,
} from "../../../services/commentApi";
const video = (v) => ({
  ...v,
  author: v.authorNickname || "FlashReel",
  likes: v.likeCount || 0,
  views: v.viewCount || 0,
  liked: !!v.liked,
  followed: !!v.followingAuthor,
  color: "#92545c",
  reason: v.rejectReason || "",
  comments: [],
  commentCount: v.commentCount || 0,
});
const comment = (c, userId) => ({
  id: c.id,
  authorId: c.authorId,
  author: c.authorNickname || "FlashReel",
  authorAvatar: c.authorAvatar,
  text: c.content,
  own: c.authorId === userId,
});
export const consumerApi = {
  profile: getUserById,
  followStatus: getFollowStatus,
  followAuthor,
  unfollowAuthor,
  async userVideos(userId, cursor) {
    const page = await getUserVideosCursor(userId, { cursor, size: 18 });
    return { ...page, data: page.data.map(video) };
  },
  async feed(order, cursor) {
    const p = await (order === "hot"
      ? getFeedCursor({ cursor, size: 10 })
      : getLatestCursor({ cursor, size: 10 }));
    return { ...p, data: p.data.map(video) };
  },
  async playback(id) {
    return video(await getPlayback(id));
  },
  async myVideos(status, cursor) {
    const p = await getMyVideosCursor({
      status: status === "ALL" ? undefined : status,
      cursor,
      size: 20,
    });
    return { ...p, data: p.data.map(video) };
  },
  async getVideo(id) {
    return video(await getVideo(id));
  },
  async upload(title, file) {
    return publishVideo({ title, videoFile: file });
  },
  async resubmit(id, title, file) {
    return resubmitVideo(id, { title, ...(file && { videoFile: file }) });
  },
  async toggleLike(item) {
    return item.liked ? unlikeVideo(item.id) : likeVideo(item.id);
  },
  async toggleFollow(item) {
    return item.followed
      ? unfollowAuthor(item.authorId)
      : followAuthor(item.authorId);
  },
  async comments(id, userId, cursor) {
    const p = await getCommentsCursor(id, cursor);
    return { ...p, data: p.data.map((c) => comment(c, userId)) };
  },
  async comment(id, text) {
    return createComment(id, text);
  },
  async deleteComment(id, commentId) {
    return deleteComment(id, commentId);
  },
  recordView,
};
