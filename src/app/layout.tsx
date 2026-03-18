import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "SAHND+ - Watch Movies & TV Shows Free",
  description: "Stream unlimited movies and TV shows in stunning quality. Your premium destination for entertainment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise antialiased min-h-screen">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <LayoutWrapper>
          <Footer />
        </LayoutWrapper>
      </body>
    </html>
  );
}
