// src/pages/Page06.jsx
import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef, useMemo, useState, useCallback, useLayoutEffect } from 'react';
import { animated, useSpring } from '@react-spring/three';
import BackButton from '../components/BackButton.jsx';

// ───────────────────── 해골 스프라이트 ─────────────────────
function SkullSprite({ onClick }) {
  const map = useLoader(THREE.TextureLoader, '/images/skull.png'); // public/images/skull.png
  map.colorSpace = THREE.SRGBColorSpace;
  return (
    <sprite onClick={onClick} scale={[0.9, 0.9, 1]}>
      <spriteMaterial map={map} transparent depthWrite={false} />
    </sprite>
  );
}

// ──────────────── 쇠사슬: 두 점(start~end) 사이에 토러스 인스턴싱 ────────────────
function Chain({ start, end, linkSpacing = 0.34, color = '#c5ccd8' }) {
  const instRef = useRef();
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const dir = useMemo(() => new THREE.Vector3().copy(end).sub(start), [start, end]);
  const len = dir.length();
  const dirNorm = useMemo(() => dir.clone().normalize(), [dir]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirNorm),
    [dirNorm]
  );
  const geometry = useMemo(() => new THREE.TorusGeometry(0.1, 0.03, 12, 24), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, metalness: 1.0, roughness: 0.25, envMapIntensity: 0.9 }),
    [color]
  );
  const count = Math.max(1, Math.floor(len / linkSpacing));

  useLayoutEffect(() => {
    if (!instRef.current) return;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) * (len / count);
      const pos = new THREE.Vector3().copy(start).add(dirNorm.clone().multiplyScalar(t));
      const q = quat.clone();
      const twist = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (i % 2) * Math.PI * 0.5);
      q.multiply(twist);

      tmpObj.position.copy(pos);
      tmpObj.quaternion.copy(q);
      tmpObj.scale.set(1.8, 1.0, 0.8);
      tmpObj.updateMatrix();
      instRef.current.setMatrixAt(i, tmpObj.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dirNorm, len, quat, start, tmpObj]);

  return <instancedMesh ref={instRef} args={[geometry, material, count]} castShadow receiveShadow />;
}

/** DungeonChain: 해골 노드 + 쇠사슬 + 클릭 시 레드 네온 라인 */
function DungeonChain() {
  const groupRef = useRef();

  // 노드 & "항상 연결"되는 엣지 생성
  const { nodes, connections } = useMemo(() => {
    const count = 20;
    const positions = Array.from({ length: count }, () =>
      new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
    );

    // 인덱스 기반 엣지 집합
    const edgesIdx = [];
    const added = new Set();
    const addEdge = (a, b) => {
      if (a === b) return;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (added.has(key)) return;
      added.add(key);
      edgesIdx.push([a, b]);
    };

    // 1) 랜덤 스패닝 트리(연결성 보장)
    const order = [...Array(count).keys()];
    for (let i = 1; i < count; i++) {
      const a = order[i];
      const b = order[Math.floor(Math.random() * i)];
      addEdge(a, b);
    }

    // 2) 여분 엣지 추가(보기 좋게)
    const extra = Math.floor(count * 0.5);
    for (let k = 0; k < extra; k++) {
      const i = Math.floor(Math.random() * count);
      let j = Math.floor(Math.random() * count);
      if (i === j) j = (j + 1) % count;
      addEdge(i, j);
    }

    // 3) 최소 차수 2 보장(고립/편도 방지)
    const deg = Array(count).fill(0);
    edgesIdx.forEach(([i, j]) => {
      deg[i]++; deg[j]++;
    });
    for (let i = 0; i < count; i++) {
      while (deg[i] < 2) {
        let best = -1, bestD = Infinity;
        for (let j = 0; j < count; j++) {
          if (i === j) continue;
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (added.has(key)) continue;
          const d = positions[i].distanceToSquared(positions[j]);
          if (d < bestD) { bestD = d; best = j; }
        }
        if (best >= 0) {
          addEdge(i, best);
          deg[i]++; deg[best]++;
        } else break;
      }
    }

    // 벡터 페어로 변환
    const conns = edgesIdx.map(([i, j]) => [positions[i], positions[j]]);
    return { nodes: positions, connections: conns };
  }, []);

  // 클릭 시 레드 네온 라인
  const [extraConnections, setExtraConnections] = useState([]);
  const { opacity } = useSpring({
    opacity: extraConnections.length > 0 ? 1.0 : 0,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const handleClick = useCallback(
    (index) => {
      const newConns = [];
      nodes.forEach((_, idx) => {
        if (idx !== index) newConns.push([nodes[index], nodes[idx]]);
      });
      setExtraConnections(newConns);
      setTimeout(() => setExtraConnections([]), 2500);
    },
    [nodes]
  );

  // 그룹 회전
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 해골 노드 + 약한 오렌지 포인트 라이트 */}
      {nodes.map((position, idx) => (
        <group key={`node-${idx}`} position={position}>
          <SkullSprite onClick={() => handleClick(idx)} />
          <pointLight position={[0, 0, 0]} intensity={1.3} distance={2.8} color="#ff6a2a" />
        </group>
      ))}

      {/* 기본 연결: 쇠사슬 */}
      {connections.map(([start, end], idx) => (
        <Chain key={`chain-${idx}`} start={start} end={end} linkSpacing={0.34} color="#c5ccd8" />
      ))}

      {/* 클릭 시 나타나는 레드 네온 라인 (Bloom으로 번쩍) */}
      {extraConnections.map((conn, idx) => {
        const [start, end] = conn;
        const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
        return (
          <animated.line key={`neon-${idx}`} geometry={geo}>
            <animated.lineBasicMaterial color="#ff3b3b" transparent opacity={opacity} />
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
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundImage: 'url(/images/hell.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }} shadows gl={{ antialias: true }}>
          <ambientLight intensity={0.1} />
          <Suspense fallback={null}>
            <DungeonChain />
            <EffectComposer>
              {/* 레드 네온을 더 강하게 */}
              <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.18} intensity={1.8} />
            </EffectComposer>
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>

        {/* ───────────── 오버레이(레드/오렌지 계열로 변경) ───────────── */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            color: '#ff5e00',
            pointerEvents: 'none',
          }}
        >
          <h1
            style={{
              fontSize: '3rem',
              margin: '0 0 0.5rem 0',
              fontWeight: 700,
              textShadow: '0 0 12px #ff2d00, 0 0 24px #b30000',
            }}
          >
            {'Block\u00A0Chain'}
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              maxWidth: '400px',
              lineHeight: 1.4,
              textShadow: '0 0 6px #ff2d00',
              color: '#ffd6c9', // 본문은 살짝 밝게
            }}
          >
            A decentralized network of interconnected blocks and trustless ledgers.
          </p>
        </div>
      </div>
    </>
  );
}
