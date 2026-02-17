// Category and Subcategory ID mappings
// Maps between frontend slugs and backend numeric IDs

export const CATEGORY_MAPPING = {
  // Slug to ID
  "batik-tulis": 3,
  "ready-to-wear": 4,
  
  // ID to Slug
  3: "batik-tulis",
  4: "ready-to-wear",
} as const;

export const SUBCATEGORY_MAPPING = {
  // Slug to ID
  "katun": 1,
  "sutra": 2,
  "batik-tulis-sutra": 3,
  "batik-casual": 4,
  
  // ID to Slug
  1: "katun",
  2: "sutra",
  3: "batik-tulis-sutra",
  4: "batik-casual",
} as const;

// Convert category slug to numeric ID
export function categorySlugToId(slug: string): number | null {
  const id = CATEGORY_MAPPING[slug as keyof typeof CATEGORY_MAPPING];
  return typeof id === 'number' ? id : null;
}

// Convert category ID to slug
export function categoryIdToSlug(id: number): string | null {
  const slug = CATEGORY_MAPPING[id as keyof typeof CATEGORY_MAPPING];
  return typeof slug === 'string' ? slug : null;
}

// Convert subcategory slug to numeric ID
export function subcategorySlugToId(slug: string): number | null {
  const id = SUBCATEGORY_MAPPING[slug as keyof typeof SUBCATEGORY_MAPPING];
  return typeof id === 'number' ? id : null;
}

// Convert subcategory ID to slug
export function subcategoryIdToSlug(id: number): string | null {
  const slug = SUBCATEGORY_MAPPING[id as keyof typeof SUBCATEGORY_MAPPING];
  return typeof slug === 'string' ? slug : null;
}

// Convert array of category slugs to IDs
export function categorySlugsToIds(slugs: string[]): number[] {
  return slugs.map(slug => categorySlugToId(slug)).filter((id): id is number => id !== null);
}

// Convert array of category IDs to slugs
export function categoryIdsToSlugs(ids: number[]): string[] {
  return ids.map(id => categoryIdToSlug(id)).filter((slug): slug is string => slug !== null);
}

// Convert array of subcategory slugs to IDs
export function subcategorySlugsToIds(slugs: string[]): number[] {
  return slugs.map(slug => subcategorySlugToId(slug)).filter((id): id is number => id !== null);
}

// Convert array of subcategory IDs to slugs
export function subcategoryIdsToSlugs(ids: number[]): string[] {
  return ids.map(id => subcategoryIdToSlug(id)).filter((slug): slug is string => slug !== null);
}

