"use client";

import { RocketIcon, SparkleIcon, ZapIcon, ArrowRightIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { HeroGradient } from "./background-gradient";
import Link from "next/link";
import { Button } from "../ui/button";
import { motion, Variants } from "framer-motion";

export default function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <HeroGradient />
      <div className="relative section-container section-padding w-full">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge className="mb-6 text-sm font-medium" variant="secondary">
              <SparkleIcon className="size-4 inline-block mr-2 animate-pulse" />
              AI-Powered Matching
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="mb-6">
            Never Learn Alone Again{" "}
            <span className="block gradient-text mt-2">
              Find Your Perfect Study Partner
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subheading">
            Join a community of passionate learners. Get matched with accountability partners
            who share your goals. Transform your learning journey with AI-powered insights
            and real human connection.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center mt-10"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="link-button hero-button-primary group relative overflow-hidden"
                >
                  <span className="hero-button-content relative z-10">
                    <RocketIcon className="hero-button-icon-primary group-hover:rotate-12 transition-transform" />
                    Start Learning Together
                    <ArrowRightIcon className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="link-button hero-button-outline group"
                >
                  <span className="hero-button-content">
                    <ZapIcon className="hero-button-icon-outline group-hover:scale-110 group-hover:rotate-12 transition-all" />
                    Explore Features
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>1000+ Active Learners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>50+ Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span>10k+ Study Sessions</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}