import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // De PDF-bibliotheek draait als gewone Node-module op de server, niet gebundeld.
  serverExternalPackages: ["@react-pdf/renderer", "pdfkit"],
  // pdfkit laadt zijn standaardlettertypes (Helvetica en andere) pas tijdens het draaien. De bouwtool ziet die
  // bestanden daardoor niet, en Netlify zou ze niet meenemen. Zonder deze bestanden crasht de server.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pdfkit/js/standard-fonts/**"],
  },
};

export default nextConfig;
