import { RiLink, RiTwitterXLine } from '@remixicon/react';
import Image from 'next/image';
import Link from 'next/link';

import { SocialLinks } from '@/__generated__/api/agora.schemas';
import mixpanel from '@/lib/mixpanel';
import { getSafeUrl } from '@/lib/projectUtils';

import Mirror from '../../../public/mirror.svg';
import Warpcast from '../../../public/warpcast.svg';

export function SocialLinksList({
  socialLinks,
}: {
  socialLinks?: SocialLinks;
}) {
  const { website, farcaster, twitter, mirror } = socialLinks ?? {};

  if (!website && !farcaster && !twitter && !mirror) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 my-6">
      {website && Array.isArray(website) && website?.length > 0 && (
        <Link
          className="flex items-center gap-1.5 truncate max-w-[200px] text-sm lowercase hover:underline"
          href={getSafeUrl(website)}
          target="_blank"
          onClick={() => mixpanel.track('Open Website', { external: true })}
        >
          <RiLink className="h-4 w-4" />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {typeof website === 'string'
              ? website
              : Array.isArray(website)
                ? website[0]
                : 'Website'}
          </span>
        </Link>
      )}
      {farcaster && Array.isArray(farcaster) && farcaster?.length > 0 && (
        <Link
          className="flex items-center gap-1.5 hover:underline"
          href={getSafeUrl(farcaster)}
          target="_blank"
          onClick={() => mixpanel.track('Open Farcaster', { external: true })}
        >
          <Image src={Warpcast} alt="Farcaster" width={16} height={16} />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {typeof farcaster === 'string'
              ? farcaster
              : Array.isArray(farcaster)
                ? farcaster[0]
                : 'Farcaster'}
          </span>
        </Link>
      )}
      {twitter && (
        <Link
          className="flex items-center gap-1.5 max-w-[200px] truncate text-sm lowercase hover:underline"
          href={getSafeUrl(twitter)}
          target="_blank"
          onClick={() => mixpanel.track('Open Twitter', { external: true })}
        >
          <RiTwitterXLine className="h-4 w-4" />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {twitter}
          </span>
        </Link>
      )}
      {mirror && (
        <Link
          className="flex items-center gap-1.5 truncate max-w-[200px] text-sm lowercase hover:underline"
          href={getSafeUrl(mirror)}
          target="_blank"
          onClick={() => mixpanel.track('Open Mirror', { external: true })}
        >
          <Image src={Mirror} alt="Mirror" width={16} height={16} />
          <span className="truncate max-w-[200px] text-sm lowercase">
            {mirror}
          </span>
        </Link>
      )}
    </div>
  );
}
