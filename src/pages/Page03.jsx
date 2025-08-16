import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import './Page03.css';

// 뒤로가기 버튼
import BackButton from '../components/BackButton.jsx';

/* ─────────────────────────────────────────────
 * 재사용: 자유 이동 패킷(UDP 등)
 * curve 상에서 speed, offset으로 계속 순환
 * ───────────────────────────────────────────── */
function Packet({ curve, speed, offset, color, size = 0.2, label, labelSize }) {
  const meshRef = useRef();
  const labelRef = useRef();

  useFrame(({ clock }) => {
    const raw = clock.getElapsedTime() * speed + offset;
    const t = ((raw % 1) + 1) % 1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    if (meshRef.current) {
      meshRef.current.position.copy(point);
      meshRef.current.lookAt(point.clone().add(tangent));
    }
    if (label && labelRef.current) {
      labelRef.current.position.copy(point.clone().add(new Vector3(0, size * 1.4, 0)));
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.85}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
      {label && (
        <Text
          ref={labelRef}
          fontSize={labelSize || size * 1.2}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
 * TCP 3-Way Handshake 시퀀서
 * SYN(→), SYN-ACK(←), ACK(→) 순서로 “한 개의” 패킷이 왕복
 * ───────────────────────────────────────────── */
function HandshakeSequencer({ curve }) {
  const packetRef = useRef();
  const labelRef = useRef();
  const progressRef = useRef(0);

  const [phase, setPhase] = useState('SYN'); // 렌더링 색/라벨 갱신용
  const speed = 0.35; // 느리면 0.25, 빠르면 0.45 정도

  const phaseProps = {
    SYN:     { label: 'SYN',     color: '#FB5607', dir: +1 },
    'SYN-ACK': { label: 'SYN-ACK', color: '#FFD400', dir: -1 },
    ACK:     { label: 'ACK',     color: '#00B971', dir: +1 },
  };

  useFrame((_, delta) => {
    progressRef.current += delta * speed;
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setPhase((p) => (p === 'SYN' ? 'SYN-ACK' : p === 'SYN-ACK' ? 'ACK' : 'SYN'));
    }

    const { dir } = phaseProps[phase];
    const t = dir > 0 ? progressRef.current : 1 - progressRef.current;

    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).multiplyScalar(dir);

    if (packetRef.current) {
      packetRef.current.position.copy(point);
      packetRef.current.lookAt(point.clone().add(tangent));
    }
    if (labelRef.current) {
      labelRef.current.position.copy(point.clone().add(new Vector3(0, 0.35, 0)));
    }
  });

  return (
    <>
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshStandardMaterial
          color={phaseProps[phase].color}
          emissive={phaseProps[phase].color}
          emissiveIntensity={0.9}
          roughness={0.22}
          metalness={0.65}
        />
      </mesh>
      <Text
        ref={labelRef}
        fontSize={0.34}
        color={phaseProps[phase].color}
        anchorX="center"
        anchorY="bottom"
      >
        {phaseProps[phase].label}
      </Text>
    </>
  );
}

/* ─────────────────────────────────────────────
 * 떠다니는 행성
 * 각기 다른 반지름/궤도/속도로 천천히 공전 + 살짝 위아래 바운스
 * ───────────────────────────────────────────── */
function Planet({ radius = 0.25, orbitRadius = 6, orbitSpeed = 0.12, tilt = 0.6, color = '#778899', start = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed + start;
    const x = Math.cos(t) * orbitRadius;
    const z = Math.sin(t) * orbitRadius;
    const y = Math.sin(t * 0.8) * tilt;
    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.rotation.y += 0.004;
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
 * TCP Handshake 장면
 * ───────────────────────────────────────────── */
function HandshakeScene() {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-3, 0, 0),
        new Vector3(-1.5, 0.8, 0.3),
        new Vector3(0, 0, 0),
        new Vector3(1.5, -0.8, -0.3),
        new Vector3(3, 0, 0),
      ]),
    []
  );

  return (
    <>
      {/* 클라이언트/서버 노드 */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#3A86FF" emissive="#3A86FF" emissiveIntensity={0.2} />
      </mesh>
      <Text position={[-3, 0.7, 0]} fontSize={0.4} color="#3A86FF" anchorX="center" anchorY="middle">
        Client
      </Text>

      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#8338EC" emissive="#8338EC" emissiveIntensity={0.2} />
      </mesh>
      <Text position={[3, 0.7, 0]} fontSize={0.4} color="#8338EC" anchorX="center" anchorY="middle">
        Server
      </Text>

      {/* 연결 튜브 */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.05, 8, false]} />
        <meshStandardMaterial color="#ABAFE0" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 시퀀스형 3-way handshake */}
      <HandshakeSequencer curve={curve} />
    </>
  );
}

/* ─────────────────────────────────────────────
 * UDP: 연결 없이 연속 데이타그램
 * ───────────────────────────────────────────── */
function UdpScene() {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-3, 0, 0),
        new Vector3(-1, 0.3, 0.2),
        new Vector3(1, -0.3, -0.2),
        new Vector3(3, 0, 0),
      ]),
    []
  );

  return (
    <>
      {/* 엔드포인트 */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#2EC4B6" />
      </mesh>
      <Text position={[-3, 0.7, 0]} fontSize={0.4} color="#2EC4B6" anchorX="center" anchorY="middle">
        Client
      </Text>

      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#D62828" />
      </mesh>
      <Text position={[3, 0.7, 0]} fontSize={0.4} color="#D62828" anchorX="center" anchorY="middle">
        Server
      </Text>

      {/* 파이프 */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.04, 8, false]} />
        <meshStandardMaterial color="#8ECAE6" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 연속 데이타그램 */}
      <Packet curve={curve} speed={0.12} offset={0.0} color="#FFB703" size={0.24} label="Datagram" labelSize={0.3} />
      <Packet curve={curve} speed={0.12} offset={0.33} color="#FFB703" size={0.24} label="Datagram" labelSize={0.3} />
      <Packet curve={curve} speed={0.12} offset={0.66} color="#FFB703" size={0.24} label="Datagram" labelSize={0.3} />
    </>
  );
}

/* ─────────────────────────────────────────────
 * 페이지 컴포넌트
 * ───────────────────────────────────────────── */
export default function Page03() {
  const [protocol, setProtocol] = useState('TCP');

  // 마우스 패럴랙스 변수 갱신
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      document.documentElement.style.setProperty('--mx', `${x}px`);
      document.documentElement.style.setProperty('--my', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="page3-fullscreen">
      {/* 전경 네온 + 패럴랙스 백그라운드 */}
      <div className="live-bg" />
      <div className="live-bg-overlay" />

      {/* 상단 뒤로가기 */}
      <div className="page3-back">
        <BackButton />
      </div>

      <div className="animated-background" />

      <Canvas className="full-canvas" camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#0b1220']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          {/* 별 + 행성 */}
          <Stars radius={30} depth={20} count={600} factor={4} fade />
          {/* 다양한 행성(크기/궤도/색/시작위상 랜덤 느낌) */}
          <Planet radius={0.22} orbitRadius={5.2} orbitSpeed={0.10} tilt={0.5} color="#7AD9FF" start={0.2} />
          <Planet radius={0.35} orbitRadius={6.4} orbitSpeed={0.07} tilt={0.7} color="#FF9F1C" start={1.1} />
          <Planet radius={0.28} orbitRadius={7.2} orbitSpeed={0.09} tilt={0.4} color="#B388FF" start={2.0} />
          <Planet radius={0.18} orbitRadius={4.8} orbitSpeed={0.14} tilt={0.6} color="#80ED99" start={2.7} />
          <Planet radius={0.26} orbitRadius={6.8} orbitSpeed={0.06} tilt={0.5} color="#F94144" start={3.6} />
          <Planet radius={0.2}  orbitRadius={5.8} orbitSpeed={0.11} tilt={0.55} color="#F6BD60" start={4.5} />

          {/* 장면 전환 */}
          {protocol === 'TCP' ? <HandshakeScene /> : <UdpScene />}
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      {/* 하단 프로토콜 탭 (DNS 제거) */}
      <div className="protocol-tabs-bottom">
        {['TCP', 'UDP'].map((p) => (
          <div
            key={p}
            className={`protocol-tab ${protocol === p ? 'active' : ''}`}
            onClick={() => setProtocol(p)}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
