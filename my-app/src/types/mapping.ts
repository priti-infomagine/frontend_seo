import type { Issue, SeverityLevel } from './audit';

export const ISSUE_CATEGORY_MAP: Record<string, string> = {
  on_page: 'on_page',
  technical: 'technical_seo',
  content: 'content_quality',
  links: 'internal_linking',
  images: 'images_media',
  schema: 'structured_data',
  social: 'social',
  security: 'security_trust',
  accessibility: 'accessibility',
  performance: 'performance',
};

export const CATEGORY_ID_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ISSUE_CATEGORY_MAP).map(([issueCategory, categoryId]) => [categoryId, issueCategory]),
);

export const CATEGORY_IDS = Object.keys(CATEGORY_ID_MAP) as Array<keyof typeof CATEGORY_ID_MAP>;

export const ALL_CATEGORIES: readonly { id: string; name: string }[] = [
  { id: 'on_page', name: 'On-Page SEO' },
  { id: 'technical_seo', name: 'Technical SEO' },
  { id: 'content_quality', name: 'Content Quality' },
  { id: 'internal_linking', name: 'Internal Linking' },
  { id: 'images_media', name: 'Images & Media' },
  { id: 'structured_data', name: 'Structured Data' },
  { id: 'social', name: 'Social' },
  { id: 'security_trust', name: 'Security & Trust' },
  { id: 'accessibility', name: 'Accessibility' },
  { id: 'performance', name: 'Performance' },
];

export function getCategoryId(issueCategory: string): string | null {
  const direct = ISSUE_CATEGORY_MAP[issueCategory];
  if (direct) return direct;
  // Robustness: the value may already be a canonical category id.
  if (Object.prototype.hasOwnProperty.call(CATEGORY_ID_MAP, issueCategory)) {
    return issueCategory;
  }
  return null;
}

export function getIssueCategory(categoryId: string): string | null {
  const direct = CATEGORY_ID_MAP[categoryId];
  if (direct) return direct;
  if (Object.prototype.hasOwnProperty.call(ISSUE_CATEGORY_MAP, categoryId)) {
    return categoryId;
  }
  return null;
}

export function getCategoryName(categoryId: string): string {
  const found = ALL_CATEGORIES.find((c) => c.id === categoryId);
  return found?.name ?? categoryId;
}

export function toSeverityLevel(severity: string | undefined | null): SeverityLevel {
  const s = (severity ?? '').toLowerCase().trim();
  if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
    return s;
  }
  return 'other';
}

export function filterIssuesByCategory(issues: Issue[], categoryId: string): Issue[] {
  const issueCategory = getIssueCategory(categoryId) ?? categoryId;
  return issues.filter((issue) => issue.category === issueCategory);
}
