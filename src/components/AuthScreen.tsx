import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { hapticTap, hapticConfirm, hapticToggle } from '../lib/haptics';
import { audioEngine } from '../lib/audioEngine';
import { FallingPetals } from './FallingPetals';

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
    hapticConfirm();
    audioEngine.playButtonClick();

    try {
      if (activeTab === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('A confirmation link has been transmitted to your inbox. Confirm to receive your key.');
          return;
        }
        onLogin(data.user?.email ?? email.trim());
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
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
    hapticConfirm();
    audioEngine.playButtonClick();
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/reset` }
      );
      if (resetError) throw resetError;
      setForgotSubmitted(true);
      setTimeout(() => { setForgotSubmitted(false); setForgotKeyModal(false); }, 2800);
    } catch (err: any) {
      setError(err?.message ?? 'Could not transmit recovery signal.');
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#D9D9D9' }}
    >
      {/* ── Background plate — matches the image's own grey exactly ── */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: '#D9D9D9' }} />

      {/* ── Title artwork — untouched, z-[1] so petals fly in front ── */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
        <img
          src="/Component_1.png"
          alt="Secrets — A Never Ending Art"
          width={720}
          height={400}
          className="w-[min(92vw,720px)] h-auto select-none"
          draggable={false}
        />
      </div>

      {/* ── Petals in front of the image ── */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <FallingPetals petalCount={55} tone="ink" />
      </div>

      {/* ── Form sits above petals ── */}
      <div className="relative z-[4] w-full flex flex-col items-center justify-end min-h-screen pb-16 px-6">
        <div className="w-full max-w-sm mx-auto">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-4 mb-8 border-b border-black/15 pb-4">
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  hapticToggle();
                  audioEngine.playButtonClick();
                  setActiveTab(tab);
                  setError(null);
                  setNotice(null);
                }}
                className={`text-center text-[10px] uppercase tracking-[0.25em] font-semibold pb-2 border-b-2 transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? 'text-black border-black'
                    : 'text-black/40 border-transparent hover:text-black/70'
                }`}
              >
                {tab === 'signin' ? 'Enter' : 'Join'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black/60 font-semibold" htmlFor="auth-email">
                Identity
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent border-b border-black/30 py-2.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-black/60 font-semibold" htmlFor="auth-password">
                  Key
                </label>
                <button
                  type="button"
                  onClick={() => { hapticTap(); audioEngine.playButtonClick(); setForgotKeyModal(true); }}
                  className="text-[9px] uppercase tracking-widest text-black/40 hover:text-black transition-colors cursor-pointer"
                >
                  Lost Key?
                </button>
              </div>
              <input
                id="auth-password"
                type="password"
                autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border-b border-black/30 py-2.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                required
              />
              {activeTab === 'signup' && (
                <p className="text-[9px] tracking-wide text-black/35 pt-1">Minimum six characters.</p>
              )}
            </div>

            {error && (
              <div className="p-3 border border-black/20 bg-black/5 text-xs text-black/70 leading-relaxed">
                {error}
              </div>
            )}
            {notice && (
              <div className="p-3 border border-black/20 bg-black/5 text-xs text-black/70 leading-relaxed">
                ✦ {notice}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="group relative w-full py-3.5 px-8 border border-black/60 bg-transparent text-[10px] font-semibold uppercase tracking-[0.35em] text-black overflow-hidden transition-all duration-500 hover:bg-black hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-wait"
              >
                <span className="relative z-10">
                  {busy
                    ? 'Opening the gate…'
                    : activeTab === 'signin'
                    ? 'Begin'
                    : 'Initiate Registration'}
                </span>
                {/* shimmer */}
                <div
                  className="absolute top-0 left-[-100%] w-[60%] h-full skew-x-[-20deg] group-hover:left-[140%] transition-all duration-[1200ms] ease-out pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)' }}
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Forgot key modal ── */}
      {forgotKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-6">
          <div className="bg-[#D9D9D9] border border-black/20 p-8 max-w-sm w-full space-y-6">
            <h3 className="font-serif text-2xl text-black">Recover Access Key</h3>
            <p className="text-xs text-black/60 leading-relaxed">
              Enter your Identity email to transmit a key recovery token.
            </p>
            {forgotSubmitted ? (
              <div className="p-4 border border-black/20 text-xs text-black/70 text-center">
                ✦ Key restoration signal transmitted. Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotKey} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Identity email"
                  className="w-full bg-transparent border-b border-black/30 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black"
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { hapticTap(); audioEngine.playButtonClick(); setForgotKeyModal(false); }}
                    className="px-4 py-2 text-[10px] uppercase tracking-widest text-black/50 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-black/60 text-[10px] uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
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
