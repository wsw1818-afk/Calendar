/**
 * 스티커 메모 궁극적 위치 수정
 * 달력 위 최상위 표시를 위한 강력한 수정
 */

(function() {
    'use strict';
    
    console.log('🔥 스티커 메모 궁극적 수정 시작');
    
    /**
     * 궁극적 스티커 메모 수정
     */
    function ultimateStickyFix() {
        // 1. 원래 함수들 백업
        const originalOpenSticky = window.openStickyMemo;
        const originalCreateSticky = window.createStickyMemo;
        
        // 2. openStickyMemo 완전 재정의
        window.openStickyMemo = function() {
            console.log('🔥 궁극적 openStickyMemo 실행');
            
            // 기존 스티커 메모 찾기
            let stickyMemo = document.getElementById('stickyMemo');
            
            // 없으면 생성
            if (!stickyMemo) {
                if (originalCreateSticky) {
                    stickyMemo = originalCreateSticky();
                } else {
                    console.error('createStickyMemo 함수가 없습니다');
                    return;
                }
            }
            
            // 강제로 body 최상위로 이동
            if (stickyMemo.parentNode !== document.body) {
                document.body.appendChild(stickyMemo);
                console.log('📤 스티커 메모를 body로 강제 이동');
            }
            
            // 모든 스타일 강제 재설정
            forceApplyStyles(stickyMemo);
            
            // 위치 설정
            forcePositioning(stickyMemo);
            
            // 표시
            stickyMemo.style.display = 'flex';
            stickyMemo.classList.add('active');
            
            // 초기화 함수들 호출
            initializeStickyMemo(stickyMemo);
            
            console.log('🔥 궁극적 스티커 메모 열기 완료');
        };
    }
    
    /**
     * 스타일 강제 적용
     */
    function forceApplyStyles(stickyMemo) {
        // 모든 기존 스타일 제거
        stickyMemo.removeAttribute('style');
        
        // 강력한 스타일 적용
        const forceStyles = {
            'position': 'fixed !important',
            'z-index': '2147483647 !important', // 최대 z-index 값
            'display': 'flex !important',
            'visibility': 'visible !important',
            'opacity': '1 !important',
            'width': '350px !important',
            'min-height': '400px !important',
            'background': 'linear-gradient(135deg, rgba(255, 249, 196, 0.98) 0%, rgba(255, 245, 157, 0.98) 100%) !important',
            'border-radius': '20px !important',
            'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 120px rgba(255, 193, 7, 0.5) !important',
            'border': '1px solid rgba(255, 193, 7, 0.3) !important',
            'backdrop-filter': 'blur(20px) saturate(180%) !important',
            'pointer-events': 'auto !important',
            'isolation': 'isolate !important',
            'transform': 'translateZ(0) !important',
            'will-change': 'transform !important',
            'contain': 'layout style paint !important'
        };
        
        // CSS Text로 한번에 적용
        let cssText = '';
        Object.entries(forceStyles).forEach(([prop, value]) => {
            cssText += `${prop}: ${value}; `;
        });
        
        stickyMemo.style.cssText = cssText;
        
        // setProperty로 개별 강제 적용
        Object.entries(forceStyles).forEach(([prop, value]) => {
            stickyMemo.style.setProperty(prop, value.replace(' !important', ''), 'important');
        });
        
        console.log('💪 스타일 강제 적용 완료');
    }
    
    /**
     * 위치 강제 설정
     */
    function forcePositioning(stickyMemo) {
        // 저장된 위치 확인
        const savedPosition = localStorage.getItem('stickyMemoPosition');
        
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                if (pos.left && pos.top) {
                    stickyMemo.style.setProperty('left', pos.left, 'important');
                    stickyMemo.style.setProperty('top', pos.top, 'important');
                    stickyMemo.style.setProperty('right', 'auto', 'important');
                    stickyMemo.style.setProperty('bottom', 'auto', 'important');
                } else {
                    setDefaultPosition(stickyMemo);
                }
            } catch (e) {
                setDefaultPosition(stickyMemo);
            }
        } else {
            setDefaultPosition(stickyMemo);
        }
        
        console.log('📍 위치 강제 설정 완료');
    }
    
    /**
     * 기본 위치 설정 (화면 중앙)
     */
    function setDefaultPosition(stickyMemo) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const memoWidth = 350;
        const memoHeight = 400;
        
        const left = Math.max(50, (windowWidth - memoWidth) / 2);
        const top = Math.max(50, (windowHeight - memoHeight) / 3);
        
        stickyMemo.style.setProperty('left', left + 'px', 'important');
        stickyMemo.style.setProperty('top', top + 'px', 'important');
        stickyMemo.style.setProperty('right', 'auto', 'important');
        stickyMemo.style.setProperty('bottom', 'auto', 'important');
    }
    
    /**
     * 스티커 메모 초기화
     */
    function initializeStickyMemo(stickyMemo) {
        // 스티커 메모 안정화 시스템 초기화
        if (window.StickyMemoStable) {
            setTimeout(() => window.StickyMemoStable.init(), 100);
        }
        
        // 메모 로드
        if (window.loadStickyMemos) {
            setTimeout(() => window.loadStickyMemos(), 200);
        }
        
        // 이벤트 재설정
        setupStickyEvents(stickyMemo);
    }
    
    /**
     * 이벤트 설정
     */
    function setupStickyEvents(stickyMemo) {
        // 닫기 버튼
        const closeBtn = stickyMemo.querySelector('#stickyClose');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.closeStickyMemo) {
                    window.closeStickyMemo();
                } else {
                    stickyMemo.style.display = 'none';
                }
            };
        }
    }
    
    /**
     * 달력 z-index 강제 낮춤
     */
    function forceCalendarBelow() {
        const calendar = document.getElementById('calendar');
        if (calendar) {
            calendar.style.setProperty('z-index', '1', 'important');
            calendar.style.setProperty('position', 'relative', 'important');
        }
        
        const calendarContainer = document.querySelector('.calendar-container');
        if (calendarContainer) {
            calendarContainer.style.setProperty('z-index', '1', 'important');
            calendarContainer.style.setProperty('position', 'relative', 'important');
        }
        
        // 모든 달력 관련 요소 z-index 낮춤
        const calendarElements = document.querySelectorAll('[id*="calendar"], [class*="calendar"]');
        calendarElements.forEach(el => {
            if (el.id !== 'stickyMemo') {
                el.style.setProperty('z-index', '1', 'important');
            }
        });
        
        console.log('📉 달력 z-index 강제 낮춤 완료');
    }
    
    /**
     * 전역 CSS 추가
     */
    function addGlobalCSS() {
        if (document.getElementById('sticky-ultimate-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-ultimate-styles';
        style.textContent = `
            /* 스티커 메모 최우선 */
            #stickyMemo {
                z-index: 2147483647 !important;
                position: fixed !important;
                isolation: isolate !important;
                contain: layout style paint !important;
            }
            
            /* 달력 낮은 우선순위 */
            #calendar,
            .calendar-container,
            [id*="calendar"]:not(#stickyMemo),
            [class*="calendar"]:not(#stickyMemo) {
                z-index: 1 !important;
                position: relative !important;
            }
            
            /* body 격리 */
            body {
                isolation: isolate !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 전역 CSS 추가 완료');
    }
    
    /**
     * 궁극적 수정 실행
     */
    function executeUltimateFix() {
        console.log('🔥 궁극적 수정 실행 시작');
        
        // 1. 전역 CSS 추가
        addGlobalCSS();
        
        // 2. 달력 z-index 강제 낮춤
        forceCalendarBelow();
        
        // 3. 스티커 메모 함수 재정의
        ultimateStickyFix();
        
        // 4. 기존 스티커 메모가 있으면 즉시 수정
        const existingStickyMemo = document.getElementById('stickyMemo');
        if (existingStickyMemo) {
            forceApplyStyles(existingStickyMemo);
            forcePositioning(existingStickyMemo);
            
            // body로 이동
            if (existingStickyMemo.parentNode !== document.body) {
                document.body.appendChild(existingStickyMemo);
            }
        }
        
        console.log('🔥 궁극적 수정 실행 완료');
    }
    
    /**
     * 감시 및 자동 수정
     */
    function startMonitoring() {
        // MutationObserver로 스티커 메모 감시
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'stickyMemo') {
                        console.log('🔍 새 스티커 메모 감지 - 수정 적용');
                        setTimeout(() => {
                            forceApplyStyles(node);
                            forcePositioning(node);
                            if (node.parentNode !== document.body) {
                                document.body.appendChild(node);
                            }
                        }, 10);
                    }
                }
                
                // 스타일 변경 감지
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' &&
                    mutation.target.id === 'stickyMemo') {
                    
                    const stickyMemo = mutation.target;
                    const zIndex = parseInt(stickyMemo.style.zIndex) || 0;
                    
                    if (zIndex < 2147483647) {
                        console.log('🔧 스티커 메모 z-index 자동 수정');
                        stickyMemo.style.setProperty('z-index', '2147483647', 'important');
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
        
        // 정기적으로 달력 z-index 체크
        setInterval(() => {
            forceCalendarBelow();
        }, 5000);
        
        console.log('👁️ 감시 시스템 시작');
    }
    
    /**
     * 디버그 함수
     */
    window.debugStickyUltimate = function() {
        const stickyMemo = document.getElementById('stickyMemo');
        const calendar = document.getElementById('calendar');
        
        console.group('🔥 궁극적 스티커 메모 디버그');
        
        if (stickyMemo) {
            const rect = stickyMemo.getBoundingClientRect();
            const style = window.getComputedStyle(stickyMemo);
            
            console.log('📌 스티커 메모:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                position: style.position,
                left: style.left,
                top: style.top,
                parent: stickyMemo.parentNode.tagName,
                rect: rect
            });
        }
        
        if (calendar) {
            const calendarStyle = window.getComputedStyle(calendar);
            console.log('📅 달력:', {
                zIndex: calendarStyle.zIndex,
                position: calendarStyle.position
            });
        }
        
        console.groupEnd();
    };
    
    /**
     * 강제 수정 함수
     */
    window.forceStickyToTop = function() {
        console.log('🚨 강제 수정 실행');
        const stickyMemo = document.getElementById('stickyMemo');
        
        if (stickyMemo) {
            // body로 이동
            document.body.appendChild(stickyMemo);
            
            // 스타일 강제 적용
            forceApplyStyles(stickyMemo);
            forcePositioning(stickyMemo);
            
            // 표시
            stickyMemo.style.display = 'flex';
            
            console.log('✅ 강제 수정 완료');
        } else {
            console.log('❌ 스티커 메모가 없습니다');
        }
    };
    
    // 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeUltimateFix);
    } else {
        executeUltimateFix();
    }
    
    // 감시 시작
    startMonitoring();
    
    console.log('🔥 스티커 메모 궁극적 수정 준비 완료');
    console.log('🛠️ 디버그: debugStickyUltimate(), forceStickyToTop()');
    
})();