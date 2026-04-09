import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vibeco",
  description: "vibeco 前端",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
