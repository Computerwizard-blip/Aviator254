/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import AviatorHeader from './components/AviatorHeader';
import HistoryRibbon from './components/HistoryRibbon';
import AviatorGameViewport from './components/AviatorGameViewport';
import AviatorBetPanel from './components/AviatorBetPanel';
import BetsLedger from './components/BetsLedger';
import MpesaModal from './components/MpesaModal';
import { audioEngine } from './utils/audio';
import ResponsibleGamingModal from './components/ResponsibleGamingModal';
import { Lock, PhoneCall, ShieldAlert, HeartHandshake, AlertOctagon } from 'lucide-react';

// Mock avatar names list for simulated online players
const COMPANION_AVATARS = ['KM', 'AM', 'NJ', 'OT', 'SS', 'MW', 'KB', 'JM', 'ZR', 'KC', 'MM', 'GG', 'KR', 'WJ'];

const COMPANION_USERS = [
  'Kamau_KE', 'Amani_254', 'Mpesa_King', 'Njoroge_Bettor', 'Otieno_Hustler', 
  'ShillingSlinger', 'Wanjiku_Win', 'Mwangi_001', 'Kibet_Racer', 'Juma_Bets', 
  'SafariSafar', 'Zuri_Zuri', 'Kipchoge_Fast', 'Mama_Mboga_VIP', 'Gikomba_Guru', 'Kiambu_Rider'
];

interface BetLogItem {
  id: string;
  username: string;
  betAmount: number;
  multiplier?: number;
  payoutAmount?: number;
  cashedOut: boolean;
  timestamp: string;
}

export default function App() {
  // Balance is KES (starts at 50,000.00 KES as requested by the user and shown in photos)
  const [balance, setBalance] = useState<number>(50000.00);

  // Audio system state
  const [muted, setMuted] = useState<boolean>(() => audioEngine.isMuted());

  // Responsible Gaming states
  const [isResponsibleGamingOpen, setIsResponsibleGamingOpen] = useState<boolean>(false);
  const [depositLimit, setDepositLimitState] = useState<number | null>(() => {
    const saved = localStorage.getItem('aviator_deposit_limit');
    return saved ? parseFloat(saved) : null;
  });
  const [sessionLimit, setSessionLimitState] = useState<number | null>(() => {
    const saved = localStorage.getItem('aviator_session_limit');
    return saved ? parseInt(saved) : null;
  });
  const [selfExcludedUntil, setSelfExcludedUntil] = useState<string | null>(() => {
    return localStorage.getItem('aviator_self_excluded_until');
  });
  const [totalDepositedToday, setTotalDepositedToday] = useState<number>(() => {
    const saved = localStorage.getItem('aviator_deposited_today');
    return saved ? parseFloat(saved) : 0;
  });
  const [sessionTimeLeftSecs, setSessionTimeLeftSecs] = useState<number | null>(null);
  const [showSessionAlert, setShowSessionAlert] = useState<boolean>(false);

  // Storage synced limit setters
  const setDepositLimit = (val: number | null) => {
    setDepositLimitState(val);
    if (val !== null) {
      localStorage.setItem('aviator_deposit_limit', val.toString());
    } else {
      localStorage.removeItem('aviator_deposit_limit');
    }
  };

  const setSessionLimit = (val: number | null) => {
    setSessionLimitState(val);
    if (val !== null) {
      localStorage.setItem('aviator_session_limit', val.toString());
      setSessionTimeLeftSecs(val * 60);
    } else {
      localStorage.removeItem('aviator_session_limit');
      setSessionTimeLeftSecs(null);
    }
    setShowSessionAlert(false);
  };

  const handleSelfExclude = (days: number) => {
    const end = new Date();
    end.setDate(end.getDate() + days);
    const isoStr = end.toISOString();
    setSelfExcludedUntil(isoStr);
    localStorage.setItem('aviator_self_excluded_until', isoStr);
    setIsResponsibleGamingOpen(false);
  };

  const resetSessionTimer = () => {
    if (sessionLimit !== null) {
      setSessionTimeLeftSecs(sessionLimit * 60);
    } else {
      setSessionTimeLeftSecs(null);
    }
    setShowSessionAlert(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  const handleResetDepositedToday = () => {
    setTotalDepositedToday(0);
    localStorage.setItem('aviator_deposited_today', '0');
    alert("Sandbox Mode: Today's deposit logs have been cleared!");
  };

  // Session limits timer countdown ticker
  useEffect(() => {
    if (sessionLimit === null) {
      setSessionTimeLeftSecs(null);
      return;
    }

    if (sessionTimeLeftSecs === null) {
      setSessionTimeLeftSecs(sessionLimit * 60);
    }

    const timer = setInterval(() => {
      setSessionTimeLeftSecs(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          setShowSessionAlert(true);
          return 0; // Lock timer remaining at zero
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionLimit, sessionTimeLeftSecs]);
  
  // Game flight states
  const [crashActive, setCrashActive] = useState<boolean>(false);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [crashStatusMessage, setCrashStatusMessage] = useState<string>("Ready KES");
  const [countdownValue, setCountdownValue] = useState<number | null>(5.0);
  const [roundCrashLimit, setRoundCrashLimit] = useState<number>(2.50);

  // Recent multiplier outcomes matching the list pictured in user screenshots
  const [historyList, setHistoryList] = useState<number[]>([
    1.29, 2.08, 1.73, 1.75, 1.43, 2.17, 3.20, 1.05, 4.88, 1.11, 2.76, 1.94, 1.35
  ]);

  // Personal Bets Log
  const [myBets, setMyBets] = useState<{
    amount: number;
    multiplier?: number;
    payout?: number;
    time: string;
    status: 'WON' | 'LOST' | 'ACTIVE';
  }[]>([]);

  // Simulated live lobby bettors
  const [activePlayers, setActivePlayers] = useState<BetLogItem[]>([]);
  const [onlinePlayersCount, setOnlinePlayersCount] = useState<number>(64);

  // M-Pesa overlay indicator State
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);

  // Individual dual bet panels data synchronized state
  const [panel1Placed, setPanel1Placed] = useState<boolean>(false);
  const [panel1Cashed, setPanel1Cashed] = useState<boolean>(false);
  const [panel1BetVal, setPanel1BetVal] = useState<number>(0);

  const [panel2Placed, setPanel2Placed] = useState<boolean>(false);
  const [panel2Cashed, setPanel2Cashed] = useState<boolean>(false);
  const [panel2BetVal, setPanel2BetVal] = useState<number>(0);

  // Growth loop ticker references
  const mainTickerInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper: setup simulated other players bets at start of lobby
  const generateSimulatedLobbyBettors = () => {
    const freshPlayersNum = Math.floor(Math.random() * 40) + 50; // 50 to 90 mock players
    setOnlinePlayersCount(freshPlayersNum);

    const poolList: BetLogItem[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < freshPlayersNum; i++) {
      let candidate = COMPANION_USERS[Math.floor(Math.random() * COMPANION_USERS.length)];
      if (usedNames.has(candidate)) {
        candidate = `${candidate}_${Math.floor(Math.random() * 99)}`;
      }
      usedNames.add(candidate);

      const randomStake = Math.random() > 0.7 
        ? Math.floor(Math.random() * 450) + 50 
        : Math.floor(Math.random() * 9500) + 500;

      poolList.push({
        id: `b-${i}-${Math.random().toString(36).substring(3, 7)}`,
        username: candidate,
        betAmount: randomStake,
        cashedOut: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // Sort players so higher bets are placed on top for dramatic gaming impact
    poolList.sort((a,b) => b.betAmount - a.betAmount);
    setActivePlayers(poolList);
  };

  // Helper helper: trigger payouts or losses at the end of flight
  const resolveRoundUnsecuredBets = () => {
    // If user left panel 1 active on-board, log loss
    if (panel1Placed && !panel1Cashed) {
      setMyBets(prev => [
        {
          amount: panel1BetVal,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'LOST'
        },
        ...prev
      ]);
    }

    // If user left panel 2 active on-board, log loss
    if (panel2Placed && !panel2Cashed) {
      setMyBets(prev => [
        {
          amount: panel2BetVal,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'LOST'
        },
        ...prev
      ]);
    }
  };

  // Central Flight Engine start
  const triggerNewRoundLobby = () => {
    if (mainTickerInterval.current) clearInterval(mainTickerInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    setCrashActive(false);
    setCrashMultiplier(1.00);
    setCountdownValue(5.0);
    setCrashStatusMessage("Lobby Loaded");
    generateSimulatedLobbyBettors();

    let secs = 5.0;
    countdownInterval.current = setInterval(() => {
      secs = parseFloat((secs - 0.1).toFixed(1));
      setCountdownValue(secs);

      if (secs <= 0) {
        clearInterval(countdownInterval.current!);
        setCountdownValue(null);
        startPlaneAscentFlight();
      }
    }, 100);
  };

  const startPlaneAscentFlight = () => {
    // Sound effect trigger
    audioEngine.playFlightStart();
    setCrashActive(true);
    setCountdownValue(null);
    setCrashMultiplier(1.00);

    // Seed Random provably fair limits
    const seedRandom = Math.random();
    let limit = 1.20;
    if (seedRandom < 0.25) {
      // Immediate low crashes (1.01x to 1.30x)
      limit = parseFloat((1.01 + Math.random() * 0.29).toFixed(2));
    } else if (seedRandom < 0.70) {
      // Normal range crashes (1.31x to 3.50x)
      limit = parseFloat((1.31 + Math.random() * 2.19).toFixed(2));
    } else if (seedRandom < 0.92) {
      // Great high roller crashes (3.51x to 12.00x)
      limit = parseFloat((3.51 + Math.random() * 8.49).toFixed(2));
    } else {
      // Extreme multipliers! (12.01x up to 180.00x)
      limit = parseFloat((12.01 + Math.random() * 168.0).toFixed(2));
    }
    
    setRoundCrashLimit(limit);

    let currentScale = 1.00;
    
    // Ticker increment speed coordinates
    mainTickerInterval.current = setInterval(() => {
      // Exponential plane ascent increments
      const adder = Math.pow(currentScale, 0.16) * 0.015 + 0.002;
      currentScale = parseFloat((currentScale + adder).toFixed(2));
      
      setCrashMultiplier(currentScale);

      // 1. Simulate cashing behavior of other active players
      setActivePlayers(prev => {
        let countChanged = false;
        const mapped = prev.map(player => {
          if (!player.cashedOut) {
            // High probability of cashouts near 1.5x - 2.5x
            const multiplierThreshold = 1.05 + Math.random() * 12.0;
            if (currentScale >= multiplierThreshold && Math.random() > 0.75) {
              player.cashedOut = true;
              player.multiplier = currentScale;
              player.payoutAmount = parseFloat((player.betAmount * currentScale).toFixed(1));
              countChanged = true;
            }
          }
          return player;
        });

        if (countChanged) {
          // Decrement current online players remaining on-board count
          const currentBettorsOnboard = mapped.filter(p => !p.cashedOut).length;
          setOnlinePlayersCount(Math.max(2, currentBettorsOnboard));
        }

        return mapped;
      });

      // 2. Evaluate crash limit reached
      if (currentScale >= limit) {
        clearInterval(mainTickerInterval.current!);
        handlePlaneCrashInFlight(limit);
      }
    }, 75);
  };

  const handlePlaneCrashInFlight = (endMult: number) => {
    // Sound effect trigger
    audioEngine.playCrash();
    setCrashActive(false);
    setCrashMultiplier(endMult);
    setCrashStatusMessage(`FLEW AWAY! at ${endMult.toFixed(2)}x`);
    
    // Expand results index history ribbon
    setHistoryList(prev => [endMult, ...prev.slice(0, 18)]);

    // Check unclaimed wagers
    resolveRoundUnsecuredBets();

    // Reset online counts
    setOnlinePlayersCount(0);

    // Wait 3.5 seconds to see results before loading next round lobby
    setTimeout(() => {
      triggerNewRoundLobby();
    }, 3800);
  };

  // Dual Panel handlers
  const handleBetPlaced = (panelId: string, amount: number) => {
    // Deduct wager instantaneously
    setBalance(prev => parseFloat((prev - amount).toFixed(2)));

    if (panelId === 'panel1') {
      setPanel1Placed(true);
      setPanel1Cashed(false);
      setPanel1BetVal(amount);
    } else {
      setPanel2Placed(true);
      setPanel2Cashed(false);
      setPanel2BetVal(amount);
    }
  };

  const handleCashOut = (panelId: string, finalMult: number, cashPayout: number) => {
    // Sound effect trigger
    audioEngine.playCashout();
    // Deposit cashout rewards immediately
    setBalance(prev => parseFloat((prev + cashPayout).toFixed(2)));

    if (panelId === 'panel1') {
      setPanel1Cashed(true);
    } else {
      setPanel2Cashed(true);
    }

    // Add personal wins to ledger
    const betVal = panelId === 'panel1' ? panel1BetVal : panel2BetVal;
    setMyBets(prev => [
      {
        amount: betVal,
        multiplier: finalMult,
        payout: cashPayout,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'WON'
      },
      ...prev
    ]);
  };

  // Mpesa cashier cashier deposit
  const handleDepositSuccess = (cashAmount: number) => {
    setBalance(prev => parseFloat((prev + cashAmount).toFixed(2)));
    setTotalDepositedToday(prev => {
      const next = prev + cashAmount;
      localStorage.setItem('aviator_deposited_today', next.toString());
      return next;
    });
  };

  const handleWithdrawSuccess = (cashAmount: number) => {
    setBalance(prev => parseFloat((prev - cashAmount).toFixed(2)));
  };

  // Trigger default loop start on boot
  useEffect(() => {
    triggerNewRoundLobby();
    return () => {
      if (mainTickerInterval.current) clearInterval(mainTickerInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  // Tick exclusion clock dynamically if excluded
  const [exclusionTick, setExclusionTick] = useState<number>(0);
  const isExcluded = selfExcludedUntil ? new Date(selfExcludedUntil) > new Date() : false;
  
  useEffect(() => {
    if (isExcluded) {
      const interval = setInterval(() => {
        setExclusionTick(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isExcluded]);

  if (isExcluded) {
    const end = new Date(selfExcludedUntil!);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    // Convert to days, hours, mins, secs remaining
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffSecs = Math.floor((diffMs / 1000) % 60);

    const handleClearSelfExclusion = () => {
      setSelfExcludedUntil(null);
      localStorage.removeItem('aviator_self_excluded_until');
      alert("Sandbox Mode: Self-exclusion cleared! Welcome back to the cockpit.");
    };

    return (
      <div className="min-h-screen bg-[#07080a] text-gray-100 flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="w-full max-w-md bg-[#131518] rounded-2xl border border-red-500/20 p-6 flex flex-col gap-6 text-center shadow-[0_15px_50px_rgba(239,68,68,0.15)] animate-scaleUp">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-950/30 border-2 border-red-500 flex items-center justify-center text-[#ff3a3a] animate-pulse cursor-default select-none">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase text-white tracking-widest leading-none">Safety Exclusion Active</h1>
            <span className="text-[#ff5555] text-[10px] font-extrabold uppercase bg-red-950/20 py-1 px-3.5 rounded-full border border-red-500/10 inline-block font-sans">
              Play Break active
            </span>
          </div>

          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            As requested under our **Responsible Gaming** policy, your CasinoHub / Aviator cockpit access is locked. Use this pause to step away from active betting.
          </p>

          <div className="bg-[#0e0f11] p-4 rounded-xl border border-[#212328] space-y-1">
            <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Time remaining:</div>
            <div className="text-lg font-mono font-black text-red-400">
              {diffDays > 0 && <span>{diffDays}d </span>}
              {diffHours.toString().padStart(2, '0')}h : {diffMins.toString().padStart(2, '0')}m : {diffSecs.toString().padStart(2, '0')}s
            </div>
          </div>

          {/* Helpline listings inside block screen */}
          <div className="text-left space-y-2">
            <h4 className="text-[9.5px] text-gray-500 uppercase font-black tracking-wider flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
              <span>Free Support Handshake Contacts</span>
            </h4>
            <div className="space-y-1.5 text-[10px]">
              <div className="bg-[#1b1c21] p-2 rounded-lg border border-[#252830] text-gray-300">
                <strong className="text-white block font-bold text-[10.5px]">Kenya Support Helpline (RGAK)</strong>
                <span>Counselling: <strong className="font-mono text-[#00e600]">+254 700 000 000</strong></span>
              </div>
              <div className="bg-[#1b1c21] p-2 rounded-lg border border-[#252830] text-gray-300">
                <strong className="text-white block font-bold text-[10.5px]">GambleAware International helpline</strong>
                <span>UK Free: <strong className="font-mono text-[#00e600]">+44 808 8020 133</strong></span>
              </div>
            </div>
          </div>

          {/* Developer Sandbox Override Bypass button */}
          <div className="pt-2 border-t border-[#23252a] space-y-1">
            <span className="text-[9px] text-gray-500 block font-mono">Sandbox Bypass Tool for Evaluation:</span>
            <button
              onClick={handleClearSelfExclusion}
              className="w-full py-2 bg-[#00e600]/10 hover:bg-[#00e600]/20 border border-[#00e600]/20 hover:border-[#00e600]/45 text-[#00e600] text-[9.5px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
            >
              🛠️ Sandbox Override: Liftoff Exclusion early
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-gray-100 flex flex-col justify-start items-center p-0 md:p-3 relative antialiased md:py-6 overflow-x-hidden">
      
      {/* Central Screen Frame */}
      <div className="w-full max-w-lg md:max-w-2xl bg-[#0d0e10] rounded-none md:rounded-3xl border border-[#23252a] overflow-hidden flex flex-col min-h-screen md:min-h-[820px] shadow-[0_12px_60px_rgba(0,0,0,0.8)]">
        
        {/* Dynamic Session Limit Alert Banner */}
        {showSessionAlert && (
          <div className="bg-amber-950/85 border-b border-amber-500/15 px-4 py-2 flex items-center justify-between text-[11px] select-none animate-slideDown shrink-0">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Play Session limit reached!</strong> You have played for your self-imposed limit of {sessionLimit}m.
              </span>
            </div>
            <div className="flex gap-1.5 shrink-0 ml-1">
              <button
                onClick={resetSessionTimer}
                className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded text-[9.5px] uppercase cursor-pointer transition-colors"
              >
                Reset Timer
              </button>
              <button
                onClick={() => { setSessionLimit(null); resetSessionTimer(); }}
                className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded text-[9.5px] uppercase cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* TOP BAR BRAND INDENT */}
        <AviatorHeader 
          balance={balance}
          onOpenDeposit={() => setIsDepositOpen(true)}
          onOpenResponsibleGaming={() => setIsResponsibleGamingOpen(true)}
          muted={muted}
          onToggleMute={handleToggleMute}
        />

        {/* RECENT HISTORIC MULTIPLIERS STRIP */}
        <HistoryRibbon 
          multipliers={historyList}
        />

        {/* MIDDLE FLIGHT VIEWPORT CONTAINER */}
        <div className="p-3 bg-[#0d0e10] flex flex-col">
          <AviatorGameViewport 
            crashActive={crashActive}
            crashMultiplier={crashMultiplier}
            crashStatusMessage={crashStatusMessage}
            countdownValue={countdownValue}
            onlinePlayersCount={onlinePlayersCount}
            avatarList={COMPANION_AVATARS}
          />
        </div>

        {/* BOTTOM ACTIVE BET CONTROL CONSOLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 pb-3 bg-[#0d0e10]">
          {/* Bet Console Panel 1 */}
          <AviatorBetPanel 
            panelId="panel1"
            balance={balance}
            crashActive={crashActive}
            crashMultiplier={crashMultiplier}
            countdownActive={countdownValue !== null}
            isPlaced={panel1Placed}
            setIsPlaced={setPanel1Placed}
            hasCashedOut={panel1Cashed}
            setHasCashedOut={setPanel1Cashed}
            onBetPlaced={(amt) => handleBetPlaced('panel1', amt)}
            onCashOut={(mult, payout) => handleCashOut('panel1', mult, payout)}
          />

          {/* Bet Console Panel 2 */}
          <AviatorBetPanel 
            panelId="panel2"
            balance={balance}
            crashActive={crashActive}
            crashMultiplier={crashMultiplier}
            countdownActive={countdownValue !== null}
            isPlaced={panel2Placed}
            setIsPlaced={setPanel2Placed}
            hasCashedOut={panel2Cashed}
            setHasCashedOut={setPanel2Cashed}
            onBetPlaced={(amt) => handleBetPlaced('panel2', amt)}
            onCashOut={(mult, payout) => handleCashOut('panel2', mult, payout)}
          />
        </div>

        {/* MULTIPLAYER LOBBY STATISTICS AND PERSISTENT LEDGER BOARDS */}
        <div className="flex-1 bg-[#0d0e10] p-3 pt-0 flex flex-col justify-end">
          <BetsLedger 
            myBets={myBets}
            activePlayers={activePlayers}
            crashActive={crashActive}
            crashMultiplier={crashMultiplier}
          />
        </div>

        {/* Interactive M-Pesa STK Cashier drawer popup window */}
        {isDepositOpen && (
          <MpesaModal 
            onClose={() => setIsDepositOpen(false)}
            onDepositSuccess={handleDepositSuccess}
            onWithdrawSuccess={handleWithdrawSuccess}
            balance={balance}
            depositLimit={depositLimit}
            totalDepositedToday={totalDepositedToday}
            onOpenResponsibleGaming={() => {
              setIsDepositOpen(false);
              setIsResponsibleGamingOpen(true);
            }}
          />
        )}

        {/* Responsible Gaming & Player Safety Settings Panel */}
        {isResponsibleGamingOpen && (
          <ResponsibleGamingModal 
            onClose={() => setIsResponsibleGamingOpen(false)}
            depositLimit={depositLimit}
            setDepositLimit={setDepositLimit}
            sessionLimit={sessionLimit}
            setSessionLimit={setSessionLimit}
            selfExcludedDays={null}
            onSelfExclude={handleSelfExclude}
            totalDepositedToday={totalDepositedToday}
            sessionTimeLeftSecs={sessionTimeLeftSecs}
            resetSessionTimer={resetSessionTimer}
            onResetDeposits={handleResetDepositedToday}
          />
        )}

      </div>
    </div>
  );
}
