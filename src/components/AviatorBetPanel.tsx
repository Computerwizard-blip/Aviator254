/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Settings2, HelpCircle } from 'lucide-react';

interface AviatorBetPanelProps {
  panelId: string;
  balance: number;
  crashActive: boolean;
  crashMultiplier: number;
  countdownActive: boolean;
  isPlaced: boolean;
  setIsPlaced: (v: boolean) => void;
  hasCashedOut: boolean;
  setHasCashedOut: (v: boolean) => void;
  onBetPlaced: (amount: number) => void;
  onCashOut: (multiplier: number, amount: number) => void;
  onBetCancelled?: (amount: number) => void;
}

export default function AviatorBetPanel({
  panelId,
  balance,
  crashActive,
  crashMultiplier,
  countdownActive,
  isPlaced,
  setIsPlaced,
  hasCashedOut,
  setHasCashedOut,
  onBetPlaced,
  onCashOut,
  onBetCancelled,
}: AviatorBetPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'bet' | 'auto'>('bet');
  const [betAmount, setBetAmount] = useState<number>(10.00);
  const [placedBetAmount, setPlacedBetAmount] = useState<number>(0);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number>(2.00);
  const [autoBetEnabled, setAutoBetEnabled] = useState<boolean>(false);
  const [isWaitingNextRound, setIsWaitingNextRound] = useState<boolean>(false);

  // Quick stake buttons from photographs
  const quickStakes = [100, 200, 500, 10000];

  // Adjust bet bounds
  const adjustBet = (amount: number) => {
    if (isPlaced) return; // Prevent adjustment when bet is active
    setBetAmount(prev => {
      const next = prev + amount;
      return next > 0 ? parseFloat(next.toFixed(2)) : 10.00;
    });
  };

  const handleManualInput = (val: string) => {
    if (isPlaced) return;
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setBetAmount(parseFloat(num.toFixed(2)));
    }
  };

  // Perform Bet placements
  const handlePlaceBet = () => {
    if (isPlaced) {
      // Cancel outstanding preflight bet or queued next-round bet
      if (countdownActive || isWaitingNextRound) {
        setIsPlaced(false);
        setHasCashedOut(false);
        if (onBetCancelled) {
          onBetCancelled(placedBetAmount);
        }
        setPlacedBetAmount(0);
        setIsWaitingNextRound(false);
      }
      return;
    }

    if (balance < betAmount) {
      alert("Insufficient KSh Balance. Clean simple reload available!");
      return;
    }

    // Capture whether the flight is currently soaring or not
    if (crashActive) {
      setIsWaitingNextRound(true);
    } else {
      setIsWaitingNextRound(false);
    }

    setIsPlaced(true);
    setHasCashedOut(false);
    setPlacedBetAmount(betAmount);
    onBetPlaced(betAmount);
  };

  // Trigger cashout payout
  const handleCashOutClick = () => {
    if (!isPlaced || hasCashedOut || !crashActive || isWaitingNextRound) return;
    setHasCashedOut(true);
    const payout = parseFloat((placedBetAmount * crashMultiplier).toFixed(2));
    onCashOut(crashMultiplier, payout);
  };

  // Auto-cashout trigger scan loop in-flight
  useEffect(() => {
    if (crashActive && isPlaced && !isWaitingNextRound && !hasCashedOut && autoCashoutEnabled) {
      if (crashMultiplier >= autoCashoutValue) {
        setHasCashedOut(true);
        const payout = parseFloat((placedBetAmount * autoCashoutValue).toFixed(2));
        onCashOut(autoCashoutValue, payout);
      }
    }
  }, [crashActive, crashMultiplier, isPlaced, isWaitingNextRound, hasCashedOut, autoCashoutEnabled, autoCashoutValue, placedBetAmount]);

  // Handle auto-bet setup on countdown start
  useEffect(() => {
    if (countdownActive && autoBetEnabled && !isPlaced) {
      if (balance >= betAmount) {
        setIsPlaced(true);
        setHasCashedOut(false);
        setPlacedBetAmount(betAmount);
        onBetPlaced(betAmount);
      }
    }
  }, [countdownActive, autoBetEnabled]);

  // Reset states when round ends
  useEffect(() => {
    if (!crashActive && !countdownActive) {
      if (isWaitingNextRound) {
        // Enters the active zone for the loaded next round countdown
        setIsWaitingNextRound(false);
        setHasCashedOut(false);
      } else {
        if (!autoBetEnabled) {
          setIsPlaced(false);
          setPlacedBetAmount(0);
        }
        setHasCashedOut(false);
      }
    }
  }, [crashActive, countdownActive, isWaitingNextRound, autoBetEnabled]);

  return (
    <div className="bg-[#141518] p-3 rounded-2xl border border-[#212327] flex flex-col gap-2.5 overflow-hidden select-none">
      {/* 1. Header Tabs Row - Bet & Auto */}
      <div className="flex justify-between items-center select-none pb-0.5 border-b border-[#212327]/10">
        <div className="flex bg-[#0e0f11] p-0.5 rounded-full border border-[#23252b]">
          <button 
            type="button"
            onClick={() => setActiveSubTab('bet')}
            className={`px-6 py-1 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'bet' ? 'bg-[#212327] text-white shadow' : 'text-[#8e9099] hover:text-white'}`}
          >
            Bet
          </button>
          <button 
            type="button"
            onClick={() => setActiveSubTab('auto')}
            className={`px-6 py-1 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'auto' ? 'bg-[#212327] text-white shadow' : 'text-[#8e9099] hover:text-white'}`}
          >
            Auto
          </button>
        </div>

        {/* Small settings gear icon */}
        <button className="text-[#8e9099] hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-[#1f2025]">
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Embedded Auto Settings if Active */}
      {activeSubTab === 'auto' && (
        <div className="grid grid-cols-2 gap-3 bg-[#0d0e10] p-2 rounded-lg border border-[#22242a] animate-fadeIn text-[11px] font-sans">
          {/* Toggle Auto Bet */}
          <div className="flex items-center justify-between bg-[#141518] px-2.5 py-1.5 rounded-md border border-[#252830]">
            <span className="text-[#8e9099] font-bold uppercase tracking-wider text-[10px]">Auto Bet</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoBetEnabled}
                onChange={(e) => setAutoBetEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[#23252b] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#8e9099] peer-checked:after:bg-[#00e600] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0c1f0b]" />
            </label>
          </div>

          {/* Toggle Auto Cashout */}
          <div className="flex items-center justify-between bg-[#141518] px-2.5 py-1.5 rounded-md border border-[#252830]">
            <span className="text-[#8e9099] font-bold uppercase tracking-wider text-[10px]">Auto Cashout</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoCashoutEnabled}
                onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[#23252b] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#8e9099] peer-checked:after:bg-[#00e600] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0c1f0b]" />
            </label>
          </div>

          {/* Auto Cashout multiplier input field */}
          <div className="col-span-2 flex items-center justify-between bg-[#0e0f11] px-3 py-1.5 rounded-md border border-[#1b1c21]">
            <span className="text-[#8e9099] font-semibold text-[10px]">CASHOUT MULTIPLIER (x)</span>
            <input 
              type="number"
              step="0.1"
              min="1.01"
              value={autoCashoutValue}
              disabled={!autoCashoutEnabled}
              onChange={(e) => setAutoCashoutValue(Math.max(1.01, parseFloat(e.target.value)))}
              className="w-20 bg-black/60 outline-none hover:border-[#442b66] font-mono text-center text-amber-400 font-bold text-xs ring-1 ring-[#22242a] focus:ring-amber-500 rounded py-1 disabled:opacity-40"
            />
          </div>
        </div>
      )}

      {/* Auto Cashout Quick Control Row */}
      <div className="bg-[#0e0f11] p-2.5 rounded-xl border border-[#212327] flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
        <div className="flex items-center gap-2">
          {/* Custom Slide Checkbox for instant toggle */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoCashoutEnabled}
              onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
              className="sr-only peer"
            />
            {/* Smooth toggle slider container */}
            <div className="w-9 h-5 bg-[#23252b] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-gray-400 peer-checked:after:bg-[#00e600] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0c1f0b] border border-transparent peer-focus:border-purple-500/20" />
          </label>
          <div className="flex flex-col">
            <span className="text-[#eaeaea] font-black uppercase tracking-wider text-[10.5px]">Auto Cashout</span>
            <span className="text-[9px] text-[#8e9099] leading-none">Auto payout on target hit</span>
          </div>
        </div>

        {/* Dynamic target input value with quick-adjust multipliers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/50 border border-[#252830] rounded-lg px-2 py-1 focus-within:border-amber-400 transition-colors">
            <input 
              type="number"
              step="0.05"
              min="1.01"
              disabled={!autoCashoutEnabled}
              value={autoCashoutValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAutoCashoutValue(isNaN(val) ? 1.01 : Math.max(1.01, val));
              }}
              className="w-14 bg-transparent outline-none font-mono text-right text-amber-400 font-bold text-xs disabled:opacity-40 disabled:text-gray-600 transition-all"
            />
            <span className="text-gray-500 text-[10px] ml-1 font-black font-mono">x</span>
          </div>

          {/* Preset increment adjustments */}
          <div className="flex gap-1">
            <button
              type="button"
              disabled={!autoCashoutEnabled}
              onClick={() => setAutoCashoutValue(prev => parseFloat(Math.max(1.01, prev - 0.5).toFixed(2)))}
              className="px-2 py-1 bg-[#1f2025] hover:bg-[#282a32] text-[9.5px] font-mono font-black text-gray-400 hover:text-white rounded transition-colors disabled:opacity-20 cursor-pointer"
              title="Decrease multiplier by 0.5"
            >
              -0.5
            </button>
            <button
              type="button"
              disabled={!autoCashoutEnabled}
              onClick={() => setAutoCashoutValue(prev => parseFloat((prev + 0.5).toFixed(2)))}
              className="px-2 py-1 bg-[#1f2025] hover:bg-[#282a32] text-[9.5px] font-mono font-black text-gray-400 hover:text-white rounded transition-colors disabled:opacity-20 cursor-pointer"
              title="Increase multiplier by 0.5"
            >
              +0.5
            </button>
            <button
              type="button"
              disabled={!autoCashoutEnabled}
              onClick={() => setAutoCashoutValue(2.00)}
              className={`px-2 py-1 text-[9.5px] font-mono font-black rounded transition-colors cursor-pointer ${autoCashoutValue === 2.0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1f2025] hover:bg-[#282a32] text-gray-400 hover:text-white'}`}
              title="Set to 2.0x"
            >
              2.0x
            </button>
          </div>
        </div>
      </div>

      {/* 3. Betting Operation core section */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Left column: Minus/Plus Counter & Quick buttons */}
        <div className="col-span-12 xs:col-span-6 flex flex-col gap-1.5">
          {/* Main Bet Counter field */}
          <div className="flex items-center justify-between bg-[#0e0f11] rounded-full border border-[#202228] p-1 h-10 select-none">
            {/* Minus buttons */}
            <button 
              type="button"
              disabled={isPlaced}
              onClick={() => adjustBet(-10.00)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1f2025] hover:bg-[#2b2d35] border border-[#2e313a] text-white hover:text-red-500 transition-colors disabled:opacity-30 cursor-pointer active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Editable display */}
            <div className="flex-1 text-center font-mono select-all">
              <input 
                type="text" 
                value={betAmount.toFixed(2)} 
                disabled={isPlaced}
                onChange={(e) => handleManualInput(e.target.value)}
                className="w-full text-center bg-transparent border-none text-white outline-none font-black text-sm select-all"
              />
            </div>

            {/* Plus buttons */}
            <button 
              type="button"
              disabled={isPlaced}
              onClick={() => adjustBet(10.00)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1f2025] hover:bg-[#2b2d35] border border-[#2e313a] text-white hover:text-green-500 transition-colors disabled:opacity-30 cursor-pointer active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Underlying Quick Stake Buttons */}
          <div className="grid grid-cols-4 gap-1 select-none">
            {quickStakes.map((stake) => (
              <button 
                key={stake}
                type="button"
                disabled={isPlaced}
                onClick={() => setBetAmount(stake)}
                className={`py-1 rounded bg-[#1c1d22] hover:bg-[#282a32] border border-[#25282f] text-[10px] font-mono font-black select-none text-gray-300 hover:text-white transition-all duration-150 disabled:opacity-30 cursor-pointer active:scale-90`}
              >
                {stake.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Massive green button wrapper */}
        <div className="col-span-12 xs:col-span-6">
          {/* Conditional display of button layout based on round status */}
          {!isPlaced ? (
            /* Standard GREEN BET trigger - matches photos */
            <button 
              type="button"
              onClick={handlePlaceBet}
              className="w-full h-[58px] rounded-2xl bg-[#2cb400] hover:bg-[#34d100] active:scale-95 hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_15px_rgba(44,180,0,0.3)] border-b-2 border-[#1f8700] text-center flex flex-col justify-center items-center select-none"
            >
              <span className="text-white text-md tracking-widest font-black uppercase leading-tight select-none">Bet</span>
              <span className="text-white text-xs font-mono font-bold tracking-tight select-none">
                {betAmount.toFixed(2)} KSh
              </span>
            </button>
          ) : (
            /* Active Bet displays cancel or CASH OUT triggers dynamically */
            (countdownActive || isWaitingNextRound) ? (
              /* Placed wager inside lobby countdown or waiting for next round - user can CANCEL and get refund */
              <button 
                type="button"
                onClick={handlePlaceBet}
                className="w-full h-[58px] rounded-2xl bg-[#cb002b] hover:bg-[#e60031] active:scale-95 transition-all cursor-pointer shadow-[0_4px_12px_rgba(203,0,43,0.3)] border-b-2 border-[#94001f] text-center flex flex-col justify-center items-center"
              >
                <span className="text-white text-sm font-black tracking-widest uppercase leading-tight">CANCEL</span>
                <span className="text-white text-[10px] uppercase font-mono font-bold opacity-80">
                  {isWaitingNextRound ? 'Wait Next Round' : 'Lobby Refund'}
                </span>
              </button>
            ) : (
              /* Flight is active and user went on-board! Redirection to ORANGE-GOLD CASH OUT button */
              !hasCashedOut ? (
                <button 
                  type="button"
                  onClick={handleCashOutClick}
                  className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-[#ffbf00] to-[#ff9900] active:scale-95 hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_22px_rgba(255,153,0,0.4)] border-b-3 border-[#c47c00] text-center flex flex-col justify-center items-center animate-pulse"
                >
                  <span className="text-black text-sm tracking-widest font-black uppercase leading-none select-none">CASH OUT</span>
                  <span className="text-black font-mono font-bold text-[13px] tracking-tight mt-0.5 select-none text-shadow-sm">
                    {(placedBetAmount * crashMultiplier).toFixed(2)} KSh
                  </span>
                </button>
              ) : (
                /* Already cashed out successfully */
                <button 
                  type="button"
                  disabled
                  className="w-full h-[58px] rounded-2xl bg-[#1c1d22] border border-[#2d2e38] text-center flex flex-col justify-center items-center opacity-60 cursor-not-allowed select-none"
                >
                  <span className="text-[#2cb400] text-xs font-black tracking-widest uppercase">CASHED OUT</span>
                  <span className="text-gray-400 font-mono text-[10px] mt-0.5 font-bold">
                    Stake secured!
                  </span>
                </button>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
