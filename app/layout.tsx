import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="nl" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
