// Cartoon jokes drawn on top of the faces (sunglasses, pig nose, tears…).
// Each gag sits in a box centred between the eyes. Inside the SVG, 100 units = the distance
// between the eyes, so the eyes are at (-50, 0) and (50, 0), the nose ≈ (0, 60), the mouth ≈ (0, 110).
import { motion } from 'framer-motion'
import type { Contestant, GagKind } from '../config'

type Props = { c: Contestant; kind?: GagKind | 'sweat'; delay?: number; instant?: boolean }

export function FaceGag({ c, kind = c.gag, delay = 0, instant = false }: Props) {
  if (!c.face || !kind) return null
  const { x, y, d, rot = 0 } = c.face
  const size = d * 3
  return (
    <div
      className={`gag gag-${kind}`}
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${size * 100}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)` }}
    >
      <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {kind === 'shades' && <Shades delay={delay} instant={instant} />}
        {kind === 'tear' && (
          <>
            <Tear x={-50} y={22} delay={delay} instant={instant} />
            <Tear x={50} y={22} delay={delay + 1.1} instant={instant} />
          </>
        )}
        {kind === 'tears' && <Tears delay={delay} instant={instant} />}
        {kind === 'pig' && <Pig delay={delay} instant={instant} />}
        {kind === 'zzz' && <Zzz delay={delay} instant={instant} />}
        {kind === 'chicken' && <Chicken delay={delay} instant={instant} />}
        {kind === 'sweat' && <Sweat />}
      </svg>
    </div>
  )
}

type Anim = { delay: number; instant: boolean }

/** "Deal with it" pixel sunglasses slowly lowered onto the face, then a gold chain. */
function Shades({ delay, instant }: Anim) {
  const lens = (sx: number) => (
    <g transform={`scale(${sx} 1)`}>
      <rect x={-112} y={-18} width={100} height={16} />
      <rect x={-104} y={-2} width={84} height={14} />
      <rect x={-94} y={12} width={60} height={12} />
      <rect x={-96} y={-12} width={10} height={10} fill="#fff" />
      <rect x={-84} y={0} width={10} height={10} fill="#fff" />
    </g>
  )
  return (
    <>
      <motion.g
        fill="#111"
        initial={instant ? false : { y: -320 }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 1.8, ease: 'linear' }}
      >
        <rect x={-140} y={-30} width={280} height={14} />
        {lens(1)}
        {lens(-1)}
      </motion.g>
      <motion.g
        initial={instant ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 2, type: 'spring', stiffness: 300, damping: 12 }}
      >
        <path d="M -105 150 Q 0 235 105 150" fill="none" stroke="#e8b923" strokeWidth={14} strokeDasharray="16 7" strokeLinecap="round" />
        <path d="M -105 150 Q 0 235 105 150" fill="none" stroke="#8a6a0a" strokeWidth={2} strokeDasharray="16 7" />
        <circle cx={0} cy={205} r={30} fill="#ffd23f" stroke="#8a6a0a" strokeWidth={5} />
        <text x={0} y={219} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={40} fill="#8a6a0a">
          $
        </text>
      </motion.g>
    </>
  )
}

const DROP = 'M0 -14 C 7 -3, 12 4, 12 11 A 12 12 0 1 1 -12 11 C -12 4, -7 -3, 0 -14 Z'

/** One tear that keeps rolling down the cheek. */
function Tear({ x, y, delay, instant }: Anim & { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(2)`}>
      <motion.path
        d={DROP}
        fill="#8fd3ff"
        stroke="#1f4fbf"
        strokeWidth={3}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, 0, 75], opacity: [0, 1, 0] }}
        transition={{ delay: instant ? 0 : delay, duration: 2.2, times: [0, 0.2, 1], repeat: Infinity, repeatDelay: 0.6, ease: 'easeIn' }}
      />
    </g>
  )
}

/** Two rivers of tears for last place. */
function Tears({ delay, instant }: Anim) {
  return (
    <>
      {[-50, 50].map((ex, i) => (
        <g key={ex}>
          <motion.path
            d={`M ${ex} 14 C ${ex - 14} 60, ${ex + 14} 100, ${ex + (i ? 10 : -10)} 170`}
            fill="none"
            stroke="#8fd3ff"
            strokeWidth={16}
            strokeLinecap="round"
            opacity={0.85}
            initial={instant ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay, duration: 0.9, ease: 'easeOut' }}
          />
          {[0, 1].map((k) => (
            <motion.path
              key={k}
              d={DROP}
              fill="#8fd3ff"
              stroke="#1f4fbf"
              strokeWidth={3}
              initial={{ x: ex, y: 20, opacity: 0 }}
              animate={{ x: ex + (i ? 10 : -10), y: [20, 190], opacity: [1, 0] }}
              transition={{ delay: delay + 0.9 + k * 0.7 + i * 0.35, duration: 1.3, repeat: Infinity, repeatDelay: 0.1, ease: 'easeIn' }}
            />
          ))}
        </g>
      ))}
    </>
  )
}

/** Pig snout + ears that pop on. */
function Pig({ delay, instant }: Anim) {
  const pop = (d: number) => ({
    initial: instant ? false : ({ scale: 0 } as const),
    animate: { scale: 1 },
    transition: { delay: delay + d, type: 'spring' as const, stiffness: 500, damping: 11 },
  })
  return (
    <>
      <motion.g {...pop(0)} style={{ transformOrigin: '0px 62px' }}>
        <ellipse cx={0} cy={62} rx={40} ry={29} fill="#f6a5bb" stroke="#b5476a" strokeWidth={5} />
        <ellipse cx={-14} cy={62} rx={7} ry={12} fill="#7a2a3e" />
        <ellipse cx={14} cy={62} rx={7} ry={12} fill="#7a2a3e" />
        <ellipse cx={-18} cy={47} rx={9} ry={4} fill="#fff" opacity={0.6} />
      </motion.g>
      {[-1, 1].map((s) => (
        <motion.g key={s} {...pop(0.15)} style={{ transformOrigin: `${s * 95}px -100px` }}>
          <path d={`M ${s * 70} -105 L ${s * 128} -150 L ${s * 118} -78 Z`} fill="#f6a5bb" stroke="#b5476a" strokeWidth={5} strokeLinejoin="round" />
          <path d={`M ${s * 82} -105 L ${s * 117} -132 L ${s * 112} -90 Z`} fill="#e07b98" />
        </motion.g>
      ))}
    </>
  )
}

/** Floating "Z z z" + a bit of drool. */
function Zzz({ delay, instant }: Anim) {
  const d0 = instant ? 0 : delay
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.text
          key={i}
          x={0}
          y={0}
          fontFamily="'Caveat Brush', cursive"
          fontSize={78 - i * 12}
          fill="#1f4fbf"
          stroke="#fff"
          strokeWidth={3}
          paintOrder="stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: [80, 105, 90, 115], y: [-20, -50, -80, -110], scale: [0.6, 1, 1.15, 1.3] }}
          transition={{ delay: d0 + i * 0.7, duration: 2.1, repeat: Infinity, ease: 'easeOut' }}
        >
          Z
        </motion.text>
      ))}
      <motion.path
        d="M 38 118 q 4 10 2 22 a 6 6 0 1 0 8 0 q -2 -12 2 -22"
        fill="#bfe6ff"
        stroke="#1f4fbf"
        strokeWidth={2.5}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0.3, 1.2, 0.3], opacity: 1 }}
        style={{ transformOrigin: '42px 118px' }}
        transition={{ delay: d0 + 0.5, duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

/** Chicken drumstick being munched, with crumbs. */
function Chicken({ delay, instant }: Anim) {
  return (
    <motion.g initial={instant ? false : { x: 220, y: 60, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ delay, type: 'spring', stiffness: 160, damping: 14 }}>
      <motion.g
        animate={{ rotate: [-28, -12, -28], x: [0, -12, 0] }}
        transition={{ delay: delay + 0.6, duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '60px 115px' }}
      >
        <g transform="translate(60 115) rotate(-28) scale(1.3)">
          <rect x={20} y={-7} width={52} height={14} rx={6} fill="#fff8e8" stroke="#1f1b16" strokeWidth={4} />
          <circle cx={76} cy={-9} r={10} fill="#fff8e8" stroke="#1f1b16" strokeWidth={4} />
          <circle cx={76} cy={9} r={10} fill="#fff8e8" stroke="#1f1b16" strokeWidth={4} />
          <path d="M 28 0 C 28 -40, -50 -46, -56 -6 C -60 30, 10 34, 28 0 Z" fill="#c8732e" stroke="#1f1b16" strokeWidth={4} />
          <path d="M -40 -14 q 18 -14 40 -10" stroke="#f1b36d" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -46 2 a 8 8 0 0 0 10 10 a 8 8 0 0 0 12 -4" fill="#efe6d2" stroke="#1f1b16" strokeWidth={3} />
        </g>
      </motion.g>
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          r={4 + (i % 2) * 2}
          fill="#c8732e"
          initial={{ cx: 20 + i * 8, cy: 125, opacity: 0 }}
          animate={{ cy: [125, 200], opacity: [1, 0] }}
          transition={{ delay: delay + 0.8 + i * 0.25, duration: 0.9, repeat: Infinity, ease: 'easeIn' }}
        />
      ))}
    </motion.g>
  )
}

/** Nervous sweat during the drum roll. */
function Sweat() {
  return (
    <g transform="scale(2.2)">
      {[
        [100, -80, 0],
        [-95, -60, 0.5],
        [115, -20, 1],
      ].map(([x, y, dl]) => (
        <motion.path
          key={dl}
          d={DROP}
          fill="#8fd3ff"
          stroke="#1f4fbf"
          strokeWidth={3}
          initial={{ x: x! / 2.2, y: y! / 2.2, opacity: 0 }}
          animate={{ y: [y! / 2.2, y! / 2.2 + 55], opacity: [1, 0] }}
          transition={{ delay: dl, duration: 1, repeat: Infinity, repeatDelay: 0.3, ease: 'easeIn' }}
        />
      ))}
    </g>
  )
}

/** Falling 100-lei notes, manea style. */
export function MoneyRain({ count = 34, startDelay = 0 }: { count?: number; startDelay?: number }) {
  const bills = Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    delay: startDelay + ((i * 0.53) % 4),
    dur: 3.2 + ((i * 0.71) % 2.4),
    scale: 0.75 + ((i * 0.29) % 0.5),
    flip: i % 2 ? 1 : -1,
  }))
  return (
    <div className="money-rain">
      {bills.map((b, i) => (
        <div
          key={i}
          className="bill-fall"
          style={{ left: `${b.left}%`, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, ['--s' as string]: b.scale, ['--f' as string]: b.flip }}
        >
          <div className="bill" style={{ animationDelay: `${b.delay}s` }}>
            <span className="bill-num">100</span>
            <span className="bill-lei">LEI</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Hungarian flags waving around the edges of the screen.
const FLAG_SPOTS = [
  { left: 3, top: 8, size: 1.1, tilt: -8 },
  { left: 16, top: 30, size: 0.8, tilt: 5 },
  { left: 4, top: 56, size: 1, tilt: -4 },
  { left: 15, top: 76, size: 0.75, tilt: 7 },
  { left: 81, top: 6, size: 1, tilt: 6 },
  { left: 70, top: 28, size: 0.75, tilt: -6 },
  { left: 83, top: 50, size: 1.15, tilt: 4 },
  { left: 71, top: 74, size: 0.85, tilt: -5 },
  { left: 31, top: 4, size: 0.6, tilt: -3 },
  { left: 60, top: 3, size: 0.65, tilt: 4 },
]

export function FlagWall({ instant = false }: { instant?: boolean }) {
  return (
    <div className="flag-wall">
      {FLAG_SPOTS.map((f, i) => (
        <motion.div
          key={i}
          className="flag-pole"
          style={{ left: `${f.left}%`, top: `${f.top}%`, ['--fs' as string]: f.size, rotate: f.tilt }}
          initial={instant ? false : { y: '60vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 140, damping: 15 }}
        >
          <div className="flag-hu" style={{ animationDelay: `${-i * 0.27}s` }}>
            <span />
            <span />
            <span />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
