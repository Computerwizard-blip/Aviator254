/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Crown, Phone, Calendar, Copy, LogOut, Award, Check } from 'lucide-react';
import { UserProfile, Wallet } from '../types';

interface ProfilePanelProps {
  userProfile: UserProfile;
  wallet: Wallet;
  authSessionMode: 'demo' | 'real' | null;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  triggerNotification: (title: string, message: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
}

export default function ProfilePanel({
  userProfile,
  wallet,
  authSessionMode,
  isOpen,
  onClose,
  onSignOut,
  triggerNotification
}: ProfilePanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentBalance = authSessionMode === 'real' ? wallet.realBalance : wallet.demoBalance;
  const referralCode = `REF-${userProfile.username.toUpperCase()}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    triggerNotification(
      '📋 Referral Promo Code Copied!',
      `Copied code "${referralCode}" to clipboard! Refer players to earn a 10% instant deposit commission!`,
      'general'
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-end z-[60] select-none font-sans animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Aviator-styled Slate Profile Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[#141518] border-l border-[#24262d] h-full shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col text-slate-200 overflow-hidden animate-slideLeft">
        
        {/* Header background with red Aviator angle gradient */}
        <div className="relative p-6 bg-gradient-to-br from-[#1c1d22] via-[#141518] to-red-950/20 border-b border-[#212327]">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[8px] font-black tracking-widest uppercase animate-pulse">
            Aviator Safe Profile
          </span>

          <div className="flex items-center gap-4 mt-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#e21515] to-[#ff4747] flex items-center justify-center font-black text-2xl text-white shadow-[0_0_20px_rgba(226,21,21,0.4)]">
                {userProfile.avatar || userProfile.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-[#141518] flex items-center justify-center shadow-lg">
                <Crown className="w-3.5 h-3.5 text-[#141518]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>{userProfile.fullName || 'Frank Janal'}</span>
              </h3>
              <p className="text-xs text-red-500 font-mono font-bold">
                @{userProfile.username}
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* Main live account balance */}
          <div className="bg-black/40 border border-[#23252d] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${authSessionMode === 'real' ? 'bg-[#00e600] animate-pulse' : 'bg-purple-400'}`}></span>
                <span>{authSessionMode === 'real' ? 'Real Balance Coffer' : 'Demo Practice Coffer'}</span>
              </span>
              <span className="text-[9px] bg-emerald-950/50 border border-emerald-500/20 text-[#00e600] font-bold px-1.5 py-0.5 rounded uppercase">
                Active
              </span>
            </div>
            
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-mono font-black text-[#00e600] tracking-tight">
                KSh {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400 font-bold font-mono">KES</span>
            </div>
          </div>

          {/* Account Details Specs */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black text-left">
              ID Registry Records
            </h4>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-black/25 px-4 py-3 rounded-lg flex items-center justify-between border border-[#1d1f24]">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Full Name</span>
                </div>
                <span className="text-white font-bold">{userProfile.fullName || 'Frank Janal'}</span>
              </div>

              <div className="bg-black/25 px-4 py-3 rounded-lg flex items-center justify-between border border-[#1d1f24]">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Line</span>
                </div>
                <span className="text-white">{userProfile.phone || '0712345678'}</span>
              </div>

              <div className="bg-black/25 px-4 py-3 rounded-lg flex items-center justify-between border border-[#1d1f24]">
                <div className="flex items-center gap-2 text-gray-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>VIP Rank Tier</span>
                </div>
                <span className="text-yellow-500 font-extrabold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span>{userProfile.vipLevel}</span>
                </span>
              </div>

              <div className="bg-black/25 px-4 py-3 rounded-lg flex items-center justify-between border border-[#1d1f24]">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined Date</span>
                </div>
                <span className="text-white">{userProfile.joinedDate || '2026-06-03'}</span>
              </div>
            </div>
          </div>

          {/* Promotional referral coffer */}
          <div className="bg-gradient-to-b from-[#18110b] to-[#120b06] border border-amber-600/20 p-4 rounded-xl space-y-3">
            <div className="space-y-1">
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[7.5px] font-black tracking-wider uppercase">
                🏷️ Bottom Referral Promotion
              </span>
              <h5 className="text-xs font-black text-rose-100 uppercase tracking-tight">Your Promo Code</h5>
              <p className="text-[10px] text-gray-400 leading-normal text-left">
                Keep track of this unique bottom referral token. Copy and share it to instantly claim a <strong className="text-amber-400">10% deposit commission</strong> cash back on all player reloads!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text"
                readOnly
                value={referralCode}
                className="flex-1 text-center bg-black/55 border border-amber-500/20 rounded-lg p-2 font-mono font-black text-xs text-amber-400 outline-none uppercase"
              />
              <button 
                onClick={handleCopyCode}
                className="p-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg select-none transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title="Copy referral promo code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Area with standard signout */}
        <div className="p-6 bg-black/40 border-t border-[#212327]">
          <button
            onClick={onSignOut}
            className="w-full py-3.5 bg-[#e21515] hover:bg-[#ff2020] active:scale-95 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Profile</span>
          </button>
          <div className="text-[9px] text-gray-600 text-center mt-3 font-mono">
            Secure Session Authentication verified through CasinoHub Link
          </div>
        </div>

      </div>
    </div>
  );
}
