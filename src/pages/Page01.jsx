// src/pages/Page01.jsx
import { useEffect, useRef, useState } from 'react'
import BackButton from '../components/BackButton.jsx'

/**
 * Packet Rain — PCAP-backed (Canvas 2D)
 * - 페이지 진입 시 /pcaps/sample.pcap 자동 로드 (있으면)
 * - 업로드(.pcap) 시 업로드 파일로 교체
 * - Grab: 드래그, Peel: 더블클릭/Space
 * - 계층별 시각화:
 *    Ethernet: 바깥 네온 링
 *    IPv4: 사각, IPv6: 육각, ARP: 마름, 기타: 삼각
 *    TCP: 플래그 바, UDP: 점선 링
 */

export default function Page01() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundImage: 'url(/images/page1.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <BackButton />
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <HeaderHUD />
        <PacketRain />
        <UploadHelpCard />
      </div>
    </div>
  )
}

/* ───────────────────────────── HUD / Upload ───────────────────────────── */

function HeaderHUD() {
  const fileRef = useRef(null)
  const onPick = () => fileRef.current?.click()
  const onFile = () => {
    const f = fileRef.current?.files?.[0]
    if (f) window.dispatchEvent(new CustomEvent('pcap-file-selected', { detail: f }))
  }
  const onDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0]
    if (f) window.dispatchEvent(new CustomEvent('pcap-file-selected', { detail: f }))
  }

  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: '0 0 auto 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'auto',
        paddingTop: 72,
        zIndex: 3
      }}
      onDrop={onDrop}
    >
      <h1 style={{ 
        margin: 0, 
        letterSpacing: '.18em', 
        opacity: .95,
        textShadow: '0 0 10px rgba(135,206,250,0.5), 0 0 20px rgba(255,255,255,0.3)',
        color: '#87ceeb'
      }}>❄️ Snow Packets ❄️</h1>
      <p style={{ 
        marginTop: 8, 
        opacity: .8, 
        fontSize: 12, 
        textShadow: '0 0 5px rgba(255,255,255,0.3)',
        color: '#333333'
      }}>
        auto-load: <b>/pcaps/sample.pcap</b> · drag: grab · dblclick/Space: peel · R: reset
      </p>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={onPick} style={{ 
          fontWeight: 700,
          backgroundColor: '#2c2c2c',
          color: '#ffffff',
          border: '1px solid #444',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'ui-monospace, Menlo, monospace'
        }}>Upload .pcap</button>
        <input ref={fileRef} type="file" accept=".pcap" onChange={onFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}

/* ──────────────────────── Packet model & PCAP parser ─────────────────────── */

function cryptoId() {
  try {
    return Array.from(crypto.getRandomValues(new Uint32Array(2))).map(x => x.toString(36)).join('')
  } catch { return Math.random().toString(36).slice(2) }
}

function toMAC(buf, o=0) {
  const b = []
  for (let i=0;i<6;i++) b.push(buf[o+i].toString(16).padStart(2,'0'))
  return b.join(':')
}
function toIPv4(buf, o=0) { return `${buf[o]}.${buf[o+1]}.${buf[o+2]}.${buf[o+3]}` }
function toIPv6(buf, o=0) {
  const view = []
  for (let i=0;i<16;i+=2) view.push(((buf[o+i]<<8)|buf[o+i+1]).toString(16))
  return view.join(':').replace(/(^|:)0(:0)+(:|$)/, '::')
}

const ETHERTYPE = { IPv4:0x0800, ARP:0x0806, VLAN:0x8100, IPv6:0x86DD }

function parsePCAP(arrayBuffer, maxPackets=1000) {
  const dv = new DataView(arrayBuffer)
  const magicLE = dv.getUint32(0, true)
  const magicBE = dv.getUint32(0, false)
  let le
  if (magicLE === 0xa1b2c3d4 || magicLE === 0xa1b23c4d) le = true
  else if (magicBE === 0xa1b2c3d4 || magicBE === 0xa1b23c4d) le = false
  else throw new Error('Not a PCAP (magic mismatch)')

  const u16 = (o)=>dv.getUint16(o, le)
  const u32 = (o)=>dv.getUint32(o, le)
  const versionMajor = u16(4); const versionMinor = u16(6)
  const snaplen = u32(16)
  const network = u32(20)

  let off = 24
  const packets = []
  while (off + 16 <= dv.byteLength && packets.length < maxPackets) {
    const ts_sec = u32(off); const ts_usec = u32(off+4)
    const incl_len = u32(off+8); const orig_len = u32(off+12)
    off += 16
    if (off + incl_len > dv.byteLength) break
    const bytes = new Uint8Array(arrayBuffer, off, incl_len)
    off += incl_len

    if (bytes.length < 14) continue
    let ethOff = 14
    const dstMac = toMAC(bytes, 0)
    const srcMac = toMAC(bytes, 6)
    let etherType = (bytes[12]<<8)|bytes[13]
    if (etherType === ETHERTYPE.VLAN && bytes.length >= 18) {
      etherType = (bytes[16]<<8)|bytes[17]
      ethOff = 18
    }

    let l3=null, l4=null, payloadLen=0, size=orig_len||incl_len
    if (etherType === ETHERTYPE.IPv4 && bytes.length >= ethOff + 20) {
      const ihl = (bytes[ethOff]&0x0f)*4
      const totalLen = (bytes[ethOff+2]<<8)|bytes[ethOff+3]
      const proto = bytes[ethOff+9]; const ttl = bytes[ethOff+8]
      const src = toIPv4(bytes, ethOff+12); const dst = toIPv4(bytes, ethOff+16)
      l3 = { type:'IPv4', ttl, src, dst }
      const l4off = ethOff + ihl
      if (proto === 6 && bytes.length >= l4off + 20) {
        const sport = (bytes[l4off]<<8)|bytes[l4off+1]
        const dport = (bytes[l4off+2]<<8)|bytes[l4off+3]
        const dataOff = ((bytes[l4off+12]>>4)&0x0f)*4
        const flags = bytes[l4off+13] & 0x3f
        l4 = { type:'TCP', sport, dport, flags }
        payloadLen = Math.max(0, totalLen - ihl - dataOff)
      } else if (proto === 17 && bytes.length >= l4off + 8) {
        const sport = (bytes[l4off]<<8)|bytes[l4off+1]
        const dport = (bytes[l4off+2]<<8)|bytes[l4off+3]
        const len = (bytes[l4off+4]<<8)|bytes[l4off+5]
        l4 = { type:'UDP', sport, dport }
        payloadLen = Math.max(0, len - 8)
      } else if (proto === 1) {
        l4 = { type:'ICMP' }
        payloadLen = Math.max(0, totalLen - ihl - 8)
      } else {
        l4 = { type:`OTHER(${proto})` }
        payloadLen = Math.max(0, totalLen - ihl - 8)
      }
    } else if (etherType === ETHERTYPE.IPv6 && bytes.length >= ethOff + 40) {
      const next = bytes[ethOff+6]
      const src = toIPv6(bytes, ethOff+8); const dst = toIPv6(bytes, ethOff+24)
      l3 = { type:'IPv6', src, dst }
      const l4off = ethOff + 40
      if (next === 6 && bytes.length >= l4off + 20) {
        const sport = (bytes[l4off]<<8)|bytes[l4off+1]
        const dport = (bytes[l4off+2]<<8)|bytes[l4off+3]
        const dataOff = ((bytes[l4off+12]>>4)&0x0f)*4
        const flags = bytes[l4off+13] & 0x3f
        l4 = { type:'TCP', sport, dport, flags }
        const payload = (bytes[ethOff+4]<<8)|bytes[ethOff+5]
        payloadLen = Math.max(0, payload - dataOff)
      } else if (next === 17 && bytes.length >= l4off + 8) {
        const sport = (bytes[l4off]<<8)|bytes[l4off+1]
        const dport = (bytes[l4off+2]<<8)|bytes[l4off+3]
        const len = (bytes[l4off+4]<<8)|bytes[l4off+5]
        l4 = { type:'UDP', sport, dport }
        payloadLen = Math.max(0, len - 8)
      } else {
        l4 = { type:`NEXT(${next})` }
      }
    } else if (etherType === ETHERTYPE.ARP) {
      l3 = { type:'ARP' }
    } else {
      l3 = { type:`ETH(0x${etherType.toString(16)})` }
    }

    packets.push({
      id: cryptoId(),
      ts: ts_sec*1000 + Math.floor(ts_usec/1000),
      eth: { src: srcMac, dst: dstMac, etherType },
      net: l3, trans: l4, size: size, payload: payloadLen
    })
  }
  return { version:`${versionMajor}.${versionMinor}`, snaplen, linktype: network, packets }
}

/* ───────────────────────── Canvas — Packet Rain ───────────────────────── */

function PacketRain() {
  const canvasRef = useRef(null)
  const packetsRef = useRef([])     // 현재 표시 중인 패킷
  const [selected, setSelected] = useState(null)
  const [peeledIds, setPeeledIds] = useState(() => new Set())
  const [meta, setMeta] = useState(null) // {version, snaplen, linktype}
  const [source, setSource] = useState('example') // 'example' | 'upload'
  const dropsRef = useRef([])
  const pointerRef = useRef({ x:0,y:0, down:false, draggingId:null, dx:0, dy:0 })
  const spawnTimerRef = useRef(null)
  const lastSpawnRef = useRef(0)

  // 페이지 로드시 example pcap 자동 로드 시도
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('/pcaps/sample.pcap', { cache: 'no-store' })
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        if (aborted) return
        const parsed = parsePCAP(buf, 1000)
        packetsRef.current = parsed.packets
        setMeta({ version: parsed.version, snaplen: parsed.snaplen, linktype: parsed.linktype })
        setSource('example')
        spawnDrops()
      } catch {
        /* example 파일이 없으면 그냥 무시 */
      }
    })()
    return () => { aborted = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 업로드 파일 수신
  useEffect(() => {
    const onFile = async (e) => {
      const file = e.detail
      try {
        const buf = await file.arrayBuffer()
        const parsed = parsePCAP(buf, 2000)
        packetsRef.current = parsed.packets
        setMeta({ version: parsed.version, snaplen: parsed.snaplen, linktype: parsed.linktype })
        setSource('upload')
        spawnDrops()
      } catch (err) {
        alert('PCAP 파싱 실패: ' + (err?.message || err))
        console.error(err)
      }
    }
    window.addEventListener('pcap-file-selected', onFile)
    return () => window.removeEventListener('pcap-file-selected', onFile)
  }, [])

  // 리사이즈
  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const onResize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = cvs.clientWidth
      const h = cvs.clientHeight
      cvs.width = Math.round(w * dpr)
      cvs.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (packetsRef.current.length) spawnDrops()
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function spawnDrops() {
    // 초기화
    dropsRef.current = []
    lastSpawnRef.current = 0
    
    // 기존 타이머 정리
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current)
    }
    
    // 즉시 3개 패킷 생성
    createInitialPackets()
    
    // 새 패킷 생성 타이머 시작
    startSpawning()
  }
  
  function createInitialPackets() {
    const cvs = canvasRef.current
    if (!cvs) return
    
    const W = cvs.clientWidth, H = cvs.clientHeight
    const base = packetsRef.current.length ? packetsRef.current : synthPackets(20)
    
    // 즉시 10개 패킷 생성
    for (let i = 0; i < Math.min(10, base.length); i++) {
      const p = base[i]
      const r = 8 + Math.min(15, Math.log2((p.size||64)) * 1.5)  // 크기 대폭 감소
      
      const angle = Math.PI/2 + (Math.random() - 0.5) * 0.9  // 90도 기준 ± 변화
      const speed = 2.0 + Math.random() * 1.5  // 더 빠른 눈송이 속도
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      
      const newDrop = { 
        id: p.id + '_initial_' + i,
        x: Math.random() * W, // 화면 위쪽에서 랜덤 x 위치
        y: -Math.random() * 200 - i * 100,  // 화면 위쪽에서 시작
        vx, vy,
        phase: Math.random() * Math.PI * 2, 
        r, 
        packet: p,
        trail: [],
        sparkles: [],
        birthTime: Date.now()
      }
      
      dropsRef.current.push(newDrop)
    }
  }
  
  function startSpawning() {
    const cvs = canvasRef.current
    if (!cvs) return
    
    const base = packetsRef.current.length ? packetsRef.current : synthPackets(20)
    let packetIndex = 10  // 이미 10개 생성했으므로 10부터 시작
    
    spawnTimerRef.current = setInterval(() => {
      if (packetIndex >= base.length) {
        packetIndex = 0  // 처음부터 다시 시작
      }
      
      // 최대 20개까지만 동시에 표시
      if (dropsRef.current.length >= 20) {
        return
      }
      
      const W = cvs.clientWidth, H = cvs.clientHeight
      const p = base[packetIndex]
      const r = 8 + Math.min(15, Math.log2((p.size||64)) * 1.5)  // 크기 대폭 감소  // 더 크게
      
      // 별똥별 궤도: 위에서 아래로 대각선 이동
      const angle = Math.PI/2 + (Math.random() - 0.5) * 0.6  // 90도 기준 ± 변화
      const speed = 2.0 + Math.random() * 1.5  // 더 빠른 눈송이 속도
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      
      const newDrop = { 
        id: p.id + '_' + Date.now(), // 고유 ID
        x: Math.random() * W,  // 화면 위쪽에서 랜덤 x 위치
        y: -Math.random() * 100,     // 위쪽에서 시작
        vx, vy,
        phase: Math.random() * Math.PI * 2, 
        r, 
        packet: p,
        trail: [],
        sparkles: [],
        birthTime: Date.now()
      }
      
      dropsRef.current.push(newDrop)
      packetIndex++
      
    }, 600)  // 0.6초마다 새 패킷 생성
  }

  // 루프
  useEffect(() => {
    let raf=0
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')

    const step = () => {
      const W = cvs.clientWidth, H = cvs.clientHeight
      ctx.clearRect(0,0,W,H)
      drawBackground(ctx, W, H)

      for (const d of dropsRef.current) {
        const isDragging = pointerRef.current.draggingId === d.id
        if (!isDragging) {
          // 트레일 점 추가 (이전 위치 저장)
          d.trail.push({ x: d.x, y: d.y })
          if (d.trail.length > 12) d.trail.shift()  // 트레일 길이 증가
          
          // 계층별 서로 다른 애니메이션 효과
          const l3 = d.packet.net?.type || ''
          const l4 = d.packet.trans?.type || ''
          
          // 기본 별똥별 이동
          d.x += d.vx
          d.y += d.vy
          d.phase += 0.01
          
          // 계층별 특수 효과
          if (l3 === 'IPv4') {
            // IPv4: 안정적인 직선 이동 + 약간의 펄스
            d.phase += 0.03
          } else if (l3 === 'IPv6') {
            // IPv6: 6각형 패턴으로 회전하며 이동
            d.x += Math.cos(d.phase * 6) * 0.8
            d.y += Math.sin(d.phase * 6) * 0.4
            d.phase += 0.02
          } else if (l3 === 'ARP') {
            // ARP: 지그재그 패턴
            d.x += Math.sin(d.phase * 8) * 1.5
            d.phase += 0.04
          } else {
            // 기타: 무작위 흔들림
            d.x += (Math.random() - 0.5) * 0.8
            d.y += (Math.random() - 0.5) * 0.4
          }
          
          // L4 프로토콜별 추가 효과
          if (l4 === 'UDP') {
            // UDP: 더 빠른 속도 변화 (연결 없음 표현)
            d.vx *= (0.98 + Math.random() * 0.04)
            d.vy *= (0.98 + Math.random() * 0.04)
          }
          
        } else {
          d.x = pointerRef.current.x + pointerRef.current.dx
          d.y = pointerRef.current.y + pointerRef.current.dy
        }
        
        // 화면 밖으로 나가면 제거 (재사용하지 않음)
        if (d.x < -100 || d.y > H + 100) {
          d.shouldRemove = true
        }

        const hovered = isInside(pointerRef.current.x, pointerRef.current.y, d)
        const peeled = peeledIds.has(d.id)
        drawDrop(ctx, d, { hovered, selected: selected===d.id })
        if (peeled) drawPeel(ctx, d, W, H)
      }

      // 화면 밖으로 나간 패킷들 제거
      dropsRef.current = dropsRef.current.filter(d => !d.shouldRemove)

      drawLegend(ctx, W, H, meta, source)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [selected, peeledIds, meta, source])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current)
      }
    }
  }, [])

  // 인터랙션
  useEffect(() => {
    const cvs = canvasRef.current
    const onMove = (e) => {
      const r = cvs.getBoundingClientRect()
      pointerRef.current.x = e.clientX - r.left
      pointerRef.current.y = e.clientY - r.top
    }
    const onDown = () => {
      pointerRef.current.down = true
      const hit = hitTest(pointerRef.current.x, pointerRef.current.y)
      if (hit) {
        pointerRef.current.draggingId = hit.id
        setSelected(hit.id)
        pointerRef.current.dx = hit.x - pointerRef.current.x
        pointerRef.current.dy = hit.y - pointerRef.current.y
      } else setSelected(null)
    }
    const onUp = () => { pointerRef.current.down=false; pointerRef.current.draggingId=null }
    const onDbl = () => { if (selected) togglePeel(selected) }
    const onKey = (e) => {
      if (e.key === ' ' || e.code==='Space') {
        if (selected) { e.preventDefault(); togglePeel(selected) }
      } else if (e.key.toLowerCase()==='r') {
        setSelected(null); setPeeledIds(new Set()); 
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
        spawnDrops()
      }
    }
    cvs.addEventListener('pointermove', onMove)
    cvs.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    cvs.addEventListener('dblclick', onDbl)
    window.addEventListener('keydown', onKey)
    cvs.addEventListener('touchstart', (e)=>e.preventDefault(), { passive:false })
    return () => {
      cvs.removeEventListener('pointermove', onMove)
      cvs.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      cvs.removeEventListener('dblclick', onDbl)
      window.removeEventListener('keydown', onKey)
    }
  }, [selected])

  function hitTest(px, py) {
    for (let i=dropsRef.current.length-1;i>=0;i--) if (isInside(px,py,dropsRef.current[i])) return dropsRef.current[i]
    return null
  }
  function togglePeel(id) {
    setPeeledIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  }

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }} aria-label="Packet Rain canvas" />
}

/* ────────────────────────────── Drawing ────────────────────────────── */

function isInside(px, py, d) {
  const dx = px - d.x, dy = py - d.y, r = d.r*1.1
  return (dx*dx + dy*dy) <= r*r
}
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)?.trim()
  return v || fallback
}
function withAlpha(hex, a=1) {
  const m = hex.replace('#','')
  const r = parseInt(m.slice(0,2),16), g = parseInt(m.slice(2,4),16), b = parseInt(m.slice(4,6),16)
  return `rgba(${r},${g},${b},${a})`
}

function drawBackground(ctx, W, H) {
  // 겨울 하늘의 은은한 블루 글로우만 유지
  const g = ctx.createRadialGradient(W*0.5, H*0.2, H*0.1, W*0.5, H*0.6, H*0.9)
  g.addColorStop(0, 'rgba(135,206,250,0.04)')  // 하늘색
  g.addColorStop(0.5, 'rgba(176,224,230,0.03)')  // 파우더 블루
  g.addColorStop(1, 'rgba(240,248,255,0.02)')     // 앨리스 블루
  ctx.fillStyle = g
  ctx.fillRect(0,0,W,H)
}

function drawDrop(ctx, d, { hovered, selected }) {
  const accent = cssVar('--accent', '#00ff9d')
  const text = cssVar('--text', '#cfeee0')
  const r = d.r
  const l3 = d.packet.net?.type || ''
  const l4 = d.packet.trans?.type || ''
  
  // 계층별 색상 정의 (겨울/눈 테마)
  const layerColors = {
    'IPv4': '#87ceeb',    // 하늘색 (겨울 하늘)
    'IPv6': '#e6f3ff',    // 연한 파란색 (눈 결정)
    'ARP': '#b0e0e6',     // 파우더 블루
    'TCP': '#add8e6',     // 라이트 블루
    'UDP': '#f0f8ff',     // 앨리스 블루 (가벼운 눈송이)
    'ICMP': '#fffafa',    // 눈 백색
    'default': '#87ceeb'  // 기본 하늘색
  }
  
  const l3Color = layerColors[l3] || layerColors.default
  const l4Color = layerColors[l4] || layerColors.default
  
  // 별똥별 트레일 그리기 (계층별 색상 적용)
  if (d.trail && d.trail.length > 1) {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    
    for (let i = 0; i < d.trail.length - 1; i++) {
      const alpha = (i / d.trail.length) * 0.8
      const trailR = r * (0.2 + alpha * 0.6)
      const point = d.trail[i]
      
      // 트레일 점들 (작은 별 모양)
      ctx.save()
      ctx.translate(point.x, point.y)
      ctx.fillStyle = withAlpha(l3Color, alpha * 0.8)
      ctx.shadowColor = withAlpha(l3Color, alpha * 0.6)
      ctx.shadowBlur = trailR * 0.5
      drawStar(ctx, 5, trailR * 0.8, trailR * 0.3, true)
      ctx.restore()
    }
    ctx.restore()
  }
  
  ctx.save()
  ctx.translate(d.x, d.y)


  // 별똥별 외곽 글로우 (큰 글로우)
  const outerGlow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2)
  outerGlow.addColorStop(0, withAlpha(l3Color, 0.6))
  outerGlow.addColorStop(0.3, withAlpha(l3Color, 0.3))
  outerGlow.addColorStop(0.7, withAlpha(l4Color, 0.2))
  outerGlow.addColorStop(1, withAlpha(l3Color, 0))
  ctx.fillStyle = outerGlow
  ctx.beginPath()
  ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
  ctx.fill()

  // 진짜 별 모양 - 외곽 별
  ctx.save()
  ctx.fillStyle = withAlpha('#ffffff', 0.9)
  ctx.shadowColor = withAlpha(l3Color, 1.0)
  ctx.shadowBlur = r * 1.2
  drawStar(ctx, 5, r * 0.7, r * 0.3, true)  // 진짜 별 모양 (5개 스파이크)
  ctx.restore()

  // 프로토콜별 색상 별 (작은 별)
  ctx.save()
  ctx.fillStyle = withAlpha(l3Color, 0.8)
  ctx.shadowColor = withAlpha(l3Color, 0.8)
  ctx.shadowBlur = r * 0.6
  drawStar(ctx, 5, r * 0.45, r * 0.2, true)
  ctx.restore()

  // 중심의 밝은 별 (가장 작은 별)
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,1.0)'
  ctx.shadowColor = 'rgba(255,255,255,0.8)'
  ctx.shadowBlur = r * 0.3
  drawStar(ctx, 5, r * 0.2, r * 0.08, true)
  ctx.restore()

  // 인터랙션 효과
  if (hovered || selected) {
    ctx.lineWidth = selected ? 3 : 2
    ctx.strokeStyle = withAlpha(accent, selected ? 1.0 : 0.8)
    ctx.shadowColor = withAlpha(accent, 0.8)
    ctx.shadowBlur = selected ? 20 : 12
    ctx.beginPath()
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2)
    ctx.stroke()

    // 라벨 표시
    ctx.shadowBlur = 0
    ctx.fillStyle = text
    ctx.font = 'bold 11px ui-monospace, Menlo, monospace'
    const label = `${l3}/${l4 || ''}`.replace(/\/$/, '')
    const w = ctx.measureText(label).width
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    roundRect(ctx, -w/2-4, -r*1.6-12, w+8, 16, 4, true, false)
    ctx.fillStyle = text
    ctx.fillText(label, -w/2, -r*1.6)
  }

  ctx.restore()
}

function drawPeel(ctx, d, W, H) {
  const { eth, net, trans, size, payload } = d.packet
  const startX = Math.min(Math.max(d.x + 20, 16), W - 280)
  const startY = Math.min(Math.max(d.y - 8, 60), H - 140)
  const totalW = 240, h = 18

  ctx.save()
  ctx.fillStyle = 'rgba(8,10,12,0.9)'; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1
  roundRect(ctx, startX-10, startY-32, totalW+20, 120, 8, true, true)

  const ethB=14, l3B = net?.type==='IPv4'?20: net?.type==='IPv6'?40:8, l4B = trans?.type==='TCP'?20: trans?.type==='UDP'?8:8
  const payB = Math.max(0, payload||0); const sum = Math.max(1, ethB+l3B+l4B+payB)
  let x = startX
  const seg=(bytes,color,shape='rect')=>{
    const w = Math.max(8, Math.round((bytes/sum)*totalW)); ctx.fillStyle=color
    if (shape==='rect') roundRect(ctx,x,startY,w,h,3,true,false)
    else if (shape==='hex') drawHexStrip(ctx,x,startY,w,h)
    else if (shape==='diamond') drawDiamondStrip(ctx,x,startY,w,h)
    x += w - 0.5
  }
  seg(ethB,'rgba(135,206,250,0.35)','rect')
  if (net?.type==='IPv4') seg(l3B,'rgba(135,206,250,0.25)','rect')
  else if (net?.type==='IPv6') seg(l3B,'rgba(176,224,230,0.25)','hex')
  else if (net?.type==='ARP') seg(l3B,'rgba(176,224,230,0.25)','diamond')
  else seg(l3B,'rgba(135,206,250,0.22)','rect')
  if (trans?.type==='TCP') seg(l4B,'rgba(173,216,230,0.20)','rect')
  else if (trans?.type==='UDP') seg(l4B,'rgba(240,248,255,0.18)','rect')
  else seg(l4B,'rgba(135,206,250,0.16)','rect')
  seg(payB,'rgba(255,250,250,0.12)','rect')

  ctx.fillStyle = cssVar('--text', '#cfeee0'); ctx.font = '11px ui-monospace, Menlo, monospace'
  ctx.fillText(`ETH ${eth.src} → ${eth.dst}  (0x${(eth.etherType||0).toString(16)})`, startX, startY-14)
  let l2 = net?.type || '—'
  if (net?.type==='IPv4' || net?.type==='IPv6') { l2 += `  ${net.src} → ${net.dst}`; if (net.ttl!=null) l2 += `  ttl=${net.ttl}` }
  ctx.fillText(l2, startX, startY + h + 14)
  let l3 = (trans?.type||'—'); if (trans?.sport!=null) l3 += `  ${trans.sport} → ${trans.dport}`; if (trans?.type==='TCP' && trans.flags!=null) l3 += `  flags=${tcpFlagsToStr(trans.flags)}`
  l3 += `  •  ${size||0}B`; ctx.fillText(l3, startX, startY + h + 32)
  ctx.restore()
}

/* ────────────────────────────── Primitives ───────────────────────────── */

function roundRect(ctx, x,y,w,h,r=4, fill=true, stroke=false){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function drawRect(ctx,cx,cy,w,h,rad=3,fill=true){ctx.save();ctx.translate(cx-w/2,cy-h/2);roundRect(ctx,0,0,w,h,rad,fill,false);ctx.restore()}
function drawPolygon(ctx,sides,rad,fill=true){ctx.beginPath();for(let i=0;i<sides;i++){const a=(i/sides)*Math.PI*2-Math.PI/2;const x=Math.cos(a)*rad;const y=Math.sin(a)*rad;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();fill?ctx.fill():ctx.stroke()}
function drawStar(ctx,spikes,outerRad,innerRad,fill=true){const rot=Math.PI/2*3;const step=Math.PI/spikes;ctx.beginPath();ctx.moveTo(0,-outerRad);for(let i=0;i<spikes;i++){const x=Math.cos(rot+step*i)*outerRad;const y=Math.sin(rot+step*i)*outerRad;ctx.lineTo(x,y);const x2=Math.cos(rot+step*i+step/2)*innerRad;const y2=Math.sin(rot+step*i+step/2)*innerRad;ctx.lineTo(x2,y2)}ctx.closePath();fill?ctx.fill():ctx.stroke()}
function drawDiamond(ctx,cx,cy,r,fill=true){ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx+r*0.9,cy);ctx.lineTo(cx,cy+r);ctx.lineTo(cx-r*0.9,cy);ctx.closePath();fill?ctx.fill():ctx.stroke()}
function drawHexStrip(ctx,x,y,w,h){const r=h/2;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();ctx.fill()}
function drawDiamondStrip(ctx,x,y,w,h){ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w/2,y+h);ctx.lineTo(x,y+h/2);ctx.closePath();ctx.fill()}
function drawTCPFlags(ctx,flags,r){const bits=[['U',5],['A',4],['P',3],['R',2],['S',1],['F',0]];const accent=cssVar('--accent','#00ff9d');const text=cssVar('--text','#cfeee0');const active=b=>((flags>>b)&1)===1;const y=r*0.2;const w=r*1.4,h=10;const x0=-w/2;const step=w/bits.length;ctx.save();for(let i=0;i<bits.length;i++){const b=bits[i];ctx.fillStyle=active(b[1])?withAlpha(accent,0.6):'rgba(255,255,255,0.08)';roundRect(ctx,x0+i*step+1,y,step-2,h,2,true,false)}ctx.fillStyle=text;ctx.font='9px ui-monospace, Menlo, monospace';const label=bits.filter(b=>active(b[1])).map(b=>b[0]).join('');if(label){const tw=ctx.measureText(label).width;ctx.fillText(label,-tw/2,y-2)}ctx.restore()}
function tcpFlagsToStr(flags){return [['U',5],['A',4],['P',3],['R',2],['S',1],['F',0]].filter(([_,b])=>((flags>>b)&1)).map(([k])=>k).join('')}

function drawLegend(ctx, W, H, meta, source) {
  if (!meta) return
  
  // Simple legend in bottom left
  const legendX = 20, legendY = H - 80
  const legendW = 250, legendH = 60
  
  ctx.save()
  ctx.fillStyle = 'rgba(8,10,12,0.8)'
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 1
  roundRect(ctx, legendX, legendY, legendW, legendH, 6, true, true)
  
  ctx.fillStyle = '#87ceeb'
  ctx.font = 'bold 10px ui-monospace, monospace'
  ctx.fillText('❄️ SNOW STREAM', legendX + 8, legendY + 16)
  
  ctx.fillStyle = '#cfeee0'
  ctx.font = '9px ui-monospace, monospace'
  ctx.fillText(`❄️ SOURCE: ${source === 'example' ? 'SAMPLE.PCAP' : 'UPLOADED.PCAP'}`, legendX + 8, legendY + 32)
  ctx.fillText(`🌨️ VERSION: ${meta.version} | SNAPLEN: ${meta.snaplen}`, legendX + 8, legendY + 46)
  
  ctx.restore()
}

/* ──────────────────────── Fallback / Help Card ──────────────────────── */

function UploadHelpCard() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        bottom: 24, right: 24, maxWidth: 360,
        borderRadius: 12, padding: 16,
        border: '1px solid rgba(0,0,0,0.4)',
        background: 'rgba(10,12,14,0.6)', backdropFilter: 'blur(6px)',
        color: 'var(--text)', boxShadow: '0 0 14px rgba(0,0,0,0.2)',
        fontFamily: 'ui-monospace, Menlo, monospace', zIndex: 2
      }}
    >
      <div style={{ opacity: .8, fontSize: 12, marginBottom: 6, letterSpacing: '.08em' }}>❄️ winter protocol analysis</div>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#87ceeb', textShadow: '0 0 5px rgba(135,206,250,0.3)' }}>PCAP to Snow Stream</div>
      <ul style={{ margin: '0 0 6px 16px', padding: 0 }}>
        <li>❄️ 예시 파일: <code>/pcaps/sample.pcap</code> 자동 로드</li>
        <li>🌨️ 업로드 또는 드래그&드롭으로 교체</li>
        <li>⛄ 드래그: grab · 더블클릭/Space: peel · R: reset</li>
      </ul>
      <div style={{ opacity: .7, fontSize: 12 }}>현재 버전은 <b>PCAP</b>(Ethernet linktype)만 지원</div>
    </div>
  )
}

/* ──────────────────────── Synthetic fallback (no example) ─────────────────────── */
function synthPackets(n=64){
  const rand=(a,b)=>Math.floor(a+Math.random()*(b-a+1))
  const pick=(arr)=>arr[rand(0,arr.length-1)]
  const arr=[]
  for(let i=0;i<n;i++){
    const v4=Math.random()<0.7; const l4=pick(['TCP','UDP']); const size=rand(64,900)
    arr.push({
      id: cryptoId(), ts: Date.now(),
      eth:{src:'aa:bb:cc:dd:ee:ff', dst:'11:22:33:44:55:66', etherType: v4?0x0800:0x86DD},
      net: v4? {type:'IPv4', src:`10.0.${rand(0,255)}.${rand(1,254)}`, dst:`192.168.${rand(0,255)}.${rand(1,254)}`, ttl:64}
             : {type:'IPv6', src:'2001:db8::1', dst:'2001:db8::2'},
      trans: l4==='TCP'? {type:'TCP', sport:rand(1000,65535), dport:pick([80,443,22,53,8080]), flags:rand(0,63)}
                        : {type:'UDP', sport:rand(1000,65535), dport:pick([80,443,53,123])},
      size, payload: Math.max(0, size-54)
    })
  }
  return arr
}