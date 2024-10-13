'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useBudgetContext } from '@/contexts/BudgetContext';
import { cn } from '@/lib/utils';

import { Separator } from '../ui/separator';

export function BallotBudgetTabs() {
  const path = usePathname();
  const { error, allocations } = useBudgetContext();
  const isBallotDisabled = !!error || !Object.keys(allocations).length;

  const renderLink = (label: string, href: string, isActive: boolean) => (
    <Link
      className={cn('text-gray-400 font-semibold', {
        'text-foreground': isActive,
      })}
      href={href}
    >
      {label}
    </Link>
  );

  return (
    <section className="flex gap-6 text-2xl">
      {renderLink('Budget', '/budget', path === '/budget')}
      <Separator orientation="vertical" className="h-8 text-gray-400 w-[2px]" />
      {isBallotDisabled ? (
        <span className="text-gray-300 font-semibold cursor-not-allowed">
          Ballot
        </span>
      ) : (
        renderLink('Ballot', '/ballot', path === '/ballot')
      )}
    </section>
  );
}
