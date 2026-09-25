export type FindingStatus = 'pass' | 'warning' | 'fail' | 'not_applicable';
export type FindingSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type SitemapKind = 'urlset' | 'sitemap_index';
export type SitemapHealth = 'pass' | 'warning' | 'fail' | 'unknown';

export interface SitemapCheckRequest {
  url: string;
}

export interface SitemapFinding {
  code: string;
  severity: FindingSeverity;
  status: FindingStatus;
  message: string;
  evidence: string;
  recommendation: string;
}

export interface SitemapRecommendation {
  code: string;
  priority: FindingSeverity;
  title: string;
  message: string;
  evidence: string[];
  fix: string;
}

export interface SitemapRobotsSummary {
  url: string;
  exists: boolean;
  status_code: number | null;
  sitemap_references: string[];
}

export interface SitemapCheckSummary {
  status: FindingStatus;
  severity: FindingSeverity;
  sitemap_files: number;
  sitemap_indexes: number;
  url_sets: number;
  page_urls: number;
  passed_checks: number;
  warning_count: number;
  failure_count: number;
}

export interface SitemapFileResult {
  url: string;
  status_code: number | null;
  exists: boolean;
  is_index: boolean;
  content_type: string | null;
  content_length: number;
  child_sitemaps: string[];
  url_count: number;
  urls: string[];
  raw_content: string | null;
  error: string | null;
  kind: SitemapKind;
  health: SitemapHealth;
  issues: string[];
  duplicate_url_count: number;
  invalid_url_count: number;
  cross_host_url_count: number;
}

export interface SitemapCheckResponse {
  checked_url: string;
  robots_url: string;
  robots_status_code: number | null;
  robots_sitemap_references: string[];
  sitemap_files: SitemapFileResult[];
  total_sitemap_files: number;
  total_page_urls: number;
  findings: SitemapFinding[];
  overall_status: FindingStatus;
  severity: FindingSeverity;
  recommendations: string[];
  recommendation_items: SitemapRecommendation[];
  summary: SitemapCheckSummary;
  robots: SitemapRobotsSummary;
  report_markdown: string;
}

export interface SitemapCheckAcceptedResponse {
  check_id: string;
  checked_url: string;
  status: 'completed';
  summary: SitemapCheckSummary;
  robots: SitemapRobotsSummary;
  findings: SitemapFinding[];
  recommendation_items: SitemapRecommendation[];
  files_url: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface SitemapFilePageItem {
  index: number;
  url: string;
  kind: SitemapKind;
  health: SitemapHealth;
  status_code: number | null;
  content_type: string | null;
  content_length: number;
  url_count: number;
  child_sitemap_count: number;
  issues: string[];
  error: string | null;
}

export type SitemapFilePage = PaginatedResponse<SitemapFilePageItem>;

export interface SitemapUrlPage {
  sitemap_url: string;
  items: string[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface SitemapRawResponse {
  sitemap_url: string;
  content_type: string | null;
  content_length: number;
  raw_content: string | null;
}

export interface ApiError {
  detail: string;
}