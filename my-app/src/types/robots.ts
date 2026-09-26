export type OverallStatus = 'pass' | 'warning' | 'fail' | 'not_applicable';

export type SeverityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type FetchStatus = 'success' | 'not_found' | 'unreachable' | string;

export interface RobotsCheckRequest {
  domain: string;
}

export interface SitemapReachabilityItem {
  url: string;
  status_code: number;
  reachable: boolean;
}

export interface RobotsFindingItem {
  code?: string;
  severity?: SeverityLevel | string;
  status?: string;
  message?: string;
  evidence?: string;
  [key: string]: unknown;
}

export interface RobotsRecommendationItem {
  code?: string;
  recommendation?: string;
  evidence?: string;
  [key: string]: unknown;
}

export interface RobotsCheckResponse {
  id: string;
  domain: string;
  checked_at: string;

  exists: boolean;
  status_code: number;
  fetch_status: FetchStatus;
  fetch_url: string;
  size_bytes?: number;
  raw_content?: string | null;

  report_markdown?: string | null;

  sitemaps_declared: string[];
  sitemap_reachability: SitemapReachabilityItem[];

  syntax_warnings: string[];
  findings: RobotsFindingItem[];
  recommendations: RobotsRecommendationItem[];

  overall_status: OverallStatus;
  severity: SeverityLevel;
  why?: string | null;
  recommendation?: string | null;
}
