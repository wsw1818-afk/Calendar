/**
 * 미리보기 모드 메뉴 클릭 문제 해결
 * body scale로 인한 클릭 영역 왜곡 수정
 */

(function() {
    'use strict';
    
    console.log('🔧 미리보기 모드 클릭 문제 해결 시작');
    
    // ========== 미리보기 모드 개선 ==========
    
    // 원본 applyPreviewScale 함수 백업 및 수정
    if (window.PreviewControl) {
        const originalSetScale = window.PreviewControl.setScale;
        const originalEnable = window.PreviewControl.enable;
        const originalDisable = window.PreviewControl.disable;
        
        // 개선된 미리보기 활성화
        window.PreviewControl.enable = function() {
            console.log('🔍 개선된 미리보기 모드 활성화');
            
            // 미리보기용 wrapper 생성
            createPreviewWrapper();
            
            // 원본 함수 호출
            if (originalEnable) {
                originalEnable.call(this);
            }
            
            // 모달과 메뉴 보호
            protectInteractiveElements();
        };
        
        // 개선된 미리보기 비활성화
        window.PreviewControl.disable = function() {
            console.log('❌ 개선된 미리보기 모드 비활성화');
            
            // wrapper 제거
            removePreviewWrapper();
            
            // 원본 함수 호출
            if (originalDisable) {
                originalDisable.call(this);
            }
            
            // 보호 해제
            unprotectInteractiveElements();
        };
    }
    
    // ========== 미리보기 Wrapper 생성 ==========
    function createPreviewWrapper() {
        // 기존 wrapper 제거
        removePreviewWrapper();
        
        // 달력 컨테이너만 찾아서 scale 적용
        const container = document.querySelector('.container');
        const calendar = document.querySelector('.calendar');
        
        if (container && !document.getElementById('previewWrapper')) {
            console.log('📦 미리보기 wrapper 생성');
            
            // wrapper 생성
            const wrapper = document.createElement('div');
            wrapper.id = 'previewWrapper';
            wrapper.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                overflow: auto;
                z-index: 1;
                background: inherit;
            `;
            
            // 달력 컨테이너 복사 (미리보기용)
            const previewContainer = container.cloneNode(true);
            previewContainer.id = 'previewContainer';
            previewContainer.style.cssText = `
                transform: scale(0.8);
                transform-origin: top left;
                width: 125%;
                height: 125%;
                pointer-events: none;
                opacity: 0.95;
                filter: blur(0.5px);
            `;
            
            wrapper.appendChild(previewContainer);
            
            // body에 추가
            document.body.insertBefore(wrapper, document.body.firstChild);
            
            // 원본 컨테이너는 숨김 (하지만 DOM에는 유지)
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
        }
    }
    
    // ========== 미리보기 Wrapper 제거 ==========
    function removePreviewWrapper() {
        const wrapper = document.getElementById('previewWrapper');
        if (wrapper) {
            wrapper.remove();
            console.log('📦 미리보기 wrapper 제거');
        }
        
        // 원본 컨테이너 복원
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }
    
    // ========== 상호작용 요소 보호 ==========
    function protectInteractiveElements() {
        console.log('🛡️ 상호작용 요소 보호');
        
        // 모든 모달에 높은 z-index와 pointer-events 보장
        const modals = document.querySelectorAll('.modal, .modal-content, [id*="Modal"]');
        modals.forEach(modal => {
            modal.style.zIndex = '10000';
            modal.style.pointerEvents = 'auto';
            modal.style.position = modal.style.position || 'fixed';
        });
        
        // 메뉴 버튼들 보호
        const menuButtons = document.querySelectorAll('.menu-btn, .control-btn, button, .action-btn');
        menuButtons.forEach(btn => {
            const originalZIndex = btn.style.zIndex;
            btn.dataset.originalZIndex = originalZIndex;
            btn.style.zIndex = '9999';
            btn.style.pointerEvents = 'auto';
            btn.style.position = btn.style.position || 'relative';
        });
        
        // 플로팅 메뉴 보호
        const floatingMenus = document.querySelectorAll('.floating-menu, .menu-container, .controls');
        floatingMenus.forEach(menu => {
            menu.style.zIndex = '9998';
            menu.style.pointerEvents = 'auto';
            menu.style.position = menu.style.position || 'fixed';
        });
    }
    
    // ========== 상호작용 요소 보호 해제 ==========
    function unprotectInteractiveElements() {
        console.log('🛡️ 상호작용 요소 보호 해제');
        
        // 원래 z-index 복원
        const elements = document.querySelectorAll('[data-original-z-index]');
        elements.forEach(elem => {
            elem.style.zIndex = elem.dataset.originalZIndex || '';
            delete elem.dataset.originalZIndex;
        });
    }
    
    // ========== 대체 미리보기 구현 ==========
    function implementAlternativePreview() {
        console.log('🔄 대체 미리보기 구현');
        
        // body scale 대신 container만 scale
        const style = document.createElement('style');
        style.id = 'alternativePreviewStyles';
        style.textContent = `
            /* 미리보기 모드 스타일 */
            body.preview-mode {
                overflow: auto !important;
                transform: none !important;
                width: 100vw !important;
                height: 100vh !important;
            }
            
            body.preview-mode .container {
                transform: scale(0.8);
                transform-origin: top center;
                margin: 0 auto;
                transition: transform 0.3s ease;
            }
            
            /* 모달과 메뉴는 scale 영향 받지 않음 */
            body.preview-mode .modal,
            body.preview-mode .modal-content,
            body.preview-mode .menu-btn,
            body.preview-mode .floating-menu {
                transform: scale(1.25);
                transform-origin: center;
            }
            
            /* 클릭 영역 보정 */
            body.preview-mode button,
            body.preview-mode a,
            body.preview-mode input,
            body.preview-mode select,
            body.preview-mode textarea {
                position: relative;
                z-index: 9999;
                pointer-events: auto !important;
            }
            
            /* 미리보기 표시기 */
            #previewModeIndicator {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                z-index: 100000 !important;
                pointer-events: none !important;
            }
        `;
        
        // 기존 스타일 제거 후 추가
        const existingStyle = document.getElementById('alternativePreviewStyles');
        if (existingStyle) {
            existingStyle.remove();
        }
        document.head.appendChild(style);
    }
    
    // ========== 클릭 이벤트 보정 ==========
    function fixClickEvents() {
        console.log('🖱️ 클릭 이벤트 보정');
        
        // 미리보기 모드에서 클릭 좌표 보정
        document.addEventListener('click', function(e) {
            if (document.body.classList.contains('preview-mode')) {
                // scale이 적용된 경우 실제 클릭 좌표 계산
                const scale = 0.8; // 미리보기 scale 값
                const rect = e.target.getBoundingClientRect();
                const actualX = e.clientX / scale;
                const actualY = e.clientY / scale;
                
                console.log('클릭 좌표 보정:', {
                    original: { x: e.clientX, y: e.clientY },
                    adjusted: { x: actualX, y: actualY }
                });
            }
        }, true);
    }
    
    // ========== 즉시 실행 가능한 미리보기 토글 ==========
    window.toggleSafePreview = function(enable = true) {
        console.log(enable ? '🔍 안전한 미리보기 활성화' : '❌ 안전한 미리보기 비활성화');
        
        if (enable) {
            // body scale 제거
            document.body.style.transform = 'none';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.classList.add('safe-preview-mode');
            
            // container만 scale
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = 'scale(0.8)';
                container.style.transformOrigin = 'top center';
                container.style.margin = '0 auto';
            }
            
            // 모든 interactive 요소 보호
            protectInteractiveElements();
            
            // 미리보기 표시
            showSafePreviewIndicator();
            
        } else {
            document.body.classList.remove('safe-preview-mode');
            
            // 모든 transform 제거
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = 'none';
            }
            
            // 보호 해제
            unprotectInteractiveElements();
            
            // 표시기 제거
            hideSafePreviewIndicator();
        }
    };
    
    // ========== 안전한 미리보기 표시기 ==========
    function showSafePreviewIndicator() {
        hideSafePreviewIndicator();
        
        const indicator = document.createElement('div');
        indicator.id = 'safePreviewIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            z-index: 100001;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            pointer-events: none;
            animation: slideIn 0.3s ease;
        `;
        indicator.textContent = '🔍 안전한 미리보기 모드 (80%)';
        
        document.body.appendChild(indicator);
    }
    
    function hideSafePreviewIndicator() {
        const indicator = document.getElementById('safePreviewIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 미리보기 모드 수정 초기화');
        
        // 대체 스타일 적용
        implementAlternativePreview();
        
        // 클릭 이벤트 보정
        fixClickEvents();
        
        // 설정 모달 열릴 때 자동으로 안전한 미리보기 적용
        document.addEventListener('click', function(e) {
            const target = e.target;
            const isSettingButton = 
                target.textContent?.includes('글자') ||
                target.textContent?.includes('색상') ||
                target.textContent?.includes('테마') ||
                target.textContent?.includes('레이아웃');
            
            if (isSettingButton) {
                setTimeout(() => {
                    // 기존 미리보기 비활성화하고 안전한 미리보기 활성화
                    if (window.PreviewControl && window.PreviewControl.isEnabled()) {
                        console.log('기존 미리보기를 안전한 미리보기로 전환');
                        window.PreviewControl.disable();
                        window.toggleSafePreview(true);
                    }
                }, 500);
            }
        });
        
        // 모달 닫힐 때 미리보기 해제
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const modal = mutation.target;
                    if (modal.classList.contains('modal') && modal.style.display === 'none') {
                        window.toggleSafePreview(false);
                    }
                }
            });
        });
        
        // 모든 모달 관찰
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['style']
            });
        });
    }
    
    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('✅ 미리보기 모드 클릭 문제 해결 스크립트 로드 완료');
    console.log('💡 수동 제어: toggleSafePreview(true/false)');
    
})();