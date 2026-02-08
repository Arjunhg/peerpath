"use client";

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-1">
        <motion.h2
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground text-sm sm:text-base mb-0"
        >
          {description}
        </motion.p>
      </div>
      {actions && <motion.div variants={itemVariants}>{actions}</motion.div>}
    </motion.div>
  );
}
