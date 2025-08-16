import React from 'react';
import './Page08.css';
import BackButton from '../components/BackButton.jsx';

// --- ★★★ 데이터 영역: 실제 컴퓨터 취약점과 위험도로 수정 ★★★ ---
const weaknesses = [
    {
        id: 1,
        name: "SQL Injection", // 실제 취약점 이름
        risk: "Critical",     // 실제 위험도
        position: { top: '50%', left: '50%' } // 심장
    },
    {
        id: 2,
        name: "Zero-Day Exploit",
        risk: "Critical",
        position: { top: '34%', left: '46%' } // 왼쪽 눈
    },
    {
        id: 3,
        name: "Broken Access Control",
        risk: "Critical",
        position: { top: '22%', left: '38%' } // 왼쪽 뿔
    },
    {
        id: 4,
        name: "Remote Code Execution",
        risk: "Critical",
        position: { top: '75%', left: '78%' } // 오른쪽 손
    },
    {
        id: 5,
        name: "Cross-Site Scripting (XSS)",
        risk: "High",
        position: { top: '70%', left: '25%' } // 왼쪽 어깨
    },
    {
        id: 6,
        name: "Server-Side Request Forgery",
        risk: "High",
        position: { top: '40%', left: '80%' } // 오른쪽 날개
    },
    {
        id: 7,
        name: "Insecure Deserialization",
        risk: "High",
        position: { top: '85%', left: '55%' } // 복부
    },
    {
        id: 8,
        name: "Credential Stuffing",
        risk: "Medium",
        position: { top: '25%', left: '62%' } // 오른쪽 뿔
    }
];

// --- 개별 약점(불꽃)을 렌더링하는 컴포넌트 ---
function WeaknessPoint({ data }) {
    return (
        <div
            className="weakness-point"
            style={{ top: data.position.top, left: data.position.left }}
        >
            <div className="flame" />
            <div className="risk-text">
                {/* ★★★ 이제 실제 취약점 이름과 위험도를 표시 ★★★ */}
                {data.name}: <span style={{ color: '#ffdd00' }}>{data.risk}</span>
            </div>
        </div>
    );
}


// --- 페이지의 전체 레이아웃을 담당하는 기본 컴포넌트 ---
export default function Page08() {
    return (
        <div className="page08-container">
            <div className="demon-background-image" />

            <div className="weakness-points-container">
                {weaknesses.map(weakness => (
                    <WeaknessPoint key={weakness.id} data={weakness} />
                ))}
            </div>

            <div className="page08-content-wrapper">
                <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
                    <BackButton />
                    <h1>Page 08</h1>
                    <p>
                        The beast is an embodiment of system vulnerabilities. Hover over its burning wounds to reveal their true nature.
                    </p>
                </div>
            </div>
        </div>
    );
}