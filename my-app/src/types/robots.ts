export interface SitemapReachability {
  url: string;
  error: string | null;
  reachable: boolean;
  status_code: number;
}

export interface RobotsFinding {
  code: string;
  severity: string;
  status: string;
  message: string;
  evidence: string;
}

export interface RobotsRecommendation {
  code: string;
  recommendation: string;
  evidence: string;
}

export interface CrawlerRule {
  userAgent: string;
  directive: string;
  value: string;
  lineNumber: number;
}

export interface RobotsCheckResponse {
  id: string;
  domain: string;
  checked_at: string;
  exists: boolean;
  status_code: number;
  fetch_status: string;
  fetch_url: string;
  size_bytes: number;
  raw_content: string;
  report_markdown: string;
  sitemaps_declared: string[];
  sitemap_reachability: SitemapReachability[];
  syntax_warnings: string[];
  findings: RobotsFinding[];
  recommendations: RobotsRecommendation[];
  overall_status: string;
  severity: string;
  why: string;
  recommendation: string;
}

export interface MatchedFinding {
  finding: RobotsFinding;
  recommendation: RobotsRecommendation | undefined;
}
