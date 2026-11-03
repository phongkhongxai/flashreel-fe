import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "vite";
class Storage {
  data = new Map();
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  clear() {
    this.data.clear();
  }
}
globalThis.sessionStorage = new Storage();
let destination;
globalThis.window = {
  location: {
    assign(url) {
      destination = url;
    },
  },
};
let server, startGoogleLogin;
before(async () => {
  process.env.VITE_GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
  process.env.VITE_GOOGLE_REDIRECT_URI = "http://localhost:5174/authenticate";
  server = await createServer({
    configFile: false,
    envDir: false,
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  ({ startGoogleLogin } = await server.ssrLoadModule(
    "/src/features/consumer/services/googleOAuth.js",
  ));
});
after(async () => {
  await server?.close();
  delete process.env.VITE_GOOGLE_CLIENT_ID;
  delete process.env.VITE_GOOGLE_REDIRECT_URI;
});
beforeEach(() => {
  sessionStorage.clear();
  destination = undefined;
});
test("Google authorization uses matching PKCE challenge, state and callback", async () => {
  await startGoogleLogin("/my-videos");
  const url = new URL(destination);
  const verifier = sessionStorage.getItem("pkce_verifier");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.pathname, "/o/oauth2/v2/auth");
  assert.equal(
    url.searchParams.get("client_id"),
    "test-client.apps.googleusercontent.com",
  );
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "http://localhost:5174/authenticate",
  );
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("code_challenge"), challenge);
  assert.equal(
    url.searchParams.get("state"),
    sessionStorage.getItem("flashreel_oauth_state"),
  );
  assert.equal(sessionStorage.getItem("flashreel_oauth_return"), "/my-videos");
});
test("rejects external return paths", async () => {
  await startGoogleLogin("//external.example/");
  assert.equal(sessionStorage.getItem("flashreel_oauth_return"), "/");
});
