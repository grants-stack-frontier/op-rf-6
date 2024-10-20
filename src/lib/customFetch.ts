import { getToken } from './token';

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = async <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await c.json();
  } else if (contentType && contentType.includes('application/pdf')) {
    data = await c.blob();
  } else {
    data = await c.text();
  }

  // Check if the response has a nested data structure
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }

  return data;
};

// NOTE: Add headers
const getHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = getToken();
  return {
    ...headers,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const customFetch = async <T>(
  url:
    | string
    | {
        url: string;
        method: string;
        headers?: HeadersInit;
        data?: any;
        params?: Record<string, any>;
        signal?: AbortSignal;
      },
  options?: RequestInit
): Promise<T> => {
  let requestUrl: string;
  let requestOptions: RequestInit;

  if (typeof url === 'string') {
    // Backwards compatible with old usage
    requestUrl = url;
    requestOptions = options || {};
  } else {
    // New usage with object parameter
    requestUrl = url.url;
    requestOptions = {
      method: url.method,
      headers: url.headers,
      body: url.data ? JSON.stringify(url.data) : undefined,
      ...options,
    };

    // Handle query parameters
    if (url.params) {
      const searchParams = new URLSearchParams(
        Object.entries(url.params).map(([key, value]) => [key, String(value)])
      );
      requestUrl += `?${searchParams.toString()}`;
    }
  }

  const requestHeaders = getHeaders(requestOptions.headers);

  const requestInit: RequestInit = {
    ...requestOptions,
    headers: requestHeaders,
  };

  const request = new Request(requestUrl, requestInit);

  const response = await fetch(request);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await getBody<T>(response);

  return data as T;
};
