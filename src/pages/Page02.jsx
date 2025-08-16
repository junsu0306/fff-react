import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import './Page02.css';
import BackButton from '../components/BackButton.jsx';

// --- 데이터 영역 ---
const wordsData = [
    { word: "Cryptography", trigger: "C" }, { word: "Function", trigger: "F" },
    { word: "Cipher", trigger: "r" }, { word: "RSA", trigger: "R" },
    { word: "ECC", trigger: "E" }, { word: "AES", trigger: "A" },
    { word: "PQC", trigger: "P" }, { word: "SHA", trigger: "S" },
    { word: "DES", trigger: "D" },
];

const baseText = `Information travels across the internet in small pieces called packets. Each packet is like a digital envelope, containing a portion of the data and addressing information. This process is governed by a suite of protocols, primarily TCP/IP, which ensures data arrives reliably. Routers across the globe inspect the destination address on each packet and forward it closer to its recipient. This complex dance happens in milliseconds, creating the seamless experience of browsing the web. Every part of this system has a specific purpose, a clear example of how form must follow its intended design. Security is layered on top of this, using complex algorithms to protect the data within each packet from unauthorized access. The entire system is a marvel of modern engineering, a testament to decades of innovation in computer science and communication technology, enabling our interconnected world to function.`;


// --- 인터랙티브 로직 컴포넌트 ---
function CryptoInteraction() {
    const [activeWordIndex, setActiveWordIndex] = useState(null);
    const [allPositions, setAllPositions] = useState({});

    const containerRef = useRef(null);
    const textContainerRef = useRef(null);
    const resultRef = useRef(null);
    const charRefs = useRef(wordsData.map(data => data.word.split('').map(() => React.createRef())));

    const scatteredContent = useMemo(() => {
        const allChars = wordsData.flatMap((data, wordIndex) =>
            data.word.split('').map((char, charIndex) => ({
                char, wordIndex, charIndex, isTrigger: charIndex === 0,
            }))
        );
        let textChars = baseText.split('');
        let validIndices = [];
        textChars.forEach((char, index) => { if (char.match(/[a-zA-Z]/)) validIndices.push(index); });
        const scatterPositions = new Set();
        while (scatterPositions.size < allChars.length && validIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * validIndices.length);
            scatterPositions.add(validIndices[randomIndex]);
            validIndices.splice(randomIndex, 1);
        }
        const positionMap = new Map(Array.from(scatterPositions).map((pos, i) => [pos, allChars[i]]));
        return textChars.map((char, index) => {
            const cryptoChar = positionMap.get(index);
            if (cryptoChar) {
                const isRelatedToActiveWord = activeWordIndex === cryptoChar.wordIndex;
                return (
                    <span
                        key={index}
                        ref={charRefs.current[cryptoChar.wordIndex][cryptoChar.charIndex]}
                        className={`inline-crypto-char ${cryptoChar.isTrigger ? 'trigger-char' : ''} ${isRelatedToActiveWord ? 'lit' : ''}`}
                        onMouseEnter={cryptoChar.isTrigger ? () => handleAssemble(cryptoChar.wordIndex) : null}
                    >
                        {isRelatedToActiveWord ? '\u00A0' : cryptoChar.char}
                    </span>
                );
            }
            return <React.Fragment key={index}>{char}</React.Fragment>;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWordIndex]);

    useLayoutEffect(() => {
        const calculatePositions = () => {
            if (!containerRef.current || !resultRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const resultRect = resultRef.current.getBoundingClientRect();
            const newPositions = {};
            wordsData.forEach((data, wordIndex) => {
                newPositions[wordIndex] = data.word.split('').map((_, charIndex) => {
                    const ref = charRefs.current[wordIndex][charIndex];
                    if (!ref.current) return {};
                    const charRect = ref.current.getBoundingClientRect();
                    const startX = charRect.left - containerRect.left;
                    const startY = charRect.top - containerRect.top;
                    const totalWordWidth = data.word.length * 30;
                    const endX = resultRect.left - containerRect.left + (resultRect.width / 2) - (totalWordWidth / 2) + (charIndex * 30);
                    const endY = resultRect.top - containerRect.top;
                    return { startX, startY, endX, endY };
                });
            });
            setAllPositions(newPositions);
        };
        calculatePositions();
        const scrollablePage = textContainerRef.current;
        window.addEventListener('resize', calculatePositions);
        scrollablePage?.addEventListener('scroll', calculatePositions);
        return () => {
            window.removeEventListener('resize', calculatePositions);
            scrollablePage?.removeEventListener('scroll', calculatePositions);
        };
    }, [scatteredContent]);

    const handleAssemble = (wordIndex) => setActiveWordIndex(wordIndex);
    const handleReset = () => setActiveWordIndex(null);

    const renderFlyingChars = () => {
        return wordsData.flatMap((data, wordIndex) => {
            const capitalizedWord = data.word.charAt(0).toUpperCase() + data.word.slice(1);
            return capitalizedWord.split('').map((char, charIndex) => (
                <div key={`fly-${wordIndex}-${charIndex}`}
                    className={`flying-char ${activeWordIndex === wordIndex ? 'assembling' : ''}`}
                    style={{
                        '--start-x': `${allPositions[wordIndex]?.[charIndex]?.startX}px`,
                        '--start-y': `${allPositions[wordIndex]?.[charIndex]?.startY}px`,
                        '--end-x': `${allPositions[wordIndex]?.[charIndex]?.endX}px`,
                        '--end-y': `${allPositions[wordIndex]?.[charIndex]?.endY}px`,
                        transitionDelay: `${charIndex * 50}ms`,
                    }}
                >{char}</div>
            ));
        });
    };

    return (
        <div ref={containerRef} onMouseLeave={handleReset} style={{ position: 'relative', width: '100%' }}>
            {renderFlyingChars()}
            <div className="text-container" ref={textContainerRef}>
                {scatteredContent}
            </div>
            <div className="result-area" ref={resultRef} />
        </div>
    );
}


// --- 페이지의 전체 레이아웃을 담당하는 기본 컴포넌트 ---
export default function Page02() {

    const [transitionState, setTransitionState] = useState({
        isOpening: false,
        isFinished: false,
    });

    // 페이지 전환 애니메이션을 위한 useEffect
    useEffect(() => {
        const openTimer = setTimeout(() => {
            setTransitionState(prevState => ({ ...prevState, isOpening: true }));
        }, 100);

        const finishTimer = setTimeout(() => {
            setTransitionState(prevState => ({ ...prevState, isFinished: true }));
        }, 1500);

        return () => {
            clearTimeout(openTimer);
            clearTimeout(finishTimer);
        };
    }, []);

    return (
        <div className="page02-container">
            {/* 페이지 전환 오버레이 */}
            {!transitionState.isFinished && (
                <div
                    className={`page-turn-container ${transitionState.isOpening ? 'opening' : ''}`}
                    style={{ opacity: transitionState.isFinished ? 0 : 1 }}
                >
                    <div className="page-cover left">
                        <p>// Accessing...</p>
                    </div>
                    <div className="page-cover right">
                        <p>Network Deck</p>
                    </div>
                </div>
            )}

            {/* 실제 페이지 콘텐츠 */}
            <div className="page02-content-wrapper">
                <div style={{ maxWidth: 980, margin: '0 auto' }}>
                    <BackButton />
                    <h1>Page 02</h1>
                    <p>
                        Find the first letter of the hidden words scattered in the text.
                    </p>
                    <div style={{ marginTop: 24 }}>
                        <CryptoInteraction />
                    </div>
                </div>
            </div>
        </div>
    );
}