import { Routes, Route } from 'react-router-dom'
import PortalCarousel from './components/PortalCarousel.jsx'
import BackButton from './components/BackButton.jsx'
import LiveBackground from './components/LiveBackground.jsx'   // ← 추가
import Page01 from './pages/Page01.jsx'
import Page02 from './pages/Page02.jsx'
import Page03 from './pages/Page03.jsx'
import Page04 from './pages/Page04.jsx'
import Page05 from './pages/Page05.jsx'
import Page06 from './pages/Page06.jsx'
import Page07 from './pages/Page07.jsx'
import Page08 from './pages/Page08.jsx'
import Page09 from './pages/Page09.jsx'


const items = Array.from({ length: 9 }).map((_, i) => ({
  title: [
    'Infernal Packets', 'Cipher', 'TCP & UDP Packet', 'Arm vs x86-64', 'Assembly', 'Block Chain', 'Binary Sea', 'Vulnerability', 'BoB-shell'
  ][i] || `Page ${i+1}`,
  href: `/p/${i+1}`,
}))

function Home() {
  return (
    <div style={{height:'100vh', position:'relative'}}>
      <BackButton />
      
      {/* Portal Title */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        letterSpacing: '.24em',
        opacity: .9,
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 20px rgba(255, 149, 0, 0.5)',
        zIndex: 1001
      }}>
        CIPHER DIMENSIONS
      </div>
      
      {/* Doctor Strange Portal Carousel */}
      <PortalCarousel items={items} />
      
      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        opacity: .6,
        fontSize: 12
      }}>
JunsuHa · JinhoJeong · WonkyoungPark
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <LiveBackground />  {/* ← 전역 배경(모든 페이지 뒤) */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/1" element={<Page01 />} />
        <Route path="/p/2" element={<Page02 />} />
        <Route path="/p/3" element={<Page03 />} />
        <Route path="/p/4" element={<Page04 />} />
        <Route path="/p/5" element={<Page05 />} />
        <Route path="/p/6" element={<Page06 />} />
        <Route path="/p/7" element={<Page07 />} />
        <Route path="/p/8" element={<Page08 />} />
        <Route path="/p/9" element={<Page09 />} />

    
      </Routes>
    </>
  )
}
