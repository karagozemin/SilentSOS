import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilentSOS — When you can't speak, AI speaks for you",
  description:
    "Voice AI emergency relay prototype powered by ElevenLabs Speech Engine. Simulation only — not connected to real emergency services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-black font-sans text-zinc-100">
        {children}
      </body>
    </html>
  );
}
