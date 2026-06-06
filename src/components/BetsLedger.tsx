/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Clock, History, Trophy, TrendingUp, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { UserProfile } from '../types';

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
    mode?: 'demo' | 'real';
  }[];
  activePlayers: BetLogItem[];
  crashActive: boolean;
  crashMultiplier: number;
  multipliers: number[];
  roundIndex?: number;
  userProfile?: UserProfile;
}

const USERS_LIST = [
  'Mpesa_Guru', 'Matatu_Racer', 'CoinSlinger_KE', 'Nairobi_Hustler', 'Alpha_Bet_99',
  'Safari_King', 'Jambo_Spins', 'Boda_Boda_Flyer', 'Oloiboni', 'Kilimanjaro_Bet',
  'Serengeti_Gold', 'Shujaa_X', 'Wanjiku_Wins', 'Kiprotich_Speed', 'Biko_Shaker',
  'Lucky_Otieno', 'Amani_Champs', 'Mwangi_Vip', 'Kamau_Plaza', 'Wamae_Rider',
  'Gikomba_Trader', 'Bargain_Hunter', 'Karura_Runner', 'Heko_Spins', 'Zuri_Flyer',
  'Pesa_Pap', 'Shilingi_Boss', 'Uhuru_Winger', 'Nyama_Choma', 'Kona_Mkali',
  'Chunga_Sana', 'Kazi_Iendelee', 'Tausi_Queen', 'Teke_Teke', 'Simba_Nguvu',
  'Viwambo_Spins', 'Mchezo_Sana', 'Asante_Sana', 'Rafiki_Wote', 'Karibu_Beti',
  'Hakuna_Matata', 'Lamu_Sailor', 'Voi_Voyager', 'Mombasa_Wave', 'Nanyuki_Star',
  'Eldoret_Turbo', 'Nakuru_Flamingo', 'Kisumu_Fish', 'Kakamega_Forest', 'Meru_Gold',
  'Thika_Pineapple', 'Machakos_Hero', 'Kitui_Honey', 'Garissa_Sun', 'Turkana_Wind',
  'Marsabit_Rock', 'Wajir_Camel', 'Mandera_Gate', 'Isiolo_Hub', 'Embu_Hill',
  'Kericho_Tea', 'Bomet_Potato', 'Narok_Wheat', 'Kajiado_Beast', 'Naivasha_Breeze',
  'Nyeri_Coffee', 'Kiambu_Real', 'Muranga_Hills', 'Laikipia_Plain', 'Samburu_Warrior',
  'Kwale_Coconut', 'Kilifi_Cashew', 'Taita_Sisal', 'Tana_River', 'Lamu_Old_Town',
  'Busia_Border', 'Vihiga_Hills', 'Bungoma_Sugar', 'Siaya_Sega', 'Homa_Bay',
  'Migori_Gold', 'Kisii_Banana', 'Nyamira_High', 'Kericho_Green', 'Nandi_Bear',
  'Uasin_Gishu', 'Elgeyo_Marakwet', 'Baringo_Lake', 'West_Pokot', 'Trans_Nzoia',
  'Turkana_Lake', 'Samburu_Game', 'Isiolo_Camel', 'Tharaka_Nithi', 'Makueni_Fruit',
  'Kajiado_Soda', 'Narok_Maasai', 'Bomet_Dairy', 'Kericho_Borders', 'Kisumu_Sunset',
  'Siaya_Obama', 'Homa_Bay_Pier', 'Migori_Mine', 'Kisii_Soapstone', 'Nyamira_Tea'
];

export function generateRandomTopBets() {
  const shuffledUsers = [...USERS_LIST].sort(() => Math.random() - 0.5);
  const total = 112; // Over 100 top names
  const list = [];

  const maxPayout = 1200000;
  const minPayout = 15000;

  for (let i = 0; i < total; i++) {
    const ratio = 1 - (i / (total - 1));
    const rawPayout = minPayout + (maxPayout - minPayout) * Math.pow(ratio, 2.2);
    // Add significant random noise to payout so they fluctuate completely differently each bet
    const noise = (Math.random() - 0.5) * 8000;
    const payout = Math.max(10000, Math.round(rawPayout + noise));

    let username = shuffledUsers[i % shuffledUsers.length];
    if (i >= shuffledUsers.length) {
      username = `${username}_${i}`;
    }

    let betAmount = 1000;
    if (payout > 800000) {
      betAmount = Math.random() > 0.5 ? 2500 : 2000;
    } else if (payout > 400000) {
      betAmount = Math.random() > 0.5 ? 1500 : 1000;
    } else if (payout > 100000) {
      betAmount = Math.random() > 0.5 ? 800 : 500;
    } else {
      betAmount = Math.random() > 0.5 ? 300 : 100;
    }

    const multiplier = parseFloat((payout / betAmount).toFixed(2));
    const daysAgo = Math.floor(i / 10);
    const dateStr = daysAgo === 0 ? 'Today, ' + (12 - (i % 12)) + ':14' : `${daysAgo} days ago`;

    list.push({
      username,
      multiplier,
      betAmount,
      payout,
      date: dateStr
    });
  }

  list.sort((a, b) => b.payout - a.payout);
  return list;
}

export default function BetsLedger({
  myBets,
  activePlayers,
  crashActive,
  crashMultiplier,
  multipliers,
  roundIndex,
  userProfile
}: BetsLedgerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'top' | 'chart'>('all');
  const [topRoundMultiplier, setTopRoundMultiplier] = useState<number>(312.42);

  const getUserVipLevel = (username: string): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite' => {
    if (userProfile && (username === userProfile.username || username === 'demo_player' || username === 'francypendy')) {
      return userProfile.vipLevel;
    }
    const code = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (code % 23 === 0) return 'Elite';
    if (code % 17 === 0) return 'Diamond';
    if (code % 11 === 0) return 'Platinum';
    if (code % 7 === 0) return 'Gold';
    if (code % 4 === 0) return 'Silver';
    return 'Bronze';
  };

  const renderVipBadge = (username: string) => {
    const level = getUserVipLevel(username);
    if (level === 'Bronze') return null;
    
    let badgeBg = 'bg-slate-800 text-slate-350 border-slate-700/50';
    let label = '★ SLV';
    
    if (level === 'Silver') {
      badgeBg = 'bg-gray-800/80 text-gray-300 border-gray-750/40 text-[7px]';
      label = '★ SLV';
    } else if (level === 'Gold') {
      badgeBg = 'bg-[#1b1509] text-amber-400 border-amber-500/20 text-[7px]';
      label = '★ GLD';
    } else if (level === 'Platinum') {
      badgeBg = 'bg-[#09151e] text-blue-400 border-blue-500/20 text-[7px]';
      label = '★ PLT';
    } else if (level === 'Diamond') {
      badgeBg = 'bg-[#091c1e] text-cyan-300 border-cyan-500/20 text-[7px]';
      label = '✦ DIA';
    } else if (level === 'Elite') {
      badgeBg = 'bg-[#21090c] text-red-400 border-red-500/20 text-[7.5px] animate-pulse';
      label = '✦ ELT';
    }
    
    return (
      <span className={`font-black px-1 py-0.5 rounded border leading-none scale-90 origin-left inline-block select-none font-mono ${badgeBg}`}>
        {label}
      </span>
    );
  };

  const [topBets, setTopBets] = useState<any[]>(() => generateRandomTopBets());

  // Regenerate topBets when roundIndex changes to simulate completely fresh top wins for every single round
  useEffect(() => {
    setTopBets(generateRandomTopBets());
  }, [roundIndex]);

  useEffect(() => {
    // Dynamic background score increments & live name introductions
    const interval = setInterval(() => {
      setTopBets(prev => {
        const list = [...prev];
        const r = Math.random();

        if (r < 0.40) {
          // Boost score of an existing player on the board
          const idx = Math.floor(Math.random() * list.length);
          const currentItem = list[idx];
          
          const multiplierBoost = Math.random() > 0.85
            ? Math.floor(Math.random() * 80) + 15
            : Math.floor(Math.random() * 12) + 2;
          
          const newPayout = currentItem.payout + Math.round(currentItem.betAmount * multiplierBoost);
          const newMultiplier = parseFloat((newPayout / currentItem.betAmount).toFixed(2));

          list[idx] = {
            ...currentItem,
            payout: Math.min(1500000, newPayout),
            multiplier: newMultiplier,
            date: 'Just now'
          };
        } else if (r < 0.75) {
          // Seed a completely different live user who just scored a substantial win
          const firstNames = [
            'Kamau', 'Amani', 'Wanjiku', 'Mwangi', 'Kibet', 'Juma', 'Zuri', 'Mutua', 'Fatuma', 'Amina',
            'Chebet', 'Biko', 'Kevo', 'Mwesh', 'Shiko', 'Brayo', 'Chalo', 'Caro', 'Nesh', 'Prisc',
            'Otieno', 'Omondi', 'Kip', 'Muthoni', 'Akinyi', 'Moraa', 'Nekesa', 'Ali', 'Adan', 'Peter',
            'Saroni', 'Purity', 'Kendi', 'Abisai', 'Yator', 'Oduor', 'Nyambura', 'Nduti', 'Githinji'
          ];
          const lastNames = [
            'Bets', 'Safar', 'Guru', 'Flyer', 'Win', 'Ace', 'Star', 'Rich', 'Winner', 'Boss',
            'Pro', 'Gold', 'King', 'Queen', 'Max', 'Apex', 'Hyper', 'Sonic', 'Zon', 'Play',
            'Bettor', 'Hustler', 'Racer', '001', 'Flyer', 'Turbo', 'Mill', 'KSh', 'KE', '99',
            'VIP', 'Hulk', 'Storm', 'Teke', 'Simba', 'Champs', 'Diver', 'Cruiser', 'Falcon'
          ];

          const first = firstNames[Math.floor(Math.random() * firstNames.length)];
          const last = lastNames[Math.floor(Math.random() * lastNames.length)];
          let liveName = `${first}_${last}`;
          if (Math.random() > 0.6) {
            liveName = `${liveName}_${Math.floor(Math.random() * 99)}`;
          }

          const payout = Math.floor(Math.random() * 450000) + 25000;
          const betAmount = payout > 200000 ? 2500 : payout > 100000 ? 1500 : 500;
          const multiplier = parseFloat((payout / betAmount).toFixed(2));

          list.push({
            username: liveName,
            multiplier,
            betAmount,
            payout,
            date: 'Just now'
          });
        }

        // Sort descending
        list.sort((a, b) => b.payout - a.payout);

        // Keep bounds around 115 max rows
        return list.slice(0, 115);
      });
    }, 3500); // 3.5 seconds intervals

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#141518] rounded-2xl border border-[#212327] overflow-hidden select-none font-sans shrink-0">
      {/* 1. Statistics Tabs Selectors Bar */}
      <div className="flex bg-[#0d0e10] p-1 border-b border-[#212327]">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${activeTab === 'all' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">All Bets</span>
          <span className="xs:hidden">All</span>
        </button>

        <button 
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${activeTab === 'my' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">My Bets</span>
          <span className="xs:hidden">My</span>
        </button>

        <button 
          onClick={() => setActiveTab('top')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${activeTab === 'top' ? 'bg-[#1b1c21] text-white shadow' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Top</span>
          <span className="xs:hidden">Top</span>
        </button>

        <button 
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer ${activeTab === 'chart' ? 'bg-red-950/20 text-[#e21515] border border-red-500/30' : 'text-[#8e9099] hover:text-[#d1d2d6]'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Volatility</span>
          <span className="xs:hidden">Trend</span>
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
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-[8px] font-black font-sans text-red-500 uppercase border border-red-950/20 shrink-0">
                        {player.username.substring(0, 2)}
                      </div>
                      <span className="text-[#b5b7c0] text-[11px] font-semibold truncate max-w-[90px]">{player.username}</span>
                      {renderVipBadge(player.username)}
                    </div>

                    {/* Bettor statistics details */}
                    <div className="flex items-center gap-12 text-right font-sans">
                      <span className="text-gray-400 text-[11px]">
                        {player.betAmount.toFixed(0)} KSh
                      </span>
                      
                      {player.cashedOut ? (
                        <div className="flex items-center gap-2 pr-1">
                          <span className="text-[#00e600] font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#0e1e0d] border border-[#2a5a27]/30">
                            x{showMultiplier?.toFixed(2)}
                          </span>
                          <span className="text-[#00e600] font-black text-[11px] min-w-[70px]">
                            {livePayout?.toFixed(1)} KSh
                          </span>
                        </div>
                      ) : crashActive ? (
                        <div className="flex items-center gap-2 pr-1 opacity-45">
                          <span className="text-amber-500 font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#1f190e]">
                            x{showMultiplier?.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-[11px] min-w-[70px]">
                            {livePayout?.toFixed(1)} KSh
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
                  No registered bets yet KSh
                </div>
              ) : (
                myBets.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs font-mono border ${item.status === 'WON' ? 'bg-[#0f210e]/40 border-[#1a3818]/50' : item.status === 'LOST' ? 'bg-[#291114]/20 border-[#572027]/10' : 'bg-[#191a1e] border-transparent'}`}
                  >
                    <span className="text-[#5f616b] text-[10px] shrink-0">{item.time}</span>
                    <span className="text-gray-300 font-semibold">{item.amount.toFixed(2)} KSh</span>
                    
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
                        {item.status === 'WON' ? `+${item.payout?.toFixed(1)}` : '0.0'} KSh
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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-bold font-sans text-xs">#{idx + 1}</span>
                    <span className="text-white font-semibold truncate max-w-[100px]">{item.username}</span>
                    {renderVipBadge(item.username)}
                  </div>

                  <div className="flex items-center gap-14 text-right">
                    <span className="text-[#bf5af2] font-black px-1.5 py-0.5 rounded bg-[#1e1329] border border-[#3e2754]/20">
                      x{item.multiplier.toFixed(2)}
                    </span>
                    <span className="text-[#00e600] font-black text-[11px] min-w-[85px]">
                      {item.payout.toLocaleString()} KSh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECHARTS VOLATILITY TREND LINE CHART */}
        {activeTab === 'chart' && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono tracking-wide px-1">
              <span className="uppercase font-bold text-red-500">Live Crash Volatility Index</span>
              <span>Recent {multipliers?.length || 0} Flights</span>
            </div>

            <div className="w-full h-[180px] bg-black/50 rounded-xl border border-red-500/10 p-2.5 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(multipliers || []).map((mult, index) => ({
                    round: `Round #${(multipliers || []).length - index}`,
                    val: mult,
                    displayVal: `${mult.toFixed(2)}x`
                  })).reverse()}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVolatility" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e21515" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#e21515" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#251433" vertical={false} />
                  <XAxis 
                    dataKey="round" 
                    stroke="#5f616b" 
                    fontSize={9} 
                    tickLine={false} 
                    hide={true}
                  />
                  <YAxis 
                    stroke="#8e9099" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value.toFixed(1)}x`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1b1c21] border border-red-500/30 p-2 rounded shadow-2xl font-sans text-xs">
                            <p className="text-gray-400 font-mono text-[9px] uppercase font-bold">{data.round}</p>
                            <p className="text-[#00e600] font-black text-sm mt-0.5">{data.displayVal}</p>
                            <p className="text-[9px] text-[#b5b7c0] mt-1 font-mono">Provably Fair Verified</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#e21515" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorVolatility)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-gray-500 font-mono leading-relaxed border-t border-[#212327]/40 pt-2 flex items-center justify-between px-1">
              <span>Avg crash: {multipliers?.length ? (multipliers.reduce((a, b) => a + b, 0) / multipliers.length).toFixed(2) : '1.50'}x</span>
              <span className="text-amber-500 font-bold">Max Peak: {multipliers?.length ? Math.max(...multipliers).toFixed(2) : '1.00'}x</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
