import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sui Transaction Explainer",
  description: "Explain Sui transactions in plain language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

