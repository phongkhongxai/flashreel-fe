import { getApiBaseUrl } from "../config/env";
import { tokenStore } from "../auth/tokenStore";
import { ApiError, ApiResponse } from "../types/api";
type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  responseType?: "json" | "text" | "void";
  unwrap?: boolean;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
};
let refreshPromise: Promise<void> | null = null;
export function createApiError(error: ApiError): ApiError {
  return error;
}
function urlFor(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.replace(/^\/+/, ""),
    `${getApiBaseUrl().replace(/\/+$/, "")}/`,
  );
  for (const [key, value] of Object.entries(query || {}))
    if (value !== undefined && value !== null && value !== "")
      url.searchParams.set(key, String(value));
  return url.toString();
}
async function send(
  url: string,
  options: RequestOptions,
  token: string | null,
) {
  const headers: Record<string, string> = { ...options.headers };
  const init: RequestInit = { method: options.method || "GET", headers };
  if (options.auth !== false && token)
    headers.Authorization = `Bearer ${token}`;
  if (options.body instanceof FormData) init.body = options.body;
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }
  try {
    return await fetch(url, init);
  } catch (error) {
    throw createApiError({ message: "Network request failed", raw: error });
  }
}
async function parse<T>(
  response: Response,
  options: RequestOptions,
): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  const wrapped =
    data && typeof data === "object" ? (data as ApiResponse<T>) : undefined;
  if (
    !response.ok ||
    (wrapped && typeof wrapped.code === "number" && wrapped.code !== 1000)
  ) {
    const message = wrapped?.message;
    throw createApiError({
      status: response.status,
      code: wrapped?.code,
      message: Array.isArray(message)
        ? message.join(", ")
        : message ||
          (typeof data === "string" ? data : response.statusText) ||
          "Request failed",
      raw: data,
    });
  }
  if (options.responseType === "void") return undefined as T;
  if (options.responseType === "text") return text as T;
  if (options.unwrap === false) return data as T;
  if (wrapped && typeof wrapped.code === "number") return wrapped.result as T;
  return data as T;
}
async function refreshOnce() {
  if (!refreshPromise) {
    const generation = tokenStore.getGeneration();
    const refreshToken = tokenStore.getRefreshToken();
    refreshPromise = (async () => {
      try {
        if (!refreshToken)
          throw createApiError({
            status: 401,
            message: "Phiên đăng nhập đã hết hạn",
          });
        const response = await send(
          urlFor("/auth/refresh"),
          { method: "POST", body: { refreshToken }, auth: false },
          null,
        );
        const pair = await parse<{ accessToken: string; refreshToken: string }>(
          response,
          {},
        );
        if (!pair?.accessToken || !pair?.refreshToken)
          throw createApiError({
            status: 401,
            message: "Invalid token response",
          });
        if (tokenStore.getGeneration() !== generation)
          throw createApiError({ status: 401, message: "Session changed" });
        tokenStore.rotateTokens(
          pair.accessToken,
          pair.refreshToken,
          generation,
        );
      } catch (error) {
        const e = error as ApiError;
        if (
          tokenStore.getGeneration() === generation &&
          [400, 401, 403].includes(e.status || 0)
        )
          tokenStore.clear();
        throw error;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = urlFor(path, options.query);
  const token = tokenStore.getToken();
  const generation = tokenStore.getGeneration();
  let response = await send(url, options, token);
  if (
    response.status === 401 &&
    options.auth !== false &&
    !options.skipAuthRefresh &&
    token
  ) {
    if (generation !== tokenStore.getGeneration())
      throw createApiError({ status: 401, message: "Session changed" });
    if (tokenStore.getToken() === token) await refreshOnce();
    if (generation !== tokenStore.getGeneration() || !tokenStore.getToken())
      throw createApiError({
        status: 401,
        message: "Phiên đăng nhập đã hết hạn",
      });
    response = await send(url, options, tokenStore.getToken());
  }
  return parse<T>(response, options);
}
