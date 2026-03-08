import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Dashboard - Advanced Analytics & Portfolio Management",
  description: "Professional trading dashboard with real-time analytics, risk management, and trade journal. Manage your trading account with advanced checklist, charts, and performance metrics.",
  keywords: "trading, dashboard, portfolio, forex, cryptocurrency, risk management",
  openGraph: {
    title: "Trading Dashboard",
    description: "Professional trading platform for managing your portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-gradient text-white`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
