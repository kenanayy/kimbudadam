import type { NextConfig } from "next";

const isItchExport = process.env.ITCH_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isItchExport
    ? {
        output: "export",
        assetPrefix: "./",
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(isItchExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
                },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
                },
                {
                  key: "X-XSS-Protection",
                  value: "1; mode=block",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
