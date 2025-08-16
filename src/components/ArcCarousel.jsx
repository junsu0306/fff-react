import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Arc card carousel (dark/hacking style)
 * - 스크롤/드래그로 좌우 이동
 * - 클릭 시 라우트 이동
 * - 중앙 근처 카드는 네온 강조
 */
export default function ArcCarousel({ items, height=560, cardSize={w:220,h:300} }) {
  const N = items.length
  const [center, setCenter] = useState(0) // fractional index
  const containerRef = useRef(null)
  const velocityRef = useRef(0)
  const rafRef = useRef(0)

  // Smooth animation loop for velocity decay
  useEffect(() => {
    const animate = () => {
      if (Math.abs(velocityRef.current) > 0.0001) {
        setCenter(v => (v + velocityRef.current + N) % N)
        velocityRef.current *= 0.92 // friction
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [N])

  // wheel -> horizontal move
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY || e.wheelDelta || 0
      velocityRef.current += delta * 0.0008
      setCenter(v => (v + delta * 0.002 + N) % N)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [N])

  // drag support (desktop + mobile)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let down = false
    let lastX = 0

    const onDown = (e) => {
      down = true
      lastX = e.touches ? e.touches[0].clientX : e.clientX
    }
    const onMove = (e) => {
      if (!down) return
      const x = e.touches ? e.touches[0].clientX : e.clientX
      const dx = (lastX - x)
      lastX = x
      velocityRef.current += dx * 0.0006
      setCenter(v => (v + dx * 0.002 + N) % N)
    }
    const onUp = () => { down = false }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    // mobile touch fallback
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [N])

  const layout = useMemo(() => {
    const gap = cardSize.w * 0.68
    const curve = 26 // higher = more arc
    const perspective = 700
    const centerTopVH = 38 // baseline y
    return items.map((it, i) => {
      // circular shortest distance
      let d = i - center
      if (d > N/2) d -= N
      if (d < -N/2) d += N
      const abs = Math.abs(d)
      const x = d * gap
      const y = -curve * (d * d)
      const scale = Math.max(0.72, 1 - 0.10 * abs)
      const rot = d * -8
      const z = Math.round(1000 - abs * 10)

      const left = `calc(50% + ${x}px - ${cardSize.w/2}px)`
      const top = `calc(${centerTopVH}vh + ${y}px)`
      return { ...it, i, d, abs, left, top, scale, rot, z, perspective }
    })
  }, [items, center, cardSize.h, cardSize.w, N])

  return (
    <div
      ref={containerRef}
      className="hide-scrollbar"
      style={{ position:'relative', height: `${height}px`, userSelect:'none' }}
      aria-label="다크 해킹 테마 카드 캐러셀"
    >
      {layout.map((it) => {
        // 중앙에 가까울수록 네온 효과를 강하게
        const focus = Math.max(0, 1 - it.abs * 0.18) // 0~1
        const borderA = 0.22 + 0.45 * focus
        const glowA   = 0.08 + 0.35 * focus
        const innerA  = 0.06 + 0.22 * focus

        return (
          <Link
            to={it.href}
            key={it.i}
            className="card"
            style={{
              position:'absolute',
              width: `${cardSize.w}px`,
              height:`${cardSize.h}px`,
              left: it.left,
              top: it.top,
              transform: `perspective(${it.perspective}px) rotateZ(${it.rot}deg) scale(${it.scale})`,
              transformOrigin: '50% 100%',
              zIndex: it.z,
              /* 다크 금속 + 네온 엣지 */
              background: `linear-gradient(165deg, var(--card-bg-1), var(--card-bg-2))`,
              border: `1px solid rgba(0, 255, 157, ${borderA.toFixed(3)})`,
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.03) inset,
                0 0 14px rgba(0, 255, 157, ${glowA.toFixed(3)}),
                0 10px 28px rgba(0,0,0,.55)
              `,
              color: 'var(--text)',
              padding:'18px',
              display:'flex',
              flexDirection:'column',
              justifyContent:'space-between',
              textShadow: `0 0 4px rgba(0,255,157, ${innerA.toFixed(3)})`
            }}
          >
            <div style={{opacity:.8, fontSize:12, letterSpacing:'.12em', textTransform:'lowercase', color:'var(--text)'}}>
              best of best
            </div>
            <div style={{fontWeight:800, fontSize:34, lineHeight:1.05, color:'var(--text)'}}>
              {it.title}
            </div>
            <div style={{alignSelf:'flex-end', fontWeight:800, fontSize:22, color:'var(--text)'}}>
              {String(it.i+1).padStart(2,'0')}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
