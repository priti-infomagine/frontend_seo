export type OverallStatus = 'pass' | 'warning' | 'fail' | 'not_applicable';
export type Severity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type SitemapStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ProgressPhase = 'discovering' | 'evaluating' | 'completed';

export interface SitemapCheckRequest {
  url: string;
}

export interface SitemapCheckResponse {
  check_id: string;
  task_id: string;
  url: string;
  domain: string;
  status: SitemapStatus;
  created_at: string;
}

export interface ProgressInfo {
  phase: ProgressPhase;
  message: string;
}

export interface SitemapStatusResponse {
  check_id: string;
  url: string;
  domain: string;
  status: SitemapStatus;
  progress: ProgressInfo;
  error: string | null;
}

export interface SitemapSummary {
  total_sitemaps: number;
  sitemap_indexes: number;
  url_sitemaps: number;
  total_urls_declared: number;
  total_issues: number;
}

export interface SitemapItem {
  url: string;
  is_index: boolean;
  status_code: number | null;
  content_type: string | null;
  entry_count: number;
  content_length: number;
  response_time_ms: number;
  error: string | null;
  issues: SitemapFinding[];
  recommendations: SitemapRecommendation[];
}

export interface SitemapFinding {
  code: string;
  severity: Severity;
  status: OverallStatus;
  message: string;
  evidence: string;
  recommendation: string;
}

export interface SitemapRecommendation {
  code: string;
  priority: Severity;
  title: string;
  message: string;
  evidence: string[];
  fix: string;
}

export interface SitemapResultResponse {
  check_id: string;
  url: string;
  domain: string;
  status: 'completed';
  checked_at: string;
  overall_status: OverallStatus;
  severity: Severity;
  summary: SitemapSummary;
  sitemaps: SitemapItem[];
  findings: SitemapFinding[];
  recommendations: SitemapRecommendation[];
  report_markdown: string;
  cost_seconds: number;
}

export interface ApiError {
  detail: string;
}