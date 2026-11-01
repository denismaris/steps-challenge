import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { config } from './config'
import * as sfx from './sound'
import { Backdrop, BuildUp, Final, Reveal, StartScreen, WinnerBuildUp, tierOf } from './components/Scenes'
import type { SplatData } from './components/Art'
import { Records } from './components/Records'

sfx.prepareSong(config.winnerSong.src)

type Phase = 'suspense' | 'reveal'

export default function App() {
  const people = config.contestants
  const total = people.length
  // scene 0 = start, 1..total = places total→1, total+1 = podium, total+2 = records
  const [scene, setScene] = useState(0)
  const [phase, setPhase] = useState<Phase>('suspense')
  const [instant, setInstant] = useState(false)
  const [splats, setSplats] = useState<SplatData[]>([])
  const [muted, setMutedState] = useState(false)
  const [idle, setIdle] = useState(false)
  const [stageRef, animateStage] = useAnimate()

  const finalScene = total + 1
  const lastScene = total + 2
  const rank = scene >= 1 && scene <= total ? total - scene + 1 : 0
  const tier = scene === 0 ? 'start' : scene === lastScene ? 'plain' : scene === finalScene ? 'gold' : phase === 'suspense' && rank !== 1 ? 'plain' : tierOf(rank, total)

  const next = useCallback(() => {
    sfx.initAudio()
    if (scene === 0) setSplats([])
    if (scene >= 1 && scene <= total && phase === 'suspense') {
      setInstant(false)
      setPhase('reveal')
      return
    }
    if (scene < lastScene) {
      setInstant(false)
      setPhase('suspense')
      setScene(scene + 1)
    }
  }, [scene, phase, total, lastScene])

  const back = useCallback(() => {
    if (scene === 0) return
    setInstant(true)
    setPhase('reveal')
    setScene(scene - 1)
  }, [scene])

  // winner song: starts at the winner reveal, keeps going on the podium, fades out after
  const songOn = (rank === 1 && phase === 'reveal') || scene === finalScene
  useEffect(() => {
    if (!songOn) {
      sfx.stopSong()
      return
    }
    const { src, startAt, volume } = config.winnerSong
    const t = setTimeout(() => sfx.playSong(src, startAt, volume), instant ? 0 : 900)
    return () => clearTimeout(t)
  }, [songOn]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSuspenseDone = useCallback(() => setPhase('reveal'), [])

  const shake = useCallback(() => {
    if (!stageRef.current) return
    void animateStage(
      stageRef.current,
      { x: [0, -16, 13, -9, 6, -2, 0], y: [0, 9, -7, 5, -3, 1, 0], rotate: [0, -0.7, 0.6, -0.3, 0.15, 0, 0] },
      { duration: 0.42, ease: 'easeOut' },
    )
  }, [animateStage, stageRef])

  const addSplat = useCallback((s: SplatData) => setSplats((all) => [...all.slice(-40), s]), [])

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === ' ' || k === 'ArrowRight' || k === 'PageDown' || k === 'Enter') {
        e.preventDefault()
        if (!e.repeat) next()
      } else if (k === 'ArrowLeft' || k === 'PageUp') {
        e.preventDefault()
        back()
      } else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else void document.documentElement.requestFullscreen().catch(() => {})
      } else if (k === 'm' || k === 'M') {
        const m = !sfx.isMuted()
        sfx.setMuted(m)
        setMutedState(m)
      } else if (k === 'Home') {
        sfx.stopSong(300)
        setScene(0)
        setPhase('suspense')
        setSplats([])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, back])

  // hide the cursor when idle (nicer on a projector)
  const idleTimer = useRef(0)
  useEffect(() => {
    const onMove = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => setIdle(true), 2500)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const person = rank ? people[rank - 1]! : null

  let content: React.ReactNode = null
  if (scene === 0) content = <StartScreen key="start" onStart={next} />
  else if (scene === finalScene) content = <Final key="final" contestants={people} splats={splats} />
  else if (scene === lastScene) content = <Records key="records" />
  else if (person && phase === 'suspense')
    content = rank === 1 ? <WinnerBuildUp key={`bu-${rank}`} onDone={onSuspenseDone} /> : <BuildUp key={`bu-${rank}`} rank={rank} tier={tierOf(rank, total)} onDone={onSuspenseDone} />
  else if (person)
    content = (
      <Reveal key={`rv-${rank}`} c={person} index={rank - 1} rank={rank} total={total} instant={instant} splats={splats} addSplat={addSplat} shake={shake} />
    )

  return (
    <div
      className={`app${idle ? ' idle' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        if (scene !== 0) next()
      }}
    >
      <Backdrop tier={tier} />
      <div className="stage" ref={stageRef}>
        <AnimatePresence mode="wait">{content}</AnimatePresence>
      </div>

      {scene > 0 && scene < finalScene && (
        <div className="progress">
          {people
            .map((_, i) => total - i)
            .map((r) => (
              <motion.span key={r} className={`dot${r === rank ? ' on' : ''}${r > rank ? ' done' : ''}`} layout>
                {r}
              </motion.span>
            ))}
        </div>
      )}
      {muted && <div className="muted-badge">🔇 fără sunet</div>}
      <div className="hud">
        <kbd>Spațiu</kbd> înainte · <kbd>←</kbd> înapoi · <kbd>F</kbd> ecran complet · <kbd>M</kbd> sunet
      </div>
    </div>
  )
}
