import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Searchity",
  description: "Start your search and discover more with Searchity, your AI-powered search engine for everything you can think of and more.",
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