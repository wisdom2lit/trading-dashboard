'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { signUp } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        toast.error(error.message);
      } else if (data?.user) {
        toast.success('Account created! Check your email to confirm.');
        router.replace('/auth/login');
      }
    } catch (err) {
      toast.error('An error occurred during signup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Glass card form */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Trading Dashboard</h1>
            <p className="text-gray-400">Create your account</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:bg-white/10 transition"
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:bg-white/10 transition"
              />
              <p className="text-xs text-gray-500 mt-2">At least 8 characters</p>
            </div>

            {/* Confirm password input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:bg-white/10 transition"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-400 hover:text-green-300 transition font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      </motion.div>
    </div>
  );
}
