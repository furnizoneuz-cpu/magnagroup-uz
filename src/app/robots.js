export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: "https://magnagroup.uz/sitemap.xml",
  };
}
