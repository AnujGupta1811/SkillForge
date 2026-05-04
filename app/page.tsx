"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Sparkles,
  Users,
  Search,
  Zap,
  GitBranch,
  Trophy,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

// --- Custom Hooks ---

const useCountUp = (end: number, duration: number = 2000, start: boolean) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [start, end, duration])
  return count
}

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        if (ref.current) observer.unobserve(ref.current)
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [options])

  return [ref, isIntersecting] as const
}

// --- Components ---

const FloatingShapes = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    {/* Shape 1: Rotating cube outline */}
    <div className="absolute top-[15%] right-[10%] w-10 h-10 border-2 border-[#7c3aed] opacity-40 animate-float md:block hidden"
      style={{ animation: 'float 8s ease-in-out infinite' }} />

    {/* Shape 2: Floating ring */}
    <div className="absolute top-[40%] left-[5%] w-16 h-16 border-2 border-[#7c3aed] rounded-full opacity-30 animate-pulse-ring md:block hidden"
      style={{ animation: 'pulse-ring 6s ease-in-out infinite' }} />

    {/* Shape 3: Small rotating square */}
    <div className="absolute bottom-[20%] right-[20%] w-6 h-6 bg-[#7c3aed]/20 rotate-45 animate-float-reverse md:block hidden"
      style={{ animation: 'floatReverse 10s ease-in-out infinite' }} />
  </div>
)

export default function LandingPage() {
  // Hero Cycling Words
  const words = ["Visibility", "Recognition", "Momentum", "Impact", "Growth"]
  const [wordIndex, setWordIndex] = useState(0)
  const [fadeStatus, setFadeStatus] = useState("fade-in")

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeStatus("fade-out")
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length)
        setFadeStatus("fade-in")
      }, 500) // Half second for fade out
    }, 2500) // 2s display + 0.5s transition
    return () => clearInterval(interval)
  }, [words.length])

  // Stats Counters
  const [statsRef, statsVisible] = useIntersectionObserver({ threshold: 0.1 })
  const engineersCount = useCountUp(500, 2000, statsVisible)
  const featuresCount = useCountUp(2000, 2000, statsVisible)
  const projectsCount = useCountUp(150, 2000, statsVisible)
  const recommendPercent = useCountUp(98, 2000, statsVisible)

  // Features Reveal
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1 })

  // 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#64748b] selection:bg-[#7c3aed]/20">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Animated Mesh Gradient */}
        <div className="mesh-gradient" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <FloatingShapes />

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-[#7c3aed] mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c3aed]"></span>
            </span>
            Built for engineers between projects
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[#0f172a] tracking-tight leading-[1.1] mb-6">
            Turn Downtime Into <br />
            <span className={`inline-block text-[#7c3aed] relative pb-2 ${fadeStatus === 'fade-in' ? 'animate-word-in' : 'animate-word-out'}`}>
              {words[wordIndex]}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#7c3aed]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#7c3aed] animate-progress" style={{ width: '100%' }} />
              </div>
            </span>
          </h1>

          <p className="text-xl text-[#64748b] max-w-2xl mb-10 leading-relaxed">
            SkillForge helps engineers between projects stay sharp, build real things, and get noticed — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Button asChild size="lg" className="h-14 px-8 rounded-full bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-[#7c3aed]/20 group relative overflow-hidden transition-all">
              <Link href="/auth?mode=signup" className="flex items-center gap-2">
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-[#7c3aed] text-[#7c3aed] hover:bg-[#ede9fe] transition-colors">
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* 3D Dashboard Preview Card */}
          <div className="hidden md:block w-full max-w-5xl mx-auto px-4 mt-10 animate-float" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <div
              className="relative rounded-2xl bg-white border border-[#7c3aed]/20 shadow-[0_40px_80px_rgba(124,58,237,0.2),0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 ease-out hover:rotate-x-2 hover:rotate-y-2"
              style={{ transform: 'perspective(1000px) rotateX(5deg)' }}
            >
              {/* Browser Bar */}
              <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="mx-auto bg-[#e2e8f0] h-5 w-1/3 rounded-md" />
              </div>

              {/* Dashboard Mock Content */}
              <div className="p-6 bg-white grid grid-cols-3 gap-6 h-[400px]">
                {[1, 2, 3].map((col) => (
                  <div key={col} className="space-y-4">
                    <div className="h-6 w-24 bg-[#ede9fe] rounded-md mb-6" />
                    {[1, 2].map((card) => (
                      <div key={card} className="p-4 border border-[#e2e8f0] rounded-xl space-y-3 shadow-sm">
                        <div className="h-4 w-3/4 bg-[#f1f5f9] rounded" />
                        <div className="h-3 w-full bg-[#f8fafc] rounded" />
                        <div className="flex gap-2">
                          <div className="h-2 w-10 bg-[#ede9fe] rounded-full" />
                          <div className="h-2 w-10 bg-[#f1f5f9] rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL PROOF STATS BAR */}
      <section ref={statsRef} className="w-full bg-[#ede9fe] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-[#7c3aed]">{engineersCount}+</div>
              <div className="text-[#64748b] font-medium">Engineers Using SkillForge</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-[#7c3aed]">{featuresCount}+</div>
              <div className="text-[#64748b] font-medium">Features Built</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-[#7c3aed]">{projectsCount}+</div>
              <div className="text-[#64748b] font-medium">Projects Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-[#7c3aed]">{recommendPercent}%</div>
              <div className="text-[#64748b] font-medium">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" ref={featuresRef} className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#7c3aed] mb-4">Features</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6">Everything you need to stay sharp</h3>
            <p className="text-lg text-[#64748b]">Three powerful tools working together to help you ship meaningful projects.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div
              className={`feature-card group ${featuresVisible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.1s' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#ede9fe] rounded-2xl flex items-center justify-center text-[#7c3aed] mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 text-4xl font-black text-[#7c3aed]/10">01</div>
                <h4 className="text-2xl font-bold text-[#0f172a] mb-4">AI Problem Curator</h4>
                <p className="text-[#64748b] leading-relaxed mb-8">
                  Our AI scans GitHub, Hacker News, and Stack Overflow to find real problems that match your exact skill level — so you always have something meaningful to work on.
                </p>
                <Link href="/auth" className="inline-flex items-center gap-2 text-[#7c3aed] font-semibold hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div
              className={`feature-card group ${featuresVisible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.2s' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#ede9fe] rounded-2xl flex items-center justify-center text-[#7c3aed] mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 text-4xl font-black text-[#7c3aed]/10">02</div>
                <h4 className="text-2xl font-bold text-[#0f172a] mb-4">Collaborative Workspace</h4>
                <p className="text-[#64748b] leading-relaxed mb-8">
                  Join projects started by teammates, claim features, submit work for review, and build a portfolio of real contributions — all within your company.
                </p>
                <Link href="/auth" className="inline-flex items-center gap-2 text-[#7c3aed] font-semibold hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div
              className={`feature-card group ${featuresVisible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.3s' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#ede9fe] rounded-2xl flex items-center justify-center text-[#7c3aed] mb-8 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div className="absolute top-0 right-0 text-4xl font-black text-[#7c3aed]/10">03</div>
                <h4 className="text-2xl font-bold text-[#0f172a] mb-4">Visibility Dashboard</h4>
                <p className="text-[#64748b] leading-relaxed mb-8">
                  Track your points, activity heatmap, and skill tags. Managers see live team dashboards — turning your effort into visible career momentum.
                </p>
                <Link href="/auth" className="inline-flex items-center gap-2 text-[#7c3aed] font-semibold hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6">From zero to contributing in minutes</h2>
          </div>

          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] border-t-2 border-dashed border-[#7c3aed]/20" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-white shadow-xl shadow-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] mx-auto mb-6 border border-[#e2e8f0] relative z-10 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[#7c3aed] text-white rounded-full text-sm font-bold mb-4">1</div>
                <h5 className="text-xl font-bold text-[#0f172a] mb-3">Find a Problem</h5>
                <p className="text-sm leading-relaxed">Tell SkillForge your skills. Our AI curates real problems from across the web.</p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-white shadow-xl shadow-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] mx-auto mb-6 border border-[#e2e8f0] relative z-10 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[#7c3aed] text-white rounded-full text-sm font-bold mb-4">2</div>
                <h5 className="text-xl font-bold text-[#0f172a] mb-3">Generate a Project</h5>
                <p className="text-sm leading-relaxed">Claude AI turns the problem into a full project spec with features and tech stack.</p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-white shadow-xl shadow-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] mx-auto mb-6 border border-[#e2e8f0] relative z-10 group-hover:scale-110 transition-transform">
                  <GitBranch className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[#7c3aed] text-white rounded-full text-sm font-bold mb-4">3</div>
                <h5 className="text-xl font-bold text-[#0f172a] mb-3">Build Together</h5>
                <p className="text-sm leading-relaxed">Publish to the board. Teammates join, claim features, and collaborate.</p>
              </div>

              {/* Step 4 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-white shadow-xl shadow-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] mx-auto mb-6 border border-[#e2e8f0] relative z-10 group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-[#7c3aed] text-white rounded-full text-sm font-bold mb-4">4</div>
                <h5 className="text-xl font-bold text-[#0f172a] mb-3">Get Recognized</h5>
                <p className="text-sm leading-relaxed">Earn points, build your profile, and let managers see your contributions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIAL / QUOTE SECTION */}
      <section className="py-32 bg-[#0f172a] text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7c3aed]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="text-6xl text-[#7c3aed] font-serif mb-8 opacity-50">"</div>
          <blockquote className="text-3xl md:text-4xl font-medium max-w-4xl mx-auto leading-tight mb-12">
            SkillForge gave me something real to show for my transition period. I went from feeling invisible to having 3 completed projects on my profile in just 6 weeks.
          </blockquote>
          <cite className="not-italic block text-xl text-[#7c3aed] font-bold mb-10">— Senior Engineer, Infosys</cite>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold border-2 border-white/20">AG</div>
            <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold border-2 border-white/20">SK</div>
            <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold border-2 border-white/20">RN</div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] p-12 md:p-20 text-center relative overflow-hidden">
          <FloatingShapes className="opacity-40" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to make your time count?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Join engineers who are building, learning, and getting noticed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-full bg-white text-[#7c3aed] hover:bg-[#f8fafc] shadow-xl text-lg font-bold">
                <Link href="/auth?mode=signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10 text-lg font-bold transition-all duration-300">
                <Link href="#features">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="py-12 border-t border-[#e2e8f0]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="text-2xl font-black text-[#0f172a] mb-2">SkillForge</div>
              <p className="text-sm">Built for engineers between projects</p>
            </div>

            <div className="flex items-center gap-8 text-sm font-semibold">
              <Link href="#features" className="hover:text-[#7c3aed] transition-colors">Features</Link>
              <Link href="#features" className="hover:text-[#7c3aed] transition-colors">How It Works</Link>
              <Link href="/auth" className="hover:text-[#7c3aed] transition-colors">Sign In</Link>
            </div>

            <div className="text-sm font-medium">© 2026 SkillForge</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -20px) rotate(120deg); }
          66% { transform: translate(-20px, 10px) rotate(240deg); }
        }

        .mesh-gradient {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .mesh-gradient::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation: meshMove 12s ease-in-out infinite;
        }

        .mesh-gradient::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: 100px;
          right: -100px;
          animation: meshMove 15s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: perspective(1000px) translateY(0px) rotateX(5deg); }
          50% { transform: perspective(1000px) translateY(-20px) rotateX(7deg); }
        }

        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(225deg); }
        }

        @keyframes pulse-ring {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 0.6; }
        }

        @keyframes word-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes word-out {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }

        .animate-word-in {
          animation: word-in 0.5s ease-out forwards;
        }

        .animate-word-out {
          animation: word-out 0.5s ease-in forwards;
        }

        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }

        .animate-progress {
          animation: progress 2s linear infinite;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(124,58,237,0.15);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.08);
          padding: 32px;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          will-change: transform, opacity;
        }

        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .rotate-x-2 { transform: perspective(1000px) rotateX(2deg) !important; }
        .rotate-y-2 { transform: perspective(1000px) rotateY(2deg) !important; }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}
