"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TamboThreadProvider, useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangleIcon,
  BotIcon,
  Loader2Icon,
  SendIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import {
  PeerPathTamboProvider,
  usePeerPathTamboAuthStatus,
} from "@/components/providers/tambo-provider";
import { type TamboToolScope } from "@/components/tambo/registry";

type CopilotPanelProps = {
  contextKey: string;
  title: string;
  description: string;
  hint: string;
  starterPrompts: string[];
  placeholder?: string;
  scope?: TamboToolScope;
  className?: string;
};

type MinimalThreadMessage = {
  id: string;
  role: "assistant" | "user" | "tool" | "system";
  content: Array<{
    type: "text" | "image_url" | "input_audio" | "resource";
    text?: string;
  }>;
  renderedComponent?: ReactNode;
};

function getMessageText(message: MinimalThreadMessage) {
  return message.content
    .filter((part) => part.type === "text" && Boolean(part.text))
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function AuthStatusBanner() {
  const authStatus = usePeerPathTamboAuthStatus();

  if (authStatus.isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
        <Loader2Icon className="size-3.5 animate-spin text-primary" />
        <p className="mb-0 text-xs text-muted-foreground">Connecting Tambo authentication...</p>
      </div>
    );
  }

  if (authStatus.error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
        <AlertTriangleIcon className="size-3.5 text-destructive" />
        <p className="mb-0 text-xs text-destructive">{authStatus.error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
        Clerk Token
      </Badge>
      <p className="mb-0 text-xs text-muted-foreground">Tambo session active</p>
    </div>
  );
}

function CopilotPanelBody({
  title,
  description,
  hint,
  starterPrompts,
  placeholder,
  scope,
  className,
}: Omit<CopilotPanelProps, "contextKey">) {
  const { thread, generationStatusMessage, generationStage, sendThreadMessage } = useTamboThread();
  const { value, setValue, submit, isPending, error } = useTamboThreadInput();
  const [panelError, setPanelError] = useState<string | null>(null);

  const additionalContext = useMemo(
    () => ({
      scope: {
        communityId: scope?.communityId ?? null,
        conversationId: scope?.conversationId ?? null,
      },
    }),
    [scope?.communityId, scope?.conversationId]
  );

  const messages = useMemo(
    () =>
      (thread.messages as unknown as MinimalThreadMessage[]).filter(
        (message) =>
          message.role === "assistant" ||
          message.role === "user" ||
          Boolean(message.renderedComponent)
      ),
    [thread.messages]
  );

  const handleSubmit = async () => {
    if (!value.trim() || isPending) {
      return;
    }

    setPanelError(null);

    try {
      await submit({ additionalContext });
    } catch (submitError) {
      setPanelError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit to copilot"
      );
    }
  };

  const handleStarterPrompt = async (prompt: string) => {
    if (isPending) {
      return;
    }

    setPanelError(null);
    setValue(prompt);

    try {
      await sendThreadMessage(prompt, {
        threadId: thread.id,
        additionalContext,
      });
      setValue("");
    } catch (starterError) {
      setPanelError(
        starterError instanceof Error
          ? starterError.message
          : "Failed to send starter prompt"
      );
    }
  };

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SparklesIcon className="size-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <p className="mb-0 text-xs text-muted-foreground">How this works: {hint}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <AuthStatusBanner />

        <div className="max-h-88 overflow-y-auto rounded-lg border bg-muted/20 p-3">
          {messages.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-1 text-sm font-medium">No copilot messages yet</p>
              <p className="mb-0 text-xs text-muted-foreground">
                Try one of the starter prompts below.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const text = getMessageText(message);
                const isUser = message.role === "user";

                return (
                  <div key={message.id} className={cn("space-y-2", isUser ? "text-right" : "text-left")}>
                    {text ? (
                      <div
                        className={cn(
                          "inline-block max-w-full rounded-lg px-3 py-2 text-sm",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border"
                        )}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-70">
                          {isUser ? <UserIcon className="size-3" /> : <BotIcon className="size-3" />}
                          {isUser ? "You" : "Copilot"}
                        </div>
                        <p className="mb-0 whitespace-pre-wrap text-inherit">{text}</p>
                      </div>
                    ) : null}

                    {message.renderedComponent ? (
                      <div className="rounded-lg border bg-background p-2 text-left">
                        {message.renderedComponent}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt}
              size="xs"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                void handleStarterPrompt(prompt);
              }}
            >
              {prompt}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder ?? "Ask your copilot..."}
            className="min-h-11 resize-none"
            rows={2}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            className="size-11 shrink-0"
            disabled={isPending || !value.trim()}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </Button>
        </div>

        {(generationStatusMessage || error || panelError) && (
          <div className="space-y-1">
            {generationStatusMessage ? (
              <p className="mb-0 text-xs text-muted-foreground">
                Stage: {generationStage} - {generationStatusMessage}
              </p>
            ) : null}

            {error ? <p className="mb-0 text-xs text-destructive">{error.message}</p> : null}
            {panelError ? <p className="mb-0 text-xs text-destructive">{panelError}</p> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CopilotPanel(props: CopilotPanelProps) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!apiKey) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangleIcon className="size-4" />
            Tambo Setup Required
          </CardTitle>
          <CardDescription>
            Add <code>NEXT_PUBLIC_TAMBO_API_KEY</code> to your environment to enable copilot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PeerPathTamboProvider contextKey={props.contextKey} scope={props.scope}>
      <TamboThreadProvider contextKey={props.contextKey}>
        <CopilotPanelBody {...props} />
      </TamboThreadProvider>
    </PeerPathTamboProvider>
  );
}
