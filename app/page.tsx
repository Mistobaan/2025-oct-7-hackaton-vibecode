'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Leaf, Users, Zap, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LettuceConnect</span>
          </div>
          <Button onClick={() => setAuthModalOpen(true)} variant="outline">
            Sign In
          </Button>
        </nav>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight">
              Connect at <span className="text-primary">Real-World</span> Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Instantly share your social profiles at conferences, parties, and spontaneous meetups.
              No more awkward contact exchanges.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setAuthModalOpen(true)} className="text-lg">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/pricing')}>
              View Pricing
            </Button>
          </div>

          <div className="relative w-64 h-64 mx-auto my-16">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <Leaf className="w-64 h-64 text-primary relative z-10" strokeWidth={1} />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="space-y-4 p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Connection</h3>
              <p className="text-muted-foreground">
                Share all your socials with one tap. LinkedIn, Instagram, X, TikTok, and more.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Event Codes</h3>
              <p className="text-muted-foreground">
                Join events with a simple code. See everyone attending and their open profiles.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Control Your Privacy</h3>
              <p className="text-muted-foreground">
                Toggle which socials are visible per event. You decide what to share and when.
              </p>
            </div>
          </div>

          <div className="mt-20 p-8 rounded-lg bg-primary/5 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-semibold">Join or Create Event</h4>
                <p className="text-sm text-muted-foreground">
                  Enter a party code or start your own event
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-semibold">Connect Your Socials</h4>
                <p className="text-sm text-muted-foreground">
                  Add your profiles and choose what to share
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-semibold">Network Instantly</h4>
                <p className="text-sm text-muted-foreground">
                  Tap to connect with anyone at the event
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-32 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LettuceConnect. Making networking natural.</p>
        </footer>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </main>
  );
}
