const express = require('express');
const path = require('path');
const app = express();
const PORT = 8081;

// 미들웨어: 모든 보안 헤더 제거 및 CORS 완전 개방
app.use((req, res, next) => {
    // 모든 COOP/COEP/CORP 헤더 명시적 제거
    const headersToRemove = [
        'Cross-Origin-Opener-Policy',
        'Cross-Origin-Embedder-Policy',
        'Cross-Origin-Resource-Policy',
        'X-Frame-Options',
        'Content-Security-Policy'
    ];
    
    headersToRemove.forEach(header => {
        res.removeHeader(header);
    });
    
    // CORS 완전 개방
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    // 캐시 방지 (새로운 헤더 적용 보장)
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.header('Surrogate-Control', 'no-store');
    
    // Google OAuth 친화적 헤더
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');
    res.header('Permissions-Policy', 'interest-cohort=()');
    
    // OPTIONS 요청 즉시 응답
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    // 로그 출력 (디버깅용)
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    next();
});

// JSON 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (헤더 제거 보장)
app.use(express.static(__dirname, {
    setHeaders: (res, path, stat) => {
        // 정적 파일에도 보안 헤더 제거
        res.removeHeader('Cross-Origin-Opener-Policy');
        res.removeHeader('Cross-Origin-Embedder-Policy');
        res.removeHeader('Cross-Origin-Resource-Policy');
    }
}));

// 루트 경로
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// OAuth 콜백 처리
app.get('/oauth/callback', (req, res) => {
    const code = req.query.code;
    const error = req.query.error;
    
    if (error) {
        res.send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <title>인증 실패</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>❌ 인증 실패</h2>
                <p>오류: ${error}</p>
                <button onclick="window.close()">창 닫기</button>
                <script>
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body>
            </html>
        `);
        return;
    }
    
    if (code) {
        res.send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <title>인증 성공</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>✅ 인증 성공!</h2>
                <p>인증 코드를 받았습니다. 이 창을 닫고 원래 창에서 계속 진행하세요.</p>
                <div style="background: #f1f3f4; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: monospace; word-break: break-all;">
                    ${code}
                </div>
                <button onclick="copyCode()">📋 코드 복사</button>
                <button onclick="window.close()">창 닫기</button>
                <script>
                    function copyCode() {
                        navigator.clipboard.writeText('${code}').then(() => {
                            alert('✅ 인증 코드가 복사되었습니다!');
                        });
                    }
                    // 부모 창으로 코드 전달 (COOP 제한 없음)
                    if (window.opener) {
                        try {
                            window.opener.postMessage({type: 'oauth_code', code: '${code}'}, '*');
                            console.log('OAuth code sent to parent window');
                        } catch(e) {
                            console.error('Failed to send message to parent:', e);
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <title>인증 오류</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>❌ 인증 코드를 받지 못했습니다</h2>
                <button onclick="window.close()">창 닫기</button>
            </body>
            </html>
        `);
    }
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        headers: {
            'COOP': res.get('Cross-Origin-Opener-Policy') || 'NOT SET',
            'COEP': res.get('Cross-Origin-Embedder-Policy') || 'NOT SET'
        }
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).send('페이지를 찾을 수 없습니다');
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 오류:', err.stack);
    res.status(500).send('서버 오류가 발생했습니다');
});

// 서버 시작
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✅ 서버가 실행 중입니다: http://localhost:${PORT}`);
    console.log(`📅 달력 앱을 브라우저에서 열어주세요.`);
    console.log(`🔧 COOP/COEP 정책이 완전히 제거되었습니다.`);
    console.log(`📡 헬스체크: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
});