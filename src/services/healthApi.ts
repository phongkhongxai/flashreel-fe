export function getHealth(): Promise<{ status: string }> {
  return request("/health", { auth: false, unwrap: false });
}
