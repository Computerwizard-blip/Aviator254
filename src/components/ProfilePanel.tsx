/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, User, Crown, Phone, Calendar, Copy, LogOut, Award, Check, AlertTriangle, Settings, Bot, Send, ChevronLeft, Headphones, MessageSquare } from 'lucide-react';
import { UserProfile, Wallet, Transaction } from '../types';

interface ProfilePanelProps {
  userProfile: UserProfile;
  wallet: Wallet;
  authSessionMode: 'demo' | 'real' | null;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  triggerNotification: (title: string, message: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
  transactions?: Transaction[];
  onOpenSettings?: () => void;
}

export default function ProfilePanel({
  userProfile,
  wallet,
  authSessionMode,
  isOpen,
  onClose,
  onSignOut,
  triggerNotification,
  transactions,
  onOpenSettings
}: ProfilePanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Support chatbot state hooks
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: 'Jambo! ✈️ I am your Aviator AI Co-Pilot & Security Support Agent. You can report any issues/bugs, or ask me how play strategies like Auto Cash Out or Auto Bet work! How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat when messages update or open status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const simulateAIResponse = (userText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let aiText = '';
      const norm = userText.toLowerCase();

      if (norm.includes('how') && (norm.includes('play') || norm.includes('work') || norm.includes('aviator'))) {
        aiText = "✈️ **Aviator Mechanics Guide**\n\nThe game is fully random & provably fair:\n1. **Enter Stake**: Choose a bet amount (e.g. KSh 10 - KSh 1,000) and click 'BET' before takeoff.\n2. **Look closely**: As the jet climbs, the multiplier increases starting from 1.00x upwards.\n3. **Cash out**: Click the large green button to cash out before the plane flies away!\n4. **Failure**: If the plane vanishes ('Flew Away') before you tap cash out, the bet is lost.";
      } else if (norm.includes('auto') || norm.includes('cashout') || norm.includes('setting')) {
        aiText = "⚙️ **Auto Pilot Automation Explained**\n\n- **Auto Bet**: Places your desired wager automatically as soon as any new round departs.\n- **Auto Cash Out**: Cashes out automatically at any specific multiplier target (e.g. 1.20x or 2.00x) that you input. Highly recommended to eliminate browser latency!";
      } else if (norm.includes('bug') || norm.includes('report') || norm.includes('issue') || norm.includes('failed') || norm.includes('error')) {
        aiText = "🐛 **Bug & Diagnostics Safe Report**\n\nWe appreciate the submission! We have automatically extracted this diagnostic report from your safe session:\n- Account: " + userProfile.username + " (" + (userProfile.fullName || 'Frank Janal') + ")\n- Status: Safe Sandbox Verified\n- Log Type: Client UI Event\n\nOur specialized developer squad is reviewing transaction states & canvas rendering frames. We will notify you in your notifications center if you need to refresh your environment!";
      } else if (norm.includes('deposit') || norm.includes('money') || norm.includes('topup') || norm.includes('refill') || norm.includes('real')) {
        aiText = "💰 **Balance Coffer refills:**\n\nIn **Demo Practice Play**, you have mock coffer credits for training. In **Real Cash Mode**, top-ups are safely triggered instantly via customized M-Pesa till credentials! Check your billing coffer to track recent successful deposits.";
      } else {
        aiText = "👋 **Jambo Player!** I am your secure Aviator Co-Pilot AI.\n\nI am configured to resolve any doubts about the mechanics or investigate bugs. Feel free to use the quick suggestion chips below to learn how play multipliers are calculated!";
      }

      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
    simulateAIResponse(userMsg);
  };

  const handleSendSuggestion = (text: string) => {
    if (isTyping) return;
    setChatMessages(prev => [...prev, {
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    simulateAIResponse(text);
  };

  // Reset confirmation state when drawer opens or closes
  useEffect(() => {
    setConfirmSignOut(false);
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (chatOpen) {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-end z-[60] select-none font-sans animate-fadeIn">
        {/* Click outside to close */}
        <div className="absolute inset-0 cursor-pointer" onClick={() => setChatOpen(false)}></div>

        {/* Support Chat Panel Container */}
        <div className="relative w-full max-w-sm bg-[#141518] border-l border-[#24262d] h-full shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col text-slate-200 overflow-hidden animate-slideLeft">
          
          {/* Custom Chat Header */}
          <div className="p-4 bg-gradient-to-r from-[#1c1d22] via-[#141518] to-red-950/20 border-b border-[#212327] flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e600] animate-pulse"></span>
                <h3 className="text-sm font-black text-rose-100 uppercase tracking-wider">Aviator AI Support</h3>
              </div>
              <p className="text-[9.5px] text-gray-400 uppercase font-mono">Instant Co-Pilot Helpline</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Guidance Banner */}
          <div className="bg-red-950/25 border-b border-red-500/10 px-4 py-2 flex items-center gap-2 text-left shrink-0">
            <Bot className="w-4 h-4 text-red-550 shrink-0" />
            <span className="text-[10px] text-gray-300 font-medium">
              Verify gaming tips, auto features, or report client bugs 24/7.
            </span>
          </div>

          {/* Chat Messages Log Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800 bg-black/10">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left text-white shadow-md ${
                  msg.sender === 'user' 
                    ? 'bg-red-650 rounded-tr-none text-white font-medium' 
                    : 'bg-[#1e2025] rounded-tl-none border border-zinc-850/60 text-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[7.5px] font-bold text-gray-500 mt-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start mr-auto max-w-[80%]">
                <div className="p-3 bg-[#1e2025] border border-zinc-850/60 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Suggestion Chips */}
          <div className="p-2 border-t border-zinc-800/60 bg-zinc-950/25 space-y-1 text-left shrink-0">
            <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-wider block px-2">Quick support queries:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800 px-2">
              <button 
                type="button"
                onClick={() => handleSendSuggestion("How does the Aviator crash game work?")}
                className="shrink-0 px-2.5 py-1.5 bg-zinc-90 w-auto hover:bg-zinc-850 border border-zinc-800 text-gray-300 rounded-full text-[10px] font-bold transition-all cursor-pointer"
              >
                ✈️ How to Play
              </button>
              <button 
                type="button"
                onClick={() => handleSendSuggestion("How do I use Auto Betting & Auto Cashout?")}
                className="shrink-0 px-2.5 py-1.5 bg-zinc-90 w-auto hover:bg-zinc-850 border border-zinc-800 text-gray-300 rounded-full text-[10px] font-bold transition-all cursor-pointer"
              >
                ⚙️ Auto Cash Out
              </button>
              <button 
                type="button"
                onClick={() => handleSendSuggestion("I found a bug. I want to report a system issue.")}
                className="shrink-0 px-2.5 py-1.5 bg-zinc-90 w-auto hover:bg-red-950/10 border border-zinc-800/80 hover:border-red-500/20 text-[#ff4747] rounded-full text-[10px] font-bold transition-all cursor-pointer"
              >
                🐛 Report Bug
              </button>
            </div>
          </div>

          {/* Custom Message Input Footer */}
          <form 
            onSubmit={handleChatSubmit}
            className="p-3 bg-[#1c1d22] border-t border-[#212327] flex items-center gap-2 shrink-0 px-4"
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI or type an issue..."
              disabled={isTyping}
              className="flex-1 bg-black/45 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all disabled:opacity-50 font-medium"
            />
            <button 
              type="submit"
              disabled={isTyping || !chatInput.trim()}
              className="w-8 h-8 rounded-xl bg-red-650 hover:bg-red-500 text-white flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  const currentBalance = authSessionMode === 'real' ? wallet.realBalance : wallet.demoBalance;
  const referralCode = userProfile.referralCode || `REF-${userProfile.username.toUpperCase()}-${userProfile.phone ? userProfile.phone.replace(/[^0-9]/g, '').slice(-4) : '7777'}`;

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

  const handleSignOutClick = () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      triggerNotification(
        '⚠️ Sign Out Pending',
        'Please tap "CLICK AGAIN TO SIGN OUT" within 4 seconds to secure log out.',
        'general'
      );
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmSignOut(false);
      }, 4000);
    } else {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      setConfirmSignOut(false);
      onSignOut();
    }
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

          {/* Settings button on the right, right below the "X" button */}
          {onOpenSettings && (
            <button 
              type="button"
              onClick={onOpenSettings}
              className="absolute top-13 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
              title="Player Settings: Change Photo, Initials, Username & Sounds"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[8px] font-black tracking-widest uppercase animate-pulse">
            Aviator Safe Profile
          </span>

          <div className="flex items-center gap-4 mt-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#e21515] to-[#ff4747] flex items-center justify-center font-black text-2xl text-white shadow-[0_0_20px_rgba(226,21,21,0.4)] overflow-hidden">
                {userProfile.avatar && (userProfile.avatar.startsWith('data:image/') || userProfile.avatar.startsWith('http://') || userProfile.avatar.startsWith('https://')) ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  userProfile.avatar || userProfile.username.substring(0, 2).toUpperCase()
                )}
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

          {/* Deposits, Withdrawals & Transaction History */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black text-left">
              Transaction Ledger
            </h4>
            
            <div className="bg-black/30 border border-[#1d1f24] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-[#212327] pb-1.5 mb-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Recent Activities</span>
                <span className="text-[9px] text-[#00e600] font-mono">
                  {transactions && transactions.length > 0 ? `${transactions.length} recorded` : 'No logs'}
                </span>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-850">
                {!transactions || transactions.length === 0 ? (
                  <div className="py-6 text-center text-[10px] text-gray-500 uppercase tracking-wide">
                    No transactions recorded yet.
                  </div>
                ) : (
                  transactions.slice(0, 10).map((tx) => {
                    const isDeposit = tx.type === 'deposit';
                    const isWithdrawal = tx.type === 'withdrawal';
                    const isBonus = tx.type === 'bonus_credit';
                    const isWin = tx.type === 'win';
                    const isBet = tx.type === 'bet';
                    
                    let typeLabel = tx.type.replace('_', ' ');
                    let amtSign = '';
                    let colorClass = 'text-gray-400';
                    
                    if (isDeposit) {
                      typeLabel = 'Deposit';
                      amtSign = '+';
                      colorClass = 'text-[#00e600]';
                    } else if (isWithdrawal) {
                      typeLabel = 'Withdraw';
                      amtSign = '-';
                      colorClass = 'text-red-400';
                    } else if (isBonus) {
                      typeLabel = 'Bonus';
                      amtSign = '+';
                      colorClass = 'text-amber-400';
                    } else if (isWin) {
                      typeLabel = 'Win';
                      amtSign = '+';
                      colorClass = 'text-[#00e600]';
                    } else if (isBet) {
                      typeLabel = 'Bet';
                      amtSign = '-';
                      colorClass = 'text-gray-550';
                    }
                    
                    return (
                      <div key={tx.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[#212327]/40 last:border-0">
                        <div className="flex flex-col text-left">
                          <span className="text-white font-bold capitalize">{typeLabel}</span>
                          <span className="text-[9px] text-gray-500">{tx.timestamp} • {tx.method || 'Platform'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-black ${colorClass}`}>
                            {amtSign}{tx.currency || 'KSh'} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </span>
                          <span className={`text-[8.5px] font-bold px-1 rounded scale-90 ${tx.status === 'SUCCESS' ? 'bg-[#00e600]/10 text-[#00e600]' : tx.status === 'FAILED' ? 'bg-red-500/10 text-red-100' : 'bg-amber-500/10 text-amber-500'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
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

          {/* Live AI Support Co-Pilot & Helpdesk Block */}
          <div id="live-helpdesk-panel-card" className="bg-gradient-to-r from-red-950/20 via-black/45 to-zinc-900/40 border border-red-500/10 p-4 rounded-xl space-y-3">
            <div className="space-y-1">
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[7.5px] font-black tracking-wider uppercase">
                🎧 Helpdesk Support
              </span>
              <h5 className="text-xs font-black text-rose-100 uppercase tracking-tight">Need assistance or have issue?</h5>
              <p className="text-[10px] text-gray-400 leading-normal text-left">
                Instantly connect with our smart <strong className="text-red-400">Aviator AI Support Co-Pilot</strong> to ask how gameplay works, debug automatic wagers, or file error logs & report client issues directly!
              </p>
            </div>

            <button 
              type="button"
              onClick={() => setChatOpen(true)}
              className="w-full py-2.5 bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 rounded-lg font-black text-xs uppercase tracking-wider text-red-400 select-none transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-red-550 animate-bounce" />
              <span>Launch Support AI Agent</span>
            </button>
          </div>

        </div>

        {/* Footer Area with standard signout */}
        <div className="p-6 bg-black/40 border-t border-[#212327]">
          <button
            onClick={handleSignOutClick}
            className={`w-full py-3.5 active:scale-95 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              confirmSignOut
                ? 'bg-amber-500 hover:bg-amber-450 text-black shadow-amber-500/20 shadow-xl border-2 border-amber-600/50 animate-pulse'
                : 'bg-[#e21515] hover:bg-[#ff2020] shadow-red-500/10'
            }`}
          >
            {confirmSignOut ? (
              <>
                <AlertTriangle className="w-4 h-4 text-black" />
                <span>Click Again to Sign Out</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out Profile</span>
              </>
            )}
          </button>
          <div className="text-[9px] text-gray-600 text-center mt-3 font-mono">
            Secure Session Authentication verified through CasinoHub Link
          </div>
        </div>

      </div>
    </div>
  );
}
