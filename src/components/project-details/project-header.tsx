import Image from 'next/image';
import { Organization } from '@/__generated__/api/agora.schemas';
import { Heading } from '@/components/ui/headings';
import { useState } from 'react';

function ImageWithFallback({
  src,
  alt,
  className,
  width,
  height,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  [key: string]: any;
}) {
  const [error, setError] = useState(false);

  if (process.env.NODE_ENV === 'development') {
    console.log(`Loading image: ${src}`);
  }

  if (error) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      loading="eager"
      onError={() => {
        console.error(`Failed to load image: ${src}`);
        setError(true);
      }}
      sizes={`${width}px`}
      {...props}
    />
  );
}

export function ProjectHeader({
  profileAvatarUrl,
  name = '',
  projectCoverImageUrl,
  organization,
}: {
  profileAvatarUrl?: string;
  name?: string;
  projectCoverImageUrl?: string;
  organization?: Organization;
}) {
  const { organizationAvatarUrl, name: orgName } = organization ?? {};

  return (
    <div className="flex flex-col gap-6">
      {projectCoverImageUrl && profileAvatarUrl ? (
        <div className="w-full h-56 relative">
          <ImageWithFallback
            priority
            className="rounded-md w-full h-[180px] object-cover border border-gray-200 bg-white"
            src={projectCoverImageUrl}
            alt={name || ''}
            width={720}
            height={180}
          />
          <ImageWithFallback
            priority
            className="rounded-md -mt-10 ml-6 object-cover bg-white absolute z-10"
            src={profileAvatarUrl}
            alt={name || ''}
            width={80}
            height={80}
          />
        </div>
      ) : (
        profileAvatarUrl && (
          <div className="w-full">
            <ImageWithFallback
              priority
              className="rounded-md object-cover bg-white"
              src={profileAvatarUrl}
              alt={name || ''}
              width={80}
              height={80}
            />
          </div>
        )
      )}

      {name && <Heading variant="h2">{name}</Heading>}

      {organization && (
        <div className="flex items-center gap-2">
          <p className="font-medium">By</p>
          {organizationAvatarUrl && (
            <ImageWithFallback
              priority
              className="rounded-full bg-white"
              src={organizationAvatarUrl}
              alt={orgName || ''}
              width={30}
              height={30}
            />
          )}
          {orgName && <p className="font-medium">{orgName}</p>}
        </div>
      )}
    </div>
  );
}
