"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { CardSkeleton, StatsGridSkeleton } from "@/components/ui/loading-skeletons";
import EmptyState from "@/components/ui/empty-state";
import { useAcceptMatch, useMatches } from "@/hooks/use-ai-partner";
import { useRouter } from "next/navigation";
import {
  MessageCircleIcon,
  InboxIcon,
  ArrowRightIcon,
  Loader2Icon,
  SparklesIcon,
  UserCheckIcon,
  ZapIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const {
    data: matches,
    isLoading: isLoadingMatches,
    error: errorMatches,
  } = useMatches();

  const router = useRouter();
  const acceptMatchMutation = useAcceptMatch();

  if (isLoadingMatches) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <StatsGridSkeleton count={3} />
        <CardSkeleton />
      </div>
    );
  }

  if (errorMatches) {
    return (
      <EmptyState
        icon={<ZapIcon className="size-6 text-destructive" />}
        title="Failed to load conversations"
        description={errorMatches.message}
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  const acceptedMatches = matches?.filter(
    (match) => match.status === "accepted"
  );
  const pendingMatches = matches?.filter((match) => match.status === "pending");
  const pendingMatchesToShow = pendingMatches || [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Conversations"
        description="Manage your matches and chat with learning partners"
      />

      {/* Pending Matches Section */}
      {pendingMatchesToShow.length > 0 && (
        <section className="space-y-4">
          <AnimatedCard delay={0.1} hover={false}>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1.5">
                <InboxIcon className="size-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Pending Matches</h3>
              <Badge variant="secondary" className="ml-1">
                {pendingMatchesToShow.length}
              </Badge>
            </div>
          </AnimatedCard>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
            <StaggerGrid className="flex gap-4">
              {pendingMatchesToShow.map((match) => {
                const partner = {
                  id: match.partner.id || "",
                  name: match.partner.name || "Partner",
                  imageUrl: match.partner.imageUrl ?? undefined,
                };
                return (
                  <StaggerGridItem key={match.id} className="snap-start">
                    <Card className="flex flex-col max-h-120 w-80 min-w-80 overflow-hidden border-primary/10 hover:border-primary/25 transition-colors duration-300">
                      <CardHeader className="shrink-0 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserAvatar
                              name={partner.name}
                              imageUrl={partner.imageUrl}
                            />
                            <motion.div
                              className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-400 p-0.5"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut",
                              }}
                            >
                              <SparklesIcon className="size-2.5 text-white" />
                            </motion.div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {partner.name}
                            </CardTitle>
                            {match.community && (
                              <CardDescription className="text-xs truncate mt-0.5 mb-0">
                                {match.community.name}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col flex-1 space-y-3 min-h-0 overflow-hidden pt-0">
                        <div className="flex-1 overflow-y-auto pr-1">
                          {match.partnerGoals &&
                            match.partnerGoals.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                  Their Learning Goals
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {match.partnerGoals.map((g) => (
                                    <Badge
                                      key={g.id}
                                      variant="secondary"
                                      className="text-xs font-normal"
                                    >
                                      {g.title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button
                            className="w-full shrink-0 gap-2 group"
                            onClick={() =>
                              acceptMatchMutation.mutate(match.id)
                            }
                            disabled={acceptMatchMutation.isPending}
                          >
                            {acceptMatchMutation.isPending ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <UserCheckIcon className="size-4 group-hover:scale-110 transition-transform duration-200" />
                            )}
                            {acceptMatchMutation.isPending
                              ? "Accepting..."
                              : "Accept & Chat"}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </StaggerGridItem>
                );
              })}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* Active Chats Section */}
      <section className="space-y-4">
        <AnimatedCard
          delay={pendingMatchesToShow.length > 0 ? 0.3 : 0.1}
          hover={false}
        >
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <MessageCircleIcon className="size-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Active Chats</h3>
            {acceptedMatches && acceptedMatches.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {acceptedMatches.length}
              </Badge>
            )}
          </div>
        </AnimatedCard>

        {acceptedMatches && acceptedMatches.length > 0 ? (
          <AnimatedList className="flex flex-col gap-2">
            {acceptedMatches.map((match) => {
              const partner = {
                id: match.partner.id || "",
                name: match.partner.name || "Partner",
                imageUrl: match.partner.imageUrl ?? undefined,
              };
              return (
                <AnimatedListItem key={match.id}>
                  <Card
                    className="cursor-pointer border hover:border-primary/20 hover:bg-muted/40 transition-all duration-200 group shadow-none"
                    onClick={() => router.push(`/chat/${match.id}`)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="relative">
                        <UserAvatar
                          name={partner.name}
                          imageUrl={partner.imageUrl}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors duration-200 truncate">
                            {match.partner.name}
                          </CardTitle>
                          {match.community && (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 hidden sm:inline-flex"
                            >
                              {match.community.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {match.userGoals &&
                            match.userGoals.length > 0 && (
                              <span className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">You:</span>{" "}
                                {match.userGoals
                                  .map((g) => g.title)
                                  .join(", ")}
                              </span>
                            )}
                          {match.partnerGoals &&
                            match.partnerGoals.length > 0 && (
                              <span className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">Them:</span>{" "}
                                {match.partnerGoals
                                  .map((g) => g.title)
                                  .join(", ")}
                              </span>
                            )}
                        </div>
                      </div>

                      <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                    </CardContent>
                  </Card>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        ) : (
          <AnimatedCard delay={0.2} hover={false}>
            <Card>
              <EmptyState
                icon={
                  <MessageCircleIcon className="size-6 text-muted-foreground" />
                }
                title="No active chats yet"
                description="Accept a pending match above to start chatting with a learning partner."
              />
            </Card>
          </AnimatedCard>
        )}
      </section>
    </div>
  );
}