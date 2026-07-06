export type ApiResponse<T> = {
  code: number;
  message?: string;
  result?: T;
};

export type ApiError = {
  status?: number;
  code?: number;
  message: string;
  raw?: unknown;
};

export type VideoStatus = 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'TAKEN_DOWN';

export type RejectReasonType =
  | 'COPYRIGHT'
  | 'INAPPROPRIATE_CONTENT'
  | 'LOW_QUALITY'
  | 'SPAM'
  | 'OTHER';

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  enabled: boolean;
  createdAt: string;
};

export type VideoResponse = {
  id: string;
  title: string;
  videoUrl: string;
  coverUrl?: string;
  authorId: string;
  authorNickname?: string;
  status: VideoStatus;
  rejectReason?: string;
  likeCount: number;
  viewCount: number;
  publishedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type VideoPlaybackResponse = {
  id: string;
  title: string;
  videoUrl: string;
  coverUrl?: string;
  authorId: string;
  authorAvatar?: string;
  authorNickname?: string;
  likeCount: number;
  viewCount: number;
  liked: boolean;
  followingAuthor: boolean;
};

export type VideoLikeResponse = {
  videoId: string;
  liked: boolean;
  likeCount: number;
};

export type VideoReviewResponse = {
  id: string;
  title: string;
  authorNickname?: string;
  authorEmail: string;
  authorAvatar?: string;
  uploadTime: string;
  videoPreviewUrl: string;
  coverUrl?: string;
  status: VideoStatus;
  commentCount: number;
  likeCount: number;
  viewCount: number;
};

export type AuthenticationResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  email?: string;
  authenticated: boolean;
};

export type ReactNativeFileLike = {
  uri: string;
  name: string;
  type: string;
};

export type UploadableFile = File | Blob | ReactNativeFileLike;

export type UpdateMyProfileInput = {
  nickname: string;
  avatarFile?: UploadableFile;
  avatarUrl?: string;
};

export type PublishVideoInput = {
  title: string;
  videoFile: UploadableFile;
};

export type ResubmitVideoInput = {
  title?: string;
  videoFile?: UploadableFile;
};

export type RejectVideoInput = {
  reasonType?: RejectReasonType;
  customReason?: string;
};

export type RegisterUserInput = {
  username: string;
  password: string;
  email: string;
  displayName: string;
};
