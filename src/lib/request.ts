'use client';
import { decodeJwt } from 'jose';
import ky, { HTTPError } from 'ky';

import { getToken, setToken } from './token';

import type { Address } from 'viem';

export const request = ky.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = getToken();
        if (token) {
          decodeJwt<{
            siwe: { address: Address };
            isBadgeholder?: boolean;
            category: string;
          }>(token);
          request.headers.set('Authorization', `Bearer ${token}`);
          request.headers.set('Content-Type', 'application/json');
        }
      },
    ],
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        if (
          error instanceof HTTPError &&
          error.response.status === 401 &&
          retryCount === 1
        ) {
          try {
            setToken('');
            request.headers.set('Authorization', '');
          } catch {
            throw new Error('Failed to refresh token');
          }
        }
      },
    ],
  },
  retry: {
    methods: ['get', 'post'],
    limit: 5,
    statusCodes: [401],
  },
});
