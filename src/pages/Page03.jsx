import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import './Page03.css';

// Import the back button component for navigation
import BackButton from '../components/BackButton.jsx';

// Packet component renders a small sphere travelling along a 3D curve.
// It uses the three.js CatmullRomCurve3 instance to compute points and tangents
// along the path. The packet will continuously loop around the curve with a
// specified speed and starting offset. An optional text label hovers above
// the packet to visualise the handshake segment (e.g. SYN, SYN‑ACK, ACK).
// Packet renders a coloured sphere travelling along the provided curve.
// A negative speed value will cause the packet to traverse the path in the
// opposite direction. The size prop controls the radius of the sphere.
function Packet({ curve, speed, offset, color, size = 0.2, label, labelSize }) {
  const meshRef = useRef();
  const labelRef = useRef();
  useFrame(({ clock }) => {
    // Compute a normalised time parameter. The extra addition ensures values
    // stay positive when using negative speeds.
    const raw = clock.getElapsedTime() * speed + offset;
    const t = ((raw % 1) + 1) % 1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    if (meshRef.current) {
      meshRef.current.position.copy(point);
      meshRef.current.lookAt(point.clone().add(tangent));
    }
    if (label && labelRef.current) {
      labelRef.current.position.copy(
        point.clone().add(new Vector3(0, size * 1.4, 0))
      );
    }
  });
  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
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

// HandshakeScene sets up two endpoints (client and server) connected by a
// smooth tube. Packets travel along the tube to visualise a TCP 3‑way
// handshake. The curve is computed once via useMemo for performance.
function HandshakeScene() {
  const curve = useMemo(() => {
    return new CatmullRomCurve3([
      new Vector3(-3, 0, 0),
      new Vector3(-1.5, 0.8, 0.3),
      new Vector3(0, 0, 0),
      new Vector3(1.5, -0.8, -0.3),
      new Vector3(3, 0, 0),
    ]);
  }, []);
  return (
    <>
      {/* Endpoints representing the client and server */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#3A86FF" />
      </mesh>
      <Text
        position={[-3, 0.7, 0]}
        fontSize={0.4}
        color="#3A86FF"
        anchorX="center"
        anchorY="middle"
      >
        Client
      </Text>
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#8338EC" />
      </mesh>
      <Text
        position={[3, 0.7, 0]}
        fontSize={0.4}
        color="#8338EC"
        anchorX="center"
        anchorY="middle"
      >
        Server
      </Text>
      {/* Tube connecting the two endpoints */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.05, 8, false]} />
        <meshStandardMaterial color="#ABAFE0" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Packets illustrating the TCP 3‑way handshake */}
      <Packet
        curve={curve}
        speed={0.08}
        offset={0}
        color="#FB5607"
        size={0.24}
        label="SYN"
        labelSize={0.35}
      />
      <Packet
        curve={curve}
        speed={0.08}
        offset={1 / 3}
        color="#FFD400"
        size={0.24}
        label="SYN-ACK"
        labelSize={0.32}
      />
      <Packet
        curve={curve}
        speed={0.08}
        offset={2 / 3}
        color="#00B971"
        size={0.24}
        label="ACK"
        labelSize={0.35}
      />
    </>
  );
}

// UDP scene visualises a connectionless datagram exchange. A few packets
// continuously travel along a curved path without handshaking. This uses
// larger packet sizes and a single colour to distinguish from TCP.
function UdpScene() {
  const curve = useMemo(() => {
    // Start and end points at y = 0 to connect seamlessly to the spheres.
    return new CatmullRomCurve3([
      new Vector3(-3, 0, 0),
      new Vector3(-1, 0.3, 0.2),
      new Vector3(1, -0.3, -0.2),
      new Vector3(3, 0, 0),
    ]);
  }, []);
  return (
    <>
      {/* endpoints */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#2EC4B6" />
      </mesh>
      <Text
        position={[-3, 0.7, 0]}
        fontSize={0.4}
        color="#2EC4B6"
        anchorX="center"
        anchorY="middle"
      >
        Client
      </Text>
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#D62828" />
      </mesh>
      <Text
        position={[3, 0.7, 0]}
        fontSize={0.4}
        color="#D62828"
        anchorX="center"
        anchorY="middle"
      >
        Server
      </Text>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.04, 8, false]} />
        <meshStandardMaterial color="#8ECAE6" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* continuous datagrams */}
      <Packet
        curve={curve}
        speed={0.12}
        offset={0}
        color="#FFB703"
        size={0.24}
        label="Datagram"
        labelSize={0.3}
      />
      <Packet
        curve={curve}
        speed={0.12}
        offset={0.33}
        color="#FFB703"
        size={0.24}
        label="Datagram"
        labelSize={0.3}
      />
      <Packet
        curve={curve}
        speed={0.12}
        offset={0.66}
        color="#FFB703"
        size={0.24}
        label="Datagram"
        labelSize={0.3}
      />
    </>
  );
}

// DNS scene shows a request/response sequence over UDP. One coloured packet
// travels to the server and a differently coloured packet returns. Negative
// speed is used to reverse direction.
function DnsScene() {
  const curve = useMemo(() => {
    // Start and end points at y = 0 to connect seamlessly to the spheres.
    return new CatmullRomCurve3([
      new Vector3(-3, 0, 0),
      new Vector3(-1.5, 0.5, 0.3),
      new Vector3(0, 0, 0),
      new Vector3(1.5, -0.5, -0.3),
      new Vector3(3, 0, 0),
    ]);
  }, []);
  return (
    <>
      {/* endpoints */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#3A86FF" />
      </mesh>
      <Text
        position={[-3, 0.7, 0]}
        fontSize={0.4}
        color="#3A86FF"
        anchorX="center"
        anchorY="middle"
      >
        Client
      </Text>
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#8338EC" />
      </mesh>
      <Text
        position={[3, 0.7, 0]}
        fontSize={0.4}
        color="#8338EC"
        anchorX="center"
        anchorY="middle"
      >
        Server
      </Text>
      <mesh>
        <tubeGeometry args={[curve, 120, 0.05, 8, false]} />
        <meshStandardMaterial color="#BEE3DB" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* DNS query (yellow) from client to server */}
      <Packet
        curve={curve}
        speed={0.1}
        offset={0}
        color="#FFD23F"
        size={0.24}
        label="Query"
        labelSize={0.32}
      />
      {/* DNS response (green) from server back to client */}
      <Packet
        curve={curve}
        speed={-0.1}
        offset={0}
        color="#80FF72"
        size={0.24}
        label="Response"
        labelSize={0.32}
      />
    </>
  );
}

// Main page component wraps the 3D scene in the existing layout. It includes
// a back button, animated background, a three.js Canvas, and overlay text
// describing the concept. Additional feature chips highlight security themes.
export default function Page03() {
  const [protocol, setProtocol] = useState('TCP');
  // Render the appropriate scene depending on the selected protocol
  const renderScene = () => {
    if (protocol === 'TCP') return <HandshakeScene />;
    if (protocol === 'UDP') return <UdpScene />;
    if (protocol === 'DNS') return <DnsScene />;
    return null;
  };

  // Update CSS variables for parallax based on mouse position
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
      {/* Live moving background and neon overlay for parallax effect */}
      <div className="live-bg" />
      <div className="live-bg-overlay" />

      {/* Back button positioned in the top-left corner */}
      <div className="page3-back">
        <BackButton />
      </div>
      {/* Keep the global back button outside this component. We no longer
          insert a local top bar here. */}
      <div className="animated-background" />
      <Canvas className="full-canvas" camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#0b1220']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Stars radius={30} depth={20} count={500} factor={4} fade />
          {renderScene()}
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      {/* Bottom‑center protocol selector. These tabs allow switching between
          TCP, UDP and DNS visualisations. */}
      <div className="protocol-tabs-bottom">
        {['TCP', 'UDP', 'DNS'].map((p) => (
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