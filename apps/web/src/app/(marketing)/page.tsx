'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Kanban,
  Table,
  Zap,
  Moon,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { AuthModal } from '@/components/auth/AuthModal';
import { Logo } from '@/components/ui/Logo';

export default function LandingPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Modal toggle
  const [modalOpen, setModalOpen] = React.useState(false);

  // Handle Manual Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!email.trim()) throw new Error('Please enter your email');
      if (!password) throw new Error('Please enter your password');
      await login({ email, password });
      router.push('/dashboard/today');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login({ email: demoEmail, password: demoPass });
      router.push('/dashboard/today');
    } catch (err: any) {
      setAuthError(err.message || 'Demo authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview Kanban state for interactive demo
  const [previewTasks, setPreviewTasks] = React.useState([
    { id: '1', title: 'Write API Documentation', status: 'todo', tag: 'Deployment', date: '29 Jul', assignee: 'Admin' },
    { id: '2', title: 'Code Review Completed', status: 'doing', tag: 'Review', date: '29 Jul', assignee: 'Admin' },
    { id: '3', title: 'Feature Testing Passed', status: 'completed', tag: 'Testing', date: '30 Jul', assignee: 'QA' },
    { id: '4', title: 'UI Review Process', status: 'on_hold', tag: 'Design', date: '01 Aug', assignee: 'Designer' },
  ]);

  const movePreviewTask = (id: string, nextStatus: string) => {
    setPreviewTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
  };

  return (
    <div className="relative overflow-hidden" suppressHydrationWarning>
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Logo className="h-7 w-7" />

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-foreground transition-colors">
              Workflow
            </a>
          </nav>

          {/* Right Actions & Theme Switcher */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="sm"
              className="font-semibold shadow-sm text-xs px-3.5 h-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero & Onboarding Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Animated Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/60 text-xs font-medium text-muted-foreground shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Internal Team Collaboration Workspace</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-tight">
              Let&apos;s get back on track.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              The high-craft task management system engineered for clarity, speed, and effortless organization. Drag, prioritize, and conquer.
            </p>
          </motion.div>

          {/* Centered Interactive Auth Card matching reference image */}
          <motion.div
            id="auth"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-card-foreground text-left space-y-5"
          >
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Welcome back
              </h3>
              <p className="text-xs text-muted-foreground">
                Sign in with your work email to access your workspace.
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick Demo Access Bar */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Reviewer Demo Mode
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">1-Click Sign In</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleDemoLogin('admin@taskly.in', 'Admin@123')}
                  disabled={isSubmitting}
                  className="flex flex-col items-start p-2 rounded-lg bg-card border border-border/80 hover:border-primary/50 text-left transition-all hover:shadow-sm"
                >
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    👑 Demo Admin
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">admin@taskly.in</span>
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleDemoLogin('member@taskly.in', 'Member@123')}
                  disabled={isSubmitting}
                  className="flex flex-col items-start p-2 rounded-lg bg-card border border-border/80 hover:border-emerald-500/50 text-left transition-all hover:shadow-sm"
                >
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    👤 Demo Member
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">member@taskly.in</span>
                </button>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-1">
              <Input
                label="Work Email"
                type="email"
                placeholder="admin@taskly.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold mt-4"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <p className="text-center text-[11px] text-muted-foreground/80 leading-normal pt-2">
              Default password: <span className="font-mono text-foreground font-medium">Admin@123</span> / <span className="font-mono text-foreground font-medium">Member@123</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="workflow" className="py-16 sm:py-24 border-t border-border/80 bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Experience the Live Workflow
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Test drive the interactive Kanban board below. Click on status badges to transition tasks across workflow states.
            </p>
          </div>

          {/* Interactive Preview Board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Interactive Board Preview</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full">
                  Live Demo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { status: 'todo', label: 'To Do', color: 'text-slate-500' },
                { status: 'doing', label: 'Doing', color: 'text-sky-500' },
                { status: 'completed', label: 'Completed', color: 'text-emerald-500' },
                { status: 'on_hold', label: 'On Hold', color: 'text-purple-500' },
              ].map((col) => {
                const tasksInCol = previewTasks.filter((t) => t.status === col.status);
                return (
                  <div
                    key={col.status}
                    className="rounded-xl border border-border/80 bg-secondary/30 p-3 space-y-2.5 min-h-[220px]"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-foreground">{col.label}</span>
                      <span className="text-[11px] font-bold text-muted-foreground">{tasksInCol.length}</span>
                    </div>

                    <div className="space-y-2">
                      {tasksInCol.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-2 hover:border-accent transition-colors"
                        >
                          <p className="text-xs font-semibold text-foreground leading-snug">{task.title}</p>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                            <div className="flex items-center gap-1">
                              <Avatar name={task.assignee} size="sm" />
                              <span>{task.assignee}</span>
                            </div>
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                              #{task.tag}
                            </span>
                          </div>

                          {/* Quick Move Trigger for Demo */}
                          <div className="flex items-center gap-1 pt-1">
                            <span className="text-[10px] text-muted-foreground">Move:</span>
                            {['todo', 'doing', 'completed', 'on_hold']
                              .filter((s) => s !== col.status)
                              .map((next) => (
                                <button
                                  key={next}
                                  suppressHydrationWarning
                                  onClick={() => movePreviewTask(task.id, next)}
                                  className="text-[10px] text-muted-foreground hover:text-accent underline px-1"
                                >
                                  {next === 'on_hold' ? 'Hold' : next}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Engineered for Speed & Flow
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Everything you need to plan, track, and ship projects without bureaucratic overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Kanban,
                title: 'Drag & Drop Kanban',
                desc: 'Fluid, reorderable task boards across To Do, Doing, Completed, and On Hold with database persistence.',
              },
              {
                icon: Zap,
                title: 'Admin Provisioning',
                desc: 'Secure access controlled by administrators. Real org structures, zero unauthorized signups.',
              },
              {
                icon: Table,
                title: 'Structured Table Views',
                desc: 'High-density table views with collapsible status groups, priority indicators, and ⌘F search.',
              },
              {
                icon: Moon,
                title: 'Adaptive Theme Engine',
                desc: 'Seamless dark and light modes with smooth radial blur view transitions.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-accent/60 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Logo className="h-5 w-5" />
          </div>
          <p>© 2026 Taskly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
