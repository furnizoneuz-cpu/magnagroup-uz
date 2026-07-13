import { getVisibleProducts } from "@/lib/data";
import { LANGS } from "@/lib/i18n";

const SITE = "https://magnagroup.uz";
const STATIC_PATHS = ["", "/catalog", "/about", "/delivery", "/contact", "/flipbook"];

export default async function sitemap() {
  const products = await getVisibleProducts();
  const now = new Date();
  const entries = [];

  for (const lang of LANGS) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE}/${lang}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const p of products) {
      entries.push({
        url: `${SITE}/${lang}/product/${encodeURIComponent(p.article)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }
  return entries;
}
