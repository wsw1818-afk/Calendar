/**
 * 스티커 메모 성능 최적화 모듈
 * 드래그 및 리사이즈 성능 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🚀 스티커 메모 성능 최적화 시작');
    
    // 성능 최적화를 위한 설정
    const PERFORMANCE_CONFIG = {
        dragThrottle: 16, // 60fps를 위한 throttle (1000/60 ≈ 16ms)
        resizeDebounce: 100, // 리사이즈 디바운스 시간
        smoothTransition: true, // 부드러운 전환 효과
        useTransform: true, // transform 사용 (GPU 가속)
        cacheDOM: true // DOM 요소 캐싱
    };
    
    // DOM 요소 캐시
    let domCache = {
        stickyMemo: null,
        header: null,
        resizeHandle: null,
        content: null
    };
    
    // 드래그 상태
    let dragState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        rafId: null
    };
    
    // 리사이즈 상태
    let resizeState = {
        isResizing: false,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        rafId: null
    };
    
    /**
     * DOM 요소 캐싱
     */
    function cacheDOMElements() {
        domCache.stickyMemo = document.getElementById('stickyMemo');
        domCache.header = document.getElementById('stickyMemoHeader');
        domCache.content = domCache.stickyMemo?.querySelector('.sticky-memo-content');
        
        // 리사이즈 핸들 생성
        if (domCache.stickyMemo && !domCache.resizeHandle) {
            createResizeHandle();
        }
    }
    
    /**
     * 리사이즈 핸들 생성
     */
    function createResizeHandle() {
        const handle = document.createElement('div');
        handle.className = 'sticky-resize-handle';
        handle.style.cssText = `
            position: absolute;
            right: 0;
            bottom: 0;
            width: 20px;
            height: 20px;
            cursor: nwse-resize;
            z-index: 10;
            background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%);
            border-radius: 0 0 20px 0;
        `;
        domCache.stickyMemo.appendChild(handle);
        domCache.resizeHandle = handle;
    }
    
    /**
     * 최적화된 드래그 초기화
     */
    function initOptimizedDrag() {
        if (!domCache.header || !domCache.stickyMemo) return;
        
        // 기존 이벤트 제거
        domCache.header.removeEventListener('mousedown', handleDragStart);
        domCache.header.removeEventListener('touchstart', handleDragStart);
        
        // 새 이벤트 추가
        domCache.header.addEventListener('mousedown', handleDragStart, { passive: false });
        domCache.header.addEventListener('touchstart', handleDragStart, { passive: false });
        
        // 전역 이벤트는 한 번만 등록
        if (!window._stickyDragInitialized) {
            document.addEventListener('mousemove', handleDragMove, { passive: false });
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
            window._stickyDragInitialized = true;
        }
    }
    
    /**
     * 드래그 시작
     */
    function handleDragStart(e) {
        // 버튼이나 입력 요소에서는 드래그 방지
        if (e.target.closest('button, input, textarea')) return;
        
        e.preventDefault();
        dragState.isDragging = true;
        
        const touch = e.touches ? e.touches[0] : e;
        dragState.startX = touch.clientX;
        dragState.startY = touch.clientY;
        
        const rect = domCache.stickyMemo.getBoundingClientRect();
        dragState.initialX = rect.left;
        dragState.initialY = rect.top;
        
        // 드래그 중 스타일
        if (PERFORMANCE_CONFIG.smoothTransition) {
            domCache.stickyMemo.style.transition = 'none';
        }
        domCache.stickyMemo.style.cursor = 'grabbing';
        domCache.header.style.cursor = 'grabbing';
        
        // will-change로 성능 힌트
        domCache.stickyMemo.style.willChange = 'transform';
    }
    
    /**
     * 드래그 이동 (최적화됨)
     */
    function handleDragMove(e) {
        if (!dragState.isDragging) return;
        
        e.preventDefault();
        
        // requestAnimationFrame으로 최적화
        if (dragState.rafId) {
            cancelAnimationFrame(dragState.rafId);
        }
        
        dragState.rafId = requestAnimationFrame(() => {
            const touch = e.touches ? e.touches[0] : e;
            const deltaX = touch.clientX - dragState.startX;
            const deltaY = touch.clientY - dragState.startY;
            
            let newX = dragState.initialX + deltaX;
            let newY = dragState.initialY + deltaY;
            
            // 화면 경계 체크
            const maxX = window.innerWidth - domCache.stickyMemo.offsetWidth;
            const maxY = window.innerHeight - domCache.stickyMemo.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            // transform 사용 (GPU 가속)
            if (PERFORMANCE_CONFIG.useTransform) {
                const currentLeft = parseInt(domCache.stickyMemo.style.left) || 0;
                const currentTop = parseInt(domCache.stickyMemo.style.top) || 0;
                const transformX = newX - currentLeft;
                const transformY = newY - currentTop;
                domCache.stickyMemo.style.transform = `translate(${transformX}px, ${transformY}px)`;
            } else {
                domCache.stickyMemo.style.left = `${newX}px`;
                domCache.stickyMemo.style.top = `${newY}px`;
            }
        });
    }
    
    /**
     * 드래그 종료
     */
    function handleDragEnd(e) {
        if (!dragState.isDragging) return;
        
        dragState.isDragging = false;
        
        // transform을 실제 위치로 변환
        if (PERFORMANCE_CONFIG.useTransform) {
            const rect = domCache.stickyMemo.getBoundingClientRect();
            domCache.stickyMemo.style.transform = '';
            domCache.stickyMemo.style.left = `${rect.left}px`;
            domCache.stickyMemo.style.top = `${rect.top}px`;
        }
        
        // 스타일 복원
        domCache.stickyMemo.style.cursor = '';
        domCache.header.style.cursor = 'move';
        domCache.stickyMemo.style.willChange = '';
        
        if (PERFORMANCE_CONFIG.smoothTransition) {
            domCache.stickyMemo.style.transition = '';
        }
        
        // 위치 저장
        saveStickyPosition();
        
        // RAF 정리
        if (dragState.rafId) {
            cancelAnimationFrame(dragState.rafId);
            dragState.rafId = null;
        }
    }
    
    /**
     * 최적화된 리사이즈 초기화
     */
    function initOptimizedResize() {
        if (!domCache.resizeHandle || !domCache.stickyMemo) return;
        
        // 기존 이벤트 제거
        domCache.resizeHandle.removeEventListener('mousedown', handleResizeStart);
        domCache.resizeHandle.removeEventListener('touchstart', handleResizeStart);
        
        // 새 이벤트 추가
        domCache.resizeHandle.addEventListener('mousedown', handleResizeStart, { passive: false });
        domCache.resizeHandle.addEventListener('touchstart', handleResizeStart, { passive: false });
        
        // 전역 이벤트는 한 번만 등록
        if (!window._stickyResizeInitialized) {
            document.addEventListener('mousemove', handleResizeMove, { passive: false });
            document.addEventListener('mouseup', handleResizeEnd);
            document.addEventListener('touchmove', handleResizeMove, { passive: false });
            document.addEventListener('touchend', handleResizeEnd);
            window._stickyResizeInitialized = true;
        }
    }
    
    /**
     * 리사이즈 시작
     */
    function handleResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        resizeState.isResizing = true;
        
        const touch = e.touches ? e.touches[0] : e;
        resizeState.startX = touch.clientX;
        resizeState.startY = touch.clientY;
        resizeState.startWidth = domCache.stickyMemo.offsetWidth;
        resizeState.startHeight = domCache.stickyMemo.offsetHeight;
        
        // 리사이즈 중 스타일
        if (PERFORMANCE_CONFIG.smoothTransition) {
            domCache.stickyMemo.style.transition = 'none';
        }
        domCache.stickyMemo.style.willChange = 'width, height';
        document.body.style.cursor = 'nwse-resize';
        
        // 텍스트 선택 방지
        document.body.style.userSelect = 'none';
    }
    
    /**
     * 리사이즈 이동 (최적화됨)
     */
    function handleResizeMove(e) {
        if (!resizeState.isResizing) return;
        
        e.preventDefault();
        
        // requestAnimationFrame으로 최적화
        if (resizeState.rafId) {
            cancelAnimationFrame(resizeState.rafId);
        }
        
        resizeState.rafId = requestAnimationFrame(() => {
            const touch = e.touches ? e.touches[0] : e;
            const deltaX = touch.clientX - resizeState.startX;
            const deltaY = touch.clientY - resizeState.startY;
            
            let newWidth = resizeState.startWidth + deltaX;
            let newHeight = resizeState.startHeight + deltaY;
            
            // 최소/최대 크기 제한
            newWidth = Math.max(250, Math.min(newWidth, window.innerWidth * 0.8));
            newHeight = Math.max(200, Math.min(newHeight, window.innerHeight * 0.8));
            
            // 크기 적용
            domCache.stickyMemo.style.width = `${newWidth}px`;
            domCache.stickyMemo.style.height = `${newHeight}px`;
        });
    }
    
    /**
     * 리사이즈 종료
     */
    function handleResizeEnd(e) {
        if (!resizeState.isResizing) return;
        
        resizeState.isResizing = false;
        
        // 스타일 복원
        domCache.stickyMemo.style.willChange = '';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        if (PERFORMANCE_CONFIG.smoothTransition) {
            domCache.stickyMemo.style.transition = '';
        }
        
        // 크기 저장
        saveStickySize();
        
        // RAF 정리
        if (resizeState.rafId) {
            cancelAnimationFrame(resizeState.rafId);
            resizeState.rafId = null;
        }
    }
    
    /**
     * 위치 저장
     */
    function saveStickyPosition() {
        if (!domCache.stickyMemo) return;
        
        const rect = domCache.stickyMemo.getBoundingClientRect();
        const position = {
            x: rect.left,
            y: rect.top,
            timestamp: Date.now()
        };
        
        localStorage.setItem('stickyMemoPosition', JSON.stringify(position));
    }
    
    /**
     * 크기 저장
     */
    function saveStickySize() {
        if (!domCache.stickyMemo) return;
        
        const size = {
            width: domCache.stickyMemo.style.width,
            height: domCache.stickyMemo.style.height,
            timestamp: Date.now()
        };
        
        localStorage.setItem('stickyMemoSize', JSON.stringify(size));
    }
    
    /**
     * 성능 최적화 스타일 적용
     */
    function applyPerformanceStyles() {
        if (!domCache.stickyMemo) return;
        
        // GPU 가속을 위한 스타일
        domCache.stickyMemo.style.transform = 'translateZ(0)';
        domCache.stickyMemo.style.backfaceVisibility = 'hidden';
        domCache.stickyMemo.style.perspective = '1000px';
        
        // 부드러운 애니메이션
        if (PERFORMANCE_CONFIG.smoothTransition) {
            domCache.stickyMemo.style.transition = 'box-shadow 0.3s ease, transform 0.1s ease';
        }
        
        // 헤더 스타일
        if (domCache.header) {
            domCache.header.style.cursor = 'move';
            domCache.header.style.userSelect = 'none';
        }
    }
    
    /**
     * 초기화 함수
     */
    function initialize() {
        // DOM 준비 확인
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
            return;
        }
        
        // 약간의 지연 후 초기화 (다른 스크립트들이 로드되도록)
        setTimeout(() => {
            cacheDOMElements();
            
            if (domCache.stickyMemo) {
                applyPerformanceStyles();
                initOptimizedDrag();
                initOptimizedResize();
                
                console.log('✅ 스티커 메모 성능 최적화 완료');
            } else {
                // 스티커 메모가 동적으로 생성되는 경우를 위한 옵저버
                observeStickyMemoCreation();
            }
        }, 100);
    }
    
    /**
     * 스티커 메모 생성 감지
     */
    function observeStickyMemoCreation() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'stickyMemo' || (node.querySelector && node.querySelector('#stickyMemo'))) {
                        observer.disconnect();
                        setTimeout(() => {
                            cacheDOMElements();
                            applyPerformanceStyles();
                            initOptimizedDrag();
                            initOptimizedResize();
                            console.log('✅ 동적 스티커 메모 성능 최적화 완료');
                        }, 50);
                        return;
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 초기화 실행
    initialize();
    
    // 전역 API 제공
    window.StickyMemoPerformance = {
        reinitialize: function() {
            cacheDOMElements();
            if (domCache.stickyMemo) {
                applyPerformanceStyles();
                initOptimizedDrag();
                initOptimizedResize();
            }
        },
        getConfig: function() {
            return PERFORMANCE_CONFIG;
        },
        setConfig: function(config) {
            Object.assign(PERFORMANCE_CONFIG, config);
        }
    };
    
})();