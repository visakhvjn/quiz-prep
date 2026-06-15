import type { Quiz } from "@/types/quiz";

const STORAGE_KEY = "interview-quiz-sessions";

let cachedRaw: string | null | undefined;
let cachedSnapshots = new Map<string, Quiz | null>();
let cachedListRaw: string | null | undefined;
let cachedList: Quiz[] = [];

function invalidateSnapshotCache() {
  cachedRaw = undefined;
  cachedSnapshots = new Map();
  cachedListRaw = undefined;
  cachedList = [];
}

function loadSnapshotsFromStorage(): Map<string, Quiz | null> {
  if (typeof window === "undefined") {
    return new Map();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshots;
  }

  cachedRaw = raw;
  cachedSnapshots = new Map();

  if (!raw) {
    return cachedSnapshots;
  }

  try {
    const existing = JSON.parse(raw) as Record<string, Quiz>;
    for (const [id, quiz] of Object.entries(existing)) {
      cachedSnapshots.set(id, quiz);
    }
  } catch {
    cachedSnapshots = new Map();
  }

  return cachedSnapshots;
}

export function saveQuiz(quiz: Quiz) {
  if (typeof window === "undefined") return;
  const existing = getAllQuizzes();
  existing[quiz.id] = quiz;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  invalidateSnapshotCache();
  notifyListeners();
}

export function getQuiz(id: string): Quiz | null {
  return loadSnapshotsFromStorage().get(id) ?? null;
}

export function getQuizSnapshot(id: string): Quiz | null {
  return getQuiz(id);
}

export function listQuizzes(): Quiz[] {
  loadSnapshotsFromStorage();
  return Array.from(cachedSnapshots.values())
    .filter((quiz): quiz is Quiz => quiz !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getQuizzesListSnapshot(): Quiz[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedListRaw) {
    return cachedList;
  }

  cachedListRaw = raw;
  cachedList = listQuizzes();
  return cachedList;
}

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeToQuizStore(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      invalidateSnapshotCache();
      notifyListeners();
    }
  };

  listeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getAllQuizzes(): Record<string, Quiz> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Quiz>;
  } catch {
    return {};
  }
}
