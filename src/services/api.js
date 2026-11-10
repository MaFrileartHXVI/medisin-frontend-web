import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Sanctum Bearer Token & Log HTTP Request to Browser Console
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };

    const token = localStorage.getItem('sintasi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Comprehensive Browser Console Debug Log
    const method = config.method?.toUpperCase() || 'GET';
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;

    console.groupCollapsed(
      `%c[HTTP REQUEST] %c${method} %c${config.url}`,
      'color: #ffffff; background: #0066d6; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
      'color: #0066d6; font-weight: bold;',
      'color: #222222; font-weight: normal;'
    );
    console.log('%cFull Endpoint:%c ' + fullUrl, 'color: #666; font-weight: bold;', 'color: #027be3;');
    console.log('%cHeaders:', 'color: #666; font-weight: bold;', config.headers);
    if (config.params && Object.keys(config.params).length > 0) {
      console.log('%cQuery Params:', 'color: #666; font-weight: bold;', config.params);
    }
    if (config.data !== undefined) {
      console.log('%cRequest Payload (Body):', 'color: #666; font-weight: bold;', config.data);
    }
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('[HTTP REQUEST CONFIG ERROR]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log HTTP Response & Handle Auth/Server Errors
api.interceptors.response.use(
  (response) => {
    const duration = response.config?.metadata?.startTime 
      ? `${Date.now() - response.config.metadata.startTime}ms` 
      : '';
    const method = response.config?.method?.toUpperCase() || 'GET';
    const status = response.status;

    console.groupCollapsed(
      `%c[HTTP RESPONSE ${status}] %c${method} %c${response.config?.url} %c(${duration})`,
      'color: #ffffff; background: #2e7d32; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
      'color: #2e7d32; font-weight: bold;',
      'color: #222222; font-weight: normal;',
      'color: #888888; font-style: italic; font-size: 10px;'
    );
    console.log('%cStatus:%c ' + status + ' ' + response.statusText, 'color: #666; font-weight: bold;', 'color: #2e7d32;');
    console.log('%cResponse Body:', 'color: #666; font-weight: bold;', response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? `${Date.now() - error.config.metadata.startTime}ms` 
      : '';
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const status = error.response?.status || 'NETWORK_ERROR';
    const url = error.config?.url || '';

    console.groupCollapsed(
      `%c[HTTP ERROR ${status}] %c${method} %c${url} %c(${duration})`,
      'color: #ffffff; background: #d32f2f; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;',
      'color: #d32f2f; font-weight: bold;',
      'color: #222222; font-weight: normal;',
      'color: #888888; font-style: italic; font-size: 10px;'
    );
    console.error('%cError Details:', 'color: #d32f2f; font-weight: bold;', error);
    if (error.response?.data) {
      console.error('%cResponse Data Body:', 'color: #d32f2f; font-weight: bold;', error.response.data);
    }
    console.groupEnd();

    if (error.response) {
      const respStatus = error.response.status;
      if (respStatus === 401) {
        // Token expired or invalid
        localStorage.removeItem('sintasi_token');
        localStorage.removeItem('sintasi_user');
        if (window.location.pathname !== '/login') {
          console.warn('[AUTH] 401 Unauthorized encountered. Redirecting to /login...');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;


