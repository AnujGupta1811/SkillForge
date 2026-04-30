// app/page.tsx
import Link from "next/link"
import { ArrowRight, BarChart3, Sparkles, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { FeatureCard } from "@/components/feature-card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* subtle grid backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.929_0.013_255.508)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.929_0.013_255.508)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-24 sm:px-6 md:pt-28 md:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            For engineers on the bench
          </div>

          <h1 className="mt-6 max-w-3xl text-center text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl md:text-6xl">
            Turn bench time into <span className="text-accent">building time</span>
          </h1>

          <p className="mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            SkillForge helps bench engineers at IT companies discover real problems, build projects, and grow visibly —
            all in one place.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <Link href="/auth?mode=signup">
                Get started free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-transparent sm:w-auto">
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Used by engineers at <span className="font-medium text-foreground">Infosys</span>,{" "}
            <span className="font-medium text-foreground">TCS</span>,{" "}
            <span className="font-medium text-foreground">Wipro</span> and more
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">Features</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Everything you need to ship while you wait
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              Discover, build, and prove your impact — without waiting for an allocation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="AI Problem Curator"
              description="Get real problems from GitHub, Hacker News, and Stack Overflow — matched to your skill level."
            />
            <FeatureCard
              icon={Wrench}
              title="Project Generator"
              description="Turn a problem into a full project idea with tech stack, features, and scope — ready to build."
            />
            <FeatureCard
              icon={BarChart3}
              title="Progress Dashboard"
              description="Track your activity, skills, and contributions. Make your bench time visible to your manager."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Ready to make your bench time count?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/70 text-pretty">
            Join engineers turning idle weeks into shipped projects, sharper skills, and visible progress.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/auth?mode=signup">
              Create your free account
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} SkillForge. Built for the bench.</p>
          <div className="flex items-center gap-6">
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
