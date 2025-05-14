import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "./(contexts)/AuthContext";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "PromptCrate | Centralized AI Prompt Engineering",
  description: "PromptCrate (promptcrate.ai) is a centralized platform for AI prompt engineering—create, refine, organize, and monetize prompts across multiple AI models.",
  metadataBase: new URL("https://promptcrate.ai"),
  openGraph: {
    title: "PromptCrate",
    description: "Centralized platform for AI prompt engineering.",
    url: "https://promptcrate.ai",
    siteName: "PromptCrate",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "PromptCrate Logo",
      },
    ],
    locale: "en_US",
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
      <body className="bg-purple-200 text-red-600 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
