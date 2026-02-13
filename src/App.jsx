import { useState, useRef, useEffect } from 'react'
import './App.css'

const RUN_DISTANCE = 320
const MOVE_SPEED = 1.15
const MAX_MOVE = 220
const WOBBLE = 0.22
const LERP = 0.2

function App() {
  const [name] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('v') || '';
  });

  const [saidYes, setSaidYes] = useState(false)
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const noButtonRef = useRef(null)
  const audioRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const renderPosRef = useRef({ x: 0, y: 0 })
  const wobbleRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const rect = container.getBoundingClientRect()
      const mouseX = clientX - rect.left - rect.width / 2
      const mouseY = clientY - rect.top - rect.height / 2
      const pos = targetRef.current
      const dx = pos.x - mouseX
      const dy = pos.y - mouseY
      const distance = Math.hypot(dx, dy)

      if (distance < RUN_DISTANCE && distance > 1) {
        const baseAngle = Math.atan2(dy, dx)
        wobbleRef.current += 0.4
        const wobbleOffset = Math.sin(wobbleRef.current) * WOBBLE
        const angle = baseAngle + wobbleOffset
        const push = (RUN_DISTANCE - distance) * MOVE_SPEED
        const move = Math.min(push, MAX_MOVE)
        const halfW = rect.width / 2 - 70
        const halfH = rect.height / 2 - 28
        targetRef.current = {
          x: Math.max(-halfW, Math.min(halfW, pos.x + Math.cos(angle) * move)),
          y: Math.max(-halfH, Math.min(halfH, pos.y + Math.sin(angle) * move)),
        }
      }
    }

    let rafId
    const tick = () => {
      const current = renderPosRef.current
      const target = targetRef.current
      const next = {
        x: current.x + (target.x - current.x) * LERP,
        y: current.y + (target.y - current.y) * LERP,
      }
      renderPosRef.current = next
      setNoButtonPos(next)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [])

  return (
    <div className="valentine-page" ref={containerRef}>
      <audio
        ref={audioRef}
        src="/music.mp3"
        loop
        playsInline
        autoPlay
      />
      {saidYes ? (
        <div className="celebration">
          <h1 className="celebration-title">Happy Valentine&apos;s Day!</h1>
          <p className="celebration-sub">💕</p>
          <div className="hearts">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="heart-float" style={{ '--i': i }}>❤️</span>
            ))}
          </div>
        </div>
      ) : (
        <>
        {name ? <h1 className="question">Will you be my Valentine, {name}?</h1> : <h1 className="question">Will you be my Valentine?</h1>}
          <div className="buttons">
            <button
              type="button"
              className="btn btn-yes"
              onClick={() => setSaidYes(true)}
            >
              Yes
            </button>
            <button
              ref={noButtonRef}
              type="button"
              className="btn btn-no"
              style={{
                transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`,
              }}
            >
              No
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App
