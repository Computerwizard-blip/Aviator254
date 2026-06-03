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
import { AnimatePresence, motion } from 'motion/react';
import CasinoGames from './components/CasinoGames';
import AdminPanel from './components/AdminPanel';
import NotificationsCenter from './components/NotificationsCenter';
import WelcomingIntro from './components/WelcomingIntro';
import ProfilePanel from './components/ProfilePanel';
import { Lock, PhoneCall, ShieldAlert, HeartHandshake, AlertOctagon, Gamepad2, Settings, ListFilter, Bell } from 'lucide-react';
import { Wallet, UserProfile, JackpotPool, Transaction, NotificationItem } from './types';

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

/// Deterministic Random Generator for synchronizing lobby players and values
function seededRandom(seedValue: number) {
  let value = seedValue;
  return function() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// Compute deterministic round limit based on time-synchronized checks & login elapsed state
function getRoundLimit(roundIndex: number) {
  let h = Math.abs(Math.sin(roundIndex) * 10000);
  h = h - Math.floor(h);

  // Retrieve stored first open time from sessionStorage or localStorage safely
  let loginTime = Date.now();
  try {
    const stored = localStorage.getItem('casinohub_first_open_time') || sessionStorage.getItem('casinohub_login_time');
    if (stored) {
      loginTime = parseInt(stored, 10);
    } else {
      localStorage.setItem('casinohub_first_open_time', loginTime.toString());
      sessionStorage.setItem('casinohub_login_time', loginTime.toString());
    }
  } catch (e) {}

  // Check sessionStorage or localStorage for high gold round indices
  let highRoundIndices: number[] = [];
  try {
    const stored = localStorage.getItem('casinohub_high_round_indices');
    if (stored) {
      highRoundIndices = JSON.parse(stored);
    }
  } catch (e) {}

  // Decide if this roundIndex qualifies as a gold win round after 2 minutes
  const elapsedMs = Date.now() - loginTime;
  const isPast2Minutes = elapsedMs >= 120000; // 2 minutes = 120000ms

  if (isPast2Minutes && highRoundIndices.length < 2) {
    if (!highRoundIndices.includes(roundIndex)) {
      highRoundIndices.push(roundIndex);
      localStorage.setItem('casinohub_high_round_indices', JSON.stringify(highRoundIndices));
    }
  }

  const isHigh = highRoundIndices.includes(roundIndex);
  if (isHigh) {
    // Gold win: 200 minimum to 1000 maximum randomly selected
    return parseFloat((200.00 + h * 800.00).toFixed(2));
  } else {
    // Highly authentic Aviator model: over 55% of rounds crash under 2.00x (1.00 - 1.99)
    if (h < 0.11) {
      // 11% of rounds crash immediately at 1.00x
      return 1.00;
    } else if (h < 0.55) {
      // 44% of rounds crash between 1.01x and 1.99x
      const p = (h - 0.11) / 0.44;
      return parseFloat((1.01 + p * 0.98).toFixed(2));
    } else if (h < 0.80) {
      // 25% of rounds crash between 2.00x and 10.00x
      const p = (h - 0.55) / 0.25;
      return parseFloat((2.00 + p * 8.00).toFixed(2));
    } else if (h < 0.95) {
      // 15% of rounds between 10.01x and 30.00x
      const p = (h - 0.80) / 0.15;
      return parseFloat((10.01 + p * 19.99).toFixed(2));
    } else {
      // 5% of rounds rare hits between 30.01x and 107.00x
      const p = (h - 0.95) / 0.05;
      return parseFloat((30.01 + p * 76.99).toFixed(2));
    }
  }
}

export default function App() {
  // Navigation & Workspace views state
  const [currentView, setView] = useState<'aviator' | 'lobby' | 'admin'>('aviator');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Custom Welcoming entrance blocker state
  const [authSessionMode, setAuthSessionMode] = useState<'demo' | 'real' | null>(() => {
    const isAuthed = sessionStorage.getItem('casinohub_session_authenticated') === 'true';
    if (isAuthed) {
      return 'real';
    }
    return null;
  });

  // Integrations states
  const [wallet, setWalletState] = useState<Wallet>(() => {
    const saved = localStorage.getItem('casinohub_wallet_balances');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          realBalance: parsed.realBalance !== undefined ? parsed.realBalance : 0.00,
          demoBalance: parsed.demoBalance !== undefined ? parsed.demoBalance : 50000.00,
          mainBalance: parsed.mainBalance !== undefined ? parsed.mainBalance : 50000.00,
          bonusBalance: parsed.bonusBalance !== undefined ? parsed.bonusBalance : 1250.00,
          cashbackBalance: parsed.cashbackBalance !== undefined ? parsed.cashbackBalance : 250.00
        };
      } catch (e) {}
    }
    return {
      realBalance: 0.00,
      demoBalance: 50000.00,
      mainBalance: 50000.00,
      bonusBalance: 1250.00,
      cashbackBalance: 250.00
    };
  });

  const setWallet = (val: React.SetStateAction<Wallet>) => {
    setWalletState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('casinohub_wallet_balances', JSON.stringify(next));
      return next;
    });
  };

  const balance = authSessionMode === 'real' ? wallet.realBalance : wallet.demoBalance;

  const setBalance = (val: number | ((prev: number) => number)) => {
    setWallet(prev => {
      const isReal = authSessionMode === 'real';
      const currentVal = isReal ? prev.realBalance : prev.demoBalance;
      const nextVal = typeof val === 'function' ? val(currentVal) : val;
      const roundedVal = parseFloat(nextVal.toFixed(2));
      if (isReal) {
        return {
          ...prev,
          realBalance: roundedVal,
          mainBalance: roundedVal
        };
      } else {
        return {
          ...prev,
          demoBalance: roundedVal,
          mainBalance: roundedVal
        };
      }
    });
  };

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'francypendy',
    email: 'francypendy@gmail.com',
    phone: '0712345678',
    avatar: 'FP',
    language: 'EN',
    currency: 'KSh',
    vipLevel: 'Silver',
    vipPoints: 1240,
    joinedDate: '2026-01-10'
  });

  const [jackpotPool, setJackpotPool] = useState<JackpotPool>({
    mega: 1845209.45,
    major: 421908.20,
    minor: 56123.00,
    mini: 12400.50
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'> & { status?: 'SUCCESS' | 'FAILED' | 'PENDING' }) => {
    const newTx: Transaction = {
      ...tx,
      id: `TX-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
      status: tx.status || 'SUCCESS',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Game of the Week State
  const [gameOfTheWeek, setGameOfTheWeek] = useState<any>(() => {
    const saved = localStorage.getItem('casino_game_of_the_week');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      gameId: 'slot-classic', // Fruit Mania 777 standard default
      promoType: 'cashback_boost',
      promoValue: '+10% Cashback',
      description: 'Spin Fruit Mania 777 this week and unlock massive 10% boosted cashback on all lost stakes!',
      bannerTitle: 'Fruit Mania 777 Cashback Turbo Boost!'
    };
  });

  // Notification center states
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-01',
      title: 'Welcome to CasinoHub 🎰',
      message: 'Take off inside our high-performance Aviator Cockpit or explore dozens of slots and table games!',
      type: 'general',
      channel: 'in_app',
      timestamp: 'Just now',
      read: false
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const triggerNotification = (
    title: string,
    message: string,
    type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Math.random().toString(36).substring(2, 8)}`,
      title,
      message,
      type,
      channel: 'in_app',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleToggleAuthSessionMode = () => {
    if (authSessionMode === 'demo') {
      // Switch to Real mode
      const saved = localStorage.getItem('casinohub_registered_account');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserProfile(prev => ({
            ...prev,
            username: parsed.fullName.toLowerCase().replace(/\s+/g, '_'),
            phone: parsed.phone,
            fullName: parsed.fullName
          }));
          setAuthSessionMode('real');
          triggerNotification(
            '🟢 REAL PLAY ACTIVE',
            `Successfully switched to Real Play mode. Main Balance is KSh ${wallet.realBalance.toLocaleString()}`,
            'vip'
          );
        } catch (e) {
          setAuthSessionMode('real');
        }
      } else {
        // Create a default registry account in localStorage so they have an account immediately
        const defaultAccount = {
          fullName: 'Frank Janal',
          phone: '0117051321',
          password: '4298'
        };
        localStorage.setItem('casinohub_registered_account', JSON.stringify(defaultAccount));
        setUserProfile(prev => ({
          ...prev,
          username: 'frank_janal',
          phone: '0117051321',
          fullName: 'Frank Janal'
        }));
        setAuthSessionMode('real');
        triggerNotification(
          '🟢 REAL PLAY ACTIVE',
          `Initialized new Real Play profile! Welcome back.`,
          'vip'
        );
      }
    } else {
      // Switch to Demo
      setAuthSessionMode('demo');
      setUserProfile(prev => ({
        ...prev,
        username: 'demo_player',
        fullName: 'Demo Player'
      }));
      triggerNotification(
        '🟣 DEMO PLAY RUNNING',
        'Switched to Demo Cockpit. Unlimited practice mode is active!',
        'general'
      );
    }
  };

  const incrementJackpots = (amount: number) => {
    setJackpotPool(prev => ({
      mega: prev.mega + amount * 0.4,
      major: prev.major + amount * 0.3,
      minor: prev.minor + amount * 0.2,
      mini: prev.mini + amount * 0.1
    }));
  };

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
  const [roundIndex, setRoundIndex] = useState<number>(() => Math.floor(Date.now() / 42000));
  const [currentPhase, setCurrentPhase] = useState<'lobby' | 'flight' | 'crashed'>('lobby');
  const [crashActive, setCrashActive] = useState<boolean>(false);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [crashStatusMessage, setCrashStatusMessage] = useState<string>("Ready KSh");
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
  const [startingPlayers, setStartingPlayers] = useState<number>(1850);
  const [finalMinPlayers, setFinalMinPlayers] = useState<number>(85);
  const [bigWinOverlay, setBigWinOverlay] = useState<{ multiplier: number; amount: number } | null>(null);

  // Big Win overlay auto-close effect
  useEffect(() => {
    if (bigWinOverlay) {
      const timer = setTimeout(() => {
        setBigWinOverlay(null);
      }, 5000); // 5 seconds of majestic golden glory
      return () => clearTimeout(timer);
    }
  }, [bigWinOverlay]);

  // M-Pesa overlay indicator State
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const handleSignOut = () => {
    sessionStorage.removeItem('casinohub_session_authenticated');
    localStorage.removeItem('casinohub_registered_account');
    setAuthSessionMode(null);
    setIsProfileOpen(false);
    triggerNotification(
      '🚪 SIGNED OUT',
      'You have safely signed out of your player session. Welcome back anytime!',
      'general'
    );
  };

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

  // Synchronized Multi-Device Ticker Refs
  const panel1ActiveBetRef = useRef<number | null>(null);
  const panel2ActiveBetRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<'lobby' | 'flight' | 'crashed' | null>(null);
  const currentRoundIndexRef = useRef<number>(-1);

  // Helper: setup simulated other players bets at start of lobby
  const generateSimulatedLobbyBettors = (roundIndex: number) => {
    const rand = seededRandom(roundIndex + 12345);
    
    // a maximum of 1000 to 2000 in starting (more than 1000 but less than 2000)
    const maxStart = Math.floor(rand() * (1999 - 1001 + 1)) + 1001;
    // a minimum of 63 to 135
    const minFinal = Math.floor(rand() * (135 - 63 + 1)) + 63;
    
    setStartingPlayers(maxStart);
    setFinalMinPlayers(minFinal);
    setOnlinePlayersCount(maxStart);

    const poolList: (BetLogItem & { cashoutThreshold?: number; willCashOut?: boolean })[] = [];
    const usedNames = new Set<string>();

    const firstNames = [
      'Kamau', 'Amani', 'Njoroge', 'Otieno', 'Wanjiku', 'Mwangi', 'Kibet', 'Juma', 'Zuri', 'Mutua',
      'Fatuma', 'Amina', 'Kiptoo', 'Ngugi', 'Omondi', 'Kariuki', 'Waweru', 'Abdi', 'Adan', 'Ali',
      'Chebet', 'Jepchirchir', 'Kosgei', 'Lagat', 'Maalim', 'Musa', 'Ochieng', 'Odhiambo', 'Okoth',
      'Wanjala', 'Peter', 'John', 'Grace', 'Mercy', 'David', 'James', 'Sarah', 'Mary', 'Joseph'
    ];
    const lastNames = [
      'KE', '254', 'Bettor', 'Hustler', 'Win', '001', 'Racer', 'Bets', 'Safar', 'Guru', 'Rider',
      'VIP', 'Jet', 'Flyer', 'Fast', 'Ace', 'Star', 'Rich', 'Winner', 'Boss', 'Slinger', 'Pro',
      'Gold', 'King', 'Queen', 'Max', 'Apex', 'Hyper', 'Sonic', 'Zon', 'Play', 'Club', 'Storm'
    ];

    // Generate simulated active participants
    const cohortSize = 65;
    for (let i = 0; i < cohortSize; i++) {
      const idx1 = Math.floor(rand() * firstNames.length);
      const first = firstNames[idx1];
      const idx2 = Math.floor(rand() * lastNames.length);
      const last = lastNames[idx2];
      let candidate = `${first}_${last}`;
      if (usedNames.has(candidate)) {
        candidate = `${candidate}_${Math.floor(rand() * 99)}`;
      }
      usedNames.add(candidate);

      const randomStake = rand() > 0.6 
        ? Math.floor(rand() * 800) + 100 
        : Math.floor(rand() * 11000) + 1000;

      const cashoutThreshold = parseFloat((1.05 + rand() * 1500.0).toFixed(2));
      const willCashOut = rand() > 0.12;

      poolList.push({
        id: `b-${i}-${Math.floor(rand() * 10000)}`,
        username: candidate,
        betAmount: randomStake,
        cashedOut: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cashoutThreshold,
        willCashOut
      });
    }

    // Sort players so higher bets are placed on top for dramatic gaming impact
    poolList.sort((a,b) => b.betAmount - a.betAmount);
    setActivePlayers(poolList);
  };

  // Helper helper: trigger payouts or losses at the end of flight
  const resolveRoundUnsecuredBets = () => {
    const lostAmt1 = panel1ActiveBetRef.current;
    if (lostAmt1 !== null) {
      setMyBets(prev => [
        {
          amount: lostAmt1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'LOST'
        },
        ...prev
      ]);
      panel1ActiveBetRef.current = null;
    }

    const lostAmt2 = panel2ActiveBetRef.current;
    if (lostAmt2 !== null) {
      setMyBets(prev => [
        {
          amount: lostAmt2,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'LOST'
        },
        ...prev
      ]);
      panel2ActiveBetRef.current = null;
    }
  };

  // Dynamic Flight System Hook with NO hanging
  const phaseStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Generate simulated players if round index changes
    if (currentRoundIndexRef.current !== roundIndex) {
      currentRoundIndexRef.current = roundIndex;
      generateSimulatedLobbyBettors(roundIndex);
    }
  }, [roundIndex]);

  useEffect(() => {
    phaseStartTimeRef.current = Date.now();
  }, [currentPhase]);

  // Set initial history list on mount dynamically
  useEffect(() => {
    const list: number[] = [];
    const baseIndex = Math.floor(Date.now() / 42000);
    for (let i = 1; i <= 15; i++) {
      list.push(getRoundLimit(baseIndex - i));
    }
    setHistoryList(list);
  }, []);

  useEffect(() => {
    const handleGameLoopTick = () => {
      const now = Date.now();
      const elapsed = now - phaseStartTimeRef.current;
      const limit = getRoundLimit(roundIndex);

      // Determine flight duration smoothly scaled
      let flightDuration = 5000;
      if (limit > 200) {
        flightDuration = Math.round(15000 + ((limit - 200) / 800) * 10000);
      } else if (limit > 15) {
        flightDuration = Math.round(10000 + ((limit - 15) / 92) * 8000);
      } else {
        flightDuration = Math.round(4000 + ((limit - 1) / 14) * 6000);
      }

      const lobbyDuration = 6000; // 6 seconds lobby countdown
      const crashedDuration = 2200; // 2.2 seconds display on crashed (no hanging!)

      if (currentPhase === 'lobby') {
        const countdownVal = parseFloat(((lobbyDuration - elapsed) / 1000).toFixed(1));
        if (countdownVal > 0) {
          setCountdownValue(countdownVal);
          setOnlinePlayersCount(startingPlayers);
          setCrashActive(false);
          setCrashMultiplier(1.00);
          setCrashStatusMessage("Lobby Loaded");
          setRoundCrashLimit(limit);
        } else {
          // Transition to flight!
          audioEngine.playFlightStart();
          setCrashActive(true);
          setCountdownValue(null);
          setRoundCrashLimit(limit);
          setCurrentPhase('flight');
        }
      } else if (currentPhase === 'flight') {
        if (elapsed < flightDuration) {
          // Compute current scale progression curves smoothly
          const progressFrac = Math.min(1.0, elapsed / flightDuration);
          // Exponential acceleration curve matching flight progress
          let currentScale = 1.00 + (limit - 1.00) * Math.pow(progressFrac, 3.5);
          if (currentScale > limit) {
            currentScale = limit;
          }
          currentScale = parseFloat(currentScale.toFixed(2));
          setCrashMultiplier(currentScale);

          // Update active players' cashout status based on thresholds
          setActivePlayers(prev => {
            return prev.map(player => {
              if (!player.cashedOut) {
                const th = (player as any).cashoutThreshold || 1.8;
                const willCO = (player as any).willCashOut !== false;
                if (willCO && currentScale >= th) {
                  return {
                    ...player,
                    cashedOut: true,
                    multiplier: th,
                    payoutAmount: parseFloat((player.betAmount * th).toFixed(1))
                  };
                }
              }
              return player;
            });
          });

          // Decrement online survivors count smoothly
          const totalProgress = Math.min(0.98, (currentScale - 1.0) / (limit - 1.0 || 1.0));
          const calculatedAliveCount = Math.max(
            finalMinPlayers,
            Math.round(startingPlayers - totalProgress * (startingPlayers - finalMinPlayers))
          );
          setOnlinePlayersCount(calculatedAliveCount);
        } else {
          // Transition to crashed!
          audioEngine.playCrash();
          setCrashActive(false);
          setCountdownValue(null);
          setCrashMultiplier(limit);
          setCrashStatusMessage(`FLEW AWAY! at ${limit.toFixed(2)}x`);
          resolveRoundUnsecuredBets();
          setOnlinePlayersCount(0);
          
          // Append actual result to history ribbon list
          setHistoryList(prev => {
            if (prev.includes(limit)) return prev; // Avoid duplicating if already added
            const nextList = [limit, ...prev];
            return nextList.slice(0, 15);
          });

          setCurrentPhase('crashed');
        }
      } else if (currentPhase === 'crashed') {
        if (elapsed >= crashedDuration) {
          // Transition to next round immediately after display!
          setRoundIndex(prev => prev + 1);
          setCurrentPhase('lobby');
        }
      }
    };

    const interval = setInterval(handleGameLoopTick, 50);
    return () => clearInterval(interval);
  }, [currentPhase, roundIndex, startingPlayers, finalMinPlayers]);

  // Dual Panel handlers
  const handleBetPlaced = (panelId: string, amount: number) => {
    // Deduct wager instantaneously
    setBalance(prev => parseFloat((prev - amount).toFixed(2)));

    if (panelId === 'panel1') {
      setPanel1Placed(true);
      setPanel1Cashed(false);
      setPanel1BetVal(amount);
      panel1ActiveBetRef.current = amount;
    } else {
      setPanel2Placed(true);
      setPanel2Cashed(false);
      setPanel2BetVal(amount);
      panel2ActiveBetRef.current = amount;
    }
  };

  const handleBetCancelled = (panelId: string, amount: number) => {
    // Refund the balance!
    setBalance(prev => parseFloat((prev + amount).toFixed(2)));
    if (panelId === 'panel1') {
      setPanel1BetVal(0);
      panel1ActiveBetRef.current = null;
    } else {
      setPanel2BetVal(0);
      panel2ActiveBetRef.current = null;
    }
  };

  const handleCashOut = (panelId: string, finalMult: number, cashPayout: number) => {
    // Sound effect trigger
    audioEngine.playCashout();
    // Deposit cashout rewards immediately
    setBalance(prev => parseFloat((prev + cashPayout).toFixed(2)));

    if (panelId === 'panel1') {
      setPanel1Cashed(true);
      panel1ActiveBetRef.current = null;
    } else {
      setPanel2Cashed(true);
      panel2ActiveBetRef.current = null;
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

    // Trigger Big Win Celebration Overlay if multiplier >= 5.0x!
    if (finalMult >= 5.0) {
      setBigWinOverlay({ multiplier: finalMult, amount: cashPayout });
    }
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

  if (!authSessionMode) {
    return (
      <WelcomingIntro 
        onLoginSuccess={(name, phoneStr, mode, referralCode) => {
          setAuthSessionMode(mode);
          
          if (referralCode && referralCode.trim() !== '') {
            const codeClean = referralCode.trim().toUpperCase();
            
            setWallet(w => {
              if (mode === 'real') {
                const nextReal = parseFloat((w.realBalance + 500.0).toFixed(2));
                return {
                  ...w,
                  realBalance: nextReal,
                  mainBalance: nextReal
                };
              } else {
                const nextDemo = parseFloat((w.demoBalance + 500.0).toFixed(2));
                return {
                  ...w,
                  demoBalance: nextDemo,
                  mainBalance: nextDemo
                };
              }
            });

            addTransaction({
              type: 'bonus_credit',
              amount: 500.0,
              currency: 'KSh',
              method: `Referral welcome bonus: ${codeClean}`,
            });

            setTimeout(() => {
              triggerNotification(
                '🎉 REFERRAL ACTIVATED!',
                `Referral promo code "${codeClean}" approved! KSh 500.00 welcome gift has been loaded to your wallet.`,
                'vip'
              );
            }, 150);
          }

          if (mode === 'real') {
            setUserProfile(prev => ({
              ...prev,
              username: name.toLowerCase().replace(/\s+/g, '_'),
              phone: phoneStr,
              fullName: name
            }));
            triggerNotification(
              '🟢 REAL PLAY ACTIVE',
              `Greetings ${name}! You have successfully logged in under Real Play mode.`,
              'vip'
            );
          } else {
            setUserProfile(prev => ({
              ...prev,
              username: 'demo_player',
              fullName: 'Demo Player'
            }));
            triggerNotification(
              '🟣 DEMO PLAY RUNNING',
              'Enjoy free unlimited wagers in cockpit demo mode!',
              'general'
            );
          }
        }}
      />
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
          currentView={currentView}
          setView={setView}
          notificationsCount={notifications.filter(n => !n.read).length}
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          authSessionMode={authSessionMode}
          onToggleAuthSessionMode={handleToggleAuthSessionMode}
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Alert Notifications Center pop-down drawer overlays */}
        <div className="relative">
          <NotificationsCenter 
            notifications={notifications}
            setNotifications={setNotifications}
            isOpen={isNotificationsOpen}
            setIsOpen={setIsNotificationsOpen}
          />
        </div>

        {/* VIEW NAVIGATION TABS */}
        <div className="bg-[#101114] px-3 py-1.5 border-b border-[#212327] flex items-center justify-between gap-1 select-none shrink-0 overflow-x-auto text-[10px] font-bold font-sans tracking-wide">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setView('aviator'); setIsNotificationsOpen(false); }}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${currentView === 'aviator' ? 'bg-[#e21515] text-[#fff] shadow-[0_0_12px_rgba(226,21,21,0.3)]' : 'bg-black/15 text-[#9b9da4] hover:text-[#d1d2d6]'}`}
            >
              <span>🚀</span>
              <span className="uppercase">Aviator Cockpit</span>
            </button>
            <button
              onClick={() => { setView('lobby'); setIsNotificationsOpen(false); }}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${currentView === 'lobby' ? 'bg-purple-600 text-[#fff] shadow-[0_0_12px_rgba(147,51,234,0.3)]' : 'bg-black/15 text-[#9b9da4] hover:text-[#d1d2d6]'}`}
            >
              <span>🎰</span>
              <span className="uppercase">Casino Lobby</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                sessionStorage.removeItem('casinohub_session_authenticated');
                setAuthSessionMode(null);
                triggerNotification(
                  '🔒 SESSION LOCKED',
                  'You have locked your live session. Enter your pass PIN to resume!',
                  'general'
                );
              }}
              className="px-2.5 py-1.5 rounded bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 hover:border-red-500/40 text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
              title="Lock Current Session"
            >
              <span className="text-[11px]">🔑</span>
              <span>Lock</span>
            </button>
          </div>
        </div>

        {currentView === 'aviator' && (
          <>
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
                avatarList={(() => {
                  const alive = activePlayers.filter(p => !p.cashedOut);
                  const pool = alive.length >= 3 ? alive : activePlayers;
                  const mapped = pool.slice(0, 3).map(p => {
                    const clean = p.username.replace(/[^a-zA-Z]/g, '').toUpperCase();
                    return clean.substring(0, 2) || 'KM';
                  });
                  return mapped.length >= 3 ? mapped : ['KM', 'AM', 'NJ'];
                })()}
                authSessionMode={authSessionMode}
              />
            </div>

            {/* BOTTOM ACTIVE BET CONTROL CONSOLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 pb-3 bg-[#0d0e10]">
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
                onBetCancelled={(amt) => handleBetCancelled('panel1', amt)}
              />

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
                onBetCancelled={(amt) => handleBetCancelled('panel2', amt)}
              />
            </div>

            {/* MULTIPLAYER LOBBY STATISTICS AND PERSISTENT LEDGER BOARDS */}
            <div className="flex-1 bg-[#0d0e10] p-3 pt-0 flex flex-col justify-end">
              <BetsLedger 
                myBets={myBets}
                activePlayers={activePlayers}
                crashActive={crashActive}
                crashMultiplier={crashMultiplier}
                multipliers={historyList}
              />
            </div>
          </>
        )}

        {currentView === 'lobby' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0d0e10] text-[#eaeaea] scrollbar-thin scrollbar-thumb-purple-900/30 font-sans">
            <CasinoGames 
              wallet={wallet}
              setWallet={setWallet}
              addTransaction={addTransaction}
              triggerNotification={triggerNotification}
              incrementJackpots={incrementJackpots}
              jackpotPool={jackpotPool}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              gameOfTheWeek={gameOfTheWeek}
              userProfile={userProfile}
              authSessionMode={authSessionMode}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#0a0515] scrollbar-thin scrollbar-thumb-purple-900/30">
            <AdminPanel 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              wallet={wallet}
              setWallet={setWallet}
              jackpotPool={jackpotPool}
              setJackpotPool={setJackpotPool}
              transactions={transactions}
              addTransaction={addTransaction}
              triggerNotification={triggerNotification}
              gameOfTheWeek={gameOfTheWeek}
              setGameOfTheWeek={setGameOfTheWeek}
            />
          </div>
        )}

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
            authSessionMode={authSessionMode}
            onToggleAuthMode={handleToggleAuthSessionMode}
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

        {/* Real-Aviator Styled Account Profile Panel Drawer */}
        <ProfilePanel 
          userProfile={userProfile}
          wallet={wallet}
          authSessionMode={authSessionMode}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSignOut={handleSignOut}
          triggerNotification={triggerNotification}
        />

        {/* BIG WIN CELEBRATION OVERLAY */}
        <AnimatePresence>
          {bigWinOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none overflow-hidden"
              onClick={() => setBigWinOverlay(null)}
            >
              {/* Confetti canvas items drifting downward */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = Math.random() * 100;
                  const size = Math.random() * 6 + 4;
                  const delay = Math.random() * 2;
                  const duration = 2.5 + Math.random() * 2.5;
                  const color = i % 3 === 0 ? '#fbbf24' : i % 2 === 0 ? '#10b981' : '#f59e0b';
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${x}%`,
                        width: size,
                        height: size,
                        backgroundColor: color,
                        top: '-10px',
                        boxShadow: `0 0 8px ${color}`,
                      }}
                      initial={{ y: -50, opacity: 0, rotate: 0 }}
                      animate={{ 
                        y: '105vh', 
                        opacity: [0, 1, 1, 0],
                        rotate: 360 
                      }}
                      transition={{ 
                        duration, 
                        repeat: Infinity,
                        delay,
                        ease: "linear"
                      }}
                    />
                  );
                })}
              </div>

              {/* Celebration Golden Box Modal Card */}
              <motion.div
                initial={{ scale: 0.3, y: 100, rotate: -5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.3, y: 100, rotate: 5 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                className="relative bg-gradient-to-b from-[#1c1236]/95 via-[#14151a]/95 to-[#0b0c0ed9] border-2 border-yellow-400 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_80px_rgba(251,191,36,0.55)] flex flex-col items-center gap-4 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Shining Golden Halo Rays in background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12)_0%,transparent_70%)] pointer-events-none rounded-3xl" />

                {/* Sparkling icon layout */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 animate-bounce shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                  <span className="text-4xl">🏆</span>
                  {/* Glowing small sparkles */}
                  <span className="absolute -top-1 -right-1 text-xl animate-pulse">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-xl animate-pulse">✨</span>
                </div>

                {/* Bold Golden Header label */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">Awesome Flight Achievement</h3>
                  <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1 animate-pulse uppercase">
                    BIG WIN!
                  </h2>
                </div>

                {/* Display Multiplier Achievement */}
                <div className="bg-black/40 border border-yellow-400/20 px-6 py-2 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#9e9ea4] font-semibold">Cashed out Multiplier</span>
                  <div className="text-5xl font-sans font-black text-[#00e600] tracking-tight py-1">
                    {bigWinOverlay.multiplier.toFixed(2)}x
                  </div>
                </div>

                {/* Display Balance payout */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Winning Balance Payout</span>
                  <div className="text-3xl font-mono font-black text-white py-1">
                    KSh {bigWinOverlay.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-mono">
                    Credited Instantly to Real Balance
                  </div>
                </div>

                {/* Action Collect Button */}
                <button
                  onClick={() => setBigWinOverlay(null)}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold tracking-widest text-sm rounded-xl uppercase shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer transform active:scale-95 duration-100"
                >
                  COLLECT MONEY
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
