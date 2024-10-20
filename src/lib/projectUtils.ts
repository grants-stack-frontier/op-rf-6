import { RetroFundingBallotCategoriesAllocationCategorySlug } from '@/__generated__/api/agora.schemas';

export function getBadgeClassName(
  category?: RetroFundingBallotCategoriesAllocationCategorySlug
): string {
  switch (category) {
    case RetroFundingBallotCategoriesAllocationCategorySlug.GOV_INFRA:
      return 'bg-blue-500/25 text-blue-600';
    case RetroFundingBallotCategoriesAllocationCategorySlug.GOV_ANALYTICS:
      return 'bg-purple-500/25 text-purple-600';
    case RetroFundingBallotCategoriesAllocationCategorySlug.GOV_LEADERSHIP:
      return 'bg-orange-500/25 text-orange-600';
    default:
      return 'bg-blue-500/25 text-blue-600';
  }
}

export function formatProjectAge(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`;
  }
}

export const getSafeUrl = (url: string | string[] | undefined): string => {
  if (typeof url === 'string') {
    try {
      return new URL(url).toString();
    } catch {
      return '#';
    }
  }
  if (Array.isArray(url) && url.length > 0) {
    try {
      return new URL(url[0]).toString();
    } catch {
      return '#';
    }
  }
  return '#';
};
