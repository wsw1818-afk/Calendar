/**
 * 스티커 메모 완전 자유 이동 시스템
 * 제한 없는 자유로운 이동과 다양한 조작 방법 제공
 */

(function() {
    'use strict';
    
    console.log('🕊️ 스티커 메모 자유 이동 시스템 시작');
    
    // 자유 이동 설정
    const FREEDOM_CONFIG = {
        // 이동 제한 완전 해제
        movement: {
            allowOutOfBounds: true,      // 화면 밖으로 완전히 나갈 수 있음
            multiTouch: true,             // 멀티터치 지원
            rightClickDrag: true,         // 우클릭 드래그
            middleClickDrag: true,        // 중간 버튼 드래그
            doubleTapMove: true,          // 더블탭으로 이동
            keyboardMove: true,           // 키보드 이동
            scrollWheelMove: true,        // 스크롤 휠로 이동
            voiceControl: false,          // 음성 제어 (실험적)
            gestureControl: true,         // 제스처 제어
            joystickMode: true,           // 가상 조이스틱
            magneticCorners: false,       // 모서리 자석 효과 끄기
            gridSnap: false,              // 그리드 스냅 끄기
            rotationEnabled: true,        // 회전 가능
            depthControl: true            // Z축 이동 (레이어)
        },
        
        // 이동 속도 및 가속
        physics: {
            baseSpeed: 1.0,               // 기본 속도
            acceleration: 1.2,            // 가속도
            maxSpeed: 50,                 // 최대 속도
            friction: 0.95,               // 마찰력
            bounce: true,                 // 벽 튕기기
            gravity: false,               // 중력 효과
            momentum: true,               // 운동량 보존
            smoothing: 0.9               // 부드러움 정도
        },
        
        // 특수 이동 모드
        modes: {
            freeFloat: true,              // 자유 부유 모드
            teleport: true,               // 텔레포트 모드
            orbit: false,                 // 궤도 이동
            snake: false,                 // 뱀처럼 이동
            magnetic: false,              // 자석 모드
            ghost: true,                  // 고스트 모드 (다른 요소 통과)
            sticky: false,                // 끈적이는 모드
            elastic: true                 // 탄성 모드
        },
        
        // 단축키 설정
        shortcuts: {
            teleportKey: 'T',             // 텔레포트
            freeFloatKey: 'F',            // 자유 부유
            resetKey: 'R',                // 위치 리셋
            randomKey: 'X',               // 랜덤 위치
            cornerKeys: ['1','2','3','4'], // 모서리로 이동
            speedUpKey: 'Shift',          // 속도 증가
            slowDownKey: 'Alt',           // 속도 감소
            rotateKey: 'Ctrl'             // 회전
        },
        
        // 시각 효과
        visual: {
            trail: true,                  // 이동 궤적
            ripple: true,                 // 물결 효과
            glow: true,                   // 발광 효과
            shadow: true,                 // 그림자
            blur: false,                  // 모션 블러
            particles: false,             // 파티클 효과
            shake: false,                 // 흔들림 효과
            pulse: true                   // 맥박 효과
        }
    };
    
    // 상태 관리
    let state = {
        element: null,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        isDragging: false,
        dragMode: 'normal',
        touchPoints: [],
        trail: [],
        joystick: null,
        floatAnimation: null
    };
    
    /**
     * 초기화
     */
    function initialize() {
        console.log('🚀 자유 이동 시스템 초기화');
        
        // 스티커 메모 찾기
        findStickyMemo();
        
        if (state.element) {
            // 기본 스타일 설정
            setupBaseStyles();
            
            // 모든 이동 방법 활성화
            enableMouseDrag();
            enableTouchDrag();
            enableKeyboardControl();
            enableScrollControl();
            enableGestures();
            enableJoystick();
            enableSpecialModes();
            
            // 시각 효과 적용
            applyVisualEffects();
            
            // 디버그 패널 생성
            createDebugPanel();
            
            console.log('✅ 자유 이동 시스템 준비 완료');
        } else {
            observeForSticky();
        }
    }
    
    /**
     * 스티커 메모 찾기
     */
    function findStickyMemo() {
        state.element = document.getElementById('stickyMemo');
        if (state.element) {
            const rect = state.element.getBoundingClientRect();
            state.position.x = rect.left;
            state.position.y = rect.top;
        }
    }
    
    /**
     * 기본 스타일 설정
     */
    function setupBaseStyles() {
        if (!state.element) return;
        
        // 절대 위치 설정
        state.element.style.position = 'fixed';
        
        // 이동 제한 해제
        if (FREEDOM_CONFIG.movement.allowOutOfBounds) {
            state.element.style.overflow = 'visible';
            document.body.style.overflow = 'visible';
        }
        
        // 트랜지션 설정
        state.element.style.transition = 'none';
        
        // 트랜스폼 기원점
        state.element.style.transformOrigin = 'center center';
        
        // GPU 가속
        state.element.style.willChange = 'transform';
        state.element.style.transform = 'translateZ(0)';
        
        // 터치 액션 설정
        state.element.style.touchAction = 'none';
        
        // 사용자 선택 방지
        state.element.style.userSelect = 'none';
        
        // Z-index 높이기
        state.element.style.zIndex = '99999';
    }
    
    /**
     * 마우스 드래그 활성화
     */
    function enableMouseDrag() {
        if (!state.element) return;
        
        // 모든 마우스 버튼 지원
        state.element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            // 어느 버튼이든 드래그 가능
            if (e.button === 0 || // 왼쪽
                (e.button === 1 && FREEDOM_CONFIG.movement.middleClickDrag) || // 중간
                (e.button === 2 && FREEDOM_CONFIG.movement.rightClickDrag)) { // 오른쪽
                
                startDrag(e.clientX, e.clientY, e.button);
            }
        });
        
        // 우클릭 메뉴 방지
        if (FREEDOM_CONFIG.movement.rightClickDrag) {
            state.element.addEventListener('contextmenu', e => e.preventDefault());
        }
    }
    
    /**
     * 터치 드래그 활성화
     */
    function enableTouchDrag() {
        if (!state.element) return;
        
        state.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // 멀티터치 저장
            state.touchPoints = Array.from(e.touches).map(touch => ({
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY
            }));
            
            if (e.touches.length === 1) {
                // 단일 터치 - 이동
                startDrag(e.touches[0].clientX, e.touches[0].clientY, 'touch');
            } else if (e.touches.length === 2 && FREEDOM_CONFIG.movement.multiTouch) {
                // 두 손가락 - 회전/확대
                handleMultiTouch(e.touches);
            }
        }, { passive: false });
        
        // 더블탭 이동
        if (FREEDOM_CONFIG.movement.doubleTapMove) {
            let lastTap = 0;
            state.element.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTap < 300) {
                    teleportToPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                }
                lastTap = now;
            });
        }
    }
    
    /**
     * 키보드 제어 활성화
     */
    function enableKeyboardControl() {
        if (!FREEDOM_CONFIG.movement.keyboardMove) return;
        
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            
            // 특수 모드 단축키
            if (e.key === FREEDOM_CONFIG.shortcuts.teleportKey) {
                enableTeleportMode();
            } else if (e.key === FREEDOM_CONFIG.shortcuts.freeFloatKey) {
                toggleFreeFloat();
            } else if (e.key === FREEDOM_CONFIG.shortcuts.resetKey) {
                resetPosition();
            } else if (e.key === FREEDOM_CONFIG.shortcuts.randomKey) {
                randomPosition();
            }
            
            // 모서리 이동
            FREEDOM_CONFIG.shortcuts.cornerKeys.forEach((key, index) => {
                if (e.key === key) {
                    moveToCorner(index);
                }
            });
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
        
        // 지속적인 키보드 이동
        setInterval(() => {
            if (!state.element) return;
            
            let dx = 0, dy = 0;
            const speed = keys[FREEDOM_CONFIG.shortcuts.speedUpKey] ? 10 : 
                         keys[FREEDOM_CONFIG.shortcuts.slowDownKey] ? 1 : 5;
            
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= speed;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += speed;
            if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= speed;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += speed;
            
            // 대각선 이동
            if (keys['q'] || keys['Q']) { dx -= speed; dy -= speed; }
            if (keys['e'] || keys['E']) { dx += speed; dy -= speed; }
            if (keys['z'] || keys['Z']) { dx -= speed; dy += speed; }
            if (keys['c'] || keys['C']) { dx += speed; dy += speed; }
            
            // 회전
            if (keys[FREEDOM_CONFIG.shortcuts.rotateKey]) {
                if (keys['ArrowLeft']) state.rotation -= 2;
                if (keys['ArrowRight']) state.rotation += 2;
            }
            
            if (dx !== 0 || dy !== 0) {
                moveBy(dx, dy);
            }
        }, 16); // 60fps
    }
    
    /**
     * 스크롤 휠 제어
     */
    function enableScrollControl() {
        if (!FREEDOM_CONFIG.movement.scrollWheelMove) return;
        
        state.element.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (e.ctrlKey) {
                // Ctrl + 휠 = 확대/축소
                const scale = e.deltaY > 0 ? 0.9 : 1.1;
                state.scale *= scale;
                state.scale = Math.max(0.1, Math.min(state.scale, 5));
                updateTransform();
            } else if (e.shiftKey) {
                // Shift + 휠 = 수평 이동
                moveBy(-e.deltaY, 0);
            } else {
                // 일반 휠 = 수직 이동
                moveBy(-e.deltaX, -e.deltaY);
            }
        }, { passive: false });
    }
    
    /**
     * 제스처 제어
     */
    function enableGestures() {
        if (!FREEDOM_CONFIG.movement.gestureControl) return;
        
        let gestureStart = null;
        
        state.element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 3) {
                // 세 손가락 - 특수 제스처
                gestureStart = {
                    touches: Array.from(e.touches),
                    time: Date.now()
                };
            }
        });
        
        state.element.addEventListener('touchmove', (e) => {
            if (gestureStart && e.touches.length === 3) {
                // 세 손가락 스와이프
                const deltaY = e.touches[0].clientY - gestureStart.touches[0].clientY;
                
                if (Math.abs(deltaY) > 50) {
                    if (deltaY > 0) {
                        // 아래로 스와이프 - 최소화
                        minimize();
                    } else {
                        // 위로 스와이프 - 최대화
                        maximize();
                    }
                    gestureStart = null;
                }
            }
        });
        
        // 네 손가락 탭 - 숨기기/보이기
        state.element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 4) {
                toggleVisibility();
            }
        });
    }
    
    /**
     * 가상 조이스틱
     */
    function enableJoystick() {
        if (!FREEDOM_CONFIG.movement.joystickMode) return;
        
        const joystick = document.createElement('div');
        joystick.id = 'stickyJoystick';
        joystick.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 120px;
            height: 120px;
            background: rgba(102, 126, 234, 0.2);
            border: 2px solid rgba(102, 126, 234, 0.5);
            border-radius: 50%;
            display: none;
            z-index: 100000;
            touch-action: none;
        `;
        
        const stick = document.createElement('div');
        stick.style.cssText = `
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(102, 126, 234, 0.8);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            transition: none;
        `;
        
        joystick.appendChild(stick);
        document.body.appendChild(joystick);
        
        let joystickActive = false;
        let joystickCenter = { x: 0, y: 0 };
        
        // 조이스틱 토글 버튼
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '🕹️';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 150px;
            right: 50px;
            width: 40px;
            height: 40px;
            background: rgba(102, 126, 234, 0.8);
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 100000;
        `;
        
        toggleBtn.onclick = () => {
            joystick.style.display = joystick.style.display === 'none' ? 'block' : 'none';
            if (joystick.style.display === 'block') {
                const rect = joystick.getBoundingClientRect();
                joystickCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
        };
        
        document.body.appendChild(toggleBtn);
        
        // 조이스틱 제어
        joystick.addEventListener('touchstart', (e) => {
            joystickActive = true;
            handleJoystickMove(e.touches[0]);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            if (joystickActive) {
                handleJoystickMove(e.touches[0]);
            }
        });
        
        joystick.addEventListener('touchend', () => {
            joystickActive = false;
            stick.style.left = '50%';
            stick.style.top = '50%';
            state.velocity = { x: 0, y: 0 };
        });
        
        function handleJoystickMove(touch) {
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 40;
            
            let x = dx;
            let y = dy;
            
            if (distance > maxDistance) {
                x = (dx / distance) * maxDistance;
                y = (dy / distance) * maxDistance;
            }
            
            stick.style.left = `${50 + (x / 60) * 50}%`;
            stick.style.top = `${50 + (y / 60) * 50}%`;
            
            // 속도 설정
            state.velocity.x = x / maxDistance * 5;
            state.velocity.y = y / maxDistance * 5;
        }
        
        // 조이스틱 업데이트 루프
        setInterval(() => {
            if (joystickActive && state.element) {
                moveBy(state.velocity.x, state.velocity.y);
            }
        }, 16);
        
        state.joystick = joystick;
    }
    
    /**
     * 특수 모드 활성화
     */
    function enableSpecialModes() {
        // 자유 부유 모드
        if (FREEDOM_CONFIG.modes.freeFloat) {
            createFreeFloatMode();
        }
        
        // 텔레포트 모드
        if (FREEDOM_CONFIG.modes.teleport) {
            createTeleportMode();
        }
        
        // 탄성 모드
        if (FREEDOM_CONFIG.modes.elastic) {
            createElasticMode();
        }
        
        // 고스트 모드
        if (FREEDOM_CONFIG.modes.ghost) {
            createGhostMode();
        }
    }
    
    /**
     * 자유 부유 모드
     */
    function createFreeFloatMode() {
        let floating = false;
        
        window.toggleFreeFloat = () => {
            floating = !floating;
            
            if (floating) {
                let time = 0;
                state.floatAnimation = setInterval(() => {
                    time += 0.05;
                    const x = Math.sin(time) * 20;
                    const y = Math.cos(time * 0.7) * 15;
                    const rotation = Math.sin(time * 0.3) * 5;
                    
                    state.element.style.transform = `
                        translate(${state.position.x + x}px, ${state.position.y + y}px)
                        rotate(${rotation}deg)
                        scale(${state.scale})
                    `;
                }, 16);
                
                showNotification('자유 부유 모드 ON 🎈');
            } else {
                clearInterval(state.floatAnimation);
                updateTransform();
                showNotification('자유 부유 모드 OFF');
            }
        };
    }
    
    /**
     * 텔레포트 모드
     */
    function createTeleportMode() {
        window.enableTeleportMode = () => {
            document.body.style.cursor = 'crosshair';
            
            const teleportHandler = (e) => {
                teleportToPoint(e.clientX, e.clientY);
                document.body.style.cursor = '';
                document.removeEventListener('click', teleportHandler);
            };
            
            document.addEventListener('click', teleportHandler);
            showNotification('클릭하여 텔레포트! ⚡');
        };
    }
    
    /**
     * 탄성 모드
     */
    function createElasticMode() {
        let elasticEnabled = false;
        
        window.toggleElastic = () => {
            elasticEnabled = !elasticEnabled;
            
            if (elasticEnabled) {
                state.element.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                showNotification('탄성 모드 ON 🎾');
            } else {
                state.element.style.transition = 'none';
                showNotification('탄성 모드 OFF');
            }
        };
    }
    
    /**
     * 고스트 모드
     */
    function createGhostMode() {
        let ghostEnabled = false;
        
        window.toggleGhost = () => {
            ghostEnabled = !ghostEnabled;
            
            if (ghostEnabled) {
                state.element.style.opacity = '0.5';
                state.element.style.pointerEvents = 'none';
                showNotification('고스트 모드 ON 👻');
            } else {
                state.element.style.opacity = '1';
                state.element.style.pointerEvents = 'auto';
                showNotification('고스트 모드 OFF');
            }
        };
    }
    
    /**
     * 시각 효과 적용
     */
    function applyVisualEffects() {
        if (!state.element) return;
        
        // 스타일 생성
        const style = document.createElement('style');
        style.textContent = `
            #stickyMemo {
                ${FREEDOM_CONFIG.visual.shadow ? 'filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));' : ''}
            }
            
            #stickyMemo.dragging {
                ${FREEDOM_CONFIG.visual.glow ? 'box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);' : ''}
                ${FREEDOM_CONFIG.visual.pulse ? 'animation: pulse 1s infinite;' : ''}
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .movement-trail {
                position: fixed;
                width: 10px;
                height: 10px;
                background: rgba(102, 126, 234, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 99998;
                animation: fadeOut 1s forwards;
            }
            
            @keyframes fadeOut {
                to { opacity: 0; transform: scale(0); }
            }
            
            .ripple-effect {
                position: fixed;
                border: 2px solid rgba(102, 126, 234, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 99997;
                animation: ripple 0.6s ease-out forwards;
            }
            
            @keyframes ripple {
                to {
                    width: 100px;
                    height: 100px;
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // 이동 궤적
        if (FREEDOM_CONFIG.visual.trail) {
            setInterval(() => {
                if (state.isDragging) {
                    createTrail(state.position.x, state.position.y);
                }
            }, 50);
        }
    }
    
    /**
     * 드래그 시작
     */
    function startDrag(x, y, button) {
        state.isDragging = true;
        state.dragMode = button === 2 ? 'rotate' : 'move';
        
        const rect = state.element.getBoundingClientRect();
        state.dragOffset = {
            x: x - rect.left,
            y: y - rect.top
        };
        
        state.element.classList.add('dragging');
        
        // 물결 효과
        if (FREEDOM_CONFIG.visual.ripple) {
            createRipple(x, y);
        }
    }
    
    /**
     * 이동 처리
     */
    function handleMove(e) {
        if (!state.isDragging) return;
        
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (state.dragMode === 'move') {
            const newX = x - state.dragOffset.x;
            const newY = y - state.dragOffset.y;
            
            // 물리 효과 적용
            if (FREEDOM_CONFIG.physics.momentum) {
                state.velocity.x = (newX - state.position.x) * 0.1;
                state.velocity.y = (newY - state.position.y) * 0.1;
            }
            
            moveTo(newX, newY);
        } else if (state.dragMode === 'rotate') {
            // 회전
            const centerX = state.position.x + state.element.offsetWidth / 2;
            const centerY = state.position.y + state.element.offsetHeight / 2;
            const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
            state.rotation = angle;
            updateTransform();
        }
    }
    
    /**
     * 드래그 종료
     */
    function endDrag() {
        state.isDragging = false;
        state.element.classList.remove('dragging');
        
        // 관성 효과
        if (FREEDOM_CONFIG.physics.momentum && 
            (Math.abs(state.velocity.x) > 0.5 || Math.abs(state.velocity.y) > 0.5)) {
            applyMomentum();
        }
    }
    
    /**
     * 절대 위치로 이동
     */
    function moveTo(x, y) {
        // 제한 없음 - 완전 자유 이동
        if (!FREEDOM_CONFIG.movement.allowOutOfBounds) {
            // 최소한의 제한만 (옵션)
            const margin = 100;
            x = Math.max(-state.element.offsetWidth + margin, 
                Math.min(window.innerWidth - margin, x));
            y = Math.max(-state.element.offsetHeight + margin, 
                Math.min(window.innerHeight - margin, y));
        }
        
        state.position.x = x;
        state.position.y = y;
        updateTransform();
    }
    
    /**
     * 상대 위치로 이동
     */
    function moveBy(dx, dy) {
        moveTo(state.position.x + dx, state.position.y + dy);
    }
    
    /**
     * 텔레포트
     */
    function teleportToPoint(x, y) {
        // 순간이동 효과
        const oldPos = { ...state.position };
        
        state.position.x = x - state.element.offsetWidth / 2;
        state.position.y = y - state.element.offsetHeight / 2;
        
        // 텔레포트 이펙트
        createTeleportEffect(oldPos, state.position);
        
        updateTransform();
    }
    
    /**
     * 모서리로 이동
     */
    function moveToCorner(index) {
        const corners = [
            { x: 0, y: 0 }, // 좌상단
            { x: window.innerWidth - state.element.offsetWidth, y: 0 }, // 우상단
            { x: 0, y: window.innerHeight - state.element.offsetHeight }, // 좌하단
            { x: window.innerWidth - state.element.offsetWidth, 
              y: window.innerHeight - state.element.offsetHeight } // 우하단
        ];
        
        if (corners[index]) {
            moveTo(corners[index].x, corners[index].y);
        }
    }
    
    /**
     * 랜덤 위치
     */
    function randomPosition() {
        const x = Math.random() * (window.innerWidth - state.element.offsetWidth);
        const y = Math.random() * (window.innerHeight - state.element.offsetHeight);
        moveTo(x, y);
        
        showNotification('랜덤 위치! 🎲');
    }
    
    /**
     * 위치 리셋
     */
    function resetPosition() {
        state.position = { x: window.innerWidth / 2 - state.element.offsetWidth / 2, 
                          y: window.innerHeight / 2 - state.element.offsetHeight / 2, 
                          z: 0 };
        state.rotation = 0;
        state.scale = 1;
        updateTransform();
        
        showNotification('위치 리셋! 🔄');
    }
    
    /**
     * 트랜스폼 업데이트
     */
    function updateTransform() {
        if (!state.element) return;
        
        state.element.style.transform = `
            translate(${state.position.x}px, ${state.position.y}px)
            rotate(${state.rotation}deg)
            scale(${state.scale})
            translateZ(${state.position.z}px)
        `;
    }
    
    /**
     * 관성 효과
     */
    function applyMomentum() {
        const animate = () => {
            if (Math.abs(state.velocity.x) > 0.1 || Math.abs(state.velocity.y) > 0.1) {
                moveBy(state.velocity.x, state.velocity.y);
                
                // 마찰력 적용
                state.velocity.x *= FREEDOM_CONFIG.physics.friction;
                state.velocity.y *= FREEDOM_CONFIG.physics.friction;
                
                // 벽 튕기기
                if (FREEDOM_CONFIG.physics.bounce) {
                    const rect = state.element.getBoundingClientRect();
                    
                    if (rect.left <= 0 || rect.right >= window.innerWidth) {
                        state.velocity.x = -state.velocity.x * 0.8;
                    }
                    if (rect.top <= 0 || rect.bottom >= window.innerHeight) {
                        state.velocity.y = -state.velocity.y * 0.8;
                    }
                }
                
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 이동 궤적 생성
     */
    function createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'movement-trail';
        trail.style.left = (x + state.element.offsetWidth / 2) + 'px';
        trail.style.top = (y + state.element.offsetHeight / 2) + 'px';
        
        document.body.appendChild(trail);
        
        setTimeout(() => trail.remove(), 1000);
    }
    
    /**
     * 물결 효과
     */
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = (x - 10) + 'px';
        ripple.style.top = (y - 10) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    /**
     * 텔레포트 효과
     */
    function createTeleportEffect(oldPos, newPos) {
        // 출발 지점 효과
        const startEffect = document.createElement('div');
        startEffect.style.cssText = `
            position: fixed;
            left: ${oldPos.x}px;
            top: ${oldPos.y}px;
            width: ${state.element.offsetWidth}px;
            height: ${state.element.offsetHeight}px;
            border: 2px solid rgba(102, 126, 234, 0.8);
            background: rgba(102, 126, 234, 0.2);
            border-radius: 20px;
            pointer-events: none;
            z-index: 99998;
            animation: teleportOut 0.5s ease-out forwards;
        `;
        
        // 도착 지점 효과
        const endEffect = document.createElement('div');
        endEffect.style.cssText = `
            position: fixed;
            left: ${newPos.x}px;
            top: ${newPos.y}px;
            width: ${state.element.offsetWidth}px;
            height: ${state.element.offsetHeight}px;
            border: 2px solid rgba(102, 126, 234, 0.8);
            background: rgba(102, 126, 234, 0.2);
            border-radius: 20px;
            pointer-events: none;
            z-index: 99998;
            animation: teleportIn 0.5s ease-in forwards;
        `;
        
        document.body.appendChild(startEffect);
        document.body.appendChild(endEffect);
        
        setTimeout(() => {
            startEffect.remove();
            endEffect.remove();
        }, 500);
    }
    
    /**
     * 알림 표시
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 100001;
            animation: slideDown 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    /**
     * 디버그 패널 생성
     */
    function createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'stickyDebugPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 11px;
            z-index: 100000;
            display: none;
        `;
        
        document.body.appendChild(panel);
        
        // F12로 토글
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // 디버그 정보 업데이트
        setInterval(() => {
            if (panel.style.display !== 'none' && state.element) {
                panel.innerHTML = `
                    <div>📍 Position: (${Math.round(state.position.x)}, ${Math.round(state.position.y)})</div>
                    <div>🎯 Velocity: (${state.velocity.x.toFixed(2)}, ${state.velocity.y.toFixed(2)})</div>
                    <div>🔄 Rotation: ${state.rotation.toFixed(1)}°</div>
                    <div>📏 Scale: ${state.scale.toFixed(2)}</div>
                    <div>🖱️ Dragging: ${state.isDragging}</div>
                    <div>⚡ Mode: ${state.dragMode}</div>
                `;
            }
        }, 100);
    }
    
    /**
     * 전역 이벤트 설정
     */
    function setupGlobalEvents() {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        // 애니메이션 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes teleportOut {
                to {
                    transform: scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes teleportIn {
                from {
                    transform: scale(0) rotate(-360deg);
                    opacity: 0;
                }
            }
            
            @keyframes slideDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
            }
            
            @keyframes slideUp {
                to {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 동적 생성 감지
     */
    function observeForSticky() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'stickyMemo') {
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
    
    // 최소화/최대화 함수
    function minimize() {
        state.element.style.height = '40px';
        showNotification('최소화 📉');
    }
    
    function maximize() {
        state.element.style.width = '80vw';
        state.element.style.height = '80vh';
        showNotification('최대화 📈');
    }
    
    function toggleVisibility() {
        const isVisible = state.element.style.display !== 'none';
        state.element.style.display = isVisible ? 'none' : 'flex';
        showNotification(isVisible ? '숨김 👁️‍🗨️' : '표시 👁️');
    }
    
    // 멀티터치 처리
    function handleMultiTouch(touches) {
        if (touches.length === 2) {
            const dx = touches[1].clientX - touches[0].clientX;
            const dy = touches[1].clientY - touches[0].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // 핀치 줌
            if (state.lastPinchDistance) {
                const scale = distance / state.lastPinchDistance;
                state.scale *= scale;
                state.scale = Math.max(0.5, Math.min(state.scale, 3));
                updateTransform();
            }
            state.lastPinchDistance = distance;
            
            // 회전
            if (state.lastPinchAngle) {
                const rotation = angle - state.lastPinchAngle;
                state.rotation += rotation;
                updateTransform();
            }
            state.lastPinchAngle = angle;
        }
    }
    
    // 초기화 및 전역 이벤트 설정
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initialize();
            setupGlobalEvents();
        });
    } else {
        setTimeout(() => {
            initialize();
            setupGlobalEvents();
        }, 100);
    }
    
    // 전역 API 제공
    window.StickyFreedom = {
        config: FREEDOM_CONFIG,
        state: state,
        moveTo: moveTo,
        moveBy: moveBy,
        teleport: teleportToPoint,
        reset: resetPosition,
        random: randomPosition,
        toggleFloat: () => window.toggleFreeFloat && window.toggleFreeFloat(),
        toggleGhost: () => window.toggleGhost && window.toggleGhost(),
        toggleElastic: () => window.toggleElastic && window.toggleElastic(),
        enableTeleport: () => window.enableTeleportMode && window.enableTeleportMode(),
        moveToCorner: moveToCorner,
        showNotification: showNotification
    };
    
    console.log('🎉 스티커 메모 완전 자유 이동 시스템 준비 완료!');
    console.log('사용 가능한 조작법:');
    console.log('- 마우스: 좌/우/중간 클릭 드래그');
    console.log('- 키보드: 화살표, WASD, QEZC (대각선)');
    console.log('- 터치: 1손가락(이동), 2손가락(회전/확대), 3손가락(제스처), 4손가락(토글)');
    console.log('- 스크롤: 휠(수직), Shift+휠(수평), Ctrl+휠(확대/축소)');
    console.log('- 단축키: T(텔레포트), F(부유), R(리셋), X(랜덤), 1-4(모서리)');
    console.log('- 조이스틱: 우측 하단 🕹️ 버튼');
    console.log('- F12: 디버그 패널');
    
})();