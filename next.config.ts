import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // De PDF-bibliotheek draait als gewone Node-module op de server, niet gebundeld.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
