"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import ChatInterface from "@/components/chat/chat-interface";
import { motion } from "framer-motion";
import { use } from "react";

export default function ChatMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/chat">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeftIcon className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Conversations
          </Button>
        </Link>
      </motion.div>
      <ChatInterface matchId={matchId} />
    </div>
  );
}