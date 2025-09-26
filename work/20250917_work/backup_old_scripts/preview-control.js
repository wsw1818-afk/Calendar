/**
 * 레이아웃 모달 미리보기 제어 시스템
 * 모달이 열렸을 때 화면을 축소하여 실시간 미리보기 제공
 */

(function() {
    'use strict';
    
    console.log('🔍 미리보기 제어 시스템 초기화');
    
    let isPreviewMode = false;
    let originalBodyStyle = null;
    let originalContainerStyle = null;
    let previewScale = 80; // 기본 축소 비율 80%
    
    // ========== 미리보기 지원 모달 목록 ==========
    const previewSupportedModals = [
        'layoutModal',       // 레이아웃 설정
        'themeModal',        // 테마 설정  
        'colorModeModal',    // 색상 모드
        'fontModal',         // 글자 설정
        'fontSizeModal',     // 글자 크기 상세 설정
        'advancedThemeModal' // 고급 테마
    ];
    
    // ========== 미리보기 모드 초기화 ==========
    function initPreviewControl() {
        // DOM 로드 완료 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupModalObserver);
        } else {
            setupModalObserver();
        }
    }
    
    function setupModalObserver() {
        // 모든 지원 모달에 대해 관찰자 설정
        previewSupportedModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // 모달 표시/숨김 감지
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const display = modal.style.display;
                            if (display === 'flex' || display === 'block') {
                                setTimeout(() => {
                                    enablePreviewMode();
                                    setupPreviewControls();
                                }, 100);
                            } else if (display === 'none' || !display) {
                                // 다른 지원 모달이 열려있는지 확인
                                if (!isAnyPreviewModalOpen()) {
                                    disablePreviewMode();
                                }
                            }
                        }
                    });
                });
                
                observer.observe(modal, {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        });
        
        // 동적 생성 모달 감지
        const bodyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('modal')) {
                        if (previewSupportedModals.includes(node.id)) {
                            setTimeout(() => {
                                enablePreviewMode();
                                setupPreviewControls();
                            }, 100);
                        }
                    }
                });
            });
        });
        
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 모달 열기 버튼들에 직접 이벤트 리스너 추가
        setupModalTriggers();
        
        // 페이지 로드 시 저장된 설정 복원
        restorePreviewSettings();
    }
    
    function isAnyPreviewModalOpen() {
        return previewSupportedModals.some(modalId => {
            const modal = document.getElementById(modalId);
            return modal && isModalVisible(modal);
        });
    }
    
    function setupModalTriggers() {
        // 설정 관련 버튼 클릭 감지
        document.addEventListener('click', function(e) {
            const target = e.target;
            const buttonText = target.textContent || '';
            const closestButton = target.closest('button');
            const buttonClosestText = closestButton?.textContent || '';
            
            // 미리보기 지원 모달 관련 버튼 감지
            const previewTriggerKeywords = [
                '레이아웃', '글자', '크기', '설정',
                '테마', '색상', '컬러', '폰트',
                '디자인', '스타일', '외관',
                'font', 'color', 'theme', 'layout'
            ];
            
            const isPreviewTrigger = previewTriggerKeywords.some(keyword => 
                buttonText.includes(keyword) || 
                buttonClosestText.includes(keyword) ||
                target.id?.toLowerCase().includes(keyword.toLowerCase()) ||
                closestButton?.id?.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (isPreviewTrigger) {
                console.log('🔍 설정 버튼 클릭 감지:', buttonText || target.id);
                
                // 여러 시점에서 체크 (모달 로딩 시간 고려)
                [100, 300, 500, 1000].forEach(delay => {
                    setTimeout(() => {
                        checkAndEnablePreview();
                    }, delay);
                });
            }
        });
        
        // 추가로 모든 버튼 클릭을 모니터링 (백업)
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                setTimeout(() => {
                    checkPreviewModalStatus();
                }, 150);
            }
        });
    }
    
    function checkAndEnablePreview() {
        // 지원되는 모달 중 하나라도 열려있으면 미리보기 활성화
        const openModal = previewSupportedModals.find(modalId => {
            const modal = document.getElementById(modalId);
            return modal && isModalVisible(modal);
        });
        
        if (openModal) {
            console.log(`✅ ${openModal} 모달 감지됨 - 미리보기 모드 활성화`);
            enablePreviewMode();
            setupPreviewControls();
        }
    }
    
    function checkPreviewModalStatus() {
        // 아직 미리보기 모드가 아니고, 지원 모달이 열려있으면 활성화
        if (!isPreviewMode && isAnyPreviewModalOpen()) {
            const openModal = previewSupportedModals.find(modalId => {
                const modal = document.getElementById(modalId);
                return modal && isModalVisible(modal);
            });
            console.log(`🔄 ${openModal} 모달 자동 감지 - 미리보기 활성화`);
            enablePreviewMode();
            setupPreviewControls();
        }
    }
    
    function isModalVisible(modal) {
        if (!modal) return false;
        
        const computedStyle = window.getComputedStyle(modal);
        const display = computedStyle.display;
        const visibility = computedStyle.visibility;
        const opacity = computedStyle.opacity;
        
        return (display === 'flex' || display === 'block') && 
               visibility !== 'hidden' && 
               opacity !== '0' &&
               modal.style.display !== 'none';
    }
    
    // ========== 미리보기 모드 활성화 ==========
    function enablePreviewMode() {
        console.log('🔍 미리보기 모드 활성화 시도');
        
        if (isPreviewMode) {
            console.log('ℹ️ 이미 미리보기 모드가 활성화되어 있음');
            return;
        }
        
        // 현재 스타일 저장
        const body = document.body;
        
        if (body) {
            console.log('📱 body 요소 확인 완료 - 스타일 저장 중');
            
            // 기존 transform이 있는지 확인
            const computedStyle = window.getComputedStyle(body);
            originalBodyStyle = {
                transform: body.style.transform || (computedStyle.transform !== 'none' ? computedStyle.transform : ''),
                transformOrigin: body.style.transformOrigin || computedStyle.transformOrigin,
                overflow: body.style.overflow || computedStyle.overflow,
                position: body.style.position || computedStyle.position,
                width: body.style.width || computedStyle.width,
                height: body.style.height || computedStyle.height,
                margin: body.style.margin || computedStyle.margin,
                padding: body.style.padding || computedStyle.padding
            };
            
            console.log('💾 원본 스타일 저장:', originalBodyStyle);
            
            // 미리보기 클래스 추가
            body.classList.add('preview-mode');
            
            // 미리보기 스타일 적용
            applyPreviewScale(previewScale);
            isPreviewMode = true;
            
            // 미리보기 상태 표시
            showPreviewIndicator();
            
            console.log('✅ 미리보기 모드 활성화 완료');
            
            // 알림 표시
            showNotification(`미리보기 모드 활성화 (${previewScale}%)`, 'success');
        } else {
            console.error('❌ body 요소를 찾을 수 없음');
        }
    }
    
    // ========== 미리보기 모드 비활성화 ==========
    function disablePreviewMode() {
        if (!isPreviewMode) return;
        
        console.log('❌ 미리보기 모드 비활성화');
        
        const body = document.body;
        
        if (body && originalBodyStyle) {
            // 원래 스타일 복원
            body.style.transform = originalBodyStyle.transform;
            body.style.transformOrigin = originalBodyStyle.transformOrigin;
            body.style.overflow = originalBodyStyle.overflow;
            body.style.position = originalBodyStyle.position;
            body.style.width = originalBodyStyle.width;
            body.style.height = originalBodyStyle.height;
            
            isPreviewMode = false;
            
            // 미리보기 표시기 제거
            hidePreviewIndicator();
        }
    }
    
    // ========== 미리보기 축소 비율 적용 ==========
    function applyPreviewScale(scale) {
        const body = document.body;
        const container = document.querySelector('.container');
        const scaleValue = scale / 100;
        
        if (body) {
            // 와이드 뷰 모드 감지
            const isWideViewActive = body.classList.contains('wide-view-mode') || 
                                   container?.classList.contains('wide-view-mode') ||
                                   document.querySelector('.wide-view-mode') !== null;
            
            if (isWideViewActive) {
                // 와이드 뷰 모드에서는 전체 화면 활용
                console.log('🔍 와이드 뷰 모드에서 미리보기 적용');
                
                body.style.transform = `scale(${scaleValue})`;
                body.style.transformOrigin = 'top left';
                body.style.width = `${100 / scaleValue}vw`;
                body.style.height = `${100 / scaleValue}vh`;
                body.style.overflow = 'hidden';
                body.style.position = 'fixed';
                body.style.top = '0';
                body.style.left = '0';
                body.style.zIndex = '998'; // 모달보다 낮게
                
                // 와이드 뷰 컨테이너 추가 조정
                const wideViewContainer = document.querySelector('.wide-view-mode');
                if (wideViewContainer) {
                    wideViewContainer.style.width = '100vw';
                    wideViewContainer.style.height = '100vh';
                    wideViewContainer.style.position = 'fixed';
                    wideViewContainer.style.top = '0';
                    wideViewContainer.style.left = '0';
                }
            } else {
                // 일반 모드에서의 미리보기
                body.style.transform = `scale(${scaleValue})`;
                body.style.transformOrigin = 'top left';
                body.style.width = `${100 / scaleValue}vw`;
                body.style.height = `${100 / scaleValue}vh`;
                body.style.overflow = 'hidden';
                body.style.position = 'relative';
            }
        }
        
        // 설정 저장
        localStorage.setItem('previewScale', scale);
        
        const isWideViewActive = body.classList.contains('wide-view-mode') || 
                               container?.classList.contains('wide-view-mode') ||
                               document.querySelector('.wide-view-mode') !== null;
        
        console.log(`🔍 미리보기 축소 비율: ${scale}% ${isWideViewActive ? '(와이드 뷰 모드)' : ''}`);
    }
    
    // ========== 미리보기 컨트롤 설정 ==========
    function setupPreviewControls() {
        // 레이아웃 모달용 컨트롤
        setupModalPreviewControls('layout', {
            slider: 'previewScale',
            value: 'previewScaleValue',
            checkbox: 'enablePreviewMode',
            forceBtn: 'forcePreviewBtn',
            disableBtn: 'disablePreviewBtn'
        });
        
        // 테마 모달용 컨트롤  
        setupModalPreviewControls('theme', {
            slider: 'themePreviewScale',
            value: 'themePreviewScaleValue',
            checkbox: 'enableThemePreview',
            forceBtn: 'forceThemePreviewBtn',
            disableBtn: 'disableThemePreviewBtn'
        });
        
        // 색상 모달용 컨트롤
        setupModalPreviewControls('color', {
            slider: 'colorPreviewScale',
            value: 'colorPreviewScaleValue',
            checkbox: 'enableColorPreview',
            forceBtn: 'forceColorPreviewBtn',
            disableBtn: 'disableColorPreviewBtn'
        });
        
        // 글자 크기 모달용 컨트롤
        setupModalPreviewControls('font', {
            slider: 'fontPreviewScale',
            value: 'fontPreviewScaleValue',
            checkbox: 'enableFontPreview',
            forceBtn: 'forceFontPreviewBtn',
            disableBtn: 'disableFontPreviewBtn'
        });
        
        console.log('🎛️ 모든 모달 미리보기 컨트롤 설정 완료');
    }
    
    function setupModalPreviewControls(modalType, selectors) {
        const previewScaleSlider = document.getElementById(selectors.slider);
        const previewScaleValue = document.getElementById(selectors.value);
        const enablePreviewCheckbox = document.getElementById(selectors.checkbox);
        const forcePreviewBtn = document.getElementById(selectors.forceBtn);
        const disablePreviewBtn = document.getElementById(selectors.disableBtn);
        
        if (previewScaleSlider && previewScaleValue) {
            // 슬라이더 값 업데이트
            previewScaleSlider.value = previewScale;
            previewScaleValue.textContent = previewScale + '%';
            
            // 슬라이더 이벤트
            previewScaleSlider.addEventListener('input', function() {
                const newScale = parseInt(this.value);
                previewScale = newScale;
                previewScaleValue.textContent = newScale + '%';
                
                if (isPreviewMode) {
                    applyPreviewScale(newScale);
                }
                
                console.log(`🔍 ${modalType} 모달 미리보기 크기: ${newScale}%`);
            });
        }
        
        if (enablePreviewCheckbox) {
            // 체크박스 상태 설정
            const storageKey = `enablePreview${modalType.charAt(0).toUpperCase() + modalType.slice(1)}Mode`;
            const isEnabled = localStorage.getItem(storageKey) !== 'false';
            enablePreviewCheckbox.checked = isEnabled;
            
            // 체크박스 이벤트
            enablePreviewCheckbox.addEventListener('change', function() {
                const enabled = this.checked;
                localStorage.setItem(storageKey, enabled);
                
                if (enabled && !isPreviewMode) {
                    enablePreviewMode();
                    showNotification(`${modalType} 모달 미리보기 활성화`, 'success');
                } else if (!enabled && isPreviewMode) {
                    disablePreviewMode();
                    showNotification(`${modalType} 모달 미리보기 비활성화`, 'info');
                }
            });
        }
        
        // 강제 미리보기 활성화 버튼
        if (forcePreviewBtn) {
            forcePreviewBtn.addEventListener('click', function() {
                console.log(`🔍 ${modalType} 모달 강제 미리보기 활성화 버튼 클릭`);
                if (!isPreviewMode) {
                    enablePreviewMode();
                    showNotification(`${modalType} 모달 미리보기가 강제로 활성화되었습니다`, 'success');
                } else {
                    showNotification('미리보기가 이미 활성화되어 있습니다', 'info');
                }
            });
        }
        
        // 미리보기 비활성화 버튼
        if (disablePreviewBtn) {
            disablePreviewBtn.addEventListener('click', function() {
                console.log(`❌ ${modalType} 모달 미리보기 비활성화 버튼 클릭`);
                if (isPreviewMode) {
                    disablePreviewMode();
                    showNotification(`${modalType} 모달 미리보기가 비활성화되었습니다`, 'info');
                } else {
                    showNotification('미리보기가 이미 비활성화되어 있습니다', 'info');
                }
            });
        }
        
        console.log(`🎛️ ${modalType} 모달 미리보기 컨트롤 설정 완료`);
    }
    
    // ========== 미리보기 상태 표시 ==========
    function showPreviewIndicator() {
        // 기존 표시기 제거
        hidePreviewIndicator();
        
        const indicator = document.createElement('div');
        indicator.id = 'previewModeIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: rgba(25, 135, 84, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000002;
            backdrop-filter: blur(10px);
            animation: fadeInScale 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        indicator.textContent = `🔍 미리보기 모드 (${previewScale}%)`;
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('previewAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'previewAnimationStyles';
            style.textContent = `
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.8) translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
    }
    
    function hidePreviewIndicator() {
        const indicator = document.getElementById('previewModeIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // ========== 설정 복원 ==========
    function restorePreviewSettings() {
        const savedScale = localStorage.getItem('previewScale');
        const savedEnabled = localStorage.getItem('enablePreviewMode');
        
        if (savedScale) {
            previewScale = parseInt(savedScale);
        }
        
        // enablePreviewMode 기본값은 true
        if (savedEnabled === null) {
            localStorage.setItem('enablePreviewMode', 'true');
        }
    }
    
    // ========== 키보드 단축키 ==========
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // 레이아웃 모달이 열린 상태에서만 작동
            const layoutModal = document.getElementById('layoutModal');
            if (!layoutModal || layoutModal.style.display !== 'flex') return;
            
            // ESC 키로 모달 닫기
            if (e.code === 'Escape') {
                e.preventDefault();
                closeLayoutModal();
                showNotification('레이아웃 설정이 닫혔습니다 (ESC키)', 'info');
                return;
            }
            
            // Ctrl + 1~9: 미리보기 축소 비율 설정
            if (e.ctrlKey && e.code >= 'Digit1' && e.code <= 'Digit9') {
                e.preventDefault();
                const digit = parseInt(e.code.replace('Digit', ''));
                const newScale = digit * 10; // 1=10%, 2=20%, ..., 9=90%
                
                previewScale = Math.max(30, Math.min(100, newScale));
                if (isPreviewMode) {
                    applyPreviewScale(previewScale);
                }
                
                // UI 업데이트
                const slider = document.getElementById('previewScale');
                const valueSpan = document.getElementById('previewScaleValue');
                if (slider) slider.value = previewScale;
                if (valueSpan) valueSpan.textContent = previewScale + '%';
                
                showNotification(`미리보기 크기: ${previewScale}%`, 'info');
            }
            
            // Ctrl + 0: 미리보기 리셋 (80%)
            else if (e.ctrlKey && e.code === 'Digit0') {
                e.preventDefault();
                previewScale = 80;
                if (isPreviewMode) {
                    applyPreviewScale(previewScale);
                }
                
                // UI 업데이트
                const slider = document.getElementById('previewScale');
                const valueSpan = document.getElementById('previewScaleValue');
                if (slider) slider.value = previewScale;
                if (valueSpan) valueSpan.textContent = previewScale + '%';
                
                showNotification('미리보기 크기 리셋: 80%', 'info');
            }
        });
    }
    
    // ========== 레이아웃 모달 닫기 ==========
    function closeLayoutModal() {
        const layoutModal = document.getElementById('layoutModal');
        if (layoutModal) {
            layoutModal.style.display = 'none';
            
            // 닫기 버튼 클릭 이벤트 트리거
            const closeBtn = layoutModal.querySelector('.close, #layoutClose');
            if (closeBtn) {
                closeBtn.click();
            }
        }
        
        // 미리보기 모드 비활성화
        disablePreviewMode();
    }
    
    // ========== 알림 표시 함수 (다른 파일에 있는 함수 사용) ==========
    function showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${message}`);
        }
    }
    
    // ========== 공개 API ==========
    window.PreviewControl = {
        enable: enablePreviewMode,
        disable: disablePreviewMode,
        setScale: function(scale) {
            previewScale = Math.max(30, Math.min(100, scale));
            if (isPreviewMode) {
                applyPreviewScale(previewScale);
            }
        },
        getScale: function() {
            return previewScale;
        },
        isEnabled: function() {
            return isPreviewMode;
        }
    };
    
    // ========== 초기화 실행 ==========
    initPreviewControl();
    setupKeyboardShortcuts();
    
    console.log('✅ 미리보기 제어 시스템 초기화 완료');
    
})();