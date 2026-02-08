"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { UserAvatar } from "../ui/user-avatar";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AnimatedCard } from "../ui/animated-wrappers";
import EmptyState from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendIcon,
  Loader2Icon,
  SparklesIcon,
  ListChecksIcon,
  LightbulbIcon,
  ArrowDownIcon,
  MessageCircleIcon,
  FileTextIcon,
} from "lucide-react";

function ChatSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="rounded-xl border bg-card h-162.5 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-end gap-2">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <Skeleton className="h-16 w-52 rounded-xl" />
            </div>
            <div className="flex items-end gap-2 justify-end">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="size-8 rounded-full shrink-0" />
            </div>
            <div className="flex items-end gap-2">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <Skeleton className="h-20 w-60 rounded-xl" />
            </div>
          </div>
          <div className="p-4 border-t flex gap-2">
            <Skeleton className="h-14 flex-1 rounded-lg" />
            <Skeleton className="h-14 w-14 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface({ matchId }: { matchId: string }) {
  const { user: clerkUser } = useUser();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", matchId],
    queryFn: async () => {
      const res = await client.api.matches[":matchId"].conversation.$get({
        param: { matchId },
      });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
  });

  const { data: chatMessages } = useQuery({
    queryKey: ["messages", conversation?.id],
    queryFn: async () => {
      const res = await client.api.conversations[
        ":conversationId"
      ].messages.$get({
        param: { conversationId: conversation?.id ?? "" },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.conversations[
        ":conversationId"
      ].messages.$post({
        param: { conversationId: conversation?.id ?? "" },
        // @ts-expect-error - content is not defined in the API client
        json: { content: message },
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["messages", conversation?.id],
      });
    },
    onError: (error) => console.error(error),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.conversations[
        ":conversationId"
      ].summarize.$post({
        param: { conversationId: conversation?.id ?? "" },
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["summary", conversation?.id],
      });
    },
    onError: (error) => console.error("Error generating summary", error),
  });

  const { data: summary } = useQuery({
    queryKey: ["summary", conversation?.id],
    queryFn: async () => {
      const res = await client.api.conversations[
        ":conversationId"
      ].summary.$get({
        param: { conversationId: conversation?.id ?? "" },
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    enabled: !!conversation?.id,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages?.length]);

  // Track scroll position for scroll-down button
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate();
  };

  if (!conversation) return <ChatSkeleton />;

  const otherUser = {
    id: conversation.otherUser.id,
    name: conversation.otherUser.name,
    imageUrl: conversation.otherUser.imageUrl,
  };

  const currentUser = {
    name: (clerkUser?.firstName + " " + clerkUser?.lastName).trim() ?? "You",
    imageUrl: clerkUser?.imageUrl ?? undefined,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Chat Panel */}
      <div className="lg:col-span-2">
        <Card className="h-162.5 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="border-b py-3 px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  name={otherUser.name}
                  imageUrl={otherUser.imageUrl ?? undefined}
                />
                <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div>
                <CardTitle className="text-base">{otherUser.name}</CardTitle>
                <CardDescription className="text-xs mb-0">
                  Online
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 relative"
          >
            {!chatMessages || chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptyState
                  icon={
                    <MessageCircleIcon className="size-5 text-muted-foreground" />
                  }
                  title="Start the conversation"
                  description={`Say hello to ${otherUser.name} and begin your learning journey together!`}
                />
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, i) => {
                  const isCurrentUser =
                    msg.senderId === conversation.currentUserId;
                  const sender = isCurrentUser ? currentUser : otherUser;
                  const showAvatar =
                    i === 0 ||
                    chatMessages[i - 1]?.senderId !== msg.senderId;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-end gap-2",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isCurrentUser && (
                        <div className="shrink-0">
                          {showAvatar ? (
                            <UserAvatar
                              name={sender.name ?? "U"}
                              imageUrl={sender.imageUrl ?? undefined}
                              size="sm"
                            />
                          ) : (
                            <div className="size-8" />
                          )}
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 transition-colors duration-150",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm leading-relaxed whitespace-pre-wrap mb-0",
                            isCurrentUser
                              ? "text-primary-foreground"
                              : "text-foreground"
                          )}
                        >
                          {msg.content}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1 mb-0",
                            isCurrentUser
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {isCurrentUser && (
                        <div className="shrink-0">
                          {showAvatar ? (
                            <UserAvatar
                              name={currentUser.name ?? "You"}
                              imageUrl={currentUser.imageUrl ?? undefined}
                              size="sm"
                            />
                          ) : (
                            <div className="size-8" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />

            {/* Scroll to bottom FAB */}
            <AnimatePresence>
              {showScrollDown && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background border shadow-md p-2 hover:bg-muted transition-colors z-10"
                >
                  <ArrowDownIcon className="size-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          </CardContent>

          {/* Message Input */}
          <CardFooter className="border-t p-3 shrink-0">
            <div className="flex w-full gap-2 items-end">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none min-h-11 max-h-30 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 rounded-xl transition-shadow duration-200"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <motion.div whileTap={{ scale: 0.92 }}>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={
                    !message.trim() || sendMessageMutation.isPending
                  }
                  className="rounded-xl size-11 shrink-0"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SendIcon className="size-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Summary Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <AnimatedCard delay={0.2} hover={false}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileTextIcon className="size-4 text-primary" />
                  Summary
                </CardTitle>
                <Button
                  size="xs"
                  variant={summary ? "outline" : "default"}
                  onClick={() => generateSummaryMutation.mutate()}
                  disabled={generateSummaryMutation.isPending}
                  className="gap-1.5"
                >
                  {generateSummaryMutation.isPending ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <SparklesIcon className="size-3" />
                  )}
                  {generateSummaryMutation.isPending
                    ? "Generating..."
                    : summary
                      ? "Refresh"
                      : "Generate"}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                {summary ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Summary text */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          <FileTextIcon className="size-3 text-primary" />
                        </div>
                        <h4 className="text-sm font-semibold">Overview</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-0">
                        {summary.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    {summary.keyPoints && summary.keyPoints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <LightbulbIcon className="size-3 text-primary" />
                          </div>
                          <h4 className="text-sm font-semibold">Key Points</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {summary.keyPoints.map(
                            (point: string, index: number) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary mt-1.5 shrink-0 size-1 rounded-full bg-primary inline-block" />
                                {point}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {summary.actionItems && summary.actionItems.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <ListChecksIcon className="size-3 text-primary" />
                          </div>
                          <h4 className="text-sm font-semibold">
                            Action Items
                          </h4>
                        </div>
                        <div className="space-y-1.5">
                          {summary.actionItems.map(
                            (item: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-[10px] px-1.5 py-0 mt-0.5"
                                >
                                  {index + 1}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {item}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {summary.nextSteps && summary.nextSteps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <ArrowDownIcon className="size-3 text-primary -rotate-90" />
                          </div>
                          <h4 className="text-sm font-semibold">Next Steps</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {summary.nextSteps.map(
                            (step: string, index: number) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary mt-1.5 shrink-0 size-1 rounded-full bg-primary inline-block" />
                                {step}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={
                        <SparklesIcon className="size-5 text-muted-foreground" />
                      }
                      title="No summary yet"
                      description='Click "Generate" to create an AI-powered summary of this conversation.'
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </motion.div>
  );
}