import type {
  StartSitemapCheckRequest,
  StartSitemapCheckResponse,
  SitemapStatusResponse,
  SitemapResultResponse,
} from '../types/sitemap';

export class SitemapApiError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'SitemapApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function handleResponseError(res: Response): Promise<never> {
  let errorMsg = `Request failed with status ${res.status}`;
  let errorData: unknown = null;

  try {
    errorData = await res.json();
    if (typeof errorData === 'object' && errorData !== null) {
      const errObj = errorData as Record<string, unknown>;
      if (typeof errObj.detail === 'string') {
        errorMsg = errObj.detail;
      } else if (typeof errObj.message === 'string') {
        errorMsg = errObj.message;
      } else if (typeof errObj.error === 'string') {
        errorMsg = errObj.error;
      }
    }
  } catch {
    // If not JSON, try text
    try {
      const text = await res.text();
      if (text) errorMsg = text;
    } catch {
      // ignore
    }
  }

  // Provide clear contextual messages for common status codes if generic
  if (res.status === 400) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Invalid URL provided or result was requested before the check completed.';
    }
  } else if (res.status === 404) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Check ID not found or expired.';
    }
  } else if (res.status === 422) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Request validation error. Please check the URL format.';
    }
  } else if (res.status >= 500) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Server error occurred while checking sitemap. Please try again later.';
    }
  }

  throw new SitemapApiError(errorMsg, res.status, errorData);
}

/**
 * 1. Start a sitemap check
 * POST /api/v1/sitemap/check
 */
export async function startSitemapCheck(
  request: StartSitemapCheckRequest,
  signal?: AbortSignal
): Promise<StartSitemapCheckResponse> {
  const res = await fetch('/api/v1/sitemap/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok && res.status !== 202) {
    await handleResponseError(res);
  }

  const data = (await res.json()) as StartSitemapCheckResponse;
  return data;
}

/**
 * 2. Poll sitemap status
 * GET /api/v1/sitemap/status/{check_id}
 */
export async function getSitemapStatus(
  checkId: string,
  signal?: AbortSignal
): Promise<SitemapStatusResponse> {
  const res = await fetch(`/api/v1/sitemap/status/${encodeURIComponent(checkId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  const data = (await res.json()) as SitemapStatusResponse;
  return data;
}

/**
 * 3. Fetch final results
 * GET /api/v1/sitemap/result/{check_id}
 */
export async function getSitemapResult(
  checkId: string,
  signal?: AbortSignal
): Promise<SitemapResultResponse> {
  const res = await fetch(`/api/v1/sitemap/result/${encodeURIComponent(checkId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  const data = (await res.json()) as SitemapResultResponse;
  return data;
}
