// Shared "runner" engine for the travel mini-games (Trade Winds, Birchbark Canoe, Post Rider).
// The player stays near local z=0 and steers left/right; the world (props, pickups, hazards) scrolls toward the camera.
// Screen-right is local -x (the camera looks along +z), so input x>0 moves the player to local -x.
import { THREE, clamp, lerp } from './lib.js';

export function makeRunner(ctx, cfg) {
  const { root } = ctx;
  const R = {
    px: 0, vx: 0, dist: 0, jumpT: 0, JUMP: 0.75, t: 0, speed: cfg.speed, objs: [], bumpT: 0, done: false,
    add(obj, o) { root.add(obj); const it = Object.assign({ obj, x: 0, z: 40, r: 0.6, kind: 'deco', y: 0 }, o); obj.position.set(it.x, it.y, it.z); R.objs.push(it); return it; },
    remove(it) { it.dead = true; root.remove(it.obj); },
    update(dt, inp) {
      R.t += dt; if (R.bumpT > 0) R.bumpT -= dt; if (R.jumpT > 0) R.jumpT = Math.max(0, R.jumpT - dt);
      const lat = cfg.lat || 5;
      R.vx = lerp(R.vx, -inp.x * lat, Math.min(1, dt * 8)); R.px = clamp(R.px + R.vx * dt, -cfg.W, cfg.W);
      const sp = R.speed * (R.bumpT > 0 ? 0.45 : 1); R.dist += sp * dt;
      if (cfg.spawn) cfg.spawn(dt, sp, R);
      for (const it of R.objs) {
        if (it.dead) continue;
        it.z -= sp * dt; it.obj.position.z = it.z;
        if (it.bob) it.obj.position.y = it.y + Math.sin(R.t * 3 + it.x) * it.bob;
        if (it.spin) it.obj.rotation.y += it.spin * dt;
        if (!it.hitDone && it.kind !== 'deco' && Math.abs(it.z) < (it.rz || 0.7) && Math.abs(it.x - R.px) < it.r + (cfg.pr || 0.45)) {
          it.hitDone = true;
          if (it.kind === 'bad') { if (R.jumpT > 0.08 && it.jumpable !== false) { cfg.onJump && cfg.onJump(it, R); } else if (R.bumpT <= 0) { R.bumpT = 0.9; cfg.onBad && cfg.onBad(it, R); } }
          else { cfg.onGood && cfg.onGood(it, R); if (!it.keep) R.remove(it); }
        }
        if (it.z < -9) R.remove(it);
      }
      if (R.objs.length > 60) R.objs = R.objs.filter(o => !o.dead);
      const p = cfg.player; p.position.x = R.px; p.position.y = (cfg.py ? cfg.py(R.px, 0) : 0) + (R.bumpT > 0 ? Math.abs(Math.sin(R.bumpT * 18)) * 0.08 : 0) + (R.jumpT > 0 ? Math.sin(Math.PI * R.jumpT / R.JUMP) * (cfg.jumpH || 0.9) : 0);
      p.rotation.z = clamp(R.vx * 0.05, -0.25, 0.25) * (cfg.lean || 1); p.rotation.y = clamp(-R.vx * 0.04, -0.2, 0.2);
    },
    jump() { if (R.jumpT <= 0) { R.jumpT = R.JUMP; return true; } return false; },
    // test autoplayer: pick the safest x a few metres ahead
    bot(lose) {   // lose: a careless player steers into hazards and misses the good things
      let best = R.px, bc = 1e9;
      for (let x = -cfg.W; x <= cfg.W + 1e-6; x += 0.25) {
        let c = Math.abs(x - R.px) * 0.6;
        for (const it of R.objs) { if (it.dead || it.hitDone || it.kind === 'deco' || it.z < -0.5 || it.z > 13) continue; const d = Math.abs(it.x - x);
          const sg = lose ? -1 : 1; if (it.kind === 'bad' && d < it.r + 0.9) c += sg * 100 / (1 + it.z * 0.3); if (it.kind === 'good' && d < it.r + 0.3) c -= sg * 8 / (1 + it.z * 0.2); }
        if (c < bc) { bc = c; best = x; }
      }
      const dx = best - R.px; return { x: Math.abs(dx) < 0.2 ? 0 : (dx > 0 ? -1 : 1) };
    },
  };
  return R;
}

// a long ground/water strip whose texture scrolls (gives speed even where the real level ground is static)
export function scrollStrip(ctx, { w, z0 = -10, z1 = 50, draw, rep = 6, y = 0.04, follow = false, opacity = 1, seg = 24 }) {
  const { kit } = ctx;
  const tex = kit.canvasTex(256, 256, draw); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, rep);
  const geo = new THREE.PlaneGeometry(w, z1 - z0, 4, seg); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, (z0 + z1) / 2);
  if (follow) { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) a.setY(i, ctx.gy(a.getX(i), a.getZ(i)) + y); geo.computeVertexNormals(); }
  else geo.translate(0, y, 0);
  const m = new THREE.Mesh(geo, kit.mat({ map: tex, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 })); m.receiveShadow = true; ctx.root.add(m);
  const per = (z1 - z0) / rep;
  return { mesh: m, tick(d) { tex.offset.y = -((d / per) % 1); } };
}
