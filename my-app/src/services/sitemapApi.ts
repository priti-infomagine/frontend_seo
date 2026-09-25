import type {
  SitemapCheckRequest,
  SitemapCheckAcceptedResponse,
  SitemapFilePage,
  SitemapUrlPage,
  SitemapRawResponse,
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

  async check(request: SitemapCheckRequest): Promise<SitemapCheckAcceptedResponse> {
    return this.request<SitemapCheckAcceptedResponse>('/check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listFiles(checkId: string, page = 1, pageSize = 20): Promise<SitemapFilePage> {
    return this.request<SitemapFilePage>(`/${checkId}/files?page=${page}&page_size=${pageSize}`);
  }

  async listUrls(checkId: string, fileIndex: number, page = 1, pageSize = 100): Promise<SitemapUrlPage> {
    return this.request<SitemapUrlPage>(`/${checkId}/files/${fileIndex}/urls?page=${page}&page_size=${pageSize}`);
  }

  async getRaw(checkId: string, fileIndex: number): Promise<SitemapRawResponse> {
    return this.request<SitemapRawResponse>(`/${checkId}/files/${fileIndex}/raw`);
  }
}

export const sitemapApi = new SitemapApi();