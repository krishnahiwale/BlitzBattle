import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlitzBattle — Learn. Battle. Claim.",
  description: "Short AI and Web3 learning battles for college clubs. Play live, learn from every answer, and claim funded rewards on Monad Testnet.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
