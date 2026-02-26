import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayne Debt Tracker",
  description: "Track debt payments, upload proof, and share approval links."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
