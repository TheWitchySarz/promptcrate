
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt Engineering Blog | PromptCrate",
  description: "Expert insights, tutorials, and best practices for AI prompt engineering. Learn ChatGPT, Claude, and other AI model optimization techniques.",
  keywords: ["AI prompt engineering", "ChatGPT prompts", "Claude AI", "prompt optimization", "AI tutorials", "machine learning"],
  openGraph: {
    title: "AI Prompt Engineering Blog | PromptCrate",
    description: "Expert insights, tutorials, and best practices for AI prompt engineering.",
    type: "website",
    url: "https://promptcrate.ai/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Engineering Blog | PromptCrate", 
    description: "Expert insights, tutorials, and best practices for AI prompt engineering.",
  },
  alternates: {
    canonical: "https://promptcrate.ai/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
