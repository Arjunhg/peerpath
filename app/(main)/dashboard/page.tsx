"use client";

import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import PageHeader from "@/components/ui/page-header";
import {
  AnimatedCard,
  AnimatedList,
  AnimatedListItem,
  StaggerGrid,
  StaggerGridItem,
} from "@/components/ui/animated-wrappers";
import { DashboardSkeleton } from "@/components/ui/loading-skeletons";
import EmptyState from "@/components/ui/empty-state";
import CopilotPanel from "@/components/tambo/copilot-panel";
import { useMatches } from "@/hooks/use-ai-partner";
import { client } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  MessageCircleIcon,
  UsersIcon,
  SparklesIcon,
  ArrowRightIcon,
  TargetIcon,
  ZapIcon,
  InboxIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const user = useUser();
  const {
    data: userCommunities,
    isLoading: isLoadingUserCommunities,
    error: errorUserCommunities,
  } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await client.api.communities.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch communities");
      }
      return res.json();
    },
  });

  const { data: allMatches } = useQuery({
    queryKey: ["allMatches"],
    queryFn: async () => {
      const res = await client.api.matches["allmatches"].$get();
      if (!res.ok) {
        throw new Error("Failed to fetch pending matches");
      }
      return res.json();
    },
  });

  const pendingMatchesData = allMatches?.filter(
    (match) => match.status === "pending"
  );
  const activeMatchesData = allMatches?.filter(
    (match) => match.status === "accepted"
  );

  const { data: learningGoals } = useQuery({
    queryKey: ["communityGoals"],
    queryFn: async () => {
      const res = await client.api.communities.goals.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch learning goals");
      }
      return res.json();
    },
    enabled: !!userCommunities?.length,
  });

  const {
    data: matches,
    isLoading: isLoadingMatches,
  } = useMatches();

  if (isLoadingUserCommunities) return <DashboardSkeleton />;
  if (errorUserCommunities)
    return (
      <EmptyState
        icon={<ZapIcon className="size-6 text-destructive" />}
        title="Failed to load dashboard"
        description={errorUserCommunities.message}
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );

  const pendingCount = pendingMatchesData?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${user?.user?.firstName || "User"}`}
        description="Here's what's happening with your learning journey"
      />

      {/* Pending Matches Banner */}
      {pendingCount > 0 && (
        <AnimatedCard delay={0.15} hover={false}>
          <Card className="border-primary/30 bg-linear-to-r from-primary/5 via-primary/3 to-transparent overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <motion.div
                  className="rounded-full bg-primary/10 p-2.5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <SparklesIcon className="size-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="text-lg">
                    {pendingCount} new{" "}
                    {pendingCount === 1 ? "match" : "matches"} waiting!
                  </CardTitle>
                  <CardDescription className="mb-0">
                    Review and accept your matches to start chatting
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button size="sm" className="group gap-2">
                  Review Matches
                  <ArrowRightIcon className="size-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* Stats Grid */}
      <StaggerGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StaggerGridItem>
          <StatsCard
            title="Communities"
            value={userCommunities?.length || 0}
            icon={<UsersIcon className="size-4" />}
          />
        </StaggerGridItem>
        <StaggerGridItem>
          <StatsCard
            title="Learning Goals"
            value={learningGoals?.length || 0}
            icon={<TargetIcon className="size-4" />}
          />
        </StaggerGridItem>
        <StaggerGridItem>
          <StatsCard
            title="Active Partners"
            value={activeMatchesData?.length || 0}
            icon={<ZapIcon className="size-4" />}
          />
        </StaggerGridItem>
        <StaggerGridItem>
          <StatsCard
            title="Pending Matches"
            value={pendingMatchesData?.length || 0}
            icon={<InboxIcon className="size-4" />}
          />
        </StaggerGridItem>
      </StaggerGrid>

      <AnimatedCard delay={0.26} hover={false}>
        <CopilotPanel
          contextKey="dashboard"
          title="Dashboard Copilot"
          description="Ask for progress snapshots, momentum insights, and practical next steps."
          hint="The copilot calls local dashboard tools and renders structured UI cards instead of plain text."
          starterPrompts={[
            "Show my learning momentum this week",
            "What should I do next to get more matches?",
          ]}
          placeholder="Ask about your dashboard progress..."
        />
      </AnimatedCard>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Chats */}
        <AnimatedCard delay={0.3} hover={false}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircleIcon className="size-4 text-primary" />
                  Recent Chats
                </CardTitle>
                <Link href="/chat">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    View All
                    <ArrowRightIcon className="size-3" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Conversations you&apos;re part of
              </CardDescription>
            </CardHeader>

            <CardContent>
              {matches && matches.length > 0 ? (
                <AnimatedList className="flex flex-col gap-2">
                  {matches.map((match) => (
                    <AnimatedListItem key={match.id}>
                      <Link href={`/chat/${match.id}`}>
                        <Card className="shadow-none border bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group">
                          <CardHeader className="py-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={match.partner.name}
                                imageUrl={
                                  match.partner.imageUrl ?? undefined
                                }
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-200">
                                  {match.partner.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 truncate">
                                  {match.userGoals
                                    .map((g) => g.title)
                                    .join(", ")}
                                </CardDescription>
                              </div>
                              <ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              ) : (
                <EmptyState
                  icon={
                    <MessageCircleIcon className="size-5 text-muted-foreground" />
                  }
                  title="No chats yet"
                  description="Find AI-matched partners to start conversations."
                />
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Communities */}
        <AnimatedCard delay={0.4} hover={false}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UsersIcon className="size-4 text-primary" />
                  Communities
                </CardTitle>
                <Link href="/communities">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    Manage
                    <ArrowRightIcon className="size-3" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Communities you&apos;re part of
              </CardDescription>
            </CardHeader>

            <CardContent>
              {userCommunities && userCommunities.length > 0 ? (
                <AnimatedList className="space-y-2">
                  {userCommunities.map((community) => (
                    <AnimatedListItem key={community.id}>
                      {/* <Link href={`/communities/${community.id}`}> */}
                        <Card className="shadow-none border bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-200">
                                  {community.community.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 truncate">
                                  {community.community.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      {/* </Link> */}
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              ) : (
                <EmptyState
                  icon={
                    <UsersIcon className="size-5 text-muted-foreground" />
                  }
                  title="No communities yet"
                  description="Join a community to start your learning journey."
                  action={
                    <Link href="/communities/all">
                      <Button size="sm" variant="outline">
                        Browse Communities
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
