# fff-react

CIPHER — Dark Interactive Deck

다크/해킹 콘셉트의 인터랙티브 웹 실험 프로젝트입니다. React + Vite 기반이며 Three.js와 R3F를 활용해 3D/후처리/애니메이션을 빠르게 붙일 수 있도록 준비되어 있습니다.

✅ 기술 스택

React + Vite

Three.js / @react-three/fiber / @react-three/drei

후처리: @react-three/postprocessing, postprocessing

애니메이션: framer-motion, gsap, @react-spring/three

수학/유틸: maath, three-stdlib

상태 관리: zustand

조절 UI: leva

셰이더: vite-plugin-glsl (.glsl/.vert/.frag import)

이미지/SVG: vite-imagetools, vite-plugin-svgr

프로젝트 구조
src/
├─ components/
│  ├─ ArcCarousel.jsx         // 카드 캐러셀(다크/네온)
│  └─ BackButton.jsx
├─ pages/                     // p/1 ~ p/15 라우트 페이지
│  ├─ Page01.jsx … Page15.jsx
├─ App.jsx                    // 라우트/홈
├─ index.css                  // 다크/네온 테마 토큰
└─ main.jsx
public/
├─ images/background.jpg      // 배경
├─ models/                    // .glb/.gltf
├─ textures/                  // 텍스처
└─ hdris/                     // HDR 환경맵


기본 배경은 public/images/background.jpg

모델은 public/models/…, 텍스처는 public/textures/…, HDRI는 public/hdris/…

실행
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview



스타일/테마

다크/네온 토큰은 src/index.css의 CSS 변수로 관리합니다.

핵심 변수:

--text: 기본 텍스트 색

--accent: 네온 그린

카드 배경/보더/글로우 강도는 ArcCarousel.jsx에서 focus 값으로 중앙 강조.

에셋 가이드

모델(GLB): 가능한 한 로폴리/머티리얼 수 최소화, 텍스처는 압축(KTX2) 권장.

텍스처: 2의 제곱 크기(512/1024/2048…), imagemin/squoosh로 최적화.

HDRI: 1K~2K 정도면 충분. 필요 시 pmrem으로 환경맵 변환은 Drei가 처리.

폴더:

public/models/…

public/textures/…

public/hdris/…

성능 체크리스트

프레임 떨어질 땐:

shadows 품질/범위 낮추기, dpr 제한(<Canvas dpr={[1, 1.5]}>).

폴리곤/드로우콜 감소(머지, 인스턴싱).

후처리 최소화(특히 Bloom/SSAO).

필요 화면에만 3D 캔버스 마운트.

이미지: vite-imagetools로 사이즈별 변환(필요 시).

협업 규칙(라이트)

페이지 단위 분업: 각자 src/pages/PageXX.jsx 담당.

공용 컴포넌트: src/components/에 추가(재사용 위주).

에셋 위치: public/ 하위 규칙 준수(위 “에셋 가이드”).

코드 스타일: 함수형 컴포넌트, 훅 우선. 긴 JSX는 소컴포넌트로 분리.

이름 규칙: PascalCase(컴포넌트/페이지), camelCase(함수/변수), SCREAMING_SNAKE_CASE(상수).

주석: 파일 상단에 용도/주의사항 1~2줄.