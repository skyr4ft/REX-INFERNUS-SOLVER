import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REX INFERNUS 解谜速查",
  description: "转盘对齐与石柱谜题互动速查工具。",
  openGraph: {
    title: "REX INFERNUS 解谜速查",
    description: "转盘对齐与石柱谜题工具",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "REX INFERNUS 解谜速查" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "REX INFERNUS 解谜速查",
    description: "转盘对齐与石柱谜题工具",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
