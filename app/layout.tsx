import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchAI",
  description: "Search the web with AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SearchAI",
    images: ["/meta.png"],
    siteName: "SearchAI",
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