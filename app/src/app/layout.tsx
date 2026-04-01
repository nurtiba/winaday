import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WinTheDay — Score Your Day",
  description: "Rate your day across 5 life categories, see your score, and share your progress.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body>
        <div className="fixed inset-0 flex justify-center bg-[#050505]">
          <div className="w-full max-w-[430px] h-dvh bg-[#0a0a0a] flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
