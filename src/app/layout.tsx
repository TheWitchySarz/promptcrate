import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "./(contexts)/AuthContext";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "PromptCrate - AI Prompt Marketplace",
  description: "Discover and share the best AI prompts for ChatGPT, Claude, and other AI models.",
  keywords: ["AI prompts", "ChatGPT", "Claude", "prompt engineering", "AI marketplace"],
  openGraph: {
    title: "PromptCrate - AI Prompt Marketplace",
    description: "Discover and share the best AI prompts for ChatGPT, Claude, and other AI models.",
    url: "https://promptcrate.ai",
    siteName: "PromptCrate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptCrate - AI Prompt Marketplace",
    description: "Discover and share the best AI prompts for ChatGPT, Claude, and other AI models.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}