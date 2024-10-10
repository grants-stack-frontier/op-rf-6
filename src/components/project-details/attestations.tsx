import Link from 'next/link';

import { Heading } from '@/components/ui/headings';
import mixpanel from '@/lib/mixpanel';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAttestations } from '@/hooks/useAttestations';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import SobFaceEmoji from '../../../public/sob-face-emoji.svg';
import FrowningFaceEmoji from '../../../public/slightly-frowning-face-emoji.svg';
import NeutralFaceEmoji from '../../../public/neutral-face-emoji.svg';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Pie, PieChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

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
      <AttestationChartCard />
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

type Sentiment = 'extremelyUpset' | 'somewhatUpset' | 'neutral';

function AttestationChartCard() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'citizens' | 'delegates'>('all');
  const sentimentData = {
    citizens: {
      extremelyUpset: 90,
      somewhatUpset: 8,
      neutral: 2,
    },
    delegates: {
      extremelyUpset: 10,
      somewhatUpset: 5,
      neutral: 85,
    }
  }

  const mostCommonSentiment = useMemo(() => {
    const combinedData = {
      extremelyUpset: sentimentData.citizens.extremelyUpset + sentimentData.delegates.extremelyUpset,
      somewhatUpset: sentimentData.citizens.somewhatUpset + sentimentData.delegates.somewhatUpset,
      neutral: sentimentData.citizens.neutral + sentimentData.delegates.neutral,
    };
    const maxValue = Math.max(
      combinedData.extremelyUpset,
      combinedData.somewhatUpset,
      combinedData.neutral
    );
    return Object.entries(combinedData).find(([_, value]) => value === maxValue)?.[0] as Sentiment;
  }, [sentimentData])

  const legendData = useMemo(() => {
    let total: number;
    switch (selectedTab) {
      case 'all': {
        total = Object.values(sentimentData.citizens).reduce((acc, val) => acc + val, 0) + Object.values(sentimentData.delegates).reduce((acc, val) => acc + val, 0);
        return {
          extremelyUpset: (sentimentData.citizens.extremelyUpset + sentimentData.delegates.extremelyUpset) / total * 100,
          somewhatUpset: (sentimentData.citizens.somewhatUpset + sentimentData.delegates.somewhatUpset) / total * 100,
          neutral: (sentimentData.citizens.neutral + sentimentData.delegates.neutral) / total * 100,
        }
      }
      case 'citizens':
        total = Object.values(sentimentData.citizens).reduce((acc, val) => acc + val, 0);
        return {
          extremelyUpset: sentimentData.citizens.extremelyUpset / total * 100,
          somewhatUpset: sentimentData.citizens.somewhatUpset / total * 100,
          neutral: sentimentData.citizens.neutral / total * 100,
        }
      case 'delegates':
        total = Object.values(sentimentData.delegates).reduce((acc, val) => acc + val, 0);
        return {
          extremelyUpset: sentimentData.delegates.extremelyUpset / total * 100,
          somewhatUpset: sentimentData.delegates.somewhatUpset / total * 100,
          neutral: sentimentData.delegates.neutral / total * 100,
        }
    }
  }, [selectedTab, sentimentData])

  const chartData = useMemo(() => {
    function getFill(sentiment: Sentiment) {
      switch (sentiment) {
        case 'extremelyUpset':
          return '#3374DB';
        case 'somewhatUpset':
          return '#AAC9FD';
        case 'neutral':
          return '#D6E4FF';
      }
    }
    switch (selectedTab) {
      case 'all': {
        const citizens = Object.entries(sentimentData.citizens).map(([sentiment, value]) => ({ sentiment, value, fill: getFill(sentiment as Sentiment) }));
        const delegates = Object.entries(sentimentData.delegates).map(([sentiment, value]) => ({ sentiment, value, fill: getFill(sentiment as Sentiment) }));
        return citizens.map(({ sentiment, value, fill }) => {
          const delegateValue = delegates.find(d => d.sentiment === sentiment)?.value ?? 0;
          return { sentiment, value: value + delegateValue, fill };
        });
      }
      case 'citizens':
        return Object.entries(sentimentData.citizens).map(([sentiment, value]) => ({ sentiment, value, fill: getFill(sentiment as Sentiment) }));
      case 'delegates':
        return Object.entries(sentimentData.delegates).map(([sentiment, value]) => ({ sentiment, value, fill: getFill(sentiment as Sentiment) }));
      default:
        return Object.entries(sentimentData.citizens).map(([sentiment, value]) => ({ sentiment, value, fill: getFill(sentiment as Sentiment) }));
    }
  }, [selectedTab, sentimentData])

  const config = {
    ["extremely-upset"]: {
      label: "Extremely upset",
      color: "#3374DB",
    },
    ["somewhat-upset"]: {
      label: "Somewhat upset",
      color: "#AAC9FD",
    },
    ["neutral"]: {
      label: "Neutral",
      color: "#D6E4FF",
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-none">
      <CardContent className='flex flex-row gap-2 p-8 pb-9'>
        <div className='flex flex-col gap-2'>
          <SentimentHeader sentiment={mostCommonSentiment} />
          <Tabs defaultValue='all' onValueChange={v => setSelectedTab(v as 'all' | 'citizens' | 'delegates')}>
            <TabsList defaultValue='all' className="bg-white gap-2">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]">All</TabsTrigger>
              <TabsTrigger value="citizens" className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]">Citizens</TabsTrigger>
              <TabsTrigger value="delegates" className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]">Top Delegates</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className='mt-4'>
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
            <TabsContent value="citizens" className='mt-4'>
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
            <TabsContent value="delegates" className='mt-4'>
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
          </Tabs>
        </div>
        <div className='flex items-center justify-center'>
          <ChartContainer config={config} className='mx-auto aspect-square min-h-[204px]'>
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                dataKey="value"
                nameKey="sentiment"
                data={chartData}
                innerRadius={60}
                className='border-w-1 border-white'
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function SentimentHeader({ sentiment }: { sentiment: Sentiment }) {
  if (sentiment === 'extremelyUpset') return (
    <>
      <Image src={SobFaceEmoji} alt="Sob face emoji" />
      <CardTitle className='text-xl'>Most attestors would feel extremely upset if this contribution ceased to exist</CardTitle>
    </>
  )
  if (sentiment === 'somewhatUpset') return (
    <>
      <Image src={FrowningFaceEmoji} alt="Frowning face emoji" />
      <CardTitle className='text-xl'>Most attestors would feel somewhat upset if this contribution ceased to exist</CardTitle>
    </>
  )
  if (sentiment === 'neutral') return (
    <>
      <Image src={NeutralFaceEmoji} alt="Neutral face emoji" />
      <CardTitle className='text-xl'>Most attestors would feel neutral if this contribution ceased to exist</CardTitle>
    </>
  )
}

function SentimentChartLegend({ legendData }: { legendData: Record<Sentiment, number> }) {
  return (
    <div className="text-sm line-height-5 flex flex-col gap-3">
      <div className='flex flex-row items-center gap-5'>
        <div className='flex flex-row items-center'>
          <div className='w-[14px] h-[14px] bg-[#3374DB] rounded-full' />
          <Image src={SobFaceEmoji} alt="Sob face emoji" width={14} height={14} className='absolute ml-2.5' />
        </div>
        <p>Extremely upset: {legendData.extremelyUpset}%</p>
      </div>
      <div className='flex flex-row items-center gap-5'>
        <div className='flex flex-row items-center'>
          <div className='w-[14px] h-[14px] bg-[#AAC9FD] rounded-full' />
          <Image src={FrowningFaceEmoji} alt="Frowning face emoji" width={14} height={14} className='absolute ml-2.5' />
        </div>
        <p>Somewhat upset: {legendData.somewhatUpset}%</p>
      </div>
      <div className='flex flex-row items-center gap-5'>
        <div className='flex flex-row items-center'>
          <div className='w-[14px] h-[14px] bg-[#D6E4FF] rounded-full' />
          <Image src={NeutralFaceEmoji} alt="Neutral face emoji" width={14} height={14} className='absolute ml-2.5' />
        </div>
        <p>Neutral: {legendData.neutral}%</p>
      </div>
    </div>
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

