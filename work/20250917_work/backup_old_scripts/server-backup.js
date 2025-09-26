const express = require('express');
const path = require('path');
const app = express();
const PORT = 8081;

// CORS 및 보안 헤더 설정 (Google OAuth 최적화)
app.use((req, res, next) => {
    // COOP/COEP 정책 완전 제거 - Google OAuth 팝업 호환성 최대화
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    
    // CORS 완전 개방
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Google OAuth 호환성을 위한 헤더
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('Permissions-Policy', 'interest-cohort=()');
    
    // Preflight 요청 처리
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

// 정적 파일 제공
app.use(express.static(__dirname));

// 기본 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// OAuth 콜백 처리
app.get('/oauth/callback', (req, res) => {
    const code = req.query.code;
    const error = req.query.error;
    
    if (error) {
        res.send(`
            <html><body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>❌ 인증 실패</h2>
                <p>오류: ${error}</p>
                <button onclick="window.close()">창 닫기</button>
                <script>
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body></html>
        `);
        return;
    }
    
    if (code) {
        res.send(`
            <html><body style="font-family: Arial, sans-serif; padding: 20px;">
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
                    // 부모 창으로 코드 전달
                    if (window.opener) {
                        window.opener.postMessage({type: 'oauth_code', code: '${code}'}, '*');
                    }
                    // 자동 닫기를 비활성화하고 사용자가 직접 닫도록 함
                    // setTimeout(() => {
                    //     window.close();
                    // }, 1000);
                </script>
            </body></html>
        `);
    } else {
        res.send(`
            <html><body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>❌ 인증 코드를 받지 못했습니다</h2>
                <button onclick="window.close()">창 닫기</button>
            </body></html>
        `);
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`✅ 서버가 실행 중입니다: http://localhost:${PORT}`);
    console.log(`📅 달력 앱을 브라우저에서 열어주세요.`);
    console.log(`🔧 COOP 정책이 올바르게 설정되었습니다.`);
});