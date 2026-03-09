import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Shiftly | Local Student & Part-Time Jobs",
  description: "Find local part-time, student and entry-level jobs near you. Fast applications, local employers, real opportunities.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.13),transparent_35%),radial-gradient(circle_at_20%_90%,rgba(99,102,241,0.08),transparent_35%)]">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
