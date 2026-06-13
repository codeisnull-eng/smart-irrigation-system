'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VerdirraLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 60 Q30 45 32 20 Q42 18 52 35 Z" fill="#22c55e"/>
    <path d="M50 60 Q70 45 68 20 Q58 18 48 35 Z" fill="#16a34a"/>
    <line x1="50" y1="60" x2="50" y2="80" stroke="#166534" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M50 75 Q40 80 36 88" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M50 75 Q60 80 64 88" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M63 28 Q70 22 77 28" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M66 22 Q70 17 74 22" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="70" cy="30" r="2" fill="#4ade80"/>
  </svg>
);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setSuccess('✅ Account created! Check your email to verify your account.');
      setLoading(false);
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
            <VerdirraLogo size={36} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Verdirra
          </h1>
          <p className="text-slate-400 text-sm mt-1">Smart Irrigation System</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-white font-semibold text-xl">Create account</h2>
            <p className="text-slate-400 text-sm mt-1">Join Verdirra Smart Irrigation</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-emerald-400 font-semibold text-sm mb-2">Check your email!</p>
              <p className="text-slate-400 text-xs mb-6">We sent a verification link to <strong className="text-white">{email}</strong></p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 rounded-xl text-sm"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-medium mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="Abdullah Sabaaneh"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600">OR</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© 2026 Verdirra · Smart Irrigation System</p>
      </div>
    </div>
  );
}