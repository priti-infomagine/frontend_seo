import type {
  Category,
  EvidencePage,
  IssuePage,
  NormalizedIssue,
  StructuredIssue,
  SeverityLevel,
} from '../types/audit';
import { ISSUE_CATEGORY_MAP, getCategoryName, toSeverityLevel } from '../types/mapping';

export function mapCategoryForIssue(issueCategory: string, categoryById: Map<string, Category>): { id: string; name: string } {
  const direct = ISSUE_CATEGORY_MAP[issueCategory];
  if (direct) {
    const cat = categoryById.get(direct);
    return cat ? { id: direct, name: cat.name } : { id: direct, name: getCategoryName(direct) };
  }
  if (ISSUE_CATEGORY_MAP[issueCategory] === undefined && categoryById.has(issueCategory)) {
    const cat = categoryById.get(issueCategory);
    return { id: issueCategory, name: cat ? cat.name : getCategoryName(issueCategory) };
  }
  return { id: 'uncategorized', name: 'Other / Uncategorized' };
}

export function resolveIssueCategory(issueCategory: string): string {
  return ISSUE_CATEGORY_MAP[issueCategory] ?? issueCategory ?? 'uncategorized';
}

export function toEvidencePage(page: IssuePage): EvidencePage {
  return {
    ...page,
    url: typeof page.page_url === 'string' ? page.page_url : '',
    currentValue: page.current_value ?? undefined,
    classifiedImages: Array.isArray(page.classified_images) ? page.classified_images : [],
    evidence: page.evidence ?? {},
  };
}

export function toSeverityLevelSafe(severity: string | undefined | null): SeverityLevel {
  return toSeverityLevel(severity);
}

export function structureIssueDetails(issue: NormalizedIssue, categoryById: Map<string, Category>): StructuredIssue {
  const issueCategory = typeof issue.category === 'string' ? issue.category : '';
  const { id: categoryId, name: categoryName } = mapCategoryForIssue(issueCategory, categoryById);
  const recommendationText =
    issue.recommendation ?? (issue.llm_tips.length > 0 ? issue.llm_tips[0] : null) ?? null;
  const pages: EvidencePage[] = (issue.pages ?? []).map(toEvidencePage);

  return {
    ruleId: typeof issue.rule_id === 'string' ? issue.rule_id : '',
    category: categoryId,
    categoryName,
    severity: typeof issue.severity === 'string' ? issue.severity : 'low',
    issue: {
      title: typeof issue.title === 'string' ? issue.title : '',
      severity: typeof issue.severity === 'string' ? issue.severity : 'low',
      description: null,
      why: issue.why ?? null,
      what: issue.what ?? null,
    },
    recommendation: {
      text: recommendationText,
      tips: issue.llm_tips ?? [],
    },
    evidence: {
      affectedPages: typeof issue.affected_pages === 'number' ? issue.affected_pages : pages.length,
      pages,
    },
    raw: issue,
  };
}
