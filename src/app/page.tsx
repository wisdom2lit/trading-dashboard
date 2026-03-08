'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div style={{
      background: 'linear-gradient(135deg, #0F172E 0%, #1a1f3a 25%, #2d1b4e 50%, #1a1f3a 75%, #0F172E 100%)',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        {/* Logo/Title */}
        <h1 style={{
          fontSize: '56px',
          fontWeight: 700,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #4DB6AC, #FFAB91)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          📊 Trading Dashboard
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '48px',
          lineHeight: '1.6',
        }}>
          Professional trading portfolio management & risk analytics
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/auth/signup"
            style={{
              background: 'linear-gradient(135deg, #4DB6AC, #FFAB91)',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              boxShadow: '0 0 20px rgba(77, 182, 172, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(77, 182, 172, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.4)';
            }}
          >
            Get Started
          </Link>
          <Link 
            href="/auth/login"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              padding: '14px 32px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              border: '2px solid rgba(77, 182, 172, 0.3)',
              boxShadow: '0 0 15px rgba(77, 182, 172, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
              e.currentTarget.style.borderColor = '#4DB6AC';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(77, 182, 172, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 182, 172, 0.2)';
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Minimal Features */}
        <div style={{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          <div style={{
            background: 'rgba(40,40,55,0.5)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>Advanced Analytics</p>
          </div>
          <div style={{
            background: 'rgba(40,40,55,0.5)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>Risk Management</p>
          </div>
          <div style={{
            background: 'rgba(40,40,55,0.5)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>Trade Journal</p>
          </div>
          <div style={{
            background: 'rgba(40,40,55,0.5)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>☁️</div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>Cloud Synced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
