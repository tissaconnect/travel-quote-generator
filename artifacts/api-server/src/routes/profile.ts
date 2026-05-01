import { Router } from "express";
import { getAuth } from "@clerk/express";
import { getProfile, saveProfile, type AdvisorProfile } from "../lib/profiles";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/profile", requireAuth, async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId || auth?.userId) as string;
  try {
    const profile = await getProfile(userId);
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Could not load profile" });
  }
});

router.post("/profile", requireAuth, async (req, res) => {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId || auth?.userId) as string;
  const { name, agency, phone, email } = req.body as Partial<AdvisorProfile>;
  const profile: AdvisorProfile = {
    name: (name ?? "").slice(0, 200),
    agency: (agency ?? "").slice(0, 200),
    phone: (phone ?? "").slice(0, 50),
    email: (email ?? "").slice(0, 200),
  };
  try {
    await saveProfile(userId, profile);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Could not save profile" });
  }
});

export default router;
