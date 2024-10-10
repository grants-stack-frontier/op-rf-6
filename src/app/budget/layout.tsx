import { BallotTabs } from '@/components/ballot/ballot-tabs';
import { PostSubmissionBanner } from '@/components/ballot/post-submission-banner';

export default function BudgetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex-1 space-y-6">
        <PostSubmissionBanner />
        <BallotTabs />
        {children}
      </div>
    </>
  );
}
