import { request } from './httpClient';
import { AuthenticationResponse, RegisterUserInput } from './types';

export function login(username: string, password: string): Promise<AuthenticationResponse> {
  return request('/auth/login', { method: 'POST', body: { username, password }, auth: false });
}

export function authenticateOutbound(code: string, codeVerifier: string): Promise<AuthenticationResponse> {
  return request('/auth/outbound/authentication', {
    method: 'POST',
    query: { code, codeVerifier },
    auth: false
  });
}

export function logout(token: string): Promise<void> {
  return request('/auth/logout', { method: 'POST', body: { token }, auth: false });
}

export function refreshToken(token: string): Promise<AuthenticationResponse> {
  return request('/auth/refresh', { method: 'POST', body: { token }, auth: false });
}

export function verifyEmailCode(email: string, code: string): Promise<string> {
  return request('/auth/verify-code', { method: 'POST', query: { email, code }, auth: false, responseType: 'text' });
}

export function registerUser(input: RegisterUserInput): Promise<string> {
  return request('/users/registeration', { method: 'POST', body: input, auth: false });
}

export function introspectToken(token: string): Promise<{ valid: boolean }> {
  return request('/auth/introspect', { method: 'POST', body: { token }, auth: false });
}
