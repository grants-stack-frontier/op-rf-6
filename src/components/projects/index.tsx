"use client";
import { Project, ProjectGithubItemOneOf } from "@/__generated__/api/agora.schemas";
import { Heading } from "@/components/ui/headings";
import { CategoryType } from "@/data/categories";
import mixpanel from "@/lib/mixpanel";
import { CircleDollarSign, Clock3, GitFork, Github, Link2, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { AvatarCarousel } from "../common/avatar-carousel";
import { Mirror } from "../common/mirror";
import { Warpcast } from "../common/warpcast";
import { X } from "../common/x";
import { CustomAccordion } from "../custom-accordion";
import { Markdown } from "../markdown";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function getBadgeClassName(category: CategoryType | undefined): string {
	switch (category) {
		case CategoryType.ETHEREUM_CORE_CONTRIBUTIONS:
			return 'bg-blue-500/25 text-blue-600';
		case CategoryType.OP_STACK_RESEARCH_AND_DEVELOPMENT:
			return 'bg-purple-500/25 text-purple-600';
		case CategoryType.OP_STACK_TOOLING:
			return 'bg-orange-500/25 text-orange-600';
		default:
			return 'bg-blue-500/25 text-blue-600';
	}
}

export function ProjectDetails({ data, isPending }: { data?: Project; isPending: boolean }) {
	const { id, profileAvatarUrl, name, projectCoverImageUrl, description, socialLinks, category, github, links, grantsAndFunding, contracts, team } = data ?? {};
	const { twitter, farcaster, mirror, website } = socialLinks ?? {};
	return (
		<section className="space-y-16">
			<div className="space-y-6">
				{isPending ? (
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
						{projectCoverImageUrl && profileAvatarUrl ? (
							<div className="w-full h-56">
								<Image className="rounded-md" src={projectCoverImageUrl} alt={name || ''} width={720} height={180} />
								<Image className="rounded-md -mt-10 ml-6" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
							</div>
						) : profileAvatarUrl && (
							<div className="w-full">
								<Image className="rounded-md" src={profileAvatarUrl} alt={name || ''} width={80} height={80} />
							</div>
						)}
						<Heading variant="h2">{name}</Heading>
						<div className="flex items-center gap-2">
							<p className="font-medium">By</p>
							{profileAvatarUrl && (
								<Image className="rounded-full" src={profileAvatarUrl} alt={name || ''} width={30} height={30} />
							)}
							<p className="font-medium">{name}</p>
						</div>
						<Markdown className="dark:text-white line-clamp-3">{description}</Markdown>
						<div className="flex flex-wrap items-center gap-2">
							{website && (
								<Button
									variant="link"
									className="gap-1"
									onClick={() => mixpanel.track("Open Website", { external: true })}
									asChild
								>
									<Link2 className="-rotate-45 h-4 w-4" />
									<Link href={website[0]} target="_blank">
										{website[0]}
									</Link>
								</Button>
							)}
							{farcaster && (
								<Button
									variant="link"
									className="gap-1"
									onClick={() => mixpanel.track("Open Farcaster", { external: true })}
									asChild
								>
									<Warpcast />
									<Link href={farcaster[0]} target="_blank">
										{farcaster[0]}
									</Link>
								</Button>
							)}
							{twitter && (
								<Button
									variant="link"
									className="gap-1"
									onClick={() => mixpanel.track("Open Twitter", { external: true })}
									asChild
								>
									<X />
									<Link href={twitter} target="_blank">
										{twitter}
									</Link>
								</Button>
							)}
							{mirror && (
								<Button
									variant="link"
									className="gap-1"
									onClick={() => mixpanel.track("Open Mirror", { external: true })}
									asChild
								>
									<Mirror />
									<Link href={mirror} target="_blank">
										{mirror}
									</Link>
								</Button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={null}
								className={`cursor-pointer border-0 font-medium ${getBadgeClassName(category as CategoryType)}`}
							>
								{category?.replace(/_/g, ' ')}
							</Badge>
							<AvatarCarousel
								images={team?.map((member: any) => ({
									url: member.pfp_url,
									name: member.display_name
								})) ?? []}
							/>
						</div>
						<p className="font-medium">Repos, links and contracts</p>
						{github && (
							<>
								{
									github.map((repo: any, index: number) => {
										const typedRepo = repo as Record<string, ProjectGithubItemOneOf>;
										return (
											<CustomAccordion value={Object.keys(typedRepo)[0]} trigger={<div className="flex items-center gap-2"><Github className="h-4 w-4" />{Object.keys(typedRepo)[0]}</div>} key={index}>
												<div className="grid grid-cols-3 gap-2 p-2">
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<Clock3 className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].age_of_project_years} years old
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<User className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].fulltime_developer_average_6_months} full-time devs
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<User className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].new_contributor_count_6_months} contributors last 6 months
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<GitFork className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].fork_count} forks
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<GitFork className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].forked_by_top_devs} forks from top devs
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<Star className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].star_count} stars
													</div>
													<div className="bg-slate-100 p-2 rounded-md flex items-center gap-2">
														<Star className="h-4 w-4" /> {typedRepo[Object.keys(typedRepo)[0]].starred_by_top_devs} stars from top devs
													</div>
												</div>
											</CustomAccordion>
										)
									})
								}
							</>
						)}
						{links && (
							<>
								{
									links.map((link, index) => (
										<CustomAccordion value={link} trigger={<div className="flex items-center gap-2"><Link2 className="h-4 w-4 -rotate-45" />{link}</div>} key={index} />
									))
								}
							</>
						)}
						{contracts && (
							<>
								{
									contracts.map((contract, index) => (
										<CustomAccordion value={contract.address || ''} trigger={<div className="flex items-center gap-2"><Image src={Logo.src} alt="Logo" width={20} height={20} />{contract.address}</div>} key={index} />
									))
								}
							</>
						)}
						<p className="font-medium">Grants, funding and revenue (since Jan 2023)</p>
						{grantsAndFunding && (
							<>
								{
									grantsAndFunding.grants?.map(({ grant, amount, date, details, link }, index) => {
										const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
										return (
											<CustomAccordion
												value={grant || ''}
												trigger={
													<>
														<p className="text-ellipsis overflow-hidden">Grant: {grant}</p>
														<div className="flex items-center gap-2">
															<Link2 className="h-4 w-4 -rotate-45" /> <p className="text-ellipsis overflow-hidden">{link}</p>
														</div>
														<div className="flex items-center gap-2">
															<Image src={Logo.src} alt="Logo" width={20} height={20} />
															{formattedAmount} OP
														</div>
														<div className="flex items-center gap-2">
															<Clock3 className="h-4 w-4" />
															{date}
														</div>
													</>
												}
												key={index}>
												<div className="p-2">
													{details}
												</div>
											</CustomAccordion>
										);
									})
								}
								{
									grantsAndFunding.ventureFunding?.map(({ amount, details, year }, index) => {
										return (
											<CustomAccordion value={amount || ''} trigger={
												<>
													<span>Funding:</span>
													<div className="flex items-center gap-2">
														<CircleDollarSign className="h-4 w-4" /> <p>{amount || ''}</p>
													</div>
													<div className="flex items-center gap-2">
														<Clock3 className="h-4 w-4" /> <p>{year}</p>
													</div>
												</>
											} key={index}>
												<div className="p-2">
													{details}
												</div>
											</CustomAccordion>
										);
									})
								}
								{
									grantsAndFunding.revenue?.map(({ amount, details }, index) => {
										return (
											<CustomAccordion value={amount || ''} trigger={
												<>
													<span>Revenue:</span>
													<div className="flex items-center gap-2">
														<CircleDollarSign className="h-4 w-4" /> <p>{amount || ''}</p>
													</div>
												</>
											} key={index}>
												<div className="p-2">
													{details}
												</div>
											</CustomAccordion>
										);
									})
								}
							</>
						)}
					</>
				)}
			</div>
		</section>
	);
}