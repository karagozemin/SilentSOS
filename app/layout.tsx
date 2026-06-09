import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const brandFont = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: "SilentSOS — When you can't speak, AI speaks for you",
  description:
    "Voice AI emergency relay with D-ID avatar and ElevenAgents. Simulation only — not connected to real emergency services.",
  icons: {
    icon: [{ url: "/silentsos-logo.png", type: "image/png" }],
    apple: [{ url: "/silentsos-logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "SilentSOS",
    description:
      "When you can't speak, AI speaks for you. D-ID avatar relay powered by ElevenAgents.",
    images: ["/silentsos-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${brandFont.variable} h-full overflow-hidden antialiased`}>
      <body className="flex h-full flex-col overflow-hidden bg-black font-sans text-zinc-100">
        {children}
      </body>
    </html>
  );
}
