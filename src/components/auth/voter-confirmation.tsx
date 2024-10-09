'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeJwt } from 'jose';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect as useWagmiDisconnect } from 'wagmi';

import {
  getVoterConfirmationView,
  removeVoterConfirmationView,
} from '@/hooks/useAuth';
import mixpanel from '@/lib/mixpanel';
import { getToken } from '@/lib/token';

import { Button } from '../ui/button';




import { UnifiedDialog } from './unified-dialog';

import type { Address } from 'viem';




export function VoterConfirmationDialog() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const [viewable, setViewable] = useState<boolean>(false);

  function closeViewable() {
    removeVoterConfirmationView();
    setViewable(getVoterConfirmationView());
  }

  useEffect(() => {
    setViewable(getVoterConfirmationView());
  }, [address, session]);

  if (!viewable || !address || !session) return null;

  if (!session.isBadgeholder) {
    return <VoterIsNotBadgeholder onClose={closeViewable} />;
  }

  if (!session.category) {
    return <VoterIsNotSelected onClose={closeViewable} />;
  }

  return <VoterIsSelected onClose={closeViewable} />;
}

function VoterIsSelected({ onClose }: { onClose: () => void }) {
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You've been selected to vote in this round of Retro Funding"
      description="You're in a special group of badgeholders and guest voters participating in this round. Thanks in advance for your efforts."
      emoji="✅"
    >
      <Button
        type="button"
        className="w-full"
        variant="destructive"
        onClick={onClose}
      >
        Continue
      </Button>
    </UnifiedDialog>
  );
}

function VoterIsNotSelected({ onClose }: { onClose: () => void }) {
  const { disconnect } = useDisconnect();
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You weren't selected to vote in this round of Retro Funding"
      description="Thanks for being a badgeholder, and we'll see you in the next round of Retro Funding."
      emoji="🛑"
    >
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          variant="destructive"
          onClick={() => disconnect?.()}
        >
          Disconnect wallet
        </Button>
        <Button className="w-full" variant="outline" onClick={onClose}>
          Explore the app
        </Button>
      </div>
    </UnifiedDialog>
  );
}

function VoterIsNotBadgeholder({ onClose }: { onClose: () => void }) {
  const { disconnect } = useDisconnect();
  return (
    <UnifiedDialog
      open={true}
      onClose={onClose}
      title="You're not a badgeholder"
      description="Feel free to explore the app, but you won't be able to use all features or submit a ballot."
      emoji="🛑"
    >
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          variant="destructive"
          onClick={() => disconnect?.()}
        >
          Disconnect wallet
        </Button>
        <Button className="w-full" variant="outline" onClick={onClose}>
          Explore the app
        </Button>
      </div>
    </UnifiedDialog>
  );
}

export function useDisconnect() {
  const client = useQueryClient();
  const router = useRouter();
  const wagmiDisconnect = useWagmiDisconnect();

  async function disconnect() {
    wagmiDisconnect.disconnect();
    global?.localStorage.removeItem('token');
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
