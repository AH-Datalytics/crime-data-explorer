"use client";

import Link from "next/link";
import {
  TrendingUp,
  Gavel,
  AlertTriangle,
  Crosshair,
  BarChart3,
  Info,
} from "lucide-react";
import type { DomainCard as DomainCardType } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "trending-up": TrendingUp,
  handcuffs: Gavel,
  "alert-triangle": AlertTriangle,
  crosshair: Crosshair,
  "bar-chart": BarChart3,
  info: Info,
};

export function DomainCard({ card }: { card: DomainCardType }) {
  const Icon = ICON_MAP[card.icon] || BarChart3;

  return (
    <Link
      href={card.href}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-white p-5 transition-all hover:border-navy hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy group-hover:bg-navy/10">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-serif text-base font-bold text-navy">{card.title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
    </Link>
  );
}
