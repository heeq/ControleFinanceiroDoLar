

import axios from 'axios';

/*
 SERVICES SAO MODULOS QUE FAZEM A COMUNICAÇÃO EXTERNA COM O FRONT
*/

/*
DE HENRIQUE:

async function fetchWithTimeout(input, init, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}
*/

/*
  Lightweight HTTP service wrapper using axios.
  - Uses REACT_APP_API_URL as base URL when available.
  - Exposes get/post/put/delete helpers that return response data or throw normalized errors.
  - Exposes setAuthToken/clearAuthToken to manage Authorization header.
  - Exposes the raw axios instance as `raw` for advanced use.

  o fetch tem que transformar o JSON manual,
  a parte de tratamento de erro é menos robusta,
  nao tem timeout
  protege contra vulnerabilidades CSRF
*/

const baseURL = process.env.REACT_APP_API_URL || '/';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    withCredentials: true,
  },
  timeout: 30000,
});

// Optional: response interceptor to handle common behaviours
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the request wrapper normalize errors; rethrow for downstream handling
    return Promise.reject(error);
  }
);

function setAuthToken(token) {
    if (!token) return clearAuthToken();
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    // na verdade aqui eu deveria adicionar o withcredentials: true
}

function clearAuthToken() {
    delete instance.defaults.headers.common.Authorization;
}

async function request(method, url, data = null, config = {}) {
  try {
    const response = await instance.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (err) {
    // Normalize error shape for callers
    if (err.response) {
      // Server responded with a status outside 2xx
      const { status, data } = err.response;
      const message = data && data.message ? data.message : err.message;
      const error = new Error(message);,
      error.status = status;
      error.data = data;
      throw error;
    } else if (err.request) {
      // No response received
      const error = new Error('No response received from server');
      error.request = err.request;
      throw error;
    } else {
      // Something happened setting up the request
      throw err;
    }
  }
}

export default {
  // Basic helpers returning parsed response data
  get: (url, config) => request('get', url, null, config),
  post: (url, body, config) => request('post', url, body, config),
  put: (url, body, config) => request('put', url, body, config),
  delete: (url, config) => request('delete', url, null, config),

  // Auth management
  setAuthToken,
  clearAuthToken,

  // Raw axios instance for advanced usage
  raw: instance,
};