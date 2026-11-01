// Hand-drawn SVG art: tomato, splats, crown, footprints, medal.
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { asset, type Contestant } from '../config'

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['#f7b733', '#fc4a1a'],
  ['#6a82fb', '#fc5c7d'],
  ['#11998e', '#38ef7d'],
  ['#8e2de2', '#4a00e0'],
  ['#00c6ff', '#0072ff'],
  ['#f857a6', '#ff5858'],
]

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/** Circle-cropped photo (centered cover crop) with an initials fallback. */
export function Avatar({ c, index }: { c: Contestant; index: number }) {
  const [failed, setFailed] = useState(false)
  if (c.photo && !failed) {
    return <img className="avatar-img" src={asset(c.photo)} alt={c.name} draggable={false} onError={() => setFailed(true)} />
  }
  const [a, b] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]!
  return (
    <div className="avatar-fallback" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <span>{initials(c.name)}</span>
    </div>
  )
}

// ── Tomato ────────────────────────────────────────────────────
export function TomatoSvg({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="tom-body" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ff7a5c" />
          <stop offset="45%" stopColor="#e8261c" />
          <stop offset="100%" stopColor="#8f0d0a" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="56" rx="42" ry="38" fill="url(#tom-body)" stroke="#5e0806" strokeWidth="3" />
      <path d="M30 40 Q50 30 70 40" stroke="#b5140f" strokeWidth="2" fill="none" opacity=".5" />
      <ellipse cx="34" cy="42" rx="10" ry="6" fill="#fff" opacity=".55" transform="rotate(-30 34 42)" />
      <circle cx="28" cy="52" r="2.5" fill="#fff" opacity=".5" />
      <path
        d="M50 24 L56 14 L58 26 L72 22 L62 31 L72 38 L57 35 L50 44 L44 35 L28 38 L38 31 L28 22 L42 26 L44 14 Z"
        fill="#3fae3a"
        stroke="#1f6b1c"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M50 26 Q49 16 54 8" stroke="#1f6b1c" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// ── Splat ─────────────────────────────────────────────────────
function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function splatShape(seed: number) {
  const r = rng(seed)
  const pts: [number, number][] = []
  const n = 16
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const spike = r() < 0.35
    const rad = spike ? 38 + r() * 14 : 22 + r() * 10
    pts.push([50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad])
  }
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = pts[i]!
    const q = pts[(i + 1) % n]!
    const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
    d += i === 0 ? `M${mid[0]},${mid[1]} ` : ''
    d += `Q${q[0]},${q[1]} ${(q[0] + pts[(i + 2) % n]![0]) / 2},${(q[1] + pts[(i + 2) % n]![1]) / 2} `
  }
  const drops = Array.from({ length: 6 }, () => {
    const a = r() * Math.PI * 2
    const dist = 44 + r() * 14
    return { x: 50 + Math.cos(a) * dist, y: 50 + Math.sin(a) * dist, r: 2 + r() * 4 }
  })
  const seeds = Array.from({ length: 5 }, () => ({
    x: 38 + r() * 24,
    y: 38 + r() * 24,
    rot: r() * 180,
  }))
  const drip = { x: 40 + r() * 20, len: 14 + r() * 18 }
  return { d, drops, seeds, drip }
}

export type SplatData = { id: number; x: number; y: number; rot: number; size: number; seed: number; born: number }

export function Splat({ s }: { s: SplatData }) {
  const shape = useMemo(() => splatShape(s.seed), [s.seed])
  const fresh = Date.now() - s.born < 600
  return (
    <motion.div
      className="splat"
      style={{
        left: `${s.x * 100}%`,
        top: `${s.y * 100}%`,
        width: `${s.size * 100}%`,
        height: `${s.size * 100}%`,
        rotate: s.rot,
        x: "-50%",
        y: "-50%",
      }}
      initial={fresh ? { scale: 0.2, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <path
          d={`M${shape.drip.x - 4},60 L${shape.drip.x - 3},${70 + shape.drip.len} Q${shape.drip.x},${76 + shape.drip.len} ${shape.drip.x + 3},${70 + shape.drip.len} L${shape.drip.x + 4},60 Z`}
          fill="#c4170f"
        />
        <path d={shape.d} fill="#d91e14" stroke="#8a0b06" strokeWidth="2.5" />
        <path d={shape.d} fill="#ff5a3c" opacity=".55" transform="translate(50 50) scale(.55) translate(-50 -50)" />
        {shape.drops.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#d91e14" stroke="#8a0b06" strokeWidth="1.2" />
        ))}
        {shape.seeds.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx="2.6" ry="1.5" fill="#ffe08a" transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
        ))}
        <ellipse cx="42" cy="40" rx="7" ry="4" fill="#fff" opacity=".35" transform="rotate(-25 42 40)" />
      </svg>
    </motion.div>
  )
}

export function SplatLayer({ splats }: { splats: SplatData[] }) {
  return (
    <div className="splat-layer">
      {splats.map((s) => (
        <Splat key={s.id} s={s} />
      ))}
    </div>
  )
}

// ── Hand-drawn doodles ────────────────────────────────────────
type DrawProps = { delay?: number; duration?: number; instant?: boolean; className?: string }

/** A loose marker circle that draws itself around whatever it sits on. */
export function ScribbleCircle({ delay = 0, duration = 0.8, instant = false, className = '' }: DrawProps) {
  return (
    <svg className={`doodle scribble-circle ${className}`} viewBox="0 0 200 120" preserveAspectRatio="none">
      <motion.path
        d="M 38 30 C 70 8, 160 6, 186 42 C 206 72, 150 112, 92 110 C 34 108, 4 84, 14 56 C 22 32, 70 14, 128 18"
        initial={instant ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration, ease: 'easeInOut' }}
      />
    </svg>
  )
}

export function ScribbleUnderline({ delay = 0, duration = 0.5, instant = false, className = '' }: DrawProps) {
  return (
    <svg className={`doodle scribble-underline ${className}`} viewBox="0 0 200 24" preserveAspectRatio="none">
      <motion.path d="M 4 14 C 50 6, 120 18, 196 8" initial={instant ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration, ease: 'easeOut' }} />
      <motion.path
        d="M 30 20 C 80 14, 130 22, 180 15"
        initial={instant ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + duration * 0.8, duration: duration * 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

/** Short marker strokes radiating out — the "look here!" doodle. */
export function Starburst({ delay = 0, instant = false, className = '' }: DrawProps) {
  const lines = useMemo(() => {
    const r = rng(7)
    // skip the bottom of the circle so the lines don't run into the name
    return Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2 + (r() - 0.5) * 0.2)
      .filter((a) => a < Math.PI * 0.22 || a > Math.PI * 0.78)
      .map((a) => {
      const r1 = 80 + r() * 6
      const r2 = 92 + r() * 8
        return `M ${100 + Math.cos(a) * r1} ${100 + Math.sin(a) * r1} L ${100 + Math.cos(a) * r2} ${100 + Math.sin(a) * r2}`
      })
  }, [])
  return (
    <svg className={`doodle starburst ${className}`} viewBox="0 0 200 200">
      {lines.map((d, i) => (
        <motion.path key={i} d={d} initial={instant ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay + i * 0.04, duration: 0.2 }} />
      ))}
    </svg>
  )
}

/** Crown drawn in marker, then coloured in. */
export function CrownSvg({ delay = 0, instant = false }: DrawProps) {
  return (
    <svg className="doodle crown-doodle" viewBox="-6 -6 132 92" width="100%" height="100%">
      <motion.path
        d="M12 70 L5 20 L33 43 L60 8 L87 43 L115 20 L108 70 Z"
        className="crown-fill"
        initial={instant ? false : { pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ pathLength: { delay, duration: 0.7 }, fillOpacity: { delay: delay + 0.6, duration: 0.3 } }}
      />
      <motion.path d="M14 60 C 45 55, 75 63, 106 58" initial={instant ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay + 0.7, duration: 0.3 }} />
      {[
        [5, 18],
        [60, 6],
        [115, 18],
      ].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5" className="crown-dot" initial={instant ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.8 + i * 0.08 }} />
      ))}
    </svg>
  )
}

/** Ink-drawn fly. Its head points up. */
export function FlySvg() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" className="fly-svg">
      <ellipse className="wing wing-l" cx="13" cy="20" rx="8" ry="11" />
      <ellipse className="wing wing-r" cx="27" cy="20" rx="8" ry="11" />
      <ellipse cx="20" cy="22" rx="5" ry="9" fill="#1f1b16" />
      <circle cx="20" cy="11" r="4.5" fill="#1f1b16" />
      <circle cx="17.5" cy="10" r="1.6" fill="#d42a1f" />
      <circle cx="22.5" cy="10" r="1.6" fill="#d42a1f" />
    </svg>
  )
}

/** Round die-cut sticker for 2nd / 3rd. */
export function Sticker({ rank }: { rank: number }) {
  return (
    <div className={`sticker sticker-${rank}`}>
      <span className="sticker-small">locul</span>
      <span className="sticker-num">{rank}</span>
    </div>
  )
}

/** Photo printed as a polaroid with a strip of tape on top. */
export function Polaroid({
  c,
  index,
  caption,
  tilt = 0,
  tape = true,
  children,
}: {
  c: Contestant
  index: number
  caption?: string
  tilt?: number
  tape?: boolean
  children?: React.ReactNode // drawn on top of the photo (face gags)
}) {
  return (
    <div className="polaroid" style={{ rotate: `${tilt}deg` }}>
      {tape && <span className="tape" />}
      <div className="polaroid-photo">
        <Avatar c={c} index={index} />
        {children}
      </div>
      {caption && <div className="polaroid-caption">{caption}</div>}
    </div>
  )
}

export const TILTS = [-3, 2.5, -2, 3, -1.5, 2.2]

// ── Footprints (start screen) ─────────────────────────────────
export function Footprint({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 80" width="100%" height="100%" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M20 4 C32 4 36 20 34 34 C32 46 26 50 20 50 C12 50 6 44 6 32 C6 16 10 4 20 4 Z" fill="currentColor" />
      <path d="M20 56 C28 56 31 62 30 68 C29 75 24 78 20 78 C15 78 10 75 10 68 C10 61 13 56 20 56 Z" fill="currentColor" />
    </svg>
  )
}
