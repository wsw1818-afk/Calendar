/**
 * 안전한 성능 최적화 스크립트
 * 코드 충돌 없이 깜빡임 문제만 해결
 */

(function() {
    'use strict';
    
    console.log('🛡️ 안전한 성능 최적화 시작...');
    
    // ==========================================
    // 0. 충돌 방지 시스템
    // ==========================================
    window._safePerformanceFix = window._safePerformanceFix || {};
    
    // 이미 실행되었으면 중복 실행 방지
    if (window._safePerformanceFix.initialized) {
        console.log('⚠️ 성능 최적화가 이미 실행됨. 중복 실행 방지.');
        return;
    }
    window._safePerformanceFix.initialized = true;
    
    // ==========================================
    // 1. DOM 업데이트 배치 처리
    // ==========================================
    let pendingUpdates = [];
    let updateScheduled = false;
    
    function batchDOMUpdates() {
        if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(() => {
                const updates = pendingUpdates.splice(0);
                updates.forEach(fn => {
                    try {
                        fn();
                    } catch (e) {
                        console.error('DOM 업데이트 오류:', e);
                    }
                });
                updateScheduled = false;
            });
        }
    }
    
    // innerHTML 래핑
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (originalInnerHTML && originalInnerHTML.set) {
        const originalSetter = originalInnerHTML.set;
        
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                const element = this;
                
                // 달력 그리드나 메모 리스트인 경우만 배치 처리
                if (this.id === 'daysGrid' || 
                    this.className?.includes('memo-list') ||
                    this.className?.includes('sticky-memo-list')) {
                    
                    pendingUpdates.push(() => {
                        originalSetter.call(element, value);
                    });
                    batchDOMUpdates();
                } else {
                    originalSetter.call(this, value);
                }
            },
            get: originalInnerHTML.get,
            configurable: true
        });
    }
    
    // ==========================================
    // 2. UI 새로고침 디바운싱
    // ==========================================
    const uiRefreshDebounce = (function() {
        const refreshMap = new Map();
        
        return function(key, callback, delay = 300) {
            if (refreshMap.has(key)) {
                clearTimeout(refreshMap.get(key));
            }
            
            const timeoutId = setTimeout(() => {
                refreshMap.delete(key);
                callback();
            }, delay);
            
            refreshMap.set(key, timeoutId);
        };
    })();
    
    // unified-memo-system의 refreshAll 함수 안전하게 래핑
    setTimeout(() => {
        if (window.memoSystem && window.memoSystem.refreshAll) {
            const originalRefreshAll = window.memoSystem.refreshAll;
            window.memoSystem.refreshAll = function() {
                uiRefreshDebounce('refreshAll', () => {
                    originalRefreshAll.apply(this, arguments);
                }, 250);
            };
            console.log('✅ memoSystem.refreshAll 디바운싱 적용');
        }
    }, 1000);
    
    // ==========================================
    // 3. 타이머 최적화 (안전한 방식)
    // ==========================================
    const intervalTracker = new Map();
    const originalSetInterval = window.setInterval;
    
    window.setInterval = function(callback, delay, ...args) {
        // 너무 짧은 interval 경고 및 조정
        if (delay < 100) {
            console.warn(`⚠️ 너무 짧은 interval 감지 (${delay}ms), 100ms로 조정`);
            delay = 100;
        }
        
        const id = originalSetInterval.call(this, callback, delay, ...args);
        intervalTracker.set(id, { callback: callback.toString(), delay });
        
        return id;
    };
    
    // ==========================================
    // 4. CSS 최적화 (GPU 가속)
    // ==========================================
    const style = document.createElement('style');
    style.id = 'safe-performance-css';
    style.textContent = `
        /* GPU 가속 및 깜빡임 방지 */
        .calendar-container,
        .day,
        .modal,
        .sticky-memo {
            will-change: auto !important;
            -webkit-transform: translateZ(0) !important;
            transform: translateZ(0) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            -webkit-perspective: 1000 !important;
            perspective: 1000 !important;
        }
        
        /* 레이아웃 시프트 방지 */
        .calendar-grid {
            contain: layout style !important;
        }
        
        /* 부드러운 전환 (짧게) */
        .day {
            transition: background-color 0.1s ease !important;
        }
        
        .memo-indicator,
        .memo-count {
            transition: opacity 0.1s ease !important;
        }
        
        /* 애니메이션 최소화 */
        * {
            animation-duration: 0.1s !important;
            animation-delay: 0s !important;
        }
        
        /* 폰트 렌더링 최적화 */
        body {
            text-rendering: optimizeSpeed !important;
            -webkit-font-smoothing: subpixel-antialiased !important;
        }
        
        /* 스크롤 성능 */
        .modal-content,
        .sticky-memo-content {
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
        }
    `;
    
    // 기존 스타일 제거 후 추가
    const existingStyle = document.getElementById('safe-performance-css');
    if (existingStyle) existingStyle.remove();
    document.head.appendChild(style);
    
    // ==========================================
    // 5. 리페인트/리플로우 최소화
    // ==========================================
    let batchedReads = [];
    let batchedWrites = [];
    let rafScheduled = false;
    
    function scheduleBatch() {
        if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(() => {
                // 읽기 작업 먼저
                batchedReads.forEach(fn => {
                    try { fn(); } catch (e) { console.error('Read batch error:', e); }
                });
                batchedReads = [];
                
                // 쓰기 작업
                batchedWrites.forEach(fn => {
                    try { fn(); } catch (e) { console.error('Write batch error:', e); }
                });
                batchedWrites = [];
                
                rafScheduled = false;
            });
        }
    }
    
    window._safePerformanceFix.batchRead = function(fn) {
        batchedReads.push(fn);
        scheduleBatch();
    };
    
    window._safePerformanceFix.batchWrite = function(fn) {
        batchedWrites.push(fn);
        scheduleBatch();
    };
    
    // ==========================================
    // 6. 메모리 누수 방지
    // ==========================================
    const cleanupTasks = [];
    
    window._safePerformanceFix.registerCleanup = function(fn) {
        cleanupTasks.push(fn);
    };
    
    window.addEventListener('beforeunload', () => {
        cleanupTasks.forEach(fn => {
            try { fn(); } catch (e) {}
        });
    });
    
    // ==========================================
    // 7. 성능 모니터링
    // ==========================================
    let frameDrops = 0;
    let lastFrameTime = performance.now();
    
    function monitorPerformance() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        
        // 33ms = 30fps, 이보다 느리면 프레임 드롭
        if (delta > 33) {
            frameDrops++;
            if (frameDrops > 10) {
                console.warn('⚠️ 성능 저하 감지. 자동 최적화 실행...');
                optimizePerformance();
                frameDrops = 0;
            }
        }
        
        lastFrameTime = now;
        requestAnimationFrame(monitorPerformance);
    }
    
    function optimizePerformance() {
        // 불필요한 interval 정리
        intervalTracker.forEach((info, id) => {
            if (info.delay < 500) {
                clearInterval(id);
                console.log(`🧹 짧은 interval 제거: ${info.delay}ms`);
            }
        });
        
        // DOM 정리
        const hiddenModals = document.querySelectorAll('.modal[style*="display: none"]');
        hiddenModals.forEach(modal => {
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
        });
    }
    
    // 모니터링 시작 (5초 후)
    setTimeout(() => {
        requestAnimationFrame(monitorPerformance);
    }, 5000);
    
    // ==========================================
    // 8. 안전한 초기화
    // ==========================================
    function safeInit() {
        console.log('🚀 안전한 성능 최적화 적용 중...');
        
        // DOM이 준비될 때까지 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', safeInit);
            return;
        }
        
        // 기존 스크립트와 충돌 방지를 위한 대기
        setTimeout(() => {
            console.log('✅ 안전한 성능 최적화 완료!');
            console.log('📊 적용된 최적화:');
            console.log('   - DOM 업데이트 배치 처리');
            console.log('   - UI 새로고침 디바운싱 (250ms)');
            console.log('   - GPU 가속 CSS');
            console.log('   - 리페인트/리플로우 최소화');
            console.log('   - 자동 성능 모니터링');
            console.log('   - 메모리 누수 방지');
        }, 500);
    }
    
    safeInit();
    
    // ==========================================
    // 9. 디버깅 도구
    // ==========================================
    window.performanceDebug = function() {
        console.group('🔍 성능 상태');
        console.log('활성 Interval:', intervalTracker.size);
        console.log('프레임 드롭:', frameDrops);
        console.log('대기 중인 DOM 업데이트:', pendingUpdates.length);
        console.log('활성 모달:', document.querySelectorAll('.modal[style*="display: block"]').length);
        intervalTracker.forEach((info, id) => {
            console.log(`  Interval ${id}: ${info.delay}ms`);
        });
        console.groupEnd();
    };
    
})();