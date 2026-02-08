import { useState, useRef, useEffect } from 'react'
import './App.css'

const RUN_DISTANCE = 200
const MOVE_SPEED = 0.80

function App() {
  const [saidYes, setSaidYes] = useState(false)
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const noButtonRef = useRef(null)
  const audioRef = useRef(null)
  const posRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    posRef.current = noButtonPos
  }, [noButtonPos])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const rect = container.getBoundingClientRect()
      const mouseX = clientX - rect.left - rect.width / 2
      const mouseY = clientY - rect.top - rect.height / 2
      const pos = posRef.current
      const dx = pos.x - mouseX
      const dy = pos.y - mouseY
      const distance = Math.hypot(dx, dy)

      if (distance < RUN_DISTANCE && distance > 2) {
        const angle = Math.atan2(dy, dx)
        const push = (RUN_DISTANCE - distance) * MOVE_SPEED
        const maxMove = 140
        const move = Math.min(push, maxMove)
        const halfW = rect.width / 2 - 60
        const halfH = rect.height / 2 - 24
        setNoButtonPos((prev) => {
          const next = {
            x: Math.max(-halfW, Math.min(halfW, prev.x + Math.cos(angle) * move)),
            y: Math.max(-halfH, Math.min(halfH, prev.y + Math.sin(angle) * move)),
          }
          posRef.current = next
          return next
        })
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: true })
    return () => {
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
          <h1 className="question">Will you be my Valentine?</h1>
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
