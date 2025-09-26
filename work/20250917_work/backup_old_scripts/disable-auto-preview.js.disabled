/**
 * 자동 미리보기 비활성화
 * - 메뉴 클릭 시 달력이 변형되는 문제 해결
 * - 미리보기 모드 자동 활성화 방지
 * - 달력 원본 모양 유지 보장
 */

(function() {
    'use strict';
    
    console.log('🚫 자동 미리보기 비활성화 시작');
    
    // ========== 1. 미리보기 시스템 완전 비활성화 ==========
    function disableAllPreviewSystems() {
        console.log('🔒 모든 미리보기 시스템 비활성화');
        
        // 기존 미리보기 함수들 무력화
        const previewFunctions = [
            'enablePreview',
            'disablePreview', 
            'toggleSafePreview',
            'togglePreview',
            'showPreview',
            'hidePreview'
        ];
        
        previewFunctions.forEach(funcName => {
            window[funcName] = function() {
                console.log(`🚫 ${funcName} 호출 차단됨`);
                return false;
            };
        });
        
        // 미리보기 관련 객체들 무력화
        if (window.PreviewControl) {
            window.PreviewControl.enable = () => { console.log('🚫 PreviewControl.enable 차단됨'); return false; };
            window.PreviewControl.disable = () => { console.log('✅ PreviewControl.disable 허용됨'); return true; };
            window.PreviewControl.isEnabled = () => false;
        }
        
        if (window.StablePreview) {
            window.StablePreview.isActive = false;
            window.StablePreview.isTransitioning = false;
        }
        
        if (window.stablePreview) {
            window.stablePreview.enable = () => { console.log('🚫 stablePreview.enable 차단됨'); return false; };
            window.stablePreview.toggle = () => { console.log('🚫 stablePreview.toggle 차단됨'); return false; };
        }
        
        console.log('✅ 미리보기 시스템 비활성화 완료');
    }
    
    // ========== 2. 달력 변형 방지 CSS ==========
    function applyAntiDeformationCSS() {
        console.log('🛡️ 달력 변형 방지 CSS 적용');
        
        const style = document.createElement('style');
        style.id = 'antiDeformationCSS';
        style.textContent = `
            /* 달력 및 컨테이너 원본 모양 고정 */
            body,
            .container,
            .calendar-container,
            #calendar,
            .calendar {
                transform: none !important;
                scale: 1 !important;
                zoom: 1 !important;
                width: auto !important;
                height: auto !important;
                overflow: visible !important;
                position: static !important;
            }
            
            /* body 스케일 강제 제거 */
            body[style*="transform"],
            body[style*="scale"] {
                transform: none !important;
                scale: 1 !important;
            }
            
            /* 미리보기 관련 클래스 무력화 */
            .safe-preview-mode,
            .preview-mode,
            .unified-preview-mode {
                transform: none !important;
                scale: 1 !important;
            }
            
            /* 컨테이너 변형 방지 */
            .container[style*="transform"],
            .calendar-container[style*="transform"],
            #calendar[style*="transform"] {
                transform: none !important;
                scale: 1 !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 auto !important;
                position: relative !important;
            }
            
            /* 메뉴 버튼들 정상 작동 보장 */
            .menu-button,
            .control-button,
            [id$="Btn"],
            button {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1000 !important;
                position: relative !important;
                transform: none !important;
                scale: 1 !important;
            }
            
            /* 달력 그리드 고정 */
            .calendar-grid,
            .calendar-table,
            table {
                width: 100% !important;
                height: auto !important;
                transform: none !important;
                scale: 1 !important;
            }
        `;
        
        // 기존 스타일 제거 후 추가
        const existing = document.getElementById('antiDeformationCSS');
        if (existing) existing.remove();
        document.head.appendChild(style);
        
        console.log('✅ 달력 변형 방지 CSS 적용 완료');
    }
    
    // ========== 3. 실시간 변형 감지 및 복구 ==========
    function setupDeformationMonitoring() {
        console.log('👁️ 달력 변형 감지 설정');
        
        const checkAndRestore = () => {
            // body 변형 체크
            const body = document.body;
            const bodyStyle = window.getComputedStyle(body);
            
            if (bodyStyle.transform !== 'none' && bodyStyle.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
                console.log('🚨 body 변형 감지, 복구 중...');
                body.style.transform = 'none';
                body.style.scale = '1';
                body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
            }
            
            // 컨테이너 변형 체크
            const containers = document.querySelectorAll('.container, .calendar-container, #calendar, .calendar');
            containers.forEach(container => {
                const containerStyle = window.getComputedStyle(container);
                if (containerStyle.transform !== 'none' && containerStyle.transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
                    console.log(`🚨 ${container.className || container.id} 변형 감지, 복구 중...`);
                    container.style.transform = 'none';
                    container.style.scale = '1';
                    container.style.width = '';
                    container.style.height = '';
                    container.style.overflow = '';
                }
            });
        };
        
        // MutationObserver로 스타일 변화 감지
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target === document.body || 
                        target.classList.contains('container') || 
                        target.classList.contains('calendar-container') ||
                        target.id === 'calendar') {
                        
                        setTimeout(checkAndRestore, 10);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            subtree: true
        });
        
        // 주기적 체크 (1초마다)
        setInterval(checkAndRestore, 1000);
        
        console.log('✅ 변형 감지 설정 완료');
        
        return observer;
    }
    
    // ========== 4. 메뉴 클릭 이벤트 보호 ==========
    function protectMenuClicks() {
        console.log('🛡️ 메뉴 클릭 보호 설정');
        
        // 모든 메뉴 버튼에 보호 이벤트 리스너 추가
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 메뉴 버튼 클릭 감지
            const isMenuButton = target.id?.includes('Btn') || 
                               target.classList.contains('menu-button') ||
                               target.classList.contains('control-button') ||
                               target.tagName === 'BUTTON';
            
            if (isMenuButton) {
                console.log(`🎯 메뉴 버튼 클릭: ${target.id || target.className}`);
                
                // 미리보기 모드 강제 비활성화
                setTimeout(() => {
                    document.body.style.transform = 'none';
                    document.body.style.scale = '1';
                    document.body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
                    
                    // 컨테이너도 복구
                    const containers = document.querySelectorAll('.container, .calendar-container, #calendar');
                    containers.forEach(container => {
                        container.style.transform = 'none';
                        container.style.scale = '1';
                    });
                    
                    console.log('✅ 메뉴 클릭 후 달력 복구 완료');
                }, 50);
                
                // 100ms 후에도 한 번 더 복구
                setTimeout(() => {
                    document.body.style.transform = 'none';
                    document.body.style.scale = '1';
                }, 100);
            }
        }, true); // capture phase에서 실행
        
        console.log('✅ 메뉴 클릭 보호 완료');
    }
    
    // ========== 5. 강제 복구 함수 ==========
    function forceRestore() {
        console.log('🔧 강제 달력 복구');
        
        // body 복구
        document.body.style.transform = 'none';
        document.body.style.scale = '1';
        document.body.style.zoom = '1';
        document.body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
        
        // 컨테이너 복구
        const containers = document.querySelectorAll('.container, .calendar-container, #calendar, .calendar');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.scale = '1';
            container.style.zoom = '1';
            container.style.width = '';
            container.style.height = '';
            container.style.overflow = '';
            container.style.position = '';
            container.style.margin = '';
        });
        
        // 미리보기 상태 초기화
        if (window.StablePreview) {
            window.StablePreview.isActive = false;
            window.StablePreview.isTransitioning = false;
        }
        
        console.log('✅ 강제 달력 복구 완료');
    }
    
    // ========== 6. 공개 API ==========
    function setupPublicAPI() {
        window.DisableAutoPreview = {
            // 강제 복구
            restore: forceRestore,
            
            // 상태 확인
            status: function() {
                const body = document.body;
                const bodyStyle = window.getComputedStyle(body);
                const container = document.querySelector('.container');
                const containerStyle = container ? window.getComputedStyle(container) : null;
                
                return {
                    body변형여부: bodyStyle.transform !== 'none',
                    body변형값: bodyStyle.transform,
                    container변형여부: containerStyle ? containerStyle.transform !== 'none' : false,
                    container변형값: containerStyle ? containerStyle.transform : 'N/A',
                    미리보기활성: window.StablePreview?.isActive || false
                };
            },
            
            // 완전 비활성화
            disable: function() {
                disableAllPreviewSystems();
                applyAntiDeformationCSS();
                forceRestore();
                return '미리보기 시스템 완전 비활성화 완료';
            }
        };
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 자동 미리보기 비활성화 초기화');
        
        // 1. 미리보기 시스템 비활성화
        disableAllPreviewSystems();
        
        // 2. 변형 방지 CSS 적용
        applyAntiDeformationCSS();
        
        // 3. 변형 감지 및 복구
        setupDeformationMonitoring();
        
        // 4. 메뉴 클릭 보호
        protectMenuClicks();
        
        // 5. 공개 API
        setupPublicAPI();
        
        // 6. 즉시 복구
        forceRestore();
        
        console.log('✅ 자동 미리보기 비활성화 완료');
        
        // 3초 후에도 한 번 더 복구
        setTimeout(forceRestore, 3000);
    }
    
    // 즉시 실행 (응급처치)
    applyAntiDeformationCSS();
    setTimeout(forceRestore, 100);
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('✅ 자동 미리보기 비활성화 로드 완료');
    console.log('💡 강제 복구: DisableAutoPreview.restore()');
    console.log('💡 상태 확인: DisableAutoPreview.status()');
    
})();