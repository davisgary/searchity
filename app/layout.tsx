import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Theme } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the web with AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Search",
    images: ["/meta.png"],
    siteName: "Search",
  },
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head />
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){const t=localStorage.getItem('theme')||'auto',d=t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)})();`,
          }}
        />
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}