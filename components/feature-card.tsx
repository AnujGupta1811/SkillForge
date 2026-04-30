// components/feature-card.tsx
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group h-full border-border bg-card transition-colors hover:border-accent/40">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground text-balance">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
