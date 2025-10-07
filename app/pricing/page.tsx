'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ArrowLeft, Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    attendees: '100',
    features: [
      'Up to 100 attendees',
      'Unlimited socials',
      'Event management',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Basic',
    price: '$49',
    attendees: '200',
    features: [
      'Up to 200 attendees',
      'Unlimited socials',
      'Event management',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Contact for Payment',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$199',
    attendees: '1,000',
    features: [
      'Up to 1,000 attendees',
      'Unlimited socials',
      'Event management',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact for Payment',
  },
  {
    name: 'Enterprise',
    price: '$999',
    attendees: 'Unlimited',
    features: [
      'Unlimited attendees',
      'Unlimited socials',
      'Event management',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact for Payment',
  },
];

export default function Pricing() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LettuceConnect</span>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your events. Start free and scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.popular ? 'border-primary shadow-lg shadow-primary/20' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>Up to {tier.attendees} attendees</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.price !== '$0' && (
                      <span className="text-muted-foreground">/event</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => {
                      if (tier.name === 'Free') {
                        router.push('/');
                      }
                    }}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Payment Integration</CardTitle>
                <CardDescription>
                  Lemon Squeezy integration ready for paid tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Paid tier payments will be processed securely through Lemon Squeezy. Contact us to
                  set up your paid event and receive payment details.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Get Started Free
                  </Button>
                  <Button onClick={() => router.push('/')}>
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-semibold">Can I upgrade or downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can change your tier at any time when creating a new event.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What if I exceed my attendee limit?</h3>
                <p className="text-sm text-muted-foreground">
                  You'll need to upgrade to a higher tier before additional attendees can join.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Is there a long-term contract?</h3>
                <p className="text-sm text-muted-foreground">
                  No, all plans are per-event with no long-term commitment required.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards and payment methods through Lemon Squeezy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
