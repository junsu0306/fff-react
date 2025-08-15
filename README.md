 # CIPHER — Dark Interactive Deck

다크/해킹 콘셉트의 인터랙티브 웹 프로젝트.  
React 19 + Vite 기반, 다크/네온 테마와 3D/애니메이션 확장을 고려한 기본 구조.

---

## ⚙️ 스택
- **Runtime**: Node.js 18+ (권장 20+), npm
- **Web**: React **19**, Vite
- **3D/그래픽**: three, **@react-three/fiber@9**, **@react-three/drei@10**
- **후처리**: **@react-three/postprocessing@3**, postprocessing
- **유틸**: three-stdlib, maath, zustand, leva, troika-three-text
- **애니메이션**: framer-motion, gsap, @react-spring/three, @react-spring/web
- **개발 플러그인**: vite-plugin-glsl, vite-imagetools, vite-plugin-svgr

> React 19와 호환되는 최신 메이저(굵게) 사용.

---

## 🚀 시작하기
```bash
# 의존성 설치 (React 19 기준)
npm i three @react-three/fiber @react-three/drei \
@react-three/postprocessing postprocessing three-stdlib \
maath zustand leva troika-three-text \
framer-motion gsap @react-spring/three @react-spring/web

# 개발 플러그인
npm i -D vite-plugin-glsl vite-imagetools vite-plugin-svgr

# 개발 서버
npm run dev   # http://localhost:5173

# 빌드 / 미리보기
npm run build
npm run preview
