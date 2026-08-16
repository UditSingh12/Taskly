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
  User as UserIcon,
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

export default function LandingPage() {
  const router = useRouter();
  const { loginAsGuest, login, register, loginWithGoogle, user } = useAuth();

  const [authMode, setAuthMode] = React.useState<'guest' | 'login' | 'register'>('login');
  const [name, setName] = React.useState('');
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
      if (authMode === 'register') {
        if (!name.trim()) throw new Error('Please enter a username or full name');
        if (!email.trim()) throw new Error('Please enter your work email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register({ name, email, password });
      } else {
        if (!email.trim()) throw new Error('Please enter your email');
        if (!password) throw new Error('Please enter your password');
        await login({ email, password });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await loginAsGuest();
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Guest login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const gEmail = email.trim() || 'google.user@taskly.io';
      const gName = name.trim() || 'Google User';
      await loginWithGoogle({
        email: gEmail,
        name: gName,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(gName)}`,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed');
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
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold shadow-sm">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Taskly
            </span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-foreground transition-colors">
              Workflow
            </a>
            <a href="#auth" className="hover:text-foreground transition-colors">
              Get Started
            </a>
          </nav>

          {/* Right Actions & Theme Switcher */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs h-8"
            >
              Sign In
            </Button>
            <Button
              onClick={handleContinueAsGuest}
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="font-semibold shadow-sm text-xs px-3.5 h-8"
            >
              <span>Instant Guest</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
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
            <span>Next-Generation Task Management • Manual, Google & Guest Login</span>
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
                Let&apos;s get back on track
              </h3>
              <p className="text-xs text-muted-foreground">
                Sign in with your work email, create an account, or dive right in as a guest.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-secondary/70 p-1 border border-border/50">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setAuthMode('guest');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'guest'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Guest
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'guest' ? (
              /* Instant Guest Flow */
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Guest mode launches a temporary sandbox workspace preloaded with sample tasks, projects, and collaboration simulation.
                </p>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleContinueAsGuest}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Entering Workspace...' : '⚡ Launch Guest Workspace'}
                </button>
              </div>
            ) : (
              /* Email/Password Form (Sign In / Sign Up) */
              <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-1">
                {authMode === 'register' && (
                  <Input
                    label="Username / Name"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<UserIcon className="h-4 w-4" />}
                    required
                  />
                )}

                <Input
                  label="Work Email"
                  type="email"
                  placeholder="alex@company.com"
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
                  className="w-full h-10 font-semibold"
                  isLoading={isSubmitting}
                >
                  {authMode === 'register' ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-4 text-center text-xs">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-3 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                Or
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary py-2.5 text-sm font-medium text-foreground transition-all active:scale-[0.98]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-[11px] text-muted-foreground/80 leading-normal">
              By continuing, you agree to our{' '}
              <span className="underline hover:text-foreground cursor-pointer">Terms of Service</span> and{' '}
              <span className="underline hover:text-foreground cursor-pointer">Privacy Policy</span>.
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
              <Button
                onClick={handleContinueAsGuest}
                variant="primary"
                size="sm"
                className="text-xs h-7 px-3"
              >
                Open Full Board
              </Button>
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
                title: 'Instant Guest Access',
                desc: 'Zero signup required. Create and manage tasks instantly with secure httpOnly session cookies.',
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
            <Layers className="h-4 w-4" />
            <span>Taskly</span>
          </div>
          <p>© 2026 Taskly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
