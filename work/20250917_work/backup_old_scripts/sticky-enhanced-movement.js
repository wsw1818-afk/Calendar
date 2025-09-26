/**
 * 스티커 메모 향상된 이동 및 크기 조절
 * 자유로운 드래그 이동과 확장된 크기 조절 기능
 */

(function() {
    'use strict';
    
    console.log('🎯 스티커 메모 향상된 이동 시스템 시작');
    
    // 설정
    const CONFIG = {
        // 크기 제한 (화면 크기 대비 최대 95%)
        minWidth: 200,
        maxWidth: window.innerWidth * 0.95,
        minHeight: 150,
        maxHeight: window.innerHeight * 0.95,
        
        // 드래그 설정
        dragEnabled: true,
        resizeEnabled: true,
        
        // 성능 설정
        useRAF: true,
        throttleMs: 16 // 60fps
    };
    
    // 상태
    let state = {
        isDragging: false,
        isResizing: false,
        currentHandle: null,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        startWidth: 0,
        startHeight: 0,
        element: null,
        rafId: null
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('🎯 향상된 이동 시스템 초기화');
        
        // 기존 시스템 비활성화
        disableExistingSystems();
        
        // 스티커 메모 찾기 또는 감시
        findAndSetupStickyMemo();
        
        // 전역 이벤트 등록
        setupGlobalEvents();
        
        // 스타일 추가
        addEnhancedStyles();
        
        console.log('✅ 향상된 이동 시스템 초기화 완료');
    }
    
    /**
     * 기존 시스템 비활성화
     */
    function disableExistingSystems() {
        // 기존 드래그 시스템들 비활성화
        if (window.StickyMemoStable) {
            window.StickyMemoStable.dragEnabled = false;
        }
        if (window.StickyMemoEnhanced) {
            delete window.StickyMemoEnhanced;
        }
        if (window.StickyFreedom) {
            delete window.StickyFreedom;
        }
        
        console.log('🔇 기존 드래그 시스템 비활성화 완료');
    }
    
    /**
     * 스티커 메모 찾기 및 설정
     */
    function findAndSetupStickyMemo() {
        state.element = document.getElementById('stickyMemo');
        
        if (state.element) {
            setupStickyMemo(state.element);
        } else {
            // MutationObserver로 생성 감시
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.id === 'stickyMemo') {
                            state.element = node;
                            setupStickyMemo(node);
                            observer.disconnect();
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
    }
    
    /**
     * 스티커 메모 설정
     */
    function setupStickyMemo(element) {
        console.log('🔧 스티커 메모 설정 시작');
        
        // 기본 스타일 설정
        setupBasicStyles(element);
        
        // 리사이즈 핸들 추가
        addResizeHandles(element);
        
        // 드래그 핸들 설정
        setupDragHandle(element);
        
        // 크기 제한 설정
        applySizeConstraints(element);
        
        console.log('✅ 스티커 메모 설정 완료');
    }
    
    /**
     * 기본 스타일 설정
     */
    function setupBasicStyles(element) {
        element.style.setProperty('position', 'fixed', 'important');
        element.style.setProperty('user-select', 'none', 'important');
        element.style.setProperty('resize', 'none', 'important'); // CSS resize 비활성화
        element.style.setProperty('overflow', 'visible', 'important');
        element.style.setProperty('cursor', 'default', 'important');
    }
    
    /**
     * 크기 제한 적용
     */
    function applySizeConstraints(element) {
        element.style.minWidth = CONFIG.minWidth + 'px';
        element.style.maxWidth = CONFIG.maxWidth + 'px';
        element.style.minHeight = CONFIG.minHeight + 'px';
        element.style.maxHeight = CONFIG.maxHeight + 'px';
    }
    
    /**
     * 리사이즈 핸들 추가
     */
    function addResizeHandles(element) {
        // 기존 핸들 제거
        const existingHandles = element.querySelectorAll('.resize-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // 8방향 리사이즈 핸들
        const handles = [
            { name: 'n', cursor: 'n-resize', style: 'top: -5px; left: 50%; transform: translateX(-50%); width: 20px; height: 10px;' },
            { name: 's', cursor: 's-resize', style: 'bottom: -5px; left: 50%; transform: translateX(-50%); width: 20px; height: 10px;' },
            { name: 'w', cursor: 'w-resize', style: 'left: -5px; top: 50%; transform: translateY(-50%); width: 10px; height: 20px;' },
            { name: 'e', cursor: 'e-resize', style: 'right: -5px; top: 50%; transform: translateY(-50%); width: 10px; height: 20px;' },
            { name: 'nw', cursor: 'nw-resize', style: 'top: -5px; left: -5px; width: 10px; height: 10px;' },
            { name: 'ne', cursor: 'ne-resize', style: 'top: -5px; right: -5px; width: 10px; height: 10px;' },
            { name: 'sw', cursor: 'sw-resize', style: 'bottom: -5px; left: -5px; width: 10px; height: 10px;' },
            { name: 'se', cursor: 'se-resize', style: 'bottom: -5px; right: -5px; width: 10px; height: 10px;' }
        ];
        
        handles.forEach(handleInfo => {
            const handle = document.createElement('div');
            handle.className = 'resize-handle resize-' + handleInfo.name;
            handle.style.cssText = `
                position: absolute;
                background: rgba(0, 123, 255, 0.8);
                border: 1px solid #007bff;
                border-radius: 2px;
                cursor: ${handleInfo.cursor};
                z-index: 10;
                opacity: 0;
                transition: opacity 0.2s;
                ${handleInfo.style}
            `;
            
            // 핸들 이벤트
            handle.addEventListener('mousedown', (e) => startResize(e, handleInfo.name));
            handle.addEventListener('touchstart', (e) => startResize(e, handleInfo.name), { passive: false });
            
            element.appendChild(handle);
        });
        
        // 호버 시 핸들 표시
        element.addEventListener('mouseenter', () => {
            element.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.opacity = '1';
            });
        });
        
        element.addEventListener('mouseleave', () => {
            if (!state.isResizing) {
                element.querySelectorAll('.resize-handle').forEach(handle => {
                    handle.style.opacity = '0';
                });
            }
        });
    }
    
    /**
     * 드래그 핸들 설정
     */
    function setupDragHandle(element) {
        // 헤더 찾기
        let dragHandle = element.querySelector('#stickyMemoHeader, .sticky-memo-header, .drag-handle');
        
        if (!dragHandle) {
            // 헤더가 없으면 전체 영역을 드래그 가능하게 (버튼 제외)
            dragHandle = element;
        }
        
        // 드래그 이벤트
        dragHandle.addEventListener('mousedown', startDrag);
        dragHandle.addEventListener('touchstart', startDrag, { passive: false });
        
        // 커서 스타일
        if (dragHandle === element) {
            dragHandle.style.cursor = 'move';
        } else {
            dragHandle.style.cursor = 'move';
        }
        
        console.log('🖱️ 드래그 핸들 설정 완료');
    }
    
    /**
     * 전역 이벤트 설정
     */
    function setupGlobalEvents() {
        // 마우스 이벤트
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 터치 이벤트
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        
        // 윈도우 리사이즈 시 제한 재설정
        window.addEventListener('resize', () => {
            CONFIG.maxWidth = window.innerWidth * 0.95;
            CONFIG.maxHeight = window.innerHeight * 0.95;
            if (state.element) {
                applySizeConstraints(state.element);
            }
        });
        
        console.log('🌐 전역 이벤트 등록 완료');
    }
    
    /**
     * 드래그 시작
     */
    function startDrag(e) {
        if (!CONFIG.dragEnabled || state.isResizing) return;
        
        // 버튼이나 입력 요소는 드래그하지 않음
        if (e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' ||
            e.target.classList.contains('resize-handle')) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        state.isDragging = true;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        state.startX = clientX;
        state.startY = clientY;
        
        const rect = state.element.getBoundingClientRect();
        state.startLeft = rect.left;
        state.startTop = rect.top;
        
        // 드래그 중 스타일
        state.element.style.opacity = '0.9';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
        
        console.log('🖱️ 드래그 시작');
    }
    
    /**
     * 리사이즈 시작
     */
    function startResize(e, handle) {
        if (!CONFIG.resizeEnabled) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        state.isResizing = true;
        state.currentHandle = handle;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        state.startX = clientX;
        state.startY = clientY;
        
        const rect = state.element.getBoundingClientRect();
        state.startLeft = rect.left;
        state.startTop = rect.top;
        state.startWidth = rect.width;
        state.startHeight = rect.height;
        
        // 리사이즈 중 스타일
        state.element.style.opacity = '0.95';
        document.body.style.userSelect = 'none';
        
        // 모든 핸들 표시 유지
        state.element.querySelectorAll('.resize-handle').forEach(handle => {
            handle.style.opacity = '1';
        });
        
        console.log('📏 리사이즈 시작:', handle);
    }
    
    /**
     * 마우스/터치 이동 처리
     */
    function handleMouseMove(e) {
        handleMove(e.clientX, e.clientY);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    function handleMove(clientX, clientY) {
        if (!state.isDragging && !state.isResizing) return;
        
        if (CONFIG.useRAF) {
            if (state.rafId) {
                cancelAnimationFrame(state.rafId);
            }
            state.rafId = requestAnimationFrame(() => {
                performMove(clientX, clientY);
            });
        } else {
            performMove(clientX, clientY);
        }
    }
    
    /**
     * 실제 이동/리사이즈 수행
     */
    function performMove(clientX, clientY) {
        const deltaX = clientX - state.startX;
        const deltaY = clientY - state.startY;
        
        if (state.isDragging) {
            performDrag(deltaX, deltaY);
        } else if (state.isResizing) {
            performResize(deltaX, deltaY);
        }
    }
    
    /**
     * 드래그 수행
     */
    function performDrag(deltaX, deltaY) {
        let newLeft = state.startLeft + deltaX;
        let newTop = state.startTop + deltaY;
        
        // 화면 경계 체크 (일부는 화면 밖으로 나갈 수 있도록)
        const margin = 50;
        const elementWidth = state.element.offsetWidth;
        const elementHeight = state.element.offsetHeight;
        
        newLeft = Math.max(-elementWidth + margin, Math.min(window.innerWidth - margin, newLeft));
        newTop = Math.max(-margin, Math.min(window.innerHeight - margin, newTop));
        
        state.element.style.left = newLeft + 'px';
        state.element.style.top = newTop + 'px';
    }
    
    /**
     * 리사이즈 수행
     */
    function performResize(deltaX, deltaY) {
        let newWidth = state.startWidth;
        let newHeight = state.startHeight;
        let newLeft = state.startLeft;
        let newTop = state.startTop;
        
        const handle = state.currentHandle;
        
        // 각 방향별 리사이즈 로직
        if (handle.includes('e')) {
            newWidth = Math.max(CONFIG.minWidth, Math.min(CONFIG.maxWidth, state.startWidth + deltaX));
        }
        if (handle.includes('w')) {
            const widthDelta = -deltaX;
            newWidth = Math.max(CONFIG.minWidth, Math.min(CONFIG.maxWidth, state.startWidth + widthDelta));
            if (newWidth !== state.startWidth + widthDelta) {
                // 최소/최대 크기에 도달했을 때 위치 조정 안함
            } else {
                newLeft = state.startLeft + deltaX;
            }
        }
        if (handle.includes('s')) {
            newHeight = Math.max(CONFIG.minHeight, Math.min(CONFIG.maxHeight, state.startHeight + deltaY));
        }
        if (handle.includes('n')) {
            const heightDelta = -deltaY;
            newHeight = Math.max(CONFIG.minHeight, Math.min(CONFIG.maxHeight, state.startHeight + heightDelta));
            if (newHeight !== state.startHeight + heightDelta) {
                // 최소/최대 크기에 도달했을 때 위치 조정 안함
            } else {
                newTop = state.startTop + deltaY;
            }
        }
        
        // 화면 경계 체크
        newLeft = Math.max(0, Math.min(window.innerWidth - newWidth, newLeft));
        newTop = Math.max(0, Math.min(window.innerHeight - newHeight, newTop));
        
        // 스타일 적용
        state.element.style.width = newWidth + 'px';
        state.element.style.height = newHeight + 'px';
        state.element.style.left = newLeft + 'px';
        state.element.style.top = newTop + 'px';
    }
    
    /**
     * 드래그/리사이즈 종료
     */
    function handleMouseUp() {
        handleEnd();
    }
    
    function handleTouchEnd() {
        handleEnd();
    }
    
    function handleEnd() {
        if (!state.isDragging && !state.isResizing) return;
        
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        
        // 상태 초기화
        const wasDragging = state.isDragging;
        const wasResizing = state.isResizing;
        
        state.isDragging = false;
        state.isResizing = false;
        state.currentHandle = null;
        
        // 스타일 복원
        if (state.element) {
            state.element.style.opacity = '';
            
            // 핸들 숨기기
            if (wasResizing) {
                setTimeout(() => {
                    state.element.querySelectorAll('.resize-handle').forEach(handle => {
                        handle.style.opacity = '0';
                    });
                }, 1000);
            }
        }
        
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // 위치/크기 저장
        if (wasDragging || wasResizing) {
            savePositionAndSize();
        }
        
        if (wasDragging) {
            console.log('✅ 드래그 완료');
        }
        if (wasResizing) {
            console.log('✅ 리사이즈 완료');
        }
    }
    
    /**
     * 위치와 크기 저장
     */
    function savePositionAndSize() {
        if (!state.element) return;
        
        const rect = state.element.getBoundingClientRect();
        
        // 위치 저장
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
        
        // 크기 저장
        const size = {
            width: rect.width + 'px',
            height: rect.height + 'px',
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('stickyMemoSize', JSON.stringify(size));
        } catch (e) {
            console.warn('크기 저장 실패:', e);
        }
    }
    
    /**
     * 향상된 스타일 추가
     */
    function addEnhancedStyles() {
        if (document.getElementById('sticky-enhanced-movement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-enhanced-movement-styles';
        style.textContent = `
            /* 스티커 메모 향상된 이동 스타일 */
            #stickyMemo {
                box-sizing: border-box;
            }
            
            #stickyMemo * {
                box-sizing: border-box;
            }
            
            /* 리사이즈 핸들 기본 스타일 */
            .resize-handle {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            
            /* 드래그 중 선택 방지 */
            .dragging * {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            
            /* 리사이즈 중 스타일 */
            .resizing {
                pointer-events: auto !important;
            }
            
            /* 터치 디바이스 지원 */
            @media (hover: none) {
                .resize-handle {
                    opacity: 0.7 !important;
                    background: rgba(0, 123, 255, 0.9) !important;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 향상된 스타일 추가 완료');
    }
    
    /**
     * 공개 API
     */
    window.StickyEnhancedMovement = {
        init: init,
        
        // 설정
        setDragEnabled: (enabled) => CONFIG.dragEnabled = enabled,
        setResizeEnabled: (enabled) => CONFIG.resizeEnabled = enabled,
        
        // 크기 제한 설정
        setSizeConstraints: (minW, maxW, minH, maxH) => {
            CONFIG.minWidth = minW || 200;
            CONFIG.maxWidth = maxW || window.innerWidth * 0.95;
            CONFIG.minHeight = minH || 150;
            CONFIG.maxHeight = maxH || window.innerHeight * 0.95;
            
            if (state.element) {
                applySizeConstraints(state.element);
            }
        },
        
        // 상태 확인
        getState: () => ({...state}),
        getConfig: () => ({...CONFIG}),
        
        // 강제 재설정
        refresh: () => {
            if (state.element) {
                setupStickyMemo(state.element);
            }
        }
    };
    
    /**
     * 디버그 함수
     */
    window.debugStickyMovement = function() {
        console.group('🎯 스티커 메모 이동 시스템 디버그');
        console.log('설정:', CONFIG);
        console.log('상태:', state);
        
        if (state.element) {
            const rect = state.element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(state.element);
            
            console.log('요소 정보:', {
                위치: { left: rect.left, top: rect.top },
                크기: { width: rect.width, height: rect.height },
                스타일: {
                    position: computedStyle.position,
                    cursor: computedStyle.cursor,
                    userSelect: computedStyle.userSelect
                },
                핸들수: state.element.querySelectorAll('.resize-handle').length
            });
        }
        
        console.groupEnd();
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('🎯 스티커 메모 향상된 이동 시스템 준비 완료');
    console.log('🛠️ 디버그: debugStickyMovement()');
    
})();