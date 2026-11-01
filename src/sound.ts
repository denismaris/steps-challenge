// All sound effects are synthesized with the Web Audio API — no audio files.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
let muted = false
const VOLUME = 0.75

let unlocked = false

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : VOLUME
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp)
    comp.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state !== 'running') void ctx.resume()
  if (!unlocked) {
    unlocked = true
    // Safari only unlocks audio during a click/keypress: play a silent blip now
    const b = ctx.createBufferSource()
    b.buffer = ctx.createBuffer(1, 1, 22050)
    b.connect(ctx.destination)
    b.start(0)
    // ...and "touch" the song element so it may play later from a timer
    if (songSrc) {
      song = new Audio(songSrc)
      song.preload = 'auto'
      song.muted = true
      void song.play().then(() => { song!.pause(); song!.muted = muted }).catch(() => {})
    }
  }
}

let songSrc = ''
/** Call once at startup so the song can be unlocked on the first click. */
export function prepareSong(src: string) {
  songSrc = src
}

// unlock / wake audio on every user interaction (Safari suspends it easily)
for (const ev of ['pointerdown', 'keydown', 'touchend']) {
  window.addEventListener(ev, () => initAudio(), { capture: true })
}

export function isMuted() {
  return muted
}

export function setMuted(m: boolean) {
  muted = m
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.03)
  if (song) song.muted = m
}

// ---- winner song (a real audio file, not synthesized) ----
let song: HTMLAudioElement | null = null
let fadeTimer = 0

export function playSong(src: string, startAt: number, volume: number) {
  clearInterval(fadeTimer)
  if (!song) {
    song = new Audio(src)
    song.preload = 'auto'
  }
  void song.pause()
  song.muted = muted
  song.volume = volume
  song.currentTime = startAt
  void song.play().catch(() => {}) // missing file or blocked → stay silent
}

export function stopSong(fadeMs = 1200) {
  const s = song
  if (!s || s.paused) return
  clearInterval(fadeTimer)
  const step = s.volume / (fadeMs / 50)
  fadeTimer = window.setInterval(() => {
    s.volume = Math.max(0, s.volume - step)
    if (s.volume <= 0.001) {
      clearInterval(fadeTimer)
      s.pause()
    }
  }, 50)
}

type NoiseOpts = {
  type?: BiquadFilterType
  freq?: number
  q?: number
  gain?: number
  attack?: number
  dur?: number
  dest?: AudioNode
}

function noise(t: number, o: NoiseOpts) {
  if (!ctx || !noiseBuf || !master) return
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = o.type ?? 'bandpass'
  f.frequency.value = o.freq ?? 1000
  f.Q.value = o.q ?? 1
  const g = ctx.createGain()
  const dur = o.dur ?? 0.2
  const atk = o.attack ?? 0.003
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.5, t + atk)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(o.dest ?? master)
  src.start(t, Math.random() * 1.5)
  src.stop(t + dur + 0.05)
  return f
}

function tone(
  t: number,
  freq: number,
  dur: number,
  { type = 'sine' as OscillatorType, gain = 0.3, endFreq = 0, attack = 0.01, dest = undefined as AudioNode | undefined } = {},
) {
  if (!ctx || !master) return
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(dest ?? master)
  o.start(t)
  o.stop(t + dur + 0.05)
  return o
}

/** Snare roll that speeds up and gets louder. Returns a stop function. */
export function drumRoll(durationMs: number): () => void {
  if (!ctx || !master) return () => {}
  const bus = ctx.createGain()
  bus.connect(master)
  const start = ctx.currentTime + 0.02
  const end = start + durationMs / 1000
  let t = start
  while (t < end) {
    const p = (t - start) / (end - start)
    const gain = 0.08 + 0.5 * p * p
    noise(t, { type: 'bandpass', freq: 1800 + Math.random() * 400, q: 0.8, gain, dur: 0.07, dest: bus })
    tone(t, 190 + Math.random() * 20, 0.05, { type: 'triangle', gain: gain * 0.5, dest: bus })
    t += 0.075 - 0.04 * p + (Math.random() - 0.5) * 0.01
  }
  return () => {
    if (!ctx) return
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
    setTimeout(() => bus.disconnect(), 400)
  }
}

export function crash() {
  if (!ctx) return
  const t = ctx.currentTime
  noise(t, { type: 'highpass', freq: 5000, q: 0.5, gain: 0.6, dur: 1.8 })
  noise(t, { type: 'bandpass', freq: 400, q: 0.7, gain: 0.6, dur: 0.25 })
  tone(t, 70, 0.4, { gain: 0.6, endFreq: 40 })
}

export function ding() {
  if (!ctx) return
  const t = ctx.currentTime
  tone(t, 1046.5, 1.4, { gain: 0.18 })
  tone(t, 1568, 1.1, { gain: 0.1 })
  tone(t + 0.08, 1318.5, 1.2, { gain: 0.12 })
  noise(t, { type: 'highpass', freq: 6000, gain: 0.08, dur: 0.6 })
}

export function whoosh() {
  if (!ctx) return
  const t = ctx.currentTime
  const f = noise(t, { type: 'bandpass', freq: 400, q: 2, gain: 0.25, attack: 0.15, dur: 0.4 })
  f?.frequency.exponentialRampToValueAtTime(2600, t + 0.4)
}

export function splat() {
  if (!ctx) return
  const t = ctx.currentTime
  noise(t, { type: 'lowpass', freq: 900 + Math.random() * 300, q: 1, gain: 0.9, dur: 0.22 })
  noise(t + 0.02, { type: 'bandpass', freq: 2500, q: 1.5, gain: 0.2, dur: 0.12 })
  tone(t, 220, 0.18, { gain: 0.45, endFreq: 55, type: 'sine' })
}

/** The classic "wah wah wah waaah". */
export function sadTrombone() {
  if (!ctx || !master) return
  const t0 = ctx.currentTime + 0.05
  const notes = [293.66, 277.18, 261.63, 246.94]
  notes.forEach((f, i) => {
    const t = t0 + i * 0.5
    const dur = i === 3 ? 1.5 : 0.45
    const o = ctx!.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f, t)
    if (i === 3) {
      const lfo = ctx!.createOscillator()
      const lg = ctx!.createGain()
      lfo.frequency.value = 5.5
      lg.gain.value = 6
      lfo.connect(lg).connect(o.frequency)
      lfo.start(t)
      lfo.stop(t + dur)
    }
    const lp = ctx!.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(500, t)
    lp.frequency.linearRampToValueAtTime(1400, t + 0.12)
    lp.frequency.linearRampToValueAtTime(600, t + dur)
    const g = ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.05)
    g.gain.setValueAtTime(0.22, t + dur - 0.1)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(lp).connect(g).connect(master!)
    o.start(t)
    o.stop(t + dur + 0.05)
  })
}

/** Fanfare + crowd cheer. */
export function cheer() {
  if (!ctx) return
  const t = ctx.currentTime
  // fanfare
  const fan = [
    [523.25, 0, 0.18],
    [659.25, 0.15, 0.18],
    [783.99, 0.3, 0.18],
    [1046.5, 0.45, 1.4],
  ]
  for (const [f, d, len] of fan) {
    tone(t + d, f, len, { type: 'triangle', gain: 0.2 })
    tone(t + d, f * 2, len, { type: 'sine', gain: 0.05 })
  }
  tone(t + 0.45, 523.25, 1.4, { type: 'triangle', gain: 0.12 })
  tone(t + 0.45, 659.25, 1.4, { type: 'triangle', gain: 0.1 })
  // crowd: layers of band-passed noise with wobbling volume
  for (let i = 0; i < 6; i++) {
    noise(t + Math.random() * 0.3, {
      type: 'bandpass',
      freq: 700 + Math.random() * 2200,
      q: 1.2,
      gain: 0.12,
      attack: 0.35,
      dur: 3.2 + Math.random(),
    })
  }
  // whistles
  for (let i = 0; i < 3; i++) {
    const s = t + 0.4 + i * 0.6 + Math.random() * 0.3
    tone(s, 1800 + Math.random() * 400, 0.35, { gain: 0.04, endFreq: 2600 + Math.random() * 400 })
  }
}

/** Bubbly pop for speech bubbles. */
export function pop() {
  if (!ctx) return
  const t = ctx.currentTime
  tone(t, 420, 0.12, { gain: 0.35, endFreq: 1300 })
  tone(t + 0.06, 900, 0.1, { gain: 0.15, endFreq: 1800, type: 'triangle' })
  noise(t, { type: 'bandpass', freq: 3000, q: 2, gain: 0.08, dur: 0.05 })
}

/** Pig "oink": two nasal grunts. */
export function oink() {
  if (!ctx || !master) return
  const t0 = ctx.currentTime
  for (const [d, f] of [[0, 260], [0.28, 300]] as const) {
    const t = t0 + d
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 0.62, t + 0.22)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 900
    bp.Q.value = 3
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    o.connect(bp).connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.3)
    noise(t, { type: 'bandpass', freq: 600, q: 2, gain: 0.15, dur: 0.18 })
  }
}
