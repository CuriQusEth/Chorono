import { Entity, Vector2 } from './Entity';

export class GameEngine {
  entities: Entity[] = [];
  gravity = 800; // pixels per second squared
  player!: Entity;
  
  keys: Record<string, boolean> = {};
  
  // Power states
  activeBubble: { x: number, y: number, radius: number, type: 'rewind' | 'slow' } | null = null;

  score = {
    timeUsed: 0,
    rewindsUsed: 0
  };

  levelWidth = 2000;
  levelHeight = 1000;

  constructor() {
    this.initLevel();
  }

  initLevel() {
    this.entities = [];
    // Player
    this.player = new Entity('player', 'player', 100, 100, 30, 30, '#00f0ff');
    this.entities.push(this.player);

    // Ground
    this.entities.push(new Entity('g1', 'platform', 0, 800, 2000, 200, '#1a103c'));
    
    // Platforms
    this.entities.push(new Entity('p1', 'platform', 300, 600, 100, 20, '#3a208c'));
    this.entities.push(new Entity('p2', 'platform', 500, 500, 100, 20, '#3a208c'));
    this.entities.push(new Entity('p3', 'platform', 700, 400, 100, 20, '#3a208c'));
    
    // Moving Platform
    const mp = new Entity('mp1', 'moving_platform', 900, 400, 80, 20, '#f000ff');
    mp.vx = 150;
    this.entities.push(mp);
    
    // Obstacle / Enemy
    const en = new Entity('en1', 'enemy', 500, 770, 30, 30, '#ff0055');
    en.vx = 200;
    this.entities.push(en);
  }

  update(dt: number) {
    this.score.timeUsed += dt;

    // Movement resolution and bubbles
    for (const ent of this.entities) {
      if (ent.type === 'platform') continue;

      let timeScale = 1;
      let isRewinding = false;

      // Check if entity is in time bubble
      if (this.activeBubble) {
        const dx = (ent.x + ent.w/2) - this.activeBubble.x;
        const dy = (ent.y + ent.h/2) - this.activeBubble.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < this.activeBubble.radius) {
          if (this.activeBubble.type === 'rewind') {
            isRewinding = true;
          } else if (this.activeBubble.type === 'slow') {
            timeScale = 0.2;
          }
        }
      }

      if (isRewinding) {
        // Pop 2 frames to actively move backwards in history
        ent.restoreSnapshot(2);
      } else {
        const effDt = dt * timeScale;
        
        // Save snapshot
        ent.saveSnapshot();

        // Apply physics
        ent.vy += this.gravity * effDt;

        if (ent.type === 'player') {
          // Player input
          if (this.keys['ArrowLeft']) ent.vx = -300;
          else if (this.keys['ArrowRight']) ent.vx = 300;
          else ent.vx *= 0.8; // friction
          
          if (this.keys['ArrowUp'] && ent.vy === 0) { // simplistic grounded check later
            ent.vy = -500;
          }
        }

        if (ent.type === 'enemy') {
           // simple patrol
           if (ent.x > 800) ent.vx = -150;
           if (ent.x < 400) ent.vx = 150;
        }
        
        if (ent.type === 'moving_platform') {
           if (ent.x > 1200) ent.vx = -100;
           if (ent.x < 900) ent.vx = 100;
        }

        ent.x += ent.vx * effDt;
        ent.y += ent.vy * effDt;

        // Simplistic Floor Collision
        if (ent.y + ent.h > 800) {
          ent.y = 800 - ent.h;
          ent.vy = 0;
        }

        // Enemy collision
        if (ent.type === 'player') {
            for (const other of this.entities) {
                if (other.type === 'enemy') {
                    if (ent.x < other.x + other.w && ent.x + ent.w > other.x &&
                        ent.y < other.y + other.h && ent.y + ent.h > other.y) {
                        // Push back
                        ent.vx = -400;
                        ent.vy = -300;
                    }
                }
            }
        }

        // Platform collisions
        if (ent.type === 'player' || ent.type === 'enemy') {
           for (const plat of this.entities) {
               if (plat.type === 'platform' || plat.type === 'moving_platform') {
                   // AABB collision
                   if (ent.x < plat.x + plat.w && ent.x + ent.w > plat.x &&
                       ent.y < plat.y + plat.h && ent.y + ent.h > plat.y) {
                       
                       // resolve simple top collision
                       if (ent.vy > 0 && ent.y + ent.h - ent.vy * effDt <= plat.y) {
                           ent.y = plat.y - ent.h;
                           ent.vy = 0;
                           if (plat.type === 'moving_platform') {
                               ent.x += plat.vx * effDt; // stick to moving plat
                           }
                       }
                   }
               }
           }
        }
      }
    }
  }

  setBubble(x: number, y: number, type: 'rewind' | 'slow') {
    if (!this.activeBubble && type === 'rewind') {
       this.score.rewindsUsed++;
    }
    this.activeBubble = { x, y, radius: 150, type };
  }

  clearBubble() {
    this.activeBubble = null;
  }
}
