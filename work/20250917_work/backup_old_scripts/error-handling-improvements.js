// 오류 처리 개선 스크립트
(function() {
    'use strict';

    console.log('오류 처리 개선 스크립트 로드됨');

    // 전역 오류 핸들러 설정
    function setupGlobalErrorHandling() {
        // 일반 JavaScript 오류 처리
        window.addEventListener('error', function(event) {
            const error = event.error;
            const message = event.message;
            const filename = event.filename;
            const lineno = event.lineno;
            const colno = event.colno;

            // Google API 관련 오류는 무시 (이미 처리됨)
            if (message && message.includes('gapi')) {
                return;
            }

            // 메모 관련 오류만 특별히 처리
            if (message && (message.includes('memo') || message.includes('Cannot read properties'))) {
                console.warn('메모 관련 오류가 감지되었습니다:', {
                    message: message,
                    filename: filename,
                    line: lineno,
                    column: colno,
                    error: error
                });

                // 사용자에게는 친화적인 메시지 표시
                showUserFriendlyError('메모 기능에 일시적인 문제가 있습니다. 페이지를 새로고침 해보세요.');
                return;
            }

            // 기타 오류는 콘솔에만 로그
            console.error('JavaScript 오류:', {
                message: message,
                filename: filename,
                line: lineno,
                column: colno,
                error: error
            });
        });

        // Promise rejection 오류 처리
        window.addEventListener('unhandledrejection', function(event) {
            const reason = event.reason;
            
            // Google API 관련 Promise rejection은 무시
            if (reason && (reason.toString().includes('gapi') || reason.toString().includes('google'))) {
                event.preventDefault(); // 콘솔 에러 출력 방지
                return;
            }

            console.error('처리되지 않은 Promise rejection:', reason);
        });
    }

    // 사용자 친화적 오류 메시지 표시
    function showUserFriendlyError(message) {
        // 기존 오류 메시지가 있다면 제거
        const existingError = document.querySelector('.user-error-message');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'user-error-message';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff3cd;
                color: #856404;
                padding: 12px 16px;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10002;
                max-width: 400px;
                font-size: 14px;
                line-height: 1.4;
            ">
                <strong>⚠️ 알림</strong><br>
                ${message}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    float: right;
                    background: none;
                    border: none;
                    color: #856404;
                    cursor: pointer;
                    font-size: 16px;
                    margin-left: 10px;
                ">×</button>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Google Drive API 오류를 사용자 친화적으로 처리
    function handleGoogleDriveErrors() {
        // 기존 Google Drive 초기화 함수들에 오류 처리 추가
        const originalConsoleError = console.error;
        console.error = function() {
            const args = Array.from(arguments);
            const message = args.join(' ');

            // Google API 관련 오류 필터링
            if (message.includes('API discovery response missing required fields')) {
                console.log('Google Drive API 설정이 필요합니다.');
                return; // 콘솔 오류 출력 방지
            }

            if (message.includes('Bad Gateway') && message.includes('googleapis.com')) {
                console.log('Google API 서버 연결 문제가 있습니다.');
                return; // 콘솔 오류 출력 방지
            }

            // 기타 오류는 정상적으로 출력
            originalConsoleError.apply(console, arguments);
        };
    }

    // 메모 기능 안전 장치
    function setupMemoSafeGuards() {
        // memos 배열이 정의되지 않았을 때의 fallback
        if (typeof window.memos === 'undefined') {
            window.memos = [];
            console.log('memos 배열이 초기화되었습니다.');
        }

        // localStorage에서 메모 데이터 복구 시도
        try {
            const storedMemos = localStorage.getItem('memos');
            if (storedMemos && window.memos.length === 0) {
                window.memos = JSON.parse(storedMemos);
                console.log('localStorage에서 메모 데이터를 복구했습니다:', window.memos.length, '개');
            }
        } catch (e) {
            console.warn('메모 데이터 복구 실패:', e);
        }

        // 메모 관련 함수들의 안전성 검사
        const memoFunctions = [
            'openMemoDetail',
            'closeMemoDetail',
            'deleteMemo',
            'updateCalendarDisplay',
            'displayStickyMemos'
        ];

        memoFunctions.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                console.warn(`${funcName} 함수가 정의되지 않았습니다.`);
                
                // 기본 fallback 함수 제공
                if (funcName === 'openMemoDetail') {
                    window[funcName] = function(id) {
                        console.warn('메모 상세보기 기능이 아직 로드되지 않았습니다.');
                        showUserFriendlyError('메모를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                    };
                } else if (funcName === 'displayStickyMemos') {
                    window[funcName] = function() {
                        console.warn('스티커 메모 표시 기능이 아직 로드되지 않았습니다.');
                    };
                }
            }
        });
    }

    // 디버깅 도우미
    function setupDebugHelpers() {
        // 디버깅을 위한 전역 함수들
        window.debugMemos = function() {
            console.log('=== 메모 디버깅 정보 ===');
            console.log('window.memos:', window.memos);
            console.log('localStorage memos:', localStorage.getItem('memos'));
            console.log('메모 관련 함수들:');
            ['openMemoDetail', 'closeMemoDetail', 'deleteMemo', 'updateCalendarDisplay', 'displayStickyMemos'].forEach(name => {
                console.log(`- ${name}:`, typeof window[name]);
            });
        };

        window.debugGoogleDrive = function() {
            console.log('=== Google Drive 디버깅 정보 ===');
            console.log('CLIENT_ID:', window.CLIENT_ID);
            console.log('API_KEY:', window.API_KEY ? '설정됨' : '설정되지 않음');
            console.log('gapi:', typeof window.gapi);
            console.log('google:', typeof window.google);
            console.log('localStorage 설정:', {
                clientId: localStorage.getItem('googleDriveClientId'),
                apiKey: localStorage.getItem('googleDriveApiKey') ? '설정됨' : '설정되지 않음'
            });
        };

        // 개발 모드에서만 콘솔에 도움말 표시
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('%c📝 메모 앱 디버깅 도움말', 'color: #667eea; font-size: 16px; font-weight: bold;');
            console.log('- debugMemos(): 메모 관련 디버깅 정보 표시');
            console.log('- debugGoogleDrive(): Google Drive 관련 디버깅 정보 표시');
        }
    }

    // 페이지 성능 모니터링
    function monitorPagePerformance() {
        // 스크립트 로딩 시간 측정
        const startTime = performance.now();
        
        window.addEventListener('load', function() {
            const loadTime = performance.now() - startTime;
            if (loadTime > 3000) {
                console.warn('페이지 로딩이 느립니다:', Math.round(loadTime), 'ms');
            } else {
                console.log('페이지 로딩 완료:', Math.round(loadTime), 'ms');
            }
        });

        // 메모리 사용량 모니터링 (Chrome에서만 사용 가능)
        if ('memory' in performance) {
            setTimeout(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB 이상
                    console.warn('메모리 사용량이 높습니다:', Math.round(memory.usedJSHeapSize / 1024 / 1024), 'MB');
                }
            }, 5000);
        }
    }

    // 초기화
    function initialize() {
        console.log('오류 처리 개선 시스템 초기화');
        
        setupGlobalErrorHandling();
        handleGoogleDriveErrors();
        setupMemoSafeGuards();
        setupDebugHelpers();
        monitorPagePerformance();
        
        console.log('오류 처리 개선 시스템 초기화 완료');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 즉시 초기화도 실행 (에러 핸들링은 가능한 한 빨리 설정)
    initialize();

})();