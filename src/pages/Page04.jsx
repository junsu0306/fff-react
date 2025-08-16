import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Text, Html, Float } from '@react-three/drei'
import BackButton from '../components/BackButton.jsx'

/**
 * INFERNAL CPU ARCHITECTURES
 * ARM vs x86-64 Technical Analysis with 3D Models
 * Hell dungeon theme with professional technical content
 */

// 3D CPU Model Component with fallback
function CPUModel({ modelPath, position, rotation, scale = 1, selected = false, isArm = false }) {
  const meshRef = useRef()
  const { scene } = useGLTF(modelPath)
  
  // Add rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      // Add glow effect when selected
      if (selected) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    }
  })
  
  return (
    <Float
      speed={2}
      rotationIntensity={selected ? 0.5 : 0.2}
      floatIntensity={selected ? 0.5 : 0.2}
    >
      <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
        {scene ? (
          // Use actual 3D model
          <primitive object={scene.clone()} />
        ) : (
          // Fallback: 3D geometric representation
          <mesh>
            {isArm ? (
              // ARM: Simpler, hexagonal design
              <cylinderGeometry args={[1, 1, 0.3, 6]} />
            ) : (
              // x86: More complex, rectangular design
              <boxGeometry args={[2, 0.3, 2]} />
            )}
            <meshStandardMaterial 
              color={selected ? (isArm ? "#ff6600" : "#00ff9d") : "#666666"}
              metalness={0.8}
              roughness={0.2}
              emissive={selected ? (isArm ? "#ff3300" : "#00aa77") : "#000000"}
              emissiveIntensity={selected ? 0.3 : 0}
            />
          </mesh>
        )}
        
        {/* CPU pins/contacts at bottom */}
        <group position={[0, -0.2, 0]}>
          {Array.from({ length: isArm ? 12 : 16 }, (_, i) => (
            <mesh key={i} position={[
              (Math.cos((i / (isArm ? 12 : 16)) * Math.PI * 2) * 0.8),
              0,
              (Math.sin((i / (isArm ? 12 : 16)) * Math.PI * 2) * 0.8)
            ]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1]} />
              <meshStandardMaterial color="#888888" metalness={1} />
            </mesh>
          ))}
        </group>
        
        {/* Label on top */}
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[1.5, 0.8]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* Infernal glow effect */}
      <pointLight 
        position={position} 
        intensity={selected ? 2 : 1} 
        color={selected ? "#ff6600" : "#ff3300"} 
        distance={5}
      />
    </Float>
  )
}

// Infernal particle system for 3D
function InfernalParticles() {
  const particlesRef = useRef()
  const particleCount = 100
  
  // Create particle positions
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20  
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
      // Make particles float upward
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.01 // Move upward
        if (positions[i] > 10) positions[i] = -10 // Reset when too high
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ff6600" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  )
}

// Preload models from GLB folder
useGLTF.preload('/GLB/arm_cpu.glb')
useGLTF.preload('/GLB/intel_cpu.glb')

export default function Page04() {
  const [selectedArch, setSelectedArch] = useState('ARM')
  const [comparisonMode, setComparisonMode] = useState(false)

  const architectures = {
    ARM: {
      name: 'ARM ARCHITECTURE',
      subtitle: 'RISC Philosophy',
      color: '#ff6600',
      glowColor: 'rgba(255, 102, 0, 0.8)',
      description: 'Reduced Instruction Set Computer (RISC) architecture focused on simplicity and efficiency',
      technicalSpecs: {
        instructionSet: 'Fixed 32-bit instructions',
        pipeline: '5-stage in-order pipeline',
        powerConsumption: '1-5W typical',
        frequency: '1-3 GHz range',
        architecture: 'Load/Store architecture'
      },
      features: [
        'Simple, uniform instruction format',
        'Load/Store architecture - memory access only through specific instructions',
        'Large register file (32 general-purpose registers)',
        'Conditional execution on most instructions',
        'NEON SIMD extensions for multimedia processing',
        'Thumb instruction set for code density',
        'Advanced power management (big.LITTLE)',
        'Hardware virtualization support'
      ],
      advantages: [
        'Excellent power efficiency',
        'Predictable performance',
        'Simpler compiler optimization',
        'Lower silicon complexity',
        'Better thermal characteristics'
      ],
      useCases: 'Mobile devices, embedded systems, IoT, Apple Silicon Macs'
    },
    X86: {
      name: 'x86-64 ARCHITECTURE', 
      subtitle: 'CISC Dominance',
      color: '#00ff9d',
      glowColor: 'rgba(0, 255, 157, 0.8)',
      description: 'Complex Instruction Set Computer (CISC) with variable-length instructions and extensive legacy support',
      technicalSpecs: {
        instructionSet: 'Variable 1-15 byte instructions',
        pipeline: '14-20+ stage out-of-order',
        powerConsumption: '15-125W+ typical',
        frequency: '2-5+ GHz range',
        architecture: 'Register/Memory operations'
      },
      features: [
        'Variable-length instruction encoding',
        'Complex addressing modes (base+index+displacement)',
        'Extensive instruction set (1000+ instructions)',
        'Out-of-order execution with register renaming',
        'Advanced branch prediction',
        'Multi-level cache hierarchy',
        'AVX-512 vector extensions (512-bit SIMD)',
        'Hardware transactional memory (TSX)'
      ],
      advantages: [
        'High single-thread performance',
        'Mature ecosystem and tooling',
        'Extensive software compatibility',
        'Advanced compiler optimizations',
        'Superior floating-point performance'
      ],
      useCases: 'Desktop computers, servers, workstations, high-performance computing'
    }
  }

  // 3D Scene Component
  const Scene3D = () => {
    return (
      <>
        {/* Infernal lighting setup */}
        <ambientLight intensity={0.2} color="#330000" />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff6600" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff0000" />
        <spotLight 
          position={[0, 15, 0]} 
          angle={0.4} 
          penumbra={1} 
          intensity={2} 
          color="#ff9500"
          castShadow
        />
        
        {/* Hell environment */}
        <Environment preset="night" />
        
        {/* Background fire effect */}
        <mesh position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial 
            color="#660000" 
            transparent 
            opacity={0.3}
          />
        </mesh>
        
        {comparisonMode ? (
          // Comparison mode: show both models
          <>
            <CPUModel 
              modelPath="/GLB/arm_cpu.glb"
              position={[-3, 0, 0]}
              rotation={[0, Math.PI / 6, 0]}
              scale={12}
              selected={selectedArch === 'ARM'}
              isArm={true}
            />
            <CPUModel 
              modelPath="/GLB/intel_cpu.glb"
              position={[3, 0, 0]}
              rotation={[0, -Math.PI / 6, 0]}
              scale={0.6}
              selected={selectedArch === 'X86'}
              isArm={false}
            />
            
            {/* Infernal labels */}
            <Text
              position={[-3, -2.5, 0]}
              fontSize={0.4}
              color="#ff6600"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              ARM FORTRESS
            </Text>
            <Text
              position={[3, -2.5, 0]}
              fontSize={0.4}
              color="#00ff9d"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              x86-64 EMPIRE
            </Text>
            
            {/* Connection energy beam */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 6, 8]} />
              <meshBasicMaterial 
                color="#ffaa00" 
                transparent 
                opacity={0.7}
              />
            </mesh>
          </>
        ) : (
          // Single model view
          <>
            <CPUModel 
              modelPath={selectedArch === 'ARM' ? '/GLB/arm_cpu.glb' : '/GLB/intel_cpu.glb'}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              scale={selectedArch === 'ARM' ? 20 : 1}
              selected={true}
              isArm={selectedArch === 'ARM'}
            />
            
            {/* Architecture label with infernal styling */}
            <Text
              position={[0, -3, 0]}
              fontSize={0.5}
              color={architectures[selectedArch].color}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {architectures[selectedArch].name}
            </Text>
            
            {/* Floating technical specs */}
            <Text
              position={[0, -3.8, 0]}
              fontSize={0.3}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              {architectures[selectedArch].subtitle}
            </Text>
          </>
        )}
        
        {/* Infernal particle effects */}
        <InfernalParticles />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={4}
          maxDistance={20}
          autoRotate={!comparisonMode}
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 1.5}
        />
      </>
    )
  }

  const handleArchSelect = (arch) => {
    setSelectedArch(arch)
  }

  const toggleComparison = () => {
    setComparisonMode(!comparisonMode)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 50%, #1a0505 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <BackButton />
      
      {/* 3D Canvas */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh'
      }}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <Suspense fallback={
            <Html center>
              <div style={{
                color: '#ff6600',
                fontSize: '20px',
                fontFamily: '"Orbitron", monospace',
                textShadow: '0 0 15px #ff6600',
                textAlign: 'center'
              }}>
                🔥 Loading Infernal CPUs... 🔥
                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                  Summoning ARM & x86-64 from the depths
                </div>
              </div>
            </Html>
          }>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Control panels */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '20px',
        zIndex: 10
      }}>
        {/* Architecture selector */}
        <div style={{
          display: 'flex',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid rgba(255, 100, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(255, 100, 0, 0.3)'
        }}>
          {Object.keys(architectures).map(arch => (
            <button
              key={arch}
              onClick={() => handleArchSelect(arch)}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: '"Orbitron", monospace',
                border: `2px solid ${architectures[arch].color}`,
                borderRadius: '8px',
                background: selectedArch === arch 
                  ? architectures[arch].color 
                  : 'rgba(0, 0, 0, 0.7)',
                color: selectedArch === arch ? '#000' : architectures[arch].color,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: selectedArch === arch ? 'none' : `0 0 10px ${architectures[arch].color}`,
                boxShadow: selectedArch === arch 
                  ? `0 0 20px ${architectures[arch].color}`
                  : 'none'
              }}
            >
              {architectures[arch].name}
            </button>
          ))}
        </div>

        {/* Comparison mode toggle */}
        <button
          onClick={toggleComparison}
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: '"Orbitron", monospace',
            border: '2px solid #ff6600',
            borderRadius: '8px',
            background: comparisonMode ? '#ff6600' : 'rgba(0, 0, 0, 0.8)',
            color: comparisonMode ? '#000' : '#ff6600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textShadow: comparisonMode ? 'none' : '0 0 10px #ff6600',
            boxShadow: comparisonMode ? '0 0 25px #ff6600' : 'none'
          }}
        >
          {comparisonMode ? '📊 SINGLE VIEW' : '⚔️ INFERNAL DUEL'}
        </button>
      </div>

      {/* Technical info panel */}
      <div style={{
        position: 'absolute',
        top: '120px',
        right: '40px',
        width: comparisonMode ? '700px' : '450px',
        maxHeight: '65vh',
        overflow: 'auto',
        background: 'rgba(0, 0, 0, 0.92)',
        border: `2px solid ${architectures[selectedArch].color}`,
        borderRadius: '12px',
        padding: '24px',
        backdropFilter: 'blur(15px)',
        boxShadow: `0 0 30px ${architectures[selectedArch].glowColor}`,
        zIndex: 10
      }}>
        {comparisonMode ? (
          // Comparison mode: show both architectures
          <div style={{ display: 'flex', gap: '30px' }}>
            {Object.values(architectures).map((arch, index) => (
              <div key={index} style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 12px',
                  fontSize: '16px',
                  color: arch.color,
                  fontFamily: '"Orbitron", monospace',
                  textShadow: `0 0 8px ${arch.color}`
                }}>
                  {arch.name}
                </h3>
                
                <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '15px' }}>
                  {arch.description}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    color: arch.color,
                    fontFamily: '"Orbitron", monospace'
                  }}>
                    TECHNICAL SPECS
                  </h4>
                  <div style={{ fontSize: '10px', color: '#aaa', lineHeight: '1.4' }}>
                    <div>Instructions: {arch.technicalSpecs.instructionSet}</div>
                    <div>Pipeline: {arch.technicalSpecs.pipeline}</div>
                    <div>Power: {arch.technicalSpecs.powerConsumption}</div>
                    <div>Frequency: {arch.technicalSpecs.frequency}</div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    color: arch.color,
                    fontFamily: '"Orbitron", monospace'
                  }}>
                    ADVANTAGES
                  </h4>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    fontSize: '10px',
                    color: '#aaa',
                    lineHeight: '1.3'
                  }}>
                    {arch.advantages.map((advantage, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>
                        🔹 {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single architecture view
          <div>
            <h2 style={{
              margin: '0 0 8px',
              fontSize: '18px',
              color: architectures[selectedArch].color,
              fontFamily: '"Orbitron", monospace',
              textShadow: `0 0 10px ${architectures[selectedArch].color}`
            }}>
              {architectures[selectedArch].name}
            </h2>
            
            <div style={{
              fontSize: '12px',
              color: architectures[selectedArch].color,
              marginBottom: '15px',
              opacity: 0.8
            }}>
              {architectures[selectedArch].subtitle}
            </div>
            
            <p style={{
              margin: '0 0 20px',
              fontSize: '13px',
              color: '#ccc',
              lineHeight: '1.5'
            }}>
              {architectures[selectedArch].description}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: '14px',
                color: architectures[selectedArch].color,
                fontFamily: '"Orbitron", monospace'
              }}>
                TECHNICAL SPECIFICATIONS
              </h3>
              <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
                <div>📟 Instructions: {architectures[selectedArch].technicalSpecs.instructionSet}</div>
                <div>⚙️ Pipeline: {architectures[selectedArch].technicalSpecs.pipeline}</div>
                <div>🔋 Power: {architectures[selectedArch].technicalSpecs.powerConsumption}</div>
                <div>⚡ Frequency: {architectures[selectedArch].technicalSpecs.frequency}</div>
                <div>🏗️ Architecture: {architectures[selectedArch].technicalSpecs.architecture}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: '14px',
                color: architectures[selectedArch].color,
                fontFamily: '"Orbitron", monospace'
              }}>
                KEY FEATURES
              </h3>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '11px',
                color: '#aaa',
                lineHeight: '1.4'
              }}>
                {architectures[selectedArch].features.map((feature, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    🔸 {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: '14px',
                color: architectures[selectedArch].color,
                fontFamily: '"Orbitron", monospace'
              }}>
                ADVANTAGES
              </h3>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '11px',
                color: '#aaa',
                lineHeight: '1.4'
              }}>
                {architectures[selectedArch].advantages.map((advantage, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    ✅ {advantage}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              padding: '12px',
              background: `${architectures[selectedArch].color}20`,
              borderRadius: '8px',
              border: `1px solid ${architectures[selectedArch].color}40`
            }}>
              <div style={{
                fontSize: '12px',
                color: architectures[selectedArch].color,
                fontWeight: 'bold',
                marginBottom: '6px'
              }}>
                PRIMARY USE CASES
              </div>
              <div style={{ fontSize: '11px', color: '#ccc' }}>
                {architectures[selectedArch].useCases}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}