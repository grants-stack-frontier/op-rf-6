import Link from 'next/link';

import { Heading } from '@/components/ui/headings';
import mixpanel from '@/lib/mixpanel';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAttestations } from '@/hooks/useAttestations';
import { useMemo } from 'react';

export function Attestations({ projectId }: { projectId?: string }) {
  const { data: attestations } = useAttestations({ projectId });

  // if (!attestations) return null;

  const notableRecognition = useMemo(() => {
    const mostPositive = true
    const cannotLiveWithout = true
    return { mostPositive, cannotLiveWithout }
  }, [attestations]);

  return (
    <div className="flex flex-col gap-2 mt-12">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Attestations
      </Heading>
      <p className="text-sm line-height-5 text-[#404454]">
        Given to this project by citizens and delegates at metricsgarden.xyz.
        Only applicable for projects in the Governance Infrastructure &
        Tooling category.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <AttestationCard />
        <RecommendationRatingCard />
      </div>
      {(notableRecognition.mostPositive || notableRecognition.cannotLiveWithout) && (
        <div className={`grid grid-cols-${notableRecognition.mostPositive && notableRecognition.cannotLiveWithout ? 2 : 1} gap-2`}>
          {notableRecognition.mostPositive && (<MostPositiveCard />)}
          {notableRecognition.cannotLiveWithout && (<CannotLiveWithoutCard />)}
        </div>
      )}
    </div>
  );
}

function AttestationCard() {
  return (
    <Card className="shadow-none">
      <CardContent className='flex flex-col gap-4 p-8 pb-9'>
        <AttUserIcon />
        <CardTitle className='text-xl'>100 attestations</CardTitle>
        <div className="text-sm line-height-5">
          <p>By <span className='font-semibold'>Citizens (68) & Top Delegates* (32).</span></p>
          <p>More than most other Governance Infrastructure & Tooling projects.</p>
          <p className="text-xs line-height-4 mt-2">
            *The top 100 delegates by voting power.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationRatingCard() {
  return (
    <Card className="shadow-none">
      <CardContent className='flex flex-col gap-4 p-8 pb-9'>
        <AttThumbsUpIcon />
        <CardTitle className='text-xl'>9.8 out of 10</CardTitle>
        <div className="text-sm line-height-5">
          <p>
            <span className='font-semibold'>Citizens & Top Delegates</span>{" "}
            are <span className='font-semibold'>very likely</span> to recommend this tool.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MostPositiveCard() {
  return (
    <Card className="shadow-none">
      <CardContent className='flex flex-col gap-4 p-8 pb-9'>
        <AttStarIcon />
        <CardTitle className='text-xl'>Most positive</CardTitle>
        <div className="text-sm line-height-5">
          <p>One of the most positively attested projects by <span className='font-semibold'>Citizens.</span></p>
          <Link href={`#`} passHref>
            <p className="text-xs line-height-4 mt-2">
              View methodology
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function CannotLiveWithoutCard() {
  return (
    <Card className="shadow-none">
      <CardContent className='flex flex-col gap-4 p-8 pb-9'>
        <AttStarIcon />
        <CardTitle className='text-xl'>Can't live without</CardTitle>
        <div className="text-sm line-height-5">
          <p>One of the top projects that <span className='font-semibold'>Citizens & Top Delegates</span> can't live without.</p>
          <Link href={`#`} passHref>
            <p className="text-xs line-height-4 mt-2">
              View methodology
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Icons
export function AttUserIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13Z"
        fill="#3374DB"
      />
    </svg>
  )
}

export function AttThumbsUpIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M2 8.99997H5V21H2C1.44772 21 1 20.5523 1 20V9.99997C1 9.44769 1.44772 8.99997 2 8.99997ZM7.29289 7.70708L13.6934 1.30661C13.8693 1.13066 14.1479 1.11087 14.3469 1.26016L15.1995 1.8996C15.6842 2.26312 15.9026 2.88253 15.7531 3.46966L14.5998 7.99997H21C22.1046 7.99997 23 8.8954 23 9.99997V12.1043C23 12.3656 22.9488 12.6243 22.8494 12.8658L19.755 20.3807C19.6007 20.7554 19.2355 21 18.8303 21H8C7.44772 21 7 20.5523 7 20V8.41419C7 8.14897 7.10536 7.89462 7.29289 7.70708Z" 
        fill="#3374DB"
      />
    </svg>
  )
}

export function AttStarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"
        fill="#F3BE50"
      />
    </svg>
  )
}

