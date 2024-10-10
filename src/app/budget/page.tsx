'use client';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { BudgetForm } from '@/components/budget/budget-form';
import { InfoBox } from '@/components/budget/info-box';
import { BudgetProvider } from '@/components/budget/provider';
import { PageView } from '@/components/common/page-view';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BudgetBallotPage() {
  const { isConnecting } = useAccount();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // If the component hasn't mounted yet, return null to prevent any render
  if (!hasMounted) {
    return null;
  }

  // After mounting, if still connecting, show a loader
  if (isConnecting) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Connected and mounted, render the main content
  return (
    <BudgetProvider>
      <div className="flex flex-row gap-12">
        <section className="flex-grow max-w-[720px] space-y-6">
          <p className="text-gray-600">
            Decide on the budget for this round, and then decide how much should
            go to each category. You can return to this step at any time before
            you submit your ballot.
          </p>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="mb-4">Your budget</CardTitle>
              <Separator />
            </CardHeader>
            <BudgetForm />
          </Card>
          <PageView title={'budget-ballot'} />
        </section>
        <aside className="w-[304px] sticky top-4 h-[60vh]">
          <InfoBox />
        </aside>
      </div>
    </BudgetProvider>
  );
}
