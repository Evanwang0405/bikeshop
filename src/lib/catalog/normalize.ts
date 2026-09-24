/**
 * Search normalization for the China-market catalog.
 *
 * Chinese road cyclists type a mix of official names, abbreviations, pinyin-ish
 * nicknames and occasionally the wrong Chinese characters (e.g. 锐豹 for 瑞豹).
 * Rather than forcing exact official names, every product carries aliases and
 * every query is normalized the same way before matching.
 */

const FULL_WIDTH_OFFSET = 0xfee0;

/** Convert full-width ASCII (ＡＢＣ１２３) and ideographic space to their ASCII forms. */
export function toHalfWidth(input: string): string {
  return input
    .replace(/[\uff01-\uff5e]/g, (char) => String.fromCharCode(char.charCodeAt(0) - FULL_WIDTH_OFFSET))
    .replace(/\u3000/g, " ");
}

/**
 * Canonical form used for both aliases and queries:
 * lowercase, half-width, no spaces / hyphens / underscores / dots / slashes / plus.
 * Chinese characters are preserved and matched literally.
 */
export function normalizeSearchTerm(input: string): string {
  return toHalfWidth(input)
    .toLowerCase()
    .replace(/[\s\-_./\\+|()[\]{}'"`,:;!?*&#@~^%$=<>]/g, "")
    .trim();
}

/**
 * Abbreviation expansions applied to queries only, so that "ADV" reaches
 * "Advanced" and "PP" reaches "Propel".
 */
const QUERY_EXPANSIONS: Record<string, string[]> = {
  adv: ["advanced"],
  advanced: ["adv"],
  pro: ["pro"],
  pp: ["propel"],
  propel: ["pp"],
  tcr: ["tcr"],
  str: ["scultura"],
  scultura: ["str"],
  t1550: ["t1550"],
  slc: ["slc"],
  ut: ["ultegra"],
  da: ["duraace", "durace"],
  di2: ["di2"],
  axs: ["axs"],
  kom: ["kom"],
};

export type SearchTokens = {
  raw: string;
  normalized: string;
  expanded: string[];
};

export function tokenizeQuery(raw: string): SearchTokens {
  const normalized = normalizeSearchTerm(raw);
  const expanded = new Set<string>([normalized]);
  for (const [key, values] of Object.entries(QUERY_EXPANSIONS)) {
    if (normalized.includes(key)) {
      expanded.add(normalized.split(key).join(values[0]));
      for (const value of values) expanded.add(value);
    }
  }
  return { raw, normalized, expanded: [...expanded] };
}

/**
 * Match a candidate string against the query tokens.
 *
 * Returns the best base score plus the token that produced it, so the caller can
 * weigh how much of the *query* that token actually explains.
 *
 * The distinction matters: for the query "TCR Advanced 3" the token "tcr" is an
 * exact match against the family of every TCR bike, which would otherwise make
 * `TCR SLR` look like a perfect hit. Only the token "tcradvanced3" is specific.
 */
export function matchTerm(
  candidate: string,
  tokens: SearchTokens,
): { score: number; matchedToken: string } {
  const normalizedCandidate = normalizeSearchTerm(candidate);
  if (!normalizedCandidate) return { score: 0, matchedToken: "" };

  let best = 0;
  let matchedToken = "";
  for (const token of tokens.expanded) {
    if (!token) continue;
    let score = 0;
    if (normalizedCandidate === token) score = 100;
    else if (normalizedCandidate.startsWith(token)) score = 70;
    else if (normalizedCandidate.includes(token)) score = 45;
    if (score > best) {
      best = score;
      matchedToken = token;
    }
  }
  return { score: best, matchedToken };
}

/**
 * Score a candidate string against query tokens. Returns 0 when there is no match.
 * Higher is better. Alias hits are scored slightly below exact identity hits.
 *
 * The result is scaled by how much of the query the matched token covers, so a
 * whole-query match always outranks a match on a single short fragment.
 */
export function scoreTerm(candidate: string, tokens: SearchTokens, weight = 1): number {
  const { score, matchedToken } = matchTerm(candidate, tokens);
  if (!score) return 0;

  const queryLength = tokens.normalized.length || 1;
  // Coverage is capped at 1 so a long candidate containing the query does not
  // out-score an exact whole-query match.
  const coverage = Math.min(1, matchedToken.length / queryLength);

  return score * weight * coverage;
}

/** Join the parts of a bicycle name for display, skipping unknown and duplicate levels. */
export function displayName(parts: {
  brand: string;
  family: string;
  tier?: string | null;
  trim?: string | null;
}): string {
  const seen = new Set<string>();
  return [parts.brand, parts.family, parts.tier, parts.trim]
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      const key = normalizeSearchTerm(part);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
}

/** Stable, readable identifier from the normalized identity tuple. */
export function slugify(value: string): string {
  return toHalfWidth(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}