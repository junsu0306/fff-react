import BackButton from '../components/BackButton.jsx'

export default function Page01() {
  return (
    <div style={{minHeight:'100vh', padding:'64px 24px 24px'}}>
      <BackButton />
      <div style={{maxWidth:980, margin:'64px auto 0'}}>
        <h1 style={{fontSize:48, margin:'0 0 12px', letterSpacing:'-0.02em'}}>Page 01</h1>
        <p style={{opacity:.8, marginTop:0}}>
          여기에 각자 인터랙티브 페이지 코드를 추가하세요. (src/pages/Page01.jsx)
        </p>
        <div style={{marginTop:24, border:'1px dashed rgba(255,255,255,.22)', borderRadius:12, padding:24, opacity:.75}}>
          {/* Demo placeholder */}
          <p>Placeholder: 이 영역을 자신의 Canvas / WebGL / SVG / CSS 작업 영역으로 쓰면 됩니다.</p>
        </div>
      </div>
    </div>
  )
}
