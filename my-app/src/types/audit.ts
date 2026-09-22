export interface UnavailableMetric<T = unknown> {
  available: boolean;
  value: T | null;
  reason: string | null;
}

export interface CrawlStats {
  discovered: number;
  crawled: number;
  // blocked_by_robots: UnavailableMetric<number>;
  redirects: number;
  // orphan_pages: UnavailableMetric<number>;
  crawl_errors: number;
  status_codes: Record<string, number>;
  started_at: string;
  completed_at: string;
}

export interface Indexation {
  indexable: number;
  noindex: number;
  canonicalized: number;
  not_indexable: number;
  blocked_by_robots: number;
}

export interface Performance {
  available: boolean;
  core_web_vitals: UnavailableMetric;
  ttfb: UnavailableMetric<{ value: number; unit: string; status: string }>;
}

export interface StructuredData {
  pages_with_schema: number;
  pages_without_schema: number;
  valid: number;
  invalid: number;
  types: Record<string, number>;
}

export interface Links {
  internal: { total: number; // broken: number
   };
  external: { total: number; //broken: number 
    };
  orphan_pages: number;
  total_links: number;
}

export interface Images {
  total: number;
  missing_alt: number;
  lazy_loading: number;
}

// export interface Content {
//   thin_pages: number;
//   duplicate_pages: number;
//   duplicate_groups: number;
//   near_duplicate_pages: number;
//   missing_author: number;
//   outdated_pages: number;
// }

export interface ExternalDependency {
  feature: string;
  status: string;
  reason: string;
}

export interface AuditMeta {
  crawler_version: string;
  parser_version: string;
  rule_engine_version: string;
  rules_executed: number;
  total_issues: number;
  output_shape: string;
}

export interface AuditInfo {
  audit_id: string;
  url: string;
  domain: string;
  started_at: string;
  completed_at: string;
  status: string;
  pages: { discovered: number | null; crawled: number | null; analyzed: number | null } | null;
  crawl_stats: CrawlStats;
  indexation: Indexation;
  performance: Performance;
  structured_data: StructuredData;
  links: Links;
  images: Images;
  content: Content;
  external_dependencies: ExternalDependency[];
  errors: string[];
  meta: AuditMeta;
}

export interface Summary {
  score: number | null;
  health: string | null;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  checks: {
    passed: number;
    failed: number;
    total: number;
  };
  recommended_score: number | null;
  recommended_health: string | null;
}

export interface Category {
  id: string;
  name: string;
  score: number | null;
  status: string | null;
  checks_total: number | null;
  checks_passed: number | null;
  checks_failed: number | null;
}

export interface IssuePage {
  page_url: string;
  current_value: string | null;
  evidence: Record<string, unknown> | null;
  classified_images: unknown[] | null;
  [key: string]: unknown;
}

export interface Issue {
  rule_id: string;
  category: string;
  severity: string;
  title: string;
  why: string | null;
  what: string | null;
  recommendation: string | null;
  llm_tips: string[] | null;
  affected_pages: number | null;
  pages: IssuePage[] | null;
  [key: string]: unknown;
}

export interface NormalizedIssue {
  rule_id: string;
  category: string;
  severity: string;
  title: string;
  why: string | null;
  what: string | null;
  recommendation: string | null;
  llm_tips: string[];
  affected_pages: number;
  pages: IssuePage[];
  [key: string]: unknown;
}

export interface AuditResult {
  audit: AuditInfo;
  summary: Summary;
  categories: Category[];
  issues: Issue[];
}

export interface NormalizedAuditResult {
  audit: AuditInfo;
  summary: Summary;
  categories: Category[];
  issues: NormalizedIssue[];
  raw: unknown;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'other';
export type SeverityValue = 'critical' | 'high' | 'medium' | 'low' | string;

export interface EvidencePage {
  url: string;
  evidence: Record<string, unknown>;
  currentValue?: unknown;
  classifiedImages?: unknown[];
  [key: string]: unknown;
}

export interface StructuredIssue {
  ruleId: string;
  category: string;
  categoryName: string;
  severity: SeverityValue;
  issue: {
    title: string;
    severity: SeverityValue;
    description?: string | null;
    why?: string | null;
    what?: string | null;
  };
  recommendation: {
    text: string | null;
    tips: string[];
  };
  evidence: {
    affectedPages: number;
    pages: EvidencePage[];
  };
  raw: NormalizedIssue;
}

export interface GroupedCategory {
  id: string;
  name: string;
  score: number;
  status: string;
  checksTotal: number;
  checksPassed: number;
  checksFailed: number;
  issueCount: number;
  issues: Record<SeverityLevel, StructuredIssue[]>;
}

export interface StartAuditRequest {
  url: string;
  concurrency?: number;
  full_pipeline?: boolean;
  force?: boolean;
}

export interface StartAuditResponse {
  audit_id: string;
  status: string;
  [key: string]: unknown;
}

export interface AuditStatusResponse {
  audit_id: string;
  parse_status: 'pending' | 'running' | 'completed' | 'failed' | 'error';
  evaluate_status: 'pending' | 'running' | 'completed' | 'failed' | 'error';
  score_status: 'pending' | 'running' | 'completed' | 'failed' | 'error';
  pages_parsed: number;
  rules_evaluated: number;
  overall_score?: number;
  grade?: string;
  output_file_path?: string;
  crawl_config_recovered?: boolean;
  crawl_config_recovery_note?: string | null;
}