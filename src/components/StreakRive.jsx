import { useEffect, useRef } from 'react'
import { useRive } from '@rive-app/react-canvas'

export default function StreakRive({ className, replayKey }) {
  const { RiveComponent, rive } = useRive({
    src: '/images/streak.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!rive) return
    rive.reset({ stateMachines: 'State Machine 1', autoplay: true })
  }, [replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return <RiveComponent className={className} />
}
