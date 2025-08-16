import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DimensionalTransition from './DimensionalTransition.jsx'

/**
 * Linear Portal Carousel
 * - Portals rotate in a straight line from center
 * - Orange/yellow magical effects
 * - No central image, just rotating dimensional portals
 */
export default function PortalCarousel({ items, cardSize={w:200,h:280} }) {
  const N = items.length
  const [rotation, setRotation] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const animationRef = useRef()

  // Handle dimensional travel
  const handlePortalClick = (e, href) => {
    e.preventDefault()
    if (isTransitioning) return
    
    setTargetUrl(href)
    setIsTransitioning(true)
  }

  const onTransitionComplete = () => {
    setIsTransitioning(false)
    setTargetUrl('')
  }

  // Mouse wheel handler
  const handleWheel = (e) => {
    if (isTransitioning) return
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? 5 : -5 // Scroll sensitivity
    setRotation(prev => prev + delta)
  }

  // Auto-rotation animation
  useEffect(() => {
    if (isHovering || isTransitioning) return
    
    const animate = () => {
      setRotation(prev => prev + 0.4)
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovering])

  const portalCards = useMemo(() => {
    const spacing = 280 // distance between cards
    const viewportWidth = window.innerWidth || 1200
    const totalWidth = N * spacing
    
    return items.map((item, i) => {
      // Create infinite scrolling effect from right to left
      const scrollOffset = (rotation * 3) % totalWidth
      const basePosition = (i * spacing) - scrollOffset
      
      // Wrap cards around when they go off screen
      let x = basePosition
      if (x < -viewportWidth/2 - 200) {
        x += totalWidth
      } else if (x > viewportWidth/2 + 200) {
        x -= totalWidth
      }
      
      // Add wave motion
      const waveOffset = Math.sin((rotation + i * 30) * Math.PI / 180) * 25
      x += waveOffset
      const y = Math.sin((rotation + i * 45) * Math.PI / 180) * 20
      
      // Scale and opacity based on distance from screen center
      const distanceFromCenter = Math.abs(x) / (viewportWidth / 2)
      const scale = Math.max(0.7, 1 - distanceFromCenter * 0.3)
      const opacity = Math.max(0.5, 1 - distanceFromCenter * 0.4)
      
      // Gentle tilt effects instead of full rotation
      const rotateY = Math.sin((rotation + i * 36) * Math.PI / 180) * 15
      const rotateZ = Math.sin((rotation + i * 45) * Math.PI / 180) * 10
      
      return {
        ...item,
        x,
        y,
        scale,
        opacity,
        rotateY,
        rotateZ,
        zIndex: Math.round(1000 - Math.abs(x) / 10)
      }
    })
  }, [items, rotation, N])

  return (
    <div 
      className="portal-container"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'none' // Prevent container from blocking clicks
      }}
      onWheel={handleWheel}
    >

      {/* Enhanced Orange Circle Effects - Much Larger */}
      {/* Main rotating energy rings - Skip first layer (start from index 1) */}
      {Array.from({length: 3}).map((_, ringIndex) => {
        const actualIndex = ringIndex + 1; // Skip first ring
        return (
          <div
            key={`ring-${actualIndex}`}
            style={{
              position: 'absolute',
              width: `${600 + actualIndex * 300}px`,
              height: `${600 + actualIndex * 300}px`,
              border: `3px solid rgba(255, 149, 0, ${0.5 - actualIndex * 0.1})`,
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: `
                translate(-50%, -50%) 
                rotate(${(rotation * (1 + actualIndex * 0.3)) % 360}deg)
              `,
              boxShadow: `
                0 0 ${80 + actualIndex * 40}px rgba(255, 149, 0, ${0.4 - actualIndex * 0.05}),
                inset 0 0 ${50 + actualIndex * 25}px rgba(255, 204, 0, ${0.3 - actualIndex * 0.05})
              `,
              zIndex: 400 - actualIndex * 10
            }}
          />
        );
      })}

      {/* Pulsing energy waves - Much Larger */}
      {Array.from({length: 3}).map((_, waveIndex) => (
        <div
          key={`wave-${waveIndex}`}
          style={{
            position: 'absolute',
            width: `${1200 + waveIndex * 400}px`,
            height: `${1200 + waveIndex * 400}px`,
            border: '2px solid rgba(255, 149, 0, 0.3)',
            borderRadius: '50%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `energyWave ${5 + waveIndex * 2}s ease-in-out infinite`,
            animationDelay: `${waveIndex * 1.5}s`,
            zIndex: 300
          }}
        />
      ))}


      {/* Mystical runes rotating around - Much Larger Orbit */}
      {Array.from({length: 12}).map((_, i) => (
        <div
          key={`rune-${i}`}
          style={{
            position: 'absolute',
            width: '30px',
            height: '30px',
            left: '50%',
            top: '50%',
            transform: `
              translate(-50%, -50%) 
              rotate(${(rotation * 0.5 + i * 30) % 360}deg) 
              translateX(${400 + (i % 3) * 100}px)
              rotate(${-(rotation * 0.5 + i * 30) % 360}deg)
            `,
            fontSize: `${24 + (i % 3) * 6}px`,
            color: `rgba(255, ${149 + (i % 3) * 20}, 0, ${0.6 + (i % 3) * 0.1})`,
            textShadow: `0 0 ${15 + (i % 3) * 5}px rgba(255, 149, 0, 0.9)`,
            zIndex: 550,
            fontWeight: 'bold'
          }}
        >
          {['✦', '⟡', '◈'][i % 3]}
        </div>
      ))}

      {/* Linear Portal Cards */}
      <div 
        className="portal-cards"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          perspective: '1500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto' // Enable clicks for cards container
        }}
      >
        {portalCards.map((card, i) => (
          <div
            key={i}
            className="portal-card"
            onClick={(e) => handlePortalClick(e, card.href)}
            style={{
              position: 'absolute',
              width: `${cardSize.w}px`,
              height: `${cardSize.h}px`,
              left: '50%',
              top: '50%',
              transform: `
                translate(-50%, -50%) 
                translate3d(${card.x}px, ${card.y}px, 0)
                rotateY(${card.rotateY}deg)
                rotateZ(${card.rotateZ}deg)
                scale(${card.scale})
              `,
              transformStyle: 'preserve-3d',
              opacity: card.opacity,
              zIndex: Math.max(1000, card.zIndex), // Ensure cards are above other elements
              background: `
                linear-gradient(135deg, 
                  rgba(40, 25, 10, 0.95), 
                  rgba(60, 35, 15, 0.85)
                )
              `,
              border: '2px solid rgba(255, 149, 0, 0.5)',
              borderRadius: '15px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: 'var(--text)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              pointerEvents: 'auto', // Ensure cards can be clicked
              boxShadow: `
                0 0 25px rgba(255, 149, 0, 0.3),
                0 8px 20px rgba(0, 0, 0, 0.4),
                inset 0 0 15px rgba(255, 204, 0, 0.1)
              `,
              backdropFilter: 'blur(15px)'
            }}
            onMouseEnter={(e) => {
              setIsHovering(true) // Stop rotation when hovering over any card
              e.currentTarget.style.transform = `
                translate(-50%, -50%) 
                translate3d(${card.x}px, ${card.y}px, 0)
                rotateY(${card.rotateY}deg)
                rotateZ(${card.rotateZ}deg)
                scale(${card.scale * 1.15})
              `
              e.currentTarget.style.boxShadow = `
                0 0 40px rgba(255, 149, 0, 0.6),
                0 15px 35px rgba(0, 0, 0, 0.5),
                inset 0 0 25px rgba(255, 204, 0, 0.2)
              `
              e.currentTarget.style.borderColor = 'rgba(255, 149, 0, 0.8)'
            }}
            onMouseLeave={(e) => {
              setIsHovering(false) // Resume rotation when leaving card
              e.currentTarget.style.transform = `
                translate(-50%, -50%) 
                translate3d(${card.x}px, ${card.y}px, 0)
                rotateY(${card.rotateY}deg)
                rotateZ(${card.rotateZ}deg)
                scale(${card.scale})
              `
              e.currentTarget.style.boxShadow = `
                0 0 25px rgba(255, 149, 0, 0.3),
                0 8px 20px rgba(0, 0, 0, 0.4),
                inset 0 0 15px rgba(255, 204, 0, 0.1)
              `
              e.currentTarget.style.borderColor = 'rgba(255, 149, 0, 0.5)'
            }}
          >
            <div style={{
              fontSize: '11px',
              opacity: 0.8,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textShadow: '0 0 8px rgba(255, 149, 0, 0.5)'
            }}>
              Dimension {String(i + 1).padStart(2, '0')}
            </div>
            
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 12px rgba(255, 149, 0, 0.6)',
              lineHeight: '1.2'
            }}>
              {card.title}
            </div>
            
            <div style={{
              fontSize: '13px',
              opacity: 0.9,
              textAlign: 'center',
              textShadow: '0 0 8px rgba(255, 204, 0, 0.4)'
            }}>
              Enter Portal
            </div>
          </div>
        ))}
      </div>

      {/* Dimensional Transition Effect */}
      <DimensionalTransition 
        isActive={isTransitioning}
        targetUrl={targetUrl}
        onComplete={onTransitionComplete}
      />

    </div>
  )
}