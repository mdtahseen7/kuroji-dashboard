import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kuroji dashboard",
  description: "Admin dashboard for the self-hosted kuroji-api",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
