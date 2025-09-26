/**
 * 달력과 스티커 메모 위치 충돌 해결
 * 각 요소의 위치를 안정화하고 간섭 방지
 */

(function() {
    'use strict';
    
    console.log('🔧 위치 충돌 해결 시스템 시작');
    
    // 설정
    const CONFIG = {
        calendarZIndex: 100,      // 달력 z-index
        stickyZIndex: 9999,       // 스티커 메모 z-index
        modalZIndex: 10000,       // 모달 z-index
        calendarPosition: 'relative',  // 달력 위치
        preventOverlap: true,     // 겹침 방지
        stabilizeLayout: true     // 레이아웃 안정화
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('📍 위치 안정화 시작');
        
        // 1. 달력 위치 고정
        stabilizeCalendar();
        
        // 2. 스티커 메모 격리
        isolateSticky();
        
        // 3. 레이아웃 보호
        protectLayout();
        
        // 4. 충돌 감지 및 수정
        detectAndFixConflicts();
        
        // 5. 이벤트 모니터링
        monitorChanges();
        
        console.log('✅ 위치 충돌 해결 완료');
    }
    
    /**
     * 달력 위치 안정화
     */
    function stabilizeCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        // 달력 컨테이너 스타일 고정
        calendar.style.position = CONFIG.calendarPosition;
        calendar.style.zIndex = CONFIG.calendarZIndex;
        calendar.style.transform = 'none';  // transform 제거
        calendar.style.transition = 'none'; // 애니메이션 제거
        
        // 달력 그리드 보호
        const calendarGrid = calendar.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.style.position = 'relative';
            calendarGrid.style.transform = 'none';
            calendarGrid.style.willChange = 'auto';
        }
        
        // 달력 컨테이너 크기 고정
        const calendarContainer = document.querySelector('.calendar-container');
        if (calendarContainer) {
            const rect = calendarContainer.getBoundingClientRect();
            calendarContainer.style.minHeight = rect.height + 'px';
            calendarContainer.style.position = 'relative';
            calendarContainer.style.isolation = 'isolate'; // 스태킹 컨텍스트 격리
        }
        
        console.log('📅 달력 위치 안정화 완료');
    }
    
    /**
     * 스티커 메모 격리
     */
    function isolateSticky() {
        const stickyMemo = document.getElementById('stickyMemo');
        if (!stickyMemo) return;
        
        // 스티커 메모를 별도 레이어로 격리
        stickyMemo.style.position = 'fixed';
        stickyMemo.style.zIndex = CONFIG.stickyZIndex;
        stickyMemo.style.isolation = 'isolate';
        stickyMemo.style.willChange = 'transform'; // GPU 레이어 분리
        
        // transform 초기화
        const currentTransform = stickyMemo.style.transform;
        if (currentTransform && currentTransform.includes('translate')) {
            // translate만 제거하고 다른 transform은 유지
            stickyMemo.style.transform = currentTransform.replace(/translate[XYZ]?\([^)]*\)/g, '');
        }
        
        // 기본 위치 설정 (localStorage에서 복원)
        const savedPosition = localStorage.getItem('stickyMemoPosition');
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                if (pos.left !== undefined && pos.top !== undefined) {
                    stickyMemo.style.left = pos.left;
                    stickyMemo.style.top = pos.top;
                } else if (pos.x !== undefined && pos.y !== undefined) {
                    stickyMemo.style.left = pos.x + 'px';
                    stickyMemo.style.top = pos.y + 'px';
                }
            } catch (e) {
                // 기본 위치
                stickyMemo.style.right = '20px';
                stickyMemo.style.bottom = '20px';
                stickyMemo.style.left = 'auto';
                stickyMemo.style.top = 'auto';
            }
        } else {
            // 기본 위치 (우하단)
            stickyMemo.style.right = '20px';
            stickyMemo.style.bottom = '20px';
            stickyMemo.style.left = 'auto';
            stickyMemo.style.top = 'auto';
        }
        
        console.log('📌 스티커 메모 격리 완료');
    }
    
    /**
     * 레이아웃 보호
     */
    function protectLayout() {
        // body에 overflow 설정
        document.body.style.overflowX = 'hidden';
        document.body.style.position = 'relative';
        
        // 메인 컨테이너 보호
        const mainContainer = document.querySelector('.container, .main-container, #app');
        if (mainContainer) {
            mainContainer.style.position = 'relative';
            mainContainer.style.zIndex = '1';
            mainContainer.style.isolation = 'isolate';
        }
        
        // 모든 fixed 요소 확인
        const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        fixedElements.forEach(el => {
            // 스티커 메모와 모달이 아닌 경우
            if (!el.id?.includes('sticky') && !el.classList.contains('modal')) {
                // z-index 조정
                const currentZ = parseInt(el.style.zIndex) || 0;
                if (currentZ > CONFIG.calendarZIndex && currentZ < CONFIG.stickyZIndex) {
                    el.style.zIndex = CONFIG.calendarZIndex - 1;
                }
            }
        });
        
        console.log('🛡️ 레이아웃 보호 완료');
    }
    
    /**
     * 충돌 감지 및 수정
     */
    function detectAndFixConflicts() {
        const calendar = document.getElementById('calendar');
        const stickyMemo = document.getElementById('stickyMemo');
        
        if (!calendar || !stickyMemo) return;
        
        // 위치 충돌 확인
        const calendarRect = calendar.getBoundingClientRect();
        const stickyRect = stickyMemo.getBoundingClientRect();
        
        // 겹침 확인
        const isOverlapping = !(
            calendarRect.right < stickyRect.left ||
            calendarRect.left > stickyRect.right ||
            calendarRect.bottom < stickyRect.top ||
            calendarRect.top > stickyRect.bottom
        );
        
        if (isOverlapping && CONFIG.preventOverlap) {
            console.warn('⚠️ 달력과 스티커 메모가 겹침 - 위치 조정');
            
            // 스티커 메모를 안전한 위치로 이동
            stickyMemo.style.right = '20px';
            stickyMemo.style.bottom = '20px';
            stickyMemo.style.left = 'auto';
            stickyMemo.style.top = 'auto';
            
            // 위치 저장
            const newPosition = {
                left: 'auto',
                top: 'auto',
                right: '20px',
                bottom: '20px'
            };
            localStorage.setItem('stickyMemoPosition', JSON.stringify(newPosition));
        }
        
        console.log('🔍 충돌 감지 완료');
    }
    
    /**
     * 변경사항 모니터링
     */
    function monitorChanges() {
        // MutationObserver로 달력 변경 감지
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        const observer = new MutationObserver((mutations) => {
            let needsStabilization = false;
            
            for (const mutation of mutations) {
                // style 변경 감지
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    
                    // 달력의 transform이 변경된 경우
                    if (target.id === 'calendar' && target.style.transform) {
                        console.warn('⚠️ 달력 transform 감지 - 제거');
                        target.style.transform = 'none';
                        needsStabilization = true;
                    }
                }
                
                // 달력이 재생성된 경우
                if (mutation.type === 'childList' && mutation.target.id === 'calendar') {
                    needsStabilization = true;
                }
            }
            
            if (needsStabilization) {
                setTimeout(() => {
                    stabilizeCalendar();
                    detectAndFixConflicts();
                }, 100);
            }
        });
        
        observer.observe(calendar, {
            attributes: true,
            attributeFilter: ['style'],
            childList: true,
            subtree: true
        });
        
        // 윈도우 리사이즈 시 재조정
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                stabilizeCalendar();
                detectAndFixConflicts();
            }, 250);
        });
        
        console.log('👁️ 변경사항 모니터링 시작');
    }
    
    /**
     * 긴급 수정 함수
     */
    window.fixPositionConflict = function() {
        console.log('🚨 긴급 위치 수정 실행');
        
        // 모든 요소 초기화
        init();
        
        // 달력 강제 재정렬
        const calendar = document.getElementById('calendar');
        if (calendar) {
            calendar.style.cssText = `
                position: relative !important;
                z-index: ${CONFIG.calendarZIndex} !important;
                transform: none !important;
                transition: none !important;
            `;
        }
        
        // 스티커 메모 강제 격리
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            stickyMemo.style.cssText = `
                position: fixed !important;
                z-index: ${CONFIG.stickyZIndex} !important;
                right: 20px !important;
                bottom: 20px !important;
                left: auto !important;
                top: auto !important;
                transform: none !important;
            `;
        }
        
        console.log('✅ 긴급 수정 완료');
    };
    
    /**
     * 디버그 정보
     */
    window.debugPositions = function() {
        const calendar = document.getElementById('calendar');
        const stickyMemo = document.getElementById('stickyMemo');
        
        console.group('📊 위치 디버그 정보');
        
        if (calendar) {
            const calendarRect = calendar.getBoundingClientRect();
            const calendarStyle = window.getComputedStyle(calendar);
            console.log('📅 달력:', {
                position: calendarStyle.position,
                zIndex: calendarStyle.zIndex,
                transform: calendarStyle.transform,
                rect: calendarRect,
                style: calendar.style.cssText
            });
        }
        
        if (stickyMemo) {
            const stickyRect = stickyMemo.getBoundingClientRect();
            const stickyStyle = window.getComputedStyle(stickyMemo);
            console.log('📌 스티커:', {
                position: stickyStyle.position,
                zIndex: stickyStyle.zIndex,
                transform: stickyStyle.transform,
                rect: stickyRect,
                style: stickyMemo.style.cssText
            });
        }
        
        // 겹침 확인
        if (calendar && stickyMemo) {
            const calendarRect = calendar.getBoundingClientRect();
            const stickyRect = stickyMemo.getBoundingClientRect();
            
            const isOverlapping = !(
                calendarRect.right < stickyRect.left ||
                calendarRect.left > stickyRect.right ||
                calendarRect.bottom < stickyRect.top ||
                calendarRect.top > stickyRect.bottom
            );
            
            console.log('🔍 겹침 상태:', isOverlapping ? '⚠️ 겹침' : '✅ 정상');
        }
        
        console.groupEnd();
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // 달력 재생성 감지
    const originalCreateCalendar = window.createCalendar;
    if (originalCreateCalendar) {
        window.createCalendar = function(...args) {
            const result = originalCreateCalendar.apply(this, args);
            setTimeout(() => {
                stabilizeCalendar();
                detectAndFixConflicts();
            }, 100);
            return result;
        };
    }
    
    console.log('✅ 위치 충돌 해결 시스템 준비 완료');
    console.log('🛠️ 명령어: fixPositionConflict(), debugPositions()');
    
})();