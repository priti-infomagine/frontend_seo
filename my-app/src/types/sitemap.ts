export type SitemapStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type OverallStatus = 'pass' | 'warning' | 'fail' | 'not_applicable';

export type SeverityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface StartSitemapCheckRequest {
  url: string;
}

export interface StartSitemapCheckResponse {
  check_id: string;
  task_id?: string;
  url: string;
  domain: string;
  status: string;
  created_at: string;
}

export interface SitemapProgress {
  phase?: string;
  message?: string;
}

export interface SitemapStatusResponse {
  check_id: string;
  url: string;
  domain?: string;
  status: SitemapStatus;
  progress?: SitemapProgress | null;
  error?: string | null;
}

export interface SitemapSummary {
  total_sitemaps: number;
  sitemap_indexes: number;
  url_sitemaps: number;
  total_urls_declared: number;
  total_issues: number;
}

export interface SitemapIssueItem {
  id?: string;
  type?: string;
  severity?: SeverityLevel | string;
  message?: string;
  description?: string;
  url?: string;
  line?: number;
  details?: string;
  [key: string]: unknown;
}

export interface SitemapRecommendationItem {
  id?: string;
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  action?: string;
  [key: string]: unknown;
}

export interface SitemapEntry {
  url: string;
  is_index: boolean;
  status_code: number;
  content_type?: string;
  entry_count: number;
  content_length?: number;
  response_time_ms?: number;
  error?: string | null;
  issues?: Array<SitemapIssueItem | string>;
  recommendations?: Array<SitemapRecommendationItem | string>;
  [key: string]: unknown;
}

export interface SitemapFindingItem {
  id?: string;
  title?: string;
  description?: string;
  severity?: SeverityLevel | string;
  category?: string;
  impact?: string;
  urls?: string[];
  [key: string]: unknown;
}

/**
 * Page-level Performance & SEO Audit Types (Lighthouse format)
 */
export interface PageAuditEvidence {
  url?: string;
  snippet?: string;
  selector?: string;
  [key: string]: unknown;
}

export interface PageAuditRecommendation {
  audit_id: string;
  category?: string;
  category_weight?: number;
  title: string;
  score?: number | null;
  score_display_mode?: 'metricSavings' | 'binary' | 'error' | 'informative' | 'numeric' | string;
  display_value?: string | null;
  numeric_value?: number | null;
  numeric_unit?: string | null;
  description?: string;
  explanation?: string | null;
  details_type?: 'table' | 'opportunity' | 'list' | string | null;
  estimated_savings_ms?: number | null;
  estimated_savings_bytes?: number | null;
  warnings?: string[];
  error_message?: string | null;
  evidence?: PageAuditEvidence[];
  where_to_fix?: string | null;
  recommendation?: string | null;
  [key: string]: unknown;
}

export interface PageAuditResult {
  id: string;
  url: string;
  device?: string;
  status?: string;
  reason?: string | null;
  performance_score?: number | null;
  seo_score?: number | null;
  fcp_ms?: number | null;
  lcp_ms?: number | null;
  tbt_ms?: number | null;
  cls?: number | null;
  recommendations?: PageAuditRecommendation[];
  [key: string]: unknown;
}

export interface SitemapResultResponse {
  check_id?: string;
  url?: string;
  domain?: string;
  status?: string;
  checked_at?: string;
  overall_status?: OverallStatus;
  severity?: SeverityLevel;
  summary?: SitemapSummary;
  sitemaps?: SitemapEntry[];
  findings?: Array<SitemapFindingItem | string>;
  recommendations?: Array<SitemapRecommendationItem | string>;
  cost_seconds?: number;
  // Page-level audits when returning page audit results
  page_audits?: PageAuditResult[];
  [key: string]: unknown;
}

export type SitemapStage = 'idle' | 'starting' | 'polling' | 'completed' | 'failed';
