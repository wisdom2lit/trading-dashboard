'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace('/dashboard');
      }
      setMounted(true);
    };

    checkAuth();
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="glass-card sticky top-0 z-50 m-4 mb-0 rounded-b-none">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gradient"
          >
            Trading Dashboard
          </motion.div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="btn-secondary px-6 py-2">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary px-6 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-4 py-20 text-center"
      >
        <h1 className="text-6xl font-bold text-gradient mb-6">
          Professional Trading Dashboard
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Manage your trading portfolio with advanced analytics, risk management tools,
          and real-time trade tracking. Built for serious traders.
        </p>

        <div className="flex gap-4 justify-center mb-20 flex-wrap">
          <Link href="/auth/signup" className="btn-primary px-8 py-4 text-lg">
            Start Trading Now
          </Link>
          <Link href="/auth/login" className="btn-secondary px-8 py-4 text-lg">
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: 'Advanced Analytics',
              description: 'Real-time charts, win/loss ratios, and performance metrics',
              icon: '📊',
            },
            {
              title: 'Risk Management',
              description: 'Daily/weekly loss limits, stop loss, and take profit tracking',
              icon: '🛡️',
            },
            {
              title: 'Trade Journal',
              description: 'Comprehensive trade logging and analysis for improvement',
              icon: '📝',
            },
            {
              title: 'Smart Checklist',
              description: 'Weighted trading checklist with confidence scoring',
              icon: '✅',
            },
            {
              title: 'Cloud Synchronized',
              description: 'Access your data from any device, anytime, anywhere',
              icon: '☁️',
            },
            {
              title: 'Professional Grade',
              description: 'Built for traders by traders with enterprise security',
              icon: '🔐',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card p-8 hover:border-green-400/50 transition-all"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-400 border-t border-white/10 mt-20">
        <p>&copy; 2026 Trading Dashboard. All rights reserved.</p>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10 animate-pulse" />
    </div>
  );
}
