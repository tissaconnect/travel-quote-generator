export interface SubscriberRecord {
  email: string;
  addedAt: string;
  note: string;
}

const activeSubscribers = new Map<string, SubscriberRecord>();

export function addSubscriber(email: string, note = ""): void {
  const key = email.toLowerCase().trim();
  if (activeSubscribers.has(key)) {
    if (note) {
      const existing = activeSubscribers.get(key)!;
      activeSubscribers.set(key, { ...existing, note });
    }
  } else {
    activeSubscribers.set(key, { email: key, addedAt: new Date().toISOString(), note });
  }
}

export function removeSubscriber(email: string): void {
  activeSubscribers.delete(email.toLowerCase().trim());
}

export function isSubscriber(email: string): boolean {
  return activeSubscribers.has(email.toLowerCase().trim());
}

export function getAllSubscribers(): SubscriberRecord[] {
  return Array.from(activeSubscribers.values());
}
