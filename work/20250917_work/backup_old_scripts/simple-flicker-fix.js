/**
 * 간단한 깜빡임 방지 스크립트
 * 복잡한 수정 없이 UI 새로고침 빈도만 조절
 */

(function() {
    'use strict';
    
    console.log('✨ 간단한 깜빡임 방지 시작...');
    
    // ==========================================
    // 1. UI 새로고침 throttling 적용
    // ==========================================
    let lastRefreshTime = 0;
    const REFRESH_THROTTLE = 300; // 300ms 이내에는 새로고침 방지
    
    // unified-memo-system의 refreshAll 함수 래핑
    if (window.memoSystemRefresh) {
        const originalRefresh = window.memoSystemRefresh;
        window.memoSystemRefresh = function() {
            const now = Date.now();
            if (now - lastRefreshTime < REFRESH_THROTTLE) {
                console.log('🚫 UI 새로고침 throttling 적용됨');
                return;
            }
            lastRefreshTime = now;
            return originalRefresh.apply(this, arguments);
        };
    }
    
    // ==========================================
    // 2. CSS로 부드러운 전환 효과
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* 부드러운 전환 효과만 추가 */
        .day {
            transition: background-color 0.15s ease !important;
        }
        
        .memo-indicator {
            transition: opacity 0.15s ease !important;
        }
        
        /* 하드웨어 가속으로 깜빡임 방지 */
        .calendar-container,
        .sticky-memo,
        .modal {
            -webkit-transform: translateZ(0) !important;
            transform: translateZ(0) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
        }
        
        /* 불필요한 애니메이션 제거 */
        * {
            animation-duration: 0.1s !important;
        }
    `;
    document.head.appendChild(style);
    
    // ==========================================
    // 3. DOM 조작 최적화
    // ==========================================
    
    // MutationObserver throttling
    if (window.MutationObserver) {
        const OriginalObserver = window.MutationObserver;
        window.MutationObserver = class extends OriginalObserver {
            constructor(callback) {
                let timeout;
                const throttledCallback = (mutations, observer) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        callback(mutations, observer);
                    }, 100); // 100ms throttling
                };
                super(throttledCallback);
            }
        };
    }
    
    // ==========================================
    // 4. 로그 메시지 줄이기 (선택적)
    // ==========================================
    
    // console.log 래핑하여 스팸 방지
    const originalLog = console.log;
    const logCounts = new Map();
    
    console.log = function(...args) {
        const message = args.join(' ');
        
        // UI 새로고침 메시지 빈도 제한
        if (message.includes('🔄 전체 UI 새로고침') || 
            message.includes('📋 날짜별 메모 리스트 렌더링')) {
            
            const count = logCounts.get(message) || 0;
            logCounts.set(message, count + 1);
            
            // 같은 메시지가 3번 이상 나오면 요약으로 표시
            if (count >= 2) {
                if (count === 2) {
                    originalLog.call(this, `⚡ ${message.substring(0, 30)}... (이후 반복 메시지 요약됨)`);
                }
                return;
            }
        }
        
        originalLog.apply(this, args);
    };
    
    // ==========================================
    // 5. 메모 저장 debouncing
    // ==========================================
    
    let saveTimeout;
    const originalSaveMemo = window.saveDateMemo;
    
    if (originalSaveMemo) {
        window.saveDateMemo = function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                originalSaveMemo.apply(this, arguments);
            }, 200); // 200ms debounce
        };
    }
    
    console.log('✅ 간단한 깜빡임 방지 완료!');
    console.log('📌 적용된 최적화:');
    console.log('   - UI 새로고침 throttling (300ms)');
    console.log('   - MutationObserver throttling (100ms)'); 
    console.log('   - 하드웨어 가속 CSS');
    console.log('   - 로그 스팸 방지');
    
})();