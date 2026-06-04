/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, Download, CheckCircle2, AlertTriangle, ShieldCheck, Award, Share } from 'lucide-react';
// @ts-ignore
import appLogo from '../assets/images/aviator_app_logo_1780602471546.png';

interface DownloadAppModalProps {
  onClose: () => void;
  isOpen: boolean;
  onCreditWallet: (amount: number) => void;
  triggerNotification: (title: string, msg: string, type: 'deposit' | 'withdrawal' | 'bonus' | 'jackpot' | 'tournament' | 'vip' | 'general') => void;
}

export default function DownloadAppModal({
  onClose,
  isOpen,
  onCreditWallet,
  triggerNotification
}: DownloadAppModalProps) {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'pc'>('android');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Detect platform automatically on mount
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('pc');
    }
  }, []);

  if (!isOpen) return null;

  const startDownload = () => {
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadState('completed');
          triggerNotification(
            '📥 DOWNLOAD COMPLETED',
            'Official aviator-casinohub-v3.2.1.apk downloaded! Tap install to claim your reward.',
            'general'
          );
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 150);
  };

  const claimBonus = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    onCreditWallet(1000);
    triggerNotification(
      '🎁 APP BONUS CREDITED',
      'Congratulations! KSh 1,000.00 app installer welcome gift has been loaded to your wallet balance!',
      'bonus'
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in font-sans">
      <div className="w-full max-w-md bg-[#181921] border border-red-500/20 hover:border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(226,21,21,0.15)] transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#2a1115] to-[#181921] border-b border-[#24262f] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-red-500/30 p-1 flex items-center justify-center shadow-[0_0_12px_rgba(226,21,21,0.25)] relative group">
              <img 
                src={appLogo} 
                alt="CasinoHub Logo App" 
                className="w-full h-full object-contain shrink-0 rounded-lg group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e600] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e600]"></span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-50 uppercase tracking-tight">CasinoHub Android & iOS</h3>
              <p className="text-[10px] text-gray-400 font-mono">Premium Mobile client v3.2.1</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/40 border border-[#24262f] text-gray-400 hover:text-white flex items-center justify-center transition-colors hover:bg-black/80 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-red-950/40">
          
          {/* Welcome App Promotion Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
              <Award className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wide">Get Free KSh 1,000 Installer Bonus</h4>
              <p className="text-[10.5px] text-gray-300 leading-normal">
                Download and install our native client app to claim your promo startup bonus. Experience smoother 65fps graphics, zero browser lagging, and faster deposits!
              </p>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none rounded-bl-full"></div>
          </div>

          {/* Quick Platform selection Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-[#24262f] shrink-0">
            {[
              { id: 'android', label: 'Android APK', icon: <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> },
              { id: 'ios', label: 'iOS / iPhone', icon: <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> },
              { id: 'pc', label: 'PC Web App', icon: <Smartphone className="w-3.5 h-3.5 text-amber-400" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPlatform(tab.id as any)}
                className={`py-2 rounded-lg text-[11px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  platform === tab.id 
                    ? 'bg-[#e21515] text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Platform specific instruction detail blocks */}
          {platform === 'android' && (
            <div className="space-y-3">
              <div className="bg-black/30 p-3.5 rounded-xl border border-[#24262f] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Download package info:</span>
                  <span className="bg-[#1f2937]/50 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-black">Secure Signed Client</span>
                </div>
                
                {downloadState === 'idle' && (
                  <button
                    onClick={startDownload}
                    className="w-full py-3 bg-[#00e600] hover:bg-[#1bf31b] active:bg-[#00cc00] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,230,0,0.25)] hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="w-4 h-4 font-black" />
                    <span>Download Official client APK (12.4 MB)</span>
                  </button>
                )}

                {downloadState === 'downloading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        Downloading...
                      </span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-[#24262f]">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-[#e21515] h-full rounded-full transition-all duration-150"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {downloadState === 'completed' && (
                  <div className="space-y-3 text-center">
                    <div className="py-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>DOWNLOAD COMPLETE! READY TO INSTALL</span>
                    </div>

                    {!rewardClaimed ? (
                      <button
                        onClick={claimBonus}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
                      >
                        <Award className="w-4 h-4" />
                        <span>Claim App Installation KSh 1,000 Bonus!</span>
                      </button>
                    ) : (
                      <div className="py-2 bg-black/40 border border-amber-500/10 rounded-xl text-center text-[10px] text-amber-500 font-mono">
                        ✓ KSh 1,000 App startup welcome gift loaded!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Install guide steps */}
              <div className="space-y-2 text-left">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Simple Installation Steps</h5>
                <div className="space-y-1.5">
                  <div className="bg-black/10 p-2.5 rounded-lg border border-[#24262f] flex gap-2.5 items-center">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                    <span className="text-[10.5px] text-gray-300">Tap the green download button and allow storage access if requested.</span>
                  </div>
                  <div className="bg-black/10 p-2.5 rounded-lg border border-[#24262f] flex gap-2.5 items-center">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                    <span className="text-[10.5px] text-gray-300">Open file and tap <strong className="text-white">Install</strong> (Enable 'Install Unknown Apps' if disabled).</span>
                  </div>
                  <div className="bg-black/10 p-2.5 rounded-lg border border-[#24262f] flex gap-2.5 items-center">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                    <span className="text-[10.5px] text-gray-300">Open the app, sign in to your profile, and receive instant 65 FPS performance!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {platform === 'ios' && (
            <div className="space-y-3 text-left">
              <div className="bg-black/30 p-4 rounded-xl border border-[#24262f] space-y-4">
                <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono">
                  <span>Method: iOS Web PWA App</span>
                  <span className="text-cyan-400 font-bold border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-950/20">No App Store Required</span>
                </div>

                <div className="py-2 px-3 border border-yellow-600/30 bg-yellow-950/10 rounded-lg flex gap-2.5 text-[11px] leading-normal text-yellow-500">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Apple Safari constraints prevent direct files (.ipa) downloads. Install via Home Screen PWA to activate full client caching.</span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                    <div className="text-[11px] text-gray-300 leading-relaxed">
                      Tap the <strong className="text-white text-xs">"Share" <Share className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /></strong> button in your bottom Safari browser control panel.
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                    <div className="text-[11px] text-gray-300 leading-relaxed">
                      Scroll down options and select <strong className="text-white">"Add to Home Screen"</strong>.
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                    <div className="text-[11px] text-gray-300 leading-relaxed">
                      Launch the newly created <strong className="text-rose-400">CasinoHub icon</strong> directly off your iPhone menu screen!
                    </div>
                  </div>
                </div>

                <button
                  onClick={claimBonus}
                  disabled={rewardClaimed}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase text-center flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                    rewardClaimed
                      ? 'bg-black/40 text-gray-500 border border-gray-800'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-[1.01]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{rewardClaimed ? "KSh 1,000 Bonus Applied!" : "Open App & Claim KSh 1,000 iOS Setup Gift"}</span>
                </button>
              </div>
            </div>
          )}

          {platform === 'pc' && (
            <div className="space-y-3 text-left">
              <div className="bg-black/30 p-4 rounded-xl border border-[#24262f] space-y-4">
                <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono">
                  <span>Method: Chrome Desktop App</span>
                  <span className="text-amber-400 font-bold border border-amber-500/20 px-1.5 py-0.5 rounded bg-amber-950/20">Installs to desktop</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                  <p>
                    For PCs and Laptops running Chrome or Microsoft Edge, you can install CasinoHub as a standalone desktop shortcut.
                  </p>
                  <div className="bg-[#121319] p-3 rounded-lg border border-[#24262f] text-[11px] font-mono text-amber-200">
                    <div>1. Note the Address Bar on top of your browser</div>
                    <div>2. Click the <strong className="text-white">"Install App Screen" icon</strong> (displays next to the star/bookmark)</div>
                    <div>3. Hit "Install" in the drawer box that drops down</div>
                  </div>
                </div>

                <button
                  onClick={claimBonus}
                  disabled={rewardClaimed}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase text-center flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                    rewardClaimed
                      ? 'bg-black/40 text-gray-500 border border-gray-800'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-[1.01]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{rewardClaimed ? "KSh 1,000 Bonus Applied!" : "Claim KSh 1,000 PC Setup Bonus"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Verification seal */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-emerald-500 bg-emerald-950/15 py-2 rounded-xl border border-emerald-950/30">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Tested safe & fully authenticated on Android OS, Apple Safari & Chrome.</span>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-[#111217] border-t border-[#24262f] flex justify-between items-center text-[10.5px] uppercase shrink-0 px-4">
          <span className="text-gray-500 font-mono">Package Size: 12.4MB</span>
          <span className="text-[#00e600] font-black tracking-wide">Secure SSL Certified</span>
        </div>

      </div>
    </div>
  );
}
