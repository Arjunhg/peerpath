"use client";

import {
  defineTool,
  useTamboComponentState,
  withInteractable,
  type TamboComponent,
} from "@tambo-ai/react";
import { z } from "zod/v4";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, CircleIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type CommunitySummary = {
  id: string;
  name: string;
  description?: string | null;
};

type CommunityMembershipResponse = {
  community: CommunitySummary;
}[];

type LearningGoalResponse = {
  id: string;
  title: string;
  description?: string | null;
  communityId: string;
}[];

type MatchGoal = {
  id: string;
  title: string;
  description?: string | null;
};

type MatchResponse = {
  id: string;
  communityId: string;
  status: "pending" | "accepted" | "rejected";
  partner: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  community: CommunitySummary | null;
  partnerGoals: MatchGoal[];
  userGoals: MatchGoal[];
}[];

type ConversationSummaryResponse = {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string[];
} | null;

export type TamboToolScope = {
  communityId?: string | null;
  conversationId?: string | null;
};

const noInputSchema = z.object({});

const dashboardStatSchema = z.object({
  label: z.string().optional().default(""),
  value: z.number().optional().default(0),
});


const dashboardSnapshotSchema = z.object({
  communitiesCount: z.number().optional().default(0),
  goalsCount: z.number().optional().default(0),
  activeMatches: z.number().optional().default(0),
  pendingMatches: z.number().optional().default(0),
  highlights: z.array(z.string()).optional().default([]),
});



const findPartnersInputSchema = z.object({
  communityId: z.string().optional(),
  runMatch: z.boolean().optional(),
});

const pendingPartnerSchema = z.object({
  matchId: z.string(),
  partnerName: z.string(),
  sharedGoals: z.array(z.string()),
});

const acceptedPartnerSchema = z.object({
  matchId: z.string(),
  partnerName: z.string(),
});

const findPartnersOutputSchema = z.object({
  communityId: z.string().optional().default(""),
  createdMatches: z.number().optional().default(0),
  pending: z.array(pendingPartnerSchema).optional().default([]),
  accepted: z.array(acceptedPartnerSchema).optional().default([]),
});

const conversationInputSchema = z.object({
  conversationId: z.string().optional().default(""),
  refresh: z.boolean().optional().default(false),
});

const conversationOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

const dashboardInsightsCardPropsSchema = z.object({
  title: z.string().optional().default(""),
  overview: z.string().optional().default(""),
  stats: z.array(dashboardStatSchema).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
});

type DashboardInsightsCardProps = z.infer<typeof dashboardInsightsCardPropsSchema>;

function DashboardInsightsCard({
  title,
  overview,
  stats = [],
  highlights = [],
}: DashboardInsightsCardProps) {
  return (
    <Card className="border-primary/25 bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SparklesIcon className="size-4 text-primary" />
          {title}
        </CardTitle>
        {overview ? <CardDescription>{overview}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border bg-background p-2">
              <p className="mb-1 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mb-0 text-lg font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {highlights.length > 0 ? (
          <div className="space-y-2">
            <p className="mb-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Highlights
            </p>
            <ul className="space-y-1">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const partnerRecommendationsPropsSchema = z.object({
  communityId: z.string().optional().default(""),
  createdMatches: z.number().optional().default(0),
  pending: z.array(pendingPartnerSchema).optional().default([]),
  accepted: z.array(acceptedPartnerSchema).optional().default([]),
});



type PartnerRecommendationsListProps = z.infer<
  typeof partnerRecommendationsPropsSchema
>;

function PartnerRecommendationsList({
  communityId,
  createdMatches,
  pending,
  accepted,
}: PartnerRecommendationsListProps) {
  return (
    <Card className="border-primary/25 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">Partner Recommendations</CardTitle>
        <CardDescription>
          {createdMatches} new match{createdMatches === 1 ? "" : "es"} created
          {communityId ? ` for community ${communityId}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pending.length > 0 ? (
          <div className="space-y-2">
            <p className="mb-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending
            </p>
            {pending.map((match) => (
              <div key={match.matchId} className="rounded-md border bg-background p-3">
                <p className="mb-1 text-sm font-medium">{match.partnerName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {match.sharedGoals.length > 0 ? (
                    match.sharedGoals.map((goal) => (
                      <Badge key={`${match.matchId}-${goal}`} variant="secondary" className="text-[10px]">
                        {goal}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No shared goals captured yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {accepted.length > 0 ? (
          <div className="space-y-2">
            <p className="mb-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active
            </p>
            <div className="flex flex-wrap gap-2">
              {accepted.map((match) => (
                <Link key={match.matchId} href={`/chat/${match.matchId}`}>
                  <Button size="xs" variant="outline">
                    {match.partnerName}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const conversationSummaryPropsSchema = z.object({
  summary: z.string().optional().default(""),
  keyPoints: z.array(z.string()).optional().default([]),
  nextSteps: z.array(z.string()).optional().default([]),
});


type ConversationSummaryCardProps = z.infer<typeof conversationSummaryPropsSchema>;

function ConversationSummaryCard({
  summary,
  keyPoints,
  nextSteps,
}: ConversationSummaryCardProps) {
  return (
    <Card className="border-primary/25 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">Conversation Coaching</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keyPoints.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Key Points
            </p>
            <ul className="space-y-1">
              {keyPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {nextSteps.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next Steps
            </p>
            <ul className="space-y-1">
              {nextSteps.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const actionChecklistPropsSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.string()).optional().default([]),
});

const actionChecklistStateSchema = z.object({
  checkedItems: z.array(z.string()).optional(),
});

type ActionChecklistProps = z.infer<typeof actionChecklistPropsSchema>;

function ActionChecklistBase({ title, items = [] }: ActionChecklistProps) {
  const defaultState = useMemo<string[]>(() => [], []);

  const [checkedItems, setCheckedItems] = useTamboComponentState<string[]>(
    "checkedItems",
    defaultState,
    defaultState
  );

  return (
    <Card className="border-primary/25 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">{title ?? "Action Checklist"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const isDone = (checkedItems ?? []).includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() =>
                setCheckedItems(
                  isDone
                    ? (checkedItems ?? []).filter((i) => i !== item)
                    : [...(checkedItems ?? []), item]
                )
              }
              className="flex w-full items-start gap-2 rounded-md border bg-background px-3 py-2 text-left"
            >
              {isDone ? (
                <CheckIcon className="mt-0.5 size-4 text-primary" />
              ) : (
                <CircleIcon className="mt-0.5 size-4 text-muted-foreground" />
              )}
              <span className={isDone ? "text-sm line-through text-muted-foreground" : "text-sm"}>
                {item}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

const ActionChecklist = withInteractable(ActionChecklistBase, {
  componentName: "ActionChecklist",
  description:
    "Interactive checklist for action items from a learning conversation. Click items to mark progress.",
  propsSchema: actionChecklistPropsSchema,
  stateSchema: actionChecklistStateSchema,
});

export const peerPathTamboComponents: TamboComponent[] = [
  {
    name: "DashboardInsightsCard",
    description:
      "Use when user asks for dashboard stats, momentum, highlights, or recommended next actions.",
    component: DashboardInsightsCard,
    propsSchema: dashboardInsightsCardPropsSchema,
  },
  {
    name: "PartnerRecommendationsList",
    description:
      "Use when user asks to find partners, explain matches, or review pending/accepted recommendations.",
    component: PartnerRecommendationsList,
    propsSchema: partnerRecommendationsPropsSchema,
  },
  {
    name: "ConversationSummaryCard",
    description:
      "Use when user asks for a structured summary, key points, or next learning steps for a conversation.",
    component: ConversationSummaryCard,
    propsSchema: conversationSummaryPropsSchema,
  },
  {
    name: "ActionChecklist",
    description:
      "Use to present actionable tasks from a conversation. This checklist supports interaction and progress tracking.",
    component: ActionChecklist,
    propsSchema: actionChecklistPropsSchema,
  },
];

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed for ${path}`;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.error ?? payload.message ?? message;
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function createHighlights(
  communityCount: number,
  goalCount: number,
  activeCount: number,
  pendingCount: number
): string[] {
  const highlights: string[] = [];

  if (communityCount === 0) {
    highlights.push("Join at least one community to start receiving AI partner recommendations.");
  } else {
    highlights.push(`You are active in ${communityCount} learning communit${communityCount === 1 ? "y" : "ies"}.`);
  }

  if (goalCount === 0) {
    highlights.push("Add your first learning goal so matching can reason about your intent.");
  } else {
    highlights.push(`You currently track ${goalCount} learning goal${goalCount === 1 ? "" : "s"}.`);
  }

  if (pendingCount > 0) {
    highlights.push(`You have ${pendingCount} pending match${pendingCount === 1 ? "" : "es"} waiting for review.`);
  }

  if (activeCount > 0) {
    highlights.push(`You have ${activeCount} active learning partner${activeCount === 1 ? "" : "s"}.`);
  }

  return highlights;
}

export function createPeerPathTamboTools(scope?: TamboToolScope) {
  return [
    defineTool({
      name: "get_dashboard_snapshot",
      description:
        "Fetches dashboard metrics and highlights for communities, goals, and matches. Use this before rendering DashboardInsightsCard.",
      inputSchema: noInputSchema,
      outputSchema: dashboardSnapshotSchema,
      tool: async () => {
        const [communities, goals, matches] = await Promise.all([
          requestJson<CommunityMembershipResponse>("/api/communities"),
          requestJson<LearningGoalResponse>("/api/communities/goals"),
          requestJson<MatchResponse>("/api/matches/allmatches"),
        ]);

        const activeMatches = matches.filter((match) => match.status === "accepted").length;
        const pendingMatches = matches.filter((match) => match.status === "pending").length;

        return {
          communitiesCount: communities.length,
          goalsCount: goals.length,
          activeMatches,
          pendingMatches,
          highlights: createHighlights(
            communities.length,
            goals.length,
            activeMatches,
            pendingMatches
          ),
        };
      },
    }),
    defineTool({
      name: "find_partners_for_community",
      description:
        "Finds or refreshes partner recommendations for a community and returns pending/accepted matches with shared goals. Use for PartnerRecommendationsList.",
      inputSchema: findPartnersInputSchema,
      outputSchema: findPartnersOutputSchema,
      tool: async (input) => {
        const communityId = input.communityId ?? scope?.communityId ?? "";
        if (!communityId) {
          throw new Error("Community ID is required to find partners.");
        }

        let createdMatches = 0;
        if (input.runMatch ?? true) {
          const response = await requestJson<{ matched: number }>(
            `/api/matches/${communityId}/aimatch`,
            {
              method: "POST",
            }
          );
          createdMatches = response.matched ?? 0;
        }

        const matches = await requestJson<MatchResponse>("/api/matches/allmatches");
        const scopedMatches = matches.filter((match) => match.communityId === communityId);

        const pending = scopedMatches
          .filter((match) => match.status === "pending")
          .map((match) => {
            const userGoalTitles = new Set(
              match.userGoals.map((goal) => goal.title.trim().toLowerCase())
            );
            const sharedGoals = match.partnerGoals
              .filter((goal) => userGoalTitles.has(goal.title.trim().toLowerCase()))
              .map((goal) => goal.title);

            return {
              matchId: match.id,
              partnerName: match.partner.name,
              sharedGoals,
            };
          });

        const accepted = scopedMatches
          .filter((match) => match.status === "accepted")
          .map((match) => ({
            matchId: match.id,
            partnerName: match.partner.name,
          }));

        return {
          communityId,
          createdMatches,
          pending,
          accepted,
        };
      },
    }),
    defineTool({
      name: "get_conversation_coaching",
      description:
        "Gets a structured learning summary for a conversation, optionally refreshing AI analysis first. Use for ConversationSummaryCard and ActionChecklist.",
      inputSchema: conversationInputSchema,
      outputSchema: conversationOutputSchema,
      tool: async (input) => {
        const conversationId = input.conversationId ?? scope?.conversationId ?? "";
        if (!conversationId) {
          throw new Error("Conversation ID is required for coaching insights.");
        }

        if (input.refresh ?? true) {
          await requestJson(`/api/conversations/${conversationId}/summarize`, {
            method: "POST",
          });
        }

        const summary = await requestJson<ConversationSummaryResponse>(
          `/api/conversations/${conversationId}/summary`
        );

        return {
          summary:
            summary?.summary ??
            "No summary exists yet. Ask to generate a fresh coaching summary.",
          keyPoints: summary?.keyPoints ?? [],
          actionItems: summary?.actionItems ?? [],
          nextSteps: summary?.nextSteps ?? [],
        };
      },
    }),
  ];
}
