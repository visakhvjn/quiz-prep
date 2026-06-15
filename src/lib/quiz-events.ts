const listeners = new Set<() => void>();

export function notifyQuizListChanged() {
  listeners.forEach((listener) => listener());
}

export function subscribeQuizListChanged(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
