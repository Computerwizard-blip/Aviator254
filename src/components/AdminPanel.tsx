/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Settings, 
  ShieldAlert, 
  CheckCircle, 
  DollarSign, 
  Sliders, 
  PlusCircle, 
  Trash2, 
  VolumeX, 
  Activity,
  Award
} from 'lucide-react';
import { UserProfile, Wallet, JackpotPool, Transaction } from '../types';

interface AdminPanelProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  wallet: Wallet;
  setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
  jackpotPool: JackpotPool;
  setJackpotPool: React.Dispatch<React.SetStateAction<JackpotPool>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'> & { status?: 'SUCCESS' | 'FAILED' | 'PENDING' }) => void;
  triggerNotification: (title: string, message: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
}

export default function AdminPanel({
  userProfile,
  setUserProfile,
  wallet,
  setWallet,
  jackpotPool,
  setJackpotPool,
  transactions,
  addTransaction,
  triggerNotification
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'jackpots' | 'finances' | 'providers'>('finances');
  
  // Custom players list mock data state
  const [players, setPlayers] = useState<any[]>([
    { id: 'usr-01', username: 'francypendy', email: 'francypendy@gmail.com', phone: '0712345678', wallet: 142580.45, vip: 'Silver', status: 'ACTIVE' },
    { id: 'usr-02', username: 'VIP_SlotsKing', email: 'slotsking@macau.io', phone: '+853-6231-9011', wallet: 94812.00, vip: 'Diamond', status: 'ACTIVE' },
    { id: 'usr-03', username: 'AceSpeculat8', email: 'blackjackace@gmut.net', phone: '+1-505-184-9021', wallet: 31200.00, vip: 'Platinum', status: 'ACTIVE' },
    { id: 'usr-04', username: 'BettedLosers', email: 'unlucky_user@gmail.com', phone: '+254-711-223-344', wallet: 5.50, vip: 'Bronze', status: 'SUSPENDED' },
  ]);

  // Handle player balance modification triggers
  const [targetPlayerId, setTargetPlayerId] = useState<string>('usr-01');
  const [adjustAmount, setAdjustAmount] = useState<string>('500');

  const onAdjustBalance = (type: 'add' | 'subtract') => {
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (targetPlayerId === 'usr-01') {
      // Modify active mock user's real balance context
      if (type === 'add') {
        setWallet(w => ({ ...w, mainBalance: w.mainBalance + amt }));
        triggerNotification('Admin Bonus Added', `Administrator loaded +$${amt.toFixed(2)} cash directly into your wallet.`, 'bonus');
      } else {
        setWallet(w => ({ ...w, mainBalance: Math.max(0, w.mainBalance - amt) }));
        triggerNotification('Admin Balance Deducted', `Administrator withdrew $${amt.toFixed(2)} from your wallet.`, 'general');
      }
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === targetPlayerId) {
        const currentBal = p.wallet;
        return {
          ...p,
          wallet: type === 'add' ? currentBal + amt : Math.max(0, currentBal - amt)
        };
      }
      return p;
    }));

    addTransaction({
      type: type === 'add' ? 'deposit' : 'withdrawal',
      amount: amt,
      currency: 'USD',
      method: 'Admin Manual Overwrite',
      referenceCode: `AD-${Math.random().toString(36).substring(3,9).toUpperCase()}`
    });
  };

  const togglePlayerStatus = (pId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        const targetStatus = p.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        triggerNotification('User Status Toggled', `Player account ${p.username} is now manually updated to ${targetStatus}!`, 'general');
        return { ...p, status: targetStatus };
      }
      return p;
    }));
  };

  // Jackpot adjustments
  const triggerJackpotIncrement = (jackType: 'mega' | 'major', scale: number) => {
    setJackpotPool(prev => ({
      ...prev,
      [jackType]: prev[jackType] * scale
    }));
    triggerNotification('Jackpot Tuned!', `Admin adjusted the progressive ${jackType.toUpperCase()} coefficient!`, 'jackpot');
  };

  // Computed variables for finances dashboard
  const aggregateTurnover = transactions.reduce((acc, curr) => acc + (curr.type === 'bet' ? curr.amount : 0), 0);
  const aggregatePayouts = transactions.reduce((acc, curr) => acc + (curr.type === 'win' ? curr.amount : 0), 0);
  const aggregateGGR = aggregateTurnover - aggregatePayouts; // Gross Gaming Revenue

  return (
    <div className="bg-[#120a24]/90 border border-purple-900/40 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(147,51,234,0.1)]">
      
      {/* Subtab headers panel */}
      <div className="bg-[#181031] p-4 flex flex-wrap items-center justify-between border-b border-purple-900/30 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <div>
            <h4 className="text-xs font-black text-[#fbbf24] uppercase tracking-widest block">ADMIN OPERATING CONSOLE</h4>
            <span className="text-[10px] text-purple-300 font-mono">Platform control controls. Override pools, audit users and balances</span>
          </div>
        </div>

        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-purple-900/30">
          {[
            { id: 'finances', label: 'Financial Analytics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'users', label: 'User Overrides', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'jackpots', label: 'Jackpot Knobs', icon: <Sliders className="w-3.5 h-3.5" /> }
          ].map((subTab) => (
            <button 
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${activeSubTab === subTab.id ? 'bg-[#251347] text-amber-500 rounded border border-purple-500/20 shadow-sm' : 'text-purple-300/60 hover:text-white'}`}
            >
              {subTab.icon}
              <span>{subTab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        
        {/* SUBTAB 1: FINANCIAL METRICS & GGR */}
        {activeSubTab === 'finances' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-xl border border-purple-900/10 space-y-1">
                <span className="text-[9px] text-purple-400 font-black uppercase font-mono block">Gross Gaming Turnover</span>
                <strong className="text-xl font-mono text-white">${aggregateTurnover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                <span className="text-[8px] text-gray-500 block">Total bets placed in current session</span>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-purple-900/10 space-y-1">
                <span className="text-[9px] text-purple-400 font-black uppercase font-mono block">Registered Player Wins</span>
                <strong className="text-xl font-mono text-white">${aggregatePayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                <span className="text-[8px] text-gray-500 block">Total payouts credited back to users</span>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-purple-900/10 space-y-1">
                <span className="text-[9px] text-amber-500 font-black uppercase font-mono block">Operator GGR (Profit)</span>
                <strong className={`text-xl font-mono ${aggregateGGR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${aggregateGGR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
                <span className="text-[8px] text-gray-500 block">House edge hold yield statistics</span>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-purple-900/10 space-y-1">
                <span className="text-[9px] text-purple-400 font-black uppercase font-mono block">Active Platform RTP</span>
                <strong className="text-xl font-mono text-white">
                  {aggregateTurnover > 0 ? ((aggregatePayouts / aggregateTurnover) * 100).toFixed(1) : '95.6'}%
                </strong>
                <span className="text-[8px] text-gray-500 block">Inspected fair payout threshold scale</span>
              </div>
            </div>

            {/* Simulated mini performance diagram */}
            <div className="bg-black/20 p-5 rounded-2xl border border-purple-900/20 space-y-4">
              <h5 className="text-xs font-bold text-white uppercase font-sans flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#fbbf24]" />
                <span>Live Operating Health Indicators (Continuous Stream)</span>
              </h5>

              <div className="h-24 flex items-end gap-1.5 px-2 bg-black/40 rounded border border-purple-900/10 py-1 justify-between select-none">
                {[30, 45, 25, 60, 80, 55, 90, 75, 45, 120, 85, 110, 140, 95].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-purple-900 to-amber-500 rounded-sm" style={{ height: `${(val / 140) * 100}%` }}></div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-purple-300">
                <span>00:00 - Lobby Initialized</span>
                <span>Active concurrent test spikes</span>
                <span>Server load: stable</span>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: USER OVERRIDES */}
        {activeSubTab === 'users' && (
          <div className="space-y-6">
            
            {/* Quick balance tuner bar */}
            <div className="bg-[#170e2f]/50 p-4 rounded-xl border border-purple-500/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="text-[10px] text-purple-400 font-bold block mb-1">Target Account</label>
                <select 
                  value={targetPlayerId} 
                  onChange={(e) => setTargetPlayerId(e.target.value)}
                  className="w-full bg-[#0a0510] border border-purple-900 rounded p-1.5 text-xs text-white"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.username} (${p.wallet.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-purple-400 font-bold block mb-1">Deduction / Addition Value ($)</label>
                <input 
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-[#0a0510] border border-purple-900 rounded p-1 text-xs text-amber-500 font-bold font-mono"
                  placeholder="500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4">
                <button 
                  onClick={() => onAdjustBalance('add')}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-bold text-white uppercase tracking-wider"
                >
                  + Add Credit
                </button>
                <button 
                  onClick={() => onAdjustBalance('subtract')}
                  className="py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-bold text-white uppercase tracking-wider"
                >
                  - Deduct Base
                </button>
              </div>

              <div className="text-[9px] text-purple-300/40 italic pl-1 leading-tight pt-3">
                Selecting francypendy synchronizes straight with the user view wallet instance!
              </div>
            </div>

            {/* Players interactive audit board table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-purple-900/30 text-[9px] text-purple-400 font-bold uppercase tracking-wider">
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Username</th>
                    <th className="pb-2">Email Anchor</th>
                    <th className="pb-2">Vip Tier</th>
                    <th className="pb-2">Ledger Balance</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/10 text-purple-200/80">
                  {players.map((plyr) => (
                    <tr key={plyr.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-gray-500 truncate">{plyr.id}</td>
                      <td className="py-3 font-bold text-white uppercase">{plyr.username}</td>
                      <td className="py-3 text-purple-300">{plyr.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-purple-900/45 text-amber-400 text-[8px] font-black uppercase">
                          {plyr.vip}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#fbbf24]">${plyr.wallet.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${plyr.status === 'ACTIVE' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-900/30 text-red-500'}`}>
                          {plyr.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => togglePlayerStatus(plyr.id)}
                          className="px-2 py-1 bg-black/40 border border-purple-500/20 rounded text-[9px] font-black text-purple-300 hover:text-white"
                        >
                          {plyr.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* SUBTAB 3: JACKPOT LEVEL CONTROLLERS */}
        {activeSubTab === 'jackpots' && (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white uppercase italic">Active Jackpot Progressive Tuners</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'mega', title: 'Mega Jackpot pool', pool: jackpotPool.mega },
                { id: 'major', title: 'Major Jackpot pool', pool: jackpotPool.major },
                { id: 'minor', title: 'Minor Jackpot pool', pool: jackpotPool.minor },
                { id: 'mini', title: 'Mini Jackpot pool', pool: jackpotPool.mini },
              ].map((jk) => (
                <div key={jk.id} className="bg-black/30 p-4 rounded-xl border border-purple-900/20 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[9px] text-[#fbbf24] font-black uppercase tracking-widest block">{jk.title}</span>
                    <strong className="text-xl font-mono text-white">${jk.pool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerJackpotIncrement(jk.id as any, 1.25)}
                      className="flex-1 py-1 bg-purple-900/30 hover:bg-purple-950 text-purple-300 rounded text-[9px] font-black border border-purple-500/20"
                    >
                      PUMP +25%
                    </button>
                    <button 
                      onClick={() => triggerJackpotIncrement(jk.id as any, 0.75)}
                      className="flex-1 py-1 bg-black/40 hover:bg-[#2c0505] text-[#ff7272] rounded text-[9px] font-black border border-red-500/10"
                    >
                      DROP -25%
                    </button>
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
