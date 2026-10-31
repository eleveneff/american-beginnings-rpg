// world/kit.js — copied (not linked) from /workspace/shared/graphics-kit/helpers/rpg-helpers.js
// (kit distilled from Princess Explorer v3.6.6 and Captain Adventure v3.5), 2026-10-31, for v2.2.
// Kept: clock + sub-steps (F1), camera-relative input (F2), follow camera pieces (F3), fade latch (F4),
// save clamps, overlay visibility (F7). Skipped on purpose: makeGate (F9), the kit's migrate() (uses `ver`;
// this game's progress save uses `version` and is never touched by the world), preview camera helpers.
// Functions below are byte-for-byte the kit versions unless marked "AB:".
// ---------- time ----------
// One clock, three budgets: sim (capped, stable physics), walk (real time, sub-stepped), fx (wall clock).
export function makeClock() {
  let last = performance.now();
  return { tick() { const n = performance.now(); const raw = Math.max(0, (n - last) / 1000); last = n;
    return { raw, sim: Math.min(0.05, raw), walk: Math.min(0.15, raw), fx: Math.min(1, raw) }; } };
}
// Move with real elapsed time but collide in <= 0.05 s slices (no tunnelling, no slow-motion on slow phones).
export function subSteps(walkDt, maxStep = 0.05) { const n = Math.max(1, Math.ceil(walkDt / maxStep - 1e-6)); return { n, h: walkDt / n }; }

// ---------- angles / smoothing ----------
export const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
// rate-limited exponential follow toward a target angle; snaps if the jump is huge (teleport / reset)
export function followAngle(cur, target, dt, { k = 5, maxRate = 3, snapAbove = 2.6 } = {}) {
  const d = wrapA(target - cur); if (Math.abs(d) > snapAbove) return target;
  const step = Math.max(-maxRate * dt, Math.min(maxRate * dt, d * Math.min(1, dt * k))); return wrapA(cur + step);
}
// deadzone + latch follower: ignores small heading wiggles, follows big turns until re-aligned
export function makeDeadzoneYaw({ enter = 0.4, exit = 0.06, k = 2.6, maxRate = 1.9 } = {}) {
  let yaw = 0, following = false;
  return { get yaw() { return yaw; }, snap(a) { yaw = a; following = false; },
    step(heading, dt, moving = true) {
      if (!moving) { following = false; return yaw; }
      const err = wrapA(heading - yaw);
      if (!following && Math.abs(err) > enter) following = true;
      if (following) { yaw = wrapA(yaw + Math.max(-maxRate * dt, Math.min(maxRate * dt, err * Math.min(1, dt * k)))); if (Math.abs(wrapA(heading - yaw)) < exit) following = false; }
      return yaw; } };
}
// smoothed travel heading (~0.3 s average) from positions, so zig-zags don't swing the camera
export function makeTravelHeading(k = 3.5, minSpeed = 0.8) {
  let vx = 0, vz = 0, lx = null, lz = null;
  return { step(x, z, dt, fallbackYaw) { if (lx !== null && dt > 0) { const a = Math.min(1, dt * k); vx += ((x - lx) / dt - vx) * a; vz += ((z - lz) / dt - vz) * a; } lx = x; lz = z;
    return Math.hypot(vx, vz) > minSpeed ? Math.atan2(vx, vz) : fallbackYaw; }, reset() { vx = vz = 0; lx = lz = null; } };
}
// hold a discrete choice (camera side offset, music track, ...) for `hold` seconds unless forced
export function makeHeldChoice(hold = 0.7) {
  let v = 0, t = 0;
  return { get value() { return v; }, step(want, dt, force = false) { t = Math.max(0, t - dt); if (want !== v && (t <= 0 || force)) { v = want; t = hold; } return v; } };
}

// ---------- fading things between camera and player (hysteresis + hold + glide) ----------
export function makeFadeLatch({ hold = 1.0, down = 4.5, up = 2.2, low = 0.18 } = {}) {
  return function stepFade(state, enter, stay, dt) { // state: {faded, clr, a}
    if (state.a == null) state.a = 1;
    if (!state.faded) { if (enter) { state.faded = true; state.clr = 0; } }
    else if (stay) state.clr = 0; else if ((state.clr = (state.clr || 0) + dt) >= hold) state.faded = false;
    const target = state.faded ? low : 1, r = (state.a < target ? up : down) * dt;
    state.a = state.a < target ? Math.min(target, state.a + r) : Math.max(target, state.a - r); return state.a;
  };
}

// ---------- camera-relative controls ----------
// input (sx = right, sf = forward/screen-up) → world xz using the camera's ground-plane basis
export function camRelative(THREE, camera, target, sx, sf) {
  let fx = target.x - camera.position.x, fz = target.z - camera.position.z; const L = Math.hypot(fx, fz) || 1; fx /= L; fz /= L;
  return { x: sx * -fz + sf * fx, z: sx * fx + sf * fz };
}
// ---------- saves ----------
// clamp any counter read from a save: junk / negative / NaN / huge → sane integer
export const clampCount = (v, max = 1e6) => { v = Number(v); return Number.isFinite(v) && v > 0 ? Math.floor(Math.min(v, max)) : 0; };
export const ensureObj = (o, k) => { if (!o[k] || typeof o[k] !== 'object' || Array.isArray(o[k])) o[k] = {}; return o[k]; };
// ---------- overlays ----------
// a cleared but still-visible 2D canvas can stay composited stale (confetti frozen in screenshots): hide it when idle
export function syncOverlayVisibility(canvas, hasContent) { const v = hasContent ? '' : 'hidden'; if (canvas.style.visibility !== v) canvas.style.visibility = v; }
// AB: one z-index ladder matching style.css (world 0, stage 2, version 3, trays 4, topbar 5, modal 20, toast 30, drag ghost 50)
export const Z = { world: 0, stage: 2, version: 3, trays: 4, topbar: 5, worldHud: 8, prompt: 9, joystick: 10, buttons: 11, worldCard: 12, modal: 20, toast: 30, ghost: 50, fade: 60 };
