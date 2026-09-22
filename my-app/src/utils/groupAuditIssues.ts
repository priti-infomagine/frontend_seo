import type { Category, GroupedCategory, SeverityLevel, StructuredIssue, NormalizedIssue } from '../types/audit';
import { ALL_CATEGORIES, toSeverityLevel } from '../types/mapping';
import { structureIssueDetails } from './structureIssueDetails';

function groupBySeverity(issues: StructuredIssue[]): Record<SeverityLevel, StructuredIssue[]> {
  const buckets: Record<SeverityLevel, StructuredIssue[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    other: [],
  };
  for (const issue of issues) {
    const level: SeverityLevel = toSeverityLevel(issue.severity);
    buckets[level].push(issue);
  }
  return buckets;
}

export function groupAuditIssues(
  categories: Category[],
  issues: NormalizedIssue[],
): GroupedCategory[] {
  const categoryById = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const structured: StructuredIssue[] = issues.map((issue) =>
    structureIssueDetails(issue, categoryById),
  );

  const buckets = new Map<string, StructuredIssue[]>();
  for (const s of structured) {
    const existing = buckets.get(s.category);
    if (existing) {
      existing.push(s);
    } else {
      buckets.set(s.category, [s]);
    }
  }

  const result: GroupedCategory[] = [];
  for (const { id, name } of ALL_CATEGORIES) {
    const cat = categoryById.get(id);
    const issuesIn = buckets.get(id) ?? [];
    result.push({
      id,
      name: cat?.name ?? name,
      score: cat?.score ?? 0,
      status: cat?.status ?? 'unknown',
      checksTotal: cat?.checks_total ?? 0,
      checksPassed: cat?.checks_passed ?? 0,
      checksFailed: cat?.checks_failed ?? 0,
      issueCount: issuesIn.length,
      issues: groupBySeverity(issuesIn),
    });
  }

  const otherIssues = buckets.get('uncategorized') ?? [];
  if (otherIssues.length > 0) {
    result.push({
      id: 'uncategorized',
      name: 'Other / Uncategorized',
      score: 0,
      status: 'unknown',
      checksTotal: 0,
      checksPassed: 0,
      checksFailed: 0,
      issueCount: otherIssues.length,
      issues: groupBySeverity(otherIssues),
    });
  }

  return result;
}

export function filterGroupedIssues(
  grouped: GroupedCategory[],
  selectedCategory: string | null,
  selectedSeverity: string | null,
): GroupedCategory[] {
      const severityKey = selectedSeverity ? selectedSeverity.toLowerCase().trim() : '';
      const key = severityKey as SeverityLevel;

      return grouped
    .filter((cat) => !selectedCategory || cat.id === selectedCategory)
    .map((cat) => {
      if (!selectedSeverity || severityKey === 'total') {
        return cat;
      }
      const filtered: Record<SeverityLevel, StructuredIssue[]> = {
        critical: [],
        high: [],
        medium: [],
        low: [],
        other: [],
      };
      filtered[key] = cat.issues[key] ?? [];
      return {
        ...cat,
        issues: filtered,
        issueCount: filtered[key].length,
      };
    });
}