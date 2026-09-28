import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo root so Turbopack can resolve hoisted next from root node_modules
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
