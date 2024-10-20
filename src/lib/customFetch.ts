import { getToken } from './token';

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return c.json();
  }

  if (contentType && contentType.includes('application/pdf')) {
    return c.blob() as Promise<T>;
  }

  return c.text() as Promise<T>;
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

  return { status: response.status, data } as T;
};
