import type { RobotsCheckRequest, RobotsCheckResponse } from '../types/robots';

export class RobotsApiError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'RobotsApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function handleRobotsError(res: Response): Promise<never> {
  let errorMsg = `Request failed with status ${res.status}`;
  let errorData: unknown = null;

  try {
    errorData = await res.json();
    if (typeof errorData === 'object' && errorData !== null) {
      const errObj = errorData as Record<string, unknown>;
      if (typeof errObj.detail === 'string') {
        errorMsg = errObj.detail;
      } else if (Array.isArray(errObj.detail)) {
        // FastAPI validation errors format
        errorMsg = errObj.detail.map((d: { msg?: string; loc?: string[] }) => d.msg || JSON.stringify(d)).join(', ');
      } else if (typeof errObj.message === 'string') {
        errorMsg = errObj.message;
      } else if (typeof errObj.error === 'string') {
        errorMsg = errObj.error;
      }
    }
  } catch {
    try {
      const text = await res.text();
      if (text) errorMsg = text;
    } catch {
      // ignore
    }
  }

  if (res.status === 400) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Invalid domain format or validation error.';
    }
  } else if (res.status === 422) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Validation error. Please verify the domain name.';
    }
  } else if (res.status >= 500) {
    if (!errorMsg || errorMsg.includes('Request failed')) {
      errorMsg = 'Server error during robots.txt check. Please try again later.';
    }
  }

  throw new RobotsApiError(errorMsg, res.status, errorData);
}

/**
 * Synchronous complete robots.txt check
 * POST /api/v1/robots/check
 */
export async function checkRobotsTxt(
  request: RobotsCheckRequest,
  signal?: AbortSignal
): Promise<RobotsCheckResponse> {
  const res = await fetch('/api/v1/robots/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    await handleRobotsError(res);
  }

  const data = (await res.json()) as RobotsCheckResponse;
  return data;
}
