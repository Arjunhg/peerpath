"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import {
  StaggerGrid,
  StaggerGridItem,
} from "@/components/ui/animated-wrappers";
import {
  CommunityGridSkeleton,
} from "@/components/ui/loading-skeletons";
import EmptyState from "@/components/ui/empty-state";
import { ArrowLeftIcon, CheckIcon, LockIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import {
  useAllCommunities,
  useCommunities,
  useJoinCommunity,
} from "@/hooks/use-communities";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-users";
import { motion } from "framer-motion";

export default function AllCommunitiesPage() {
  const {
    data: allCommunities,
    isLoading: isLoadingAllCommunities,
    error: errorAllCommunities,
  } = useAllCommunities();

  const { data: user } = useCurrentUser();
  const isPro = user?.isPro;

  const { data: userCommunities } = useCommunities();
  const numberOfCommunities = userCommunities?.length || 0;

  const isJoined = (communityId: string) => {
    return userCommunities?.some(
      (community) => community.community.id === communityId
    );
  };

  const showLockIcon = numberOfCommunities >= 3 && !isPro;

  const joinCommunityMutation = useJoinCommunity();

  const handleJoinCommunity = async (communityId: string) => {
    await joinCommunityMutation.mutateAsync(communityId);
    toast.success("Joined community successfully");
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/communities">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeftIcon className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to My Communities
          </Button>
        </Link>
      </motion.div>

      <PageHeader
        title="Browse Communities"
        description="Discover and join communities that match your learning interests"
      />

      {isLoadingAllCommunities ? (
        <CommunityGridSkeleton />
      ) : errorAllCommunities ? (
        <EmptyState
          icon={<UsersIcon className="size-6 text-destructive" />}
          title="Something went wrong"
          description={errorAllCommunities.message}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : !allCommunities || allCommunities.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="size-6 text-muted-foreground" />}
          title="No communities available"
          description="Check back later for new communities to join."
        />
      ) : (
        <StaggerGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allCommunities.map((community) => {
            const joined = isJoined(community.id);
            return (
              <StaggerGridItem key={community.id}>
                <Card
                  className={`h-full flex flex-col transition-all duration-200 ${
                    joined
                      ? "border-primary/30 bg-primary/5"
                      : "hover:border-primary/20"
                  }`}
                >
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {community.name}
                      </CardTitle>
                      {joined && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 rounded-full bg-primary/10 p-1"
                        >
                          <CheckIcon className="size-3 text-primary" />
                        </motion.div>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {community.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button
                      className="w-full transition-all duration-200"
                      variant={joined ? "outline" : "default"}
                      disabled={joined || showLockIcon}
                      onClick={() => handleJoinCommunity(community.id)}
                    >
                      {showLockIcon && !joined && (
                        <LockIcon className="size-3.5 text-muted-foreground" />
                      )}
                      {joined ? (
                        <span className="flex items-center gap-2">
                          <CheckIcon className="size-4" /> Joined
                        </span>
                      ) : (
                        "Join Community"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </StaggerGridItem>
            );
          })}
        </StaggerGrid>
      )}
    </div>
  );
}