import axios from 'axios';

/**
 * Every backend error response is shaped { error: string }. This pulls
 * that message out of a caught error safely, without resorting to `any`.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  return fallback;
}
