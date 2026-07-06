import { request } from './httpClient';

export function requestAccountCancellation(): Promise<string> {
  return request('/account/cancellation/request', { method: 'POST' });
}

export function confirmAccountCancellation(): Promise<string> {
  return request('/account/cancellation/confirm', { method: 'POST', body: { confirmed: true } });
}
