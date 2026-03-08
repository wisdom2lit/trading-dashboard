'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetPassword } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await resetPassword(email);

      if (error) {
        toast.error(error.message);
      } else if (data) {
        setSent(true);
        toast.success('Check your email for password reset instructions');
      }
    } catch (err) {
      toast.error('An error occurred');
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Reset Password</h1>
            <p className="text-gray-400">
              {sent ? 'Check your email for reset instructions' : 'Enter your email to reset your password'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-400 text-lg font-semibold mb-4">✓ Email sent!</p>
              <p className="text-gray-400 mb-6">
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          )}

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-green-400 hover:text-green-300 transition font-semibold">
              ← Back to login
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      </motion.div>
    </div>
  );
}
