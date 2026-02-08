export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

export function splitTags(raw: string): string[] {
  if (!raw.trim()) return [];
  // allow: "tag1, tag2 tag3"
  return raw
    .split(/[,\n]/g)
    .flatMap((x) => x.split(/\s+/g))
    .map((x) => x.trim())
    .filter(Boolean)
    .map(normalizeTag);
}

export function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export function containsText(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}
