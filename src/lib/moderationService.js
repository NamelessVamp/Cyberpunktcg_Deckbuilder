// NON OMNIS MORIAR — moderationService.js
// EX MACHINA — Content moderation for user-generated text
// Client-side first layer — DB constraints are the second layer

const BLOCKED_PATTERNS = [
  // Hate speech / slurs
  /\b(n[i1]gg[ae]r|f[a4]gg[o0]t|ch[i1]nk|sp[i1]c|k[i1]ke|g[o0]{2}k)\b/i,
  // Explicit sexual content
  /\b(p[o0]rn|xxx|f[u*]ck[ie]?r?|c[u*]nt|p[u*]ssy|[a4]ss[h]?[o0]le)\b/i,
  // Extreme violence / self-harm
  /\b(k[i1]ll\s+your[s]?[e3]lf|su[i1]c[i1]de|g[o0]\s+d[i1][e3])\b/i,
];

export function moderateText(text) {
  if (!text || typeof text !== "string") return { ok: true };
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        reason:
          "Content violates community guidelines. Please keep it respectful.",
      };
    }
  }
  return { ok: true };
}

export function moderateProfile({ displayName, bio, discordHandle }) {
  const fields = [displayName, bio, discordHandle].filter(Boolean);
  for (const field of fields) {
    const result = moderateText(field);
    if (!result.ok) return result;
  }
  return { ok: true };
}

export function moderateDeckContent({ name, description, notes }) {
  const fields = [name, description, notes].filter(Boolean);
  for (const field of fields) {
    const result = moderateText(field);
    if (!result.ok) return result;
  }
  return { ok: true };
}
