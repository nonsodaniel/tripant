"use client";

import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { OfflineSplash } from "@/components/ui/OfflineSplash";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <TopBar />
      <main className="lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
      <OfflineSplash />
    </div>
  );
}
