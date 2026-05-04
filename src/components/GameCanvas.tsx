import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/Engine';
import { motion, AnimatePresence } from 'motion/react';

interface GameCanvasProps {
  onComplete: (time: number, rewinds: number) => void;
}

export function GameCanvas({ onComplete }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [activePower, setActivePower] = useState<'rewind' | 'slow'>('rewind');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    engineRef.current = new GameEngine();
    const engine = engineRef.current;

    let lastTime = performance.now();
    let animationFrameId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // max dt 100ms
      lastTime = time;

      // Update Native Canvas dimensions safely for PWA resizing
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Update Engine
      engine.update(dt);

      // --- RENDER ---
      // Clear with dark purple gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a0514');
      bgGrad.addColorStop(1, '#1c103f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera Follow Player
      ctx.save();
      const cameraX = Math.max(0, engine.player.x - canvas.width / 2);
      ctx.translate(-cameraX, 0);

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x = (cameraX % 50); x < canvas.width; x += 50) {
        ctx.moveTo(cameraX + x, 0);
        ctx.lineTo(cameraX + x, canvas.height);
      }
      for(let y = 0; y < canvas.height; y += 50) {
        ctx.moveTo(cameraX, y);
        ctx.lineTo(cameraX + canvas.width, y);
      }
      ctx.stroke();

      // Goal Area Glow
      if (1800 - cameraX < canvas.width) {
        const goalGrad = ctx.createLinearGradient(1800, 0, 1900, 0);
        goalGrad.addColorStop(0, 'rgba(0, 255, 255, 0)');
        goalGrad.addColorStop(1, 'rgba(0, 255, 255, 0.4)');
        ctx.fillStyle = goalGrad;
        ctx.fillRect(1800, 0, 200, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.fillText('TIMELINE ESCAPE', 1820, 300);
      }

      // Draw Entities
      for (const ent of engine.entities) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = ent.color;
        
        // Draw glitchy trails if rewinding
        if (engine.activeBubble && engine.activeBubble.type === 'rewind') {
            const dx = (ent.x + ent.w/2) - engine.activeBubble.x;
            const dy = (ent.y + ent.h/2) - engine.activeBubble.y;
            if (dx*dx + dy*dy < engine.activeBubble.radius * engine.activeBubble.radius) {
                if (ent.history.length > 5) {
                    const snap = ent.history[ent.history.length - 5];
                    ctx.globalAlpha = 0.4;
                    ctx.fillStyle = '#ff00ff'; // Glitch color
                    ctx.fillRect(snap.x - (Math.random()*4-2), snap.y, ent.w, ent.h);
                }
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = ent.color;
            }
        }

        // Draw Entity with Glow
        if (ent.type === 'player' || ent.type === 'enemy' || ent.type === 'moving_platform') {
            ctx.shadowColor = ent.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = ent.color;
            ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
        } else {
            // Static platform
            ctx.fillStyle = ent.color;
            ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
            ctx.strokeStyle = '#5a30bc';
            ctx.lineWidth = 2;
            ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
        }

        // Draw Player details
        if (ent.type === 'player') {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ent.x + 18, ent.y + 6, 6, 6);
          ctx.fillRect(ent.x + 8, ent.y + 6, 6, 6);
          // Trail line
          if (ent.history.length > 0) {
             ctx.beginPath();
             ctx.moveTo(ent.x + ent.w/2, ent.y + ent.h/2);
             for (let i = ent.history.length - 1; i >= Math.max(0, ent.history.length - 20); i -= 3) {
                ctx.lineTo(ent.history[i].x + ent.w/2, ent.history[i].y + ent.h/2);
             }
             ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
             ctx.lineWidth = 2;
             ctx.stroke();
          }
        }
      }

      // Draw Active Bubble
      if (engine.activeBubble) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(engine.activeBubble.x, engine.activeBubble.y, engine.activeBubble.radius, 0, Math.PI * 2);
        
        const rGrad = ctx.createRadialGradient(
           engine.activeBubble.x, engine.activeBubble.y, 0, 
           engine.activeBubble.x, engine.activeBubble.y, engine.activeBubble.radius
        );
        if (engine.activeBubble.type === 'rewind') {
            rGrad.addColorStop(0, 'rgba(255, 0, 255, 0.4)');
            rGrad.addColorStop(1, 'rgba(255, 0, 255, 0.05)');
            ctx.strokeStyle = '#ff00ff';
        } else {
            rGrad.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
            rGrad.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
            ctx.strokeStyle = '#00ffff';
        }
        
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // Check win condition
      if (engine.player.x > 1800) {
        onComplete(engine.score.timeUsed, engine.score.rewindsUsed);
        return; // Stop loop
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Event Listeners for Keyboard (Fallbacks)
    const handleKeyDown = (e: KeyboardEvent) => { engine.keys[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { engine.keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cameraX = Math.max(0, engineRef.current.player.x - rect.width / 2);
    
    const worldX = (e.clientX - rect.left) + cameraX;
    const worldY = e.clientY - rect.top;

    engineRef.current.setBubble(worldX, worldY, activePower);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!engineRef.current || !engineRef.current.activeBubble || !canvasRef.current) return;
     const rect = canvasRef.current.getBoundingClientRect();
     const cameraX = Math.max(0, engineRef.current.player.x - rect.width / 2);
     const worldX = (e.clientX - rect.left) + cameraX;
     const worldY = e.clientY - rect.top;
     engineRef.current.activeBubble.x = worldX;
     engineRef.current.activeBubble.y = worldY;
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    engineRef.current.clearBubble();
  };

  return (
    <div className="relative w-full h-full flex flex-col">
       <div className="absolute top-4 left-0 right-0 flex justify-center gap-4 z-10 glass px-4 py-2 mx-auto w-max rounded-full">
          <button 
            className={`px-4 py-1 rounded text-[10px] uppercase tracking-widest transition-all ${activePower === 'rewind' ? 'bg-[#f27d26] text-white' : 'text-white/50 hover:text-white'}`}
            onClick={() => setActivePower('rewind')}
            >
            Time Rewind
          </button>
          <button 
            className={`px-4 py-1 rounded text-[10px] uppercase tracking-widest transition-all ${activePower === 'slow' ? 'bg-[#8a2be2] text-white' : 'text-white/50 hover:text-white'}`}
             onClick={() => setActivePower('slow')}
            >
            Time Slow
          </button>
       </div>

       {/* Mobile Controls Layer */}
       <div className="absolute bottom-10 left-10 flex gap-4 z-10">
          <button 
             className="w-16 h-16 glass rounded-full flex items-center justify-center text-2xl border border-white/20 active:bg-white/10"
             onPointerDown={() => { if(engineRef.current) engineRef.current.keys['ArrowLeft'] = true; }}
             onPointerUp={() => { if(engineRef.current) engineRef.current.keys['ArrowLeft'] = false; }}
             onPointerLeave={() => { if(engineRef.current) engineRef.current.keys['ArrowLeft'] = false; }}
          >👈</button>
          <button 
             className="w-16 h-16 glass rounded-full flex items-center justify-center text-2xl border border-white/20 active:bg-white/10"
             onPointerDown={() => { if(engineRef.current) engineRef.current.keys['ArrowRight'] = true; }}
             onPointerUp={() => { if(engineRef.current) engineRef.current.keys['ArrowRight'] = false; }}
             onPointerLeave={() => { if(engineRef.current) engineRef.current.keys['ArrowRight'] = false; }}
          >👉</button>
       </div>
       <div className="absolute bottom-10 right-10 z-10">
           <button 
             className="w-20 h-20 glass bg-white/5 rounded-full flex items-center justify-center text-[10px] uppercase tracking-widest border border-white/20 active:bg-white/20 font-bold"
             onPointerDown={() => { if(engineRef.current) engineRef.current.keys['ArrowUp'] = true; }}
             onPointerUp={() => { if(engineRef.current) engineRef.current.keys['ArrowUp'] = false; }}
             onPointerLeave={() => { if(engineRef.current) engineRef.current.keys['ArrowUp'] = false; }}
          >JUMP</button>
       </div>

       <canvas 
        ref={canvasRef} 
        className="flex-1 w-full h-[60vh] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="text-center p-4 text-[#e0d8d0]/50 text-[10px] uppercase tracking-widest z-10 glass border-b-0 border-x-0 w-full mb-0 pb-6 mt-2">Tap & hold to create chronological manipulation bubble. Proceed to +1800 coordinates.</div>
    </div>
  );
}
