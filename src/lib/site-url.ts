/** Keep the existing deployment URL precedence in one place. */
function normalizeSiteUrl(value: string | undefined) {
  const valueTrimmed = value?.trim();
  if (!valueTrimmed) return undefined;
  return /^https?:\/\//i.test(valueTrimmed) ? valueTrimmed : `https://${valueTrimmed}`;
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
  ?? normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  ?? normalizeSiteUrl(process.env.VERCEL_URL)
  ?? "http://localhost:3000";

export const absoluteUrl = (path: string) => new URL(path, siteUrl).href;
