
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = [
    'mastering-chatgpt-prompts',
    'claude-vs-chatgpt-prompting', 
    'prompt-engineering-best-practices',
    'monetizing-ai-prompts',
    'future-of-prompt-engineering',
    'prompt-templates-guide',
    'ai-agents-prompt-engineering-2025',
    'multimodal-prompt-strategies',
    'prompt-marketplace-economics-2025'
  ];

  const baseUrl = 'https://promptcrate.ai';

  return [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
