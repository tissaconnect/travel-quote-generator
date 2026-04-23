import { Router } from "express";

const router = Router();

router.post("/parse-quotes", async (req, res) => {
  const { rawText, tripDetails } = req.body as {
    rawText?: string;
    tripDetails?: { destination: string; dates: string; adults: string; nights: string };
  };

  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    res.status(400).json({ error: "rawText is required" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
    return;
  }

  const td = tripDetails ?? { destination: "Unknown", dates: "Unknown", adults: "2", nights: "5" };

  const prompt = `You are a travel quote parser. Extract hotel options from this raw travel quote text and return ONLY valid JSON, no markdown, no explanation.

Trip Details:
- Destination: ${td.destination}
- Dates: ${td.dates}
- Adults: ${td.adults}
- Nights: ${td.nights}

Raw Quote Text:
${rawText}

Return this exact JSON structure:
{
  "hotels": [
    {
      "name": "Hotel name",
      "stars": 4,
      "category": "Budget-Friendly / Best Value / Mid-Range / Luxury",
      "totalPrice": "$2,058",
      "perPersonPrice": "$1,029",
      "refundableBy": "Dec 7",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "vibe": "One sentence description of the vibe/energy",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "advisorPick": false
    }
  ],
  "advisorNote": "Advisor's personal recommendation summary if present"
}

Extract all hotels mentioned. Set advisorPick to true for the one the advisor recommends most strongly.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "Anthropic API error");
      res.status(500).json({ error: "Failed to call AI API. Check your API key." });
      return;
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content[0]?.text?.trim() ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      req.log.error({ text }, "No JSON found in response");
      res.status(500).json({ error: "AI returned an unexpected response format." });
      return;
    }

    const result = JSON.parse(text.slice(jsonStart, jsonEnd));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error parsing quotes");
    res.status(500).json({ error: "Failed to parse quotes. Please try again." });
  }
});

export default router;
