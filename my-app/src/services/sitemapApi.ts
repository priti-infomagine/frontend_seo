import type {
  SitemapCheckRequest,
  SitemapCheckResponse,
  SitemapStatusResponse,
  SitemapResultResponse,
  ApiError,
} from '../types/sitemap';

const API_BASE = '/api/v1/sitemap';

class SitemapApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      const error: ApiError = { detail: text || `HTTP ${res.status}` };
      throw error;
    }

    return res.json();
  }

  async check(request: SitemapCheckRequest): Promise<SitemapCheckResponse> {
    return this.request<SitemapCheckResponse>('/check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStatus(checkId: string): Promise<SitemapStatusResponse> {
    return this.request<SitemapStatusResponse>(`/status/${checkId}`);
  }

  async getResult(checkId: string): Promise<SitemapResultResponse> {
    return this.request<SitemapResultResponse>(`/result/${checkId}`);
  }
}

export const sitemapApi = new SitemapApi();