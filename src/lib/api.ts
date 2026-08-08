import { API_BASE } from './constants';
import type { ApiResponse } from './types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (this.token) headers.Authorization = `Bearer ${this.token}`;

      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...options,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          data: null,
          error: json?.error ?? { code: 'UNKNOWN', message: `HTTP ${res.status}` },
        };
      }
      return { data: json?.data ?? json, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Network error',
        },
      };
    }
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }
  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient(API_BASE);

// Typed endpoint helpers
export const endpoints = {
  movies: (filters?: { genre?: string; date?: string }) => {
    const qs = new URLSearchParams(filters as Record<string, string>).toString();
    return `/api/movies${qs ? `?${qs}` : ''}`;
  },
  movie: (id: number | string) => `/api/movies/${id}`,
  showtimeSeats: (id: number | string) => `/api/showtimes/${id}/seats`,
  holdBooking: () => '/api/bookings/hold',
  booking: (id: string) => `/api/bookings/${id}`,
  bookings: () => '/api/bookings',
  initiatePayment: () => '/api/payment/initiate',
  login: () => '/api/auth/login',
  signup: () => '/api/auth/signup',
  me: () => '/api/auth/me',
  logout: () => '/api/auth/logout',
};
