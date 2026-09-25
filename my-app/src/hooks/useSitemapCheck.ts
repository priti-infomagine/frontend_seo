import { useState, useCallback } from 'react';
import { sitemapApi } from '../services/sitemapApi';
import type {
  SitemapCheckRequest,
  SitemapCheckAcceptedResponse,
  SitemapFilePage,
  SitemapUrlPage,
  SitemapRawResponse,
  SitemapFilePageItem,
  ApiError,
} from '../types/sitemap';

interface UseSitemapCheckReturn {
  isLoading: boolean;
  error: string | null;
  result: SitemapCheckAcceptedResponse | null;
  filesPage: SitemapFilePage | null;
  activeFile: SitemapFilePageItem | null;
  urlsPage: SitemapUrlPage | null;
  rawContent: SitemapRawResponse | null;
  runCheck: (request: SitemapCheckRequest) => Promise<void>;
  loadFiles: (checkId: string, page?: number) => Promise<void>;
  loadUrls: (checkId: string, fileIndex: number, page?: number) => Promise<void>;
  loadRaw: (checkId: string, fileIndex: number) => Promise<void>;
  setActiveFile: (file: SitemapFilePageItem | null) => void;
  clearError: () => void;
  reset: () => void;
  setRawContent: (content: SitemapRawResponse | null) => void;
}

export function useSitemapCheck(): UseSitemapCheckReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SitemapCheckAcceptedResponse | null>(null);
  const [filesPage, setFilesPage] = useState<SitemapFilePage | null>(null);
  const [activeFile, setActiveFile] = useState<SitemapFilePageItem | null>(null);
  const [urlsPage, setUrlsPage] = useState<SitemapUrlPage | null>(null);
  const [rawContent, setRawContent] = useState<SitemapRawResponse | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const runCheck = useCallback(async (request: SitemapCheckRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setFilesPage(null);
    setActiveFile(null);
    setUrlsPage(null);
    setRawContent(null);

    try {
      const data = await sitemapApi.check(request);
      setResult(data);
      // Auto-load first page of files
      await loadFiles(data.check_id, 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to run sitemap check');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFiles = useCallback(async (checkId: string, page = 1) => {
    try {
      const data = await sitemapApi.listFiles(checkId, page);
      setFilesPage(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to load sitemap files');
    }
  }, []);

  const loadUrls = useCallback(async (checkId: string, fileIndex: number, page = 1) => {
    try {
      const data = await sitemapApi.listUrls(checkId, fileIndex, page);
      setUrlsPage(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to load sitemap URLs');
    }
  }, []);

  const loadRaw = useCallback(async (checkId: string, fileIndex: number) => {
    try {
      const data = await sitemapApi.getRaw(checkId, fileIndex);
      setRawContent(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to load raw XML');
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setFilesPage(null);
    setActiveFile(null);
    setUrlsPage(null);
    setRawContent(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    filesPage,
    activeFile,
    urlsPage,
    rawContent,
    runCheck,
    loadFiles,
    loadUrls,
    loadRaw,
    setActiveFile,
    clearError,
    reset,
    setRawContent,
  };
}