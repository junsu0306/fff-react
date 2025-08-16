import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import BackButton from '../components/BackButton.jsx'

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: '14px'
  }}>
    <div>3D 로딩 실패</div>
    <button 
      onClick={resetErrorBoundary}
      style={{
        marginTop: '8px',
        padding: '4px 8px',
        background: 'transparent',
        border: '1px solid #ff6b6b',
        color: '#ff6b6b',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      다시 시도
    </button>
  </div>
)

export default function Page04() {
  const canvasRef = useRef(null)
  const [selectedArch, setSelectedArch] = useState('ARM')
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef()
  const timeRef = useRef(0)

  const architectures = {
    ARM: {
      name: 'ARM 아키텍처',
      color: '#00ff9d',
      analogy: 'RISC 기반 설계',
      description: 'Reduced Instruction Set Computer로 단순화된 명령어 집합을 사용합니다',
      characteristics: [
        '고정 길이 32비트 명령어 (ARMv8에서 일부 가변)',
        'Load/Store 아키텍처로 메모리 접근 최적화',
        '단순한 파이프라인으로 전력 효율성 극대화',
        '대칭적 멀티프로세싱(SMP) 지원',
        'NEON SIMD와 SVE 벡터 확장 내장'
      ],
      pros: '저전력, 높은 성능/전력 비율',
      cons: '복잡한 연산시 명령어 수 증가'
    },
    X86: {
      name: 'x86-64 아키텍처',
      color: '#ff6b6b',
      analogy: 'CISC 기반 설계',
      description: 'Complex Instruction Set Computer로 복잡하고 다양한 명령어를 제공합니다',
      characteristics: [
        '가변 길이 명령어 (1-15바이트)',
        '복잡한 어드레싱 모드와 마이크로코드',
        '깊은 파이프라인과 고급 분기 예측',
        'Out-of-Order 실행과 슈퍼스칼라 구조',
        'AVX-512까지 확장된 벡터 명령어 지원'
      ],
      pros: '단일 스레드 고성능, 레거시 호환성',
      cons: '높은 전력 소모, 복잡한 디코딩'
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth * devicePixelRatio
    canvas.height = canvas.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const drawBackground = (time) => {
      ctx.clearRect(0, 0, width, height)
      
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
      gradient.addColorStop(0, 'rgba(0, 20, 40, 0.9)')
      gradient.addColorStop(0.5, 'rgba(0, 10, 25, 0.95)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.001 + i * 0.5) * 0.3 + 0.5) * width
        const y = (Math.cos(time * 0.0008 + i * 0.7) * 0.3 + 0.5) * height
        const size = Math.sin(time * 0.002 + i) * 1 + 2
        const alpha = Math.sin(time * 0.003 + i * 0.3) * 0.3 + 0.2
        
        ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      const gridSize = 40
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    const drawArchitecture = (time) => {
      const arch = architectures[selectedArch]
      const centerX = width / 2
      const centerY = height / 2

      if (selectedArch === 'ARM') {
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.001
          const radius = 80 + Math.sin(time * 0.002 + i) * 20
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          const size = 25 + Math.sin(time * 0.003 + i) * 5
          const alpha = 0.7 + Math.sin(time * 0.004 + i) * 0.3
          
          ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`
          ctx.fillRect(x - size/2, y - size/2, size, size)
          
          ctx.strokeStyle = arch.color
          ctx.lineWidth = 2
          ctx.strokeRect(x - size/2, y - size/2, size, size)
        }
        
        ctx.fillStyle = arch.color
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('정리된 명령어들', centerX, centerY + 140)
      } else {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 0.0015
          const radius = 90 + Math.sin(time * 0.002 + i) * 30
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          const width_rect = 15 + i * 8 + Math.sin(time * 0.003 + i) * 10
          const height_rect = 20 + Math.sin(time * 0.004 + i) * 5
          const alpha = 0.6 + Math.sin(time * 0.005 + i) * 0.4
          
          ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`
          ctx.fillRect(x - width_rect/2, y - height_rect/2, width_rect, height_rect)
          
          ctx.strokeStyle = arch.color
          ctx.lineWidth = 2
          ctx.strokeRect(x - width_rect/2, y - height_rect/2, width_rect, height_rect)
        }
        
        ctx.fillStyle = arch.color
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('다양한 크기 명령어들', centerX, centerY + 140)
      }
    }

    const animate = () => {
      timeRef.current += 16
      drawBackground(timeRef.current)
      drawArchitecture(timeRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedArch])

  const handleArchSelect = (arch) => {
    setSelectedArch(arch)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const CPUModel = ({ arch }) => {
    const modelPath = arch === 'ARM' ? '/GLB/arm_cpu.glb' : '/GLB/intel_cpu.glb'
    
    try {
      const { scene } = useGLTF(modelPath)
      
      return (
        <primitive 
          object={scene} 
          scale={arch === 'ARM' ? [35, 35, 35] : [3, 3, 3]}
          position={[0, 0, 0]}
        />
      )
    } catch (error) {
      console.error('GLB 로딩 실패:', error)
      return (
        <mesh>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color={arch === 'ARM' ? '#00ff9d' : '#ff6b6b'} />
        </mesh>
      )
    }
  }

  const ThreeDVisualization = ({ arch }) => {
    const [error, setError] = useState(false)

    if (error) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff6b6b',
          fontSize: '14px'
        }}>
          3D 모델 로딩 실패
        </div>
      )
    }

    return (
      <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        style={{ background: 'transparent' }}
        onError={() => setError(true)}
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        }>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2.5} />
          <directionalLight position={[-10, 10, 5]} intensity={2} />
          <directionalLight position={[0, -10, 5]} intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={1.5} />
          <pointLight position={[0, 15, 0]} intensity={2} />
          <CPUModel arch={arch} />
          <OrbitControls 
            enableZoom={true} 
            autoRotate 
            autoRotateSpeed={2}
            minDistance={1}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '200vh'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(0, 255, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, transparent 40%, rgba(0, 255, 157, 0.02) 50%, transparent 60%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '64px 24px 200px' }}>
        <BackButton />
        
        <div style={{ maxWidth: 1400, margin: '64px auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '56px',
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(45deg, #00ff9d, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              프로세서의 두 얼굴
            </h1>
            <p style={{
              fontSize: '18px',
              opacity: 0.8,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              컴퓨터의 두뇌인 프로세서, 어떤 방식으로 일할까요?<br/>
              
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {Object.keys(architectures).map(arch => (
              <button
                key={arch}
                onClick={() => handleArchSelect(arch)}
                style={{
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: `2px solid ${architectures[arch].color}`,
                  borderRadius: '12px',
                  background: selectedArch === arch 
                    ? architectures[arch].color 
                    : 'rgba(0, 0, 0, 0.7)',
                  color: selectedArch === arch ? '#000' : architectures[arch].color,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedArch === arch ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedArch === arch 
                    ? `0 0 20px ${architectures[arch].color}40`
                    : 'none'
                }}
              >
                {architectures[arch].name}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'start'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: `2px solid ${architectures[selectedArch].color}40`,
              borderRadius: '16px',
              padding: '32px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: architectures[selectedArch].color,
                  borderRadius: '50%',
                  marginRight: '12px',
                  boxShadow: `0 0 10px ${architectures[selectedArch].color}`
                }} />
                <h2 style={{
                  fontSize: '28px',
                  margin: 0,
                  color: architectures[selectedArch].color
                }}>
                  {architectures[selectedArch].name}
                </h2>
              </div>
              
              <div style={{
                background: `${architectures[selectedArch].color}10`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: `1px solid ${architectures[selectedArch].color}30`
              }}>
                <h3 style={{
                  fontSize: '20px',
                  margin: '0 0 12px',
                  color: architectures[selectedArch].color
                }}>
                  {architectures[selectedArch].analogy}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  margin: 0,
                  opacity: 0.9
                }}>
                  {architectures[selectedArch].description}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '18px',
                  margin: '0 0 16px',
                  color: architectures[selectedArch].color
                }}>
                  특징
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: 'none'
                }}>
                  {architectures[selectedArch].characteristics.map((char, i) => (
                    <li key={i} style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '8px',
                      opacity: 0.9
                    }}>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div style={{
                  background: 'rgba(0, 255, 100, 0.1)',
                  border: '1px solid rgba(0, 255, 100, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>장점</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff64' }}>
                    {architectures[selectedArch].pros}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 100, 100, 0.1)',
                  border: '1px solid rgba(255, 100, 100, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>단점</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6464' }}>
                    {architectures[selectedArch].cons}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateRows: '1fr auto',
              gap: '16px',
              height: '500px'
            }}>
              <div style={{
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.4)',
                border: `2px solid ${architectures[selectedArch].color}`,
                borderRadius: '16px',
                overflow: 'hidden',
                backdropFilter: 'blur(5px)'
              }}>
                <ThreeDVisualization arch={selectedArch} />
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: `2px solid ${architectures[selectedArch].color}`,
                borderRadius: '16px',
                overflow: 'hidden',
                backdropFilter: 'blur(5px)',
                height: '200px'
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    transition: 'all 0.5s ease'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: architectures[selectedArch].color,
                    fontWeight: 'bold'
                  }}>
                    {selectedArch === 'ARM' ? '모든 블록이 같은 크기' : '블록마다 크기가 다름'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                margin: '0 0 16px',
                color: '#00ff9d'
              }}>
                마이크로아키텍처 비교
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                opacity: 0.9,
                marginBottom: '16px'
              }}>
                두 아키텍처는 근본적으로 다른 설계 철학을 가지고 있습니다.
              </p>
              <ul style={{
                fontSize: '13px',
                lineHeight: '1.5',
                opacity: 0.8,
                paddingLeft: '16px',
                margin: 0
              }}>
                <li>ARM: 5-8단계 파이프라인, 순차 실행 최적화</li>
                <li>x86: 14-20단계 파이프라인, 비순차 실행</li>
                <li>분기 예측: ARM은 단순, x86은 다층 적응 예측</li>
                <li>캐시 구조: ARM은 통합형, x86은 분리형 계층</li>
                <li>명령어 디코딩: ARM은 직접, x86은 마이크로코드</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                margin: '0 0 16px',
                color: '#ff6b6b'
              }}>
                성능 특성 분석
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                opacity: 0.9,
                marginBottom: '16px'
              }}>
                각 아키텍처의 성능 특성과 최적화 영역을 비교합니다.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '13px'
              }}>
                <div style={{
                  background: 'rgba(0, 255, 157, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 157, 0.3)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#00ff9d', marginBottom: '4px' }}>ARM 특성</div>
                  <div style={{ opacity: 0.8, fontSize: '12px' }}>
                    • 높은 IPC (Instructions Per Cycle)<br/>
                    • 3-15W TDP (모바일)<br/>
                    • 메모리 대역폭 효율성<br/>
                    • 멀티코어 스케일링
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 107, 0.3)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#ff6b6b', marginBottom: '4px' }}>x86 특성</div>
                  <div style={{ opacity: 0.8, fontSize: '12px' }}>
                    • 높은 클록 주파수 (3-5GHz)<br/>
                    • 35-125W TDP (데스크톱)<br/>
                    • 복잡한 명령어 처리<br/>
                    • 단일 스레드 최적화
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              margin: '0 0 16px',
              color: '#00ff9d'
            }}>
              설계 철학의 차이
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              opacity: 0.9,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              ARM은 <strong>RISC 철학</strong>을 따라 단순한 명령어로 높은 효율성을 추구합니다.<br/>
              x86은 <strong>CISC 철학</strong>으로 복잡한 명령어를 통해 강력한 기능을 제공합니다.<br/>
              <br/>
              <span style={{ fontSize: '14px', opacity: 0.7 }}>
                이는 1980년대부터 시작된 두 가지 다른 컴퓨터 설계 접근법의 결과입니다.
              </span>
            </p>
          </div>

          <div style={{
            marginTop: '48px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '24px',
              margin: '0 0 24px',
              color: '#00ff9d',
              textAlign: 'center'
            }}>
              미래의 프로세서 기술
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(0, 255, 157, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 157, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 12px', color: '#00ff9d' }}>AI 전용 칩</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
                  신경망 처리에 최적화된 NPU(Neural Processing Unit)가 CPU와 함께 통합되어, 
                  AI 연산을 더 빠르고 효율적으로 처리합니다.
                </p>
              </div>
              <div style={{
                background: 'rgba(255, 107, 107, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 107, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 12px', color: '#ff6b6b' }}>양자 컴퓨팅</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
                  기존 비트 대신 큐비트를 사용하여 동시에 여러 상태를 처리할 수 있는 
                  혁신적인 컴퓨팅 기술이 개발되고 있습니다.
                </p>
              </div>
              <div style={{
                background: 'rgba(0, 212, 255, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 212, 255, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 12px', color: '#00d4ff' }}>3D 칩 적층</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
                  평면이 아닌 3차원으로 칩을 적층하여 더 많은 트랜지스터를 
                  작은 공간에 배치하는 기술이 발전하고 있습니다.
                </p>
              </div>
              <div style={{
                background: 'rgba(255, 193, 7, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 12px', color: '#ffc107' }}>광학 컴퓨팅</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
                  전자 대신 빛(광자)을 사용하여 정보를 처리하는 광학 프로세서로 
                  더 빠른 속도와 낮은 전력 소모를 실현하려고 합니다.
                </p>
              </div>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              opacity: 0.7,
              margin: 0
            }}>
              컴퓨터 기술은 계속 발전하여 우리의 일상을 더욱 편리하게 만들어갑니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
