'use client';
import { UnlockBallotDialog } from '@/components/ballot/unlock-ballot';
import { LoadingDialog } from '@/components/common/loading-dialog';
import { PageView } from '@/components/common/page-view';
import { ProjectDetails } from '@/components/project-details';
import { ProjectBreadcrumb } from '@/components/project-details/project-breadcrumb';
import { ReviewSidebar } from '@/components/project-details/review-sidebar';
import { ProjectProvider, useProjectContext } from '@/contexts/ProjectContext';

function ProjectDetailsContent() {
  const { isLoading, isUserCategory, walletAddress, showUnlockDialog } =
    useProjectContext();

  if (isLoading) {
    return (
      <LoadingDialog
        isOpen={true}
        setOpen={() => {}}
        message="Loading project"
      />
    );
  }

  return (
    <div className="flex gap-12 mx-auto">
      <section className="flex-1 max-w-[720px]">
        <ProjectBreadcrumb />
        <UnlockBallotDialog />
        <ProjectDetails />
        <PageView title={'project-details'} />
      </section>
      {isUserCategory && walletAddress && !showUnlockDialog && (
        <aside className="max-w-[304px]">
          <ReviewSidebar />
        </aside>
      )}
    </div>
  );
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ProjectProvider id={params.id}>
      <ProjectDetailsContent />
    </ProjectProvider>
  );
}
