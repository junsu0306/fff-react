import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import BackButton from '../components/BackButton.jsx'

const InfernalBinaryText = ({ position, text, color = '#ff6600' }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      // More intense floating motion like burning embers
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.004
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[2]) * 0.15
      // Add slight rotation for flame-like effect
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7 + position[1]) * 0.1
    }
  })

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={2.2}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  )
}

const InfernalBinaryOcean = () => {
  const binaryRefs = useRef([])
  const [binaryData, setBinaryData] = useState([])

  useEffect(() => {
    const generateInfernalBinaryField = () => {
      const data = []
      for (let i = 0; i < 1200; i++) {
        data.push({
          position: [
            (Math.random() - 0.5) * 120,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 120
          ],
          text: Math.random() > 0.6 ? '1' : '0',
          speed: Math.random() * 0.03 + 0.008,
          phase: Math.random() * Math.PI * 2,
          burnIntensity: Math.random()
        })
      }
      setBinaryData(data)
    }
    generateInfernalBinaryField()
  }, [])

  useFrame((state) => {
    binaryRefs.current.forEach((ref, index) => {
      if (ref && binaryData[index]) {
        const data = binaryData[index]
        // Floating like embers in hell
        ref.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * data.speed + data.phase) * 3
        ref.position.x = data.position[0] + Math.sin(state.clock.elapsedTime * 0.3 + data.phase) * 0.5
        // Flickering like flames
        ref.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + data.phase) * 0.4
      }
    })
  })

  return (
    <>
      {binaryData.map((data, index) => (
        <InfernalBinaryText
          key={index}
          position={data.position}
          text={data.text}
          color={data.text === '1' ? '#ff6600' : '#ff0000'}
        />
      ))}
    </>
  )
}

const SwimmingFish = ({ fishModel, position, speed = 1, scale = 1 }) => {
  const fishRef = useRef()
  const pathRef = useRef({
    centerX: position[0],
    centerY: position[1], 
    centerZ: position[2],
    radiusX: 15 + Math.random() * 10,
    radiusY: 5 + Math.random() * 3,
    radiusZ: 15 + Math.random() * 10,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    phaseZ: Math.random() * Math.PI * 2,
    speedMultiplier: 0.3 + Math.random() * 0.7
  })

  useFrame((state) => {
    if (fishRef.current) {
      const path = pathRef.current
      const time = state.clock.elapsedTime * speed * path.speedMultiplier
      
      const x = path.centerX + Math.cos(time + path.phaseX) * path.radiusX
      const y = path.centerY + Math.sin(time * 0.5 + path.phaseY) * path.radiusY
      const z = path.centerZ + Math.sin(time * 0.7 + path.phaseZ) * path.radiusZ
      
      fishRef.current.position.set(x, y, z)
      
      const nextX = path.centerX + Math.cos(time + 0.1 + path.phaseX) * path.radiusX
      const nextZ = path.centerZ + Math.sin(time * 0.7 + 0.1 + path.phaseZ) * path.radiusZ
      fishRef.current.lookAt(nextX, y, nextZ)
      
      fishRef.current.rotation.z = Math.sin(time * 2) * 0.1
    }
  })

  const { scene } = useGLTF(`/GLB/${fishModel}`)
  
  return (
    <primitive 
      ref={fishRef}
      object={scene.clone()} 
      scale={[scale, scale, scale]}
      position={position}
    />
  )
}

const InfernalEnvironment = () => {
  return (
    <>
      {/* Mixed lighting: hell theme + neutral for fish */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow
      />
      <directionalLight 
        position={[-10, 10, 5]} 
        intensity={1.0} 
        color="#ff6600"
      />
      <directionalLight 
        position={[0, -10, 10]} 
        intensity={0.8} 
        color="#ff3300"
      />
      <pointLight 
        position={[20, 15, 20]} 
        intensity={1.5} 
        color="#ffffff"
        distance={100}
      />
      <pointLight 
        position={[-20, 15, -20]} 
        intensity={1.5} 
        color="#ffffff"
        distance={100}
      />
      <pointLight 
        position={[0, 30, 0]} 
        intensity={2.0} 
        color="#ffffff"
        distance={80}
      />
      
      {/* Burning sea floor */}
      <mesh position={[0, -25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#660000" 
          transparent 
          opacity={0.4}
          emissive="#330000"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Floating lava bubbles */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 100,
          Math.random() * 20 - 10,
          (Math.random() - 0.5) * 100
        ]}>
          <sphereGeometry args={[0.5 + Math.random(), 8, 8]} />
          <meshStandardMaterial 
            color="#ff3300"
            emissive="#ff6600"
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  )
}

export default function Page07() {
  const [cameraPosition, setCameraPosition] = useState([0, 10, 30])
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  const fishModels = ['fish1.glb', 'fish2.glb', 'fish3.glb', 'fish4.glb']
  const fishScales = [6.0, 0.8, 2.8, 3.9]
  const fishPositions = [
    [10, 0, 10],
    [-15, 5, -10],
    [20, -8, 0],
    [-10, 8, 15],
    [0, -5, -20],
    [25, 3, -15],
    [-20, -3, 8],
    [15, 12, -5],
    [-8, -10, 20],
    [5, 15, -25]
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0000 0%, #330000 30%, #660000 70%, #990000 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <BackButton />
      
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(45deg, #ff6600, #ff0000)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 20px rgba(255, 100, 0, 0.8)'
        }}>
          Binary Sea
        </h1>
        <p style={{
          fontSize: '18px',
          opacity: 0.9,
          margin: 0,
          color: '#ff9500',
          textShadow: '0 0 10px rgba(255, 149, 0, 0.6)'
        }}>
          🔥 Infernal Binary Ocean  🔥
        </p>
      </div>

      <div style={{
        position: 'absolute',
        top: '160px',
        right: '24px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        padding: '16px',
        border: '2px solid rgba(255, 100, 0, 0.5)',
        boxShadow: '0 0 20px rgba(255, 100, 0, 0.3)'
      }}>
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          style={{
            padding: '8px 16px',
            background: isAutoRotate ? '#ff6600' : 'transparent',
            border: '1px solid #ff6600',
            borderRadius: '6px',
            color: isAutoRotate ? '#000' : '#ff6600',
            textShadow: isAutoRotate ? 'none' : '0 0 8px #ff6600',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '8px',
            width: '100%'
          }}
        >
          {isAutoRotate ? '🔥 INFERNAL ROTATION ON' : '🔥 INFERNAL ROTATION OFF'}
        </button>
        <div style={{ fontSize: '12px', color: '#ff9500', textAlign: 'center', textShadow: '0 0 5px #ff6600' }}>
          Navigate the Burning Binary Sea
        </div>
      </div>

      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}>
        <Canvas
          camera={{ 
            position: cameraPosition, 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <InfernalEnvironment />
            <InfernalBinaryOcean />
            
            {fishPositions.map((position, index) => (
              <SwimmingFish
                key={index}
                fishModel={fishModels[index % fishModels.length]}
                position={position}
                speed={0.5 + Math.random() * 0.5}
                scale={fishScales[index % fishScales.length]}
              />
            ))}
            
            <OrbitControls 
              enableZoom={true}
              autoRotate={isAutoRotate}
              autoRotateSpeed={0.5}
              minDistance={10}
              maxDistance={100}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.1}
            />
          </Suspense>
        </Canvas>
      </div>

    </div>
  )
}
