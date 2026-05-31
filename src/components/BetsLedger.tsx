/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Clock, History, Trophy, TrendingUp, Check } from 'lucide-react';

interface BetLogItem {
  id: string;
  username: string;
  betAmount: number;
  multiplier?: number;
  payoutAmount?: number;
  cashedOut: boolean;
  timestamp: string;
}

interface BetsLedgerProps {
  myBets: {
    amount: number;
    multiplier?: number;
    payout?: number;
    time: string;
    status: 'WON' | 'LOST' | 'ACTIVE';
  }[];
  activePlayers: BetLogItem[];
  crashActive: boolean;
  crashMultiplier: number;
}

export default function BetsLedger({
  myBets,
  activePlayers,
  crashActive,
  crashMultiplier
}: BetsLedgerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'top'>('all');
  const [topRoundMultiplier, setTopRoundMultiplier] = useState<number>(312.42);

  // Static list of top ledger leaders
  const topBets = [
    { username: 'Mpesa_Guru', multiplier: 412.50, betAmount: 200, payout: 82500, date: 'Today, 08:34' },
    { username: 'Matatu_Racer', multiplier: 218.40, betAmount: 500, payout: 109200, date: 'Today, 07:12' },
    { username: 'CoinSlinger_KE', multiplier: 154.00, betAmount: 1000, payout: 154000, date: 'Yesterday, 22:45' },
    { username: 'Nairobi_Hustler', multiplier: 89.25, betAmount: 2500, payout: 223125, date: 'Yesterday, 19:15' },
    { username: 'Alpha_Bet_99', multiplier: 74.50, betAmount: 150, payout: 11175, date: '1 day ago' },
  ];

  return (
    <div className="bg-[#141518] rounded-2xl border border-[#212327] overflow-hidden select-none font-sans shrink-0">
      {/* 1. Statistics Tabs Selectors Bar */}
      <div className="flex bg-[#0d0e10] p-1 border-b border-[#212327]">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'all' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Bets</span>
        </button>

        <button 
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'my' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>My Bets</span>
        </button>

        <button 
          onClick={() => setActiveTab('top')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'top' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      </div>

      {/* 2. Main content panels list */}
      <div className="p-3">
        {/* TAB 1: ALL ACTIVE MULTIPLAYER BETS BOARD */}
        {activeTab === 'all' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-[#5f616b] uppercase font-bold tracking-wider px-2 border-b border-[#212327]/10 pb-1.5 font-mono">
              <span>User</span>
              <div className="flex gap-14 pr-2">
                <span>Bet Size</span>
                <span>Payout</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {activePlayers.map((player) => {
                const livePayout = player.cashedOut 
                  ? player.payoutAmount 
                  : crashActive ? (player.betAmount * crashMultiplier) : null;
                const showMultiplier = player.cashedOut
                  ? player.multiplier
                  : crashActive ? crashMultiplier : null;

                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between rounded-lg p-2 text-xs font-mono transition-all border ${player.cashedOut ? 'bg-[#0f210e]/40 border-[#1a3818]/60' : 'bg-[#191a1e] border-transparent'}`}
                  >
                    {/* User display */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-[8px] font-black font-sans text-red-500 uppercase border border-red-950/20 shrink-0">
                        {player.username.substring(0, 2)}
                      </div>
                      <span className="text-[#b5b7c0] text-[11px] font-semibold truncate max-w-[90px]">{player.username}</span>
                    </div>

                    {/* Bettor statistics details */}
                    <div className="flex items-center gap-12 text-right">
                      <span className="text-gray-400 text-[11px]">
                        {player.betAmount.toFixed(0)} KES
                      </span>
                      
                      {player.cashedOut ? (
                        <div className="flex items-center gap-2 pr-1">
                          <span className="text-[#00e600] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#0e1e0d] border border-[#2a5a27]/30">
                            x{showMultiplier?.toFixed(2)}
                          </span>
                          <span className="text-[#00e600] font-black text-[11px] min-w-[70px]">
                            {livePayout?.toFixed(1)} KES
                          </span>
                        </div>
                      ) : crashActive ? (
                        <div className="flex items-center gap-2 pr-1 opacity-45">
                          <span className="text-amber-500 font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#1f190e]">
                            x{showMultiplier?.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-[11px] min-w-[70px]">
                            {livePayout?.toFixed(1)} KES
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#5f616b] text-[10px] uppercase font-sans font-bold pr-4">
                          In Flight
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MY PAST PERSONAL BETS HISTORICAL LEDGER */}
        {activeTab === 'my' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-[#5f616b] uppercase font-bold tracking-wider px-2 border-b border-[#212327]/10 pb-1.5 font-mono">
              <span>Time</span>
              <span>Bet</span>
              <div className="flex gap-14 pr-2">
                <span>Mult</span>
                <span>Payout</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {myBets.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#50525b] select-none uppercase font-bold tracking-widest">
                  No registered bets yet KES
                </div>
              ) : (
                myBets.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs font-mono border ${item.status === 'WON' ? 'bg-[#0f210e]/40 border-[#1a3818]/50' : item.status === 'LOST' ? 'bg-[#291114]/20 border-[#572027]/10' : 'bg-[#191a1e] border-transparent'}`}
                  >
                    <span className="text-[#5f616b] text-[10px] shrink-0">{item.time}</span>
                    <span className="text-gray-300 font-semibold">{item.amount.toFixed(2)} KES</span>
                    
                    <div className="flex items-center gap-12 text-right">
                      {item.status === 'WON' ? (
                        <span className="text-[#00e600] text-[10px] px-1 bg-[#0e1e0d] rounded font-bold font-mono">
                          x{item.multiplier?.toFixed(2)}
                        </span>
                      ) : item.status === 'LOST' ? (
                        <span className="text-[#ff385c] text-[10px] font-sans font-bold">LOST</span>
                      ) : (
                        <span className="text-amber-500 text-[10px] font-sans font-bold animate-pulse">FLIGHT</span>
                      )}

                      <span className={`font-black min-w-[75px] ${item.status === 'WON' ? 'text-[#00e600]' : 'text-gray-500'}`}>
                        {item.status === 'WON' ? `+${item.payout?.toFixed(1)}` : '0.0'} KES
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TOP GLOBAL LEADERBOARD OF THE WEEK */}
        {activeTab === 'top' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-[#5f616b] font-bold tracking-wide px-2 border-b border-[#212327]/10 pb-1.5 font-mono">
              <span>LEADER NAME</span>
              <div className="flex gap-14 pr-2">
                <span>MULTIPLIER</span>
                <span>PAYOUT VALUE</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {topBets.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between bg-[#191a1e] hover:bg-[#202248]/30 rounded-lg p-2.5 text-xs font-mono border border-transparent"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold font-sans text-xs">#{idx + 1}</span>
                    <span className="text-white font-semibold truncate max-w-[100px]">{item.username}</span>
                  </div>

                  <div className="flex items-center gap-14 text-right">
                    <span className="text-[#bf5af2] font-black px-1.5 py-0.5 rounded bg-[#1e1329] border border-[#3e2754]/20">
                      x{item.multiplier.toFixed(2)}
                    </span>
                    <span className="text-[#00e600] font-black text-[11px] min-w-[85px]">
                      {item.payout.toLocaleString()} KES
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
