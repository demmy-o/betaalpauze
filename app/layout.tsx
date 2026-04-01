import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Betaalpauze — Vraag een betaalpauze aan",
  description:
    "Vraag eenvoudig een betaalpauze aan bij je schuldeiser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-neutral-50">{children}</body>
    </html>
  );
}
