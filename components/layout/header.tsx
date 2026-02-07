"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserButton, useUser } from "@clerk/nextjs";
import { MessageCircleIcon, TrophyIcon, UsersIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header({ isPro }: { isPro: boolean }) {
  const { isSignedIn } = useUser();

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="layout-container py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl space-x-2 group">
            <motion.span
              className="gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              PeerPath
            </motion.span>
          </Link>

          {isSignedIn && (
            <motion.nav
              className="hidden md:flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/dashboard">
                <Button variant={"ghost"} size={"sm"} className="group">
                  <LayoutDashboardIcon className="size-4 mr-1.5 group-hover:text-primary transition-colors" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/communities">
                <Button variant={"ghost"} size={"sm"} className="group">
                  <UsersIcon className="size-4 mr-1.5 group-hover:text-primary transition-colors" />
                  Communities
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant={"ghost"} size={"sm"} className="group">
                  <MessageCircleIcon className="size-4 mr-1.5 group-hover:text-primary transition-colors" />
                  Chat
                </Button>
              </Link>
            </motion.nav>
          )}
        </div>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isSignedIn ? (
            <>
              {isPro ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge className="flex items-center gap-2" variant="outline">
                    <TrophyIcon className="size-3 text-primary" /> Pro
                  </Badge>
                </motion.div>
              ) : (
                <span className="text-sm text-muted-foreground">Welcome</span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-9",
                  },
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size={"sm"}>
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm">Get Started</Button>
                </motion.div>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
}