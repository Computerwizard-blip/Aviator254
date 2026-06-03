/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Menu, ArrowLeft, PlusCircle, Volume2, VolumeX, ShieldAlert, Bell, Gamepad2, User } from 'lucide-react';
import { UserProfile } from '../types';

interface AviatorHeaderProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenResponsibleGaming: () => void;
  muted: boolean;
  onToggleMute: () => void;
  currentView?: 'aviator' | 'lobby' | 'admin';
  setView?: (view: 'aviator' | 'lobby' | 'admin') => void;
  notificationsCount?: number;
  onToggleNotifications?: () => void;
  authSessionMode?: 'demo' | 'real' | null;
  onToggleAuthSessionMode?: () => void;
  userProfile?: UserProfile;
  onOpenProfile: () => void;
}

export default function AviatorHeader({ 
  balance, 
  onOpenDeposit,
  onOpenResponsibleGaming,
  muted,
  onToggleMute,
  currentView = 'aviator',
  setView,
  notificationsCount = 0,
  onToggleNotifications,
  authSessionMode,
  onToggleAuthSessionMode,
  userProfile,
  onOpenProfile
}: AviatorHeaderProps) {
  const [exitConfirm, setExitConfirm] = useState(false);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBackClick = () => {
    if (exitConfirm) {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
      setExitConfirm(false);
      if (setView) setView('lobby');
    } else {
      setExitConfirm(true);
      exitTimeoutRef.current = setTimeout(() => {
        setExitConfirm(false);
      }, 3000);
    }
  };

  return (
    <header className="h-14 bg-[#141518] px-4 flex items-center justify-between border-b border-[#212327] select-none shrink-0">
      {/* Target Action - Navigation */}
      {currentView !== 'lobby' ? (
        <button 
          onClick={handleBackClick}
          className={`flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer border rounded px-2.5 py-1.5 ${
            exitConfirm 
              ? 'border-red-500 bg-red-950/65 text-red-100 font-bold animate-pulse' 
              : 'border-gray-800 bg-black/25 text-[#9b9da4] hover:text-[#d1d2d6]'
          }`}
          title="Click again to exit back to Casino grounds"
        >
          <ArrowLeft className={`w-3.5 h-3.5 transition-colors ${exitConfirm ? 'text-red-400' : 'text-amber-500'}`} />
          <span>{exitConfirm ? "Click again to exit" : "Back"}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-black uppercase tracking-wider">
          <Gamepad2 className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">Casino Grounds</span>
        </div>
      )}

      {/* Styled Brand Name Logo (Slanted Red or Purple Typography) */}
      <div className="flex items-center gap-1 border-x border-[#212327] px-4 self-stretch cursor-pointer group select-none" onClick={() => setView?.('lobby')}>
        <span className={`text-sm sm:text-base font-black italic tracking-wide uppercase transition-transform duration-300 ${currentView === 'aviator' ? 'text-[#e21515] drop-shadow-[0_2px_4px_rgba(226,21,21,0.25)]' : 'text-purple-400 drop-shadow-[0_2px_4px_rgba(168,85,247,0.25)]'}`}>
          {currentView === 'aviator' ? 'Aviator' : 'CasinoHub'}
        </span>
        {currentView === 'aviator' ? (
          <span className="text-xs text-red-500 animate-spin shrink-0">⚙️</span>
        ) : (
          <span className="text-[10px] text-purple-400 animate-pulse">♣️</span>
        )}
      </div>

      {/* KES Wallet Counter, Audio Volume, Notification alert and Safety Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Toggle Demo vs Real play mode */}
        {onToggleAuthSessionMode && authSessionMode && (
          <button
            onClick={onToggleAuthSessionMode}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm border transition-all active:scale-95 ${
              authSessionMode === 'real'
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-900/10'
                : 'bg-purple-950/30 text-purple-300 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-900/10'
            }`}
            title={`Switch to ${authSessionMode === 'real' ? 'Demo Practice' : 'Real Play'} mode`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${authSessionMode === 'real' ? 'bg-[#00e600] animate-pulse' : 'bg-purple-400'}`}></span>
            <span>{authSessionMode === 'real' ? 'Real Play' : 'Demo Play'}</span>
          </button>
        )}

        {/* Clickable Wallet display - triggers MPesa Overlay */}
        <div 
          onClick={onOpenDeposit}
          className="flex items-center gap-1 bg-[#0e160e] border border-[#2b5c2a] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg cursor-pointer hover:bg-[#1a2d19] transition-all select-none active:scale-95"
          title="M-Pesa cash transaction till deposit"
        >
          <span className="text-xs font-mono font-black text-[#00e600] tracking-tight">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] font-bold text-gray-400 font-mono">KSh</span>
        </div>

        {/* Highly prominent green Deposit button */}
        <button
          onClick={onOpenDeposit}
          className="bg-[#00e600] hover:bg-[#1bf31b] active:bg-[#00cc00] text-black text-xs font-black px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg uppercase tracking-wider transition-all scale-100 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 font-sans shadow-[0_0_15px_rgba(0,230,0,0.3)] border border-[#00e600]"
          title="Deposit money now"
        >
          <PlusCircle className="w-3.5 h-3.5 text-black" />
          <span>DEPOSIT</span>
        </button>

        {/* Dynamic global Notification bells */}
        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className={`w-7.5 h-7.5 flex items-center justify-center rounded transition-all active:scale-92 cursor-pointer border border-[#25282e] hover:bg-[#25282e] ${notificationsCount > 0 ? 'text-amber-400 hover:text-amber-300' : 'text-[#9b9da4] hover:text-white'}`}
            title="Lobby Alerts Feed"
          >
            <Bell className="w-3.5 h-3.5" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[7.5px] font-black text-white select-none animate-pulse">
                {notificationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Sound Toggle Option */}
        <button 
          onClick={onToggleMute}
          className={`w-7.5 h-7.5 flex items-center justify-center rounded transition-all active:scale-92 cursor-pointer border border-[#25282e] ${muted ? 'text-red-500 hover:text-red-400 bg-red-950/10' : 'text-[#9b9da4] hover:text-white hover:bg-[#25282e]'}`}
          title={muted ? "Unmute sound effects" : "Mute sound effects"}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Responsible Gaming & Profile toggle */}
        <button 
          onClick={onOpenResponsibleGaming}
          className="w-7.5 h-7.5 flex items-center justify-center text-emerald-400 hover:text-emerald-300 bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/10 rounded transition-colors active:scale-90 cursor-pointer"
          title="Responsible Gaming & Safety Controls"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Real Aviator-Like User Profile Badge */}
        {userProfile && (
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e21515] to-[#ff4747] border-2 border-red-500/50 hover:border-red-400 flex items-center justify-center text-white text-[10px] font-black tracking-tight cursor-pointer shadow-[0_0_12px_rgba(226,21,21,0.3)] hover:shadow-[0_0_16px_rgba(226,21,21,0.5)] transition-all active:scale-[0.88] uppercase shrink-0 select-none"
            title="Open Account Profile Drawer"
          >
            {userProfile.avatar || userProfile.fullName?.substring(0, 2).toUpperCase() || userProfile.username.substring(0, 2).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  );
}
