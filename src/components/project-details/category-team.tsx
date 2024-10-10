import { RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';
import { categoryNames } from '@/lib/categories';
import { getBadgeClassName } from '@/lib/projectUtils';
import { TeamMember } from '@/types/project-details';

import { AvatarCarousel } from '../common/avatar-carousel';
import { Badge } from '../ui/badge';

export function CategoryAndTeam({
  category,
  team,
}: {
  category?: RetroFundingBallotCategoriesAllocationCategorySlug;
  team?: TeamMember[];
}) {
  // Safely map over the team array, with additional checks
  const teamImages =
    team
      ?.filter(
        (member) =>
          member &&
          typeof member === 'object' &&
          'pfp_url' in member &&
          'display_name' in member &&
          member.pfp_url &&
          member.display_name
      )
      .map((member) => ({
        url: member.pfp_url as string,
        name: member.display_name,
      })) ?? [];

  return (
    <div className="flex items-center gap-4 mb-12">
      <Badge
        variant={null}
        className={`h-7 cursor-pointer border-0 font-medium text-sm leading-5 ${getBadgeClassName(category)}`}
      >
        {category ? categoryNames[category] : 'N/A'}
      </Badge>
      {teamImages && teamImages.length > 0 ? (
        <AvatarCarousel images={teamImages} />
      ) : (
        <span className="text-sm text-gray-500">No team members</span>
      )}
    </div>
  );
}
