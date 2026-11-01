import { useEffect, useRef, useState } from 'react'
import { animate, motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { config, type Contestant } from '../config'
import * as sfx from '../sound'
import { FaceGag, MoneyRain } from './Gags'
import { CrownSvg, Footprint, FlySvg, Polaroid, ScribbleCircle, ScribbleUnderline, SplatLayer, Starburst, Sticker, TILTS, TomatoSvg, type SplatData } from './Art'

/** Romanian number format: 1073 → 1.073 */
export function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function tierOf(rank: number, total: number) {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  if (rank === total) return 'last'
  return 'plain'
}

// paper-confetti colours: marker red, ballpoint blue, highlighter yellow, green, ink
const GOLD = ['#d42a1f', '#1f4fbf', '#ffd23f', '#2f8f46', '#1f1b16', '#ffffff']

// ── Paper background with faint pencil doodles ────────────────
export function Backdrop({ tier }: { tier: string }) {
  return (
    <div className={`backdrop tier-${tier}`}>
      <svg className="pencil" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <path d="M60 120 l14 -34 l14 34 l-36 -22 h44 z" />
        <path d="M1480 140 c20 -30 50 -30 60 0 s40 30 60 0" />
        <path d="M110 790 c30 -20 60 20 90 0 s60 20 90 0" />
        <path d="M1460 780 l12 -30 l12 30 l-32 -19 h40 z" />
        <circle cx="1530" cy="460" r="16" />
        <path d="M40 470 q20 -30 40 0 t40 0" />
        <path d="M760 860 q30 -14 60 0 t60 0" />
      </svg>
      <div className="paper-grain" />
      <div className="paper-edge" />
    </div>
  )
}

// ── Start screen ──────────────────────────────────────────────
// polaroids pinned around the title, in a mixed order so nothing hints at the ranking
const START_SPOTS = [
  { i: 3, left: '4%', top: '7%', tilt: -8 },
  { i: 0, left: '9%', top: '38%', tilt: 5 },
  { i: 5, left: '3%', top: '66%', tilt: -4 },
  { i: 1, left: '83%', top: '6%', tilt: 7 },
  { i: 4, left: '78%', top: '37%', tilt: -6 },
  { i: 2, left: '84%', top: '65%', tilt: 4 },
]

export function StartScreen({ onStart }: { onStart: () => void }) {
  const words = config.title.toUpperCase().split(' ')
  const wobble = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 2, -1, 1.5]
  return (
    <motion.div className="scene start" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}>
      {START_SPOTS.map((p, k) => {
        const c = config.contestants[p.i]
        if (!c) return null
        return (
          <motion.div
            key={k}
            className="start-pin"
            style={{ left: p.left, top: p.top }}
            initial={{ opacity: 0, scale: 1.6, rotate: p.tilt * 3 }}
            animate={{ opacity: 1, scale: 1, rotate: p.tilt }}
            transition={{ delay: 1.4 + k * 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Polaroid c={c} index={p.i} />
          </motion.div>
        )
      })}

      <motion.div className="start-kicker" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        gala anuală a
      </motion.div>
      <h1 className="start-title">
        {words.map((w, wi) => (
          <span className="start-word" key={wi}>
            {w.split('').map((ch, i) => (
              <motion.span
                key={i}
                style={{ rotate: wobble[(i + wi * 3) % wobble.length] }}
                initial={{ opacity: 0, scale: 2.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (wi * 10 + i) * 0.045, type: 'spring', stiffness: 500, damping: 22 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
      <div className="start-year">
        <motion.span initial={{ opacity: 0, rotate: -20, scale: 0.6 }} animate={{ opacity: 1, rotate: -5, scale: 1 }} transition={{ delay: 1.0, type: 'spring', stiffness: 200, damping: 12 }}>
          {config.year}
        </motion.span>
        <ScribbleCircle delay={1.3} duration={0.7} />
      </div>
      <motion.p className="tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 0.6 }}>
        <span className="hl" style={{ animationDelay: '2.2s' }}>
          {config.tagline}
        </span>
      </motion.p>
      <motion.button
        className="start-btn"
        onClick={(e) => {
          e.stopPropagation()
          onStart()
        }}
        initial={{ opacity: 0, y: 30, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ delay: 2.4, duration: 0.5 }}
        whileHover={{ rotate: 0, scale: 1.04 }}
        whileTap={{ x: 4, y: 4 }}
      >
        Începe gala →
      </motion.button>
      <motion.div className="start-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
        apasă <kbd>F</kbd> pentru ecran complet
      </motion.div>

      <div className="footprints">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="fp" style={{ left: `${3 + i * 7}%`, top: i % 2 ? '10px' : '40px', animationDelay: `${i * 0.28}s` }}>
            <Footprint flip={i % 2 === 1} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Regular build-up (places N → 2) ──────────────────────────
export function BuildUp({ rank, tier, onDone }: { rank: number; tier: string; onDone: () => void }) {
  useEffect(() => {
    const stop = sfx.drumRoll(config.suspenseMs)
    const t = setTimeout(onDone, config.suspenseMs)
    return () => {
      clearTimeout(t)
      stop()
    }
  }, [onDone])
  const secs = config.suspenseMs / 1000
  return (
    <motion.div className={`scene buildup tier-${tier}`} exit={{ opacity: 0, scale: 1.15 }} transition={{ duration: 0.35 }}>
      <motion.div className="bu-label" initial={{ opacity: 0, y: -20, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ duration: 0.4 }}>
        Locul
      </motion.div>
      <div className="bu-num-wrap">
        <motion.div
          className="bu-num"
          initial={{ scale: 3, opacity: 0, rotate: -12 }}
          animate={{ scale: [3, 1, 1.05, 1, 1.08, 1], opacity: 1, rotate: [-12, 2, -1, 1, -2, 0] }}
          transition={{ duration: secs, times: [0, 0.18, 0.45, 0.6, 0.85, 1], ease: 'easeOut' }}
        >
          {rank}
        </motion.div>
        <ScribbleCircle delay={0.25} duration={secs - 0.35} />
      </div>
      <Suspects rank={rank} />
      <div className="bu-walk">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            className="bu-step"
            style={{ left: `${i * 10}%`, top: i % 2 ? 0 : 22 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i / 10) * secs, duration: 0.15 }}
          >
            <Footprint flip={i % 2 === 1} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Everyone not revealed yet, sweating on the sides. Sorted by name so it gives nothing away.
function Suspects({ rank }: { rank: number }) {
  const left = config.contestants
    .map((c, i) => ({ c, i }))
    .slice(0, rank)
    .sort((a, b) => a.c.name.localeCompare(b.c.name))
  if (left.length < 2) return null
  const half = Math.ceil(left.length / 2)
  const cols = [left.slice(0, half), left.slice(half)]
  return (
    <>
      {cols.map((col, side) => (
        <div key={side} className={`suspects suspects-${side ? 'r' : 'l'}`}>
          {col.map(({ c, i }, k) => (
            <motion.div
              key={c.name}
              className="suspect"
              initial={{ opacity: 0, x: side ? 80 : -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + k * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <div className="suspect-shake" style={{ animationDelay: `${-(i * 0.13)}s` }}>
                <Polaroid c={c} index={i} tilt={TILTS[i]} tape={false}>
                  <FaceGag c={c} kind="sweat" />
                </Polaroid>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
      <motion.div className="suspects-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        cine o fi?? 😰
      </motion.div>
    </>
  )
}

// ── Winner build-up ───────────────────────────────────────────
export function WinnerBuildUp({ onDone }: { onDone: () => void }) {
  const dur = config.winnerSuspenseMs / 1000
  useEffect(() => {
    const stop = sfx.drumRoll(config.winnerSuspenseMs)
    const t = setTimeout(onDone, config.winnerSuspenseMs)
    return () => {
      clearTimeout(t)
      stop()
    }
  }, [onDone])
  const words = ['Iar', 'câștigătorul', 'este…']
  return (
    <motion.div className="scene winner-buildup" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div className="dim" initial={{ opacity: 0 }} animate={{ opacity: 0.94 }} transition={{ duration: 1 }} />
      <motion.div
        className="spot-beam"
        initial={{ rotate: -40, opacity: 0 }}
        animate={{ rotate: [-40, 32, -24, 14, -6, 0], opacity: [0, 1, 1, 1, 1, 1] }}
        transition={{ duration: dur * 0.9, ease: 'easeInOut', times: [0, 0.22, 0.44, 0.64, 0.82, 1] }}
      />
      <motion.div
        className="spot-floor"
        initial={{ x: '-60vw', opacity: 0 }}
        animate={{ x: ['-60vw', '46vw', '-34vw', '20vw', '-8vw', '0vw'], opacity: [0, 1, 1, 1, 1, 1], scale: [1, 1, 1, 1, 1.15, 1.5] }}
        transition={{ duration: dur * 0.9, ease: 'easeInOut', times: [0, 0.22, 0.44, 0.64, 0.82, 1] }}
      />
      <div className="wb-text">
        {words.map((w, i) => (
          <motion.span
            key={w}
            className={i === 1 ? 'wb-key' : ''}
            initial={{ opacity: 0, scale: 1.8, rotate: i % 2 ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, rotate: i % 2 ? 2 : -2 }}
            transition={{ delay: 1.2 + i * (dur * 0.17), type: 'spring', stiffness: 300, damping: 16 }}
          >
            {w}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="wb-pulse"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0, 0.7, 1], scale: [0.5, 0.5, 1, 1.6] }}
        transition={{ duration: dur, times: [0, 0.7, 0.9, 1] }}
      />
    </motion.div>
  )
}

// ── Count-up ──────────────────────────────────────────────────
export function CountUp({ value, delay, instant }: { value: number; delay: number; instant: boolean }) {
  const [n, setN] = useState(instant ? value : 0)
  const [landed, setLanded] = useState(false)
  useEffect(() => {
    if (instant) return
    const c = animate(0, value, {
      duration: 2.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setLanded(true),
    })
    return () => c.stop()
  }, [value, delay, instant])
  return (
    <motion.span
      className="countup"
      animate={landed ? { scale: [1, 1.3, 0.95, 1], rotate: [0, -4, 2, 0] } : undefined}
      transition={{ duration: 0.5 }}
    >
      {fmt(n)}
    </motion.span>
  )
}

// ── Tomato volley (last place) ────────────────────────────────
type Flying = { id: number; path: { x: number[]; y: number[] }; rot: number; dur: number; hit: { x: number; y: number } }

let nextId = 1

function useTomatoes(photoRef: React.RefObject<HTMLDivElement | null>, onHit: (rel: { x: number; y: number }) => void) {
  const [flying, setFlying] = useState<Flying[]>([])
  const throwOne = () => {
    const el = photoRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const side = Math.floor(Math.random() * 4)
    const from =
      side === 0
        ? { x: -120, y: Math.random() * vh }
        : side === 1
          ? { x: vw + 120, y: Math.random() * vh }
          : side === 2
            ? { x: Math.random() * vw, y: vh + 120 }
            : { x: Math.random() * vw, y: -120 }
    // land somewhere on the face
    const a = Math.random() * Math.PI * 2
    const d = 0.08 + Math.sqrt(Math.random()) * 0.34
    const rel = { x: 0.5 + Math.cos(a) * d, y: 0.5 + Math.sin(a) * d }
    const to = { x: r.left + rel.x * r.width, y: r.top + rel.y * r.height }
    const ctrl = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 180 - Math.random() * 160 }
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      xs.push((1 - t) ** 2 * from.x + 2 * (1 - t) * t * ctrl.x + t * t * to.x - 45)
      ys.push((1 - t) ** 2 * from.y + 2 * (1 - t) * t * ctrl.y + t * t * to.y - 45)
    }
    sfx.whoosh()
    setFlying((f) => [
      ...f,
      { id: nextId++, path: { x: xs, y: ys }, rot: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540), dur: 0.55 + Math.random() * 0.25, hit: rel },
    ])
  }
  const land = (t: Flying) => {
    setFlying((f) => f.filter((x) => x.id !== t.id))
    onHit(t.hit)
  }
  return { flying, throwOne, land }
}

function TomatoLayer({ flying, land }: { flying: Flying[]; land: (t: Flying) => void }) {
  return (
    <div className="tomato-layer">
      {flying.map((t) => (
        <motion.div
          key={t.id}
          className="tomato"
          initial={{ x: t.path.x[0], y: t.path.y[0], rotate: 0, scale: 1.3 }}
          animate={{ x: t.path.x, y: t.path.y, rotate: t.rot, scale: 0.85 }}
          transition={{ duration: t.dur, ease: 'linear' }}
          onAnimationComplete={() => land(t)}
        >
          <TomatoSvg />
        </motion.div>
      ))}
    </div>
  )
}

// ── Juice droplets burst on hit ───────────────────────────────
type Burst = { id: number; x: number; y: number }
function JuiceBurst({ b }: { b: Burst }) {
  const drops = useRef(
    Array.from({ length: 10 }, () => {
      const a = Math.random() * Math.PI * 2
      const d = 60 + Math.random() * 110
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d + 30, s: 6 + Math.random() * 12 }
    }),
  ).current
  return (
    <div className="juice" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}>
      {drops.map((d, i) => (
        <motion.span
          key={i}
          style={{ width: d.s, height: d.s }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: d.dx, y: d.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

const GAG_DELAY = 1.8 // seconds after the reveal before the face gag appears

/** Heads bob to the winner song. `startS` = seconds before it starts. */
function bobStyle(startS: number) {
  return { ['--beat2' as string]: `${120 / config.winnerSong.bpm}s`, ['--bob-start' as string]: `${startS}s` }
}

/** How far behind the person one place above, with a silly comparison. */
function gapTo(index: number) {
  const me = config.contestants[index]
  const above = config.contestants[index - 1]
  if (!me?.steps || !above?.steps) return null
  const steps = above.steps - me.steps
  const km = Math.round((steps * config.strideMeters) / 100) / 10
  const joke =
    km < 7.5 ? 'cât o plimbare prin mall' : km < 9 ? 'cât un drum la Kaufland și înapoi' : km < 15 ? 'cât o ieșire în oraș fără taxi' : km < 40 ? 'cât un drum până la bunica' : 'practic alt județ'
  return { steps, name: above.name, km: km.toString().replace('.', ','), joke }
}

// ── Reveal ────────────────────────────────────────────────────
type RevealProps = {
  c: Contestant
  index: number
  rank: number
  total: number
  instant: boolean
  splats: SplatData[]
  addSplat: (s: SplatData) => void
  shake: () => void
}

export function Reveal({ c, index, rank, total, instant, splats, addSplat, shake }: RevealProps) {
  const tier = tierOf(rank, total)
  const isLast = tier === 'last'
  const isWinner = tier === 'gold'
  const photoRef = useRef<HTMLDivElement>(null)
  const [hits, setHits] = useState(0)
  const [showMsg, setShowMsg] = useState(instant)
  const [bursts, setBursts] = useState<Burst[]>([])

  const { flying, throwOne, land } = useTomatoes(photoRef, (rel) => {
    sfx.splat()
    shake()
    addSplat({
      id: nextId++,
      x: rel.x,
      y: rel.y,
      rot: Math.random() * 360,
      size: 0.2 + Math.random() * 0.14,
      seed: Math.floor(Math.random() * 1e9),
      born: Date.now(),
    })
    const b = { id: nextId++, x: rel.x, y: rel.y }
    setBursts((bs) => [...bs, b])
    setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 800)
    setHits((h) => h + 1)
  })
  const throwRef = useRef(throwOne)
  throwRef.current = throwOne

  // pig noise when the snout pops on
  useEffect(() => {
    if (instant || c.gag !== 'pig') return
    const t = setTimeout(() => sfx.oink(), GAG_DELAY * 1000)
    return () => clearTimeout(t)
  }, [instant, c.gag])

  // sounds + effects on reveal
  useEffect(() => {
    if (instant) return
    if (isWinner) {
      sfx.crash()
      sfx.cheer()
    } else if (isLast) {
      sfx.crash()
    } else {
      sfx.crash()
      sfx.ding()
    }
  }, [instant, isWinner, isLast])

  // first tomato volley
  useEffect(() => {
    if (!isLast || instant) return
    const timers: number[] = []
    for (let i = 0; i < config.tomatoCount; i++) {
      timers.push(window.setTimeout(() => throwRef.current(), 1600 + i * 360 + Math.random() * 120))
    }
    return () => timers.forEach(clearTimeout)
  }, [isLast, instant])

  // show roast after the volley lands
  useEffect(() => {
    if (isLast && !showMsg && hits >= config.tomatoCount) {
      const t = setTimeout(() => {
        setShowMsg(true)
        sfx.sadTrombone()
      }, 500)
      return () => clearTimeout(t)
    }
  }, [hits, isLast, showMsg])

  const msg = isLast ? config.lastPlaceMessage : (c.quote ?? '')

  // quote timing (places 1–5)
  useEffect(() => {
    if (isLast || instant) return
    const t = setTimeout(() => setShowMsg(true), isWinner ? 2000 : 3200)
    return () => clearTimeout(t)
  }, [isLast, isWinner, instant])

  // pop sound when a quote bubble appears
  useEffect(() => {
    if (showMsg && !instant && !isLast && msg) sfx.pop()
  }, [showMsg, instant, isLast, msg])

  // safety net: if tomatoes get interrupted, still show the message
  useEffect(() => {
    if (!isLast || instant) return
    const t = setTimeout(() => setShowMsg(true), 1600 + config.tomatoCount * 360 + 2500)
    return () => clearTimeout(t)
  }, [isLast, instant])

  // T = more tomatoes
  useEffect(() => {
    if (!isLast) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 't' || e.repeat) return
      for (let i = 0; i < config.extraTomatoes; i++) setTimeout(() => throwRef.current(), i * 220)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLast])

  // winner confetti
  useEffect(() => {
    if (!isWinner) return
    const burst = () => {
      confetti({ particleCount: 180, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 0.45 }, colors: GOLD, scalar: 1.2 })
      confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors: GOLD, startVelocity: 70 })
      confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors: GOLD, startVelocity: 70 })
    }
    const t0 = window.setTimeout(burst, instant ? 0 : 150)
    const t1 = window.setTimeout(() => confetti({ particleCount: 120, spread: 160, startVelocity: 40, origin: { x: 0.5, y: 0.2 }, colors: GOLD, shapes: ['star'], scalar: 1.4 }), 900)
    const iv = window.setInterval(() => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: GOLD, startVelocity: 45, ticks: 260 })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: GOLD, startVelocity: 45, ticks: 260 })
      confetti({ particleCount: 2, spread: 360, startVelocity: 4, gravity: 0.5, origin: { x: Math.random(), y: -0.05 }, colors: GOLD, ticks: 400 })
    }, 120)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearInterval(iv)
      confetti.reset()
    }
  }, [isWinner, instant])

  const gap = gapTo(index)
  const tilt = TILTS[index % TILTS.length]!
  const photoInitial = instant
    ? false
    : isWinner
      ? { scale: 0, rotate: -40, opacity: 0 }
      : isLast
        ? { y: '-120vh', rotate: 25 }
        : { scale: 1.5, rotate: tilt * 6, opacity: 0, y: -40 }
  const photoTransition = isLast
    ? { type: 'spring' as const, stiffness: 140, damping: 11, mass: 1.2 }
    : isWinner
      ? { type: 'spring' as const, stiffness: 110, damping: 12 }
      : { type: 'spring' as const, stiffness: 220, damping: 16 }

  return (
    <motion.div className={`scene reveal tier-${tier}${showMsg && msg ? ' with-msg' : ''}`} exit={{ opacity: 0, x: -80, rotate: -2 }} transition={{ duration: 0.4 }}>
      {isWinner && <MoneyRain startDelay={instant ? 0 : 1} />}
      {isWinner && !instant && <motion.div className="flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} />}
      {!isWinner && (
        <motion.div className="place-label" initial={instant ? false : { opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          {isLast ? `Locul ${rank} — ultimul!` : `Locul ${rank}`}
          <ScribbleUnderline delay={0.4} instant={instant} />
        </motion.div>
      )}

      <div className="photo-stage">
        {isWinner && <Starburst delay={1.0} instant={instant} />}
        <motion.div ref={photoRef} className="photo-wrap" initial={photoInitial} animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }} transition={photoTransition}>
          <div className={`photo-idle${instant ? '' : ' delayed'}${isWinner ? ' bob' : ''}`} style={bobStyle(instant ? 0 : 1)}>
            <Polaroid c={c} index={index} tilt={tilt} caption={isWinner ? 'campionul!' : `#${rank}`}>
              {(!isLast || showMsg) && <FaceGag c={c} delay={isWinner ? 1.4 : isLast ? 0.3 : GAG_DELAY} instant={instant} />}
            </Polaroid>
            {isLast && <SplatLayer splats={splats} />}
            {bursts.map((b) => (
              <JuiceBurst key={b.id} b={b} />
            ))}
            {isWinner && (
              <div className="crown">
                <CrownSvg delay={instant ? 0 : 0.8} instant={instant} />
              </div>
            )}
            {(tier === 'silver' || tier === 'bronze') && (
              <motion.div className="sticker-pos" initial={instant ? false : { scale: 2.2, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 12, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 420, damping: 18 }}>
                <Sticker rank={rank} />
              </motion.div>
            )}
            {isLast && showMsg && (
              <div className="fly">
                <span>
                  <FlySvg />
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.h2 className="name" initial={instant ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: instant ? 0 : 0.5, type: 'spring', stiffness: 200, damping: 18 }}>
        {isWinner ? <span className="hl" style={{ animationDelay: '1.4s' }}>{c.name}</span> : c.name}
      </motion.h2>

      {c.steps != null && (
        <motion.div className="steps" initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: instant ? 0 : 0.9 }}>
          <span className="steps-num">
            <CountUp value={c.steps} delay={instant ? 0 : 0.9} instant={instant} />
          </span>
          <span className="steps-label">pași</span>
        </motion.div>
      )}

      {gap && (
        <motion.div className="gap-note" initial={instant ? false : { opacity: 0, scale: 1.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ delay: instant ? 0 : 3.2, type: 'spring', stiffness: 400, damping: 16 }}>
          la {fmt(gap.steps)} pași de {gap.name} · ≈ {gap.km} km, {gap.joke}
        </motion.div>
      )}

      <AnimatePresence>
        {showMsg && msg && isLast && (
          <motion.div
            className="stamp"
            initial={{ scale: 3, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            onAnimationComplete={() => shake()}
          >
            {msg}
          </motion.div>
        )}
        {showMsg && msg && !isLast && (
          <motion.div
            className="note"
            initial={instant ? false : { y: 60, opacity: 0, rotate: 6 }}
            animate={{ y: 0, opacity: 1, rotate: -1.5 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="tape tape-l" />
            <span className="tape tape-r" />
            <span className="note-quote">„</span>
            {msg.split(' ').map((w, i) => (
              <motion.span
                key={i}
                className="note-word"
                initial={instant ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.09, duration: 0.15 }}
              >
                {w}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isLast && <TomatoLayer flying={flying} land={land} />}
      {isLast && showMsg && (
        <motion.div className="tomato-hint" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.5 }}>
          apasă <kbd>T</kbd> pentru încă o rundă de roșii
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Final podium ──────────────────────────────────────────────
export function Final({ contestants, splats }: { contestants: Contestant[]; splats: SplatData[] }) {
  const total = contestants.length
  useEffect(() => {
    sfx.cheer()
    const t = setTimeout(() => {
      confetti({ particleCount: 150, spread: 120, origin: { x: 0.35, y: 0.5 }, colors: GOLD, shapes: ['square'] })
    }, 1700)
    return () => {
      clearTimeout(t)
      confetti.reset()
    }
  }, [])
  const podiumOrder = [1, 0, 2].filter((i) => i < total)
  const heights: Record<number, string> = { 0: '46%', 1: '34%', 2: '24%' }
  const rest = contestants.map((c, i) => ({ c, i })).slice(3)
  return (
    <motion.div className="scene final" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <MoneyRain count={22} />
      <motion.h2 className="final-title" initial={{ y: -30, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: -1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
        Clasament final
        <ScribbleUnderline delay={0.5} />
      </motion.h2>
      <div className="final-grid">
        <div className="podium">
          {podiumOrder.map((i) => {
            const c = contestants[i]!
            const rank = i + 1
            const tier = tierOf(rank, total)
            const delay = rank === 1 ? 1.1 : rank === 2 ? 0.7 : 0.3
            return (
              <div className={`pod-col tier-${tier}`} key={i}>
                <motion.div className="pod-person" initial={{ opacity: 0, y: -60, rotate: TILTS[i]! * 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: delay + 0.4, type: 'spring', stiffness: 220, damping: 15 }}>
                  <div className="pod-photo">
                    <div className="bob" style={{ ...bobStyle(0), animationDelay: `${-i * 0.2}s` }}>
                      <Polaroid c={c} index={i} tilt={TILTS[i]}>
                        <FaceGag c={c} instant />
                      </Polaroid>
                    </div>
                    {rank === 1 && (
                      <div className="crown small">
                        <CrownSvg delay={1.9} />
                      </div>
                    )}
                    {rank === total && <SplatLayer splats={splats} />}
                  </div>
                  <div className="pod-name">{c.name}</div>
                  {c.steps != null && <div className="pod-steps">{fmt(c.steps)} pași</div>}
                </motion.div>
                <motion.div className="pod-block" style={{ height: heights[i] }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay, duration: 0.6, ease: [0.3, 1.4, 0.5, 1] }}>
                  <span>{rank}</span>
                </motion.div>
              </div>
            )
          })}
        </div>
        <div className="board">
          {rest.map(({ c, i }, k) => {
            const rank = i + 1
            const isLast = rank === total
            return (
              <motion.div className={`row tier-${tierOf(rank, total)}`} key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 + k * 0.2, type: 'spring', stiffness: 180, damping: 18 }}>
                <span className="row-rank">{rank}.</span>
                <div className="row-photo">
                  <Polaroid c={c} index={i} tilt={TILTS[i]} tape={false}>
                    <FaceGag c={c} instant />
                  </Polaroid>
                  {isLast && <SplatLayer splats={splats} />}
                  {isLast && (
                    <div className="fly small">
                      <span>
                        <FlySvg />
                      </span>
                    </div>
                  )}
                </div>
                <span className="row-name">{c.name}</span>
                <span className="row-dots" />
                {c.steps != null && <span className="row-steps">{fmt(c.steps)}</span>}
                {isLast && (
                  <span className="row-tomato">
                    <TomatoSvg size={40} />
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
