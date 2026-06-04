/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Smartphone, Coins, Landmark, CheckCircle2, ShieldAlert, Copy, Check, ExternalLink } from 'lucide-react';
import { COUNTRIES_LIST, Country } from '../utils/countries';

interface MpesaModalProps {
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
  onWithdrawSuccess: (amount: number) => void;
  balance: number;
  depositLimit: number | null;
  totalDepositedToday: number;
  onOpenResponsibleGaming: () => void;
  authSessionMode?: 'demo' | 'real' | null;
  onToggleAuthMode?: () => void;
}

export default function MpesaModal({
  onClose,
  onDepositSuccess,
  onWithdrawSuccess,
  balance,
  depositLimit,
  totalDepositedToday,
  onOpenResponsibleGaming,
  authSessionMode = 'real',
  onToggleAuthMode
}: MpesaModalProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'stk_push' | 'success'>('form');
  const [copiedLink, setCopiedLink] = useState(false);

  // Country select dropdown picker states
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return COUNTRIES_LIST.find(c => c.code === 'KE') || COUNTRIES_LIST[0];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES_LIST.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (authSessionMode === 'demo') {
      alert("Demo Mode Check: You cannot deposit or withdraw real money under a Demo play account. Please log in or switch to your real player account to transact real cash!");
      return;
    }

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid currency amount in KSh!");
      return;
    }

    if (tab === 'deposit') {
      if (num < 100) {
        alert("Minimum deposit is 100 KSh!");
        return;
      }
      if (num > 50000) {
        alert("Maximum deposit is 50,000 KSh!");
        return;
      }
    }

    if (tab === 'withdraw') {
      if (num < 100) {
        alert("Minimum withdrawal is 100 KSh!");
        return;
      }
      if (num > 500000) {
        alert("Maximum withdrawal is 500,000 KSh!");
        return;
      }
      if (num > balance) {
        alert("Insufficient KSh balance for withdrawal!");
        return;
      }
    }

    if (tab === 'deposit' && depositLimit !== null && (totalDepositedToday + num) > depositLimit) {
      alert(`Deposit Limit Violation: You have already deposited ${totalDepositedToday.toLocaleString()} KSh today. This transaction of ${num.toLocaleString()} KSh would exceed your daily self-imposed limit of ${depositLimit.toLocaleString()} KSh.\n\nYou can raise or clear your limits in the Responsible Gaming panel.`);
      return;
    }

    setLoading(true);
    setStep('stk_push');

    if (tab === 'withdraw') {
      // Simulate direct instant dispatch delay for withdrawal payouts
      setTimeout(() => {
        setStep('success');
        setLoading(false);
        onWithdrawSuccess(num);
      }, 3200);
    } else {
      // For deposit, we let them view and click the payment checkout link manually!
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07080a]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none font-sans">
      <div className="bg-[#141518] rounded-2xl border border-[#2b2d35] max-w-sm w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-[#0d0e10] border-b border-[#212327]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center font-black text-white text-xs">
              M
            </div>
            <h4 className="text-white text-sm font-black uppercase tracking-wider">M-PESA Cashier</h4>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Buttons */}
        {step === 'form' && (
          <div className="flex border-b border-[#212327] bg-[#0d0e10]/40 p-1">
            <button
              onClick={() => setTab('deposit')}
              className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer ${tab === 'deposit' ? 'bg-[#1b1c21] text-[#00e600]' : 'text-gray-400 hover:text-white'}`}
            >
              Deposit Funds
            </button>
            <button
              onClick={() => setTab('withdraw')}
              className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg cursor-pointer ${tab === 'withdraw' ? 'bg-[#1b1c21] text-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              Withdraw Cash
            </button>
          </div>
        )}

        {/* Dynamic Display based on transaction progress steps */}
        <div className="p-5 flex-1">
          {step === 'form' && (
            <form onSubmit={handleAction} className="space-y-4">
              {authSessionMode === 'demo' && (
                <div className="bg-purple-950/45 p-3.5 rounded-xl border border-purple-850/60 text-center space-y-2.5 animate-pulse">
                  <span className="text-xl">🔒</span>
                  <div className="space-y-1">
                    <h5 className="text-purple-300 text-[11px] font-black uppercase tracking-wider">Demo Account Active</h5>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Standard sandbox deposits are restricted in Demo mode. Please switch to your real account first!
                    </p>
                  </div>
                  {onToggleAuthMode && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleAuthMode();
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-purple-800 to-indigo-900 border border-purple-500/20 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-lg hover:from-purple-700 hover:to-indigo-850 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      🔑 Switch to Real Play & Login
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#2cb400]/5 border border-[#2cb400]/15">
                <ShieldAlert className="w-4 h-4 text-[#2cb400] shrink-0" />
                <span className="text-[10.5px] text-gray-400 font-medium">
                  {tab === 'deposit' 
                    ? "Instant Safaricom STK Push will trigger direct pin screen on phone." 
                    : "Winnings dispatched to registered mobile number immediately."}
                </span>
              </div>

              {/* Enter Phone Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">M-Pesa Registered Phone</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        setSearchQuery('');
                      }}
                      className="h-11 bg-[#0e0f11] border border-[#2c2d34] rounded-lg px-2 flex items-center gap-1 text-xs text-white hover:bg-white/5 transition-all cursor-pointer select-none"
                    >
                      <span className="text-sm">{selectedCountry.flag}</span>
                      <span className="font-mono text-[11px]">+{selectedCountry.dialCode}</span>
                      <span className="text-[7px] text-[#fbbf24]">▼</span>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-64 max-h-56 bg-[#141518] border border-[#2b2d35] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden z-[70] flex flex-col font-sans animate-fadeIn">
                        <div className="p-2 border-b border-[#212327] bg-[#0d0e10]/40">
                          <input
                            type="text"
                            placeholder="Type to search country..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0e0f11] border border-[#2c2d34] rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-[#00e600]"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                          {filteredCountries.map((c) => (
                            <button
                              key={`mpesa-${c.code}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={`w-full px-3 py-1.5 flex items-center justify-between text-[11px] hover:bg-white/5 transition-colors text-left ${c.code === selectedCountry.code ? 'bg-[#1b1c21] text-[#00e600] font-bold' : 'text-slate-300'}`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <span className="font-mono text-[9px] text-gray-500 shrink-0">+{c.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-grow">
                    <Smartphone className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
                    <input 
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-3 bg-[#0e0f11] text-white rounded-lg border border-[#2c2d34] text-xs font-mono outline-none focus:border-[#00e600] focus:ring-1 focus:ring-[#00e600] transition-all"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* Enter Amount Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount (KSh)</label>
                <div className="relative">
                  <Coins className="w-4.5 h-4.5 absolute left-3 top-3.5 text-gray-500" />
                  <input 
                    type="number"
                    min="100"
                    max={tab === 'deposit' ? '50000' : '500000'}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#0e0f11] text-white rounded-lg border border-[#2c2d34] text-sm font-mono outline-none focus:border-[#00e600] focus:ring-1 focus:ring-[#00e600] transition-all"
                    placeholder={tab === 'deposit' ? "100 - 50,000 KSh" : "100 - 500,000 KSh"}
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-gray-500 font-bold">KSh</span>
                </div>
              </div>

              {/* Quick Sum Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="text-[11px] py-1.5 rounded-md font-mono bg-[#1c1d22] hover:bg-[#282a32] border border-[#25282f] text-gray-300 font-extrabold cursor-pointer transition-all active:scale-95"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              {/* Main submit button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider cursor-pointer active:scale-95 transition-all select-none ${tab === 'deposit' ? 'bg-[#2cb400] text-white hover:bg-[#34d100]' : 'bg-red-600 text-white hover:bg-red-500'}`}
              >
                {tab === 'deposit' ? `GENERATE CHECKOUT LINK` : `REQUEST WITHDRAWAL`}
              </button>

              {/* Responsible Gaming Quick Link inside Wallet */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenResponsibleGaming}
                  className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Configure Daily Deposit Limits</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: STK PUSH WAITING OR LINK CHECKOUT OVERLAY SCREEN */}
          {step === 'stk_push' && (
            tab === 'deposit' ? (
              <div className="py-4 flex flex-col items-center text-center gap-4 animate-scaleUp">
                <div className="w-12 h-12 bg-purple-950/40 border border-purple-500/20 text-[#00e600] rounded-full flex items-center justify-center text-xl shadow-lg">
                  🔗
                </div>
                
                <div className="space-y-1 w-full text-left">
                  <h5 className="text-[#00e600] text-center font-black text-sm uppercase tracking-wider">
                    Checkout Link Active!
                  </h5>
                  <p className="text-[11px] text-center text-gray-400 max-w-[260px] mx-auto leading-normal">
                    Secure M-Pesa transaction link has been dynamically provisioned for KSh <strong className="text-white font-mono">{parseFloat(amount).toLocaleString()}</strong>.
                  </p>
                </div>

                <div className="w-full bg-[#0d0e10] p-3.5 rounded-lg border border-[#212327] flex flex-col gap-2">
                  <div className="text-[9px] text-[#fbbf24] font-bold uppercase tracking-wider block font-mono">Secure Payment URL</div>
                  <div className="bg-[#141518] text-[9.5px] font-mono text-purple-300 p-2 rounded border border-[#24262c] text-left select-all truncate">
                    https://pay.casinohub.link/mpesa?amt={amount}&tel={phoneNumber}&ref=TX-{Date.now().toString().slice(-4)}
                  </div>
                  
                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => alert(`Simulated link opened for KSh ${amount}. Please pay on the checkout interface.`)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const payUrl = `https://pay.casinohub.link/mpesa?amt=${amount}&tel=${phoneNumber}`;
                        navigator.clipboard.writeText(payUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 bg-zinc-800 hover:bg-zinc-700 rounded text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                      title="Copy link to clipboard"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00e600]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="w-full pt-2 border-t border-[#212327]">
                  <p className="text-[9.5px] text-gray-500 text-center leading-normal mb-3">
                    Once payment has been simulated on the generated webpage, verify below to instantly credit your fund.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('success');
                      onDepositSuccess(parseFloat(amount));
                    }}
                    className="w-full py-3.5 bg-[#00e600] hover:bg-[#1bf31b] text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/10 cursor-pointer transition-transform active:scale-95 text-center"
                  >
                    ✅ Verify & Claim Deposit
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-center gap-4 animate-scaleUp">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-t-red-500 border-[#1f2025] animate-spin" />
                  <Smartphone className="w-6 h-6 text-white absolute inset-5" />
                </div>
                
                <div className="space-y-1.5">
                  <h5 className="text-red-500 font-black text-sm uppercase tracking-widest animate-pulse">
                    Dispatching Payout!
                  </h5>
                  <p className="text-xs text-gray-300 max-w-[240px] mx-auto font-medium">
                    We are releasing M-Pesa Cashier funds of <strong className="font-mono text-white">KSh {parseFloat(amount).toLocaleString()}</strong> to your registered mobile number...
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-gray-500">
                    Safaricom Operator Dispatch queued.
                  </div>
                </div>
              </div>
            )
          )}

          {/* STEP 3: TRANSACTION CLEARED SUCCESS OVERLAY SCREEN */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center text-center gap-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-[#0e1e0d] border-2 border-[#2b5a27] flex items-center justify-center text-4xl text-[#00e600] animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-[#00e600]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-white text-md font-black uppercase tracking-wider">
                  Cleared Successfully!
                </h4>
                <p className="text-xs text-gray-400">
                  {tab === 'deposit' 
                    ? `Your payment of ${parseFloat(amount).toLocaleString()} KSh has been received and credited.` 
                    : `Your withdrawal of ${parseFloat(amount).toLocaleString()} KSh is dispatching instantly.`}
                </p>
                <div className="mt-3 inline-block bg-[#0f210e]/60 px-3 py-1.5 rounded-lg border border-[#1a3818] font-mono text-xs text-[#00e600] font-bold">
                  Wallet updated!
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-2 text-xs py-2 px-5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
