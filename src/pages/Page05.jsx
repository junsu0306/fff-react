import React, { useState, useEffect, useMemo } from 'react';
import './Page05.css';
import BackButton from '../components/BackButton.jsx';

// --- 데이터 영역 (이전과 동일) ---
const C_CODE = " int a = 10;";
const ASSEMBLY_CODE = " mov eax, 10";
const MACHINE_CODE = " 10111000 00001010 00000000 00000000 00000000";
const GLITCH_CHARS = " ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω!?@#$";

// --- 타이핑 효과를 위한 커스텀 Hook (이전과 동일) ---
function useTypingEffect(targetText, speed = 50) {
    const [currentText, setCurrentText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        setIsTyping(true);
        setCurrentText('');
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < targetText.length) {
                setCurrentText(prev => prev + targetText.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, speed);
        return () => clearInterval(typingInterval);
    }, [targetText, speed]);
    return { text: currentText, isTyping };
}

// --- 인터랙티브 코드 뷰어 컴포넌트 (이전과 동일) ---
function PerspectiveShifter() {
    const [isComputerView, setIsComputerView] = useState(false);
    const [cCodeTarget, setCCodeTarget] = useState(C_CODE);
    const [machineCodeTarget, setMachineCodeTarget] = useState(MACHINE_CODE);
    const [assemblyTarget, setAssemblyTarget] = useState(ASSEMBLY_CODE);
    const glitchText = useMemo(() => {
        let result = '';
        for (let i = 0; i < C_CODE.length; i++) {
            result += C_CODE[i] === ' ' ? ' ' : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return result;
    }, []);
    const { text: cCodeText, isTyping: isCTyping } = useTypingEffect(cCodeTarget);
    const { text: machineCodeText, isTyping: isMachineTyping } = useTypingEffect(machineCodeTarget);
    const { text: assemblyText, isTyping: isAssemblyTyping } = useTypingEffect(assemblyTarget);
    const handleToggle = () => {
        setIsComputerView(prev => !prev);
    };
    useEffect(() => {
        if (isComputerView) {
            setCCodeTarget(glitchText);
            setMachineCodeTarget(C_CODE);
            setAssemblyTarget(ASSEMBLY_CODE + " ");
        } else {
            setCCodeTarget(C_CODE);
            setMachineCodeTarget(MACHINE_CODE);
            setAssemblyTarget(ASSEMBLY_CODE);
        }
    }, [isComputerView, glitchText]);
    const highlightedCCode = (
        <span>
            <span className="token-keyword">int</span> a <span className="token-operator">=</span> <span className="token-number">10</span>;
        </span>
    );
    return (
        <div className="perspective-shifter">
            <button className="perspective-toggle" onClick={handleToggle}>
                Toggle View: {isComputerView ? "Computer's Perspective" : "Human's Perspective"}
            </button>
            <div className="code-blocks-container">
                <div className="code-block">
                    <h3>C (High-Level Language)</h3>
                    <pre>{cCodeText}{isCTyping && <span className="typing-cursor" />}</pre>
                </div>
                <div className="code-block">
                    <h3>Assembly (Low-Level Language)</h3>
                    <pre>{assemblyText}{isAssemblyTyping && <span className="typing-cursor" />}</pre>
                </div>
                <div className="code-block">
                    <h3>Machine Code (Binary)</h3>
                    <pre>{isComputerView && !isMachineTyping ? highlightedCCode : machineCodeText}{isMachineTyping && <span className="typing-cursor" />}</pre>
                </div>
            </div>
        </div>
    );
}


// --- 페이지의 전체 레이아웃을 담당하는 기본 컴포넌트 ---
export default function Page05() {
    return (
        // ★★★ 1. 이 div가 이제 화면 전체를 덮는 배경이 됩니다 ★★★
        <div
            className="page05-container"
            style={{
                backgroundImage: `url('/images/monitor.png')`,
                backgroundColor: '#1a1a1a',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* 2. 그 위에 콘텐츠가 올라옵니다 */}
            <div className="page05-content-wrapper">
                <div style={{ maxWidth: 980, margin: '0 auto' }}>
                    <BackButton />
                    <h1>Page 05</h1>
                    <p>
                        A code can be viewed from different perspectives. Switch the view to see how a computer might perceive it.
                    </p>
                    <div style={{ marginTop: 24 }}>
                        <PerspectiveShifter />
                    </div>
                </div>
            </div>
        </div>
    );
}