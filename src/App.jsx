import { Routes, Route } from 'react-router-dom'
import ArcCarousel from './components/ArcCarousel.jsx'
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
import Page10 from './pages/Page10.jsx'
import Page11 from './pages/Page11.jsx'
import Page12 from './pages/Page12.jsx'
import Page13 from './pages/Page13.jsx'
import Page14 from './pages/Page14.jsx'
import Page15 from './pages/Page15.jsx'

const items = Array.from({ length: 15 }).map((_, i) => ({
  title: [
    'Sleep', 'The Scream', 'Wiper Typography', 'Plant Trees', 'Surface Waves',
    'Raining Men', 'Ripples on the Green', 'Flip Clock', 'Hue Blending',
    'Neon Grid', 'Particle Rain', 'Soft Shadows', 'Orbit Lines', 'Refraction', 'Bokeh Field'
  ][i] || `Page ${i+1}`,
  href: `/p/${i+1}`,
}))

function Home() {
  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
      <BackButton />
      <div style={{textAlign:'center', marginTop:'10vh', letterSpacing:'.24em', opacity:.9}}>
        cipher.
      </div>
      <ArcCarousel items={items} height={560} />
      <div style={{textAlign:'center', opacity:.6, marginBottom:24, fontSize:12}}>
        dark interactive · screen saver · share · fullscreen
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
        <Route path="/p/10" element={<Page10 />} />
        <Route path="/p/11" element={<Page11 />} />
        <Route path="/p/12" element={<Page12 />} />
        <Route path="/p/13" element={<Page13 />} />
        <Route path="/p/14" element={<Page14 />} />
        <Route path="/p/15" element={<Page15 />} />
      </Routes>
    </>
  )
}
