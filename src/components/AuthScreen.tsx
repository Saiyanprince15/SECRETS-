import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [forgotKeyModal, setForgotKeyModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      if (activeTab === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;

        // If email confirmation is ON, there is no session yet.
        if (!data.session) {
          setNotice(
            'A confirmation link has been transmitted to your inbox. Confirm to receive your key.'
          );
          return;
        }
        onLogin(data.user?.email ?? email.trim());
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        if (signInError) throw signInError;
        onLogin(data.user?.email ?? email.trim());
      }
    } catch (err: any) {
      setError(err?.message ?? 'The gate did not open. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/reset` }
      );
      if (resetError) throw resetError;
      setForgotSubmitted(true);
      setTimeout(() => {
        setForgotSubmitted(false);
        setForgotKeyModal(false);
      }, 2800);
    } catch (err: any) {
      setError(err?.message ?? 'Could not transmit recovery signal.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 md:p-20 overflow-hidden bg-[#131313]">
      <div
        className="fixed inset-0 z-0 scale-105 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2400&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-0 bg-[#131313]/60 backdrop-blur-[25px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto fade-in-up">
        <div className="text-center mb-12 md:mb-16 fade-in-up delay-100">
          <h1 className="font-serif text-5xl md:text-7xl text-[#e9c176] tracking-widest mb-4">
            Secrets
          </h1>
          <p className="text-[12px] uppercase tracking-[0.3em] text-[#d1c5b4]/70 font-semibold">
            A Never Ending Art
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10 border-b border-white/10 pb-4 fade-in-up delay-300">
          {(['signin', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setError(null);
                setNotice(null);
              }}
              className={`text-center text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b-2 transition-colors duration-300 cursor-pointer ${
                activeTab === tab
                  ? 'text-[#e9c176] border-[#e9c176]'
                  : 'text-[#d1c5b4]/50 hover:text-[#e5e2e1] border-transparent'
              }`}
            >
              {tab === 'signin' ? 'Enter' : 'Join'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 fade-in-up delay-500">
          <div className="space-y-2">
            <label
              className="block text-xs uppercase tracking-[0.2em] text-[#d1c5b4] font-semibold"
              htmlFor="email"
            >
              Identity
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="gallery-input w-full py-3 text-base text-[#e5e2e1] placeholder:text-[#d1c5b4]/30"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label
                className="block text-xs uppercase tracking-[0.2em] text-[#d1c5b4] font-semibold"
                htmlFor="password"
              >
                Key
              </label>
              <button
                type="button"
                onClick={() => setForgotKeyModal(true)}
                className="text-[10px] uppercase tracking-widest text-[#d1c5b4]/50 hover:text-[#e9c176] transition-colors cursor-pointer"
              >
                Lost Key?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete={
                activeTab === 'signup' ? 'new-password' : 'current-password'
              }
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="gallery-input w-full py-3 text-base text-[#e5e2e1] placeholder:text-[#d1c5b4]/30"
              required
            />
            {activeTab === 'signup' && (
              <p className="text-[10px] tracking-wide text-[#d1c5b4]/40 pt-1">
                Minimum six characters.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 border border-[#FF4E00]/40 bg-[#FF4E00]/10 text-xs text-[#ff9a6b] leading-relaxed">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-3 border border-[#e9c176]/40 bg-[#e9c176]/10 text-xs text-[#e9c176] leading-relaxed">
              ✦ {notice}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={busy}
              className="gallery-button w-full py-4 px-8 text-xs font-semibold text-[#e5e2e1] uppercase tracking-[0.2em] flex items-center justify-center gap-4 group cursor-pointer disabled:opacity-40 disabled:cursor-wait"
            >
              <span>
                {busy
                  ? 'Opening the gate…'
                  : activeTab === 'signin'
                  ? 'Begin'
                  : 'Initiate Registration'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {forgotKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#1c1b1b] border border-[#e9c176]/30 p-8 rounded-sm max-w-sm w-full space-y-6">
            <h3 className="font-serif text-2xl text-[#e9c176]">
              Recover Access Key
            </h3>
            <p className="text-xs text-[#d1c5b4] leading-relaxed">
              Enter your Identity email to transmit a key recovery token across
              the exhibition network.
            </p>
            {forgotSubmitted ? (
              <div className="p-4 border border-[#e9c176]/50 bg-[#e9c176]/10 text-xs text-[#e9c176] text-center">
                ✦ Key restoration signal transmitted. Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotKey} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Identity email"
                  className="gallery-input w-full py-2 text-sm text-[#e5e2e1]"
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotKeyModal(false)}
                    className="px-4 py-2 text-xs uppercase tracking-widest text-[#d1c5b4]/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-[#e9c176] text-xs uppercase tracking-widest text-[#e9c176] hover:bg-[#e9c176]/10"
                  >
                    Transmit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
