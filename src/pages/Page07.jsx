import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import BackButton from '../components/BackButton.jsx'

const BinaryText = ({ position, text, color = '#00ff9d' }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.002
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + position[2]) * 0.1
    }
  })

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={2}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  )
}

const BinaryOcean = () => {
  const binaryRefs = useRef([])
  const [binaryData, setBinaryData] = useState([])

  useEffect(() => {
    const generateBinaryField = () => {
      const data = []
      for (let i = 0; i < 1000; i++) {
        data.push({
          position: [
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 100
          ],
          text: Math.random() > 0.5 ? '1' : '0',
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2
        })
      }
      setBinaryData(data)
    }
    generateBinaryField()
  }, [])

  useFrame((state) => {
    binaryRefs.current.forEach((ref, index) => {
      if (ref && binaryData[index]) {
        const data = binaryData[index]
        ref.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * data.speed + data.phase) * 2
        ref.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5 + data.phase) * 0.3
      }
    })
  })

  return (
    <>
      {binaryData.map((data, index) => (
        <BinaryText
          key={index}
          position={data.position}
          text={data.text}
          color={data.text === '1' ? '#00ff9d' : '#0088ff'}
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

const OceanEnvironment = () => {
  return (
    <>
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={2.5} 
        color="#ffffff"
        castShadow
      />
      <directionalLight 
        position={[-10, 10, 5]} 
        intensity={2.0} 
        color="#00ff9d"
      />
      <directionalLight 
        position={[0, -10, 10]} 
        intensity={1.8} 
        color="#0088ff"
      />
      <pointLight 
        position={[20, 15, 20]} 
        intensity={2.5} 
        color="#ffffff"
        distance={100}
      />
      <pointLight 
        position={[-20, 15, -20]} 
        intensity={2.5} 
        color="#ffffff"
        distance={100}
      />
      <pointLight 
        position={[0, 30, 0]} 
        intensity={3.0} 
        color="#ffffff"
        distance={80}
      />
      
      <mesh position={[0, -25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#000033" 
          transparent 
          opacity={0.3}
        />
      </mesh>
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
      background: 'linear-gradient(180deg, #000011 0%, #001122 50%, #002244 100%)',
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
          background: 'linear-gradient(45deg, #00ff9d, #0088ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          어셈블리어 바다
        </h1>
        <p style={{
          fontSize: '18px',
          opacity: 0.8,
          margin: 0,
          color: '#00ff9d'
        }}>
          0과 1의 바다에서 헤엄치는 3D 물고기들
        </p>
      </div>

      <div style={{
        position: 'absolute',
        top: '160px',
        right: '24px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(0, 255, 157, 0.3)'
      }}>
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          style={{
            padding: '8px 16px',
            background: isAutoRotate ? '#00ff9d' : 'transparent',
            border: '1px solid #00ff9d',
            borderRadius: '6px',
            color: isAutoRotate ? '#000' : '#00ff9d',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '8px',
            width: '100%'
          }}
        >
          {isAutoRotate ? '자동 회전 ON' : '자동 회전 OFF'}
        </button>
        <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
          마우스로 시점 조작 가능
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
            <OceanEnvironment />
            <BinaryOcean />
            
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
