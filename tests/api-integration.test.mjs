import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
class Storage {
  data = new Map();
  getItem(k) {
    return this.data.get(k) ?? null;
  }
  setItem(k, v) {
    this.data.set(k, String(v));
  }
  removeItem(k) {
    this.data.delete(k);
  }
  clear() {
    this.data.clear();
  }
}
globalThis.localStorage = new Storage();
globalThis.sessionStorage = new Storage();
globalThis.window = new EventTarget();
let server, request, store, auth, video, comments;
before(async () => {
  server = await createServer({
    configFile: false,
    server: { middlewareMode: true },
    appType: "custom",
  });
  ({ request } = await server.ssrLoadModule("/src/services/httpClient.ts"));
  ({ tokenStore: store } = await server.ssrLoadModule(
    "/src/auth/tokenStore.ts",
  ));
  auth = await server.ssrLoadModule("/src/services/authApi.ts");
  video = await server.ssrLoadModule("/src/services/videoApi.ts");
  comments = await server.ssrLoadModule("/src/services/commentApi.ts");
});
after(async () => server?.close());
beforeEach(() => {
  store.clear();
  globalThis.fetch = async () => {
    throw Error("unexpected fetch");
  };
});
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
test("two 401 responses share a refresh and rotate both tokens", async () => {
  store.setTokens("old", "refresh-old");
  let refreshCount = 0,
    requests = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith("/auth/refresh")) {
      refreshCount++;
      assert.deepEqual(JSON.parse(init.body), { refreshToken: "refresh-old" });
      return json({
        code: 1000,
        result: { accessToken: "new", refreshToken: "refresh-new" },
      });
    }
    requests++;
    return init.headers.Authorization === "Bearer old"
      ? json({ code: 1006, message: "Unauthorized" }, 401)
      : json({ code: 1000, result: "ok" });
  };
  assert.deepEqual(await Promise.all([request("/a"), request("/b")]), [
    "ok",
    "ok",
  ]);
  assert.equal(refreshCount, 1);
  assert.equal(requests, 4);
  assert.equal(store.getToken(), "new");
  assert.equal(store.getRefreshToken(), "refresh-new");
});
test("403 does not refresh or clear session", async () => {
  store.setTokens("access", "refresh");
  let count = 0;
  globalThis.fetch = async () => {
    count++;
    return json({ code: 1007, message: "Forbidden" }, 403);
  };
  await assert.rejects(request("/admin/videos"), (e) => e.status === 403);
  assert.equal(count, 1);
  assert.equal(store.getRefreshToken(), "refresh");
});
test("login registration logout and verification use backend contract", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("verify-code"))
      return new Response("Email verified successfully!");
    return json({
      code: 1000,
      result: { accessToken: "a", refreshToken: "r" },
    });
  };
  await auth.registerUser({
    username: "test",
    email: "a@example.com",
    password: "password",
    displayName: "Test",
  });
  await auth.verifyEmailCode("a@example.com", "012345");
  await auth.logout(undefined, "r");
  assert.ok(calls[0].url.endsWith("/users/registration"));
  assert.ok(calls[1].url.includes("code=012345"));
  assert.deepEqual(JSON.parse(calls[2].init.body), { refreshToken: "r" });
});
test("cursor endpoints encode cursor and use specified status", async () => {
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(new URL(String(url)));
    return json({
      code: 1000,
      result: { data: [], nextCursor: null, hasNext: false },
    });
  };
  await video.getFeedCursor({ cursor: "a+b=", size: 10 });
  await video.getLatestCursor({ size: 10 });
  await video.getMyVideosCursor({ status: "REJECTED", cursor: "next" });
  await comments.getCommentsCursor("id", "cursor");
  assert.equal(urls[0].pathname, "/videos/feed/cursor");
  assert.equal(urls[0].searchParams.get("cursor"), "a+b=");
  assert.equal(urls[1].pathname, "/videos/latest/cursor");
  assert.equal(urls[2].searchParams.get("status"), "REJECTED");
  assert.equal(urls[3].pathname, "/videos/id/comments/cursor");
});

test("creator video cursor is public and follow status uses the viewer token", async () => {
  store.setTokens("viewer-access", "viewer-refresh");
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: new URL(String(url)), init });
    return json({
      code: 1000,
      result:
        calls.length === 1
          ? { data: [], nextCursor: null, hasNext: false }
          : { following: true },
    });
  };
  const follow = await server.ssrLoadModule("/src/services/followApi.ts");
  await video.getUserVideosCursor("creator-1", {
    cursor: "next+page",
    size: 18,
  });
  const status = await follow.getFollowStatus("creator-1");
  assert.equal(calls[0].url.pathname, "/videos/users/creator-1/cursor");
  assert.equal(calls[0].url.searchParams.get("cursor"), "next+page");
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.equal(calls[1].url.pathname, "/users/creator-1/follow");
  assert.equal(calls[1].init.headers.Authorization, "Bearer viewer-access");
  assert.equal(status.following, true);
});
test("a late refresh cannot replace a new session", async () => {
  store.setTokens("old", "old-refresh");
  let release;
  const pending = new Promise((r) => (release = r));
  let started;
  const refreshing = new Promise((r) => (started = r));
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/auth/refresh")) {
      started();
      await pending;
      return json({
        code: 1000,
        result: { accessToken: "rotated", refreshToken: "rotated-refresh" },
      });
    }
    return json({ code: 1006, message: "expired" }, 401);
  };
  const old = request("/test");
  await refreshing;
  store.setTokens("new-user", "new-refresh");
  release();
  await assert.rejects(old);
  assert.equal(store.getToken(), "new-user");
  assert.equal(store.getRefreshToken(), "new-refresh");
});
test("failed refresh clears only the expired session; network failure keeps it", async () => {
  store.setTokens("access", "refresh");
  globalThis.fetch = async (url) =>
    String(url).endsWith("/auth/refresh")
      ? json({ code: 1006, message: "expired" }, 401)
      : json({ code: 1006, message: "expired" }, 401);
  await assert.rejects(request("/protected"));
  assert.equal(store.getToken(), null);
  store.setTokens("access2", "refresh2");
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/auth/refresh")) throw Error("offline");
    return json({ code: 1006, message: "expired" }, 401);
  };
  await assert.rejects(request("/protected"));
  assert.equal(store.getRefreshToken(), "refresh2");
});
test("multipart upload does not set content-type and view accepts 204", async () => {
  let upload;
  let viewRequest;
  store.setTokens("access", "refresh");
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith("/view")) {
      viewRequest = init;
      return new Response(null, { status: 204 });
    }
    upload = init;
    return json({ code: 1000, result: { id: "v1" } });
  };
  await video.publishVideo({
    title: "clip",
    videoFile: new Blob(["x"], { type: "video/mp4" }),
  });
  assert.equal(upload.headers["Content-Type"], undefined);
  assert.ok(upload.body instanceof FormData);
  assert.equal(upload.body.get("title"), "clip");
  await video.recordView("v1");
  assert.equal(viewRequest.method, "POST");
  assert.equal(viewRequest.headers.Authorization, undefined);
  assert.equal(viewRequest.body, undefined);
});

test("owner playback keeps signed media URLs unchanged and sends the access token", async () => {
  store.setTokens("owner-access", "owner-refresh");
  const signedUrl =
    "https://storage.example/video.mp4?signature=a%2Bb&expires=123";
  const signedCover = "https://storage.example/cover.jpg?signature=c%2Fd";
  let received;
  globalThis.fetch = async (url, init) => {
    received = { url: String(url), init };
    return json({
      code: 1000,
      result: { id: "v1", videoUrl: signedUrl, coverUrl: signedCover },
    });
  };
  const playback = await video.getPlayback("v1");
  assert.ok(received.url.endsWith("/videos/v1/playback"));
  assert.equal(received.init.headers.Authorization, "Bearer owner-access");
  assert.equal(playback.videoUrl, signedUrl);
  assert.equal(playback.coverUrl, signedCover);
});
test("Google code exchange sends encoded query without a request body", async () => {
  let received;
  globalThis.fetch = async (url, init) => {
    received = { url: new URL(String(url)), init };
    return json({
      code: 1000,
      result: {
        accessToken: "access",
        refreshToken: "refresh",
        authenticated: false,
      },
    });
  };
  const response = await auth.authenticateOutbound(
    "code+a/b",
    "verifier+value",
  );
  assert.equal(received.url.pathname, "/auth/outbound/authentication");
  assert.equal(received.url.searchParams.get("code"), "code+a/b");
  assert.equal(received.url.searchParams.get("codeVerifier"), "verifier+value");
  assert.equal(received.init.method, "POST");
  assert.equal(received.init.body, undefined);
  assert.equal(response.authenticated, false);
  assert.equal(response.refreshToken, "refresh");
});
