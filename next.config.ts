import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./public/seed/shiftly-template.db"],
  },
};

export default nextConfig;
