/**
 * MarioGame — a self-contained, pixel-art Mario-style side-scrolling platformer
 * rendered entirely with the Canvas 2D API (no images, no external game assets).
 *
 * The whole world (player, goombas, coins, pipes, brick platforms, parallax sky,
 * and a goal flag) is simulated in a mutable ref and drawn each frame via
 * requestAnimationFrame. React state is used only for the UI shell: the PLAY
 * overlay, the HUD (score / lives / coins), and the Game Over screen.
 *
 * Controls: Arrow keys / WASD to move, Space / Up / W to jump. On small screens
 * three on-screen touch buttons appear. No localStorage / sessionStorage is used.
 *
 * Drop it anywhere: <MarioGame className="..." />
 */
import { useEffect, useRef, useState } from "react";

// ---- Canvas + physics constants ----
const CANVAS_W = 480;
const CANVAS_H = 240;
const LEVEL_WIDTH = 2400;
const GROUND_Y = 200;
const GROUND_H = 40;

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PLAYER_SPEED = 2.5;
const MAX_FALL = 12;
const GOOMBA_SPEED = 0.5;

const PIPE_W = 34;
const PLATFORM_H = 14;

const SPAWN = { x: 30, y: 168, w: 14, h: 20 } as const;
const FLAG_X = 2320;

// ---- Hardcoded level data (positions in world space) ----
const PLATFORM_DATA: ReadonlyArray<{ x: number; y: number; w: number }> = [
  { x: 200, y: 160, w: 60 },
  { x: 300, y: 120, w: 50 },
  { x: 430, y: 150, w: 60 },
  { x: 560, y: 110, w: 50 },
  { x: 680, y: 140, w: 60 },
  { x: 820, y: 100, w: 50 },
  { x: 950, y: 150, w: 64 },
  { x: 1080, y: 120, w: 50 },
  { x: 1230, y: 95, w: 50 },
  { x: 1330, y: 140, w: 60 },
  { x: 1460, y: 110, w: 50 },
  { x: 1600, y: 150, w: 64 },
  { x: 1740, y: 120, w: 50 },
  { x: 1880, y: 100, w: 56 },
  { x: 2010, y: 140, w: 60 },
  { x: 2120, y: 110, w: 50 },
];

const PIPE_DATA: ReadonlyArray<{ x: number; h: number }> = [
  { x: 450, h: 40 },
  { x: 760, h: 52 },
  { x: 1200, h: 44 },
  { x: 1500, h: 60 },
  { x: 1800, h: 40 },
  { x: 2100, h: 50 },
];

// Ground goombas patrol a window; platform goombas patrol their platform.
const GOOMBA_DATA: ReadonlyArray<{
  x: number;
  y: number;
  min: number;
  max: number;
  dir: number;
}> = [
  { x: 380, y: 184, min: 330, max: 470, dir: 1 },
  { x: 700, y: 124, min: 680, max: 740, dir: -1 }, // on platform @680
  { x: 900, y: 184, min: 850, max: 990, dir: 1 },
  { x: 1240, y: 79, min: 1230, max: 1280, dir: 1 }, // on platform @1230
  { x: 1380, y: 184, min: 1330, max: 1470, dir: -1 },
  { x: 1620, y: 134, min: 1600, max: 1664, dir: 1 }, // on platform @1600
  { x: 1680, y: 184, min: 1620, max: 1770, dir: 1 },
  { x: 1900, y: 84, min: 1880, max: 1936, dir: -1 }, // on platform @1880
  { x: 2050, y: 184, min: 2000, max: 2140, dir: 1 },
];

const COIN_DATA: ReadonlyArray<[number, number]> = [
  [170, 150], [230, 130], [330, 90], [460, 120], [520, 150], [590, 80],
  [710, 110], [780, 140], [850, 70], [980, 120], [1050, 150], [1110, 90],
  [1240, 65], [1310, 150], [1370, 110], [1490, 80], [1560, 140], [1630, 120],
  [1770, 90], [1850, 150], [1910, 70], [2040, 110],
];

// ---- Types ----
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Player extends Rect {
  vx: number;
  vy: number;
  onGround: boolean;
  dir: number;
  prevJump: boolean;
}
interface Goomba extends Rect {
  vx: number;
  vy: number;
  dead: boolean;
  min: number;
  max: number;
  spawnX: number;
  spawnY: number;
  spawnDir: number;
}
interface Coin {
  x: number;
  y: number;
  collected: boolean;
}
interface World {
  player: Player;
  platforms: Rect[];
  pipes: Rect[];
  goombas: Goomba[];
  coins: Coin[];
  solids: Rect[];
  flagX: number;
  cameraX: number;
  frame: number;
  score: number;
  lives: number;
  coinCount: number;
  over: boolean;
}
interface Keys {
  left: boolean;
  right: boolean;
  jump: boolean;
}

// ---- World construction ----
function buildLevel() {
  const player: Player = {
    x: SPAWN.x,
    y: SPAWN.y,
    w: SPAWN.w,
    h: SPAWN.h,
    vx: 0,
    vy: 0,
    onGround: false,
    dir: 1,
    prevJump: false,
  };
  const ground: Rect = { x: 0, y: GROUND_Y, w: LEVEL_WIDTH, h: GROUND_H };
  const platforms: Rect[] = PLATFORM_DATA.map((p) => ({
    x: p.x,
    y: p.y,
    w: p.w,
    h: PLATFORM_H,
  }));
  const pipes: Rect[] = PIPE_DATA.map((p) => ({
    x: p.x,
    y: GROUND_Y - p.h,
    w: PIPE_W,
    h: p.h,
  }));
  const goombas: Goomba[] = GOOMBA_DATA.map((g) => ({
    x: g.x,
    y: g.y,
    w: 16,
    h: 16,
    vx: g.dir * GOOMBA_SPEED,
    vy: 0,
    dead: false,
    min: g.min,
    max: g.max,
    spawnX: g.x,
    spawnY: g.y,
    spawnDir: g.dir,
  }));
  const coins: Coin[] = COIN_DATA.map(([x, y]) => ({ x, y, collected: false }));
  const solids: Rect[] = [ground, ...platforms, ...pipes];
  return { player, platforms, pipes, goombas, coins, solids, flagX: FLAG_X };
}

function createWorld(): World {
  return {
    ...buildLevel(),
    cameraX: 0,
    frame: 0,
    score: 0,
    lives: 3,
    coinCount: 0,
    over: false,
  };
}

// Reached the flag: rebuild the level but keep the player's progress.
function resetLevelKeepProgress(world: World) {
  const lvl = buildLevel();
  world.player = lvl.player;
  world.platforms = lvl.platforms;
  world.pipes = lvl.pipes;
  world.goombas = lvl.goombas;
  world.coins = lvl.coins;
  world.solids = lvl.solids;
  world.flagX = lvl.flagX;
  world.cameraX = 0;
}

// Lost a life but still alive: return the player + enemies to their spawns.
function respawn(world: World) {
  const p = world.player;
  p.x = SPAWN.x;
  p.y = SPAWN.y;
  p.vx = 0;
  p.vy = 0;
  p.onGround = false;
  p.prevJump = false;
  p.dir = 1;
  world.cameraX = 0;
  for (const g of world.goombas) {
    g.x = g.spawnX;
    g.y = g.spawnY;
    g.vx = g.spawnDir * GOOMBA_SPEED;
    g.vy = 0;
    g.dead = false;
  }
}

function killPlayer(world: World) {
  world.lives -= 1;
  if (world.lives <= 0) {
    world.lives = 0;
    world.over = true;
    return;
  }
  respawn(world);
}

// ---- Physics ----
function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updateGoomba(g: Goomba, solids: Rect[]) {
  g.vy += GRAVITY;
  if (g.vy > MAX_FALL) g.vy = MAX_FALL;

  g.x += g.vx;
  for (const s of solids) {
    if (aabb(g, s)) {
      if (g.vx > 0) g.x = s.x - g.w;
      else if (g.vx < 0) g.x = s.x + s.w;
      g.vx = -g.vx;
    }
  }
  if (g.x < g.min) {
    g.x = g.min;
    g.vx = Math.abs(g.vx);
  }
  if (g.x + g.w > g.max) {
    g.x = g.max - g.w;
    g.vx = -Math.abs(g.vx);
  }

  g.y += g.vy;
  for (const s of solids) {
    if (aabb(g, s)) {
      if (g.vy > 0) g.y = s.y - g.h;
      else if (g.vy < 0) g.y = s.y + s.h;
      g.vy = 0;
    }
  }
}

function update(world: World, keys: Keys) {
  const p = world.player;
  world.frame += 1;

  // Horizontal input
  p.vx = 0;
  if (keys.left) {
    p.vx = -PLAYER_SPEED;
    p.dir = -1;
  }
  if (keys.right) {
    p.vx = PLAYER_SPEED;
    p.dir = 1;
  }
  // Jump on the rising edge only (one jump per press)
  if (keys.jump && p.onGround && !p.prevJump) p.vy = JUMP_FORCE;
  p.prevJump = keys.jump;

  // Gravity
  p.vy += GRAVITY;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;

  // Resolve X then Y against all solid rects (AABB, axis-separated)
  p.x += p.vx;
  for (const s of world.solids) {
    if (aabb(p, s)) {
      if (p.vx > 0) p.x = s.x - p.w;
      else if (p.vx < 0) p.x = s.x + s.w;
      p.vx = 0;
    }
  }
  if (p.x < 0) p.x = 0;

  p.y += p.vy;
  p.onGround = false;
  for (const s of world.solids) {
    if (aabb(p, s)) {
      if (p.vy > 0) {
        p.y = s.y - p.h;
        p.onGround = true;
      } else if (p.vy < 0) {
        p.y = s.y + s.h;
      }
      p.vy = 0;
    }
  }

  // Enemies
  for (const g of world.goombas) {
    if (!g.dead) updateGoomba(g, world.solids);
  }

  // Coins
  for (const c of world.coins) {
    if (c.collected) continue;
    if (
      p.x < c.x + 5 &&
      p.x + p.w > c.x - 5 &&
      p.y < c.y + 5 &&
      p.y + p.h > c.y - 5
    ) {
      c.collected = true;
      world.coinCount += 1;
      world.score += 100;
    }
  }

  // Goomba contact: stomp from above, otherwise die
  for (const g of world.goombas) {
    if (g.dead) continue;
    if (aabb(p, g)) {
      if (p.vy > 0 && p.y + p.h < g.y + g.h / 2 + 2) {
        g.dead = true;
        world.score += 200;
        p.vy = JUMP_FORCE * 0.5; // little bounce
      } else {
        killPlayer(world);
        return;
      }
    }
  }

  // Goal flag
  if (p.x + p.w >= world.flagX) {
    world.score += 1000;
    resetLevelKeepProgress(world);
    return;
  }

  // Safety: fell out of the world
  if (p.y > CANVAS_H + 20) {
    killPlayer(world);
    return;
  }

  // Camera: smooth lerp toward keeping the player a third in from the left
  let target = p.x - CANVAS_W / 3;
  if (target < 0) target = 0;
  if (target > LEVEL_WIDTH - CANVAS_W) target = LEVEL_WIDTH - CANVAS_W;
  world.cameraX += (target - world.cameraX) * 0.1;
}

// ---- Drawing helpers (pixel-art, programmatic) ----
function drawClouds(ctx: CanvasRenderingContext2D, off: number) {
  ctx.fillStyle = "#ffffff";
  const clouds = [60, 220, 360, 520, 700, 880];
  for (const base of clouds) {
    let cx = base - (off % 960);
    if (cx < -80) cx += 960;
    const cy = 30 + (base % 3) * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 4, 12, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy, 10, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy + 4, 11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx: CanvasRenderingContext2D, off: number) {
  ctx.fillStyle = "#4caf50";
  const hills = [40, 260, 470, 690, 900];
  for (const base of hills) {
    let hx = base - (off % 1100);
    if (hx < -120) hx += 1100;
    ctx.beginPath();
    ctx.arc(hx, GROUND_Y, 60, Math.PI, 0);
    ctx.fill();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cam: number) {
  // green top layer
  ctx.fillStyle = "#5bbf3a";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 10);
  // brown brick body
  ctx.fillStyle = "#9a5b2e";
  ctx.fillRect(0, GROUND_Y + 10, CANVAS_W, GROUND_H - 10);
  // mortar lines scrolling with the camera
  ctx.fillStyle = "#7a4322";
  const step = 20;
  const start = -(cam % step);
  for (let x = start; x < CANVAS_W; x += step) {
    ctx.fillRect(x, GROUND_Y + 10, 1, GROUND_H - 10);
  }
  ctx.fillRect(0, GROUND_Y + 24, CANVAS_W, 1);
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const bw = 16;
  const bh = 7;
  for (let ry = 0; ry < h; ry += bh) {
    for (let rx = 0; rx < w; rx += bw) {
      const odd = (Math.floor(ry / bh) + Math.floor(rx / bw)) % 2 === 0;
      ctx.fillStyle = odd ? "#c0563b" : "#a8412b";
      ctx.fillRect(x + rx, y + ry, Math.min(bw, w - rx), Math.min(bh, h - ry));
    }
  }
  // dark mortar grid
  ctx.fillStyle = "#5a1e16";
  for (let ry = 0; ry <= h; ry += bh) ctx.fillRect(x, y + Math.min(ry, h - 1), w, 1);
  for (let rx = 0; rx <= w; rx += bw) ctx.fillRect(x + Math.min(rx, w - 1), y, 1, h);
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // body (dark green) + light stripe on the left
  ctx.fillStyle = "#1f8a1f";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#46c846";
  ctx.fillRect(x + 4, y, 6, h);
  ctx.fillStyle = "#0f5a0f";
  ctx.fillRect(x + w - 6, y, 6, h);
  // top rim (slightly wider lip)
  ctx.fillStyle = "#1f8a1f";
  ctx.fillRect(x - 3, y, w + 6, 8);
  ctx.fillStyle = "#46c846";
  ctx.fillRect(x - 1, y + 1, 7, 6);
  ctx.fillStyle = "#0f5a0f";
  ctx.fillRect(x + w - 3, y + 1, 5, 6);
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#f7d51d";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d9a400";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#b8860b";
  ctx.stroke();
  // white glint
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 2, y - 3, 1, 3);
}

function drawGoomba(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  // body
  ctx.fillStyle = "#8b4a2b";
  ctx.fillRect(x + 1, y + 2, w - 2, h - 5);
  ctx.fillStyle = "#6b3720";
  ctx.fillRect(x + 1, y + 2, w - 2, 2);
  // eyes
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 3, y + 5, 3, 3);
  ctx.fillRect(x + w - 6, y + 5, 3, 3);
  ctx.fillStyle = "#000000";
  ctx.fillRect(x + 4, y + 6, 1, 2);
  ctx.fillRect(x + w - 5, y + 6, 1, 2);
  // alternating dark feet
  const f = Math.floor(frame / 8) % 2;
  ctx.fillStyle = "#3a1f12";
  ctx.fillRect(x + (f ? 2 : 0), y + h - 3, 5, 3);
  ctx.fillRect(x + w - 7 - (f ? 2 : 0), y + h - 3, 5, 3);
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dir: number) {
  // red hat + brim (brim points in facing direction)
  ctx.fillStyle = "#e11d2a";
  ctx.fillRect(x, y, w, 4);
  ctx.fillRect(dir > 0 ? x + w - 4 : x, y + 3, 5, 2);
  // skin-tone face
  ctx.fillStyle = "#f1c27d";
  ctx.fillRect(x + 2, y + 4, w - 4, 6);
  // eyes (black), shifted toward facing side
  ctx.fillStyle = "#000000";
  const eyeX = dir > 0 ? x + w - 6 : x + 4;
  ctx.fillRect(eyeX, y + 5, 2, 2);
  // red mustache
  ctx.fillStyle = "#7a1212";
  ctx.fillRect(x + 3, y + 8, w - 6, 2);
  // blue overalls
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(x + 1, y + 10, w - 2, h - 12);
  // brown shoes
  ctx.fillStyle = "#5a3010";
  ctx.fillRect(x, y + h - 2, 5, 2);
  ctx.fillRect(x + w - 5, y + h - 2, 5, 2);
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number) {
  // pole
  ctx.fillStyle = "#cfd3d6";
  ctx.fillRect(x, 60, 3, GROUND_Y - 60);
  ctx.fillStyle = "#9aa0a4";
  ctx.fillRect(x, 60, 1, GROUND_Y - 60);
  // ball on top
  ctx.fillStyle = "#00b3dc";
  ctx.beginPath();
  ctx.arc(x + 1.5, 58, 4, 0, Math.PI * 2);
  ctx.fill();
  // triangular flag (brand cyan)
  ctx.fillStyle = "#00b3dc";
  ctx.beginPath();
  ctx.moveTo(x + 3, 66);
  ctx.lineTo(x + 26, 73);
  ctx.lineTo(x + 3, 80);
  ctx.closePath();
  ctx.fill();
}

function render(ctx: CanvasRenderingContext2D, world: World) {
  const cam = world.cameraX;

  // sky
  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawClouds(ctx, cam * 0.4);
  drawHills(ctx, cam * 0.6);
  drawGround(ctx, cam);

  const onScreen = (wx: number, ww: number) => wx + ww - cam > -8 && wx - cam < CANVAS_W + 8;

  for (const p of world.platforms) {
    if (onScreen(p.x, p.w)) drawBrick(ctx, p.x - cam, p.y, p.w, p.h);
  }
  for (const pipe of world.pipes) {
    if (onScreen(pipe.x, pipe.w)) drawPipe(ctx, pipe.x - cam, pipe.y, pipe.w, pipe.h);
  }
  for (const c of world.coins) {
    if (c.collected || !onScreen(c.x - 5, 10)) continue;
    const bob = Math.sin(world.frame * 0.08 + c.x * 0.05) * 3;
    drawCoin(ctx, c.x - cam, c.y + bob);
  }
  if (onScreen(world.flagX, 30)) drawFlag(ctx, world.flagX - cam);
  for (const g of world.goombas) {
    if (g.dead || !onScreen(g.x, g.w)) continue;
    drawGoomba(ctx, g.x - cam, g.y, g.w, g.h, world.frame);
  }
  const p = world.player;
  drawPlayer(ctx, p.x - cam, p.y, p.w, p.h, p.dir);
}

// ---- Component ----
const FONT = "'Press Start 2P', monospace";

export default function MarioGame({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<World>(createWorld());
  const keysRef = useRef<Keys>({ left: false, right: false, jump: false });
  const startedRef = useRef(false);
  // Track last-synced HUD values so we only call setState on change.
  const hud = useRef({ score: 0, lives: 3, coins: 0 });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);

  // Load the pixel font + inject the mobile-only touch-controls media query once.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      .mg-touch { display: none; }
      @media (max-width: 600px) { .mg-touch { display: flex !important; } }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  // Draw the initial static frame so the level is visible behind the PLAY overlay.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) render(ctx, worldRef.current);
  }, []);

  // Keyboard input — attached to window, removed on cleanup.
  useEffect(() => {
    const set = (code: string, down: boolean): boolean => {
      const k = keysRef.current;
      switch (code) {
        case "ArrowLeft":
        case "KeyA":
          k.left = down;
          return true;
        case "ArrowRight":
        case "KeyD":
          k.right = down;
          return true;
        case "ArrowUp":
        case "KeyW":
        case "Space":
          k.jump = down;
          return true;
        default:
          return false;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (set(e.code, true) && startedRef.current) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (set(e.code, false) && startedRef.current) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Main game loop — runs only while playing; cancels rAF on cleanup.
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const loop = () => {
      const world = worldRef.current;
      update(world, keysRef.current);
      render(ctx, world);

      if (world.score !== hud.current.score) {
        hud.current.score = world.score;
        setScore(world.score);
      }
      if (world.lives !== hud.current.lives) {
        hud.current.lives = world.lives;
        setLives(world.lives);
      }
      if (world.coinCount !== hud.current.coins) {
        hud.current.coins = world.coinCount;
        setCoins(world.coinCount);
      }

      if (world.over) {
        startedRef.current = false;
        setGameOver(true);
        setGameStarted(false);
        return; // stop scheduling
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    worldRef.current = createWorld();
    keysRef.current = { left: false, right: false, jump: false };
    hud.current = { score: 0, lives: 3, coins: 0 };
    startedRef.current = true;
    setScore(0);
    setLives(3);
    setCoins(0);
    setGameOver(false);
    setGameStarted(true);
  };

  // Touch button helpers
  const hold = (key: keyof Keys, down: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    keysRef.current[key] = down;
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 24px 60px -24px rgba(0,0,0,0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "#5c94fc",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          imageRendering: "pixelated",
        }}
      />

      {/* HUD */}
      {gameStarted && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            fontFamily: FONT,
            fontSize: "clamp(7px, 1.6vw, 11px)",
            color: "#fff",
            textShadow: "2px 2px 0 rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          <span>SCORE {score}</span>
          <span>COINS {coins}</span>
          <span>LIVES {lives}</span>
        </div>
      )}

      {/* PLAY overlay */}
      {!gameStarted && !gameOver && (
        <Overlay>
          <button onClick={startGame} style={playButtonStyle} aria-label="Play the game">
            ▶ PLAY
          </button>
          <p style={overlayHintStyle}>Arrows / WASD to move · Space to jump</p>
        </Overlay>
      )}

      {/* Game Over */}
      {gameOver && (
        <Overlay>
          <p style={{ fontFamily: FONT, fontSize: "clamp(12px,3vw,20px)", color: "#fff", margin: 0 }}>
            GAME OVER
          </p>
          <p style={{ fontFamily: FONT, fontSize: "clamp(8px,1.8vw,11px)", color: "#00b3dc", margin: "14px 0 18px" }}>
            SCORE {score}
          </p>
          <button onClick={startGame} style={playButtonStyle} aria-label="Try again">
            TRY AGAIN
          </button>
        </Overlay>
      )}

      {/* Mobile touch controls (visible < 600px via injected media query) */}
      {gameStarted && !gameOver && (
        <div
          className="mg-touch"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "space-between",
            gap: 8,
            padding: 10,
            touchAction: "none",
          }}
        >
          <button
            style={touchButtonStyle}
            onPointerDown={hold("left", true)}
            onPointerUp={hold("left", false)}
            onPointerLeave={hold("left", false)}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Move left"
          >
            ◀
          </button>
          <button
            style={touchButtonStyle}
            onPointerDown={hold("jump", true)}
            onPointerUp={hold("jump", false)}
            onPointerLeave={hold("jump", false)}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Jump"
          >
            ▲
          </button>
          <button
            style={touchButtonStyle}
            onPointerDown={hold("right", true)}
            onPointerUp={hold("right", false)}
            onPointerLeave={hold("right", false)}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Move right"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Small presentational helpers ----
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

const playButtonStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "clamp(10px, 2.2vw, 14px)",
  color: "#fff",
  background: "#e11d2a",
  border: "3px solid #fff",
  borderRadius: 8,
  padding: "14px 22px",
  cursor: "pointer",
  boxShadow: "0 6px 0 #7a1212",
};

const overlayHintStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "clamp(6px, 1.4vw, 9px)",
  color: "rgba(255,255,255,0.85)",
  marginTop: 18,
  lineHeight: 1.8,
};

const touchButtonStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 52,
  fontSize: 22,
  color: "#fff",
  background: "rgba(0,0,0,0.5)",
  border: "2px solid rgba(255,255,255,0.6)",
  borderRadius: 10,
  cursor: "pointer",
};
