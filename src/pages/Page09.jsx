// src/pages/Page09.jsx
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import BackButton from '../components/BackButton.jsx'

export default function Page09() {
  const [pageMode, setPageMode] = useState('default') // default | bob

  return (
    <div className={`page9-wrap ${pageMode === 'bob' ? 'bob-bg' : ''}`} style={{minHeight:'100vh', padding:'64px 24px 24px'}}>
      {/* Page-wide background styles */}
      <style>{`
        .page9-wrap {
          background: #000;                           /* ← 기본 배경 이미지를 검정으로 */
          background-size: cover;
          background-position: center;
          transition: background 300ms ease, background-image 300ms ease, filter 300ms ease;
        }
        .page9-wrap.bob-bg {                          /* ← BoB 모드는 기존 배경 유지 */
          background-image: url(/images/bob_bg_pixel.png);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
        }
        .page9-wrap.bob-bg::before { /* 살짝 어둡게 오버레이 - 가독성 */
          content: '';
          position: absolute; inset: 0;
          background: rgba(0,0,0,.28);
          pointer-events: none;
        }
      `}</style>

      <BackButton />
      <div style={{maxWidth:1100, margin:'64px auto 0', position:'relative', zIndex:1}}>
        <Terminal onModeChange={setPageMode} />
      </div>
    </div>
  )
}

/* =========================
 * Terminal Component
 * ========================= */
function Terminal({ onModeChange }) {
  const [lines, setLines] = useState([])     // {type:'out'|'cmd'|'sys'|'err', text:string}[]
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [banner, setBanner] = useState(true)     // 상단 ASCII 배너 표시 여부
  const [savedBanner, setSavedBanner] = useState(true) // bob 진입 전에 상태 저장
  const [theme, setTheme] = useState('neon')     // neon | dim | crt (기본=레드 계열)
  const [mode, setMode] = useState('default')    // default | bob
  const [prevTheme, setPrevTheme] = useState('neon')   // bob 탈출 시 복구용
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const baseUser = 'guest'
  const baseHost = 'cipher'
  const cwd  = useRef('~/demo')
  const booted = useRef(false)

  const displayUser = mode === 'bob' ? 'bob' : baseUser
  const displayHost = mode === 'bob' ? 'BoB' : baseHost

  // Auto-focus & boot banner
  useEffect(() => {
    inputRef.current?.focus()
    if (!booted.current) {
      booted.current = true
      bootSequence()
    }
    // eslint-disable-next-line
  }, [])

  // Always scroll to bottom on updates
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  // Key handling
  function onKeyDown(e) {
    if ((e.ctrlKey && e.key.toLowerCase() === 'l') || (e.metaKey && e.key.toLowerCase() === 'k')) {
      e.preventDefault()
      setLines([])
      return
    }
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      pushLine({ type:'sys', text:'^C' })
      setInput('')
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(history.length - 1, (histIdx === -1 ? history.length - 1 : histIdx + 1))
      if (next >= 0) {
        setHistIdx(next)
        setInput(history[history.length - 1 - next])
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(-1, histIdx - 1)
      setHistIdx(next)
      setInput(next === -1 ? '' : history[history.length - 1 - next])
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      setInput(autocomplete(input))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim().length === 0) {
        pushPrompt('')
        setInput('')
        return
      }
      const cmd = input
      pushPrompt(cmd)
      setHistory(h => [...h, cmd])
      setHistIdx(-1)
      setInput('')
      runCommand(cmd)
      return
    }
  }

  function pushLine(line) { setLines(prev => [...prev, line]) }
  function pushLines(list) { setLines(prev => [...prev, ...list]) }
  function pushPrompt(cmd) {
    pushLine({ type:'cmd', text:`${displayUser}@${displayHost} ${cwd.current}$ ${cmd}` })
  }

  function bootSequence() {
    const ascii = [
      '   _______  __      __  ________  ______  ________',
      '  / ____/ |/ /___  / /_/ ____/ / / / __ \\/ ____/ /',
      ' / /    |   / __ \\/ __/ /   / / / / /_/ / /   / / ',
      '/ /___ /   / /_/ / /_/ /___/ /_/ / ____/ /___/ /__',
      '\\____//_/|_\\____/\\__/\\____/\\____/_/    \\____/____/',
    ]
    const boot = [
      '[*] Initializing pseudo-TTY... ok',
      '[*] Loading themes (neon, dim, crt)... ok',
      '[*] Enabling GLSL-less scanlines... ok',
      '[*] Type "help" to get started.',
    ]
    const seq = [
      ...ascii.map(t => ({ type:'out', text: t })),
      { type:'out', text: '' },
      ...boot.map(t => ({ type:'sys', text: t })),
      { type:'out', text: '' }
    ]
    seq.forEach((l, i) => setTimeout(() => pushLine(l), i * 90))
  }

  function runCommand(raw) {
    const [cmd, ...args] = splitArgs(raw)
    const A = args.join(' ')
    const sleep = ms => new Promise(r => setTimeout(r, ms))

    const commands = {
      help: () => {
        pushLines([
          out('Available commands:'),
          out('  help               Show this help'),
          out('  clear              Clear the terminal (Ctrl+L / Cmd+K)'),
          out('  whoami             Print current user'),
          out('  pwd                Print working directory'),
          out('  date               Print current time'),
          out('  echo <text>        Echo text'),
          out('  ls                 List files'),
          out('  cat README.md      Show README'),
          out('  neofetch           Show system info'),
          out('  banner on|off      Toggle ASCII banner'),
          out('  theme crt|dim|neon Switch theme'),
          out('  scan <host>        Faux port scan with progress'),
          out('  curl <url>         Demo HTTP fetch output (simulated)'),
          out('  sudo <cmd>         try it :)'),
          out('  bob                Enter BoB shell (full-page bg swap)'),
          out('  exit               Leave BoB shell (restore)'),
        ])
      },
      clear: () => setLines([]),
      whoami: () => pushLine(out(displayUser)),
      pwd: () => pushLine(out(cwd.current)),
      date: () => pushLine(out(new Date().toString())),
      echo: () => pushLine(out(A)),
      ls: () => pushLines([ out('README.md   logs/   secrets/   src/   build/   .config') ]),
      cat: () => {
        if (A.toLowerCase() === 'readme.md') {
          pushLines([
            out('# cipher :: interactive security terminal'),
            out('- Use the neon prompt to try commands.'),
            out('- Nothing is executed on your machine; this is a safe emulator.'),
            out('- Try: scan example.com | neofetch | theme crt | bob'),
          ])
        } else {
          pushLine(err(`cat: ${A || '(no file)'}: No such file`))
          glitch()
        }
      },
      neofetch: () => pushLines([
        out(`${mode === 'bob' ? 'BoB-shell' : 'cipherOS'} 1.0 (browser)`),
        out(`User: ${displayUser}   Host: ${displayHost}   Shell: psh 0.3`),
        out('Resolution: responsive   Theme: ' + theme),
        out('Memory: plenty   CPU: JavaScript'),
      ]),
      banner: () => {
        if (!args[0]) return pushLine(err('usage: banner on|off'))
        const on = args[0].toLowerCase() === 'on'
        setBanner(on); pushLine(sys(`banner ${on ? 'enabled' : 'disabled'}`))
      },
      theme: () => {
        const t = (args[0] || '').toLowerCase()
        if (!['crt','dim','neon'].includes(t)) return pushLine(err('usage: theme crt|dim|neon'))
        setTheme(t); pushLine(sys(`theme switched to ${t}`))
      },
      sudo: () => pushLine(err(`${displayUser} is not in the sudoers file. This incident will be reported.`)),
      scan: async () => {
        if (!args[0]) return pushLine(err('usage: scan <host>'))
        const host = args[0]
        pushLine(sys(`[+] scanning ${host} ...`))
        await progressBar(48)
        fauxScan(host).forEach(l => pushLine(out(l)))
        pushLine(sys('[+] done'))
      },
      curl: async () => {
        if (!args[0]) return pushLine(err('usage: curl <url>'))
        const u = args[0]
        pushLine(sys(`GET ${u}`))
        await sleep(300)
        pushLines([
          out('{'),
          out('  "status": 200,'),
          out('  "contentType": "text/html; charset=utf-8",'),
          out('  "length": 1024,'),
          out('  "body": "<html>... demo content ...</html>"'),
          out('}'),
        ])
      },

      // ====== BoB 전용 쉘 ======
      bob: async () => {
        if (mode === 'bob') { pushLine(sys('Already in BoB shell. Type "exit" to leave.')); return }
        setPrevTheme(theme)
        setSavedBanner(banner)
        setBanner(false)
        setMode('bob')
        setTheme('crt')
        onModeChange?.('bob')

        setLines([])
        const logo = [
          '██████╗  ██████╗ ██████╗ ',
          '██╔══██╗██╔═══██╗██╔══██╗',
          '██████╔╝██║   ██║██████╔╝',
          '██╔══██╗██║   ██║██╔══██╗',
          '██████╔╝╚██████╔╝██║  ██║',
          '╚═════╝  ╚═════╝ ╚═╝  ╚═╝  shell'
        ]
        pushLine(sys('[BoB] switching shell & theme...'))
        await new Promise(r=>setTimeout(r,180));
        pushLine(out(''))
        logo.forEach((t,i)=>setTimeout(()=>pushLine({type:'out', text:t}), i*40))
        setTimeout(()=>{
          pushLines([
            out(''),
            sys('BoB 14기 보안제품개발 트랙 화이팅'),
            out('Type "neofetch" or "exit" to return.'),
            out('')
          ])
        }, logo.length*40 + 20)
      },

      // ====== 복귀 ======
      exit: () => {
        if (mode !== 'bob') { pushLine(err('exit: not in BoB shell')); return }
        onModeChange?.('default')
        setMode('default')
        setTheme(prevTheme || 'neon')
        setBanner(savedBanner)
        setLines([])
        bootSequence()
      },

      default: () => { pushLine(err(`${cmd}: command not found`)); glitch() }
    }

    ;(commands[cmd] || commands.default)()
  }

  // -------- helpers --------
  function splitArgs(s) {
    const r = []; let cur = ''; let q = null
    for (let i=0;i<s.length;i++){
      const c = s[i]
      if (q) { if (c === q) { q = null; continue } cur += c }
      else { if (c === '"' || c === "'") { q = c; continue }
             if (/\s/.test(c)) { if (cur) { r.push(cur); cur=''} }
             else cur += c }
    }
    if (cur) r.push(cur)
    const [cmd, ...args] = r
    return [ (cmd||'').trim(), ...args ]
  }

  function autocomplete(s) {
    const cmds = ['help','clear','whoami','pwd','date','echo','ls','cat','neofetch','banner','theme','scan','curl','sudo','bob','exit']
    const [c, ...rest] = splitArgs(s)
    if (!c) return s
    const cand = cmds.filter(x => x.startsWith(c))
    if (cand.length === 1) return [cand[0], ...rest].join(' ')
    return s
  }

  function fauxScan(seedStr) {
    const rng = mulberry32(hash(seedStr))
    const common = [21,22,25,53,80,110,143,443,587,993,995,3306,3389,6379,8080,9000]
    const open = common.filter(p => rng() > 0.45)
    const closed = common.filter(p => !open.includes(p))
    const lines = []
    open.forEach(p => lines.push(`${seedStr}:${p}   open`))
    closed.forEach(p => lines.push(`${seedStr}:${p}   closed`))
    return lines
  }
  function hash(s) { let h=1779033703^s.length; for (let i=0;i<s.length;i++){h = Math.imul(h^s.charCodeAt(i),3432918353); h = (h<<13)|(h>>>19)} return (h>>>0) }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296 } }

  async function progressBar(ticks=30) {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    let bar = ''
    for (let i=0;i<ticks;i++) {
      bar += '█'
      pushLine(sys(`[${bar.padEnd(ticks,' ')}] ${Math.round(((i+1)/ticks)*100)}%`))
      await sleep(30 + (i%5)*8)
    }
  }

  function out(text) { return { type:'out', text } }
  function err(text) { return { type:'err', text } }
  function sys(text) { return { type:'sys', text } }

  function glitch() {
    const el = scrollRef.current?.parentElement
    if (!el) return
    el.classList.add('glitch')
    setTimeout(()=>el.classList.remove('glitch'), 250)
  }

  // === 테마 팔레트: 기본은 레드/오렌지 계열, BoB 모드만 블루 오버라이드 ===
  const themeStyle = useMemo(() => {
    let vars
    if (theme === 'crt') {
      vars = {
        '--ter-bg':'rgba(18,0,0,.80)',
        '--ter-border':'rgba(255,64,64,.28)',
        '--ter-glow':'0 0 18px rgba(255,64,64,.22)',
        '--ter-text':'#ffe2e2',
        '--ter-accent':'#ff3b3b',
        '--ter-accent-soft':'rgba(255,64,64,.22)',
        '--ter-sys':'#ffc7c7'
      }
    } else if (theme === 'dim') {
      vars = {
        '--ter-bg':'rgba(12,8,8,.74)',
        '--ter-border':'rgba(255,96,64,.18)',
        '--ter-glow':'0 0 12px rgba(255,80,64,.16)',
        '--ter-text':'#f3d9d9',
        '--ter-accent':'#ff5a3a',
        '--ter-accent-soft':'rgba(255,90,58,.2)',
        '--ter-sys':'#ffd5cc'
      }
    } else {
      // neon
      vars = {
        '--ter-bg':'rgba(24,4,4,.78)',
        '--ter-border':'rgba(255,72,72,.38)',
        '--ter-glow':'0 0 20px rgba(255,72,72,.28)',
        '--ter-text':'#ffdede',
        '--ter-accent':'#ff2d2d',
        '--ter-accent-soft':'rgba(255,45,45,.24)',
        '--ter-sys':'#ffc9c9'
      }
    }
    // === BoB 모드: 블루 계열 유지(기존과 동일) ===
    if (mode === 'bob') {
      vars['--ter-border'] = 'rgba(64,160,255,.55)'
      vars['--ter-glow']   = '0 0 22px rgba(64,160,255,.28)'
      vars['--ter-accent'] = '#7cc4ff'
      vars['--ter-accent-soft'] = 'rgba(124,196,255,.22)'
      vars['--ter-text']   = '#dbeeff'
      vars['--ter-sys']    = '#b9dcff'
      vars['--ter-bg']     = 'rgba(0,12,24,.78)'
    }
    return vars
  }, [theme, mode])

  return (
    <div className="term-wrap" style={{position:'relative'}}>
      {/* local styles for terminal */}
      <style>{`
        .term {
          position: relative;
          border-radius: 16px;
          background: var(--ter-bg);
          border: 1px solid var(--ter-border);
          box-shadow: var(--ter-glow), 0 18px 70px rgba(0,0,0,.55) inset;
          overflow: hidden;
        }
        .term::before {
          content:'';
          position:absolute; inset:0;
          background: radial-gradient(120% 140% at 50% -10%, transparent 35%, rgba(0,0,0,.25) 70%, rgba(0,0,0,.55) 100%);
          pointer-events:none;
        }
        .scanlines::after {
          content:'';
          position:absolute; inset:0;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 1px, transparent 1px 3px);
          mix-blend-mode: overlay;
          opacity:.45;
          animation: flicker 4s infinite steps(60);
          pointer-events:none;
        }
        @keyframes flicker { 0%,100%{opacity:.43} 50%{opacity:.38} }
        .glow { text-shadow: 0 0 6px var(--ter-accent), 0 0 12px var(--ter-accent-soft); } /* ← 레드 계열 글로우 */
        .cursor {
          display:inline-block; width:10px; height:1.25em; translate:0 .2em;
          background: var(--ter-accent);
          box-shadow: 0 0 8px var(--ter-accent);
          animation: blink 1s step-start infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .panel-header {
          display:flex; align-items:center; gap:8px;
          padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.06);
          background: linear-gradient(to bottom, rgba(255,255,255,.04), transparent);
          font-size:12px; letter-spacing:.04em; color: var(--ter-text);
        }
        .dot { width:10px; height:10px; border-radius:50%; background:#ff5f56; box-shadow: 0 0 8px rgba(255,95,86,.4); }
        .dot.yellow { background:#ffbd2e; box-shadow: 0 0 8px rgba(255,189,46,.35); }
        .dot.green { background:#27c93f; box-shadow: 0 0 8px rgba(39,201,63,.35); }
        .screen {
          height: 62vh; min-height: 420px;
          overflow:auto; padding:18px 16px 90px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Fira Code", Consolas, monospace;
          color: var(--ter-text); font-size: 14.5px; line-height: 1.6;
        }
        .prompt { color: var(--ter-accent); }
        .line.err { color: #ff6b6b; text-shadow: 0 0 6px rgba(255,107,107,.35); }
        .line.sys { color: var(--ter-sys); opacity:.85 }
        .input-row {
          position:absolute; left:0; right:0; bottom:0;
          display:flex; align-items:center; gap:8px;
          padding:12px 14px; border-top:1px solid rgba(255,255,255,.06);
          background: linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,.15));
          font-size:14.5px;
        }
        .input {
          flex:1; background: transparent; border:0; outline:0; color:var(--ter-text);
          caret-color: var(--ter-accent); font: inherit; letter-spacing:.02em;
        }
        .glitch { animation: glitchy .25s linear; }
        @keyframes glitchy {
          0% { transform: translate(0,0) }
          20% { transform: translate(-1px, 0) skewX(-1deg) }
          40% { transform: translate(1px, 0) skewX(1deg) }
          60% { transform: translate(-1px, 0) }
          80% { transform: translate(1px, 0) }
          100% { transform: translate(0,0) }
        }
        .bob-emblem {
          margin-left: 8px;
          padding: 4px 8px;
          border: 1px solid rgba(167,255,218,.25);
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: .06em;
          color: #d6f7ff;
          background: rgba(0, 50, 80, .35);
          box-shadow: 0 0 12px rgba(64,160,255,.25) inset, 0 0 12px rgba(64,160,255,.18);
        }
      `}</style>

      <div className="term scanlines" style={themeStyle}>
        <div className="panel-header">
          <span className="dot" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span style={{opacity:.8}}>psh — {mode === 'bob' ? 'BoB shell' : 'pseudo shell'}</span>
          {mode === 'bob' && <span className="bob-emblem">BEST OF THE BEST</span>}
          <span style={{marginLeft:'auto', opacity:.6}}>theme: {theme}</span>
        </div>

        <div className="screen hide-scrollbar" ref={scrollRef}>
          {banner && (
            <pre className="glow" style={{margin:'6px 0 14px'}}>
{String.raw`   _______  __      __  ________  ______  ________
  / ____/ |/ /___  / /_/ ____/ / / / __ \/ ____/ /
 / /    |   / __ \/ __/ /   / / / / /_/ / /   / /
/ /___ /   / /_/ / /_/ /___/ /_/ / ____/ /___/ /__
\____//_/|_\____/\__/\____/\____/_/    \____/____/`}
            </pre>
          )}
          {lines.map((l, i) => (
            <pre key={i} className={`line ${l.type}`} style={{margin:'0 0 2px', whiteSpace:'pre-wrap'}}>
              {l.text}
            </pre>
          ))}
        </div>

        <div className="input-row">
          <span className="prompt">{displayUser}@{displayHost} {cwd.current}$</span>
          <input
            ref={inputRef}
            className="input"
            spellCheck={false}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='type "help" to begin'
            aria-label="terminal input"
          />
          <span className="cursor" />
        </div>
      </div>
    </div>
  )
}
