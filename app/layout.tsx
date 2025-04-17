import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Searchity",
  description: "AI-powered search engine with fast answers and real-time results",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Searchity",
    images: ["/meta.png"],
    siteName: "Searchity",
  },
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-main text-primary antialiased">
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}