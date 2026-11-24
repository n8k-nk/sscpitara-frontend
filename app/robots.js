import { indexable, site } from "../lib/public";

export default function robots() {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/account/", "/signin/", "/signup/", "/onboarding/", "/support/", "/study/", "/billing/", "/pyq/practice/"] }, sitemap: new URL("/sitemap.xml", site).href };
}
