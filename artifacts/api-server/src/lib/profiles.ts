import Client from "@replit/database";

const db = new Client();

export interface AdvisorProfile {
  name: string;
  agency: string;
  phone: string;
  email: string;
}

function profileKey(userId: string): string {
  return `profile_${userId}`;
}

export async function getProfile(userId: string): Promise<AdvisorProfile> {
  const result = await db.get(profileKey(userId));
  if (!result.ok || !result.value) {
    return { name: "", agency: "", phone: "", email: "" };
  }
  return result.value as AdvisorProfile;
}

export async function saveProfile(userId: string, profile: AdvisorProfile): Promise<void> {
  await db.set(profileKey(userId), profile);
}
