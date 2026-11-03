export type VideoStatus = "REVIEWING" | "APPROVED" | "REJECTED" | "TAKEN_DOWN";
export type ConsumerUser = {
  name: string;
  email: string;
  avatar?: string | null;
};
export type Comment = {
  id: string;
  author: string;
  text: string;
  own?: boolean;
};
export type ConsumerVideo = {
  id: string;
  title: string;
  author: string;
  status: VideoStatus;
  likes: number;
  views: number;
  liked: boolean;
  followed: boolean;
  comments: Comment[];
};
export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
};
