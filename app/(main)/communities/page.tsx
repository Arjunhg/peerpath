"use client";

import AddLearningGoal from "@/components/communities/add-learning-goal";
import AIMatching from "@/components/communities/ai-matching";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AnimatedCard,
  AnimatedList,
  AnimatedListItem,
} from "@/components/ui/animated-wrappers";
import { CardSkeleton, GoalsSkeleton } from "@/components/ui/loading-skeletons";
import EmptyState from "@/components/ui/empty-state";
import { useCommunities, useCommunityGoals } from "@/hooks/use-communities";
// import { useCurrentUser } from "@/hooks/use-users";
import {
  LockIcon,
  UsersIcon,
  TargetIcon,
  SparklesIcon,
  BookOpenIcon,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "matches">("goals");
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );
  const {
    data: communities,
    isLoading: isLoadingCommunities,
  } = useCommunities();

  const {
    data: communityGoals,
    isLoading: isLoadingCommunityGoals,
  } = useCommunityGoals(selectedCommunity);

  useEffect(() => {
    if (communities && communities.length > 0 && !selectedCommunity) {
      startTransition(() => {
        setSelectedCommunity(communities[0].community.id);
      });
    }
  }, [communities?.length]);

  if (isLoadingCommunities) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <CardSkeleton />
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <AnimatedCard>
        <Card>
          <EmptyState
            icon={<UsersIcon className="size-6 text-muted-foreground" />}
            title="No communities yet"
            description="Join a community to start setting learning goals and finding study partners."
            action={
              <Button asChild>
                <a href="/communities/all">Browse Communities</a>
              </Button>
            }
          />
        </Card>
      </AnimatedCard>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Community Sidebar */}
      <AnimatedCard delay={0.1} hover={false}>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-4 text-primary" />
              Your Communities
            </CardTitle>
            <CardDescription>
              {communities?.length}{" "}
              {communities?.length === 1 ? "community" : "communities"} joined
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedList className="space-y-1.5">
              {communities?.map((c) => (
                <AnimatedListItem key={c.community.id}>
                  <Button
                    className="w-full justify-start transition-all duration-200"
                    onClick={() => setSelectedCommunity(c.community.id)}
                    variant={
                      selectedCommunity === c.community.id
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                  >
                    <span className="truncate">{c.community.name}</span>
                  </Button>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Content Area */}
      <AnimatedCard delay={0.2} hover={false} className="lg:col-span-2">
        <Card>
          <CardHeader>
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-4">
              {[
                { key: "goals" as const, label: "My Goals", icon: TargetIcon },
                {
                  key: "matches" as const,
                  label: "AI Matching",
                  icon: SparklesIcon,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-background rounded-md shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className="size-4" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            <CardTitle className="text-lg">
              {activeTab === "goals"
                ? "Learning Goals"
                : "Potential Learning Partners"}
            </CardTitle>
            <CardDescription>
              {activeTab === "goals"
                ? `${communityGoals?.length || 0} ${
                    communityGoals?.length === 1 ? "goal" : "goals"
                  } in selected community`
                : "Members with similar learning goals"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {activeTab === "goals" ? (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  {isLoadingCommunityGoals ? (
                    <GoalsSkeleton />
                  ) : communityGoals && communityGoals.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatedList className="space-y-3">
                        {communityGoals.map((c) => (
                          <AnimatedListItem key={c.id}>
                            <Card className="shadow-none border bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                              <CardHeader className="py-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                                    <BookOpenIcon className="size-3.5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-sm font-medium">
                                      {c.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 line-clamp-2">
                                      {c.description}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </AnimatedListItem>
                        ))}
                      </AnimatedList>
                      <AddLearningGoal
                        selectedCommunityId={selectedCommunity!}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <EmptyState
                        icon={
                          <TargetIcon className="size-5 text-muted-foreground" />
                        }
                        title="No goals yet"
                        description="Add your first learning goal to get started with AI matching."
                      />
                      <AddLearningGoal
                        selectedCommunityId={selectedCommunity!}
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="space-y-6">
                    <AIMatching
                      totalGoals={communityGoals?.length || 0}
                      selectedCommunityId={selectedCommunity!}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
}
