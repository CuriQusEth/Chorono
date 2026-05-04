export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Snapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type EntityType = 'player' | 'enemy' | 'platform' | 'moving_platform';

export class Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
  
  history: Snapshot[] = [];
  maxHistory = 600; // 10 seconds at 60fps

  constructor(id: string, type: EntityType, x: number, y: number, w: number, h: number, color: string) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
  }

  saveSnapshot() {
    this.history.push({ x: this.x, y: this.y, vx: this.vx, vy: this.vy });
    if (this.history.length > this.maxHistory) {
      this.history.shift(); // Remove oldest
    }
  }

  restoreSnapshot(stepsBack: number) {
    if (this.history.length === 0) return;
    // We don't just peek, we actually consume history to truly rewind
    for (let i = 0; i < stepsBack; i++) {
        if(this.history.length > 1) {
            this.history.pop();
        }
    }
    const snap = this.history[this.history.length - 1];
    this.x = snap.x;
    this.y = snap.y;
    this.vx = snap.vx;
    this.vy = snap.vy;
  }
}
