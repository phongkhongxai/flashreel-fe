import { request } from "./httpClient";
import { AuthenticationResponse, RegisterUserInput } from "../types/api";
export function login(
  username: string,
  password: string,
): Promise<AuthenticationResponse> {
  return request("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}
export function authenticateOutbound(
  code: string,
  codeVerifier: string,
): Promise<AuthenticationResponse> {
  return request("/auth/outbound/authentication", {
    method: "POST",
    query: { code, codeVerifier },
    auth: false,
  });
}
export function logout(
  accessToken?: string,
  refreshToken?: string,
): Promise<void> {
  return request("/auth/logout", {
    method: "POST",
    body: {
      ...(accessToken && { accessToken }),
      ...(refreshToken && { refreshToken }),
    },
    auth: false,
  });
}
export function refreshToken(
  refreshToken: string,
): Promise<AuthenticationResponse> {
  return request("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}
export function verifyEmailCode(email: string, code: string): Promise<string> {
  return request("/auth/verify-code", {
    method: "POST",
    query: { email, code },
    auth: false,
    responseType: "text",
  });
}
export function registerUser(input: RegisterUserInput): Promise<string> {
  return request("/users/registration", {
    method: "POST",
    body: input,
    auth: false,
  });
}
export function introspectToken(token: string): Promise<{ valid: boolean }> {
  return request("/auth/introspect", {
    method: "POST",
    body: { token },
    auth: false,
  });
}
export function resendCode(email: string) {
  return request("/auth/resend-code", {
    method: "POST",
    body: { email },
    auth: false,
    unwrap: false,
  });
}
export function forgotPassword(email: string) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
    unwrap: false,
  });
}
export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return request("/auth/reset-password", {
    method: "POST",
    body: { email, code, newPassword },
    auth: false,
    unwrap: false,
  });
}
