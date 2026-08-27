export interface Bookmark {
  url: string;
  slug: string;
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SLUG_PATTERN = /^mona-[0-9A-Za-z]+$/;

export function normalizeUrl(value: string): string {
  const input = value.trim();

  if (!input) {
    throw new TypeError('Enter a URL to bookmark.');
  }

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input)
    ? input
    : `https://${input}`;
  const url = new URL(candidate);

  if (!url.hostname || !['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError('Enter a valid URL.');
  }

  if (url.pathname === '/' && !url.search && !url.hash) {
    return `${url.protocol}//${url.host}`;
  }

  return url.href;
}

export function createSlug(random: () => number = Math.random): string {
  let suffix = '';

  for (let index = 0; index < 4; index += 1) {
    suffix += BASE62[Math.floor(random() * BASE62.length)];
  }

  return `mona-${suffix}`;
}

export function parseBookmarks(storedValue: string | null): Bookmark[] {
  if (!storedValue) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(storedValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isBookmark);
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const hasValidShape =
    typeof candidate.url === 'string' &&
    candidate.url.length > 0 &&
    typeof candidate.slug === 'string' &&
    SLUG_PATTERN.test(candidate.slug);

  if (!hasValidShape) {
    return false;
  }

  try {
    return normalizeUrl(candidate.url as string) === candidate.url;
  } catch {
    return false;
  }
}
