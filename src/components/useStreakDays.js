import { useState, useRef, useEffect } from 'react'

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const ITEM_STRIDE = 25   // circle width (14px) + gap (11px)
export const WINDOW_SIZE = 5
export const ANIM_MS = 380
export const FUTURE_DAYS = 3
export const TRACKER_W = (WINDOW_SIZE - 1) * ITEM_STRIDE + 14  // 106px

function makeDay(offset, done, status = 'normal') {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return { id: offset, label: DAY_NAMES[d.getDay()], done, today: offset === 0, status }
}

function initDays(streakCount) {
  return Array.from({ length: WINDOW_SIZE }, (_, i) => {
    const offset = -(WINDOW_SIZE - 1 - FUTURE_DAYS) + i  // -1 to +3
    const done = offset <= 0 && offset > -streakCount
    return makeDay(offset, done)
  })
}

function normalize(d) {
  return { ...d, status: 'normal' }
}

// Slide the window left: fill the first open circle, exit left, enter right
function applyIncrement(prev) {
  const exiting = { ...prev[0], status: 'exiting' }
  const entering = makeDay(prev[prev.length - 1].id + 1, false, 'entering')
  const firstUndoneIdx = prev.findIndex(d => !d.done && d.status === 'normal')

  if (firstUndoneIdx === -1) {
    // All done — just slide
    return [exiting, ...prev.slice(1).map(normalize), entering]
  }

  return [
    exiting,
    ...prev.slice(1, firstUndoneIdx).map(normalize),
    { ...prev[firstUndoneIdx], done: true, status: 'filling' },
    ...prev.slice(firstUndoneIdx + 1).map(normalize),
    entering,
  ]
}

// Slide the window right: exit right, enter left
function applyDecrement(prev, newCount) {
  const enteringOffset = prev[0].id - 1
  return [
    makeDay(enteringOffset, enteringOffset > -newCount, 'entering-left'),
    ...prev.slice(0, -1).map(normalize),
    { ...prev[prev.length - 1], status: 'exiting-right' },
  ]
}

function settleAnimation(prev) {
  return prev
    .filter(d => d.status !== 'exiting' && d.status !== 'exiting-right')
    .map(normalize)
}

export default function useStreakDays(initialCount = 7) {
  const [streakCount, setStreakCount] = useState(initialCount)
  const [streakDir, setStreakDir] = useState(null)
  const [streakDays, setStreakDays] = useState(() => initDays(initialCount))

  const windowEndRef = useRef(FUTURE_DAYS)
  const streakCountRef = useRef(initialCount)
  const animTimer = useRef(null)

  useEffect(() => () => { if (animTimer.current) clearTimeout(animTimer.current) }, [])

  const scheduleSettle = () => {
    if (animTimer.current) clearTimeout(animTimer.current)
    animTimer.current = setTimeout(() => setStreakDays(settleAnimation), ANIM_MS)
  }

  const changeStreak = (delta) => {
    const newCount = Math.max(0, streakCountRef.current + delta)
    streakCountRef.current = newCount
    windowEndRef.current += delta

    setStreakDir(delta > 0 ? 'up' : 'down')
    setStreakCount(newCount)
    setStreakDays(delta > 0
      ? applyIncrement
      : prev => applyDecrement(prev, newCount)
    )
    scheduleSettle()
  }

  const resetStreak = () => {
    if (animTimer.current) clearTimeout(animTimer.current)
    streakCountRef.current = initialCount
    windowEndRef.current = FUTURE_DAYS
    setStreakCount(initialCount)
    setStreakDir('down')
    setStreakDays(initDays(initialCount))
  }

  return { streakCount, streakDir, streakDays, changeStreak, resetStreak }
}
