import React, { useState } from 'react';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotKeyModal, setForgotKeyModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email.trim() || 'wanderer@secrets.art';
    onLogin(userEmail);
  };

  const handleForgotKey = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setForgotKeyModal(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 md:p-20 overflow-hidden bg-[#131313]">
      {/* Rose Petal Cosmic Background */}
      <div 
        className="fixed inset-0 z-0 scale-105 transition-transform duration-[20s] ease-linear hover:scale-110 pointer-events-none"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtXyQZQrsR3gllS8VAkLTIxRmE4GaK3U1D5xHVZoGjzH3iGd7_DG025zt-g68FptDDQlJZK30kjYmPtFR4VIK5l_LknHp0XreXf9svlf1FfibLW04M33FFpZwHcoCXqAKtVEFYvNsFhgWD8EhzjlDp2rn1yPy2CIZu4Rmj8Ax2gl4zSKYCzCwEzXlXn8_PNv6SqWRRWOeBG0RvgSfLfQ8pCTwxI2ym2sYSjjYPGfnvx2QEp7spSP6ZfmEYCkmle8ga8Q')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Atmosphere Backdrop Blur */}
      <div className="fixed inset-0 z-0 bg-[#131313]/50 backdrop-blur-[25px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto fade-in-up">
        {/* Title & Subtitle */}
        <div className="text-center mb-12 md:mb-16 fade-in-up delay-100">
          <h1 className="font-serif text-5xl md:text-7xl text-[#e9c176] tracking-widest mb-4">
            Secrets
          </h1>
          <p className="text-[12px] uppercase tracking-[0.3em] text-[#d1c5b4]/70 font-semibold">
            A Never Ending Art
          </p>
        </div>

        {/* Enter / Join Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-10 border-b border-white/10 pb-4 fade-in-up delay-300">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`text-center text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b-2 transition-colors duration-300 cursor-pointer ${
              activeTab === 'signin'
                ? 'text-[#e9c176] border-[#e9c176]'
                : 'text-[#d1c5b4]/50 hover:text-[#e5e2e1] border-transparent'
            }`}
          >
            Enter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`text-center text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b-2 transition-colors duration-300 cursor-pointer ${
              activeTab === 'signup'
                ? 'text-[#e9c176] border-[#e9c176]'
                : 'text-[#d1c5b4]/50 hover:text-[#e5e2e1] border-transparent'
            }`}
          >
            Join
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 fade-in-up delay-500">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#d1c5b4] font-semibold" htmlFor="email">
              Identity
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="gallery-input w-full py-3 text-base text-[#e5e2e1] placeholder:text-[#d1c5b4]/30"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="block text-xs uppercase tracking-[0.2em] text-[#d1c5b4] font-semibold" htmlFor="password">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="gallery-input w-full py-3 text-base text-[#e5e2e1] placeholder:text-[#d1c5b4]/30"
              required
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="gallery-button w-full py-4 px-8 text-xs font-semibold text-[#e5e2e1] uppercase tracking-[0.2em] flex items-center justify-center gap-4 group cursor-pointer"
            >
              <span>{activeTab === 'signin' ? 'Begin' : 'Initiate Registration'}</span>
              <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">
                arrow_forward
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Lost Key Modal */}
      {forgotKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-[#1c1b1b] border border-[#e9c176]/30 p-8 rounded-sm max-w-sm w-full space-y-6">
            <h3 className="font-serif text-2xl text-[#e9c176]">Recover Access Key</h3>
            <p className="text-xs text-[#d1c5b4] leading-relaxed">
              Enter your Identity email to transmit a key recovery token across the exhibition network.
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
