/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, ArrowLeft, PlusCircle, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

interface AviatorHeaderProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenResponsibleGaming: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export default function AviatorHeader({ 
  balance, 
  onOpenDeposit,
  onOpenResponsibleGaming,
  muted,
  onToggleMute
}: AviatorHeaderProps) {
  return (
    <header className="h-14 bg-[#141518] px-4 flex items-center justify-between border-b border-[#212327] select-none shrink-0">
      {/* Target Action - Go Back */}
      <button 
        onClick={() => {
          if (confirm("Go back to Lobby?")) {
            // Simulated Go Back redirect
          }
        }}
        className="flex items-center gap-1 text-[#9b9da4] hover:text-[#d1d2d6] transition-colors text-sm font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </button>

      {/* Styled Aviator Brand Name Logo (Slanted Red Typography) */}
      <div className="flex items-center gap-1.5 cursor-default select-none group">
        <span className="text-xl font-black italic tracking-wider text-[#e21515] uppercase select-none drop-shadow-[0_2px_4px_rgba(226,21,21,0.25)] group-hover:scale-105 transition-transform duration-300">
          Aviator
        </span>
        {/* Cute red mini propeller icon representation */}
        <span className="text-xs text-red-500 animate-spin shrink-0 text-shadow-glow">⚙️</span>
      </div>

      {/* KES Wallet Counter, Audio Volume, and Responsible Gaming Drawer activator */}
      <div className="flex items-center gap-2">
        {/* Clickable Wallet display - triggers MPesa Overlay */}
        <div 
          onClick={onOpenDeposit}
          className="flex items-center gap-1.5 bg-[#0e160e] border border-[#2b5c2a] px-2.5 py-1.5 rounded-full cursor-pointer hover:bg-[#1a2d19] transition-all select-none active:scale-95"
          title="M-Pesa cash transaction till deposit"
        >
          <span className="text-xs font-mono font-black text-[#00e600] tracking-tight">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-bold text-[#eaeaea] font-mono">KES</span>
          <PlusCircle className="w-3.5 h-3.5 text-[#00e600] shrink-0" />
        </div>

        {/* Global Sound Toggle Option */}
        <button 
          onClick={onToggleMute}
          className={`w-8 h-8 flex items-center justify-center rounded transition-all active:scale-92 cursor-pointer ${muted ? 'text-red-500 hover:text-red-400 bg-red-950/10 hover:bg-red-950/20' : 'text-[#9b9da4] hover:text-white hover:bg-[#25282e]'}`}
          title={muted ? "Unmute sound effects" : "Mute sound effects"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Responsible Gaming & Profile toggle */}
        <button 
          onClick={onOpenResponsibleGaming}
          className="w-8 h-8 flex items-center justify-center text-emerald-400 hover:text-emerald-300 bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/10 rounded transition-colors active:scale-90 cursor-pointer"
          title="Responsible Gaming & Safety Controls"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
}
