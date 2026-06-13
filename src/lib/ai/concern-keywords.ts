export type ConcernCategory = "skin" | "hair" | "lips";

export interface ConcernGroup {
  category: ConcernCategory;
  groupName: string;
  rootKeyword: string;
  keywords: string[];
}

export const concernGroups: ConcernGroup[] = [
  {
    category: "skin",
    groupName: "Acne & Breakouts",
    rootKeyword: "acne",
    keywords: [
      "acne",
      "pimples",
      "pimple marks",
      "breakouts",
      "frequent breakouts",
      "cystic acne",
      "hormonal acne",
      "blackheads",
      "whiteheads",
      "clogged pores",
      "congested skin",
      "acne scars",
      "post-acne marks",
    ],
  },
  {
    category: "skin",
    groupName: "Oiliness & Pores",
    rootKeyword: "oily skin",
    keywords: [
      "oily skin",
      "oily face",
      "greasy skin",
      "excess oil",
      "sebum control",
      "large pores",
      "open pores",
      "shiny face",
      "oily t-zone",
    ],
  },
  {
    category: "skin",
    groupName: "Dryness & Dehydration",
    rootKeyword: "dry skin",
    keywords: [
      "dry skin",
      "flaky skin",
      "dehydrated skin",
      "rough texture",
      "peeling skin",
      "tight skin",
      "dull dry skin",
    ],
  },
  {
    category: "skin",
    groupName: "Pigmentation & Uneven Tone",
    rootKeyword: "pigmentation",
    keywords: [
      "pigmentation",
      "pigmantation",
      "hyperpigmentation",
      "dark spots",
      "dark spots remove",
      "brown spots",
      "uneven skin tone",
      "sun spots",
      "age spots",
      "tanning",
      "suntan removal",
      "tan removal",
    ],
  },
  {
    category: "skin",
    groupName: "Brightening & Glow",
    rootKeyword: "skin brightening",
    keywords: [
      "dull skin",
      "no glow",
      "glowing skin",
      "face glow",
      "glow cream",
      "radiant skin",
      "skin brightening",
      "whitening",
      "glass skin",
      "clear skin",
    ],
  },
  {
    category: "skin",
    groupName: "Anti-Aging",
    rootKeyword: "anti-aging",
    keywords: [
      "wrinkles",
      "fine lines",
      "aging skin",
      "mature skin",
      "sagging skin",
      "anti-aging",
      "firming",
      "crowâ€™s feet",
    ],
  },
  {
    category: "skin",
    groupName: "Sensitivity & Irritation",
    rootKeyword: "sensitive skin",
    keywords: [
      "sensitive skin",
      "redness",
      "irritation",
      "itchy skin",
      "inflamed skin",
      "allergic reaction",
    ],
  },
  {
    category: "skin",
    groupName: "Dark Circles & Eye Concerns",
    rootKeyword: "dark circles",
    keywords: [
      "dark circles",
      "under eye bags",
      "puffy eyes",
      "eye wrinkles",
      "under eye darkness",
      "dark under eye",
      "dark circles under eyes",
      "under eye dark circles",
      "eye darkness",
    ],
  },
  {
    category: "skin",
    groupName: "Sun Protection",
    rootKeyword: "sun protection",
    keywords: [
      "sun damage",
      "sunscreen",
      "SPF",
      "UV protection",
    ],
  },
  {
    category: "hair",
    groupName: "Hair Fall & Thinning",
    rootKeyword: "hair fall",
    keywords: [
      "hair fall",
      "hair loss",
      "hair fall control",
      "excessive hair fall",
      "thinning hair",
      "bald spots",
      "receding hairline",
      "weak roots",
      "baal jhad",
      "bal jhad",
      "baal jhadna",
      "baal girna",
      "hair loss control",
    ],
  },
  {
    category: "hair",
    groupName: "Hair Growth",
    rootKeyword: "hair growth",
    keywords: [
      "hair growth",
      "faster hair growth",
      "regrowth",
      "thicker hair",
    ],
  },
  {
    category: "hair",
    groupName: "Dandruff & Scalp Issues",
    rootKeyword: "dandruff",
    keywords: [
      "dandruff",
      "dandruf",
      "flaky scalp",
      "itchy scalp",
      "dry scalp",
      "oily scalp",
      "scalp buildup",
    ],
  },
  {
    category: "hair",
    groupName: "Dry & Damaged Hair",
    rootKeyword: "dry hair",
    keywords: [
      "dry hair",
      "rough hair",
      "damaged hair",
      "split ends",
      "brittle hair",
    ],
  },
  {
    category: "hair",
    groupName: "Frizz & Manageability",
    rootKeyword: "frizzy hair",
    keywords: [
      "frizzy hair",
      "unmanageable hair",
      "tangled hair",
      "smoothening",
      "silky hair",
    ],
  },
  {
    category: "hair",
    groupName: "Hair Texture & Styling",
    rootKeyword: "curly hair care",
    keywords: [
      "curly hair care",
      "straight hair care",
      "wavy hair products",
      "heat damage",
    ],
  },
  {
    category: "hair",
    groupName: "Shine & Volume",
    rootKeyword: "dull hair",
    keywords: [
      "dull hair",
      "lack of shine",
      "flat hair",
      "no volume",
      "volumizing",
    ],
  },
  {
    category: "hair",
    groupName: "Premature Greying",
    rootKeyword: "grey hair",
    keywords: [
      "grey hair",
      "premature greying",
    ],
  },
  {
    category: "lips",
    groupName: "Dry & Chapped Lips",
    rootKeyword: "dry lips",
    keywords: [
      "dry lips",
      "dry lip",
      "chapped lips",
      "chapped lip",
      "cracked lips",
      "peeling lips",
    ],
  },
  {
    category: "lips",
    groupName: "Pigmentation & Dark Lips",
    rootKeyword: "dark lips",
    keywords: [
      "dark lips",
      "pigmented lips",
      "uneven lip tone",
      "lip discoloration",
    ],
  },
  {
    category: "lips",
    groupName: "Lip Care & Softness",
    rootKeyword: "soft lips",
    keywords: [
      "soft lips",
      "smooth lips",
      "lip hydration",
      "lip nourishment",
    ],
  },
  {
    category: "lips",
    groupName: "Lip Brightening",
    rootKeyword: "pink lips",
    keywords: [
      "pink lips",
      "lip lightening",
      "natural lip color",
    ],
  },
  {
    category: "skin",
    groupName: "Underarm Concerns",
    rootKeyword: "underarm darkness",
    keywords: [
      "underarm darkness",
      "under arm darkness",
      "underarm dark",
      "underarm darkening",
      "dark underarms",
      "dark underarm",
      "underarm pigmentation",
    ],
  },
  {
    category: "skin",
    groupName: "Baby Care",
    rootKeyword: "baby care",
    keywords: [
      "baby care",
      "baby skin",
      "baby bath",
      "baby lotion",
      "gentle baby skin",
      "baby products",
    ],
  },
  {
    category: "lips",
    groupName: "Protection & Repair",
    rootKeyword: "sun protection for lips",
    keywords: [
      "sun protection for lips",
      "SPF lip balm",
      "healing lips",
    ],
  },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/[-]/g, " ")
    .replace(/[â€˜â€™â€šâ€›]/g, "'")
    .replace(/[â€œâ€â€žâ€Ÿ]/g, '"')
    .replace(/undereye/g, "under eye")
    .replace(/underarms?/g, "under arm")
    .replace(/darkcircle/g, "dark circles")
    .replace(/dark circles?/g, "dark circles")
    .replace(/\b(ke|ka|liye|ke liye|hain|hai|rahe|rahi|raha)\b/g, " ")
    .replace(/[^a-z0-9\s'\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const allConcernKeywords = concernGroups.flatMap((group) => group.keywords);

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i += 1) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function findClosestConcernKeyword(normalizedPhrase: string): string | null {
  let bestScore = 0.75;
  let bestKeyword: string | null = null;

  for (const keyword of canonicalKeywordMap.keys()) {
    const maxLength = Math.max(normalizedPhrase.length, keyword.length);
    if (maxLength === 0) continue;

    const distance = levenshteinDistance(normalizedPhrase, keyword);
    const similarity = 1 - distance / maxLength;

    if (similarity > bestScore) {
      bestScore = similarity;
      bestKeyword = keyword;
    }
  }

  return bestKeyword;
}

const canonicalKeywordMap = new Map<string, string>();
const keywordCategoryMap = new Map<string, ConcernCategory>();
const keywordRootMap = new Map<string, string>();

for (const group of concernGroups) {
  for (const keyword of group.keywords) {
    const normalized = normalizeText(keyword);
    canonicalKeywordMap.set(normalized, keyword);
    keywordCategoryMap.set(normalized, group.category);
    keywordRootMap.set(normalized, normalizeText(group.rootKeyword));
  }
}

export const allNormalizedConcernKeywords = Array.from(canonicalKeywordMap.keys());

export function normalizeConcernKeyword(value: string): string {
  return normalizeText(value);
}

export function getAllowedConcernKeyword(value: string): string | null {
  const normalized = normalizeConcernKeyword(value);
  return canonicalKeywordMap.get(normalized) ?? null;
}

export function isValidConcernKeyword(value: string): boolean {
  return getAllowedConcernKeyword(value) !== null;
}

export function getConcernRoot(value: string): string | null {
  const normalized = normalizeConcernKeyword(value);
  return keywordRootMap.get(normalized) ?? null;
}

export function getConcernCategory(value: string): ConcernCategory | null {
  const normalized = normalizeConcernKeyword(value);
  return keywordCategoryMap.get(normalized) ?? null;
}

export function getKeywordsByCategory(category: ConcernCategory): string[] {
  return concernGroups
    .filter((group) => group.category === category)
    .flatMap((group) => group.keywords);
}

function rewriteConcernPhrases(text: string) {
  return text
    .replace(/\b(lips? are dry|dry lips?|dry lip|lip is dry|lips? dry|dry lips?)\b/g, "dry lips")
    .replace(/\b(chapped lips?|chapped lip)\b/g, "chapped lips")
    .replace(/\b(dark lips?|pigmented lips|uneven lip tone|lip discoloration)\b/g, "dark lips")
    .replace(/\b(lip hydration|lip nourishment|soft lips?|smooth lips?)\b/g, "soft lips")
    .replace(/\b(pink lips?|lip lightening|natural lip color)\b/g, "pink lips")
    .replace(/\b(spf lip balm|sun protection for lips|healing lips)\b/g, "spf lip balm")
    .replace(/\b(lips?|lip)\b/g, "lips");
}

export function getConcernKeywordsFromText(text: string): string[] {
  let normalizedText = normalizeText(text);
  normalizedText = rewriteConcernPhrases(normalizedText);

  const matched = new Set<string>();

  const orderedKeywords = allConcernKeywords
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((keyword) => normalizeText(keyword));

  for (const keyword of orderedKeywords) {
    const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "u");

    if (regex.test(normalizedText)) {
      const canonical = canonicalKeywordMap.get(keyword);
      if (canonical) matched.add(canonical);
    }
  }

  const tokens = normalizedText.split(" ").filter(Boolean);

  for (let windowSize = Math.min(4, tokens.length); windowSize >= 1; windowSize -= 1) {
    for (let i = 0; i + windowSize <= tokens.length; i += 1) {
      const phrase = tokens.slice(i, i + windowSize).join(" ");
      if (phrase.length < 3) continue;
      if (["and", "or", "for", "the", "to", "with", "my", "me", "ke", "ka", "liye", "hai", "hain", "rahe", "rahi", "raha"].includes(phrase)) {
        continue;
      }

      const closest = findClosestConcernKeyword(phrase);
      if (closest) {
        const canonical = canonicalKeywordMap.get(closest);
        if (canonical) matched.add(canonical);
      }
    }
  }

  return Array.from(matched);
}

export function getConcernRootsFromKeywords(keywords: string[]): string[] {
  return Array.from(
    new Set(
      keywords
        .map((keyword) => getConcernRoot(keyword))
        .filter((root): root is string => !!root)
    )
  );
}

const irrelevantSignals = [
  "politics",
  "election",
  "government",
  "voting",
  "football",
  "soccer",
  "basketball",
  "cricket",
  "tennis",
  "programming",
  "javascript",
  "python",
  "code",
  "coding",
  "math",
  "calculate",
  "calculator",
  "recipe",
  "cooking",
  "movie",
  "music",
  "crypto",
  "bitcoin",
  "stock",
  "finance",
  "insurance",
  "travel",
  "weather",
  "health insurance",
];

export function hasBeautyIntent(text: string): boolean {
  const normalized = normalizeText(text);
  return (
    /\b(skin|hair|baal|lip|lips|honth|scalp|sp?f|sunscreen|sun protection|beauty|acne|pimple|pimples|dandruff|dry|dark circles|pigment|frizz|chapped|tan|glow|bal|jhad)\b/.test(normalized) ||
    getConcernKeywordsFromText(normalized).length > 0
  );
}

export function isIrrelevantQuery(text: string): boolean {
  const normalized = normalizeText(text);
  const hasConcern = getConcernKeywordsFromText(normalized).length > 0;
  const hasBeauty = hasConcern || /\b(skin|hair|baal|lip|lips|honth|scalp|sunscreen|sun protection|beauty)\b/.test(normalized);

  if (hasBeauty) {
    return false;
  }

  return irrelevantSignals.some((signal) => normalized.includes(signal));
}

export function getConcernCategoriesFromText(text: string): string[] {
  const keywords = getConcernKeywordsFromText(text);
  const categories = new Set<string>();

  for (const keyword of keywords) {
    const category = getConcernCategory(keyword);
    if (category) {
      categories.add(category);
    }
  }

  const normalized = normalizeText(text);

  if (categories.size === 0) {
    if (/(hair|scalp|baal|bal|jhad|girna)/.test(normalized)) categories.add("hair");
    if (/(lip|lips|honth|hontho)/.test(normalized)) categories.add("lips");
    if (/(skin|face|sun|sunscreen|spf|under arm|underarm)/.test(normalized)) categories.add("skin");
  }

  if (/(soap|soaps)/.test(normalized)) categories.add("soap");
  if (/(baby|baby skin|baby bath|baby products)/.test(normalized)) categories.add("baby-care");

  if (categories.size === 0) {
    categories.add("skin");
    categories.add("hair");
    categories.add("lips");
  }

  return Array.from(categories);
}

export function sanitizeConcernKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedKeywords = value
    .map((item) => String(item || "").trim())
    .map((item) => getAllowedConcernKeyword(item))
    .filter((item): item is string => !!item);

  const invalid = Array.from(new Set(value.map((item) => String(item || "").trim()))).filter(
    (item) => item && !isValidConcernKeyword(item)
  );

  if (invalid.length > 0) {
    throw new Error(
      `Invalid concern keywords: ${invalid.map((item) => `"${item}"`).join(", ")}`
    );
  }

  return normalizedKeywords;
}
