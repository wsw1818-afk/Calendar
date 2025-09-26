/**
 * 화면 깜빡임 문제 해결 스크립트
 * 불필요한 반복 업데이트와 DOM 조작을 중지합니다
 */

(function() {
    'use strict';
    
    console.log('🔧 화면 깜빡임 수정 스크립트 시작...');
    
    // 모든 setInterval을 추적하고 제거
    const originalSetInterval = window.setInterval;
    const activeIntervals = new Set();
    
    // 위험한 interval 패턴들
    const dangerousPatterns = [
        /keepCalendarNormal/,
        /continuousRestore/,
        /preventCalendarDeformation/,
        /checkAndRestore/,
        /checkAndFix/,
        /cleanUnwantedModals/,
        /protectButtons/,
        /cleanupDuplicateButtons/
    ];
    
    // setInterval 오버라이드
    window.setInterval = function(callback, delay, ...args) {
        const callbackString = callback.toString();
        
        // 위험한 패턴 감지
        for (const pattern of dangerousPatterns) {
            if (pattern.test(callbackString)) {
                console.log(`⛔ 위험한 interval 차단됨: ${pattern}`);
                return -1; // 가짜 ID 반환
            }
        }
        
        // 500ms 이하의 짧은 간격 차단 (sync status 제외)
        if (delay <= 1000 && !callbackString.includes('updateSyncStatus')) {
            console.log(`⚠️ 짧은 interval 차단됨 (${delay}ms)`);
            return -1;
        }
        
        const intervalId = originalSetInterval.call(this, callback, delay, ...args);
        activeIntervals.add(intervalId);
        return intervalId;
    };
    
    // 기존 interval들 정리
    function clearDangerousIntervals() {
        // 전역 스코프에서 interval ID들 찾기
        for (let i = 1; i < 10000; i++) {
            try {
                clearInterval(i);
            } catch (e) {}
        }
        console.log('✅ 기존 interval들 정리 완료');
    }
    
    // DOM 변경 관찰자 최적화
    function optimizeMutationObservers() {
        // 기존 MutationObserver들 비활성화
        if (window.MutationObserver) {
            const originalObserver = window.MutationObserver;
            window.MutationObserver = class OptimizedMutationObserver extends originalObserver {
                constructor(callback) {
                    // 콜백을 래핑하여 과도한 호출 방지
                    const throttledCallback = throttle(callback, 100);
                    super(throttledCallback);
                }
            };
        }
    }
    
    // Throttle 함수
    function throttle(func, wait) {
        let timeout;
        let lastCall = 0;
        
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= wait) {
                lastCall = now;
                func.apply(this, args);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    lastCall = Date.now();
                    func.apply(this, args);
                }, wait - (now - lastCall));
            }
        };
    }
    
    // CSS 애니메이션 최적화
    function optimizeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* 하드웨어 가속 최적화 */
            .calendar-container,
            .day,
            .modal {
                will-change: auto !important;
                backface-visibility: hidden !important;
                perspective: 1000px !important;
            }
            
            /* 부드러운 전환 효과 */
            * {
                transition-duration: 0.2s !important;
            }
            
            /* 애니메이션 비활성화 옵션 */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // requestAnimationFrame을 사용한 안전한 업데이트
    window.safeUpdate = function(updateFunc) {
        let pending = false;
        return function(...args) {
            if (!pending) {
                pending = true;
                requestAnimationFrame(() => {
                    updateFunc.apply(this, args);
                    pending = false;
                });
            }
        };
    };
    
    // 달력 업데이트 함수 최적화
    if (window.updateCalendarDisplay) {
        const originalUpdate = window.updateCalendarDisplay;
        window.updateCalendarDisplay = window.safeUpdate(originalUpdate);
    }
    
    // 초기화
    function initialize() {
        clearDangerousIntervals();
        optimizeMutationObservers();
        optimizeAnimations();
        
        console.log('✅ 화면 깜빡임 수정 완료!');
        console.log('📌 팁: 여전히 깜빡임이 있다면 브라우저 캐시를 지우고 새로고침하세요 (Ctrl+F5)');
    }
    
    // DOM이 준비되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 5초 후 한 번 더 정리 (늦게 로드되는 스크립트 대응)
    setTimeout(clearDangerousIntervals, 5000);
})();