import type { MetadataRoute } from "next";
import { ADMIN_LOGIN_PATH, ADMIN_DASHBOARD_PATH } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH, "/api/"],
    },
  };
}
