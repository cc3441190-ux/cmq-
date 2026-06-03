import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/demos/unipass",
  assetPrefix: "/demos/unipass",
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: ["192.168.0.100"],
};

export default nextConfig;
