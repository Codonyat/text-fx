import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { EFFECTS } from "@/lib/effects/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/effects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
  for (const e of EFFECTS) {
    routes.push({
      url: `${SITE_URL}/effects/${e.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  return routes;
}
