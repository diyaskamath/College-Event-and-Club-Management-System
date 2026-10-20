// Amrita Connect - API Client
class ApiError extends Error {
  constructor(message, code, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const url = `${API_BASE}${cleanPath}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    body,
  };

  const response = await fetch(url, config);
  let data = null;

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorObj = data && typeof data === 'object' && data.error ? data.error : null;
    const code = (errorObj && errorObj.code) || `http_${response.status}`;
    const message = (errorObj && errorObj.message) || response.statusText || 'Request failed';
    const details = errorObj && errorObj.details ? errorObj.details : null;
    throw new ApiError(message, code, response.status, details);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export { ApiError };
export default api;
