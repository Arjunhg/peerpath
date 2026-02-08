"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden group hover:border-primary/20 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-300" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          {icon && (
            <div className="text-primary/60 group-hover:text-primary transition-colors duration-300">
              {icon}
            </div>
          )}
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums">
          <AnimatedNumber value={value} />
        </CardTitle>
      </CardHeader>
    </Card>
  );
}