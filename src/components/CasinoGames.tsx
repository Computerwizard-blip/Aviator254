/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  Zap, 
  User, 
  Coins, 
  Activity, 
  Flame, 
  ChevronRight, 
  Eye, 
  Sparkles, 
  Clock, 
  Grid, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Sliders,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { GameItem, Wallet, Transaction } from '../types';

interface CasinoGamesProps {
  wallet: Wallet;
  setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
  triggerNotification: (title: string, message: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
  incrementJackpots: (amount: number) => void;
  jackpotPool: { mega: number; major: number; minor: number; mini: number };
  setActiveCategory: (cat: string) => void;
  activeCategory: string;
}

export const LISTED_GAMES: GameItem[] = [
  // SLOTS
  { id: 'slot-classic', title: 'Fruit Mania 777', category: 'slots', provider: 'CasinoHub Original', emoji: '🍒', rtp: 96.5, minBet: 0.20, maxBet: 200, jackpotEligible: true },
  { id: 'slot-video', title: 'Gates of Valhalla', category: 'slots', provider: 'Pragmatic Play', emoji: '🎰', rtp: 97.2, minBet: 0.10, maxBet: 100, jackpotEligible: true },
  { id: 'slot-jackpot', title: 'Mega Moolah Gold', category: 'slots', provider: 'Microgaming', emoji: '👑', rtp: 95.8, minBet: 0.50, maxBet: 50, jackpotEligible: true },
  { id: 'slot-megaways', title: 'Sweet Bonanza Extra', category: 'slots', provider: 'Megaways Inc', emoji: '🍭', rtp: 96.8, minBet: 0.20, maxBet: 150 },
  { id: 'slot-3d', title: 'Necromancer Quest', category: 'slots', provider: 'Betsoft 3D', emoji: '💀', rtp: 96.1, minBet: 0.50, maxBet: 100 },

  // LIVE DEALER
  { id: 'live-roulette', title: 'Lightning Roulette Live', category: 'live', provider: 'Evolution Gaming', emoji: '🎡', rtp: 97.3, minBet: 1.00, maxBet: 5000, liveDealerName: 'Sophia' },
  { id: 'live-blackjack', title: 'VIP Blackjack Table', category: 'live', provider: 'Evolution Gaming', emoji: '🃏', rtp: 99.5, minBet: 5.00, maxBet: 10000, liveDealerName: 'Lucas' },
  { id: 'live-baccarat', title: 'Speed Baccarat High Limits', category: 'live', provider: 'Pragmatic Live', emoji: '💎', rtp: 98.9, minBet: 10.00, maxBet: 25000, liveDealerName: 'Olivia' },
  { id: 'live-poker', title: 'Texas Hold\'em Ultimate', category: 'live', provider: 'Playtech Live', emoji: '👑', rtp: 97.9, minBet: 5.00, maxBet: 5000, liveDealerName: 'Marcus' },
  { id: 'live-sicbo', title: 'Super Sic Bo Live', category: 'live', provider: 'Evolution Gaming', emoji: '🎲', rtp: 97.2, minBet: 1.00, maxBet: 2000, liveDealerName: 'Chloe' },
  { id: 'live-dragontiger', title: 'Dragon Tiger Fortune', category: 'live', provider: 'Asia Gaming', emoji: '🐯', rtp: 96.2, minBet: 2.00, maxBet: 3000, liveDealerName: 'Chen' },

  // TABLE GAMES
  { id: 'table-euro-roulette', title: 'European Roulette Pro', category: 'table', provider: 'CasinoHub Original', emoji: '🎡', rtp: 97.3, minBet: 1.00, maxBet: 1000 },
  { id: 'table-classic-blackjack', title: 'Classic Blackjack Multi-hand', category: 'table', provider: 'NetEnt', emoji: '🃏', rtp: 99.6, minBet: 1.00, maxBet: 5000 },
  { id: 'table-vip-baccarat', title: 'Traditional Baccarat standard', category: 'table', provider: 'CasinoHub Original', emoji: '💎', rtp: 98.9, minBet: 1.00, maxBet: 2000 },
  { id: 'table-poker-threecard', title: 'Three Card Poker', category: 'table', provider: 'NetEnt', emoji: '🃏', rtp: 96.6, minBet: 1.00, maxBet: 1000 },

  // INSTANT WIN & CRASH
  { id: 'instant-aviator', title: 'Aviator Crash', category: 'instant', provider: 'Spribe Original', emoji: '🚀', rtp: 97.0, minBet: 0.10, maxBet: 500 },
  { id: 'instant-crush', title: 'Space Crush Arena', category: 'instant', provider: 'CasinoHub Original', emoji: '☄️', rtp: 97.5, minBet: 0.20, maxBet: 500 },
  { id: 'instant-wheel', title: 'Mega Wheel Spin', category: 'instant', provider: 'Pragmatic Play', emoji: '🎡', rtp: 96.5, minBet: 0.50, maxBet: 1000 },
  { id: 'instant-mines', title: 'Mines Gold Mines', category: 'instant', provider: 'CasinoHub Original', emoji: '💣', rtp: 98.0, minBet: 0.20, maxBet: 1000 },
  { id: 'instant-plinko', title: 'Plinko Multi-drops', category: 'instant', provider: 'CasinoHub Original', emoji: '🎯', rtp: 99.0, minBet: 0.10, maxBet: 500 },
  { id: 'instant-coinflip', title: 'Turbo Coin Flip', category: 'instant', provider: 'CasinoHub Original', emoji: '🪙', rtp: 98.5, minBet: 0.50, maxBet: 2000 },
  { id: 'instant-dice', title: 'Master Roll Dice', category: 'instant', provider: 'CasinoHub Original', emoji: '🎲', rtp: 98.2, minBet: 0.10, maxBet: 3000 },
];

export default function CasinoGames({
  wallet,
  setWallet,
  addTransaction,
  triggerNotification,
  incrementJackpots,
  jackpotPool,
  setActiveCategory,
  activeCategory
}: CasinoGamesProps) {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);

  // Slots Game State
  const [slotsReels, setSlotsReels] = useState<string[]>(['🍒', '💎', '🎰']);
  const [slotsStatus, setSlotsStatus] = useState<string>('Set bet and spin!');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Crash (Aviator / Space Crush) State
  const [crashActive, setCrashActive] = useState<boolean>(false);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.0);
  const [crashBetPlaced, setCrashBetPlaced] = useState<boolean>(false);
  const [crashHasCashedOut, setCrashHasCashedOut] = useState<boolean>(false);
  const [crashPayoutAmount, setCrashPayoutAmount] = useState<number>(0);
  const [crashMessage, setCrashMessage] = useState<string>('Determine stakes and launch!');
  const [crashPreflightPercent, setCrashPreflightPercent] = useState<number>(0);
  const [crashHistory, setCrashHistory] = useState<number[]>([1.42, 2.91, 1.15, 5.84, 1.05]);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number>(2.0);
  const [simulatedPlayers, setSimulatedPlayers] = useState<{ name: string; bet: number; cashedOut: boolean; mult?: number }[]>([]);
  const crashIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mines State
  const [minesGrid, setMinesGrid] = useState<{ id: number; hasMine: boolean; revealed: boolean }[]>([]);
  const [minesBetPlaced, setMinesBetPlaced] = useState<boolean>(false);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [minesRevealedCount, setMinesRevealedCount] = useState<number>(0);
  const [minesGameOver, setMinesGameOver] = useState<boolean>(false);
  const [minesOutcome, setMinesOutcome] = useState<'WIN' | 'FAIL' | 'IDLE'>('IDLE');

  // Plinko State
  const [plinkoHistory, setPlinkoHistory] = useState<{ x: number; y: number }[]>([]);
  const [plinkoMultiplierSelected, setPlinkoMultiplierSelected] = useState<number | null>(null);
  const [isPlinkoDropping, setIsPlinkoDropping] = useState<boolean>(false);

  // Roulette (Table) State
  const [rouletteSelectedNumber, setRouletteSelectedNumber] = useState<number | null>(null);
  const [rouletteSelectedColor, setRouletteSelectedColor] = useState<'red' | 'black' | 'green' | null>(null);
  const [rouletteSpinning, setRouletteSpinning] = useState<boolean>(false);
  const [rouletteOutcome, setRouletteOutcome] = useState<{ number: number; color: 'red' | 'black' | 'green' } | null>(null);

  // Blackjack State
  const [blackjackDealerCards, setBlackjackDealerCards] = useState<{ text: string; value: number }[]>([]);
  const [blackjackPlayerCards, setBlackjackPlayerCards] = useState<{ text: string; value: number }[]>([]);
  const [blackjackInGame, setBlackjackInGame] = useState<boolean>(false);
  const [blackjackStatus, setBlackjackStatus] = useState<string>('Place bet and deal!');

  // Live Dealer counts
  const [liveDealerTime, setLiveDealerTime] = useState<number>(10);
  const [liveDealerChatMessage, setLiveDealerChatMessage] = useState<string>('Sophia: Place your bets, chips on board!');
  const [liveDealerPrevWins, setLiveDealerPrevWins] = useState<string[]>(['RED 14', 'BLACK 22', 'RED 3', 'BLACK 11']);
  const [liveUserBetOn, setLiveUserBetOn] = useState<string>('');

  // Mega Spin Wheel State
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelSelectedItem, setWheelSelectedItem] = useState<{ sector: string; mult: number; color: string } | null>(null);
  const [wheelBetOn, setWheelBetOn] = useState<string>('x2'); // Selected bet sector

  // Turbo Coin Flip State
  const [isCoinFlipping, setIsCoinFlipping] = useState<boolean>(false);
  const [coinBetOn, setCoinBetOn] = useState<'heads' | 'tails'>('heads');
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);

  // Master Roll Dice State
  const [diceIsRolling, setDiceIsRolling] = useState<boolean>(false);
  const [diceRollValue, setDiceRollValue] = useState<number>(50.0);
  const [diceTargetValue, setDiceTargetValue] = useState<number>(50.0);
  const [diceBetType, setDiceBetType] = useState<'over' | 'under'>('over');
  const [diceOutcomeValue, setDiceOutcomeValue] = useState<number | null>(null);

  useEffect(() => {
    // Keep live dealer interactive simulated countdown timer running
    const timer = setInterval(() => {
      setLiveDealerTime((prev) => {
        if (prev <= 1) {
          const outcomeNum = Math.floor(Math.random() * 37);
          const colors: ('red' | 'black' | 'green')[] = ['green', 'red', 'black'];
          const pickedColor = outcomeNum === 0 ? 'green' : colors[outcomeNum % 2 + 1];
          const combined = `${pickedColor.toUpperCase()} ${outcomeNum}`;
          
          setLiveDealerPrevWins(prevList => [combined, ...prevList.slice(0, 3)]);
          setLiveDealerChatMessage(`Sophia: Dealer Result: ${combined}! Next spin starts shortly.`);
          
          if (liveUserBetOn !== '') {
            const won = (liveUserBetOn === pickedColor);
            if (won) {
              const multi = liveUserBetOn === 'green' ? 35 : 2;
              const payout = betAmount * multi;
              setWallet(w => ({ ...w, mainBalance: w.mainBalance + payout }));
              triggerNotification('Live Casino Win!', `You won $${payout.toFixed(2)} on Sophia's Live Roulette!`, 'general');
              addTransaction({
                type: 'win',
                amount: payout,
                currency: 'USD',
                method: 'Live Studio Payout',
                game: 'Lightning Roulette Live'
              });
            }
            setLiveUserBetOn('');
          }
          return 15;
        }
        if (prev === 12) {
          setLiveDealerChatMessage('Sophia: No more bets please. Spin in motion!');
        }
        if (prev === 5) {
          setLiveDealerChatMessage('Sophia: Slowing down... watch the golden ball.');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [liveUserBetOn, betAmount]);

  useEffect(() => {
    return () => {
      if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    };
  }, []);

  // Initialize Mines Grid
  const initializeMines = () => {
    const freshGrid = [];
    const mineIndices = new Set<number>();
    while (mineIndices.size < minesCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }
    for (let i = 0; i < 25; i++) {
      freshGrid.push({
        id: i,
        hasMine: mineIndices.has(i),
        revealed: false
      });
    }
    setMinesGrid(freshGrid);
    setMinesRevealedCount(0);
    setMinesGameOver(false);
    setMinesOutcome('IDLE');
  };

  const handleGameSelect = (game: GameItem) => {
    setSelectedGame(game);
    // Prep individual game state as required
    if (game.id === 'instant-mines') {
      initializeMines();
      setMinesBetPlaced(false);
    }
  };

  const deductFunds = (amount: number, gameTitle: string): boolean => {
    if (wallet.mainBalance < amount) {
      triggerNotification('Insufficient Funds', 'Your main balance is too low. Place a secure deposit now!', 'general');
      return false;
    }
    setWallet((prev) => ({
      ...prev,
      mainBalance: parseFloat((prev.mainBalance - amount).toFixed(2))
    }));
    incrementJackpots(amount * 0.05); // 5% added toprogressive jackpots
    addTransaction({
      type: 'bet',
      amount: amount,
      currency: 'USD',
      method: 'Placed Stake',
      game: gameTitle
    });
    return true;
  };

  // --- SLOT SPIN MACHINE LOGIC ---
  const triggerSlotSpin = () => {
    if (isSpinning) return;
    if (!deductFunds(betAmount, selectedGame?.title || 'Slots Mania')) return;

    setIsSpinning(true);
    setSlotsStatus('Spinning the golden reels...');
    
    let rollCount = 0;
    const icons = ['🍒', '💎', '🎰', '🍭', '🍋', '🔔', '👑', '⭐'];
    
    const spinInterval = setInterval(() => {
      setSlotsReels([
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)],
        icons[Math.floor(Math.random() * icons.length)]
      ]);
      rollCount++;
      if (rollCount > 12) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        
        const finalReels = [
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)],
          icons[Math.floor(Math.random() * icons.length)]
        ];
        setSlotsReels(finalReels);

        const unique = new Set(finalReels);
        if (unique.size === 1) {
          const winMultiplier = finalReels[0] === '🎰' ? 50 : finalReels[0] === '👑' ? 30 : finalReels[0] === '💎' ? 20 : 10;
          const totalWin = betAmount * winMultiplier;
          setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + totalWin).toFixed(2)) }));
          setSlotsStatus(`JACKPOT COMBO! 3x ${finalReels[0]} pays $${totalWin.toFixed(2)}`);
          triggerNotification('Big Slot Win!', `Stunning jackpot combo! You won $${totalWin.toFixed(2)} on ${selectedGame?.title}!`, 'jackpot');
          addTransaction({
            type: 'win',
            amount: totalWin,
            currency: 'USD',
            method: 'Slot Jackpot Win',
            game: selectedGame?.title
          });

          // Progressive Jackpot opportunity!
          if (Math.random() > 0.85 && selectedGame?.jackpotEligible) {
            const jpType = Math.random() > 0.8 ? 'Mega' : 'Major';
            const jpWin = jpType === 'Mega' ? jackpotPool.mega : jackpotPool.major;
            setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + jpWin).toFixed(2)) }));
            triggerNotification('PROGRESSIVE JACKPOT WON!', `OMG! You hit the ${jpType} Jackpot for $${jpWin.toFixed(2)} on ${selectedGame?.title}!`, 'jackpot');
            addTransaction({
              type: 'win',
              amount: jpWin,
              currency: 'USD',
              method: `Progressive ${jpType} Jackpot`,
              game: selectedGame?.title
            });
          }
        } else if (unique.size === 2) {
          const totalWin = betAmount * 1.5;
          setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + totalWin).toFixed(2)) }));
          setSlotsStatus(`Double Combo! 2x identical symbols pays $${totalWin.toFixed(2)}`);
          addTransaction({
            type: 'win',
            amount: totalWin,
            currency: 'USD',
            method: 'Slot Match Win',
            game: selectedGame?.title
          });
        } else {
          setSlotsStatus('Bummer! No winning combinations. Tune your stakes and try again.');
        }
      }
    }, 100);
  };

  // --- AVIATOR & SPACE CRUSH ENGINE ---
  const launchCrashGame = () => {
    if (crashActive) return;
    const isAviator = selectedGame?.id === 'instant-aviator';
    const gameLabel = isAviator ? 'Aviator Crash' : 'Space Crush Arena';
    
    if (!deductFunds(betAmount, gameLabel)) return;

    setCrashActive(true);
    setCrashBetPlaced(true);
    setCrashHasCashedOut(false);
    setCrashMultiplier(1.0);
    setCrashMessage('Starting engine booster parameters...');
    setCrashPreflightPercent(0);

    // Initial simulated wagers list
    const names = ['Aero_King', 'StakesGold', 'AlphaBet', 'VIP_Silver09', 'LobbyG', 'M-PesaHero', 'HighLander', 'CoinSlinger'];
    const pld = names.map(n => ({
      name: n,
      bet: Math.floor(Math.random() * 85) + 10,
      cashedOut: false
    }));
    setSimulatedPlayers(pld);

    let progress = 0;
    const takeoffInterval = setInterval(() => {
      progress += 20;
      setCrashPreflightPercent(progress);
      if (progress >= 100) {
        clearInterval(takeoffInterval);
        setCrashMessage(isAviator ? 'The Red Jet is cruising! Cash out now!' : 'Asteroid mining rocket ascending! Keep watch!');
        
        // Randomized crash limit
        const randSeed = Math.random();
        const crashLimit = randSeed < 0.15 ? 1.05 : randSeed < 0.6 ? 2.5 : randSeed < 0.9 ? 7.0 : 15.0 + Math.random() * 20;
        let currMult = 1.0;

        crashIntervalRef.current = setInterval(() => {
          currMult += (currMult * 0.04) + 0.01;
          const roundedMult = parseFloat(currMult.toFixed(2));

          // Check simulated auto-cashouts for other players
          setSimulatedPlayers(prev => prev.map(p => {
            if (!p.cashedOut && Math.random() > 0.88 - (currMult * 0.02)) {
              return { ...p, cashedOut: true, mult: roundedMult };
            }
            return p;
          }));

          // Trigger player's Auto Cashout
          if (autoCashoutEnabled && !crashHasCashedOut && roundedMult >= autoCashoutValue) {
            handleCrashAutoCashout(roundedMult, gameLabel);
          }

          if (currMult >= crashLimit) {
            // CRASH EVENT
            clearInterval(crashIntervalRef.current!);
            setCrashActive(false);
            setCrashBetPlaced(false);
            setCrashMessage(isAviator ? `EXPLODED! Plane crashed at x${roundedMult}` : `CRUSHED! Mine rocket hit space debris at x${roundedMult}`);
            setCrashHistory(prev => [roundedMult, ...prev.slice(0, 4)]);
            
            if (!crashHasCashedOut) {
              triggerNotification('Busted Stake!', `${gameLabel} crashed at x${roundedMult}. Better timing next round!`, 'general');
            }
          } else {
            setCrashMultiplier(roundedMult);
          }
        }, 120);
      }
    }, 100);
  };

  const handleCrashAutoCashout = (targetMult: number, gameTitle: string) => {
    setCrashHasCashedOut(true);
    const payout = parseFloat((betAmount * targetMult).toFixed(2));
    setCrashPayoutAmount(payout);
    setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
    setCrashMessage(`AUTO CASHOUT SUCCESS! Paid out at x${targetMult}! Got $${payout.toFixed(2)}`);
    triggerNotification('Auto Cashout Cleared!', `Secured profit of $${payout.toFixed(2)} on x${targetMult}!`, 'general');
    
    addTransaction({
      type: 'win',
      amount: payout,
      currency: 'USD',
      method: 'Auto Cashout Target',
      game: gameTitle
    });
  };

  const manualCrashCashOut = () => {
    if (!crashBetPlaced || crashHasCashedOut) return;
    const gameLabel = selectedGame?.id === 'instant-aviator' ? 'Aviator Crash' : 'Space Crush Arena';

    setCrashHasCashedOut(true);
    const payout = parseFloat((betAmount * crashMultiplier).toFixed(2));
    setCrashPayoutAmount(payout);
    setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
    setCrashMessage(`SUCCESS! Secured cashout at x${crashMultiplier}! Profit: $${payout.toFixed(2)}`);
    triggerNotification('Cashout Claimed!', `Recalled winnings of $${payout.toFixed(2)} on ${gameLabel}!`, 'general');
    
    addTransaction({
      type: 'win',
      amount: payout,
      currency: 'USD',
      method: 'Manual Recall Cashout',
      game: gameLabel
    });
  };

  // --- MINES MACHINE LOGIC ---
  const startMinesGame = () => {
    if (minesBetPlaced) return;
    if (!deductFunds(betAmount, 'Mines Gold')) return;

    initializeMines();
    setMinesBetPlaced(true);
  };

  const checkMineTile = (tileId: number) => {
    if (!minesBetPlaced || minesGameOver) return;
    
    const updated = [...minesGrid];
    const index = updated.findIndex(t => t.id === tileId);
    if (index === -1 || updated[index].revealed) return;

    updated[index].revealed = true;
    
    if (updated[index].hasMine) {
      setMinesGameOver(true);
      setMinesOutcome('FAIL');
      setMinesBetPlaced(false);
      triggerNotification('Mine Exploded!', 'Kaboom! You stepped on a red explosive element.', 'general');
    } else {
      const revCount = minesRevealedCount + 1;
      setMinesRevealedCount(revCount);
      setMinesGrid(updated);
      
      const nonMines = 25 - minesCount;
      if (revCount === nonMines) {
        const multiplier = parseFloat((1 + (minesCount * 0.45)).toFixed(2));
        const payout = parseFloat((betAmount * multiplier).toFixed(2));
        setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
        setMinesGameOver(true);
        setMinesOutcome('WIN');
        setMinesBetPlaced(false);
        triggerNotification('Mines Sweep Completed!', `Outstanding! You swept all tiles for $${payout.toFixed(2)}!`, 'general');
        addTransaction({
          type: 'win',
          amount: payout,
          currency: 'USD',
          game: 'Mines Gold Mines'
        });
      }
    }
  };

  const cashOutMines = () => {
    if (!minesBetPlaced || minesGameOver || minesRevealedCount === 0) return;

    const multiplier = parseFloat((1 + (minesRevealedCount * (minesCount * 0.16))).toFixed(2));
    const payout = parseFloat((betAmount * multiplier).toFixed(2));
    setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
    setMinesGameOver(true);
    setMinesOutcome('WIN');
    setMinesBetPlaced(false);
    triggerNotification('Mines Secured!', `Withdrew $${payout} with nice multiplier x${multiplier}!`, 'general');
    
    addTransaction({
      type: 'win',
      amount: payout,
      currency: 'USD',
      method: 'Mine Winnings Claimed',
      game: 'Mines Gold Mines'
    });
  };

  // --- PLINKO GAME LOGIC ---
  const triggerPlinkoDrop = () => {
    if (isPlinkoDropping) return;
    if (!deductFunds(betAmount, 'Plinko Multi-drops')) return;

    setIsPlinkoDropping(true);
    setPlinkoMultiplierSelected(null);
    const pathPoints = [];
    let initialX = 50; 

    for (let row = 0; row < 8; row++) {
      const step = Math.random() > 0.5 ? 5.5 : -5.5;
      initialX = Math.max(10, Math.min(90, initialX + step));
      pathPoints.push({ x: initialX, y: (row + 1) * 11 });
    }
    
    setPlinkoHistory(pathPoints);

    setTimeout(() => {
      const finalX = initialX;
      let mult = 0.5;
      if (finalX < 25 || finalX > 75) {
        mult = 5.0; 
      } else if (finalX < 40 || finalX > 60) {
        mult = 1.8; 
      } else {
        mult = 0.3; 
      }
      
      const payout = parseFloat((betAmount * mult).toFixed(2));
      setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
      setPlinkoMultiplierSelected(mult);
      setIsPlinkoDropping(false);
      
      if (mult > 1.0) {
        triggerNotification('Plinko Multipled Win!', `Rewarded x${mult} payouts total $${payout.toFixed(2)}`, 'general');
      }
      
      addTransaction({
        type: 'win',
        amount: payout,
        currency: 'USD',
        game: 'Plinko Multi-drops'
      });
    }, 1500);
  };

  // --- TABLE ROULETTE LOGIC ---
  const triggerRouletteSpin = () => {
    if (rouletteSpinning) return;
    if (rouletteSelectedNumber === null && rouletteSelectedColor === null) {
      triggerNotification('Place bet target', 'You must select a number or color to stake first!', 'general');
      return;
    }
    if (!deductFunds(betAmount, 'European Roulette Pro')) return;

    setRouletteSpinning(true);
    setRouletteOutcome(null);

    setTimeout(() => {
      const outcomeNum = Math.floor(Math.random() * 37);
      const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(outcomeNum);
      const color: 'red' | 'black' | 'green' = outcomeNum === 0 ? 'green' : (isRed ? 'red' : 'black');

      setRouletteOutcome({ number: outcomeNum, color });
      setRouletteSpinning(false);

      let totalWin = 0;
      if (rouletteSelectedNumber !== null && rouletteSelectedNumber === outcomeNum) {
        totalWin += betAmount * 35;
      }
      if (rouletteSelectedColor !== null && rouletteSelectedColor === color) {
        totalWin += betAmount * 2;
      }

      if (totalWin > 0) {
        setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + totalWin).toFixed(2)) }));
        triggerNotification('Roulette WIN!', `Winner! Drawn number is ${outcomeNum} (${color.toUpperCase()}). You earned $${totalWin}!`, 'general');
        addTransaction({
          type: 'win',
          amount: totalWin,
          currency: 'USD',
          game: 'European Roulette Pro'
        });
      } else {
        triggerNotification('No Match!', `Drawn was ${outcomeNum} (${color.toUpperCase()}). Try another round.`, 'general');
      }
    }, 2000);
  };

  // --- BLACKJACK LOGIC ---
  const initiateBlackjack = () => {
    if (blackjackInGame) return;
    if (!deductFunds(betAmount, 'Classic Blackjack')) return;

    setBlackjackInGame(true);
    setBlackjackStatus('Dealer dealt your starting hand!');

    const suits = ['♠', '♥', '♦', '♣'];
    const cardsPool = [
      { text: 'A', value: 11 }, { text: 'K', value: 10 }, { text: 'Q', value: 10 }, { text: 'J', value: 10 },
      { text: '10', value: 10 }, { text: '9', value: 9 }, { text: '8', value: 8 }, { text: '7', value: 7 },
      { text: '6', value: 6 }, { text: '5', value: 5 }, { text: '4', value: 4 }, { text: '3', value: 3 }, { text: '2', value: 2 }
    ];

    const getCard = () => {
      const item = cardsPool[Math.floor(Math.random() * cardsPool.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { text: `${item.text}${suit}`, value: item.value };
    };

    setBlackjackPlayerCards([getCard(), getCard()]);
    setBlackjackDealerCards([getCard(), { text: '🎴 Hidden', value: 0 }]);
  };

  const getCardsSum = (cards: { text: string; value: number }[]) => {
    let sum = cards.reduce((acc, curr) => acc + curr.value, 0);
    let aces = cards.filter(c => c.text.startsWith('A')).length;
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces -= 1;
    }
    return sum;
  };

  const blackjackHit = () => {
    if (!blackjackInGame) return;
    const suits = ['♠', '♥', '♦', '♣'];
    const cardsPool = [
      { text: 'A', value: 11 }, { text: 'K', value: 10 }, { text: 'Q', value: 10 }, { text: 'J', value: 10 },
      { text: '10', value: 10 }, { text: '9', value: 9 }, { text: '8', value: 8 }, { text: '7', value: 7 },
      { text: '6', value: 6 }, { text: '5', value: 5 }, { text: '4', value: 4 }, { text: '3', value: 3 }, { text: '2', value: 2 }
    ];
    const getCard = () => {
      const item = cardsPool[Math.floor(Math.random() * cardsPool.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { text: `${item.text}${suit}`, value: item.value };
    };

    const updated = [...blackjackPlayerCards, getCard()];
    setBlackjackPlayerCards(updated);

    if (getCardsSum(updated) > 21) {
      setBlackjackInGame(false);
      setBlackjackStatus('BUSTED! Exceeded blackjack score of 21.');
      triggerNotification('You went Bust!', 'Round finished. Dealer reclaimed active wager.', 'general');
    }
  };

  const blackjackStand = () => {
    if (!blackjackInGame) return;
    const suits = ['♠', '♥', '♦', '♣'];
    const cardsPool = [
      { text: 'A', value: 11 }, { text: 'K', value: 10 }, { text: 'Q', value: 10 }, { text: 'J', value: 10 },
      { text: '10', value: 10 }, { text: '9', value: 9 }, { text: '8', value: 8 }, { text: '7', value: 7 },
      { text: '6', value: 6 }, { text: '5', value: 5 }, { text: '4', value: 4 }, { text: '3', value: 3 }, { text: '2', value: 2 }
    ];
    const getCard = () => {
      const item = cardsPool[Math.floor(Math.random() * cardsPool.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { text: `${item.text}${suit}`, value: item.value };
    };

    let dealer = [blackjackDealerCards[0], getCard()];
    while (getCardsSum(dealer) < 17) {
      dealer.push(getCard());
    }

    setBlackjackDealerCards(dealer);
    setBlackjackInGame(false);

    const playerSum = getCardsSum(blackjackPlayerCards);
    const dealerSum = getCardsSum(dealer);

    if (dealerSum > 21) {
      const payout = betAmount * 2;
      setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
      setBlackjackStatus(`WINNER! Dealer busted with ${dealerSum}! Credited $${payout.toFixed(2)}`);
      triggerNotification('Dealer busted!', `Blackjack profit transferred of $${payout.toFixed(2)}`, 'general');
      addTransaction({
        type: 'win',
        amount: payout,
        currency: 'USD',
        game: 'Classic Blackjack Multi-hand'
      });
    } else if (playerSum > dealerSum) {
      const payout = betAmount * 2;
      setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
      setBlackjackStatus(`WINNER! You scored ${playerSum} vs Dealer's ${dealerSum}! Credited $${payout.toFixed(2)}`);
      triggerNotification('Blackjack clear!', `Beated croupier! Won $${payout.toFixed(2)}!`, 'general');
      addTransaction({
        type: 'win',
        amount: payout,
        currency: 'USD',
        game: 'Classic Blackjack Multi-hand'
      });
    } else if (playerSum === dealerSum) {
      setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + betAmount).toFixed(2)) }));
      setBlackjackStatus(`PUSH! Tied scores at ${playerSum}. Stake returned.`);
    } else {
      setBlackjackStatus(`Dealer Wins with ${dealerSum} vs ${playerSum}. Try another round.`);
    }
  };

  // --- MEGA SPINNING WHEEL ENGINE ---
  const sectorsList = [
    { sector: 'x1', mult: 1, color: '#a855f7' },
    { sector: 'x2', mult: 2, color: '#3b82f6' },
    { sector: 'x5', mult: 5, color: '#10b981' },
    { sector: 'x10', mult: 10, color: '#f59e0b' },
    { sector: 'x20', mult: 20, color: '#ec4899' },
    { sector: 'x40', mult: 40, color: '#ef4444' },
    { sector: 'FREE SPINS', mult: 0, color: '#ffd700' },
    { sector: 'BOMB', mult: 0, color: '#1e293b' },
  ];

  const triggerMegaWheel = () => {
    if (wheelSpinning) return;
    if (!deductFunds(betAmount, 'Mega Wheel Spin')) return;

    setWheelSpinning(true);
    setWheelSelectedItem(null);

    // Randomize winning sector
    const rollIndex = Math.floor(Math.random() * sectorsList.length);
    const selected = sectorsList[rollIndex];
    
    // Add multiple rotations (360 * 5) and align degree offset
    const targetRotation = 1800 + (rollIndex * (360 / sectorsList.length));
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelSelectedItem(selected);

      if (selected.sector === 'BOMB') {
        triggerNotification('Exploded Sector!', 'BOMB landed. Wager is claimed by house.', 'general');
      } else if (selected.sector === 'FREE SPINS') {
        triggerNotification('Free Roll Bonus!', '5 bonus free play coins credited!', 'bonus');
        setWallet(w => ({ ...w, bonusBalance: w.bonusBalance + 50 }));
      } else {
        const isMatched = (wheelBetOn === selected.sector);
        if (isMatched) {
          const payout = parseFloat((betAmount * selected.mult).toFixed(2));
          setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
          triggerNotification('Spin Wheel Match!', `Matched ${selected.sector}! Payout $${payout.toFixed(2)} received!`, 'general');
          addTransaction({
            type: 'win',
            amount: payout,
            currency: 'USD',
            method: 'Wheel Win Payout',
            game: 'Mega Wheel Spin'
          });
        } else {
          triggerNotification('No Sector Match!', `Wheel stopped on ${selected.sector}. You placed stake on ${wheelBetOn}.`, 'general');
        }
      }
    }, 2800);
  };

  // --- TURBO COIN FLIP ---
  const triggerCoinFlip = () => {
    if (isCoinFlipping) return;
    if (!deductFunds(betAmount, 'Turbo Coin Flip')) return;

    setIsCoinFlipping(true);
    setCoinResult(null);

    setTimeout(() => {
      const randResult: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
      setCoinResult(randResult);
      setIsCoinFlipping(false);

      if (coinBetOn === randResult) {
        const payout = parseFloat((betAmount * 1.96).toFixed(2));
        setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
        triggerNotification('Coin Flip Win!', `Matched ${randResult.toUpperCase()}! You won $${payout}!`, 'general');
        addTransaction({
          type: 'win',
          amount: payout,
          currency: 'USD',
          game: 'Turbo Coin Flip'
        });
      } else {
        triggerNotification('Flip Lost!', `Landed ${randResult.toUpperCase()}. Try heads next!`, 'general');
      }
    }, 1500);
  };

  // --- MASTER ROLL DICE ENGINE ---
  const triggerDiceRoll = () => {
    if (diceIsRolling) return;
    if (!deductFunds(betAmount, 'Master Roll Dice')) return;

    setDiceIsRolling(true);
    setDiceOutcomeValue(null);

    setTimeout(() => {
      const outcome = parseFloat((Math.random() * 99.99).toFixed(2));
      setDiceOutcomeValue(outcome);
      setDiceIsRolling(false);

      let won = false;
      if (diceBetType === 'over' && outcome > diceTargetValue) won = true;
      if (diceBetType === 'under' && outcome < diceTargetValue) won = true;

      if (won) {
        // Payout formula based on risk/target
        const winChance = diceBetType === 'over' ? 100 - diceTargetValue : diceTargetValue;
        const multiplier = parseFloat((98 / winChance).toFixed(2));
        const payout = parseFloat((betAmount * multiplier).toFixed(2));

        setWallet(w => ({ ...w, mainBalance: parseFloat((w.mainBalance + payout).toFixed(2)) }));
        triggerNotification('Dice Master Win!', `Rolled ${outcome}! You matched Over/Under target and won $${payout}!`, 'general');
        addTransaction({
          type: 'win',
          amount: payout,
          currency: 'USD',
          game: 'Master Roll Dice'
        });
      } else {
        triggerNotification('Roll Missed!', `Outcome ${outcome} did not meet criteria. Adjust and roll again!`, 'general');
      }
    }, 1200);
  };

  const currentWinChance = diceBetType === 'over' ? 100 - diceTargetValue : diceTargetValue;
  const currentMultiplier = parseFloat((98 / currentWinChance).toFixed(2));

  const filteredGames = activeCategory === 'all' 
    ? LISTED_GAMES 
    : LISTED_GAMES.filter(g => g.category === activeCategory);

  return (
    <div id="casino-lobby" className="flex flex-col gap-6 select-none font-sans">
      
      {/* ACTIVE GAME PLAYING MODULE WINDOW */}
      {selectedGame ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#130722] to-[#080210] border-2 border-purple-500/30 p-5 shadow-[0_0_35px_rgba(147,51,234,0.15)] relative">
          
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-xs text-purple-400 font-mono">RTP: {selectedGame.rtp}%</span>
            <button 
              onClick={() => {
                setSelectedGame(null);
                setCrashActive(false);
                if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
              }}
              className="text-gray-400 hover:text-white px-3 py-1 bg-white/5 rounded text-xs font-black border border-white/10"
            >
              ← Back to Lobby
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl bg-[#261543] p-2 rounded-xl border border-purple-500/15">{selectedGame.emoji}</span>
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">{selectedGame.provider}</div>
              <h3 className="text-lg font-bold text-white uppercase">{selectedGame.title}</h3>
            </div>
          </div>

          <hr className="border-purple-900/30 mb-4" />

          {/* Config stake control panel */}
          <div className="bg-black/40 p-3.5 rounded-xl border border-purple-900/30 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-purple-300 uppercase font-black">STAKE AMOUNT:</span>
              <div className="flex items-center gap-1.5">
                {[5, 10, 50, 100, 500].map((val) => (
                  <button 
                    key={val}
                    onClick={() => setBetAmount(val)}
                    className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all ${betAmount === val ? 'bg-amber-400 text-black shadow-md' : 'bg-[#18112b] text-purple-300 border border-purple-500/25 hover:bg-purple-900/20'}`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-gray-400">Manual Bet:</span>
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Math.max(selectedGame.minBet, Number(e.target.value)))}
                className="w-20 bg-[#0a0510] text-amber-400 text-center text-sm font-bold border border-purple-800/60 rounded py-1"
              />
            </div>
          </div>

          {/* GAME GRAPHICAL PRESENTATION PORT */}
          <div className="min-h-[290px] bg-[#07030c] rounded-xl border border-purple-900/40 p-6 flex flex-col justify-center items-center relative overflow-hidden">
            
            {/* Live Indicator overlay popup */}
            {selectedGame.category === 'live' && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-red-600/95 text-white font-mono px-2 py-0.5 rounded text-[10px] font-black animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>SECURE HIGH LIMIT CASINO TRANSMISSION</span>
              </div>
            )}

            {/* 1. SLOTS CHASSIS CONTROL */}
            {selectedGame.category === 'slots' && (
              <div className="text-center w-full max-w-sm">
                <div className="flex justify-center gap-4 mb-5">
                  {slotsReels.map((symbol, idx) => (
                    <div 
                      key={idx} 
                      className={`w-16 h-20 bg-[#170929] rounded-xl border-2 ${isSpinning ? 'border-amber-400 animate-bounce' : 'border-purple-500'} flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.06)]`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-purple-300 font-mono mb-4">{slotsStatus}</div>
                <button 
                  onClick={triggerSlotSpin}
                  disabled={isSpinning}
                  className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSpinning ? 'TURNING REELS...' : 'PULL SPIN LEVER'}
                </button>
              </div>
            )}

            {/* 2. AVIATOR & SPACE CRUSH COMPONENT */}
            {(selectedGame.id === 'instant-aviator' || selectedGame.id === 'instant-crush') && (
              <div className="w-full flex flex-col gap-4">
                
                {/* Recent Multipliers history tracker */}
                <div className="flex gap-1.5 mb-1.5 items-center flex-wrap shrink-0">
                  <span className="text-[9px] text-gray-500">History:</span>
                  {crashHistory.map((h, i) => (
                    <span key={i} className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded ${h > 2.0 ? 'bg-purple-950/40 text-purple-300 border border-purple-500/10' : 'bg-red-950/40 text-red-400'}`}>
                      x{h}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                  
                  {/* Left Graphical rising vector chart */}
                  <div className="md:col-span-8 bg-black/60 rounded-xl relative border border-purple-900/30 h-44 overflow-hidden flex items-center justify-center">
                    {/* Animated background stars/grids */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]"></div>

                    {crashActive ? (
                      <div className="text-center z-10">
                        <div className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-yellow-600 tracking-tighter animate-pulse">
                          {crashMultiplier.toFixed(2)}x
                        </div>
                        <span className="text-[9px] font-mono text-purple-400 tracking-widest block mt-1 uppercase">multiplier payout</span>
                      </div>
                    ) : (
                      <div className="text-center z-10 px-4">
                        <div className="text-xs text-gray-400 uppercase font-mono tracking-widest mb-1.5">{crashMessage}</div>
                        {crashPreflightPercent > 0 && (
                          <div className="w-48 bg-purple-950 h-1.5 rounded-full mx-auto overflow-hidden border border-purple-900/40">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-100" style={{ width: `${crashPreflightPercent}%` }}></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Animated ascending plane emoji */}
                    {crashActive && (
                      <div 
                        className="absolute bottom-5 left-5 text-3xl transition-transform duration-100"
                        style={{ 
                          transform: `translate(${Math.min(270, crashMultiplier * 20)}px, -${Math.min(100, crashMultiplier * 10)}px) scale(1.1)` 
                        }}
                      >
                        {selectedGame.id === 'instant-aviator' ? '🚀' : '☄️'}
                      </div>
                    )}
                  </div>

                  {/* Right Real-time cockpit wagers pane */}
                  <div className="md:col-span-4 bg-[#11071e] p-3 rounded-lg border border-purple-900/30 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] text-[#fbbf24] font-black uppercase tracking-wider mb-2">Lobby Stake Board</div>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {simulatedPlayers.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[9px] font-mono py-1 border-b border-purple-900/10">
                            <span className="text-purple-300 font-bold">{p.name}</span>
                            <span className="text-gray-500">${p.bet}</span>
                            {p.cashedOut ? (
                              <span className="text-[#22c55e] font-bold font-sans">x{p.mult}</span>
                            ) : crashActive ? (
                              <span className="text-amber-400 animate-pulse">BET</span>
                            ) : (
                              <span className="text-red-500">BUST</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-900/20 text-[9px] text-purple-400 font-mono">
                      <span>Server: <strong>STABLE-SG3</strong></span>
                    </div>
                  </div>

                </div>

                {/* Automation Setup drawer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/30 p-3 rounded-xl border border-purple-900/20">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="enable-auto"
                      checked={autoCashoutEnabled}
                      onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                      className="rounded border-purple-900 text-purple-600 font-mono accent-amber-500 bg-black"
                    />
                    <label htmlFor="enable-auto" className="text-xs text-purple-300 font-bold uppercase select-none">Auto Cashout</label>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-purple-400">Target Mult:</span>
                    <input 
                      type="number"
                      step="0.1"
                      min="1.1"
                      value={autoCashoutValue}
                      disabled={!autoCashoutEnabled}
                      onChange={(e) => setAutoCashoutValue(Math.max(1.1, parseFloat(e.target.value)))}
                      className="w-14 bg-[#0a0510] text-amber-400 text-center font-bold text-xs ring-1 ring-purple-900 rounded py-0.5 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Operating core triggers */}
                <div className="flex gap-4">
                  <button 
                    onClick={launchCrashGame}
                    disabled={crashActive}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-extrabold text-xs uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-purple-900/20"
                  >
                    Place wager & take off
                  </button>
                  <button 
                    onClick={manualCrashCashOut}
                    disabled={!crashActive || crashHasCashedOut}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg text-black font-extrabold text-xs uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-amber-500/20"
                  >
                    CASH OUT (${(betAmount * crashMultiplier).toFixed(2)})
                  </button>
                </div>

              </div>
            )}

            {/* 3. MINES BOX */}
            {selectedGame.id === 'instant-mines' && (
              <div className="w-full flex flex-col items-center">
                <div className="flex justify-between w-full max-w-xs items-center mb-4">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-gray-400">Mines target count:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={minesCount} 
                      disabled={minesBetPlaced}
                      onChange={(e) => setMinesCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                      className="w-12 bg-black font-mono text-center text-xs text-white border border-purple-900 rounded py-0.5 outline-none"
                    />
                  </div>
                  <span className="text-xs text-[#fbbf24] font-mono">Multiplier: x{(1 + (minesRevealedCount * (minesCount * 0.16))).toFixed(2)}</span>
                </div>

                {!minesBetPlaced && !minesGameOver ? (
                  <button 
                    onClick={startMinesGame}
                    className="px-8 py-3 bg-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-lg shadow-lg"
                  >
                    DEPLOY STAKE BET (${betAmount})
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="grid grid-cols-5 gap-1.5 mb-4 max-w-[200px]">
                      {minesGrid.map((tile) => (
                        <button 
                          key={tile.id}
                          onClick={() => checkMineTile(tile.id)}
                          disabled={minesGameOver}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${tile.revealed ? (tile.hasMine ? 'bg-red-600' : 'bg-emerald-600') : 'bg-[#1b1030] hover:bg-purple-900 border border-purple-500/10'}`}
                        >
                          {tile.revealed ? (tile.hasMine ? '💣' : '💎') : ''}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={cashOutMines}
                        disabled={minesRevealedCount === 0 || minesGameOver}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded uppercase tracking-wider disabled:opacity-40"
                      >
                        Secured payout (${(betAmount * (1 + (minesRevealedCount * (minesCount * 0.165)))).toFixed(2)})
                      </button>
                      {minesGameOver && (
                        <button 
                          onClick={() => {
                            setMinesGameOver(false);
                            setMinesBetPlaced(false);
                            initializeMines();
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded uppercase tracking-wider"
                        >
                          ROUND AGAIN
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PLINKO BOX */}
            {selectedGame.id === 'instant-plinko' && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-xs h-40 bg-black/50 rounded-lg relative overflow-hidden flex flex-col justify-end p-2 mb-4 border border-purple-900/30">
                  <div className="absolute inset-0 flex flex-col justify-between py-4 items-center opacity-40">
                    <div className="flex gap-8 text-[8px] text-purple-500 font-black">● ● ● ● ●</div>
                    <div className="flex gap-7 text-[8px] text-purple-500 font-black">● ● ● ● ● ●</div>
                    <div className="flex gap-8 text-[8px] text-purple-500 font-bold">● ● ● ● ● ● ●</div>
                    <div className="flex gap-6 text-[8px] text-purple-500">● ● ● ● ● ● ● ●</div>
                  </div>

                  {isPlinkoDropping && plinkoHistory.map((pt, idx) => (
                    <div 
                      key={idx}
                      className="absolute bg-amber-400 w-2 h-2 rounded-full shadow-[0_0_8px_#fbbf24] transition-all duration-300"
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    />
                  ))}

                  <div className="flex justify-between gap-1 w-full mt-auto">
                    {['X5.0', 'X1.8', 'X0.3', 'X0.3', 'X1.8', 'X5.0'].map((b, i) => (
                      <div 
                        key={i}
                        className={`flex-1 text-center font-mono py-1 rounded text-[9px] font-bold ${plinkoMultiplierSelected !== null && i === (plinkoMultiplierSelected > 2 ? 0 : plinkoMultiplierSelected < 0.5 ? 2 : 1) ? 'bg-amber-400 text-black scale-105' : 'bg-purple-900/40 text-purple-300'}`}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={triggerPlinkoDrop}
                  disabled={isPlinkoDropping}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded text-xs uppercase disabled:opacity-50"
                >
                  {isPlinkoDropping ? 'GRAVITY DROP...' : 'RELEASE BALL'}
                </button>
              </div>
            )}

            {/* 5. EUROPEAN ROULETTE BOX */}
            {selectedGame.id === 'table-euro-roulette' && (
              <div className="w-full flex flex-col items-center">
                <div className="grid grid-cols-5 gap-1.5 mb-4 max-w-sm">
                  <button 
                    onClick={() => { setRouletteSelectedColor('red'); setRouletteSelectedNumber(null); }}
                    className={`col-span-2 py-2 rounded text-xs font-bold text-white transition-all bg-red-600 border ${rouletteSelectedColor === 'red' ? 'border-amber-400 ring-2 ring-amber-400' : 'border-transparent opacity-80'}`}
                  >
                    RED SECTOR (2x)
                  </button>
                  <button 
                    onClick={() => { setRouletteSelectedColor('green'); setRouletteSelectedNumber(null); }}
                    className={`col-span-1 py-1 rounded text-xs font-bold text-white transition-all bg-emerald-600 border ${rouletteSelectedColor === 'green' ? 'border-amber-400 ring-2 ring-amber-400' : 'border-transparent'}`}
                  >
                    ZERO (35x)
                  </button>
                  <button 
                    onClick={() => { setRouletteSelectedColor('black'); setRouletteSelectedNumber(null); }}
                    className={`col-span-2 py-2 rounded text-xs font-bold text-white transition-all bg-neutral-900 border ${rouletteSelectedColor === 'black' ? 'border-amber-400 ring-2 ring-amber-400' : 'border-transparent opacity-80'}`}
                  >
                    BLACK SECTOR (2x)
                  </button>

                  {[7, 14, 21, 28, 35].map((num) => (
                    <button 
                      key={num}
                      onClick={() => { setRouletteSelectedNumber(num); setRouletteSelectedColor(null); }}
                      className={`py-1.5 rounded text-xs font-mono transition-all font-bold ${rouletteSelectedNumber === num ? 'bg-amber-400 text-black border border-amber-500' : 'bg-purple-950/40 text-purple-200 border border-purple-500/10 hover:bg-purple-900/30'}`}
                    >
                      #{num} (35x)
                    </button>
                  ))}
                </div>

                {rouletteOutcome && (
                  <div className="mb-4 text-center select-text font-mono text-xs">
                    <span className="text-gray-400">Outcome Sector: </span>
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ml-1 ${rouletteOutcome.color === 'red' ? 'bg-red-600 text-white' : rouletteOutcome.color === 'green' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-gray-200 border border-purple-500/20'}`}>
                      {rouletteOutcome.color.toUpperCase()} {rouletteOutcome.number}
                    </span>
                  </div>
                )}

                <button 
                  onClick={triggerRouletteSpin}
                  disabled={rouletteSpinning}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded text-xs uppercase disabled:opacity-50 shadow-lg"
                >
                  {rouletteSpinning ? 'SPINNING ROULETTE...' : 'SPIN THE ROULETTE'}
                </button>
              </div>
            )}

            {/* 6. BLACKJACK CARD HOUSE */}
            {selectedGame.id === 'table-classic-blackjack' && (
              <div className="w-full flex flex-col items-center">
                {blackjackInGame ? (
                  <div className="w-full max-w-sm flex flex-col gap-3">
                    
                    <div className="bg-black/30 p-2.5 rounded-lg border border-purple-900/20">
                      <div className="text-[10px] text-purple-400 font-bold mb-1 uppercase shrink-0">Dealer Hand</div>
                      <div className="flex gap-1.5">
                        {blackjackDealerCards.map((c, i) => (
                          <span key={i} className="px-2.5 py-1 bg-purple-900/30 text-white font-bold font-mono rounded border border-purple-500/20 text-xs">
                            {c.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-lg border border-amber-500/20">
                      <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-wider">Your Hand (Value: {getCardsSum(blackjackPlayerCards)})</div>
                      <div className="flex gap-1.5">
                        {blackjackPlayerCards.map((c, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#1e0e33] text-white font-bold font-mono rounded border border-purple-400/30 text-xs">
                            {c.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-1.5">
                      <button 
                        onClick={blackjackHit}
                        className="flex-1 py-1.5 bg-purple-600 text-white font-bold rounded text-xs uppercase hover:bg-purple-700 transition-colors"
                      >
                        HIT CARD
                      </button>
                      <button 
                        onClick={blackjackStand}
                        className="flex-1 py-1.5 bg-amber-400 text-black font-bold rounded text-xs uppercase hover:bg-amber-500 transition-all"
                      >
                        STAND BOARD
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-xs text-purple-300 font-mono mb-4">{blackjackStatus}</div>
                    <button 
                      onClick={initiateBlackjack}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded text-xs uppercase"
                    >
                      DEAL DECK STAKE (${betAmount})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 7. LIVE CASINO BROADCASTING */}
            {selectedGame.category === 'live' && (
              <div className="w-full flex flex-col md:flex-row gap-4 h-full">
                
                <div className="flex-1 hover:scale-[1.01] transition-transform duration-300 bg-[#050208] border border-red-500/30 relative rounded-xl h-44 overflow-hidden flex items-center justify-center">
                  <div className="absolute right-3 top-3 bg-black/80 backdrop-blur-md border border-purple-900/40 px-2 rounded text-[7px] text-purple-300 font-mono font-bold flex flex-col">
                    <span>BROADCAST: OK</span>
                    <span>1080P @60FPS HL</span>
                  </div>

                  <div className="text-center z-10 px-4">
                    <div className="text-2xl mb-1 animate-pulse">📼</div>
                    <div className="text-xs font-black text-white uppercase italic tracking-wider">
                      LIVE STREAM CO-ESTABLISHING
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      Macau Room High rollers studio table #{selectedGame.id.split('-')[1].toUpperCase()}
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 py-1 px-2.5 rounded text-[10px] text-amber-400 font-mono flex items-center justify-between border border-purple-900/40">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>Presenter: <strong>{selectedGame.liveDealerName}</strong></span>
                    </div>
                    <span>Stakes timer: <strong className="text-red-400">{liveDealerTime}s</strong></span>
                  </div>
                </div>

                <div className="w-full md:w-48 bg-[#090312] p-2.5 rounded-lg border border-purple-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-purple-400 font-bold block mb-1 uppercase font-mono">Place chips here</span>
                    
                    <div className="grid grid-cols-2 gap-1 mb-1.5">
                      <button 
                        onClick={() => { setLiveUserBetOn('red'); deductFunds(betAmount, `Live Live ${selectedGame?.title}`); }}
                        className={`py-1 rounded text-[9px] font-bold text-white transition-all bg-red-600/90 ${liveUserBetOn === 'red' ? 'ring-2 ring-amber-400' : 'opacity-80'}`}
                      >
                        RED (2x)
                      </button>
                      <button 
                        onClick={() => { setLiveUserBetOn('black'); deductFunds(betAmount, `Live Live ${selectedGame?.title}`); }}
                        className={`py-1 rounded text-[9px] font-bold text-white bg-neutral-900 ${liveUserBetOn === 'black' ? 'ring-2 ring-amber-400' : 'opacity-80'}`}
                      >
                        BLACK (2x)
                      </button>
                    </div>

                    <button 
                      onClick={() => { setLiveUserBetOn('green'); deductFunds(betAmount, `Live Live ${selectedGame?.title}`); }}
                      className={`w-full py-1 rounded text-[9px] font-bold text-white bg-emerald-600 mb-1.5 ${liveUserBetOn === 'green' ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      ZERO GREEN (35x)
                    </button>
                    
                    <div className="bg-black/30 py-1 px-1.5 rounded text-[8px] text-purple-300 italic max-h-[35px] overflow-y-auto leading-normal">
                      {liveDealerChatMessage}
                    </div>
                  </div>

                  <div className="text-[8px] text-center text-gray-500 font-mono flex items-center justify-center gap-1 shrink-0 mt-1">
                    <span>Recent Spins: </span>
                    {liveDealerPrevWins.slice(0, 2).map((w, i) => (
                      <span key={i} className={`px-1 rounded ${w.startsWith('RED') ? 'text-red-400' : 'text-gray-300 bg-neutral-900'}`}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 8. PREMIER SVG SPIN WHEEL ENGINE */}
            {selectedGame.id === 'instant-wheel' && (
              <div className="w-full flex flex-col md:flex-row gap-5 items-center justify-center">
                
                {/* Visual Wheel Rotator Container */}
                <div className="relative flex flex-col items-center">
                  {/* Pin stopper indicator ticker */}
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-amber-400 absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>

                  <div 
                    className="w-36 h-36 rounded-full border-4 border-purple-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(147,51,234,0.15)] flex items-center justify-center bg-black"
                    style={{ 
                      transform: `rotate(-${wheelRotation}deg)`, 
                      transition: wheelSpinning ? 'transform 2.8s cubic-bezier(0.2, 0.8, 0.25, 1)' : 'none'
                    }}
                  >
                    {/* SVG segments for high quality presentation */}
                    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                      {sectorsList.map((sec, idx) => {
                        const angle = 360 / sectorsList.length;
                        const startAngle = idx * angle;
                        const endAngle = startAngle + angle;
                        const rad = Math.PI / 180;
                        const x1 = 50 + 50 * Math.cos(startAngle * rad);
                        const y1 = 50 + 50 * Math.sin(startAngle * rad);
                        const x2 = 50 + 50 * Math.cos(endAngle * rad);
                        const y2 = 50 + 50 * Math.sin(endAngle * rad);
                        return (
                          <path 
                            key={idx}
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={sec.color}
                            opacity="0.80"
                            stroke="#130722"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>

                    {/* Overlay sectors content descriptors */}
                    <div className="absolute w-full h-full inset-0 pointer-events-none">
                      {sectorsList.map((sec, idx) => {
                        const angle = (360 / sectorsList.length) * idx + (360 / sectorsList.length)/2;
                        return (
                          <div 
                            key={idx}
                            className="absolute text-[8px] font-mono font-black text-white shrink-0 tracking-widest origin-center"
                            style={{ 
                              left: '50%', 
                              top: '50%',
                              transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -42px)` 
                            }}
                          >
                            {sec.sector}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-12 h-12 bg-[#0c0516] rounded-full absolute border border-purple-500/40 shadow-inner z-10 flex items-center justify-center font-bold text-[9px] text-[#fbbf24]">
                      SPIN
                    </div>
                  </div>

                  {wheelSelectedItem && (
                    <div className="mt-2.5 bg-black/40 px-3 py-1 rounded border border-purple-900/40 select-text text-[10px] text-center font-mono">
                      <span>Landed: </span>
                      <strong style={{ color: wheelSelectedItem.color || '#fbbf24' }}>{wheelSelectedItem.sector}</strong>
                    </div>
                  )}
                </div>

                {/* Right sector picker bet layout */}
                <div className="w-full md:w-44 bg-[#0a0513] p-3 rounded-lg border border-purple-900/30 text-left">
                  <span className="text-[10px] text-purple-400 font-bold tracking-widest mb-2 block uppercase">Select target block</span>
                  
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {['x1', 'x2', 'x5', 'x10', 'x20', 'x40'].map((sector) => (
                      <button 
                        key={sector}
                        onClick={() => setWheelBetOn(sector)}
                        className={`py-1.5 rounded text-[10px] font-mono font-bold transition-all ${wheelBetOn === sector ? 'bg-amber-400 text-black border-amber-500 shadow-md scale-102' : 'bg-purple-950/40 text-purple-200 border border-purple-500/10 hover:bg-purple-900/20'}`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={triggerMegaWheel}
                    disabled={wheelSpinning}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold uppercase text-[10px] tracking-widest rounded disabled:opacity-50"
                  >
                    {wheelSpinning ? 'SPINNING...' : 'SPIN MEGA WHEEL'}
                  </button>
                </div>

              </div>
            )}

            {/* 9. TURBO COIN FLIP PANEL */}
            {selectedGame.id === 'instant-coinflip' && (
              <div className="w-full flex flex-col md:flex-row gap-5 items-center justify-center">
                
                {/* Graphical flipping Coin visualizer */}
                <div className="flex flex-col items-center justify-center relative">
                  <div 
                    className={`w-28 h-28 rounded-full border-4 border-amber-400 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.30)] flex items-center justify-center relative transition-transform duration-150 ${isCoinFlipping ? 'animate-spin' : ''}`}
                  >
                    <div className="w-24 h-24 rounded-full border border-yellow-300 bg-transparent flex flex-col items-center justify-center">
                      <span className="text-3xl">🪙</span>
                      <strong className="text-xs font-serif font-black tracking-widest text-[#0c0516] select-none text-center">
                        {coinResult ? coinResult.toUpperCase() : coinBetOn.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {coinResult && (
                    <div className="mt-3 bg-black/40 px-2.5 py-0.5 rounded border border-purple-900/30 text-[10px] font-mono text-amber-400">
                      Result: <strong className="font-extrabold">{coinResult.toUpperCase()}</strong>
                    </div>
                  )}
                </div>

                {/* Coin options chips selection */}
                <div className="w-full md:w-44 bg-[#0a0513] p-3 rounded-lg border border-purple-900/30 text-left">
                  <span className="text-[10px] text-purple-400 font-bold tracking-widest mb-2 block uppercase">Pick Heads/Tails</span>
                  
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => setCoinBetOn('heads')}
                      className={`flex-1 py-2 rounded text-xs font-mono font-bold transition-all ${coinBetOn === 'heads' ? 'bg-amber-400 text-black border-amber-500' : 'bg-purple-950/40 text-purple-200 border border-purple-500/10 hover:bg-purple-900/20'}`}
                    >
                      HEADS
                    </button>
                    <button 
                      onClick={() => setCoinBetOn('tails')}
                      className={`flex-1 py-2 rounded text-xs font-mono font-bold transition-all ${coinBetOn === 'tails' ? 'bg-amber-400 text-black border-amber-500' : 'bg-purple-950/40 text-purple-200 border border-purple-500/10 hover:bg-purple-900/20'}`}
                    >
                      TAILS
                    </button>
                  </div>

                  <button 
                    onClick={triggerCoinFlip}
                    disabled={isCoinFlipping}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold uppercase text-[10px] tracking-widest rounded disabled:opacity-50 shadow-lg shadow-purple-900/20"
                  >
                    {isCoinFlipping ? 'FLIPPING COIN...' : 'FLIP TURBO COIN'}
                  </button>
                </div>

              </div>
            )}

            {/* 10. MASTER ROLL DICE GAME */}
            {selectedGame.id === 'instant-dice' && (
              <div className="w-full flex flex-col gap-4 max-w-sm">
                
                {/* Risk Over/Under selection board */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-xl border border-purple-900/20">
                  <button 
                    onClick={() => setDiceBetType('over')}
                    className={`py-1.5 rounded text-xs font-bold transition-all uppercase flex items-center justify-center gap-1 ${diceBetType === 'over' ? 'bg-purple-600 text-white shadow' : 'bg-[#120a22]/50 text-purple-300'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Over Target
                  </button>
                  <button 
                    onClick={() => setDiceBetType('under')}
                    className={`py-1.5 rounded text-xs font-bold transition-all uppercase flex items-center justify-center gap-1 ${diceBetType === 'under' ? 'bg-purple-600 text-white shadow' : 'bg-[#120a22]/50 text-purple-300'}`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> Under Target
                  </button>
                </div>

                {/* Target slider controls */}
                <div className="bg-[#11071d] p-3 rounded-lg border border-purple-900/30 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-purple-300 uppercase">
                    <span>Target Target: {diceTargetValue.toFixed(2)}</span>
                    <span>Win Probability: {currentWinChance.toFixed(2)}%</span>
                  </div>

                  {/* Interactive Slider Input wrapper */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-gray-500">0.01</span>
                    <input 
                      type="range"
                      min="1.00"
                      max="98.00"
                      step="0.5"
                      value={diceTargetValue}
                      onChange={(e) => setDiceTargetValue(parseFloat(e.target.value))}
                      className="flex-1 accent-amber-400 h-1 bg-purple-950 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] font-mono font-bold text-gray-500">98.00</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                    <span>Calculated Pay Multiplier: <strong className="text-amber-400">x{currentMultiplier}</strong></span>
                    <span>Payout: <strong className="text-purple-300">${(betAmount * currentMultiplier).toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Display RNG Outcomes rolling results */}
                <div className="h-16 bg-[#040108] border border-purple-950/50 rounded-xl flex items-center justify-center relative overflow-hidden font-bold">
                  {diceIsRolling ? (
                    <span className="text-sm text-amber-500 font-mono tracking-widest animate-pulse">ROLLING RNG CODES...</span>
                  ) : diceOutcomeValue !== null ? (
                    <div className="text-center font-mono select-text">
                      <span className="text-[9px] text-gray-500 block">DICE OUTCOME</span>
                      <strong className={`text-2xl tracking-tighter ${((diceBetType === 'over' && diceOutcomeValue > diceTargetValue) || (diceBetType === 'under' && diceOutcomeValue < diceTargetValue)) ? 'text-[#22c55e]' : 'text-red-500'}`}>
                        {diceOutcomeValue.toFixed(2)}
                      </strong>
                    </div>
                  ) : (
                    <span className="text-[10px] text-purple-500 font-mono">DICE SYSTEM STABLE ON RNG SECURE</span>
                  )}
                </div>

                <button 
                  onClick={triggerDiceRoll}
                  disabled={diceIsRolling}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold uppercase text-xs tracking-widest rounded-lg shadow-lg"
                >
                  ROLL SECURE DICE
                </button>

              </div>
            )}

          </div>

          <div className="mt-3.5 flex items-center justify-between text-[10px] text-purple-400/50">
            <span>Minimum wager limit: ${selectedGame.minBet.toFixed(2)}</span>
            <span className="flex items-center gap-1">🛡️ Provably Fair RNG Verified</span>
            <span>Maximum wager limit: ${selectedGame.maxBet.toFixed(2)}</span>
          </div>

        </div>
      ) : (
        /* STANDARD ALL CATEGORIES LOBBY GAMES LIST GRID CONTAINER */
        <div className="flex flex-col gap-4">
          
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-purple-900/30 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white uppercase italic">Casino Lobby Grounds</span>
              <span className="px-2 py-0.5 rounded bg-[#22c55e]/15 border border-green-500/30 text-[8px] text-[#22c55e] font-black uppercase tracking-widest">
                AUTOMATED STABLE
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-center flex-wrap">
              {[
                { id: 'all', title: 'All Stake Games', emoji: '🎰' },
                { id: 'slots', title: 'Slots Arena', emoji: '🍒' },
                { id: 'live', title: 'Livestream Croupiers', emoji: '📹' },
                { id: 'table', title: 'Elite Tables', emoji: '🃏' },
                { id: 'instant', title: 'Instant / Crash', emoji: '🚀' },
              ].map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${activeCategory === cat.id ? 'bg-[#1d0e37] border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(147,51,234,0.3)]' : 'bg-[#0f081c] border-transparent text-purple-300/70 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="text-xs shrink-0">{cat.emoji}</span>
                  <span className="text-[11px] font-sans">{cat.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid high density cards viewport */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredGames.map((game) => {
              const hotHighlight = ['slot-video', 'instant-aviator', 'instant-crush', 'instant-wheel', 'instant-mines'].includes(game.id);
              return (
                <div 
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className={`cursor-pointer group relative rounded-xl overflow-hidden bg-[#0c0519]/90 border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 flex flex-col h-56 ${hotHighlight ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.06)] bg-gradient-to-br from-[#180d28] to-[#0a0414]' : 'border-purple-900/30 hover:border-purple-500/30'}`}
                >
                  
                  {hotHighlight && (
                    <div className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[8px] font-black tracking-widest uppercase">
                      ACTIVE SECTOR
                    </div>
                  )}

                  {game.jackpotEligible && (
                    <div className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded bg-purple-600/95 text-white text-[8px] font-black tracking-widest uppercase border border-purple-400/40">
                      JACKPOT
                    </div>
                  )}

                  <div className="flex-1 bg-[#25153f]/20 flex items-center justify-center relative group-hover:bg-[#25153f]/45 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06030a] via-[#06030a]/20 to-transparent"></div>
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300 z-10 select-none">
                      {game.emoji}
                    </span>
                  </div>

                  <div className="p-3 bg-black/45 z-10 flex flex-col justify-between shrink-0">
                    <div>
                      <div className="text-[9px] text-[#fbbf24] uppercase font-black tracking-widest truncate">
                        {game.provider}
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate uppercase font-sans">
                        {game.title}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-purple-900/15 text-[9px] text-purple-300/50">
                      <span>RTP {game.rtp}%</span>
                      <button className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        STAKE <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
