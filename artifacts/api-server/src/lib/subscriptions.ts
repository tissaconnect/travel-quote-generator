const activeSubscribers = new Set<string>();

export function addSubscriber(email: string) {
  activeSubscribers.add(email.toLowerCase());
}

export function removeSubscriber(email: string) {
  activeSubscribers.delete(email.toLowerCase());
}

export function isSubscriber(email: string): boolean {
  return activeSubscribers.has(email.toLowerCase());
}
