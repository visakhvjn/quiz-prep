import { getOwnerId } from "@/lib/owner-id";

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-owner-id", getOwnerId());

  return fetch(path, {
    ...init,
    headers,
  });
}
