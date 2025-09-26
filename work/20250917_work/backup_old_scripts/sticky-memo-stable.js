/**
 * 스티커 메모 안정화 버전
 * 기존 스크립트들의 충돌 문제를 해결한 통합 버전
 */

(function() {
    'use strict';
    
    console.log('📌 스티커 메모 안정화 버전 로드');
    
    // 전역 충돌 방지
    if (window.StickyMemoStable) {
        console.warn('스티커 메모가 이미 초기화되어 있습니다.');
        return;
    }
    
    // 설정
    const CONFIG = {
        dragEnabled: true,
        resizeEnabled: true,
        minWidth: 200,
        maxWidth: window.innerWidth * 0.9,
        minHeight: 150,
        maxHeight: window.innerHeight * 0.9,
        smoothDrag: true,
        savePosition: true
    };
    
    // 상태 관리
    const state = {
        element: null,
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        startWidth: 0,
        startHeight: 0,
        initialized: false
    };
    
    /**
     * 초기화
     */
    function init() {
        if (state.initialized) return;
        
        // 기존 이벤트 리스너 제거
        cleanupExistingListeners();
        
        // 스티커 메모 찾기
        state.element = document.getElementById('stickyMemo');
        
        if (!state.element) {
            // 나중에 생성될 수 있으므로 감시
            observeForCreation();
            return;
        }
        
        // 기본 설정 적용
        setupElement();
        
        // 이벤트 설정
        setupEvents();
        
        // 저장된 위치 복원
        restorePosition();
        
        state.initialized = true;
        console.log('✅ 스티커 메모 초기화 완료');
    }
    
    /**
     * 기존 리스너 정리
     */
    function cleanupExistingListeners() {
        // 기존 전역 변수들 제거
        if (window.StickyMemoPerformance) {
            delete window.StickyMemoPerformance;
        }
        if (window.StickyMemoEnhanced) {
            delete window.StickyMemoEnhanced;
        }
        if (window.StickyFreedom) {
            delete window.StickyFreedom;
        }
        
        // 기존 이벤트 리스너 제거를 위해 element 재생성은 피하고
        // 새로운 이벤트만 추가
        const oldElement = document.getElementById('stickyMemo');
        if (oldElement) {
            const newElement = oldElement.cloneNode(true);
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }
    }
    
    /**
     * 요소 설정
     */
    function setupElement() {
        if (!state.element) return;
        
        // 기본 스타일 설정
        state.element.style.position = 'fixed';
        state.element.style.zIndex = '9999';
        
        // 크기 제한 설정
        state.element.style.minWidth = CONFIG.minWidth + 'px';
        state.element.style.minHeight = CONFIG.minHeight + 'px';
        state.element.style.maxWidth = CONFIG.maxWidth + 'px';
        state.element.style.maxHeight = CONFIG.maxHeight + 'px';
        
        // 리사이즈 활성화
        if (CONFIG.resizeEnabled) {
            state.element.style.resize = 'both';
            state.element.style.overflow = 'auto';
        }
        
        // 트랜지션 제거 (드래그 시 부드러움을 위해)
        state.element.style.transition = 'none';
        
        // 헤더 설정
        const header = document.getElementById('stickyMemoHeader');
        if (header) {
            header.style.cursor = 'move';
            header.style.userSelect = 'none';
        }
    }
    
    /**
     * 이벤트 설정
     */
    function setupEvents() {
        const header = document.getElementById('stickyMemoHeader');
        if (!header) return;
        
        // 드래그 이벤트
        header.addEventListener('mousedown', handleDragStart, true);
        
        // 전역 이벤트 (한 번만 등록)
        if (!window._stickyMemoGlobalEvents) {
            document.addEventListener('mousemove', handleDragMove, true);
            document.addEventListener('mouseup', handleDragEnd, true);
            
            // 터치 이벤트
            header.addEventListener('touchstart', handleTouchStart, { passive: false });
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd, { passive: false });
            
            window._stickyMemoGlobalEvents = true;
        }
        
        // 리사이즈 옵저버
        if (CONFIG.resizeEnabled && window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    saveSize(entry.contentRect.width, entry.contentRect.height);
                }
            });
            resizeObserver.observe(state.element);
        }
    }
    
    /**
     * 드래그 시작
     */
    function handleDragStart(e) {
        if (!CONFIG.dragEnabled) return;
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        state.isDragging = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        
        const rect = state.element.getBoundingClientRect();
        state.startLeft = rect.left;
        state.startTop = rect.top;
        
        // 드래그 중 스타일
        state.element.style.opacity = '0.9';
        document.body.style.userSelect = 'none';
    }
    
    /**
     * 드래그 이동
     */
    function handleDragMove(e) {
        if (!state.isDragging) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;
        
        let newLeft = state.startLeft + deltaX;
        let newTop = state.startTop + deltaY;
        
        // 화면 경계 체크 (약간의 여유 허용)
        const margin = 50;
        const elementWidth = state.element.offsetWidth;
        const elementHeight = state.element.offsetHeight;
        
        // 최소한 일부는 화면에 보이도록
        newLeft = Math.max(-elementWidth + margin, Math.min(window.innerWidth - margin, newLeft));
        newTop = Math.max(0, Math.min(window.innerHeight - margin, newTop));
        
        // 부드러운 이동
        if (CONFIG.smoothDrag) {
            requestAnimationFrame(() => {
                state.element.style.left = newLeft + 'px';
                state.element.style.top = newTop + 'px';
                // transform 제거 (위치 충돌 방지)
                state.element.style.transform = 'none';
            });
        } else {
            state.element.style.left = newLeft + 'px';
            state.element.style.top = newTop + 'px';
            state.element.style.transform = 'none';
        }
    }
    
    /**
     * 드래그 종료
     */
    function handleDragEnd(e) {
        if (!state.isDragging) return;
        
        state.isDragging = false;
        
        // 스타일 복원
        state.element.style.opacity = '';
        document.body.style.userSelect = '';
        
        // 위치 저장
        if (CONFIG.savePosition) {
            savePosition();
        }
    }
    
    /**
     * 터치 이벤트 핸들러
     */
    function handleTouchStart(e) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleDragStart(mouseEvent);
    }
    
    function handleTouchMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleDragMove(mouseEvent);
    }
    
    function handleTouchEnd(e) {
        const mouseEvent = new MouseEvent('mouseup', {});
        handleDragEnd(mouseEvent);
    }
    
    /**
     * 위치 저장
     */
    function savePosition() {
        if (!state.element) return;
        
        const position = {
            left: state.element.style.left,
            top: state.element.style.top,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('stickyMemoPosition', JSON.stringify(position));
        } catch (e) {
            console.warn('위치 저장 실패:', e);
        }
    }
    
    /**
     * 크기 저장
     */
    function saveSize(width, height) {
        const size = {
            width: width + 'px',
            height: height + 'px',
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('stickyMemoSize', JSON.stringify(size));
        } catch (e) {
            console.warn('크기 저장 실패:', e);
        }
    }
    
    /**
     * 위치 복원
     */
    function restorePosition() {
        if (!state.element) return;
        
        try {
            // 위치 복원
            const savedPosition = localStorage.getItem('stickyMemoPosition');
            if (savedPosition) {
                const position = JSON.parse(savedPosition);
                
                // 유효성 검사
                const left = parseInt(position.left);
                const top = parseInt(position.top);
                
                if (!isNaN(left) && !isNaN(top)) {
                    // 화면 밖으로 완전히 나가지 않도록
                    const validLeft = Math.max(0, Math.min(window.innerWidth - 100, left));
                    const validTop = Math.max(0, Math.min(window.innerHeight - 100, top));
                    
                    state.element.style.left = validLeft + 'px';
                    state.element.style.top = validTop + 'px';
                    state.element.style.transform = 'none'; // transform 초기화
                }
            } else {
                // 기본 위치 (우하단 - 달력과 겹치지 않도록)
                state.element.style.position = 'fixed';
                state.element.style.right = '20px';
                state.element.style.bottom = '20px';
                state.element.style.left = 'auto';
                state.element.style.top = 'auto';
                state.element.style.transform = 'none';
            }
            
            // 크기 복원
            const savedSize = localStorage.getItem('stickyMemoSize');
            if (savedSize) {
                const size = JSON.parse(savedSize);
                if (size.width) state.element.style.width = size.width;
                if (size.height) state.element.style.height = size.height;
            }
        } catch (e) {
            console.warn('위치/크기 복원 실패:', e);
            centerElement();
        }
    }
    
    /**
     * 중앙 정렬
     */
    function centerElement() {
        if (!state.element) return;
        
        const width = state.element.offsetWidth || 350;
        const height = state.element.offsetHeight || 400;
        
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        state.element.style.left = left + 'px';
        state.element.style.top = top + 'px';
        state.element.style.transform = 'none';
    }
    
    /**
     * 동적 생성 감시
     */
    function observeForCreation() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'stickyMemo') {
                        observer.disconnect();
                        setTimeout(init, 100);
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
    
    /**
     * 공개 API
     */
    window.StickyMemoStable = {
        init: init,
        reset: function() {
            if (state.element) {
                centerElement();
                state.element.style.width = '350px';
                state.element.style.height = '400px';
                savePosition();
                saveSize(350, 400);
            }
        },
        getPosition: function() {
            if (state.element) {
                return {
                    left: parseInt(state.element.style.left),
                    top: parseInt(state.element.style.top)
                };
            }
            return null;
        },
        setPosition: function(left, top) {
            if (state.element) {
                state.element.style.left = left + 'px';
                state.element.style.top = top + 'px';
                state.element.style.transform = 'none';
                savePosition();
            }
        },
        center: centerElement,
        getConfig: function() {
            return CONFIG;
        }
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('✅ 스티커 메모 안정화 버전 준비 완료');
    
})();