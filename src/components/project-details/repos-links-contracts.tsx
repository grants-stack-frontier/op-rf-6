import {
  RiGitForkFill,
  RiGithubFill,
  RiLink,
  RiStarFill,
  RiTimeFill,
  RiUserFill,
  RiUserStarFill,
} from '@remixicon/react';
import Image from 'next/image';
import Link from 'next/link';
import { base, fraxtal, mode, optimism, zora } from 'viem/chains';

import {
  ProjectContractsItem,
  ProjectGithubItem,
  ProjectGithubItemOneOf,
} from '@/__generated__/api/agora.schemas';
import { formatProjectAge } from '@/lib/projectUtils';

import Logo from '../../../public/logo.png';
import { CustomAccordion } from '../common/custom-accordion';
import { Card, CardContent } from '../ui/card';
import { Heading } from '../ui/headings';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReposLinksContractsProps {
  github?: ProjectGithubItem[];
  links?: string[];
  contracts?: ProjectContractsItem[];
}

export function ReposLinksContracts({
  github,
  links,
  contracts,
}: ReposLinksContractsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (
    (!github ||
      github.length === 0 ||
      (github.length === 1 && github[0] === '')) &&
    (!links || links.length === 0) &&
    (!contracts || contracts.length === 0)
  )
    return null;

  const totalItems =
    (github?.length ?? 0) + (links?.length ?? 0) + (contracts?.length ?? 0);
  if (totalItems > 5) {
    const allItems = [
      ...(github?.map((repo, i) => ({
        type: 'github',
        item: repo,
        index: i,
      })) ?? []),
      ...(links?.map((link, i) => ({ type: 'link', item: link, index: i })) ??
        []),
      ...(contracts?.map((contract, i) => ({
        type: 'contract',
        item: contract,
        index: i,
      })) ?? []),
    ];
    return (
      <div className="flex flex-col gap-2">
        <Heading className="text-sm font-medium leading-5" variant="h1">
          Repos, links and contracts
        </Heading>
        {allItems.slice(0, isExpanded ? allItems.length : 5).map((item) => {
          if (item.type === 'github')
            return (
              <GithubItem
                key={item.index}
                repo={item.item as ProjectGithubItem}
                index={item.index}
              />
            );
          if (item.type === 'link')
            return (
              <LinkItem
                key={item.index}
                link={
                  item.item as
                    | string
                    | { name: string; url: string; description: string }
                }
                index={item.index}
              />
            );
          if (item.type === 'contract')
            return (
              <ContractItem
                key={item.index}
                contract={item.item as ProjectContractsItem}
                index={item.index}
              />
            );
        })}
        {totalItems > 5 && (
          <div>
            <Button
              variant="ghost"
              className="mt-2 p-0 w-max-content h-auto font-normal"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  View less <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  View more <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Repos, links and contracts
      </Heading>
      {github?.map((repo, index) => {
        return <GithubItem repo={repo} index={index} key={index} />;
      })}
      {links?.map((link, index) => {
        return <LinkItem link={link} index={index} key={index} />;
      })}
      {contracts?.map((contract, index) => {
        return <ContractItem contract={contract} index={index} key={index} />;
      })}
    </div>
  );
}

function GithubItem({
  repo,
  index,
}: {
  repo: ProjectGithubItem;
  index: number;
}) {
  if (typeof repo === 'string') {
    return (
      <Card className="shadow-none" key={index}>
        <CardContent className="px-2.5 py-3">
          <div className="flex items-center gap-2">
            <RiGithubFill className="h-5 w-5" />
            <Link
              className="text-sm font-medium leading-5 hover:underline"
              href={repo}
              target="_blank"
            >
              {repo}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  const typedRepo = repo as {
    name: string;
    url: string;
    description: string;
    metrics: ProjectGithubItemOneOf;
  };
  const {
    age_of_project_years,
    num_contributors,
    num_trusted_contributors,
    num_contributors_last_6_months,
    num_forks,
    num_trusted_forks,
    num_stars,
    num_trusted_stars,
  } = typedRepo.metrics ?? {};

  return (
    <CustomAccordion
      key={index}
      value={`githubMetrics-${index}`}
      trigger={
        <div className="flex items-center gap-2">
          <RiGithubFill className="h-5 w-5" />
          <Link
            className="text-sm font-medium leading-5 hover:underline"
            href={typedRepo.url}
            target="_blank"
          >
            {typedRepo.name || typedRepo.url}
          </Link>
        </div>
      }
    >
      {typedRepo.description && (
        <div className="p-2">{typedRepo.description ?? 'No description'}</div>
      )}
      {typedRepo.metrics && (
        <div className="grid grid-cols-3 gap-2 p-2">
          {age_of_project_years !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiTimeFill className="h-4 w-4" />{' '}
              <span>
                {formatProjectAge(Number(age_of_project_years) ?? 0)} old
              </span>
            </div>
          )}
          {num_contributors !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiUserFill className="h-4 w-4" />{' '}
              <span>
                {Number(num_contributors).toLocaleString()} contributors
              </span>
            </div>
          )}
          {num_trusted_contributors !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiUserStarFill className="h-4 w-4" />{' '}
              <span>
                {Number(num_trusted_contributors).toLocaleString()} trusted
                contributors
              </span>
            </div>
          )}
          {num_contributors_last_6_months !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiUserFill className="h-4 w-4" />{' '}
              <span>
                {Number(num_contributors_last_6_months).toLocaleString()}{' '}
                contributors last 6 months
              </span>
            </div>
          )}
          {num_forks !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiGitForkFill className="h-4 w-4" />{' '}
              <span>{Number(num_forks).toLocaleString()} forks</span>
            </div>
          )}
          {num_trusted_forks !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiGitForkFill className="h-4 w-4" />{' '}
              <span>
                {Number(num_trusted_forks).toLocaleString()} trusted forks
              </span>
            </div>
          )}
          {num_stars !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiStarFill className="h-4 w-4" />{' '}
              <span>{Number(num_stars).toLocaleString()} stars</span>
            </div>
          )}
          {num_trusted_stars !== undefined && (
            <div className="bg-secondary p-2 rounded-md flex items-center gap-2">
              <RiStarFill className="h-4 w-4" />{' '}
              <span>
                {Number(num_trusted_stars).toLocaleString()} trusted stars
              </span>
            </div>
          )}
        </div>
      )}
    </CustomAccordion>
  );
}

function LinkItem({
  link,
  index,
}: {
  link: string | { name: string; url: string; description: string };
  index: number;
}) {
  if (typeof link === 'string') {
    return (
      <Card className="shadow-none" key={index}>
        <CardContent className="px-2.5 py-3">
          <div className="flex items-center gap-2">
            <RiLink className="h-5 w-5" />
            <Link
              className="text-sm font-medium leading-5 hover:underline"
              href={link}
              target="_blank"
            >
              {link}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  const typedLink = link as {
    name: string;
    url: string;
    description: string;
  };
  return (
    <CustomAccordion
      key={index}
      value={typedLink.name ?? ''}
      trigger={
        <div className="flex items-center gap-2">
          <RiLink className="h-5 w-5" />
          <Link
            className="text-sm font-medium leading-5 hover:underline"
            href={typedLink.url}
            target="_blank"
          >
            {typedLink.name || typedLink.url}
          </Link>
        </div>
      }
    >
      {typedLink.description && (
        <div className="p-2">{typedLink.description ?? 'No description'}</div>
      )}
    </CustomAccordion>
  );
}

function ContractItem({
  contract,
  index,
}: {
  contract: ProjectContractsItem;
  index: number;
}) {
  const { address, chainId } = contract;
  const chain = [optimism, base, mode, zora, fraxtal].find(
    (c) => c.id === Number(chainId)
  );
  const { name, blockExplorers } = chain ?? {};
  const { url } = blockExplorers?.default ?? {};
  const icon = `https://icons.llamao.fi/icons/chains/rsz_${
    name === 'Mode Mainnet' ? 'mode' : name?.toLowerCase()
  }.jpg`;
  return (
    <Card className="shadow-none" key={index}>
      <CardContent className="px-2.5 py-3">
        <div className="flex items-center gap-2">
          <Image
            className="rounded-full flex-shrink-0 flex relative"
            alt={chain?.name + 'Logo'}
            src={icon || Logo.src}
            width={20}
            height={20}
          />
          <Link
            className="text-sm font-medium leading-5 hover:underline"
            href={address && url ? `${url}/address/${address}` : '#'}
            target="_blank"
          >
            {address ?? 'No address'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
