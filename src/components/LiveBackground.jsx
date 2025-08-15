import { useEffect, useRef } from 'react'

/**
 * 고급 효과 없이도 부드러운 드리프트 + 패럴랙스
 * - background.jpg를 미세하게 이동/확대
 * - 마우스 움직임에 따라 몇 px만 패럴랙스
 * - pointer-events: none 으로 클릭 간섭 없음
 */
export default function LiveBackground({ parallax = true }) {
  const raf = useRef(0)

  useEffect(() => {
    if (!parallax) return
    const onMove = (e) => {
      const { innerWidth: w, innerHeight: h } = window
      const x = (e.clientX / w - 0.5) * 6   // 최대 ±6px
      const y = (e.clientY / h - 0.5) * 6
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', `${x.toFixed(2)}px`)
        document.documentElement.style.setProperty('--my', `${y.toFixed(2)}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf.current)
      document.documentElement.style.removeProperty('--mx')
      document.documentElement.style.removeProperty('--my')
    }
  }, [parallax])

  return (
    <>
      <div className="live-bg" aria-hidden="true" />
      <div className="live-bg-overlay" aria-hidden="true" />
    </>
  )
}
