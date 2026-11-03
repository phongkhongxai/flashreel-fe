import { seed, seedMine } from "../constants/demoData.js";
let videos = seed(),
  mine = seedMine(),
  user = null,
  profile = {
    name: "Lan Vy",
    email: "lanvy@example.com",
    avatar: null,
  },
  mode = "normal";
const wait = async () => {
  if (mode === "loading") await new Promise((r) => setTimeout(r, 1800));
  if (mode === "error") throw Error("Không thể tải dữ liệu. Vui lòng thử lại.");
};
export const demo = {
  async feed(order) {
    await wait();
    return mode === "empty"
      ? []
      : order === "latest"
        ? [...videos].reverse()
        : [...videos];
  },
  async myVideos() {
    return [...mine];
  },
  async profile() {
    return profile;
  },
  async session() {
    return user;
  },
  async login() {
    user = profile;
    return user;
  },
  async logout() {
    user = null;
  },
  async toggleLike(id) {
    let v = videos.find((x) => x.id === id);
    v.liked = !v.liked;
    v.likes += v.liked ? 1 : -1;
  },
  async toggleFollow(id) {
    let v = videos.find((x) => x.id === id);
    const next = !v.followed;
    videos
      .filter((x) => x.author === v.author)
      .forEach((x) => (x.followed = next));
  },
  async comment(id, text) {
    videos
      .find((x) => x.id === id)
      .comments.push({
        id: crypto.randomUUID(),
        author: profile.name,
        text,
        own: true,
      });
  },
  async deleteComment(id, c) {
    let v = videos.find((x) => x.id === id);
    v.comments = v.comments.filter((x) => x.id !== c);
  },
  async upload(title) {
    mine.unshift({
      id: crypto.randomUUID(),
      title,
      status: "REVIEWING",
    });
  },
  async resubmit(id, title) {
    let v = mine.find((x) => x.id === id);
    if (v) {
      v.title = title;
      v.status = "REVIEWING";
    }
  },
  async updateProfile(name, avatar) {
    profile = {
      ...profile,
      name,
      avatar: avatar || profile.avatar,
    };
    user = profile;
  },
  async reset() {
    videos = seed();
    mine = seedMine();
    user = null;
    profile = {
      name: "Lan Vy",
      email: "lanvy@example.com",
      avatar: null,
    };
    mode = "normal";
  },
  setMode(value) {
    mode = value;
  },
};

