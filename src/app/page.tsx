'use client';
import { redirect } from 'next/navigation';
import { useAccount } from 'wagmi';

import { PageView } from '@/components/common/page-view';
// import { Badge } from '@/components/ui/badge';
// import { Card } from '@/components/ui/card';
import { WelcomeCarousel } from '@/components/welcome/carousel';

import onboard1 from '../../public/onboard1.svg';
import onboard2 from '../../public/onboard2.svg';
import onboard3 from '../../public/onboard3.svg';
import onboard4 from '../../public/onboard4.svg';

export default function Home() {
  const { address } = useAccount();
  const slides = [
    {
      title: 'Here’s what’s to expect',
      description:
        'In this round of voting, you’ll propose the overall budget, score projects from high to low impact, and allocate rewards.',
      image: onboard1,
    },
    {
      title: 'First, you’ll propose the budget',
      description:
        'You’ll propose the budget for the entire round, then you’ll decide how much of that budget should go to each category.',
      image: onboard2,
    },
    {
      title: 'Next, you’ll score projects in one category',
      description:
        'Within one of the categories (randomly assigned), you’ll score projects from high to low impact. If you have a conflict of interest, you’ll declare it rather than scoring the project.',
      image: onboard3,
    },
    {
      title: 'Finally, you’ll allocate rewards',
      description: `Now that you’re familiar with the projects in your category, you can allocate rewards across them.`,
      image: onboard4,
    },
  ];

  if (!address) {
    return redirect('/');
  }

  return (
    <div className="max-w-screen-md mx-auto flex flex-1">
      <Background />
      <PageView title="Welcome" />
      <div className="w-full bg-white dark:bg-card px-8 py-16 flex flex-col items-center rounded-3xl gap-6 border-none">
        <WelcomeCarousel slides={slides} />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="w-screen h-screen fixed inset-0 -z-10 bg-cover bg-white dark:bg-card" />
  );
}
