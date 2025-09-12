import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from "@shared/api";

const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    // Skip the request if the path contains 'undefined' or 'null'
    if (path.includes('undefined') || path.includes('null')) {
      console.error('Blocked invalid API request:', path);
      throw new Error('Invalid request: missing or invalid parameters');
    }

    const headers = new Headers(init?.headers || {});
    headers.set("Content-Type", "application/json");
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    
    // Prepend API_BASE_URL if the path is not an absolute URL
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    
    let res: Response;
    try {
      res = await fetch(url, { 
        ...init, 
        headers,
        credentials: 'include' // Ensure cookies are sent with the request
      });
    } catch (error) {
      console.error('Network error:', error);
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    // Handle 401 Unauthorized
    if (res.status === 401) {
      clearToken();
      // Use window.location instead of navigate to ensure full page reload
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle 404 Not Found
    if (res.status === 404) {
      throw new Error('The requested resource was not found');
    }

    // Handle 400 Bad Request
    if (res.status === 400) {
      try {
        const error = await res.json();
        throw new Error(error.message || 'Invalid request');
      } catch (e) {
        throw new Error('Invalid request');
      }
    }

    // Handle other error statuses
    if (!res.ok) {
      try {
        const error = await res.json();
        throw new Error(error.message || `Request failed with status ${res.status}`);
      } catch (e) {
        throw new Error(`Request failed with status ${res.status}`);
      }
    }

    // Handle empty responses
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    try {
      return await res.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    // Only log unexpected errors, not validation errors we threw ourselves
    if (!error.message.startsWith('Invalid request') && 
        !error.message.startsWith('Your session has expired') &&
        !error.message.startsWith('The requested resource was not found')) {
      console.error(`API Error [${path}]:`, error);
    }
    throw error;
  }
}

export async function loginApi(body: LoginRequest) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function signupApi(body: SignupRequest) {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
