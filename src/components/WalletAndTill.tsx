/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Coins, 
  Check, 
  AlertCircle,
  Copy, 
  Clock, 
  CheckCircle,
  Wallet as WalletIcon
} from 'lucide-react';
import { Wallet, Transaction } from '../types';

interface WalletAndTillProps {
  wallet: Wallet;
  setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'> & { status?: 'SUCCESS' | 'FAILED' | 'PENDING' }) => void;
  triggerNotification: (title: string, message: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
}

export default function WalletAndTill({
  wallet,
  setWallet,
  transactions,
  addTransaction,
  triggerNotification
}: WalletAndTillProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transactions'>('deposit');
  const [depositMethod, setDepositMethod] = useState<'till' | 'card' | 'crypto'>('till');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'airtel' | 'bank' | 'crypto'>('mpesa');

  // Input States
  const [amountInput, setAmountInput] = useState<string>('200');
  const [phoneInput, setPhoneInput] = useState<string>('0712345678');
  const [referenceCode, setReferenceCode] = useState<string>('');
  
  // Till Specific Simulation States
  const [tillStep, setTillStep] = useState<'input' | 'processing' | 'awaiting_pin' | 'verified'>('input');
  const [simulatedPIN, setSimulatedPIN] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const TILL_NUMBER = "580459"; // Simulated buy goods till

  // Card input states
  const [cardNumber, setCardNumber] = useState<string>('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCVC, setCardCVC] = useState<string>('999');

  // Crypto state
  const [cryptoAddress] = useState<string>('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');

  // Withdrawal inputs
  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [withdrawTarget, setWithdrawTarget] = useState<string>('0712345678');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(TILL_NUMBER);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Triggering the custom Till-Payment flow
  const initiateTillDeposit = () => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      triggerNotification('Invalid Amount', 'Please input a valid numeric deposit amount.', 'general');
      return;
    }
    if (phoneInput.trim() === '') {
      triggerNotification('Phone Required', 'Kindly input your currency/mobile phone number target.', 'general');
      return;
    }

    setTillStep('processing');
    
    // Simulate push notification trigger from buy goods till
    setTimeout(() => {
      setTillStep('awaiting_pin');
      triggerNotification('Simulated Till Push Sent', `STK Push prompt sent to target mobile: ${phoneInput}!`, 'deposit');
    }, 1500);
  };

  const verifyPINAndCredit = () => {
    if (simulatedPIN.length < 4) {
      triggerNotification('Invalid PIN', 'Please type a valid 4-digit mobile wallet authorization PIN.', 'general');
      return;
    }

    const depAmount = parseFloat(amountInput);
    setTillStep('verified');

    // Add cash to main balance and bonus matching
    const bonusAdd = depAmount * 0.20; // 20% cashback bonus matched on till deposits
    setWallet((prev) => ({
      ...prev,
      mainBalance: prev.mainBalance + depAmount,
      bonusBalance: prev.bonusBalance + bonusAdd
    }));

    addTransaction({
      type: 'deposit',
      amount: depAmount,
      currency: 'USD',
      method: `M-Pesa Till ${TILL_NUMBER}`,
      referenceCode: `MP-${Math.random().toString(36).substring(3, 9).toUpperCase()}`
    });

    triggerNotification('Deposit Successful!', `Credited +$${depAmount.toFixed(2)} to Main Wallet & +$${bonusAdd.toFixed(2)} matched welcome bonus!`, 'deposit');
  };

  const handleCardDeposit = () => {
    const depAmount = parseFloat(amountInput);
    if (isNaN(depAmount) || depAmount <= 0) {
      triggerNotification('Invalid Amount', 'Please specify a valid dollar value.', 'general');
      return;
    }
    
    setWallet((prev) => ({
      ...prev,
      mainBalance: prev.mainBalance + depAmount
    }));

    addTransaction({
      type: 'deposit',
      amount: depAmount,
      currency: 'USD',
      method: 'Visa/Mastercard Gateway'
    });

    triggerNotification('Card Deposited', `Securely added $${depAmount.toFixed(2)} to your wallet.`, 'deposit');
    setAmountInput('100');
  };

  const handleCryptoDeposit = () => {
    const depAmount = parseFloat(amountInput);
    if (isNaN(depAmount) || depAmount <= 0) return;

    setWallet((prev) => ({
      ...prev,
      mainBalance: prev.mainBalance + depAmount
    }));

    addTransaction({
      type: 'deposit',
      amount: depAmount,
      currency: 'USD',
      method: 'USDT/Crypto Address'
    });

    triggerNotification('Crypto Received', `USDT blockchain transaction decoded. Credited $${depAmount.toFixed(2)}!`, 'deposit');
  };

  const handleWithdrawalRequest = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerNotification('Invalid Amount', 'Please enter a valid numeric amount to withdraw.', 'general');
      return;
    }
    if (wallet.mainBalance < amt) {
      triggerNotification('Insufficient Funds', 'Standard main balance is insufficient for this checkout action.', 'general');
      return;
    }

    // Deduct
    setWallet((prev) => ({
      ...prev,
      mainBalance: prev.mainBalance - amt
    }));

    addTransaction({
      type: 'withdrawal',
      amount: amt,
      currency: 'USD',
      method: withdrawMethod === 'mpesa' ? 'M-Pesa Payout' : withdrawMethod === 'airtel' ? 'Airtel Money Transfer' : 'Direct Bank Out'
    });

    triggerNotification('Withdrawal Queued', `Sent withdrawal of $${amt.toFixed(2)} to target ${withdrawTarget}. Processing instantly via automation!`, 'withdrawal');
    setWithdrawAmount('100');
  };

  return (
    <div className="bg-[#120a24]/90 border border-purple-900/40 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(147,51,234,0.1)]">
      
      {/* Mini state headers */}
      <div className="bg-[#180f33] p-6 border-b border-purple-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-900/30 text-amber-500 border border-purple-500/10">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm text-purple-400 font-black tracking-widest uppercase mb-0.5">Secure Wallet Control</h3>
            <span className="text-xs text-purple-305/50">Manage dynamic real-money cashier deposits and withdrawals instantly</span>
          </div>
        </div>

        {/* Action picker tab slider */}
        <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-purple-900/30">
          {(['deposit', 'withdraw', 'transactions'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#29174f] text-amber-400 font-extrabold shadow-sm' : 'text-purple-305/65 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: DEPOSITS SYSTEM */}
        {activeTab === 'deposit' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left side: Method select */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase mb-1">Deposit Channels</span>

              <button 
                onClick={() => setDepositMethod('till')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all ${depositMethod === 'till' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="text-xs font-bold text-white">Buy Goods Till No.</div>
                    <div className="text-[10px] text-purple-400 font-mono">Instant M-Pesa Verification</div>
                  </div>
                </div>
                <div className="text-[10px] bg-amber-400/20 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">Fast</div>
              </button>

              <button 
                onClick={() => setDepositMethod('card')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all ${depositMethod === 'card' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <div className="text-xs font-bold text-white">Visa / Mastercard</div>
                    <div className="text-[10px] text-purple-400 font-mono">Secure Debit/Credit</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setDepositMethod('crypto')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all ${depositMethod === 'crypto' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪙</span>
                  <div>
                    <div className="text-xs font-bold text-white">Cryptocurrency</div>
                    <div className="text-[10px] text-purple-400 font-mono">USDT / BTC Instant Block</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Right side: Method panels details */}
            <div className="md:col-span-8 bg-black/30 p-6 rounded-2xl border border-purple-900/20">
              
              {/* PANELS DEPOSIT METHOD 1: MOBILE TILL PAYMENT SYSTEM */}
              {depositMethod === 'till' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white uppercase italic">Interactive Buy Goods Till Simulator</h4>
                    <span className="text-[9px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">20% Welcome Bonus Applied</span>
                  </div>

                  <p className="text-xs text-purple-304/60 mb-6 leading-relaxed">
                    Deposit safely via M-Pesa Till. Specify the value in USD below. Our gateway translates the exchange rate and launches a secure push verification window!
                  </p>

                  {tillStep === 'input' && (
                    <div className="space-y-4">
                      
                      {/* Flex row with amount and mobile */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-purple-400 font-bold block mb-1">DEPOSIT AMOUNT ($)</label>
                          <input 
                            type="number"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            className="w-full bg-[#0c0616] border border-purple-900/50 rounded-lg p-2.5 text-sm text-amber-400 font-bold font-mono focus:border-amber-400 focus:outline-none"
                            placeholder="e.g. 50"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-purple-400 font-bold block mb-1">MOBILE WALLET NUMBER</label>
                          <input 
                            type="text"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="w-full bg-[#0c0616] border border-purple-900/50 rounded-lg p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                            placeholder="e.g. 0712345678"
                          />
                        </div>
                      </div>

                      {/* Display till coordinates block */}
                      <div className="bg-[#150a29] border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-[#fbbf24] font-black uppercase tracking-widest mb-0.5">BUY GOODS TILL NUMBER Target</div>
                          <span className="text-lg font-mono font-black text-white tracking-widest">{TILL_NUMBER}</span>
                        </div>
                        <button 
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded text-xs text-purple-300 font-mono flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <button 
                        onClick={initiateTillDeposit}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.01] transition-transform text-black uppercase font-black text-xs tracking-widest rounded-lg"
                      >
                        INITIATE TILL REQUEST
                      </button>

                    </div>
                  )}

                  {tillStep === 'processing' && (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">SECURE ENDPOINT INITIATION ACCEDING</h4>
                      <p className="text-[10px] text-purple-400">Communicating transaction metadata securely with M-Pesa Buy Goods Till Api...</p>
                    </div>
                  )}

                  {tillStep === 'awaiting_pin' && (
                    <div className="max-w-xs mx-auto border border-purple-500/20 bg-[#160d2b] p-6 rounded-2xl relative shadow-xl">
                      <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded text-[8px] font-black font-mono">STK PUSH SIMULATED</div>
                      
                      <div className="text-center mb-4">
                        <span className="text-2xl">📱</span>
                        <h4 className="text-xs font-black text-white uppercase italic mt-1">Simulator: Enter Wallet PIN</h4>
                        <p className="text-[9px] text-purple-300">Authorize transfer of ${amountInput} to Buy Goods Till {TILL_NUMBER}</p>
                      </div>

                      <div className="space-y-4">
                        <input 
                          type="password"
                          maxLength={4}
                          value={simulatedPIN}
                          onChange={(e) => setSimulatedPIN(e.target.value)}
                          className="w-full text-center bg-[#07030e] border-2 border-purple-900 rounded-lg p-2 text-lg font-black text-amber-400 tracking-widest focus:outline-none"
                          placeholder="••••"
                        />

                        <button 
                          onClick={verifyPINAndCredit}
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded"
                        >
                          SUBMIT PIN CODE
                        </button>
                      </div>
                    </div>
                  )}

                  {tillStep === 'verified' && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">TRANSACTION CONFIRMED</h4>
                      <p className="text-xs text-purple-400 mb-4">Balance was matched instantly on M-Pesa Buy Goods shortcode.</p>
                      
                      <button 
                        onClick={() => setTillStep('input')}
                        className="px-6 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-xs font-semibold text-purple-200"
                      >
                        Make Another Deposit
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* PANELS DEPOSIT METHOD 2: VISA / MASTERCARD */}
              {depositMethod === 'card' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase italic">Debit or Credit Card Gateway</h4>
                  <p className="text-xs text-purple-304/60">Fast secure global card gateway powered by Stripe.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-purple-400 font-bold block mb-0.5">CARD AMOUNT TO LOAD ($)</label>
                      <input 
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono font-bold text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-purple-400 font-bold block mb-0.5">CARD NUMBER</label>
                      <input 
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-purple-400 font-bold block mb-0.5">EXPIRATION DATE</label>
                        <input 
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 font-bold block mb-0.5">SECURITY CODE (CVC)</label>
                        <input 
                          type="password"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono text-white text-center"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleCardDeposit}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-widest rounded"
                    >
                      CHARGE CARD SECURELY
                    </button>
                  </div>
                </div>
              )}

              {/* PANELS DEPOSIT METHOD 3: CRYPTOCURRENCY */}
              {depositMethod === 'crypto' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase italic">Decentralized Token Loader</h4>
                  <p className="text-xs text-purple-304/60">Load funds instantly via key crypto networks. Enter value below then transfer to the verified address:</p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-purple-400 font-bold block mb-0.5">AMOUNT IN DOLLARS ($)</label>
                      <input 
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs text-amber-400 font-mono font-bold"
                      />
                    </div>

                    <div className="bg-[#130b26] border border-purple-900 p-4 rounded-xl space-y-2">
                      <div className="text-[9px] text-[#fbbf24] font-black uppercase tracking-widest">NETWORK: Ethereum (ERC-20 USDT)</div>
                      <div className="text-xs font-mono break-all text-white bg-black/40 p-2 rounded select-all">
                        {cryptoAddress}
                      </div>
                    </div>

                    <button 
                      onClick={handleCryptoDeposit}
                      className="w-full py-2.5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded"
                    >
                      CONFIRM BLOCKCHAIN DEPOSIT
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWAL SYSTEM */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left selector */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase mb-1">Payout Gateways</span>

              <button 
                onClick={() => setWithdrawMethod('mpesa')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all ${withdrawMethod === 'mpesa' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="text-xs font-bold text-white">M-Pesa cash out</div>
                    <div className="text-[10px] text-purple-400 font-mono">Automated swift payout</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setWithdrawMethod('airtel')}
                className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all ${withdrawMethod === 'airtel' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="text-xs font-bold text-white">Airtel Money</div>
                    <div className="text-[10px] text-purple-400 font-mono font-semibold">Immediate mobile push</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setWithdrawMethod('bank')}
                className={`p-4 rounded-xl text-left border transition-all ${withdrawMethod === 'bank' ? 'bg-[#21113c]/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-black/20 border-purple-900/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <div className="text-xs font-bold text-white">Direct Bank Transfer</div>
                    <div className="text-[10px] text-purple-400 font-mono">1-2 Working days clearing</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Right form */}
            <div className="md:col-span-8 bg-black/30 p-6 rounded-2xl border border-purple-900/20">
              <h4 className="text-sm font-bold text-white uppercase italic mb-1">Request Automated Payout</h4>
              <p className="text-xs text-purple-304/60 mb-6">CasinoHub VIP engine guarantees withdrawals are completed and verified within 15 minutes.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-purple-400 font-bold block mb-0.5">WITHDRAW AMOUNT ($)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono font-bold text-amber-400"
                  />
                  <span className="text-[9px] text-gray-500 mt-1 block">Maximum withdrawable credit limits apply base on current VIP Silver status.</span>
                </div>

                <div>
                  <label className="text-[10px] text-purple-400 font-bold block mb-0.5">TARGET RECIPIENT ACCOUNT / PHONE</label>
                  <input 
                    type="text"
                    value={withdrawTarget}
                    onChange={(e) => setWithdrawTarget(e.target.value)}
                    className="w-full bg-[#0c0616] border border-purple-900/50 rounded p-2 text-xs font-mono text-white"
                  />
                </div>

                <div className="bg-[#120722] p-3 rounded border border-purple-500/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300">Main Account Balance:</span>
                  <span className="text-amber-400 font-bold">${wallet.mainBalance.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleWithdrawalRequest}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs uppercase tracking-widest text-white rounded shadow-md"
                >
                  DISPATCH CASHOUT DISBURSEMENT
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: TRANSACTION ARCHIVES */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase italic">Ledger transactional archives</h4>
              <span className="text-[10px] font-mono text-purple-400 uppercase">Cryptographic Hashes Activated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-900/30 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    <th className="pb-2">Transaction ID</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Details</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-purple-200/80 font-mono divide-y divide-purple-900/10">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-gray-400">#{tx.id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${tx.type === 'win' ? 'bg-emerald-600/20 text-emerald-400' : tx.type === 'bet' ? 'bg-purple-900/30 text-purple-300' : tx.type === 'deposit' ? 'bg-amber-400/20 text-amber-500' : 'bg-red-900/30 text-red-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 max-w-[140px] truncate">{tx.game || tx.method || 'General Cashier'}</td>
                      <td className="py-3">
                        <span className={tx.type === 'win' || tx.type === 'deposit' ? 'text-emerald-400 font-bold' : 'text-purple-300 font-semibold'}>
                          {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-[9px] bg-black/40 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black font-mono">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-gray-500">{tx.timestamp}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500 text-xs">
                        No transactions registered on this sandbox ledger yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
