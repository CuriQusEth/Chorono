/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WagmiProvider, useAccount, useConnect, useSignMessage } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { motion, AnimatePresence } from 'motion/react';
import { GameCanvas } from './components/GameCanvas';
import { wagmiConfig, queryClient } from './lib/web3/config';
import { buildERC8021Transaction } from './lib/erc8021';

function GameUI() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
  const [score, setScore] = useState({ time: 0, rewinds: 0 });
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { signMessageAsync } = useSignMessage();

  const handleComplete = (time: number, rewinds: number) => {
    setScore({ time, rewinds });
    setGameState('complete');
  };

  const handleSIWE = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    try {
      // SIWE simple message signature
      const message = `Welcome to Chorono!\n\nYou achieved a time of ${score.time.toFixed(2)}s with ${score.rewinds} rewinds.\n\nSign this message to prove your timeline mastery on-chain.`;
      if (!address) throw new Error("No address");
      const signature = await signMessageAsync({ account: address, message });
      console.log("SIWE Signature:", signature);
      alert('Score successfully committed on-chain! (Simulated)');
    } catch (e) {
      console.error(e);
      alert('Signature failed.');
    }
  };

  const sayGM = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }
    // Simulate ERC-8021 Tx
    const txData = buildERC8021Transaction('0x0', '0x', 'SAY_GM');
    alert(`ERC-8021 Transaction created with attribution: ${txData.attribution}`);
  };

  return (
    <div className="w-full h-screen bg-[#050505] text-[#e0d8d0] flex flex-col items-center justify-center overflow-hidden touch-none font-sans relative">
      <div className="absolute inset-0 atmosphere pointer-events-none z-0"></div>
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-0"></div>
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center p-8 text-center z-10"
          >
            <h1 className="text-6xl font-serif italic mb-4 font-bold tracking-tighter text-white time-glitch">CHORONO</h1>
            <p className="text-xs uppercase tracking-widest leading-loose mb-8 text-[#e0d8d0]/60">Fracture Time. Rebuild Reality.</p>
            
            <button 
              className="px-8 py-3 border border-white/20 hover:border-white transition-all text-xs uppercase tracking-[0.2em] bg-transparent text-[#e0d8d0] mb-8"
              onClick={() => setGameState('playing')}
            >
              Start Timeline
            </button>

            <div className="flex gap-4 border-t border-white/10 pt-8 mt-12 w-full justify-center">
               {!isConnected ? (
                  <button 
                    onClick={() => connect({ connector: injected() })}
                    className="bg-white text-black px-6 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#f27d26] transition-colors"
                  >
                    Connect Wallet (Base)
                  </button>
               ) : (
                  <div className="text-[11px] font-mono tracking-wider flex items-center gap-4 glass px-4 py-2 rounded-full">
                     <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                     <button onClick={sayGM} className="bg-white text-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-[#f27d26] transition-colors rounded-full">Say GM on-chain</button>
                  </div>
               )}
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
             key="game"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="w-full h-full z-10"
          >
             <GameCanvas onComplete={handleComplete} />
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div 
             key="complete"
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col items-center glass p-12 rounded-2xl relative z-10 w-[90%] max-w-lg"
          >
             <h2 className="text-4xl font-serif italic mb-6 text-white text-center">TIMELINE SECURED</h2>
             
             <div className="grid grid-cols-2 gap-8 text-center mb-10 w-full">
                <div className="border border-white/10 p-6 rounded-lg bg-black/20">
                   <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-2">Time Elapsed</div>
                   <div className="text-3xl font-mono text-[#f27d26]">{score.time.toFixed(2)}s</div>
                </div>
                <div className="border border-white/10 p-6 rounded-lg bg-black/20">
                   <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-2">Rewinds Used</div>
                   <div className="text-3xl font-mono text-[#8a2be2]">{score.rewinds}</div>
                </div>
             </div>

             <button 
                onClick={handleSIWE}
                className="w-full py-3 bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-[#f27d26] transition-colors mb-4"
             >
                {isConnected ? 'Record Timeline (SIWE)' : 'Connect & Record Score'}
             </button>

             <button 
                onClick={() => setGameState('menu')}
                className="w-full py-3 border border-white/20 hover:border-white transition-all text-xs uppercase tracking-[0.2em] bg-transparent text-[#e0d8d0]"
             >
                Return to Codex
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GameUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
