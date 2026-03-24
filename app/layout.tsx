import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "前金樂齡學習中心抽籤系統",
  description: "樂齡學習中心課程報名抽籤系統",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
