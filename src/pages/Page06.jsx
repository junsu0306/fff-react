// src/pages/Page06.jsx
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo, useState, useCallback } from 'react';
import { animated, useSpring } from '@react-spring/three';
import BackButton from '../components/BackButton.jsx';

function BlockchainNetwork() {
  const groupRef = useRef();
  // 기존 노드 및 기본 연결을 useMemo로 생성
  const { nodes, connections } = useMemo(() => {
    const nodePositions = [];
    const connections = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      nodePositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        )
      );
    }
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (Math.random() < 0.1) {
          connections.push([nodePositions[i], nodePositions[j]]);
        }
      }
    }
    return { nodes: nodePositions, connections };
  }, []);

  // 추가 연결 상태 관리
  const [extraConnections, setExtraConnections] = useState([]);

  // 애니메이션 (새 연결에 대한 투명도 애니메이션)
  const { opacity } = useSpring({
    opacity: extraConnections.length > 0 ? 0.6 : 0,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  // 클릭 시 호출되는 핸들러: 클릭된 노드를 다른 노드들과 연결
  const handleNodeClick = useCallback(
    (clickedIndex) => {
      const newConns = [];
      nodes.forEach((pos, idx) => {
        if (idx !== clickedIndex) {
          newConns.push([nodes[clickedIndex], pos]);
        }
      });
      setExtraConnections(newConns);
      // 일정 시간 후 연결선 제거
      setTimeout(() => setExtraConnections([]), 2000);
    },
    [nodes]
  );

  // 회전 애니메이션
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 큐브 렌더링 + 클릭 이벤트 */}
      {nodes.map((position, idx) => (
        <mesh
          key={`cube-${idx}`}
          position={position}
          castShadow
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation();
            handleNodeClick(idx);
          }}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#00ffc8"
            emissive="#00ffc8"
            emissiveIntensity={0.9}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* 기본 연결선 렌더링 */}
      {connections.map((conn, idx) => {
        const [start, end] = conn;
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`line-${idx}`} geometry={geometry}>
            <lineBasicMaterial color="#00ffd5" transparent opacity={0.4} />
          </line>
        );
      })}

      {/* 클릭에 의해 생성되는 추가 연결선 (애니메이션 적용) */}
      {extraConnections.map((conn, idx) => {
        const [start, end] = conn;
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <animated.line key={`extra-${idx}`} geometry={geometry}>
            <lineBasicMaterial color="#ff00ff" transparent />
            <animated.lineBasicMaterial
              attach="material"
              color="#ff00ff"
              transparent
              opacity={opacity}
            />
          </animated.line>
        );
      })}
    </group>
  );
}

export default function Page06() {
  return (
    <>
      <BackButton />
      <div
        style={{
          height: '100vh',
          width: '100%',
          position: 'relative',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 12], fov: 40 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <BlockchainNetwork />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            color: '#00ffc8',
            pointerEvents: 'none',
          }}
        >
          <h1
            style={{
              fontSize: '3rem',
              margin: '0 0 0.5rem 0',
              fontWeight: 600,
              textShadow: '0 0 10px #00ffc8',
            }}
          >
            Block&nbsp;Chain
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              maxWidth: '400px',
              lineHeight: 1.4,
              textShadow: '0 0 5px #00ffc8',
            }}
          >
            A decentralized network of interconnected blocks and trustless ledgers.
          </p>
        </div>
      </div>
    </>
  );
}
