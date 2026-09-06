import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });
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
      className={`h-full antialiased font-sans ${notoSans.variable} ${notoSerif.variable}`}
    >
      <body className="min-h-full flex flex-col bg-canvas">{children}</body>
    </html>
  );
}
