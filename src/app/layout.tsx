import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burger Town / California Burrito — POS Analytics Dashboard",
  description: "Enterprise POS Business Analytics Dashboard analyzing 300,000 transactions across Bangalore outlets.",
  keywords: ["POS Analytics", "Business Intelligence", "Restaurant Dashboard", "California Burrito", "Burger Town"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
