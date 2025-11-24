const OFFENSIVE_KEYWORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "motherfucker",
  "idiot",
  "racist",
  "nigger",
  "spic",
  "faggot",
];

export async function checkOffensiveLanguage(req, res) {
  const text = req.body?.message || "";
  if (!text) return false;
  const normalized = text.toLowerCase();
  if (OFFENSIVE_KEYWORDS.some((word) => normalized.includes(word))) {
    return res.status(406).json({
      error: "Offensive language detected",
    });
  }
}
