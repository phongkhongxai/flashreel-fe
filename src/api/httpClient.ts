import { API_BASE_URL } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { ApiError, ApiResponse } from './types';

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  responseType?: 'json' | 'text' | 'void';
  unwrap?: boolean;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
};

const SUCCESS_CODE = 1000;
let refreshPromise: Promise<string> | null = null;

export function createApiError(error: ApiError): ApiError {
  return error;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  let response = await sendRequest(url, options);

  if (shouldRefresh(response, path, options)) {
    const nextToken = await refreshAccessToken();
    response = await sendRequest(url, options, nextToken);
  }

  return parseResponse<T>(response, options);
}

async function sendRequest(url: string, options: RequestOptions, overrideToken?: string): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers || {}) };
  const init: RequestInit = {
    method: options.method || 'GET',
    headers
  };

  if (options.auth !== false) {
    const token = overrideToken || tokenStore.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    init.body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  try {
    return await fetch(url, init);
  } catch (error) {
    throw createApiError({ message: 'Network request failed', raw: error });
  }
}

async function parseResponse<T>(response: Response, options: RequestOptions): Promise<T> {
  if (options.responseType === 'void' || response.status === 204) {
    if (!response.ok) await throwHttpError(response);
    return undefined as T;
  }

  if (options.responseType === 'text') {
    const text = await response.text();
    if (!response.ok) throw createApiError({ status: response.status, message: text || response.statusText, raw: text });
    return text as T;
  }

  const data = await readJson(response);
  if (!response.ok) {
    const wrapped = data as Partial<ApiResponse<unknown>>;
    throw createApiError({
      status: response.status,
      code: wrapped.code,
      message: wrapped.message || response.statusText,
      raw: data
    });
  }

  if (options.unwrap === false) return data as T;

  const wrapped = data as ApiResponse<T>;
  if (typeof wrapped.code === 'number') {
    if (wrapped.code !== SUCCESS_CODE) {
      throw createApiError({
        status: response.status,
        code: wrapped.code,
        message: wrapped.message || 'Request failed',
        raw: wrapped
      });
    }
    return wrapped.result as T;
  }

  return data as T;
}

function shouldRefresh(response: Response, path: string, options: RequestOptions) {
  if (options.auth === false || options.skipAuthRefresh) return false;
  if (path.replace(/^\/+/, '') === 'auth/refresh') return false;
  return response.status === 401 || response.status === 403;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = runRefreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function runRefreshAccessToken() {
  const currentToken = tokenStore.getToken();
  if (!currentToken) {
    handleRefreshFailure();
    throw createApiError({ status: 401, message: 'Missing token for refresh' });
  }

  const response = await sendRequest(buildUrl('/auth/refresh'), {
    method: 'POST',
    body: { token: currentToken },
    auth: false,
    skipAuthRefresh: true
  });

  try {
    const auth = await parseResponse<{ token?: string; accessToken?: string }>(response, {});
    const nextToken = auth.token || auth.accessToken;
    if (!nextToken) {
      throw createApiError({ status: response.status, message: 'Refresh response did not include a token', raw: auth });
    }
    tokenStore.setToken(nextToken);
    return nextToken;
  } catch (error) {
    handleRefreshFailure();
    throw error;
  }
}

function handleRefreshFailure() {
  tokenStore.clear();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path.replace(/^\/+/, ''), `${API_BASE_URL.replace(/\/+$/, '')}/`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw createApiError({ status: response.status, message: 'Invalid JSON response', raw: text });
  }
}

async function throwHttpError(response: Response) {
  const raw = await response.text();
  throw createApiError({ status: response.status, message: raw || response.statusText, raw });
}
