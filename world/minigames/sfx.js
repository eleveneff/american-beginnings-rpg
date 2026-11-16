// Tiny WebAudio stingers for the 3D mini-games. No asset files. Mute is stored in sessionStorage
// (not the progress save). Silent when the world test flag __world.quiet is on, or the tab is hidden.
export function makeSfx() {
  let ac = null, master = null, mute = false;
  try { mute = sessionStorage.getItem('abrpg-mg-mute') === '1'; } catch (e) { }
  const silenced = () => mute || document.hidden || !!(window.__world && window.__world.quiet);
  function ctx() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.22; master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function env(node, t, dur, vol, a = 0.01) {
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur); node.connect(g); g.connect(master); node.start(t); node.stop(t + dur + 0.02);
  }
  function beep(freq, dur, type = 'sine', vol = 0.7, slide) {
    if (silenced()) return; try {
      const a = ctx(), t = a.currentTime, o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur); env(o, t, dur, vol);
    } catch (e) { }
  }
  function noise(dur, vol = 0.4, freq = 800) {
    if (silenced()) return; try {
      const a = ctx(), t = a.currentTime, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = a.createBufferSource(); src.buffer = buf;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; src.connect(f); env(f, t, dur, vol, 0.02);
    } catch (e) { }
  }
  return {
    get mute() { return mute; },
    setMute(on) { mute = !!on; try { sessionStorage.setItem('abrpg-mg-mute', mute ? '1' : '0'); } catch (e) { } },
    unlock() { if (silenced()) return; try { ctx(); } catch (e) { } },
    play(name) {
      if (silenced()) return;
      const t = {
        hit: () => beep(740, 0.11, 'triangle', 0.7),
        miss: () => beep(196, 0.16, 'square', 0.35, 110),
        win: () => { beep(523, 0.12, 'triangle', 0.6); setTimeout(() => beep(659, 0.12, 'triangle', 0.6), 90); setTimeout(() => beep(784, 0.22, 'triangle', 0.7), 180); },
        lose: () => beep(220, 0.28, 'sawtooth', 0.3, 110),
        whoosh: () => noise(0.22, 0.35, 1200),
        splash: () => noise(0.2, 0.4, 600),
        thunk: () => beep(130, 0.1, 'sine', 0.7),
        click: () => beep(720, 0.04, 'square', 0.25),
        fire: () => noise(0.28, 0.22, 400),
        hoof: () => beep(90, 0.07, 'sine', 0.45),
        wind: () => noise(0.35, 0.18, 900),
        paddle: () => noise(0.12, 0.28, 500),
        warn: () => beep(392, 0.12, 'triangle', 0.45),
        scoop: () => { noise(0.12, 0.3, 700); beep(620, 0.08, 'sine', 0.4); },
        jump: () => beep(300, 0.1, 'sine', 0.4, 520),
      };
      try { t[name] && t[name](); } catch (e) { }
    }
  };
}
