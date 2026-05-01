import Client from "@replit/database";

const db = new Client();
const STORE_KEY = "travolo_subscribers";

export interface SubscriberRecord {
  email: string;
  subscribedAt: string;
  status: "active" | "inactive";
  note: string;
}

type SubscriberStore = Record<string, SubscriberRecord>;

async function load(): Promise<SubscriberStore> {
  const result = await db.get(STORE_KEY);
  if (!result.ok || !result.value) return {};
  return result.value as SubscriberStore;
}

async function save(store: SubscriberStore): Promise<void> {
  await db.set(STORE_KEY, store);
}

export async function addSubscriber(email: string, note = ""): Promise<void> {
  const normalised = email.toLowerCase().trim();
  const store = await load();
  const existing = store[normalised];
  store[normalised] = existing
    ? { ...existing, status: "active", note: note || existing.note }
    : { email: normalised, subscribedAt: new Date().toISOString(), status: "active", note };
  await save(store);
}

export async function removeSubscriber(email: string): Promise<void> {
  const normalised = email.toLowerCase().trim();
  const store = await load();
  delete store[normalised];
  await save(store);
}

export async function isSubscriber(email: string): Promise<boolean> {
  const store = await load();
  return store[email.toLowerCase().trim()]?.status === "active";
}

export async function getAllSubscribers(): Promise<SubscriberRecord[]> {
  const store = await load();
  return Object.values(store);
}
