import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeJwt } from 'jose';
import { useRouter } from 'next/navigation';
import { useDisconnect as useWagmiDisconnect } from 'wagmi';

import { usePostSiweVerificationMessage } from '@/__generated__/api/agora';
import mixpanel from '@/lib/mixpanel';
import { getToken, setToken } from '@/lib/token';

import type { Address } from 'viem';

export function useVerify() {
  const client = useQueryClient();
  const mutation = usePostSiweVerificationMessage({
    mutation: {
      onSuccess: async (data) => {
        if (data.access_token) {
          mixpanel.track('Sign In', { status: 'success' });
          setToken(data.access_token);
          await client.invalidateQueries({ queryKey: ['session'] });
          setVoterConfirmationView();
        } else {
          console.error('Access token is undefined');
        }
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: async (json: {
      message: string;
      signature: string;
      nonce: string;
    }) => {
      const result = await mutation.mutateAsync({ data: json });
      return result;
    },
  };
}

export function useDisconnect() {
  const client = useQueryClient();
  const router = useRouter();
  const wagmiDisconnect = useWagmiDisconnect();

  async function disconnect() {
    wagmiDisconnect.disconnect();
    global?.localStorage?.removeItem('token');
    mixpanel.reset();
    await client.invalidateQueries({ queryKey: ['session'] });
    router.push('/');
  }

  return { disconnect };
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const accessToken = getToken();

      const user = accessToken
        ? decodeJwt<{
            siwe: { address: Address };
            isBadgeholder?: boolean;
            isCitizen?: boolean;
            category?: string;
          }>(accessToken)
        : null;

      if (user) {
        mixpanel.identify(user.siwe.address);
        mixpanel.people.set({
          $name: user.siwe.address,
          badgeholder: user.isBadgeholder,
        });
      }

      return user;
    },
  });
}

// Helper functions
function setVoterConfirmationView() {
  localStorage.setItem('voter-confirmation-view', 'true');
}

export function getVoterConfirmationView() {
  const view = localStorage.getItem('voter-confirmation-view');
  return !!view;
}

export function removeVoterConfirmationView() {
  const view = localStorage.getItem('voter-confirmation-view');
  if (view) localStorage.removeItem('voter-confirmation-view');
}
