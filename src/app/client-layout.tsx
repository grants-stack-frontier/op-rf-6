'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { SignMessage } from '@/components/auth/sign-message';
import { Callouts } from '@/components/common/callouts';
import { DisconnectedState } from '@/components/common/disconnected-state';
import { Header } from '@/components/common/header';
import { useSession } from '@/hooks/useAuth';

import SunnySVG from '../../public/sunny.svg';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { isConnecting, isConnected } = useAccount();
  const { data: session, isLoading: isSessionLoading } = useSession();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const showSignaturePrompt = isConnected && !isSessionLoading && !session;

  return (
    <main className="">
      <Header />
      <div className="sm:hidden h-screen -mt-16 px-4 flex flex-col gap-4 justify-center items-center">
        <Image src={SunnySVG} alt="Sunny" />
        <div className="text-center">
          The mobile version of this website isn&apos;t ready yet. Please use
          your desktop computer.
        </div>
      </div>
      <div className="hidden sm:block">
        <Callouts />
      </div>
      <div className="hidden sm:flex gap-8 max-w-[1072px] mx-auto py-16 justify-center">
        {isConnecting || isSessionLoading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : showSignaturePrompt ? (
          <SignMessage />
        ) : isConnected && session ? (
          children
        ) : (
          <DisconnectedState />
        )}
      </div>
    </main>
  );
}
