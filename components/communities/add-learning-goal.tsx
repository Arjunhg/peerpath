import { LockIcon, PlusIcon, Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useCreateLearningGoal } from "@/hooks/use-goals";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AddLearningGoal({
  selectedCommunityId,
}: {
  selectedCommunityId: string;
}) {
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const createGoalMutation = useCreateLearningGoal();

  const handleCreateGoal = async () => {
    try {
      if (!selectedCommunityId) {
        toast.error("Please select a community first");
        return;
      }
      await createGoalMutation.mutateAsync({
        communityId: selectedCommunityId,
        title: newGoalText.slice(0, 100),
        description: newGoalText,
        tags: [],
      });
      toast.success("Learning goal created successfully!");
      setNewGoalText("");
      setShowNewGoalForm(false);
    } catch (error) {
      console.error("Error creating learning goal", error);
    }
  };

  return (
    <div className="pt-2">
      <AnimatePresence mode="wait">
        {showNewGoalForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Textarea
                placeholder="What do you want to learn? Be specific — it helps AI find better matches."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                rows={3}
                className="resize-none bg-background focus:ring-2 focus:ring-primary/20 transition-shadow duration-200"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateGoal}
                  disabled={
                    createGoalMutation.isPending ||
                    newGoalText.length === 0 
                  }
                  className="gap-2"
                >
                  {createGoalMutation.isPending ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlusIcon className="size-3.5" />
                  )}
                  Add Goal
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewGoalForm(false);
                    setNewGoalText("");
                  }}
                >
                  Cancel
                </Button>
                {newGoalText.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground ml-auto"
                  >
                    {newGoalText.length}/100 title chars
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              className="w-full border-dashed border-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
              onClick={() => setShowNewGoalForm(true)}
            >
              
                <PlusIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" />
           
              Add Learning Goal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}