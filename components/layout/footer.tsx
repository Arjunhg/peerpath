"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeartIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="section-container py-8">
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="font-bold text-xl gradient-text">
            PeerPath
          </Link>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Transforming learning through meaningful connections and AI-powered
            accountability.
          </p>
          <div className="w-full border-t pt-4 mt-2 flex justify-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              &copy; {new Date().getFullYear()} PeerPath. Made with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <HeartIcon className="size-4 fill-red-500 text-red-500" />
              </motion.span>{" "}
              for learners everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
