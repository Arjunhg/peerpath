import { useAiPartners } from "@/hooks/use-ai-partner";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import { LockIcon, Loader2Icon, SparklesIcon, TargetIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

export default function AIMatching({
  totalGoals,
  selectedCommunityId,
  showLockIcon,
}: {
  totalGoals: number;
  selectedCommunityId: string;
  showLockIcon: boolean;
}) {
  const aiPartnerMutation = useAiPartners();

  const handleFindAIPartners = async () => {
    try {
      await aiPartnerMutation.mutateAsync(selectedCommunityId);
      toast.success("AI partners found successfully");
    } catch (error) {
      console.error("Error finding ai partners", error);
      toast.error("Failed to find ai partners");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center py-10 px-4"
    >
      {/* Animated Icon */}
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <div className="rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-5">
          <SparklesIcon className="size-8 text-primary" />
        </div>
        <motion.div
          className="absolute -top-1 -right-1 rounded-full bg-primary/20 p-1"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        >
          <div className="size-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Our AI analyzes your learning goals and automatically matches you with
        the most compatible learning partners in this community.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <Button
          size="lg"
          className="w-full gap-2 group relative overflow-hidden"
          disabled={
            totalGoals === 0 || showLockIcon || aiPartnerMutation.isPending
          }
          onClick={handleFindAIPartners}
        >
          {showLockIcon ? (
            <LockIcon className="size-4" />
          ) : aiPartnerMutation.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SparklesIcon className="size-4 group-hover:rotate-12 transition-transform duration-300" />
          )}
          {aiPartnerMutation.isPending
            ? "Finding Partners..."
            : "Find Partners with AI"}
        </Button>

        {totalGoals > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="gap-1.5">
              <TargetIcon className="size-3" />
              {totalGoals} {totalGoals === 1 ? "goal" : "goals"} set
            </Badge>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-muted-foreground"
          >
            Add learning goals first to enable AI matching
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}