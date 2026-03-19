import { useEffect, useRef } from 'react'
import { useRive } from '@rive-app/react-canvas'

export default function StreakRive({ className, replayKey, src = '/images/streak.riv', stateMachine = 'State Machine 1' }) {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
  })

  const isFirstRender = useRef(true)
  const prevStateMachine = useRef(stateMachine)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!rive) return
    rive.reset({ stateMachines: stateMachine, autoplay: true })
  }, [replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevStateMachine.current === stateMachine) return
    prevStateMachine.current = stateMachine
    if (!rive) return
    rive.reset({ stateMachines: stateMachine, autoplay: true })
  }, [stateMachine, rive])

  return <RiveComponent className={className} />
}
