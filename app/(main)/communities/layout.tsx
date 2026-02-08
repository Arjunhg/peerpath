"use client";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Communities"
        description="Manage your learning goals and find learning partners"
        actions={
          <Link href="/communities/all">
            <Button variant="outline" className="gap-2 group">
              <PlusIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" />
              Join More Communities
            </Button>
          </Link>
        }
      />
      {children}
    </div>
  );
}