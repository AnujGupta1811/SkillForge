"use client"

import type React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ArrowLeft, Hammer, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.07-1.1-.16-1.6H12z"
      />
    </svg>
  )
}

function Divider() {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-1 border-t border-border" />
      <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">or</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [showVerificationState, setShowVerificationState] = useState(false)

  useEffect(() => {
    const mode = params.get("mode") === "signup" ? "signup" : "signin"
    setTab(mode)

    const errorParam = params.get('error')
    if (errorParam === 'verification_failed') {
      setError('Email verification failed. Please try signing up again.')
    }
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [params])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError("")
    setMessage("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email and click the verification link to activate your account.')
      setShowVerificationState(true)
    }
    setLoading(false)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email first. Check your inbox for the verification link.')
      } else {
        setError(error.message)
      }
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Hammer className="h-4 w-4" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tab === "signin"
                ? "Sign in to continue building while between projects."
                : "Start turning your downtime into shipped projects."}
            </p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {message && <div className="mb-4 rounded-md bg-accent/10 p-3 text-sm text-accent">{message}</div>}

        {showVerificationState ? (
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Mail className="h-8 w-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Check your email</h2>
              <p className="text-muted-foreground">
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Didn't receive it? Check your spam folder.
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                setShowVerificationState(false)
                setTab("signin")
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v: string) => setTab(v as "signin" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link href="#" className="text-xs font-medium text-accent hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>

                <Divider />

                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleGoogle}>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-email">Work email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="jane@infosys.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-confirm">Confirm password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>

                <Divider />

                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleGoogle}>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>

                <p className="text-center text-xs leading-relaxed text-muted-foreground text-pretty">
                  Use your company work email to connect with your team.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Suspense fallback={<Card className="h-[520px] animate-pulse border-border bg-card" />}>
          <AuthContent />
        </Suspense>
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to SkillForge
          </Link>
        </div>
      </div>
    </main>
  )
}
