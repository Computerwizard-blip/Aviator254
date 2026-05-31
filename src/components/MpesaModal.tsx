/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Smartphone, Coins, Landmark, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MpesaModalProps {
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
  onWithdrawSuccess: (amount: number) => void;
  balance: number;
  depositLimit: number | null;
  totalDepositedToday: number;
  onOpenResponsibleGaming: () => void;
}

export default function MpesaModal({
  onClose,
  onDepositSuccess,
  onWithdrawSuccess,
  balance,
  depositLimit,
  totalDepositedToday,
  onOpenResponsibleGaming
}: MpesaModalProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'stk_push' | 'success'>('form');

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid currency amount in KES!");
      return;
    }

    if (tab === 'withdraw' && num > balance) {
      alert("Insufficient KES balance for withdrawal!");
      return;
    }

    if (tab === 'deposit' && depositLimit !== null && (totalDepositedToday + num) > depositLimit) {
      alert(`Deposit Limit Violation: You have already deposited ${totalDepositedToday.toLocaleString()} KES today. This transaction of ${num.toLocaleString()} KES would exceed your daily self-imposed limit of ${depositLimit.toLocaleString()} KES.\n\nYou can raise or clear your limits in the Responsible Gaming panel.`);
      return;
    }

    setLoading(true);
    setStep('stk_push');

    // Simulate STK Push authorization delay
    setTimeout(() => {
      setStep('success');
      setLoading(false);
      if (tab === 'deposit') {
        onDepositSuccess(num);
      } else {
        onWithdrawSuccess(num);
      }
    }, 3200);
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
                <div className="relative">
                  <Smartphone className="w-4.5 h-4.5 absolute left-3 top-3.5 text-gray-500" />
                  <input 
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0e0f11] text-white rounded-lg border border-[#2c2d34] text-sm font-mono outline-none focus:border-[#00e600] focus:ring-1 focus:ring-[#00e600] transition-all"
                    placeholder="e.g. 0712345678"
                  />
                </div>
              </div>

              {/* Enter Amount Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount (KES)</label>
                <div className="relative">
                  <Coins className="w-4.5 h-4.5 absolute left-3 top-3.5 text-gray-500" />
                  <input 
                    type="number"
                    min="50"
                    max="100000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#0e0f11] text-white rounded-lg border border-[#2c2d34] text-sm font-mono outline-none focus:border-[#00e600] focus:ring-1 focus:ring-[#00e600] transition-all"
                    placeholder="Min 50 KES"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-gray-500 font-bold">KES</span>
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
                {tab === 'deposit' ? `INITIALIZE STK DEPOSIT` : `REQUEST WITHDRAWAL`}
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

          {/* STEP 2: STK PUSH WAITING OVERLAY SCREEN */}
          {step === 'stk_push' && (
            <div className="py-8 flex flex-col items-center text-center gap-4 animate-scaleUp">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-t-[#00e600] border-[#1f2025] animate-spin" />
                <Smartphone className="w-6 h-6 text-white absolute inset-5" />
              </div>
              
              <div className="space-y-1.5">
                <h5 className="text-[#00e600] font-black text-sm uppercase tracking-widest animate-pulse">
                  Authorization Sent!
                </h5>
                <p className="text-xs text-gray-300 max-w-[240px] mx-auto font-medium">
                  We've sent an M-Pesa STK push to <strong className="font-mono text-white">{phoneNumber}</strong>. 
                  Please unlock your phone screen and type your PIN.
                </p>
                <div className="pt-2 text-[10px] font-mono text-gray-500">
                  Transaction ref: <strong className="text-gray-400">MPESA-STK-{Date.now().toString().slice(-6)}</strong>
                </div>
              </div>
            </div>
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
                    ? `Your payment of ${parseFloat(amount).toLocaleString()} KES has been received and credited.` 
                    : `Your withdrawal of ${parseFloat(amount).toLocaleString()} KES is dispatching instantly.`}
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
