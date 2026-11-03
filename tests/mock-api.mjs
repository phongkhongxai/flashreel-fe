import http from "node:http";
import { readFileSync } from "node:fs";
const video = {
  id: "v1",
  title: "Video kiểm thử",
  videoUrl: "http://127.0.0.1:18999/media.mp4",
  coverUrl: "http://127.0.0.1:18999/cover.svg?signature=test",
  authorId: "author-1",
  authorNickname: "Minh Anh",
  authorAvatar: "http://127.0.0.1:18999/avatar.svg?signature=fresh",
  status: "APPROVED",
  likeCount: 10,
  viewCount: 20,
  commentCount: 1,
  liked: false,
  followingAuthor: false,
};
let adminRequests = 0;
http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS",
    );
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    const url = new URL(req.url, "http://localhost");
    let result;
    if (url.pathname === "/avatar-expired.svg") {
      res.writeHead(403).end();
      return;
    } else if (url.pathname === "/avatar.svg") {
      res
        .writeHead(200, { "Content-Type": "image/svg+xml" })
        .end(
          '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="#7a3dcc"/></svg>',
        );
      return;
    } else if (url.pathname === "/cover.svg") {
      res
        .writeHead(200, { "Content-Type": "image/svg+xml" })
        .end(
          '<svg xmlns="http://www.w3.org/2000/svg" width="76" height="100"><rect width="76" height="100" fill="#268ad6"/></svg>',
        );
      return;
    } else if (url.pathname === "/media.mp4") {
      const media = readFileSync(
        new URL("../public/demo/ambient.mp4", import.meta.url),
      );
      res
        .writeHead(200, {
          "Content-Type": "video/mp4",
          "Content-Length": media.length,
        })
        .end(media);
      return;
    } else if (url.pathname === "/health") result = { status: "ok" };
    else if (url.pathname === "/auth/login")
      result = {
        code: 1000,
        result: {
          accessToken: "test-access",
          refreshToken: "test-refresh",
          username: "tester",
          authenticated: true,
        },
      };
    else if (
      url.pathname === "/users/my-info" ||
      url.pathname === "/users/me/profile"
    )
      result = {
        code: 1000,
        result: {
          id: "user-1",
          username: "tester",
          email: "tester@example.com",
          nickname: "Tester",
          avatarUrl:
            url.pathname === "/users/my-info"
              ? "http://127.0.0.1:18999/avatar-expired.svg"
              : "http://127.0.0.1:18999/avatar.svg?signature=fresh",
          videoCount: 1,
          followerCount: 2,
          followingCount: 3,
        },
      };
    else if (url.pathname === "/users/author-1")
      result = {
        code: 1000,
        result: {
          id: "author-1",
          username: "minhanh",
          nickname: "Minh Anh",
          avatarUrl: "http://127.0.0.1:18999/avatar.svg?signature=fresh",
          bio: "Lưu giữ những khoảnh khắc nhỏ ✨",
          followerCount: 8240,
          followingCount: 91,
          videoCount: 3,
        },
      };
    else if (url.pathname === "/videos/users/author-1/cursor")
      result = {
        code: 1000,
        result: {
          data: [
            video,
            { ...video, id: "v2", title: "Một ngày ở Hội An", viewCount: 2400 },
            {
              ...video,
              id: "v3",
              title: "Hoàng hôn cuối tuần",
              viewCount: 500,
            },
          ],
          nextCursor: null,
          hasNext: false,
        },
      };
    else if (
      url.pathname === "/videos/feed/cursor" ||
      url.pathname === "/videos/latest/cursor"
    )
      result = {
        code: 1000,
        result: { data: [video], nextCursor: null, hasNext: false },
      };
    else if (url.pathname === "/videos/my/cursor")
      result = {
        code: 1000,
        result: {
          data: [
            { ...video, status: "REJECTED", rejectReason: "Cần chỉnh sửa" },
          ],
          nextCursor: null,
          hasNext: false,
        },
      };
    else if (url.pathname === "/videos/v1/playback")
      result = { code: 1000, result: video };
    else if (url.pathname === "/videos/v1")
      result = { code: 1000, result: video };
    else if (url.pathname === "/videos/v1/like") {
      video.liked = req.method === "POST";
      video.likeCount = video.liked ? 11 : 10;
      result = {
        code: 1000,
        result: {
          videoId: "v1",
          liked: video.liked,
          likeCount: video.likeCount,
        },
      };
    } else if (url.pathname === "/users/author-1/follow") {
      if (req.method === "GET")
        result = { code: 1000, result: { following: video.followingAuthor } };
      else {
        video.followingAuthor = req.method === "POST";
        result = { code: 1000 };
      }
    } else if (url.pathname === "/videos/v1/view") {
      video.viewCount++;
      res.writeHead(204).end();
      return;
    } else if (url.pathname === "/videos/v1/comments/cursor")
      result = {
        code: 1000,
        result: {
          data: [
            {
              id: "c1",
              authorId: "user-1",
              authorNickname: "Tester",
              authorAvatar: "http://127.0.0.1:18999/avatar.svg?signature=fresh",
              content: "Bình luận kiểm thử",
            },
          ],
          nextCursor: null,
          hasNext: false,
        },
      };
    else if (url.pathname === "/videos/v1/comments" && req.method === "POST")
      result = {
        code: 1000,
        result: {
          id: "c2",
          authorId: "user-1",
          authorNickname: "Tester",
          content: JSON.parse(body).content,
        },
      };
    else if (url.pathname === "/admin/videos") {
      adminRequests++;
      result = {
        code: 1000,
        result: {
          content: [
            {
              id: "v1",
              title: video.title,
              authorNickname: video.authorNickname,
              authorEmail: "creator@example.test",
              authorAvatar:
                adminRequests === 1
                  ? "http://127.0.0.1:18999/avatar-expired.svg"
                  : "http://127.0.0.1:18999/avatar.svg?signature=fresh",
              status: "REVIEWING",
              uploadTime: "2026-01-01",
              videoPreviewUrl: video.videoUrl,
              coverUrl: video.coverUrl,
              likeCount: 0,
              viewCount: 0,
              commentCount: 0,
            },
          ],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          last: true,
        },
      };
    } else if (url.pathname === "/auth/logout") result = { code: 1000 };
    else {
      res
        .writeHead(404, { "Content-Type": "application/json" })
        .end(JSON.stringify({ message: "Not found" }));
      return;
    }
    res
      .writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify(result));
  })
  .listen(18999, "127.0.0.1", () => console.log("Mock API listening on 18999"));
