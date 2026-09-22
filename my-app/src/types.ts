export interface SeoRule {
  rule_id: string
  name: string
  category: string
  severity: string
  passed: boolean
  score_impact: number
  message: string
  recommendation: string | null
  data: unknown
  tags: string[]
}

export interface CategoryScore {
  category: string
  score: number
  max_score: number
  weight: number
  rules_checked: number
  rules_passed: number
  rules_failed: number
  issues: SeoRule[]
  warnings: SeoRule[]
  passed_rules: SeoRule[]
}

export interface CategoryDetail {
  category: string
  score: number
  max_score: number
  weight: number
  issues: SeoRule[]
  warnings: SeoRule[]
  passed_rules: SeoRule[]
  rules_checked: number
  rules_passed: number
  rules_failed: number
}

export interface CategoryGroupScore {
  grade: string
  summary: string
  warnings: number
  categories: Record<string, CategoryDetail>
  top_issues: SeoRule[]
  total_rules: number
  total_failed: number
  total_passed: number
  overall_score: number
  critical_issues: number
}

export interface CategoryScores {
  links: CategoryGroupScore
  images: CategoryGroupScore
  schema: CategoryGroupScore
  social: CategoryGroupScore
  content: CategoryGroupScore
  on_page: CategoryGroupScore
  security: CategoryGroupScore
  technical: CategoryGroupScore
  performance: CategoryGroupScore
  accessibility: CategoryGroupScore
}

export interface SeoScore {
  project_id: string
  crawl_id: string
  domain: string
  overall_score: number
  grade: string
  total_pages_scored: number
  total_rules_evaluated: number
  total_passed: number
  total_failed: number
  critical_issues: number
  warnings: number
  error_pages: number
  error_summary: string | null
  summary: string
  category_scores: CategoryScores
  top_issues: SeoRule[]
  output_file_path: string
  scored_at: string
  analysis_status: string
}

export interface CrawlData {
  url: string
  domain: string
  status_code: number
  response_time: number
  html_size_bytes: number
  test_number: number
  file_path: string
  crawled_at: string
}

export interface AuditResponse {
  success: boolean
  message: string
  url: string
  domain: string
  crawl: CrawlData
  seo_score: SeoScore
  parsed_data?: Record<string, unknown>
}