import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "loop — buy & sell with your people",
  description: "A peer-to-peer marketplace for friends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
