import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ["latin"],
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: "Anonymous Property Voting - Privacy-Preserving Community Governance",
  description: "Fully Homomorphic Encryption (FHE) powered voting system for property management with complete privacy and transparency",
  keywords: ["blockchain", "voting", "FHE", "privacy", "property management", "fhEVM", "Zama"],
  authors: [{ name: "Anonymous Property Voting Team" }],
  openGraph: {
    title: "Anonymous Property Voting",
    description: "Privacy-preserving voting for property management",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${dmMono.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
