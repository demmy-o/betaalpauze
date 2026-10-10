import type { Metadata } from "next";
import { Inter, Instrument_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

// Inter voor bodytekst, Instrument Sans voor koppen (zie docs/design.md).
// Noto Serif blijft voor de huidige landingspagina.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Betaalpauze.nl — Vraag een betaalpauze aan",
  description:
    "Betaalpauze helpt je om je betalingen tijdelijk stil te zetten. Meld je aan om op de hoogte te blijven.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`h-full antialiased font-sans ${inter.variable} ${instrumentSans.variable} ${notoSerif.variable}`}
    >
      <body className="min-h-full flex flex-col bg-canvas">{children}</body>
    </html>
  );
}
