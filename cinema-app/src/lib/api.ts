import { API_BASE, API_VERSION_PREFIX } from './constants';
import { useAuthStore } from '@/stores/auth-store';
import type { ApiResponse } from './types';

/**
 * Backend response envelope (per backend/src/app/shared/sendResponse.ts):
 *   Success: { success: true, statusCode, message, data }
 *   Error:   { success: false, statusCode, message, error?: anything }
 *
 * We normalize both into the frontend's ApiResponse<T> = { data, error }.
 */
interface BackendSuccess<T> {
  success: true;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface BackendFailure {
  success: false;
  statusCode?: number;
  message?: string;
  error?: unknown;
}

type BackendResponse<T> = BackendSuccess<T> | BackendFailure;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
    const cleanPath = path.startsWith(API_VERSION_PREFIX)
      ? path
      : `${API_VERSION_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      // Prefer the persisted token from the auth store so the request
      // always carries the latest credentials (avoids stale closures).
      const storeToken = this.token ?? useAuthStore.getState().token;
      if (storeToken) headers.Authorization = `Bearer ${storeToken}`;

      const res = await fetch(`${this.baseUrl}${cleanPath}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...options,
      });

      const json = (await res.json().catch(() => null)) as BackendResponse<T> | null;

      if (!res.ok || (json && json.success === false)) {
        const failure = json && 'error' in json ? (json as BackendFailure) : null;
        return {
          data: null,
          error: {
            code: `HTTP_${res.status}`,
            message: failure?.message ?? json?.message ?? `HTTP ${res.status}`,
            details: failure?.error as Record<string, unknown> | undefined,
          },
        };
      }

      const data = json && 'data' in json ? (json.data ?? null) : ((json as unknown) as T | null);
      return { data, error: null };
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

// Typed endpoint helpers — paths are written WITHOUT the /api/v1 prefix;
// the client adds it automatically.
export const endpoints = {
  // Auth
  signup: () => '/auth/signup',
  login: () => '/auth/login',
  logout: () => '/auth/logout',
  me: () => '/auth/me',
  otpSend: () => '/auth/otp/send',
  otpVerify: () => '/auth/otp/verify',

  // Movies & showtimes
  movies: () => '/movies',
  movie: (id: string) => `/movies/${id}`,
  showtime: (id: string) => `/showtimes/${id}`,
  showtimeSeats: (id: string) => `/showtimes/${id}/seats`,

  // Bookings
  holdBooking: () => '/bookings/hold',
  confirmBooking: (id: string) => `/bookings/${id}/confirm`,
  booking: (id: string) => `/bookings/${id}`,
  bookings: (filters?: { userId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return `/bookings${qs ? `?${qs}` : ''}`;
  },

  // Payment
  initiatePayment: () => '/payments/charge',
  refundPayment: () => '/payments/refund',
  paymentWebhook: () => '/payments/webhooks/payment',
};