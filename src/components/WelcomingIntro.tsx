import React, { useState, useEffect } from 'react';
import { Lock, User, Smartphone, Eye, EyeOff, ShieldCheck, HelpCircle, ArrowLeft, Coins, Compass, Gift } from 'lucide-react';

interface WelcomingIntroProps {
  onLoginSuccess: (fullName: string, phone: string, mode: 'demo' | 'real', referralCode?: string) => void;
}

export default function WelcomingIntro({ onLoginSuccess }: WelcomingIntroProps) {
  // Screens: 'welcome' | 'register' | 'login' | 'lock' | 'recover'
  const [screen, setScreen] = useState<'welcome' | 'register' | 'login' | 'lock' | 'recover'>('welcome');

  // Input states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralInput, setReferralInput] = useState('');

  // Recovery states
  const [recoveryFullName, setRecoveryFullName] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Lockscreen states
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');

  // General errors
  const [formError, setFormError] = useState('');

  // Retrieve existing account if any on render
  useEffect(() => {
    const savedAccount = localStorage.getItem('casinohub_registered_account');
    const isUnlockedSession = sessionStorage.getItem('casinohub_session_authenticated') === 'true';

    if (savedAccount) {
      if (!isUnlockedSession) {
        setScreen('lock'); // Lock app until the password is correct
      }
    } else {
      setScreen('welcome');
    }
  }, []);

  // Saved user lookup helper
  const getSavedUser = () => {
    const saved = localStorage.getItem('casinohub_registered_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // 1. Direct Demo entry
  const handleLaunchDemo = () => {
    onLoginSuccess('Demo Player', '0700000000', 'demo');
  };

  // 2. Real Play Click (creates or logins)
  const handleRealPlaySelection = () => {
    const account = getSavedUser();
    if (account) {
      setScreen('login');
    } else {
      setScreen('register');
    }
  };

  // 3. Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = fullName.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName !== 'frank janal') {
      setFormError('Account creation blocked. Authorized full name is restricted to "frank janal".');
      return;
    }
    if (cleanPhone !== '0117051321') {
      setFormError('Account creation blocked. Authorized phone number is restricted to "0117051321".');
      return;
    }
    if (password !== '4298') {
      setFormError('Account creation blocked. Authorized PIN password is restricted to "4298".');
      return;
    }

    const newAccount = {
      fullName: 'Frank Janal',
      phone: '0117051321',
      password: '4298'
    };

    localStorage.setItem('casinohub_registered_account', JSON.stringify(newAccount));
    localStorage.removeItem('casinohub_wallet_balances'); // Starts with 0.00 in real mode as requested
    sessionStorage.setItem('casinohub_session_authenticated', 'true');
    
    // Auto login as Real Player
    onLoginSuccess(newAccount.fullName, newAccount.phone, 'real', referralInput);
  };

  // 4. Handle Password login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password !== '4298') {
      setFormError('Incorrect passcode. Please utilize authorized passcode "4298".');
      return;
    }

    const verifiedAccount = {
      fullName: 'Frank Janal',
      phone: '0117051321',
      password: '4298'
    };
    localStorage.setItem('casinohub_registered_account', JSON.stringify(verifiedAccount));
    sessionStorage.setItem('casinohub_session_authenticated', 'true');
    onLoginSuccess(verifiedAccount.fullName, verifiedAccount.phone, 'real', referralInput);
  };

  // 5. Handle Returning User lockscreen unlock submission
  const handleLockscreenUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');

    if (lockPassword === '4298') {
      const verifiedAccount = {
        fullName: 'Frank Janal',
        phone: '0117051321',
        password: '4298'
      };
      localStorage.setItem('casinohub_registered_account', JSON.stringify(verifiedAccount));
      sessionStorage.setItem('casinohub_session_authenticated', 'true');
      onLoginSuccess(verifiedAccount.fullName, verifiedAccount.phone, 'real');
    } else {
      setLockError('Incorrect password. Please utilize authorized passcode "4298".');
    }
  };

  // 6. Handle forgotten password recovery and reset
  const handleRecoveryResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    const account = getSavedUser();
    if (!account) {
      setRecoveryError('No account found. Create a new one.');
      return;
    }

    // Verify both full name and phone match exactly
    const matchName = account.fullName.trim().toLowerCase() === recoveryFullName.trim().toLowerCase();
    const matchPhone = account.phone.trim() === recoveryPhone.trim();

    if (matchName && matchPhone) {
      if (newPassword.length < 4) {
        setRecoveryError('New password must be at least 4 characters.');
        return;
      }

      // Save updated account with new password
      const updatedAccount = {
        ...account,
        password: newPassword
      };
      localStorage.setItem('casinohub_registered_account', JSON.stringify(updatedAccount));
      sessionStorage.setItem('casinohub_session_authenticated', 'true');
      
      alert('Password updated successfully! Welcome back.');
      onLoginSuccess(updatedAccount.fullName, updatedAccount.phone, 'real');
    } else {
      setRecoveryError('Invalid Full Name or Phone Number. Details do not match our system.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080310] overflow-y-auto flex items-center justify-center font-sans">
      
      {/* Visual background atmospheric elements simulating cockpit deep red glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,21,21,0.18)_0%,rgba(8,3,16,1)_75%)] pointer-events-none"></div>

      {/* Screen Frame Container */}
      <div className="relative w-full max-w-md mx-4 bg-[#0d0418]/95 border border-purple-900/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(226,21,21,0.12)] overflow-hidden">
        
        {/* Absolute decorative star lights or coin glows */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-yellow-400 rounded-full blur-[1px] opacity-70 animate-ping"></div>
        <div className="absolute bottom-1/3 right-12 w-2.5 h-2.5 bg-yellow-500 rounded-full blur-[1px] opacity-60 animate-bounce delay-150"></div>

        {/* ========================================================
            SCREEN 1: WELCOMING VISUAL INTRO SHOWCASE
            ======================================================== */}
        {screen === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-6 py-4 relative z-10 selection:bg-purple-900/30">
            
            {/* Elegant header branding bar */}
            <div className="flex items-center gap-1.5 opacity-80 mb-2">
              <Compass className="w-4 h-4 text-purple-400 animate-spin-slow" />
              <span className="text-[10px] uppercase font-black tracking-widest text-purple-300 font-mono">
                Official CASINOHUB Landing
              </span>
            </div>

            {/* Red high-concept propeller fighter plane illustration block */}
            <div className="relative w-44 h-28 my-2 flex items-center justify-center">
              {/* Outer light glow panel */}
              <div className="absolute w-32 h-32 bg-red-600/10 rounded-full blur-2xl animate-pulse"></div>
              
              {/* Spinning/floating dollar coins */}
              <div className="absolute -top-3 left-4 text-2xl animate-bounce duration-1000">🪙</div>
              <div className="absolute -right-2 top-2 text-xl animate-bounce duration-1500 delay-300">🪙</div>
              <div className="absolute -left-3 bottom-0 text-lg animate-bounce duration-1200 delay-500">🪙</div>
              <div className="absolute right-6 -bottom-2 text-2xl animate-bounce duration-1000 delay-700">🪙</div>

              {/* Red airplane layered element */}
              <div className="relative transition-transform duration-300 hover:scale-105 active:rotate-1">
                <span className="text-[120px] leading-none select-none drop-shadow-[0_12px_24px_rgba(220,38,38,0.5)]">
                  ✈️
                </span>
                {/* Simulated propeller rotation effect */}
                <span className="absolute left-[54px] top-[14px] text-lg text-amber-400 animate-spin flex items-center justify-center leading-none select-none">
                  ⚙️
                </span>
              </div>
            </div>

            {/* Highly striking display typography title from the mockup screenshot */}
            <div className="space-y-1 select-none">
              <h1 className="text-white text-3xl font-black italic uppercase leading-none tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                Win Up to
              </h1>
              <h2 className="text-[#fbbf24] text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(251,191,36,0.35)] animate-pulse">
                4 MILLION
              </h2>
              <h1 className="text-white text-3xl font-black italic uppercase leading-none tracking-normal">
                In Seconds!
              </h1>
            </div>

            {/* Custom interactive action controls matching mock */}
            <div className="w-full space-y-4 pt-4">
              
              {/* Click to play demo > (Purple styling) */}
              <button
                onClick={handleLaunchDemo}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_8px_30px_rgba(125,18,255,0.4)] active:scale-[0.98] border border-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Click to play demo</span>
                <span className="text-sm font-semibold">❯</span>
              </button>

              {/* "Or" Separator element */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="h-[1px] w-12 bg-white/10"></div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 font-mono">
                  Or
                </span>
                <div className="h-[1px] w-12 bg-white/10"></div>
              </div>

              {/* Login for real play (Green active button) */}
              <button
                onClick={handleRealPlaySelection}
                className="w-full py-4 px-6 bg-[#4ea300] hover:bg-[#5fc502] text-white font-extrabold uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_8px_30px_rgba(78,163,0,0.4)] active:scale-[0.98] border-b-2 border-emerald-800 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Login for real play</span>
              </button>
            </div>

            {/* Regulatory small-print footer */}
            <p className="text-[9px] text-gray-500 max-w-xs leading-relaxed font-sans mt-3">
              18+ Only. Play responsibly. Standard gaming operator terms apply. Simulated betting available for study purposes.
            </p>
          </div>
        )}

        {/* ========================================================
            SCREEN 2: REGISTER PROFILE DIALOG (Full Name, Phone, Password)
            ======================================================== */}
        {screen === 'register' && (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-3">
              <button 
                onClick={() => setScreen('welcome')}
                className="p-1 px-2.5 rounded bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Create Real Play Account</h2>
                <p className="text-[9.5px] text-purple-400 font-sans">Set up your credentials to earn true achievements</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl p-3 text-[10px] leading-relaxed font-mono">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Full Name (For Recovery/Identity Verification)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. Francis Pendy"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="e.g. 0712345678"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="Set private PIN/Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-purple-450 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#fbbf24] font-black uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Referral Promo Code (Optional)</span>
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-3 w-4 h-4 text-amber-500/60 font-mono" />
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 uppercase placeholder:text-gray-600"
                    placeholder="Enter friend's referral code if any"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#4ea300] hover:bg-[#5fc502] text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Create Account & Enter cockpit
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <button 
                onClick={() => setScreen('login')}
                className="text-[10px] text-purple-400 hover:text-amber-300 font-sans tracking-wide underline"
              >
                Already have an Account? Login here
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 3: LOGIN SCREEN (Password verify for registered user)
            ======================================================== */}
        {screen === 'login' && (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-3">
              <button 
                onClick={() => setScreen('welcome')}
                className="p-1 px-2.5 rounded bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Login to Real Play</h2>
                <p className="text-[9.5px] text-purple-400 font-sans">Verify your secret passcode to begin betting</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl p-3 text-[10px] leading-relaxed font-mono">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Enter Your Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder="Your secret passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-purple-450 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#fbbf24] font-black uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Referral Promo Code (Optional)</span>
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-3 w-4 h-4 text-amber-500/60 font-mono" />
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 uppercase placeholder:text-gray-600"
                    placeholder="Enter friend's referral code if any"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#4ea300] hover:bg-[#5fc502] text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Enter Cockpit Lounge
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => setScreen('register')}
                className="text-[10px] text-purple-400 hover:text-white underline cursor-pointer"
              >
                No account? Register
              </button>
              <button 
                onClick={() => {
                  setRecoveryError('');
                  setScreen('recover');
                }}
                className="text-[10px] text-amber-500 hover:text-amber-400 underline cursor-pointer"
              >
                Forgot Password? Retrieve
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 4: RECURRING SESSION PASSWORD-LOCK DIALOG
            ======================================================== */}
        {screen === 'lock' && (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-950/40 border-2 border-purple-500 flex items-center justify-center text-purple-400 rounded-full animate-bounce">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-black uppercase text-white tracking-wider">Welcome back</h2>
              <p className="text-[10.5px] text-purple-300">
                Unlock your CasinoHub session. Please key in your password:
              </p>
            </div>

            {lockError && (
              <div className="bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl p-2.5 text-[9.5px] font-mono">
                ⚠️ {lockError}
              </div>
            )}

            <form onSubmit={handleLockscreenUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter Password PIN"
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  className="w-full bg-black/40 border border-purple-900 text-center py-2.5 rounded-xl text-sm font-black focus:outline-none focus:border-amber-400 text-white tracking-widest focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#4ea300] hover:bg-[#5fc502] text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Unlock Session
                </button>
                <button
                  type="button"
                  onClick={handleLaunchDemo}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-bold rounded-xl transition-colors uppercase cursor-pointer"
                >
                  Play Demo
                </button>
              </div>
            </form>

            <div className="pt-2">
              <button 
                onClick={() => {
                  setRecoveryError('');
                  setScreen('recover');
                }}
                className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold underline cursor-pointer"
              >
                Forgotten your password? Recover here
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 5: PASSWORD RECOVERY SYSTEM (Must match Full Name + Phone)
            ======================================================== */}
        {screen === 'recover' && (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-3">
              <button 
                onClick={() => {
                  const account = getSavedUser();
                  setScreen(account ? 'lock' : 'welcome');
                }}
                className="p-1 px-2.5 rounded bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Reset & Recover Account</h2>
                <p className="text-[9.5px] text-purple-400 font-sans">Fill in matching registration fields to set new PIN</p>
              </div>
            </div>

            {recoveryError && (
              <div className="bg-red-950/40 text-red-500 border border-red-500/20 rounded-xl p-3 text-[10px] leading-relaxed font-mono">
                ⚠️ {recoveryError}
              </div>
            )}

            <form onSubmit={handleRecoveryResetSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type="text"
                    required
                    value={recoveryFullName}
                    onChange={(e) => setRecoveryFullName(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Must match original registration name"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-purple-300 font-black uppercase tracking-wider block mb-1.5">
                  Registered Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-4 h-4 text-purple-450" />
                  <input
                    type="tel"
                    required
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    className="w-full bg-black/40 border border-purple-900/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="Must match original phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-amber-400 font-black uppercase tracking-wider block mb-1.5">
                  Define New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-500/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-amber-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Enter new strong password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Verify info & Update Password
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
