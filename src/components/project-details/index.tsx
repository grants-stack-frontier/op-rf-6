'use client';
import type { RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';
import { useProjectContext } from '@/contexts/ProjectContext';
import { TeamMember } from '@/types/project-details';

import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

import { Attestations } from './attestations';
import { CategoryAndTeam } from './category-team';
import { GrantsFundingRevenue } from './grants-funding-revenue';
import { ImpactStatement } from './impact-statement';
import { PricingModel } from './pricing-model';
import { ProjectDescription } from './project-description';
import { ProjectHeader } from './project-header';
import { ReposLinksContracts } from './repos-links-contracts';
import { SocialLinksList } from './social-links';
// import { Testimonials } from './testimonials';

export function ProjectDetails() {
  const { project, isLoading } = useProjectContext();
  const {
    id,
    profileAvatarUrl,
    name,
    projectCoverImageUrl,
    description,
    socialLinks,
    applicationCategory,
    organization,
    github,
    links,
    grantsAndFunding,
    pricingModel,
    impactMetrics,
    impactStatement,
    // testimonials,
    contracts,
    team,
  } = project ?? {};
  console.log({ project });
  return (
    <>
      {isLoading ? (
        <>
          <Skeleton className="w-96 h-8" />
          <div className="space-y-2">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4" />
          </div>
        </>
      ) : (
        <>
          <ProjectHeader
            profileAvatarUrl={profileAvatarUrl}
            name={name}
            projectCoverImageUrl={projectCoverImageUrl}
            organization={organization}
          />
          <ProjectDescription description={description} />
          <SocialLinksList socialLinks={socialLinks} />
          <CategoryAndTeam
            category={
              applicationCategory as RetroFundingBallotCategoriesAllocationCategorySlug
            }
            team={team as TeamMember[] | undefined}
          />
          <ReposLinksContracts
            github={github}
            links={links}
            contracts={contracts}
          />
          {/* <Testimonials testimonials={testimonials} /> */}
          <Attestations projectId={id} metrics={impactMetrics} />
          <Separator className="my-12" />
          {impactStatement && (
            <ImpactStatement impactStatement={impactStatement} />
          )}
          <Separator className="my-12" />
          <PricingModel pricingModel={pricingModel} />
          <GrantsFundingRevenue grantsAndFunding={grantsAndFunding} />
        </>
      )}
    </>
  );
}
