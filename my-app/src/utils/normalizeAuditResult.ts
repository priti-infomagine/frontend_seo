import type { NormalizedAuditResult, NormalizedIssue, Category, Summary, AuditInfo, IssuePage, UnavailableMetric } from '../types/audit';

export class NormalizationError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NormalizationError';
    this.cause = cause;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export interface NormalizeOptions {
  allowWrapper?: boolean;
}

export function normalizeAuditResult(raw: unknown, options: NormalizeOptions = {}): NormalizedAuditResult {
  const allowWrapper = options.allowWrapper ?? true;

  let payload: Record<string, unknown>;
  let rawPayload: unknown;

  if (isObject(raw)) {
    if (allowWrapper && isObject(raw.data)) {
      payload = raw.data;
      rawPayload = raw.data;
    } else {
      payload = raw;
      rawPayload = raw;
    }
  } else {
    throw new NormalizationError('Audit result is not a JSON object');
  }

  const audit = validateAudit(payload.audit);
  const summary = validateSummary(payload.summary);
  const categories = toCategoryArray(payload.categories);
  const issues = toIssueArray(payload.issues).map(normalizeIssue);

  return {
    audit,
    summary,
    categories,
    issues,
    raw: rawPayload,
  };
}

function validateAudit(value: unknown): AuditInfo {
  if (!isObject(value)) {
    throw new NormalizationError('Audit result is missing required "audit" object');
  }
  return {
    audit_id: typeof value.audit_id === 'string' ? value.audit_id : '',
    url: typeof value.url === 'string' ? value.url : '',
    domain: typeof value.domain === 'string' ? value.domain : '',
    started_at: typeof value.started_at === 'string' ? value.started_at : '',
    completed_at: typeof value.completed_at === 'string' ? value.completed_at : '',
    status: typeof value.status === 'string' ? value.status : '',
    pages: validatePages(value.pages),
    crawl_stats: validateCrawlStats(value.crawl_stats),
    indexation: validateIndexation(value.indexation),
    performance: validatePerformance(value.performance),
    structured_data: validateStructuredData(value.structured_data),
    links: validateLinks(value.links),
    images: validateImages(value.images),
    content: validateContent(value.content),
    external_dependencies: validateExternalDeps(value.external_dependencies),
    errors: validateErrors(value.errors),
    meta: validateMeta(value.meta),
  };
}

function validatePages(value: unknown): AuditInfo['pages'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  return {
    discovered: toNumberOrNull(obj.discovered),
    crawled: toNumberOrNull(obj.crawled),
    analyzed: toNumberOrNull(obj.analyzed),
  };
}

function validateCrawlStats(value: unknown): AuditInfo['crawl_stats'] {
  if (!isObject(value)) {
    throw new NormalizationError('Audit result is missing required "crawl_stats" object');
  }
  return {
    discovered: toNumberOrZero(value.discovered),
    crawled: toNumberOrZero(value.crawled),
    blocked_by_robots: validateUnavailableMetric(value.blocked_by_robots),
    redirects: toNumberOrZero(value.redirects),
    orphan_pages: validateUnavailableMetric(value.orphan_pages),
    crawl_errors: toNumberOrZero(value.crawl_errors),
    status_codes: toStatusCodes(value.status_codes),
    started_at: typeof value.started_at === 'string' ? value.started_at : '',
    completed_at: typeof value.completed_at === 'string' ? value.completed_at : '',
  };
}

function validateUnavailableMetric<T = unknown>(value: unknown): UnavailableMetric<T> {
  if (!isObject(value)) return { available: false, value: null, reason: null };
  return {
    available: typeof value.available === 'boolean' ? value.available : false,
    value: value.value as T | null,
    reason: typeof value.reason === 'string' ? value.reason : null,
  };
}

function toStatusCodes(value: unknown): Record<string, number> {
  if (!isObject(value)) return {};
  const result: Record<string, number> = {};
  for (const key of Object.keys(value)) {
    result[key] = toNumberOrZero(value[key]);
  }
  return result;
}

function validateIndexation(value: unknown): AuditInfo['indexation'] {
  if (!isObject(value)) return { indexable: 0, noindex: 0, canonicalized: 0, not_indexable: 0, blocked_by_robots: 0 };
  return {
    indexable: toNumberOrZero(value.indexable),
    noindex: toNumberOrZero(value.noindex),
    canonicalized: toNumberOrZero(value.canonicalized),
    not_indexable: toNumberOrZero(value.not_indexable),
    blocked_by_robots: toNumberOrZero(value.blocked_by_robots),
  };
}

function validatePerformance(value: unknown): AuditInfo['performance'] {
  if (!isObject(value)) return { available: false, core_web_vitals: { available: false, value: null, reason: 'Missing' }, ttfb: { available: false, value: null, reason: 'Missing' } };
  return {
    available: typeof value.available === 'boolean' ? value.available : false,
    core_web_vitals: validateUnavailableMetric(value.core_web_vitals),
    ttfb: validateUnavailableMetric<{ value: number; unit: string; status: string }>(value.ttfb),
  };
}

function validateStructuredData(value: unknown): AuditInfo['structured_data'] {
  if (!isObject(value)) return { pages_with_schema: 0, pages_without_schema: 0, valid: 0, invalid: 0, types: {} };
  return {
    pages_with_schema: toNumberOrZero(value.pages_with_schema),
    pages_without_schema: toNumberOrZero(value.pages_without_schema),
    valid: toNumberOrZero(value.valid),
    invalid: toNumberOrZero(value.invalid),
    types: isObject(value.types) ? validateTypesRecord(value.types) : {},
  };
}

function validateTypesRecord(value: Record<string, unknown>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key of Object.keys(value)) {
    result[key] = toNumberOrZero(value[key]);
  }
  return result;
}

function validateLinks(value: unknown): AuditInfo['links'] {
  if (!isObject(value)) return { internal: { total: 0, broken: 0 }, external: { total: 0, broken: 0 }, orphan_pages: 0, total_links: 0 };
  return {
    internal: validateLinkPair(value.internal),
    external: validateLinkPair(value.external),
    orphan_pages: toNumberOrZero(value.orphan_pages),
    total_links: toNumberOrZero(value.total_links),
  };
}

function validateLinkPair(value: unknown): { total: number; broken: number } {
  if (!isObject(value)) return { total: 0, broken: 0 };
  return {
    total: toNumberOrZero(value.total),
    broken: toNumberOrZero(value.broken),
  };
}

function validateImages(value: unknown): AuditInfo['images'] {
  if (!isObject(value)) return { total: 0, missing_alt: 0, empty_alt: 0, missing_dimensions: 0, oversized: 0, modern_format: 0, lazy_loading: 0 };
  return {
    total: toNumberOrZero(value.total),
    missing_alt: toNumberOrZero(value.missing_alt),
    empty_alt: toNumberOrZero(value.empty_alt),
    missing_dimensions: toNumberOrZero(value.missing_dimensions),
    oversized: toNumberOrZero(value.oversized),
    modern_format: toNumberOrZero(value.modern_format),
    lazy_loading: toNumberOrZero(value.lazy_loading),
  };
}

function validateContent(value: unknown): AuditInfo['content'] {
  if (!isObject(value)) return { thin_pages: 0, duplicate_pages: 0, duplicate_groups: 0, near_duplicate_pages: 0, missing_author: 0, outdated_pages: 0 };
  return {
    thin_pages: toNumberOrZero(value.thin_pages),
    duplicate_pages: toNumberOrZero(value.duplicate_pages),
    duplicate_groups: toNumberOrZero(value.duplicate_groups),
    near_duplicate_pages: toNumberOrZero(value.near_duplicate_pages),
    missing_author: toNumberOrZero(value.missing_author),
    outdated_pages: toNumberOrZero(value.outdated_pages),
  };
}

function validateExternalDeps(value: unknown): AuditInfo['external_dependencies'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((d): d is Record<string, unknown> => isObject(d))
    .map((d) => ({
      feature: typeof d.feature === 'string' ? d.feature : '',
      status: typeof d.status === 'string' ? d.status : '',
      reason: typeof d.reason === 'string' ? d.reason : '',
    }));
}

function validateErrors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((e): e is string => typeof e === 'string');
}

function validateMeta(value: unknown): AuditInfo['meta'] {
  if (!isObject(value)) return { crawler_version: '', parser_version: '', rule_engine_version: '', rules_executed: 0, total_issues: 0, output_shape: '' };
  return {
    crawler_version: typeof value.crawler_version === 'string' ? value.crawler_version : '',
    parser_version: typeof value.parser_version === 'string' ? value.parser_version : '',
    rule_engine_version: typeof value.rule_engine_version === 'string' ? value.rule_engine_version : '',
    rules_executed: toNumberOrZero(value.rules_executed),
    total_issues: toNumberOrZero(value.total_issues),
    output_shape: typeof value.output_shape === 'string' ? value.output_shape : '',
  };
}

function validateSummary(value: unknown): Summary {
  if (!isObject(value)) {
    throw new NormalizationError('Audit result is missing required "summary" object');
  }
  return {
    score: toNumberOrNull(value.score),
    health: typeof value.health === 'string' ? value.health : null,
    issues: normalizeSummaryIssues(value.issues),
    checks: normalizeSummaryChecks(value.checks),
    recommended_score: toNumberOrNull(value.recommended_score),
    recommended_health: typeof value.recommended_health === 'string' ? value.recommended_health : null,
  };
}

function normalizeSummaryIssues(value: unknown): Summary['issues'] {
  if (!isObject(value)) {
    return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  }
  return {
    critical: toNumberOrZero(value.critical),
    high: toNumberOrZero(value.high),
    medium: toNumberOrZero(value.medium),
    low: toNumberOrZero(value.low),
    total: toNumberOrZero(value.total),
  };
}

function normalizeSummaryChecks(value: unknown): Summary['checks'] {
  if (!isObject(value)) {
    return { passed: 0, failed: 0, total: 0 };
  }
  return {
    passed: toNumberOrZero(value.passed),
    failed: toNumberOrZero(value.failed),
    total: toNumberOrZero(value.total),
  };
}

function toCategoryArray(value: unknown): Category[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((c): c is Record<string, unknown> => isObject(c))
    .map((c) => ({
      id: typeof c.id === 'string' ? c.id : '',
      name: typeof c.name === 'string' ? c.name : '',
      score: toNumberOrNull(c.score),
      status: typeof c.status === 'string' ? c.status : null,
      checks_total: toNumberOrNull(c.checks_total),
      checks_passed: toNumberOrNull(c.checks_passed),
      checks_failed: toNumberOrNull(c.checks_failed),
    }));
}

function toIssueArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((i): i is Record<string, unknown> => isObject(i));
}

function normalizeIssue(raw: Record<string, unknown>): NormalizedIssue {
  const pages = toPageArray(raw.pages);
  const affectedPages =
    typeof raw.affected_pages === 'number' ? raw.affected_pages : pages.length;

  return {
    ...raw,
    rule_id: typeof raw.rule_id === 'string' ? raw.rule_id : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    severity: typeof raw.severity === 'string' ? raw.severity : 'low',
    title: typeof raw.title === 'string' ? raw.title : '',
    why: toStringOrNull(raw.why),
    what: toStringOrNull(raw.what),
    recommendation: toStringOrNull(raw.recommendation),
    llm_tips: toStringArray(raw.llm_tips),
    affected_pages: affectedPages,
    pages,
  };
}

function toPageArray(value: unknown): IssuePage[] {
  if (!Array.isArray(value)) return [];
  return value.map((p): IssuePage =>
    isObject(p)
      ? { ...p, page_url: typeof p.page_url === 'string' ? p.page_url : '', current_value: typeof p.current_value === 'string' ? p.current_value : null, evidence: isObject(p.evidence) ? p.evidence : null, classified_images: Array.isArray(p.classified_images) ? p.classified_images : null }
      : { page_url: '', current_value: null, evidence: null, classified_images: null }
  );
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return String(value);
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function toNumberOrZero(value: unknown): number {
  return toNumberOrNull(value) ?? 0;
}
