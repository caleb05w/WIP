import { useState, useEffect, useRef } from 'react'
import { SFPlus } from 'sf-symbols-lib/dualtone/SFPlus'
import { SFArrowCounterclockwise } from 'sf-symbols-lib/dualtone/SFArrowCounterclockwise'
import './DynamicIsland.css'
import RollingDigit from './RollingDigit'
import Waveform from './Waveform'
import StreakRive from './StreakRive'
import StreakExpanded from './StreakExpanded'
import useStreakDays from './useStreakDays'

const SECTIONS = [
  {
    title: 'Trade-offs',
    items: [
      { text: 'Streak flame only plays when expanded: Collapsed state is too small.' },
      { text: 'Honestly, expanded view is best, and allows users to fully appreciate the riv animation.' },
      { text: 'The pop up demanding more screen real estate might be annoying, but my assumption is that it\'s alright because streaks are a once a day occurence. Might even make them feel more special.', warn: true },
    ],
  },
  {
    title: 'Color',
    items: [
      { text: 'Wanted the streak to feel premium / prestigious' },
      { text: 'Orange felt flat, and unexciting, esp with such a cinematically driven art direction.' },
      { text: 'You guys predominately used black and white: thought the logo could be a cool flagship color' },
    ],
  },
  {
    title: 'Animation',
    items: [
      { text: 'Designed to feel Apple-native: number flip, micro-animations on the date tracker' },
      { text: '2.5 second intro felt right for median attention spans.' },
      { text: 'Tried to mash Duolingo playful with Apple class.' },
      { text: 'I realize there is alot of tidbits of motion going on', warn: true },
    ],
  },
  {
    title: 'Next Steps',
    items: [
      { text: 'Oh god, wanted to do a lot more with this one haha' },
      { text: 'Milestone animations for sure' },
      { text: <>Would love to give Josh Puckett's <a href="https://www.interfacecraft.dev/" target="_blank" rel="noreferrer" className="text-black">interface craft</a>, Rauno's <a href="https://devouringdetails.com" target="_blank" rel="noreferrer" className="text-black">devouring details</a>, or even <a href="https://animations.dev" target="_blank" rel="noreferrer" className="text-black">animations.dev</a> a good read to apply more mindful motion principles</> },
    ],
  },
]

const COMPACT_NOTE = "I don't think streaks should appear in the collapsed view — but including it here to show how one might adapt streaks to a smaller medium, or transition if another Dynamic Island app was already open."

function SidePanel({ islandState }) {
  const [active, setActive] = useState('Trade-offs')
  const section = SECTIONS.find(s => s.title === active)
  const showCompactNote = active === 'Trade-offs' && islandState === 'compact'

  return (
    <div className="absolute top-8 left-8 flex flex-col gap-5 max-w-[20vw] z-10">
        <span className="text-[13px] text-black/40">Caleb x WIP Takehome</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.title}
              onClick={() => setActive(s.title)}
              className={`text-[13px] font-normal bg-transparent border-none p-0 cursor-pointer transition-colors duration-150 ${active === s.title ? 'text-black/70' : 'text-black/40 hover:text-black/60'}`}
            >
              {s.title}
            </button>
          ))}
        </div>
        {showCompactNote ? (
          <p className="text-[13px] font-normal leading-[1.5] text-black/40 m-0">{COMPACT_NOTE}</p>
        ) : section && (
          <ul className="text-[13px] font-normal leading-[1.5] text-black/40 m-0 p-0 list-none flex flex-col gap-1">
            {section.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={`shrink-0 ${item.warn ? 'text-red-400/80' : ''}`}>—</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
  )
}

const ACTIVITIES = {
  idle: null,
  listening: {
    song: 'Blinding Lights',
    artist: 'The Weeknd',
    gradient: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
    progress: 0.38,
  },
  ringMode: {
    name: 'Sarah Johnson',
    initials: 'SJ',
    elapsed: '0:42',
  },
  timer: {
    label: 'Kitchen Timer',
    remaining: '03:24',
  },
  streak: {
    count: 7,
    label: 'Day Streak',
  },
}

const ISLAND_DIMS = {
  idle:     { width: '126px', height: '36px', borderRadius: '50px', cursor: 'default' },
  compact:  { width: '280px', height: '36px', borderRadius: '50px' },
  expanded: { width: '372px', height: '95px', borderRadius: '46px' },
}

export default function DynamicIsland() {
  const [state, setState] = useState('compact')
  const [activity, setActivity] = useState('streak')
  const [playing, setPlaying] = useState(true)
  const [contentPhase, setContentPhase] = useState('hidden') // 'hidden' | 'exiting' | 'visible'
  const prevActivityRef = useRef('idle')
  const phaseTimers = useRef([])

  const { streakCount, streakDir, streakDays, changeStreak, resetStreak } = useStreakDays(2)
  const [riveKey, setRiveKey] = useState(0)
  const [riveColorMode, setRiveColorMode] = useState('orange')
  const [showBlurOverlay, setShowBlurOverlay] = useState(false)
  const prevStateRef = useRef(state)
  const blurTimer = useRef(null)

  useEffect(() => {
    const prev = prevStateRef.current
    prevStateRef.current = state
    const isExpanding = state === 'expanded'
    const isCollapsing = prev === 'expanded' && state === 'compact'
    if (isExpanding || isCollapsing) {
      if (blurTimer.current) clearTimeout(blurTimer.current)
      setShowBlurOverlay(true)
      blurTimer.current = setTimeout(() => setShowBlurOverlay(false), 1200)
    }
  }, [state])

  useEffect(() => {
    const prev = prevActivityRef.current
    prevActivityRef.current = activity
    phaseTimers.current.forEach(clearTimeout)
    phaseTimers.current = []
    const schedule = (fn, ms) => phaseTimers.current.push(setTimeout(fn, ms))

    if (activity === 'idle') {
      setContentPhase('exiting')
      schedule(() => setContentPhase('hidden'), 200)
      return
    }

    if (prev === 'idle') {
      // Opening fresh — island is expanding, wait then fade in
      schedule(() => setContentPhase('visible'), 310)
    } else {
      // Switching activities — fade out, then fade in
      setContentPhase('exiting')
      schedule(() => setContentPhase('hidden'), 180)
      schedule(() => setContentPhase('visible'), 180 + 310)
    }

    return () => phaseTimers.current.forEach(clearTimeout)
  }, [activity])

  const clearPhaseTimers = () => { phaseTimers.current.forEach(clearTimeout); phaseTimers.current = [] }

  const handleIslandClick = () => {
    if (state === 'idle') {
      setState('compact')
      clearPhaseTimers()
      setContentPhase('hidden')
      phaseTimers.current.push(setTimeout(() => setContentPhase('visible'), 310))
      triggerStreak()
    } else if (state === 'compact') {
      setState('expanded')
      setTimeout(() => changeStreak(1), 450)
    } else {
      setState('compact')
    }
  }

  const triggerStreak = () => {
    setTimeout(() => changeStreak(1), 450)
    setTimeout(() => setRiveKey(k => k + 1), 650)
  }

  const closeIsland = () => {
    clearPhaseTimers()
    setContentPhase('exiting')
    phaseTimers.current.push(setTimeout(() => setContentPhase('hidden'), 200))
    setState('idle')
  }

  const data = ACTIVITIES[activity]
  const padded = String(streakCount).padStart(2, '0')

  return (
    <div className="min-h-svh bg-white flex flex-col items-center px-5 box-border font-sans relative">

      <SidePanel islandState={state} />
      {showBlurOverlay && (
        <div className="fixed inset-0 backdrop-blur-sm pointer-events-none di-blur-overlay" />
      )}

      {/* Card */}
      <div className="flex-1 w-full flex items-center justify-center">

        {/* Island container */}
        <div className="relative w-[480px] h-[340px] rounded-[32px]">
        <h6
          className={`absolute top-[56px] left-0 right-0 text-center text-[11px] font-normal text-black/60 whitespace-nowrap m-0 di-hint ${state === 'idle' ? 'opacity-100' : 'opacity-0 translate-y-[10px] scale-[0.94]'}`}
        >(click on bar to start)</h6>

{/* Dynamic Island */}
        <div
          className="di-island absolute top-4 left-1/2 -translate-x-1/2 bg-black cursor-pointer z-10 overflow-hidden"
          style={ISLAND_DIMS[state]}
          onClick={handleIslandClick}
          role="button"
          aria-label="Dynamic Island"
        >
          <div className={`w-full h-full flex items-center cursor-pointer ${
            contentPhase === 'visible' ? 'di-content-enter'
          : contentPhase === 'exiting' ? 'di-content-exit'
          : 'opacity-0'
          }`}>

            {activity === 'listening' && state === 'compact' && (
              <div className="w-full h-full flex items-center px-3.5 gap-2 box-border text-white">
                <div className="w-6 h-6 rounded-[5px] shrink-0" style={{ background: data.gradient }} />
                <Waveform playing={playing} />
              </div>
            )}

            {activity === 'listening' && state === 'expanded' && (
              <div className="w-full h-full box-border text-white py-4 px-[18px] flex gap-3.5 items-center">
                <div
                  className="w-[108px] h-[108px] rounded-[14px] shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  style={{ background: data.gradient }}
                />
                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[15px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis tracking-[-0.2px]">{data.song}</div>
                    <div className="text-[13px] text-white/55">{data.artist}</div>
                  </div>
                  <div className="h-[3px] bg-white/20 rounded-sm overflow-hidden">
                    <div className="h-full bg-white rounded-sm" style={{ width: `${data.progress * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="bg-transparent border-none text-white/85 text-[18px] cursor-pointer p-1 leading-none hover:text-white active:scale-[0.88] transition-[transform,color] duration-100">⏮</button>
                    <button
                      className="bg-transparent border-none text-[22px] text-white cursor-pointer p-1 leading-none active:scale-[0.88] transition-transform duration-100"
                      onClick={e => { e.stopPropagation(); setPlaying(p => !p) }}
                    >
                      {playing ? '⏸' : '▶'}
                    </button>
                    <button className="bg-transparent border-none text-white/85 text-[18px] cursor-pointer p-1 leading-none hover:text-white active:scale-[0.88] transition-[transform,color] duration-100">⏭</button>
                  </div>
                </div>
              </div>
            )}

            {activity === 'ringMode' && state === 'compact' && (
              <div className="w-full h-full flex items-center px-3.5 gap-2 box-border text-white">
                <div className="w-2 h-2 rounded-full bg-[#34d058] shrink-0 di-dot-pulse" />
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1">{data.name}</span>
                <span className="text-[13px] text-white/60 ml-auto shrink-0">{data.elapsed}</span>
              </div>
            )}

            {activity === 'ringMode' && state === 'expanded' && (
              <div className="w-full h-full box-border text-white py-5 px-[18px] flex items-center gap-3.5">
                <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#5856d6] to-[#af52de] flex items-center justify-center text-[18px] font-semibold shrink-0">
                  {data.initials}
                </div>
                <div className="flex-1 flex flex-col gap-[3px]">
                  <div className="text-[17px] font-semibold tracking-[-0.3px]">{data.name}</div>
                  <div className="text-[13px] text-white/55">iPhone · {data.elapsed}</div>
                </div>
                <div className="flex gap-2.5">
                  <button
                    className="py-2 px-[18px] rounded-full border-none text-[13px] font-semibold cursor-pointer bg-[#ff3b30] text-white hover:brightness-[1.15] active:scale-[0.94] transition-[filter,transform] duration-150"
                    onClick={e => { e.stopPropagation(); triggerActivity('idle') }}
                  >End</button>
                  <button
                    className="py-2 px-[18px] rounded-full border-none text-[13px] font-semibold cursor-pointer bg-white/15 text-white hover:brightness-[1.2] active:scale-[0.94] transition-[filter,transform] duration-150"
                    onClick={e => e.stopPropagation()}
                  >Hold</button>
                </div>
              </div>
            )}

            {activity === 'timer' && state === 'compact' && (
              <div className="w-full h-full flex items-center px-3.5 gap-2 box-border text-white">
                <span className="text-sm shrink-0">⏱</span>
                <span className="text-[13px] text-white/70 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{data.label}</span>
                <span className="text-sm font-semibold tabular-nums text-[#ff9f0a] shrink-0 ml-auto">{data.remaining}</span>
              </div>
            )}

            {activity === 'timer' && state === 'expanded' && (
              <div className="w-full h-full box-border text-white py-4 px-[18px] flex flex-col items-center justify-center gap-2.5 text-center">
                <div className="text-[13px] text-white/50 tracking-[0.3px] uppercase">{data.label}</div>
                <div className="text-[48px] font-[200] tracking-[-2px] text-[#ff9f0a] tabular-nums leading-none">{data.remaining}</div>
                <div className="flex gap-2.5">
                  <button
                    className="py-1.5 px-5 rounded-full border-none text-[13px] font-semibold cursor-pointer bg-white/[12%] text-white/80 hover:brightness-[1.2] active:scale-[0.94] transition-[filter,transform] duration-150"
                    onClick={e => { e.stopPropagation(); triggerActivity('idle') }}
                  >Cancel</button>
                  <button
                    className="py-1.5 px-5 rounded-full border-none text-[13px] font-semibold cursor-pointer bg-[#ff9f0a] text-black hover:brightness-[1.1] active:scale-[0.94] transition-[filter,transform] duration-150"
                    onClick={e => e.stopPropagation()}
                  >Pause</button>
                </div>
              </div>
            )}

            {activity === 'streak' && state === 'compact' && (
              <div className="w-full h-full flex items-center justify-between px-[7px] py-[7px] box-border">
                <img src="/images/logo.svg" className="w-[22px] h-[22px] rounded-[6px] shrink-0" alt="logo" />
                <div className="flex items-center gap-[1.5px] bg-orange-500/30 rounded-full px-2">
                  <img src="/images/streak-orange.svg" className="w-[10px] h-[10px] shrink-0" alt="streak" />
                  <span className="text-[10px] font-medium text-orange-500 whitespace-nowrap">{streakCount}</span>
                </div>
              </div>
            )}

            {activity === 'streak' && state === 'expanded' && (
              <StreakExpanded
                count={streakCount}
                dir={streakDir}
                days={streakDays}
                riveKey={riveKey}
                colorMode={riveColorMode}
              />
            )}

          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-[175px] left-1/2 -translate-x-1/2 flex gap-2.5">
          <div className="relative group">
            <button
              className="w-10 h-10 rounded-full border border-[#c7c7cc] bg-white text-black cursor-pointer flex items-center justify-center hover:bg-[#f5f5f7] active:scale-[0.92] transition-[background,transform] duration-150"
              onClick={() => { changeStreak(1); setRiveKey(k => k + 1) }}
            ><SFPlus size="sm" /></button>
            <span className="pointer-events-none absolute top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c1c1e] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              Add streak
            </span>
          </div>
          <div className="relative group">
            <button
              className="w-10 h-10 rounded-full border border-[#c7c7cc] bg-white text-black cursor-pointer flex items-center justify-center hover:bg-[#f5f5f7] active:scale-[0.92] transition-[background,transform] duration-150"
              onClick={() => { resetStreak(); closeIsland() }}
            ><SFArrowCounterclockwise size="sm" /></button>
            <span className="pointer-events-none absolute top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c1c1e] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              Reset
            </span>
          </div>
          <div className="relative group">
            <button
              className="w-10 h-10 rounded-full border border-[#c7c7cc] bg-white cursor-pointer flex items-center justify-center gap-1 hover:bg-[#f5f5f7] active:scale-[0.92] transition-[background,transform] duration-150"
              onClick={() => setRiveColorMode(m => m === 'gradient' ? 'orange' : 'gradient')}
            >
              <div className="w-3 h-3 rounded-full bg-orange-500" style={{ outline: riveColorMode === 'orange' ? '2px solid #f97316' : 'none', outlineOffset: '1px' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#1C5A8F', outline: riveColorMode === 'gradient' ? '2px solid #1C5A8F' : 'none', outlineOffset: '1px' }} />
            </button>
            <span className="pointer-events-none absolute top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1c1c1e] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {riveColorMode === 'gradient' ? 'Switch to orange' : 'Switch to gradient'}
            </span>
          </div>
        </div>

        </div>{/* end island container */}

      </div>



    </div>
  )
}
