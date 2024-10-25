'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Pie, PieChart } from 'recharts';

import {
  ProjectImpactMetrics,
  ProjectImpactMetricsElectedGovernanceReviews,
  ProjectImpactMetricsPercentageDistributions,
} from '@/__generated__/api/agora.schemas';
import { Heading } from '@/components/ui/headings';
// import mixpanel from '@/lib/mixpanel';
import { useProjects } from '@/hooks/useProjects';

import NeutralFaceEmoji from '../../../public/neutral-face-emoji.svg';
import FrowningFaceEmoji from '../../../public/slightly-frowning-face-emoji.svg';
import SobFaceEmoji from '../../../public/sob-face-emoji.svg';
import {
  Card,
  CardContent,
  // CardHeader,
  CardTitle,
} from '../ui/card';
import {
  ChartConfig,
  ChartContainer,
  // ChartLegend,
  // ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  AttStarIcon,
  AttUserIcon,
  AttUserStarIcon,
  ThumbRatingIcon,
} from './attestation-icons';
import { AttestationSuperlativeDialog } from './attestation-superlative-dialog';

export function Attestations({
  projectId,
  metrics,
}: {
  projectId?: string;
  metrics?: ProjectImpactMetrics;
}) {
  const notableRecognition = useMemo(() => {
    const mostPositive = Boolean(metrics?.most_positive_superlative);
    const cannotLiveWithout = Boolean(metrics?.cant_live_without_superlative);
    return { mostPositive, cannotLiveWithout };
  }, [metrics]);

  if (!metrics) return null;

  return (
    <div className="flex flex-col gap-2 mt-12">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Attestations
      </Heading>
      <p className="text-sm line-height-5 text-[#404454]">
        Given to this project by citizens and delegates at metricsgarden.xyz.
        Only applicable for projects in the Governance Infrastructure & Tooling
        category.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <AttestationCard
          citizensCount={metrics?.count_citizen_attestations}
          delegatesCount={metrics?.count_delegate_attestations}
          totalCount={metrics?.count_total_attestations}
        />
        <RecommendationRatingCard rating={metrics?.avg_nps_score} />
      </div>
      {(notableRecognition.mostPositive ||
        notableRecognition.cannotLiveWithout) && (
        <div
          className={`grid grid-cols-${notableRecognition.mostPositive && notableRecognition.cannotLiveWithout ? 2 : 1} gap-2`}
        >
          {notableRecognition.mostPositive && <MostPositiveCard />}
          {notableRecognition.cannotLiveWithout && <CannotLiveWithoutCard />}
        </div>
      )}
      <AttestationChartCard
        sentimentData={metrics.percentage_distributions}
        counts={{
          citizens: metrics.count_citizen_attestations,
          delegates: metrics.count_delegate_attestations,
          total: metrics.count_total_attestations,
        }}
      />
      <AttestationElectedGovernanceMembersCard
        reviews={metrics.elected_governance_reviews}
      />
      <Link
        href={`https://www.metricsgarden.xyz/projects/${projectId?.toLowerCase()}/?tab=insights`}
        target="_blank"
        passHref
      >
        <p className="text-sm line-height-5 text-[#404454]">
          View all testimonials at metricsgarden.xyz/projects/
          {projectId?.substring(0, 4)}...
        </p>
      </Link>
    </div>
  );
}

function AttestationCard({
  citizensCount,
  delegatesCount,
  totalCount,
}: {
  citizensCount?: number;
  delegatesCount?: number;
  totalCount?: number;
}) {
  const { data: projects } = useProjects({ category: 'gov_infra' });

  const attestationAvgQuantity = useMemo(() => {
    return projects
      ? projects.reduce(
          (acc, project) =>
            acc + (project.impactMetrics?.count_total_attestations ?? 0),
          0
        ) / projects.length
      : 0;
  }, [projects]);

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-8 pb-9">
        <AttUserIcon />
        <CardTitle className="text-xl">
          {totalCount ?? (citizensCount ?? 0) + (delegatesCount ?? 0)}{' '}
          attestations
        </CardTitle>
        <div className="text-sm line-height-5">
          {totalCount && totalCount > 0 && (
            <>
              <p>
                By{' '}
                <span className="font-semibold">
                  Citizens ({citizensCount ?? 0}) & Top Delegates* (
                  {delegatesCount ?? 0}).
                </span>
              </p>
              <p>
                {totalCount && totalCount > attestationAvgQuantity
                  ? 'More'
                  : 'Less'}{' '}
                than most other Governance Infrastructure & Tooling projects.
              </p>
              <p className="text-xs line-height-4 mt-2">
                *The top 100 delegates by voting power.
              </p>
            </>
          )}
          {!totalCount ||
            (totalCount === 0 && (
              <p>
                This project did not receive any attestations from{' '}
                <span className="font-semibold">
                  Citizens & Top 100 Delegates
                </span>
                .
              </p>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationRatingCard({ rating }: { rating?: number }) {
  const roundedRating = rating ? Number(rating.toFixed(1)) : 0;
  function getLikelihood(rating: number) {
    if (rating >= 8.34) return 'very likely';
    if (rating >= 6.67) return 'likely';
    if (rating >= 5) return 'somewhat likely';
    if (rating >= 3.34) return 'somewhat unlikely';
    if (rating >= 1.67) return 'unlikely';
    return 'very unlikely';
  }
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-8 pb-9">
        <ThumbRatingIcon rating={roundedRating} size={24} />
        <CardTitle className="text-xl">{roundedRating} out of 10</CardTitle>
        <div className="text-sm line-height-5">
          <p>
            <span className="font-semibold">Citizens & Top Delegates</span> are{' '}
            <span className="font-semibold">
              {getLikelihood(roundedRating)}
            </span>{' '}
            to recommend this tool.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MostPositiveCard() {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-8 pb-9">
        <AttStarIcon />
        <CardTitle className="text-xl">Most positive</CardTitle>
        <div className="text-sm line-height-5">
          <p>
            One of the most positively attested projects by{' '}
            <span className="font-semibold">Citizens.</span>
          </p>
          <AttestationSuperlativeDialog superlative="most_positive">
            <p className="text-xs line-height-4 mt-2 cursor-pointer">
              View methodology
            </p>
          </AttestationSuperlativeDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function CannotLiveWithoutCard() {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-8 pb-9">
        <AttStarIcon />
        <CardTitle className="text-xl">Can&apos;t live without</CardTitle>
        <div className="text-sm line-height-5">
          <p>
            One of the top projects that{' '}
            <span className="font-semibold">Citizens &amp; Top Delegates</span>{' '}
            can&apos;t live without.
          </p>
          <AttestationSuperlativeDialog superlative="cant_live_without">
            <p className="text-xs line-height-4 mt-2 cursor-pointer">
              View methodology
            </p>
          </AttestationSuperlativeDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function AttestationElectedGovernanceMembersCard({
  reviews,
}: {
  reviews?: ProjectImpactMetricsElectedGovernanceReviews;
}) {
  function getSentiment(pmf_score: number): Sentiment {
    if (pmf_score >= 4) return 'extremely_upset';
    if (pmf_score >= 3) return 'somewhat_upset';
    return 'neutral';
  }

  const attestations = useMemo(() => {
    const links: { [name: string]: string } = {
      anticapture_commission:
        'https://gov.optimism.io/t/season-6-anticapture-commission-amended/8132',
      code_of_conduct_council:
        'https://gov.optimism.io/t/final-code-of-conduct-council-cocc-operating-budget-for-season-6/8167',
      collective_feedback_commission:
        'https://gov.optimism.io/t/the-collective-feedback-commission-the-next-iteration/9113',
      developer_advisory_board:
        'https://gov.optimism.io/t/zach-obront-developer-advisory-board-operating-budget/8141',
      grants_council:
        'https://github.com/ethereum-optimism/OPerating-manual/blob/main/Grants%20Council%20Charter%20v0.1.md',
      security_council: 'https://gov.optimism.io/t/security-council-charter-v0-1/6884',
    };
    return reviews
      ? Object.entries(reviews).map(([name, review]) => ({
          name: name
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          count: review.count_attestations ?? 0,
          rating: review.avg_nps_score ?? 0,
          sentiment: getSentiment(review.avg_pmf_score ?? 0),
          url: links[name],
        }))
      : [];
  }, [reviews]);
  // const attestations: {
  //   name: string;
  //   count: number;
  //   rating: number;
  //   sentiment: Sentiment;
  // }[] = [
  //   {
  //     name: 'Anticapture Commision',
  //     count: 4,
  //     rating: 7.5,
  //     sentiment: 'extremely_upset',
  //   },
  //   {
  //     name: 'Code of Conduct Council',
  //     count: 1,
  //     rating: 10,
  //     sentiment: 'extremely_upset',
  //   },
  //   {
  //     name: 'Collective Feedback Commission',
  //     count: 1,
  //     rating: 6,
  //     sentiment: 'somewhat_upset',
  //   },
  //   {
  //     name: 'Developer Advisory Board',
  //     count: 4,
  //     rating: 2.5,
  //     sentiment: 'neutral',
  //   },
  //   { name: 'Grants Council', count: 2, rating: 7, sentiment: 'somewhat_upset' },
  //   {
  //     name: 'Security Council',
  //     count: 2,
  //     rating: 8.5,
  //     sentiment: 'extremely_upset',
  //   },
  // ];
  const totalCount = useMemo(
    () => attestations.reduce((acc, val) => acc + val.count, 0),
    [attestations]
  );

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-3 p-8 pb-9">
        <AttUserStarIcon />
        <CardTitle className="text-xl">
          {totalCount} attestations from elected governance members
        </CardTitle>
        <div className="text-sm flex flex-col">
          {attestations.map((attestation, i) => (
            <AttestationElectedGovernanceMembersListItem
              key={i}
              {...attestation}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttestationElectedGovernanceMembersListItem(params: {
  name: string;
  count: number;
  rating: number;
  sentiment: Sentiment;
  url: string;
}) {
  function renderSentiment(sentiment: Sentiment) {
    if (sentiment === 'extremely_upset')
      return (
        <>
          <p>Extremely upset</p>
          <Image
            src={SobFaceEmoji}
            alt="Sob face emoji"
            width={14}
            height={14}
          />
        </>
      );
    if (sentiment === 'somewhat_upset')
      return (
        <>
          <p>Somewhat upset</p>
          <Image
            src={FrowningFaceEmoji}
            alt="Frowning face emoji"
            width={14}
            height={14}
          />
        </>
      );
    if (sentiment === 'neutral')
      return (
        <>
          <p>Neutral</p>
          <Image
            src={NeutralFaceEmoji}
            alt="Neutral face emoji"
            width={14}
            height={14}
          />
        </>
      );
  }
  return (
    <div className="flex flex-row justify-between items-center gap-2 border-b border-[#E0E2EB] py-2">
      <Link href={params.url} target="_blank" passHref>
        <p>{params.name} ({params.count})</p>
      </Link>
      <div className="flex flex-row items-center justify-end gap-2">
        <div className="flex flex-row items-center gap-1">
          <ThumbRatingIcon rating={params.rating} />
          <p>
            {params.rating.toString().includes('.')
              ? params.rating.toFixed(1)
              : params.rating}{' '}
            out of 10
          </p>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-row items-center gap-1">
          {renderSentiment(params.sentiment)}
          <p>if ceased to exist</p>
        </div>
      </div>
    </div>
  );
}

type Sentiment = 'extremely_upset' | 'somewhat_upset' | 'neutral';

function AttestationChartCard({
  sentimentData,
  counts,
}: {
  sentimentData?: ProjectImpactMetricsPercentageDistributions;
  counts?: {
    citizens?: number;
    delegates?: number;
    total?: number;
  };
}) {
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'citizens' | 'delegates'
  >('all');

  const weights = useMemo(() => {
    const total = (counts?.citizens ?? 0) + (counts?.delegates ?? 0);
    return {
      citizens: counts?.citizens ? counts.citizens / total : 0,
      delegates: counts?.delegates ? counts.delegates / total : 0,
    };
  }, [counts]);

  const mostCommonSentiment = useMemo(() => {
    const combinedData = {
      extremely_upset:
        (sentimentData?.citizens?.extremely_upset ?? 0) * weights.citizens +
        (sentimentData?.top_delegates?.extremely_upset ?? 0) *
          weights.delegates,
      somewhat_upset:
        (sentimentData?.citizens?.somewhat_upset ?? 0) * weights.citizens +
        (sentimentData?.top_delegates?.somewhat_upset ?? 0) * weights.delegates,
      neutral:
        (sentimentData?.citizens?.neutral ?? 0) * weights.citizens +
        (sentimentData?.top_delegates?.neutral ?? 0) * weights.delegates,
    };
    const maxValue = Math.max(
      combinedData.extremely_upset,
      combinedData.somewhat_upset,
      combinedData.neutral
    );
    return Object.entries(combinedData).find(
      ([_, value]) => value === maxValue
    )?.[0] as Sentiment;
  }, [sentimentData]);

  const legendData = useMemo(() => {
    let total: number;
    switch (selectedTab) {
      // Change to weighted by citizen/delegate counts
      case 'all': {
        total =
          Object.values(sentimentData?.citizens ?? {}).reduce(
            (acc, val) => acc + val,
            0
          ) +
          Object.values(sentimentData?.top_delegates ?? {}).reduce(
            (acc, val) => acc + val,
            0
          );
        return {
          extremely_upset:
            ((sentimentData?.citizens?.extremely_upset ?? 0) *
              weights.citizens +
              (sentimentData?.top_delegates?.extremely_upset ?? 0) *
                weights.delegates) *
            100,
          somewhat_upset:
            ((sentimentData?.citizens?.somewhat_upset ?? 0) * weights.citizens +
              (sentimentData?.top_delegates?.somewhat_upset ?? 0) *
                weights.delegates) *
            100,
          neutral:
            ((sentimentData?.citizens?.neutral ?? 0) * weights.citizens +
              (sentimentData?.top_delegates?.neutral ?? 0) *
                weights.delegates) *
            100,
        };
      }
      case 'citizens':
        total = Object.values(sentimentData?.citizens ?? {}).reduce(
          (acc, val) => acc + val,
          0
        );
        return {
          extremely_upset:
            ((sentimentData?.citizens?.extremely_upset ?? 0) / total) * 100,
          somewhat_upset:
            ((sentimentData?.citizens?.somewhat_upset ?? 0) / total) * 100,
          neutral: ((sentimentData?.citizens?.neutral ?? 0) / total) * 100,
        };
      case 'delegates':
        total = Object.values(sentimentData?.top_delegates ?? {}).reduce(
          (acc, val) => acc + val,
          0
        );
        return {
          extremely_upset:
            ((sentimentData?.top_delegates?.extremely_upset ?? 0) / total) *
            100,
          somewhat_upset:
            ((sentimentData?.top_delegates?.somewhat_upset ?? 0) / total) * 100,
          neutral: ((sentimentData?.top_delegates?.neutral ?? 0) / total) * 100,
        };
    }
  }, [selectedTab, sentimentData]);

  const chartData = useMemo(() => {
    function getFill(sentiment: Sentiment) {
      switch (sentiment) {
        case 'extremely_upset':
          return '#3374DB';
        case 'somewhat_upset':
          return '#AAC9FD';
        case 'neutral':
          return '#D6E4FF';
      }
    }
    switch (selectedTab) {
      case 'all': {
        const citizens = Object.entries(sentimentData?.citizens ?? {}).map(
          ([sentiment, value]) => ({
            sentiment,
            value,
            fill: getFill(sentiment as Sentiment),
          })
        );
        const delegates = Object.entries(
          sentimentData?.top_delegates ?? {}
        ).map(([sentiment, value]) => ({
          sentiment,
          value,
          fill: getFill(sentiment as Sentiment),
        }));
        return citizens.map(({ sentiment, value, fill }) => {
          const delegateValue =
            delegates.find((d) => d.sentiment === sentiment)?.value ?? 0;
          return { sentiment, value: value + delegateValue, fill };
        });
      }
      case 'citizens':
        return Object.entries(sentimentData?.citizens ?? {}).map(
          ([sentiment, value]) => ({
            sentiment,
            value,
            fill: getFill(sentiment as Sentiment),
          })
        );
      case 'delegates':
        return Object.entries(sentimentData?.top_delegates ?? {}).map(
          ([sentiment, value]) => ({
            sentiment,
            value,
            fill: getFill(sentiment as Sentiment),
          })
        );
      default:
        return Object.entries(sentimentData?.citizens ?? {}).map(
          ([sentiment, value]) => ({
            sentiment,
            value,
            fill: getFill(sentiment as Sentiment),
          })
        );
    }
  }, [selectedTab, sentimentData]);

  const config = {
    ['extremely_upset']: {
      label: 'Extremely upset',
      color: '#3374DB',
    },
    ['somewhat_upset']: {
      label: 'Somewhat upset',
      color: '#AAC9FD',
    },
    ['neutral']: {
      label: 'Neutral',
      color: '#D6E4FF',
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-row gap-2 p-8 pb-9">
        <div className="flex flex-col gap-2">
          <SentimentHeader sentiment={mostCommonSentiment} />
          <Tabs
            defaultValue="all"
            onValueChange={(v) =>
              setSelectedTab(v as 'all' | 'citizens' | 'delegates')
            }
          >
            <TabsList defaultValue="all" className="bg-white gap-2">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="citizens"
                className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]"
                disabled={!counts?.citizens}
              >
                Citizens
              </TabsTrigger>
              <TabsTrigger
                value="delegates"
                className="data-[state=active]:bg-[#F2F3F8] border-transparent data-[state=active]:border-[#E0E2EB] border-[1px]"
                disabled={!counts?.delegates}
              >
                Top Delegates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
            <TabsContent value="citizens" className="mt-4">
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
            <TabsContent value="delegates" className="mt-4">
              <SentimentChartLegend legendData={legendData} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex items-center justify-center">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square min-h-[204px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                dataKey="value"
                nameKey="sentiment"
                data={chartData}
                innerRadius={60}
                className="border-w-1 border-white"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentHeader({ sentiment }: { sentiment: Sentiment }) {
  if (sentiment === 'extremely_upset')
    return (
      <>
        <Image src={SobFaceEmoji} alt="Sob face emoji" />
        <CardTitle className="text-xl">
          Most attestors would feel extremely upset if this contribution ceased
          to exist
        </CardTitle>
      </>
    );
  if (sentiment === 'somewhat_upset')
    return (
      <>
        <Image src={FrowningFaceEmoji} alt="Frowning face emoji" />
        <CardTitle className="text-xl">
          Most attestors would feel somewhat upset if this contribution ceased
          to exist
        </CardTitle>
      </>
    );
  if (sentiment === 'neutral')
    return (
      <>
        <Image src={NeutralFaceEmoji} alt="Neutral face emoji" />
        <CardTitle className="text-xl">
          Most attestors would feel neutral if this contribution ceased to exist
        </CardTitle>
      </>
    );
}

function SentimentChartLegend({
  legendData,
}: {
  legendData: Record<Sentiment, number>;
}) {
  return (
    <div className="text-sm line-height-5 flex flex-col gap-3">
      <div className="flex flex-row items-center gap-5">
        <div className="flex flex-row items-center">
          <div className="w-[14px] h-[14px] bg-[#3374DB] rounded-full" />
          <Image
            src={SobFaceEmoji}
            alt="Sob face emoji"
            width={14}
            height={14}
            className="absolute ml-2.5"
          />
        </div>
        <p>Extremely upset: {legendData.extremely_upset.toFixed(1)}%</p>
      </div>
      <div className="flex flex-row items-center gap-5">
        <div className="flex flex-row items-center">
          <div className="w-[14px] h-[14px] bg-[#AAC9FD] rounded-full" />
          <Image
            src={FrowningFaceEmoji}
            alt="Frowning face emoji"
            width={14}
            height={14}
            className="absolute ml-2.5"
          />
        </div>
        <p>Somewhat upset: {legendData.somewhat_upset.toFixed(1)}%</p>
      </div>
      <div className="flex flex-row items-center gap-5">
        <div className="flex flex-row items-center">
          <div className="w-[14px] h-[14px] bg-[#D6E4FF] rounded-full" />
          <Image
            src={NeutralFaceEmoji}
            alt="Neutral face emoji"
            width={14}
            height={14}
            className="absolute ml-2.5"
          />
        </div>
        <p>Neutral: {legendData.neutral.toFixed(1)}%</p>
      </div>
    </div>
  );
}
