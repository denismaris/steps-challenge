import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { config } from '../config'
import * as sfx from '../sound'
import { CountUp } from './Scenes'
import { ScribbleUnderline } from './Art'

const MARATHON_KM = 42.195
const CARD_TILTS = [-2, 1.5, -1, 2, -1.5, 1]

export function Records() {
  const totalSteps = config.contestants.reduce((sum, c) => sum + (c.steps ?? 0), 0)
  const km = (totalSteps * config.strideMeters) / 1000
  const marathons = Math.floor(km / MARATHON_KM)

  useEffect(() => {
    sfx.ding()
    const t = setTimeout(() => {
      sfx.crash()
      confetti({ particleCount: 120, spread: 90, startVelocity: 45, origin: { x: 0.5, y: 0.35 }, colors: ['#d42a1f', '#1f4fbf', '#ffd23f', '#2f8f46', '#1f1b16'], shapes: ['square'] })
    }, 2400)
    return () => {
      clearTimeout(t)
      confetti.reset()
    }
  }, [])

  return (
    <motion.div className="scene records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.h2 className="records-title" initial={{ opacity: 0, rotate: -6, y: -20 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
        în cifre
        <ScribbleUnderline delay={0.4} />
      </motion.h2>

      <div className="totals">
        <motion.div className="total" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 16 }}>
          <div className="total-num">
            <span className="hl" style={{ animationDelay: '2.6s' }}>
              <CountUp value={totalSteps} delay={0.5} instant={false} />
            </span>
          </div>
          <div className="total-label">pași împreună</div>
        </motion.div>
        <motion.div className="total" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: 'spring', stiffness: 160, damping: 16 }}>
          <div className="total-num">
            <span className="hl" style={{ animationDelay: '2.9s' }}>
              <CountUp value={Math.round(km)} delay={0.8} instant={false} />
              <span className="total-unit"> km</span>
            </span>
          </div>
          <div className="total-label">adică vreo {marathons} maratoane</div>
        </motion.div>
      </div>

      <div className="record-grid">
        {config.records.map((r, i) => (
          <motion.div
            key={r.label}
            className={`record${r.fun ? ' fun' : ''}`}
            initial={{ opacity: 0, y: -50, rotate: CARD_TILTS[i]! * 5 }}
            animate={{ opacity: 1, y: 0, rotate: CARD_TILTS[i]! }}
            transition={{ delay: 1.4 + i * 0.2, type: 'spring', stiffness: 220, damping: 16 }}
          >
            <span className="tape" />
            <div className="record-label">{r.label}</div>
            <div className="record-value">
              <CountUp value={r.value} delay={1.6 + i * 0.2} instant={false} />
              <span className="record-unit">{r.unit}</span>
            </div>
            <div className="record-who">
              {r.who}
              {r.note && <span className="record-note"> · {r.note}</span>}
            </div>
            {r.fun && (
              <motion.div className="mini-stamp" initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 3.2, type: 'spring', stiffness: 500, damping: 18 }}>
                rușine
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
