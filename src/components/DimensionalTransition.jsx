import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Spectacular dimensional travel transition effect
 * Shows portal opening, page preview, and teleportation
 */
export default function DimensionalTransition({ isActive, targetUrl, onComplete }) {
  const [stage, setStage] = useState('idle') // idle -> portal -> preview -> travel -> complete
  const navigate = useNavigate()

  useEffect(() => {
    if (!isActive) return

    const sequence = async () => {
      // Stage 1: Portal opening (1s)
      setStage('portal')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Stage 2: Page preview (1.5s)
      setStage('preview')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Stage 3: Dimensional travel (1s)
      setStage('travel')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Stage 4: Complete transition
      setStage('complete')
      navigate(targetUrl)
      
      // Reset after navigation
      setTimeout(() => {
        setStage('idle')
        onComplete?.()
      }, 500)
    }

    sequence()
  }, [isActive, targetUrl, navigate, onComplete])

  if (stage === 'idle') return null

  return (
    <div 
      className="dimensional-transition"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        pointerEvents: 'auto'
      }}
    >
      {/* Stage 1: Portal Opening */}
      {stage === 'portal' && (
        <div
          className="portal-opening"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Expanding Portal Ring */}
          <div
            style={{
              width: '100px',
              height: '100px',
              border: '5px solid rgba(255, 149, 0, 0.8)',
              borderRadius: '50%',
              animation: 'portalExpand 1s ease-out forwards',
              boxShadow: `
                0 0 50px rgba(255, 149, 0, 0.8),
                0 0 100px rgba(255, 149, 0, 0.5),
                inset 0 0 30px rgba(255, 149, 0, 0.3)
              `
            }}
          />
          
          {/* Energy Sparks */}
          {Array.from({length: 20}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: '#ff9500',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%) 
                  rotate(${i * 18}deg) 
                  translateX(0px)
                `,
                animation: `sparkExplosion 1s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
                boxShadow: '0 0 10px #ff9500'
              }}
            />
          ))}
        </div>
      )}

      {/* Stage 2: Page Preview */}
      {stage === 'preview' && (
        <div
          className="page-preview"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at center, 
                transparent 40%, 
                rgba(255, 149, 0, 0.1) 50%, 
                rgba(0, 0, 0, 0.8) 70%
              )
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Burning Portal Frame */}
          <div
            style={{
              width: '60vw',
              height: '60vh',
              background: `
                radial-gradient(circle at center, 
                  rgba(60, 20, 0, 0.95) 0%,
                  rgba(100, 30, 0, 0.9) 30%,
                  rgba(40, 15, 0, 0.85) 70%,
                  rgba(20, 5, 0, 0.9) 100%
                )
              `,
              border: 'none',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: 'previewZoom 1.5s ease-in-out',
              overflow: 'hidden',
              boxShadow: `
                0 0 100px rgba(255, 100, 0, 0.8),
                0 0 200px rgba(255, 149, 0, 0.6),
                inset 0 0 100px rgba(255, 50, 0, 0.3)
              `
            }}
          >
            {/* Burning Border Effect */}
            <div style={{
              position: 'absolute',
              inset: '-5px',
              background: `
                linear-gradient(45deg, 
                  transparent 0%,
                  rgba(255, 100, 0, 0.3) 25%,
                  rgba(255, 149, 0, 0.5) 50%,
                  rgba(255, 50, 0, 0.3) 75%,
                  transparent 100%
                )
              `,
              borderRadius: '20px',
              animation: 'flameBorder 3s ease-in-out infinite',
              filter: 'blur(8px)'
            }} />

            {/* Fire Particles around border */}
            {Array.from({length: 25}).map((_, i) => (
              <div
                key={`fire-${i}`}
                style={{
                  position: 'absolute',
                  width: `${3 + Math.random() * 6}px`,
                  height: `${8 + Math.random() * 15}px`,
                  background: `
                    linear-gradient(0deg, 
                      rgba(255, 50, 0, 0.9) 0%,
                      rgba(255, 149, 0, 0.7) 50%,
                      rgba(255, 200, 0, 0.5) 100%
                    )
                  `,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  left: `${Math.random() * 100}%`,
                  top: i < 8 ? '0%' : i < 16 ? '100%' : Math.random() < 0.5 ? '0%' : '100%',
                  animation: `fireFlicker ${1 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  filter: 'blur(1px)',
                  zIndex: 1
                }}
              />
            ))}
            {/* Burning Text Content */}
            <div style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 10
            }}>
              {/* Main Title with Fire Typography */}
              <div style={{
                fontSize: '72px',
                fontWeight: '900',
                fontFamily: '"Creepster", "Chiller", "Bebas Neue", system-ui, serif',
                color: '#ffffff',
                textShadow: `
                  0 0 20px rgba(255, 50, 0, 1),
                  0 0 40px rgba(255, 100, 0, 0.9),
                  0 0 60px rgba(255, 149, 0, 0.8),
                  0 0 80px rgba(255, 50, 0, 0.7),
                  3px 3px 0px rgba(150, 0, 0, 0.8),
                  6px 6px 0px rgba(100, 0, 0, 0.6)
                `,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: `
                  linear-gradient(45deg, 
                    #ffff00 0%, 
                    #ff6600 20%, 
                    #ff0000 40%, 
                    #ffff00 60%, 
                    #ff9900 80%, 
                    #ff0000 100%
                  )
                `,
                backgroundSize: '600% 600%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'burningText 3s ease-in-out infinite',
                marginBottom: '25px',
                filter: 'drop-shadow(0 0 15px rgba(255, 100, 0, 0.8))',
                transform: 'perspective(500px) rotateX(10deg)'
              }}>
                {targetUrl?.includes('/p/1') && 'PACKET'}
                {targetUrl?.includes('/p/2') && 'CIPHER'}
                {targetUrl?.includes('/p/3') && 'PROTOCOL'}
                {targetUrl?.includes('/p/4') && 'ARCHITECTURE'}
                {targetUrl?.includes('/p/5') && 'ASSEMBLY'}
                {targetUrl?.includes('/p/6') && 'BLOCKCHAIN'}
                {targetUrl?.includes('/p/7') && 'BINARY'}
                {targetUrl?.includes('/p/8') && 'QUANTUM'}
                {targetUrl?.includes('/p/9') && 'TERMINAL'}
                {targetUrl?.includes('/p/10') && 'NEURAL'}
              </div>

              {/* Burning Subtitle */}
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                color: '#ffcc00',
                textShadow: `
                  0 0 10px rgba(255, 150, 0, 0.9),
                  0 0 20px rgba(255, 100, 0, 0.7),
                  0 0 30px rgba(255, 50, 0, 0.5),
                  2px 2px 0px rgba(180, 50, 0, 0.8)
                `,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '35px',
                opacity: 0.95,
                animation: 'emberGlow 2.5s ease-in-out infinite alternate'
              }}>
                {targetUrl?.includes('/p/1') && 'Snow Storm'}
                {targetUrl?.includes('/p/2') && 'Encryption'}
                {targetUrl?.includes('/p/3') && 'Network Layer'}
                {targetUrl?.includes('/p/4') && 'ARM vs x86-64'}
                {targetUrl?.includes('/p/5') && 'Low Level'}
                {targetUrl?.includes('/p/6') && 'Decentralized'}
                {targetUrl?.includes('/p/7') && 'Ocean Depth'}
                {targetUrl?.includes('/p/8') && 'Computation'}
                {targetUrl?.includes('/p/9') && 'Command Line'}
                {targetUrl?.includes('/p/10') && 'Intelligence'}
              </div>

              {/* Infernal Status */}
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: '"Creepster", "Chiller", monospace',
                color: '#ff6600',
                textShadow: `
                  0 0 15px rgba(255, 100, 0, 1),
                  0 0 25px rgba(255, 50, 0, 0.8),
                  1px 1px 0px rgba(150, 0, 0, 0.9)
                `,
                letterSpacing: '0.15em',
                opacity: 0.95,
                position: 'relative'
              }}>
                <span style={{
                  display: 'inline-block',
                  animation: 'infernalBlink 2s ease-in-out infinite'
                }}>
                  🔥 PORTAL INFERNO ACTIVATED 🔥
                </span>
                
                {/* Burning Loading Bar */}
                <div style={{
                  width: '350px',
                  height: '4px',
                  background: 'rgba(100, 0, 0, 0.6)',
                  margin: '20px auto',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 100, 0, 0.4)',
                  boxShadow: '0 0 10px rgba(255, 50, 0, 0.5)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: `
                      linear-gradient(90deg, 
                        rgba(255, 0, 0, 0.9) 0%,
                        rgba(255, 100, 0, 1) 30%,
                        rgba(255, 200, 0, 0.9) 50%,
                        rgba(255, 100, 0, 1) 70%,
                        rgba(255, 0, 0, 0.9) 100%
                      )
                    `,
                    animation: 'fireBeam 2s ease-in-out infinite'
                  }} />
                </div>
              </div>
            </div>

            {/* Floating Particles around preview */}
            {Array.from({length: 15}).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: 'var(--accent)',
                  borderRadius: '50%',
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animation: `floatParticle ${2 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 15px var(--accent)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stage 3: Dimensional Travel */}
      {stage === 'travel' && (
        <div
          className="dimensional-travel"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Tunnel Effect */}
          {Array.from({length: 8}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${200 + i * 200}px`,
                height: `${200 + i * 200}px`,
                border: '2px solid rgba(255, 149, 0, 0.3)',
                borderRadius: '50%',
                animation: `tunnelRush 1s linear forwards`,
                animationDelay: `${i * 0.1}s`,
                boxShadow: `0 0 ${30 + i * 10}px rgba(255, 149, 0, 0.4)`
              }}
            />
          ))}

          {/* Speed Lines */}
          {Array.from({length: 50}).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: `${20 + Math.random() * 100}px`,
                background: `linear-gradient(0deg, 
                  transparent 0%, 
                  rgba(255, 149, 0, 0.8) 50%, 
                  transparent 100%
                )`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `speedLine 1s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}

          {/* Central Light */}
          <div
            style={{
              width: '100px',
              height: '100px',
              background: `
                radial-gradient(circle, 
                  rgba(255, 255, 255, 1) 0%, 
                  rgba(255, 149, 0, 0.8) 30%, 
                  transparent 70%
                )
              `,
              borderRadius: '50%',
              animation: 'finalFlash 1s ease-out',
              filter: 'blur(10px)'
            }}
          />
        </div>
      )}
    </div>
  )
}