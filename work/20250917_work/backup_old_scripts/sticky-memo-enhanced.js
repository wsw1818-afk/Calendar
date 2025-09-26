/**
 * 스티커 메모 향상된 드래그 및 리사이즈 시스템
 * 더 넓은 크기 조절 범위와 개선된 드래그 경험
 */

(function() {
    'use strict';
    
    console.log('🎯 스티커 메모 향상 모듈 시작');
    
    // 향상된 설정
    const ENHANCED_CONFIG = {
        // 크기 제한 (훨씬 더 넓은 범위)
        size: {
            minWidth: 150,      // 최소 너비 (기존 250 → 150)
            maxWidth: window.innerWidth * 0.95,  // 최대 너비 (80% → 95%)
            minHeight: 100,     // 최소 높이 (기존 200 → 100)
            maxHeight: window.innerHeight * 0.95  // 최대 높이 (80% → 95%)
        },
        
        // 드래그 설정
        drag: {
            smoothness: 0.92,   // 드래그 부드러움 (0-1)
            magneticEdges: true, // 화면 가장자리 자석 효과
            edgeThreshold: 20,   // 가장자리 자석 거리
            showGuides: true,    // 드래그 가이드라인 표시
            hapticFeedback: true // 진동 피드백 (모바일)
        },
        
        // 리사이즈 설정
        resize: {
            handleSize: 30,      // 리사이즈 핸들 크기 (기존 20 → 30)
            handleOpacity: 0.3,  // 핸들 투명도
            showDimensions: true, // 크기 표시
            gridSnap: false,     // 그리드 스냅
            gridSize: 10,        // 그리드 크기
            aspectRatio: false   // 비율 유지
        },
        
        // 성능 설정
        performance: {
            useRAF: true,        // RequestAnimationFrame 사용
            throttleMs: 8,       // 120fps를 위한 throttle
            useGPU: true,        // GPU 가속
            cacheElements: true  // DOM 캐싱
        },
        
        // 시각 효과
        visual: {
            showShadow: true,    // 드래그 중 그림자
            glowEffect: true,    // 드래그 중 발광 효과
            bounceAnimation: true, // 바운스 애니메이션
            smoothCorners: true   // 부드러운 모서리
        }
    };
    
    // DOM 캐시 및 상태
    let elements = {};
    let dragState = {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        velocityX: 0,
        velocityY: 0,
        lastTime: 0
    };
    
    let resizeState = {
        active: false,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        direction: null // 'se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'
    };
    
    /**
     * 초기화
     */
    function initialize() {
        console.log('📐 향상된 스티커 메모 초기화');
        
        // DOM 요소 캐싱
        cacheElements();
        
        if (elements.stickyMemo) {
            // 기존 기능 개선
            enhanceExistingSticky();
            
            // 새로운 기능 추가
            addMultiDirectionResize();
            addDragGuides();
            addDimensionDisplay();
            addMagneticEdges();
            addVisualEffects();
            
            // 이벤트 설정
            setupEnhancedEvents();
            
            console.log('✅ 스티커 메모 향상 완료');
        } else {
            // 동적 생성 감지
            observeForSticky();
        }
    }
    
    /**
     * DOM 요소 캐싱
     */
    function cacheElements() {
        elements = {
            stickyMemo: document.getElementById('stickyMemo'),
            header: document.getElementById('stickyMemoHeader'),
            content: document.querySelector('.sticky-memo-content'),
            body: document.body
        };
    }
    
    /**
     * 기존 스티커 메모 개선
     */
    function enhanceExistingSticky() {
        if (!elements.stickyMemo) return;
        
        // 크기 제한 업데이트
        elements.stickyMemo.style.minWidth = ENHANCED_CONFIG.size.minWidth + 'px';
        elements.stickyMemo.style.minHeight = ENHANCED_CONFIG.size.minHeight + 'px';
        elements.stickyMemo.style.maxWidth = ENHANCED_CONFIG.size.maxWidth + 'px';
        elements.stickyMemo.style.maxHeight = ENHANCED_CONFIG.size.maxHeight + 'px';
        
        // GPU 가속
        if (ENHANCED_CONFIG.performance.useGPU) {
            elements.stickyMemo.style.transform = 'translateZ(0)';
            elements.stickyMemo.style.backfaceVisibility = 'hidden';
            elements.stickyMemo.style.perspective = '1000px';
        }
        
        // 부드러운 모서리
        if (ENHANCED_CONFIG.visual.smoothCorners) {
            elements.stickyMemo.style.borderRadius = '20px';
        }
    }
    
    /**
     * 다방향 리사이즈 핸들 추가
     */
    function addMultiDirectionResize() {
        if (!elements.stickyMemo) return;
        
        // 8방향 리사이즈 핸들 생성
        const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        
        directions.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${dir}`;
            handle.dataset.direction = dir;
            
            // 스타일 설정
            const styles = getHandleStyles(dir);
            Object.assign(handle.style, styles);
            
            // 호버 효과
            handle.addEventListener('mouseenter', () => {
                handle.style.opacity = '0.6';
                handle.style.backgroundColor = 'rgba(102, 126, 234, 0.5)';
            });
            
            handle.addEventListener('mouseleave', () => {
                handle.style.opacity = ENHANCED_CONFIG.resize.handleOpacity.toString();
                handle.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            });
            
            elements.stickyMemo.appendChild(handle);
        });
    }
    
    /**
     * 리사이즈 핸들 스타일 가져오기
     */
    function getHandleStyles(direction) {
        const size = ENHANCED_CONFIG.resize.handleSize;
        const halfSize = size / 2;
        
        const baseStyle = {
            position: 'absolute',
            opacity: ENHANCED_CONFIG.resize.handleOpacity.toString(),
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: '100',
            transition: 'all 0.2s ease'
        };
        
        const directionStyles = {
            n: {
                top: '0',
                left: '50%',
                width: '60%',
                height: size + 'px',
                transform: 'translateX(-50%)',
                cursor: 'ns-resize'
            },
            s: {
                bottom: '0',
                left: '50%',
                width: '60%',
                height: size + 'px',
                transform: 'translateX(-50%)',
                cursor: 'ns-resize'
            },
            e: {
                right: '0',
                top: '50%',
                width: size + 'px',
                height: '60%',
                transform: 'translateY(-50%)',
                cursor: 'ew-resize'
            },
            w: {
                left: '0',
                top: '50%',
                width: size + 'px',
                height: '60%',
                transform: 'translateY(-50%)',
                cursor: 'ew-resize'
            },
            ne: {
                top: '0',
                right: '0',
                width: size + 'px',
                height: size + 'px',
                cursor: 'nesw-resize',
                borderRadius: '0 20px 0 0'
            },
            nw: {
                top: '0',
                left: '0',
                width: size + 'px',
                height: size + 'px',
                cursor: 'nwse-resize',
                borderRadius: '20px 0 0 0'
            },
            se: {
                bottom: '0',
                right: '0',
                width: size + 'px',
                height: size + 'px',
                cursor: 'nwse-resize',
                borderRadius: '0 0 20px 0',
                background: 'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.2) 40%)'
            },
            sw: {
                bottom: '0',
                left: '0',
                width: size + 'px',
                height: size + 'px',
                cursor: 'nesw-resize',
                borderRadius: '0 0 0 20px'
            }
        };
        
        return { ...baseStyle, ...directionStyles[direction] };
    }
    
    /**
     * 드래그 가이드라인 추가
     */
    function addDragGuides() {
        if (!ENHANCED_CONFIG.drag.showGuides) return;
        
        const guidesContainer = document.createElement('div');
        guidesContainer.id = 'dragGuides';
        guidesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            display: none;
        `;
        
        // 중앙 가이드라인
        const centerX = document.createElement('div');
        centerX.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            width: 1px;
            height: 100%;
            background: rgba(102, 126, 234, 0.3);
            transform: translateX(-50%);
        `;
        
        const centerY = document.createElement('div');
        centerY.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 1px;
            background: rgba(102, 126, 234, 0.3);
            transform: translateY(-50%);
        `;
        
        guidesContainer.appendChild(centerX);
        guidesContainer.appendChild(centerY);
        document.body.appendChild(guidesContainer);
    }
    
    /**
     * 크기 표시 추가
     */
    function addDimensionDisplay() {
        if (!ENHANCED_CONFIG.resize.showDimensions) return;
        
        const display = document.createElement('div');
        display.id = 'dimensionDisplay';
        display.style.cssText = `
            position: fixed;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            pointer-events: none;
            z-index: 10001;
            display: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(display);
    }
    
    /**
     * 자석 효과 추가
     */
    function addMagneticEdges() {
        if (!ENHANCED_CONFIG.drag.magneticEdges) return;
        
        // 화면 가장자리 감지 영역 생성
        const edges = ['top', 'bottom', 'left', 'right'];
        
        edges.forEach(edge => {
            const detector = document.createElement('div');
            detector.className = `edge-detector edge-${edge}`;
            detector.dataset.edge = edge;
            
            const styles = getEdgeDetectorStyles(edge);
            Object.assign(detector.style, styles);
            
            document.body.appendChild(detector);
        });
    }
    
    /**
     * 가장자리 감지기 스타일
     */
    function getEdgeDetectorStyles(edge) {
        const threshold = ENHANCED_CONFIG.drag.edgeThreshold;
        
        const baseStyle = {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '9997',
            background: 'transparent'
        };
        
        const edgeStyles = {
            top: {
                top: '0',
                left: '0',
                width: '100%',
                height: threshold + 'px'
            },
            bottom: {
                bottom: '0',
                left: '0',
                width: '100%',
                height: threshold + 'px'
            },
            left: {
                top: '0',
                left: '0',
                width: threshold + 'px',
                height: '100%'
            },
            right: {
                top: '0',
                right: '0',
                width: threshold + 'px',
                height: '100%'
            }
        };
        
        return { ...baseStyle, ...edgeStyles[edge] };
    }
    
    /**
     * 시각 효과 추가
     */
    function addVisualEffects() {
        if (!elements.stickyMemo) return;
        
        // 드래그 중 효과를 위한 스타일
        const style = document.createElement('style');
        style.textContent = `
            .sticky-memo.dragging {
                ${ENHANCED_CONFIG.visual.showShadow ? 'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;' : ''}
                ${ENHANCED_CONFIG.visual.glowEffect ? 'filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.5));' : ''}
                transform: scale(1.02) translateZ(0);
                transition: none !important;
            }
            
            .sticky-memo.resizing {
                ${ENHANCED_CONFIG.visual.showShadow ? 'box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25) !important;' : ''}
                transition: none !important;
            }
            
            .sticky-memo.magnetic-snap {
                ${ENHANCED_CONFIG.visual.bounceAnimation ? 'animation: magneticSnap 0.3s ease-out;' : ''}
            }
            
            @keyframes magneticSnap {
                0% { transform: scale(1) translateZ(0); }
                50% { transform: scale(1.05) translateZ(0); }
                100% { transform: scale(1) translateZ(0); }
            }
            
            .dimension-label {
                position: absolute;
                background: rgba(102, 126, 234, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-family: monospace;
                pointer-events: none;
                z-index: 10000;
            }
            
            .drag-ghost {
                position: fixed;
                border: 2px dashed rgba(102, 126, 234, 0.5);
                background: rgba(102, 126, 234, 0.1);
                pointer-events: none;
                z-index: 9999;
                border-radius: 20px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 향상된 이벤트 설정
     */
    function setupEnhancedEvents() {
        // 헤더 드래그
        if (elements.header) {
            elements.header.addEventListener('mousedown', handleEnhancedDragStart);
            elements.header.addEventListener('touchstart', handleEnhancedDragStart, { passive: false });
        }
        
        // 리사이즈 핸들
        const handles = document.querySelectorAll('.resize-handle');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', handleEnhancedResizeStart);
            handle.addEventListener('touchstart', handleEnhancedResizeStart, { passive: false });
        });
        
        // 전역 이벤트
        document.addEventListener('mousemove', handleEnhancedMove);
        document.addEventListener('mouseup', handleEnhancedEnd);
        document.addEventListener('touchmove', handleEnhancedMove, { passive: false });
        document.addEventListener('touchend', handleEnhancedEnd);
        
        // 키보드 단축키
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    /**
     * 향상된 드래그 시작
     */
    function handleEnhancedDragStart(e) {
        if (e.target.closest('button, input, textarea')) return;
        
        e.preventDefault();
        dragState.active = true;
        dragState.lastTime = performance.now();
        
        const touch = e.touches ? e.touches[0] : e;
        dragState.startX = touch.clientX;
        dragState.startY = touch.clientY;
        
        const rect = elements.stickyMemo.getBoundingClientRect();
        dragState.currentX = rect.left;
        dragState.currentY = rect.top;
        
        // 시각 효과
        elements.stickyMemo.classList.add('dragging');
        
        // 가이드 표시
        const guides = document.getElementById('dragGuides');
        if (guides) guides.style.display = 'block';
        
        // 고스트 이미지 생성
        createDragGhost(rect);
        
        // 커서 변경
        document.body.style.cursor = 'grabbing';
        elements.header.style.cursor = 'grabbing';
    }
    
    /**
     * 향상된 리사이즈 시작
     */
    function handleEnhancedResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        resizeState.active = true;
        resizeState.direction = e.currentTarget.dataset.direction;
        
        const touch = e.touches ? e.touches[0] : e;
        resizeState.startX = touch.clientX;
        resizeState.startY = touch.clientY;
        
        const rect = elements.stickyMemo.getBoundingClientRect();
        resizeState.startWidth = rect.width;
        resizeState.startHeight = rect.height;
        
        // 시각 효과
        elements.stickyMemo.classList.add('resizing');
        
        // 크기 표시
        showDimensions(rect.width, rect.height);
        
        // 커서 설정
        document.body.style.cursor = e.currentTarget.style.cursor;
    }
    
    /**
     * 향상된 이동 처리
     */
    function handleEnhancedMove(e) {
        if (dragState.active) {
            handleEnhancedDrag(e);
        } else if (resizeState.active) {
            handleEnhancedResize(e);
        }
    }
    
    /**
     * 향상된 드래그 처리
     */
    function handleEnhancedDrag(e) {
        e.preventDefault();
        
        const touch = e.touches ? e.touches[0] : e;
        const currentTime = performance.now();
        const deltaTime = currentTime - dragState.lastTime;
        
        // 새 위치 계산
        let newX = dragState.currentX + (touch.clientX - dragState.startX);
        let newY = dragState.currentY + (touch.clientY - dragState.startY);
        
        // 속도 계산 (관성 효과용)
        if (deltaTime > 0) {
            dragState.velocityX = (newX - dragState.currentX) / deltaTime;
            dragState.velocityY = (newY - dragState.currentY) / deltaTime;
        }
        
        // 자석 효과 적용
        if (ENHANCED_CONFIG.drag.magneticEdges) {
            const magneticPos = applyMagneticEffect(newX, newY);
            newX = magneticPos.x;
            newY = magneticPos.y;
        }
        
        // 경계 제한 (더 유연하게)
        const rect = elements.stickyMemo.getBoundingClientRect();
        const margin = 50; // 화면 밖으로 일부 나갈 수 있음
        
        newX = Math.max(-rect.width + margin, Math.min(window.innerWidth - margin, newX));
        newY = Math.max(-margin, Math.min(window.innerHeight - margin, newY));
        
        // 부드러운 이동 (선택적)
        if (ENHANCED_CONFIG.drag.smoothness < 1) {
            const smooth = ENHANCED_CONFIG.drag.smoothness;
            newX = dragState.currentX + (newX - dragState.currentX) * smooth;
            newY = dragState.currentY + (newY - dragState.currentY) * smooth;
        }
        
        // 위치 적용
        if (ENHANCED_CONFIG.performance.useRAF) {
            requestAnimationFrame(() => {
                elements.stickyMemo.style.left = newX + 'px';
                elements.stickyMemo.style.top = newY + 'px';
                updateDragGhost(newX, newY);
            });
        } else {
            elements.stickyMemo.style.left = newX + 'px';
            elements.stickyMemo.style.top = newY + 'px';
        }
        
        dragState.currentX = newX;
        dragState.currentY = newY;
        dragState.startX = touch.clientX;
        dragState.startY = touch.clientY;
        dragState.lastTime = currentTime;
    }
    
    /**
     * 향상된 리사이즈 처리
     */
    function handleEnhancedResize(e) {
        e.preventDefault();
        
        const touch = e.touches ? e.touches[0] : e;
        const deltaX = touch.clientX - resizeState.startX;
        const deltaY = touch.clientY - resizeState.startY;
        
        let newWidth = resizeState.startWidth;
        let newHeight = resizeState.startHeight;
        let newX = parseFloat(elements.stickyMemo.style.left) || 0;
        let newY = parseFloat(elements.stickyMemo.style.top) || 0;
        
        // 방향에 따른 크기 조정
        switch (resizeState.direction) {
            case 'se': // 남동쪽
                newWidth += deltaX;
                newHeight += deltaY;
                break;
            case 'sw': // 남서쪽
                newWidth -= deltaX;
                newHeight += deltaY;
                newX += deltaX;
                break;
            case 'ne': // 북동쪽
                newWidth += deltaX;
                newHeight -= deltaY;
                newY += deltaY;
                break;
            case 'nw': // 북서쪽
                newWidth -= deltaX;
                newHeight -= deltaY;
                newX += deltaX;
                newY += deltaY;
                break;
            case 'n': // 북쪽
                newHeight -= deltaY;
                newY += deltaY;
                break;
            case 's': // 남쪽
                newHeight += deltaY;
                break;
            case 'e': // 동쪽
                newWidth += deltaX;
                break;
            case 'w': // 서쪽
                newWidth -= deltaX;
                newX += deltaX;
                break;
        }
        
        // 그리드 스냅 (선택적)
        if (ENHANCED_CONFIG.resize.gridSnap) {
            const grid = ENHANCED_CONFIG.resize.gridSize;
            newWidth = Math.round(newWidth / grid) * grid;
            newHeight = Math.round(newHeight / grid) * grid;
        }
        
        // 비율 유지 (선택적)
        if (ENHANCED_CONFIG.resize.aspectRatio && e.shiftKey) {
            const ratio = resizeState.startWidth / resizeState.startHeight;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newHeight = newWidth / ratio;
            } else {
                newWidth = newHeight * ratio;
            }
        }
        
        // 크기 제한 적용 (더 넓은 범위)
        newWidth = Math.max(ENHANCED_CONFIG.size.minWidth, Math.min(newWidth, ENHANCED_CONFIG.size.maxWidth));
        newHeight = Math.max(ENHANCED_CONFIG.size.minHeight, Math.min(newHeight, ENHANCED_CONFIG.size.maxHeight));
        
        // 적용
        if (ENHANCED_CONFIG.performance.useRAF) {
            requestAnimationFrame(() => {
                elements.stickyMemo.style.width = newWidth + 'px';
                elements.stickyMemo.style.height = newHeight + 'px';
                if (resizeState.direction.includes('w')) {
                    elements.stickyMemo.style.left = newX + 'px';
                }
                if (resizeState.direction.includes('n')) {
                    elements.stickyMemo.style.top = newY + 'px';
                }
                updateDimensions(newWidth, newHeight);
            });
        } else {
            elements.stickyMemo.style.width = newWidth + 'px';
            elements.stickyMemo.style.height = newHeight + 'px';
            if (resizeState.direction.includes('w')) {
                elements.stickyMemo.style.left = newX + 'px';
            }
            if (resizeState.direction.includes('n')) {
                elements.stickyMemo.style.top = newY + 'px';
            }
        }
    }
    
    /**
     * 향상된 종료 처리
     */
    function handleEnhancedEnd(e) {
        if (dragState.active) {
            // 관성 효과 (선택적)
            if (Math.abs(dragState.velocityX) > 0.5 || Math.abs(dragState.velocityY) > 0.5) {
                applyInertia();
            }
            
            // 상태 초기화
            dragState.active = false;
            elements.stickyMemo.classList.remove('dragging');
            
            // 가이드 숨기기
            const guides = document.getElementById('dragGuides');
            if (guides) guides.style.display = 'none';
            
            // 고스트 제거
            removeDragGhost();
            
            // 커서 복원
            document.body.style.cursor = '';
            elements.header.style.cursor = 'move';
            
            // 위치 저장
            savePosition();
        }
        
        if (resizeState.active) {
            resizeState.active = false;
            elements.stickyMemo.classList.remove('resizing');
            
            // 크기 표시 숨기기
            hideDimensions();
            
            // 커서 복원
            document.body.style.cursor = '';
            
            // 크기 저장
            saveSize();
        }
    }
    
    /**
     * 자석 효과 적용
     */
    function applyMagneticEffect(x, y) {
        const threshold = ENHANCED_CONFIG.drag.edgeThreshold;
        const rect = elements.stickyMemo.getBoundingClientRect();
        
        let snapX = x;
        let snapY = y;
        
        // 좌측 가장자리
        if (x < threshold) {
            snapX = 0;
            elements.stickyMemo.classList.add('magnetic-snap');
        }
        // 우측 가장자리
        else if (x + rect.width > window.innerWidth - threshold) {
            snapX = window.innerWidth - rect.width;
            elements.stickyMemo.classList.add('magnetic-snap');
        }
        
        // 상단 가장자리
        if (y < threshold) {
            snapY = 0;
            elements.stickyMemo.classList.add('magnetic-snap');
        }
        // 하단 가장자리
        else if (y + rect.height > window.innerHeight - threshold) {
            snapY = window.innerHeight - rect.height;
            elements.stickyMemo.classList.add('magnetic-snap');
        }
        
        // 중앙 스냅 (Ctrl 키를 누르고 있을 때)
        if (event.ctrlKey) {
            const centerX = (window.innerWidth - rect.width) / 2;
            const centerY = (window.innerHeight - rect.height) / 2;
            
            if (Math.abs(x - centerX) < threshold * 2) {
                snapX = centerX;
                elements.stickyMemo.classList.add('magnetic-snap');
            }
            if (Math.abs(y - centerY) < threshold * 2) {
                snapY = centerY;
                elements.stickyMemo.classList.add('magnetic-snap');
            }
        }
        
        setTimeout(() => {
            elements.stickyMemo.classList.remove('magnetic-snap');
        }, 300);
        
        return { x: snapX, y: snapY };
    }
    
    /**
     * 관성 효과 적용
     */
    function applyInertia() {
        const friction = 0.95;
        const minVelocity = 0.1;
        
        function animate() {
            if (Math.abs(dragState.velocityX) > minVelocity || Math.abs(dragState.velocityY) > minVelocity) {
                dragState.currentX += dragState.velocityX * 10;
                dragState.currentY += dragState.velocityY * 10;
                
                // 경계 체크
                const rect = elements.stickyMemo.getBoundingClientRect();
                dragState.currentX = Math.max(0, Math.min(window.innerWidth - rect.width, dragState.currentX));
                dragState.currentY = Math.max(0, Math.min(window.innerHeight - rect.height, dragState.currentY));
                
                elements.stickyMemo.style.left = dragState.currentX + 'px';
                elements.stickyMemo.style.top = dragState.currentY + 'px';
                
                dragState.velocityX *= friction;
                dragState.velocityY *= friction;
                
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 드래그 고스트 생성
     */
    function createDragGhost(rect) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.id = 'dragGhost';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        document.body.appendChild(ghost);
    }
    
    /**
     * 드래그 고스트 업데이트
     */
    function updateDragGhost(x, y) {
        const ghost = document.getElementById('dragGhost');
        if (ghost) {
            ghost.style.left = x + 'px';
            ghost.style.top = y + 'px';
        }
    }
    
    /**
     * 드래그 고스트 제거
     */
    function removeDragGhost() {
        const ghost = document.getElementById('dragGhost');
        if (ghost) {
            ghost.remove();
        }
    }
    
    /**
     * 크기 표시
     */
    function showDimensions(width, height) {
        if (!ENHANCED_CONFIG.resize.showDimensions) return;
        
        const display = document.getElementById('dimensionDisplay');
        if (display) {
            display.textContent = `${Math.round(width)} × ${Math.round(height)}`;
            display.style.display = 'block';
            
            const rect = elements.stickyMemo.getBoundingClientRect();
            display.style.left = (rect.left + rect.width / 2 - display.offsetWidth / 2) + 'px';
            display.style.top = (rect.top - 40) + 'px';
        }
    }
    
    /**
     * 크기 업데이트
     */
    function updateDimensions(width, height) {
        const display = document.getElementById('dimensionDisplay');
        if (display && display.style.display === 'block') {
            display.textContent = `${Math.round(width)} × ${Math.round(height)}`;
            
            const rect = elements.stickyMemo.getBoundingClientRect();
            display.style.left = (rect.left + rect.width / 2 - display.offsetWidth / 2) + 'px';
            display.style.top = (rect.top - 40) + 'px';
        }
    }
    
    /**
     * 크기 표시 숨기기
     */
    function hideDimensions() {
        const display = document.getElementById('dimensionDisplay');
        if (display) {
            display.style.display = 'none';
        }
    }
    
    /**
     * 키보드 단축키 처리
     */
    function handleKeyboardShortcuts(e) {
        if (!elements.stickyMemo) return;
        
        // Alt + 화살표: 미세 이동
        if (e.altKey && !dragState.active && !resizeState.active) {
            const step = e.shiftKey ? 10 : 1; // Shift로 큰 단위 이동
            const rect = elements.stickyMemo.getBoundingClientRect();
            let newX = rect.left;
            let newY = rect.top;
            
            switch (e.key) {
                case 'ArrowLeft':
                    newX -= step;
                    break;
                case 'ArrowRight':
                    newX += step;
                    break;
                case 'ArrowUp':
                    newY -= step;
                    break;
                case 'ArrowDown':
                    newY += step;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            elements.stickyMemo.style.left = newX + 'px';
            elements.stickyMemo.style.top = newY + 'px';
            savePosition();
        }
        
        // Ctrl + Alt + 화살표: 크기 조절
        if (e.ctrlKey && e.altKey && !resizeState.active) {
            const step = e.shiftKey ? 20 : 5;
            const rect = elements.stickyMemo.getBoundingClientRect();
            let newWidth = rect.width;
            let newHeight = rect.height;
            
            switch (e.key) {
                case 'ArrowLeft':
                    newWidth -= step;
                    break;
                case 'ArrowRight':
                    newWidth += step;
                    break;
                case 'ArrowUp':
                    newHeight -= step;
                    break;
                case 'ArrowDown':
                    newHeight += step;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            newWidth = Math.max(ENHANCED_CONFIG.size.minWidth, Math.min(newWidth, ENHANCED_CONFIG.size.maxWidth));
            newHeight = Math.max(ENHANCED_CONFIG.size.minHeight, Math.min(newHeight, ENHANCED_CONFIG.size.maxHeight));
            
            elements.stickyMemo.style.width = newWidth + 'px';
            elements.stickyMemo.style.height = newHeight + 'px';
            saveSize();
        }
    }
    
    /**
     * 위치 저장
     */
    function savePosition() {
        const rect = elements.stickyMemo.getBoundingClientRect();
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
    function saveSize() {
        const size = {
            width: elements.stickyMemo.style.width,
            height: elements.stickyMemo.style.height,
            timestamp: Date.now()
        };
        localStorage.setItem('stickyMemoSize', JSON.stringify(size));
    }
    
    /**
     * 동적 생성 감지
     */
    function observeForSticky() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'stickyMemo' || (node.querySelector && node.querySelector('#stickyMemo'))) {
                        observer.disconnect();
                        setTimeout(initialize, 100);
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    // 전역 API 제공
    window.StickyMemoEnhanced = {
        getConfig: () => ENHANCED_CONFIG,
        updateConfig: (newConfig) => {
            Object.assign(ENHANCED_CONFIG, newConfig);
            console.log('📐 설정 업데이트됨:', ENHANCED_CONFIG);
        },
        resetPosition: () => {
            if (elements.stickyMemo) {
                elements.stickyMemo.style.left = '50%';
                elements.stickyMemo.style.top = '50%';
                elements.stickyMemo.style.transform = 'translate(-50%, -50%)';
                savePosition();
            }
        },
        resetSize: () => {
            if (elements.stickyMemo) {
                elements.stickyMemo.style.width = '350px';
                elements.stickyMemo.style.height = '400px';
                saveSize();
            }
        }
    };
    
    console.log('✨ 스티커 메모 향상 모듈 로드 완료');
    
})();