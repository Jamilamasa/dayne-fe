import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { TopNav } from "@/components/ui/top-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/* Runs before first paint — prevents theme flash */
const themeScript = `(function(){var s=localStorage.getItem('dayne:theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s?s==='dark':p)document.documentElement.classList.add('dark');})();`;

export const metadata: Metadata = {
  title: "Dayne Debt Tracker",
  description: "Track debt payments, upload proof, and share approval links."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <TopNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
