const OWNER_ID_KEY = "quizprep-owner-id";

function createOwnerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `owner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOwnerId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(OWNER_ID_KEY);
  if (existing) return existing;

  const ownerId = createOwnerId();
  window.localStorage.setItem(OWNER_ID_KEY, ownerId);
  return ownerId;
}
