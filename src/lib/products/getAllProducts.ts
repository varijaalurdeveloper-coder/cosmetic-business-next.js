import { Product } from "@/types";
import { products as staticProducts } from "@/lib/data/products";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const PLACEHOLDER_IMAGE = "/placeholder.png";
const INACTIVE_PRODUCT_STATUSES = new Set([
  "draft",
  "inactive",
  "unpublished",
  "deleted",
  "removed",
]);
const FALSEY_BOOLEAN_VALUES = new Set([
  "false",
  "0",
  "no",
  "none",
  "unavailable",
  "hidden",
  "off",
  "out of stock",
  "out_of_stock",
]);

function normalizeString(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeProductName(value: unknown): string {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, "")
    .replace(/\s+/g, " ");
}

function normalizeCategory(category: unknown): Product["category"] {
  const normalized = normalizeString(category).toLowerCase();
  if (!normalized) return "general";
  if (normalized.includes("hair")) return "hair";
  if (normalized.includes("soap")) return "soap";
  if (normalized.includes("baby")) return "baby-care";
  if (normalized.includes("lip")) return "lips";
  if (normalized === "body") return "body";
  if (normalized.includes("skin") || normalized.includes("face")) return "skin";
  return "general";
}

function normalizeArray(value: unknown): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeArray(item));
  }

  const normalized = normalizeString(value);
  if (!normalized) return [];

  return normalized
    .split(/[,;|]/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return true;
  if (FALSEY_BOOLEAN_VALUES.has(normalized)) return false;
  return true;
}

function normalizeImagePath(value: unknown): string {
  const image = normalizeString(value);
  if (!image) return PLACEHOLDER_IMAGE;
  return image;
}

function normalizeSubcategory(value: unknown, tags: unknown): string | undefined {
  const raw = normalizeString(value);
  if (raw) return raw;

  const normalizedTags = normalizeArray(tags);
  return normalizedTags.length > 0 ? normalizedTags[0] : undefined;
}

function normalizePriority(value: unknown): number | undefined {
  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) return numberValue;
  return undefined;
}

function normalizeUsage(value: unknown): string | undefined {
  const raw = normalizeString(value);
  return raw || undefined;
}

function normalizeConcerns(value: unknown, fallback: unknown, fallback2: unknown = []): string[] {
  const normalized = normalizeArray(value);
  if (normalized.length) return normalized;

  const fallbackValues = normalizeArray(fallback);
  if (fallbackValues.length) return fallbackValues;

  return normalizeArray(fallback2);
}

function normalizeConcernKeywords(
  value: unknown,
  fallback: unknown,
  fallback2: unknown = []
): string[] {
  const normalized = normalizeArray(value);
  if (normalized.length) return normalized;

  const fallbackValues = normalizeArray(fallback);
  if (fallbackValues.length) return fallbackValues;

  return normalizeArray(fallback2);
}

function normalizeTags(product: Product, rawProduct: any): string[] {
  const tags = normalizeArray(rawProduct.tags ?? rawProduct.tag);
  const enrichedTags = [
    ...tags,
    ...(product.concerns ?? []),
    ...(product.skin_type ?? []),
    ...(product.hair_type ?? []),
    ...(product.benefits ?? []),
    ...(product.ingredients ?? []),
    ...(product.usage ? [product.usage.toLowerCase()] : []),
    ...autoEnrichTags(product),
  ];

  return Array.from(new Set(enrichedTags));
}

function autoEnrichTags(product: Product): string[] {
  const text = `${product.name} ${product.description} ${product.tags?.join(" ") || ""} ${product.benefits?.join(" ") || ""} ${product.ingredients?.join(" ") || ""}`
    .toLowerCase();
  const tags: string[] = [];

  if (/(hair|scalp)/.test(text)) tags.push("hair");
  if (/(skin|face)/.test(text)) tags.push("skin");
  if (/(lip)/.test(text)) tags.push("lips");

  if (/(dry|frizzy|rough)/.test(text)) tags.push("dry hair");
  if (/(dandruff|flakes)/.test(text)) tags.push("dandruff");
  if (/(hair fall|hair loss|thinning)/.test(text)) tags.push("hair fall");
  if (/(split ends)/.test(text)) tags.push("split ends");

  if (/(oily|greasy)/.test(text)) tags.push("oily skin");
  if (/(dry skin|flaky)/.test(text)) tags.push("dry skin");
  if (/(acne|pimple|breakout)/.test(text)) tags.push("acne");
  if (/(pigmentation|dark spots)/.test(text)) tags.push("pigmentation");
  if (/(tan|sun tan)/.test(text)) tags.push("tan");
  if (/(sensitive)/.test(text)) tags.push("sensitive skin");
  if (/(dull|glow)/.test(text)) tags.push("dull skin");

  if (/(anti[- ]?aging|aging|age defense)/.test(text)) tags.push("anti aging");
  if (/(brighten|brightening|radiance|glow)/.test(text)) tags.push("brightening");
  if (/(hydrate|hydration|moisturizer|cream|lotion)/.test(text)) tags.push("hydration");
  if (/(scalp|scalp care)/.test(text)) tags.push("scalp care");
  if (/(frizz|frizzy)/.test(text)) tags.push("frizz control");
  if (/(pore|pores)/.test(text)) tags.push("pore care");

  return tags;
}

function isPublished(rawProduct: any): boolean {
  if (!rawProduct) return false;

  if (rawProduct.published === false) return false;
  if (rawProduct.is_published === false) return false;
  if (rawProduct.active === false) return false;
  if (rawProduct.is_active === false) return false;
  if (rawProduct.visible === false) return false;

  const status = normalizeString(rawProduct.status).toLowerCase();
  if (INACTIVE_PRODUCT_STATUSES.has(status)) return false;

  return true;
}

function shouldIncludeRawProduct(rawProduct: any): boolean {
  if (!rawProduct) return false;
  if (!normalizeString(rawProduct.name)) return false;
  return isPublished(rawProduct);
}

function normalizeProduct(rawProduct: any, source: "static" | "db", index: number): Product {
  const product: Product = {
    id: normalizeString(rawProduct.id ?? `${source}-${index}`),
    name: normalizeString(rawProduct.name) || `${source}-${index}`,
    description: normalizeString(rawProduct.description) || "",
    price: Number(rawProduct.price) || 0,
    category: normalizeCategory(rawProduct.category),
    image: normalizeImagePath(rawProduct.image ?? rawProduct.image_url),
    inStock: normalizeBoolean(
      rawProduct.in_stock ?? rawProduct.inStock ?? rawProduct.available
    ),
    volume: normalizeString(rawProduct.volume) || undefined,
    subcategory: normalizeSubcategory(
      rawProduct.subcategory ?? rawProduct.sub_category ?? rawProduct.subCategory,
      rawProduct.tags
    ),
    concerns: normalizeConcerns(
      rawProduct.concerns ?? rawProduct.concernKeywords,
      rawProduct.concernKeywords ?? rawProduct.concerns,
      `${rawProduct.name} ${rawProduct.description}`
    ),
    concernKeywords: normalizeConcernKeywords(
      rawProduct.concernKeywords ?? rawProduct.concerns,
      rawProduct.concerns ?? rawProduct.concernKeywords,
      `${rawProduct.name} ${rawProduct.description}`
    ),
    skin_type: normalizeArray(rawProduct.skin_type),
    hair_type: normalizeArray(rawProduct.hair_type),
    tags: [],
    benefits: normalizeArray(rawProduct.benefits),
    ingredients: normalizeArray(rawProduct.ingredients),
    usage: normalizeUsage(rawProduct.usage),
    priority: normalizePriority(rawProduct.priority) ?? 3,
  };

  product.tags = normalizeTags(product, rawProduct);
    product.searchMetadata = createSearchMetadata(product, rawProduct);
    return product;
}

function createSearchMetadata(product: Product, rawProduct: any): string {
  const values = [
    product.name,
    product.category,
    product.subcategory,
    product.description,
    ...(product.concerns ?? []),
    ...(product.concernKeywords ?? []),
    ...(product.tags ?? []),
    ...(product.ingredients ?? []),
    ...(product.benefits ?? []),
    ...(product.skin_type ?? []),
    ...(product.hair_type ?? []),
    product.usage ?? "",
    `${rawProduct.name ?? ""}`,
    `${rawProduct.description ?? ""}`,
  ];

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase())
    )
  ).join(" ");
}

async function loadDatabaseProducts(): Promise<Product[]> {
  const useAdmin = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabase = createAdminClient() ?? createClient();
  console.debug("PRODUCT LOADER: using admin client?", useAdmin);

  if (!supabase) {
    console.error("❌ Failed to create Supabase client for product loader.");
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase product load error:", error);
    return [];
  }

  return (data || [])
    .filter(shouldIncludeRawProduct)
    .map((product: any, index: number) => normalizeProduct(product, "db", index));
}

export function getStaticProducts(): Product[] {
  return staticProducts
    .filter(shouldIncludeRawProduct)
    .map((product, index) => normalizeProduct(product, "static", index));
}

export async function getAllProducts(): Promise<Product[]> {
  const staticProductsList = getStaticProducts();
  const dbProducts = await loadDatabaseProducts();

  console.debug("PRODUCT LOADER: counts", {
    staticProducts: staticProductsList.length,
    staticIds: staticProductsList.map((p) => p.id),
    dbProducts: dbProducts.length,
    dbIds: dbProducts.map((p) => p.id),
  });

  const mergedProducts = new Map<string, Product>();

  for (const product of staticProductsList) {
    mergedProducts.set(normalizeProductName(product.name), product);
  }

  for (const product of dbProducts) {
    mergedProducts.set(normalizeProductName(product.name), product);
  }

  const mergedList = Array.from(mergedProducts.values());
  console.debug("PRODUCT LOADER: merged products count", {
    mergedProducts: mergedList.length,
    mergedIds: mergedList.map((product) => product.id),
  });

  return mergedList;
}
