import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilentSOS — When you can't speak, AI speaks for you",
  description:
    "Voice AI emergency relay prototype powered by ElevenLabs Speech Engine. Simulation only — not connected to real emergency services.",
  icons: {
    icon: "/silentsos-logo.png",
    apple: "/silentsos-logo.png",
  },
  openGraph: {
    title: "SilentSOS",
    description:
      "When you can't speak, AI speaks for you. Voice relay prototype powered by ElevenLabs Speech Engine.",
    images: ["/silentsos-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden antialiased">
      <body className="flex h-full flex-col overflow-hidden bg-black font-sans text-zinc-100">
        {children}
      </body>
    </html>
  );
}
