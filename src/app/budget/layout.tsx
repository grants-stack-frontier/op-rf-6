import { BallotBudgetTabs } from '@/components/common/ballot-tabs';
import { PostSubmissionBanner } from '@/components/common/post-submission-banner';

export default function BudgetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex-1 space-y-6">
        <PostSubmissionBanner />
        {children}
      </div>
    </>
  );
}
