
export const AI_MODELS = [
  { id: 'all', name: 'All Models' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', cost: '$0.01/1K tokens' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', cost: '$0.03/1K tokens' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', cost: '$0.0015/1K tokens' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', cost: '$0.015/1K tokens' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', cost: '$0.003/1K tokens' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', cost: '$0.0005/1K tokens' }
];

export const PRICE_RANGES = [
  { id: 'all', name: 'All Prices' },
  { id: 'free', name: 'Free' },
  { id: 'paid', name: 'Paid' },
  { id: 'under-5', name: 'Under $5' },
  { id: '$5-10', name: '$5 - $10' },
  { id: 'over-10', name: 'Over $10' },
];

export const SORT_OPTIONS = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'newest', name: 'Newest' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
];

export const CATEGORIES = [
  'Marketing',
  'Development', 
  'Creative Writing',
  'Business',
  'Education',
  'Data Analysis',
  'Customer Support',
  'Content Creation'
];

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced'
];
