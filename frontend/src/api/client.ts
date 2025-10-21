export interface ApiConfig {
  baseUrl: string;
  prefix: string;
}

export function getApiConfig(): ApiConfig {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const prefix = import.meta.env.VITE_API_PREFIX as string | undefined;
  if (!baseUrl || !prefix) {
    throw new Error('缺少环境变量 VITE_API_BASE_URL 或 VITE_API_PREFIX');
  }
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPrefix = prefix.startsWith('/') ? prefix : '/' + prefix;
  return { baseUrl: normalizedBase, prefix: normalizedPrefix };
}

export function buildApiUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
  const { baseUrl, prefix } = getApiConfig();
  const full = baseUrl + prefix + (path.startsWith('/') ? path : '/' + path);
  const url = new URL(full);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = buildApiUrl(path, query);
  const headers = new Headers(options.headers as HeadersInit | undefined);
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(url, { credentials: 'include', ...options, headers });
  if (!res.ok) {
    let msg = '';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `请求失败: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}


