import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Indiquer à Turbopack que le workspace est dans /frontend */
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
