/**
 * 최적화된 레이아웃 모달 미리보기 제어 시스템
 * 모달이 열렸을 때 화면을 축소하여 실시간 미리보기 제공
 * 
 * 개선사항:
 * - console.log를 디버그 모드로 변경
 * - 중복 코드 제거
 * - 성능 최적화
 * - 메모리 누수 방지
 */

(function() {
    'use strict';
    
    // 디버그 모드 설정 (프로덕션에서는 false로 설정)
    const DEBUG = false;
    const log = DEBUG ? console.log.bind(console) : () => {};
    
    log('🔍 미리보기 제어 시스템 초기화');
    
    // ========== 상태 관리 ==========
    const state = {
        isPreviewMode: false,
        originalBodyStyle: null,
        originalContainerStyle: null,
        previewScale: 80,
        observers: new Map(),
        eventListeners: new Map()
    };
    
    // ========== 설정 ==========
    const config = {
        previewSupportedModals: [
            'layoutModal',
            'themeModal',
            'colorModeModal',
            'fontModal',
            'fontSizeModal',
            'advancedThemeModal'
        ],
        previewTriggerKeywords: [
            '레이아웃', '글자', '크기', '설정',
            '테마', '색상', '컬러', '폰트',
            '디자인', '스타일', '외관',
            'font', 'color', 'theme', 'layout'
        ],
        defaultScale: 80,
        minScale: 30,
        maxScale: 100,
        animationDuration: 300
    };
    
    // ========== 유틸리티 함수 ==========
    const utils = {
        /**
         * 디바운스 함수
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        /**
         * 쓰로틀 함수
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        /**
         * 안전한 localStorage 접근
         */
        storage: {
            get(key, defaultValue = null) {
                try {
                    const value = localStorage.getItem(key);
                    return value !== null ? JSON.parse(value) : defaultValue;
                } catch (e) {
                    log('Storage get error:', e);
                    return defaultValue;
                }
            },
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    log('Storage set error:', e);
                    return false;
                }
            }
        }
    };
    
    // ========== 모달 관리 ==========
    const modalManager = {
        /**
         * 모달이 표시 중인지 확인
         */
        isModalVisible(modal) {
            if (!modal) return false;
            
            const computedStyle = window.getComputedStyle(modal);
            return (computedStyle.display === 'flex' || computedStyle.display === 'block') && 
                   computedStyle.visibility !== 'hidden' && 
                   computedStyle.opacity !== '0' &&
                   modal.style.display !== 'none';
        },
        
        /**
         * 지원되는 모달이 열려있는지 확인
         */
        isAnyPreviewModalOpen() {
            return config.previewSupportedModals.some(modalId => {
                const modal = document.getElementById(modalId);
                return modal && this.isModalVisible(modal);
            });
        },
        
        /**
         * 현재 열린 모달 찾기
         */
        findOpenModal() {
            for (const modalId of config.previewSupportedModals) {
                const modal = document.getElementById(modalId);
                if (modal && this.isModalVisible(modal)) {
                    return modal;
                }
            }
            return null;
        }
    };
    
    // ========== 미리보기 제어 ==========
    const previewController = {
        /**
         * 미리보기 모드 활성화
         */
        enable() {
            if (state.isPreviewMode) {
                log('이미 미리보기 모드가 활성화되어 있음');
                return;
            }
            
            const body = document.body;
            if (!body) {
                log('body 요소를 찾을 수 없음');
                return;
            }
            
            // 현재 스타일 저장
            this.saveOriginalStyles();
            
            // 미리보기 클래스 추가
            body.classList.add('preview-mode');
            
            // 미리보기 스타일 적용
            this.applyScale(state.previewScale);
            state.isPreviewMode = true;
            
            // 미리보기 상태 표시
            this.showIndicator();
            
            // 알림 표시
            notificationManager.show(`미리보기 모드 활성화 (${state.previewScale}%)`, 'success');
            
            log('✅ 미리보기 모드 활성화 완료');
        },
        
        /**
         * 미리보기 모드 비활성화
         */
        disable() {
            if (!state.isPreviewMode) return;
            
            const body = document.body;
            if (body && state.originalBodyStyle) {
                // 원래 스타일 복원
                Object.assign(body.style, state.originalBodyStyle);
                body.classList.remove('preview-mode');
            }
            
            state.isPreviewMode = false;
            
            // 미리보기 표시기 제거
            this.hideIndicator();
            
            log('❌ 미리보기 모드 비활성화');
        },
        
        /**
         * 원본 스타일 저장
         */
        saveOriginalStyles() {
            const body = document.body;
            const computedStyle = window.getComputedStyle(body);
            
            state.originalBodyStyle = {
                transform: body.style.transform || '',
                transformOrigin: body.style.transformOrigin || '',
                overflow: body.style.overflow || '',
                position: body.style.position || '',
                width: body.style.width || '',
                height: body.style.height || '',
                margin: body.style.margin || '',
                padding: body.style.padding || ''
            };
            
            log('💾 원본 스타일 저장:', state.originalBodyStyle);
        },
        
        /**
         * 미리보기 축소 비율 적용
         */
        applyScale(scale) {
            const body = document.body;
            const container = document.querySelector('.container');
            const scaleValue = scale / 100;
            
            if (!body) return;
            
            // 와이드 뷰 모드 감지
            const isWideViewActive = body.classList.contains('wide-view-mode') || 
                                   container?.classList.contains('wide-view-mode') ||
                                   document.querySelector('.wide-view-mode') !== null;
            
            // 애니메이션 적용
            body.style.transition = `transform ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            
            if (isWideViewActive) {
                // 와이드 뷰 모드 최적화
                Object.assign(body.style, {
                    transform: `scale(${scaleValue})`,
                    transformOrigin: 'top left',
                    width: `${100 / scaleValue}vw`,
                    height: `${100 / scaleValue}vh`,
                    overflow: 'hidden',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    zIndex: '998'
                });
            } else {
                // 일반 모드
                Object.assign(body.style, {
                    transform: `scale(${scaleValue})`,
                    transformOrigin: 'top left',
                    width: `${100 / scaleValue}vw`,
                    height: `${100 / scaleValue}vh`,
                    overflow: 'hidden',
                    position: 'relative'
                });
            }
            
            // 설정 저장
            utils.storage.set('previewScale', scale);
            
            log(`🔍 미리보기 축소 비율: ${scale}% ${isWideViewActive ? '(와이드 뷰 모드)' : ''}`);
        },
        
        /**
         * 미리보기 상태 표시
         */
        showIndicator() {
            this.hideIndicator();
            
            const indicator = document.createElement('div');
            indicator.id = 'previewModeIndicator';
            indicator.className = 'preview-indicator';
            indicator.textContent = `🔍 미리보기 모드 (${state.previewScale}%)`;
            
            Object.assign(indicator.style, {
                position: 'fixed',
                top: '50px',
                right: '20px',
                background: 'rgba(25, 135, 84, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                zIndex: '1000002',
                backdropFilter: 'blur(10px)',
                animation: 'fadeInScale 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                userSelect: 'none',
                pointerEvents: 'none'
            });
            
            // 애니메이션 CSS 추가
            this.addAnimationStyles();
            
            document.body.appendChild(indicator);
        },
        
        /**
         * 미리보기 표시기 제거
         */
        hideIndicator() {
            const indicator = document.getElementById('previewModeIndicator');
            if (indicator) {
                indicator.style.animation = 'fadeOutScale 0.3s ease';
                setTimeout(() => indicator.remove(), 300);
            }
        },
        
        /**
         * 애니메이션 스타일 추가
         */
        addAnimationStyles() {
            if (document.getElementById('previewAnimationStyles')) return;
            
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
                @keyframes fadeOutScale {
                    from {
                        opacity: 1;
                        transform: scale(1) translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.8) translateX(20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // ========== 컨트롤 UI 관리 ==========
    const controlManager = {
        /**
         * 모든 모달의 미리보기 컨트롤 설정
         */
        setupAll() {
            this.setup('layout', {
                slider: 'previewScale',
                value: 'previewScaleValue',
                checkbox: 'enablePreviewMode',
                forceBtn: 'forcePreviewBtn',
                disableBtn: 'disablePreviewBtn'
            });
            
            this.setup('theme', {
                slider: 'themePreviewScale',
                value: 'themePreviewScaleValue',
                checkbox: 'enableThemePreview',
                forceBtn: 'forceThemePreviewBtn',
                disableBtn: 'disableThemePreviewBtn'
            });
            
            this.setup('color', {
                slider: 'colorPreviewScale',
                value: 'colorPreviewScaleValue',
                checkbox: 'enableColorPreview',
                forceBtn: 'forceColorPreviewBtn',
                disableBtn: 'disableColorPreviewBtn'
            });
            
            this.setup('font', {
                slider: 'fontPreviewScale',
                value: 'fontPreviewScaleValue',
                checkbox: 'enableFontPreview',
                forceBtn: 'forceFontPreviewBtn',
                disableBtn: 'disableFontPreviewBtn'
            });
            
            log('🎛️ 모든 모달 미리보기 컨트롤 설정 완료');
        },
        
        /**
         * 개별 모달 컨트롤 설정
         */
        setup(modalType, selectors) {
            const elements = {
                slider: document.getElementById(selectors.slider),
                value: document.getElementById(selectors.value),
                checkbox: document.getElementById(selectors.checkbox),
                forceBtn: document.getElementById(selectors.forceBtn),
                disableBtn: document.getElementById(selectors.disableBtn)
            };
            
            // 슬라이더 설정
            if (elements.slider && elements.value) {
                elements.slider.value = state.previewScale;
                elements.value.textContent = state.previewScale + '%';
                
                // 쓰로틀된 이벤트 핸들러
                const handleSliderChange = utils.throttle((e) => {
                    const newScale = parseInt(e.target.value);
                    state.previewScale = newScale;
                    elements.value.textContent = newScale + '%';
                    
                    if (state.isPreviewMode) {
                        previewController.applyScale(newScale);
                    }
                    
                    log(`🔍 ${modalType} 모달 미리보기 크기: ${newScale}%`);
                }, 100);
                
                elements.slider.addEventListener('input', handleSliderChange);
            }
            
            // 체크박스 설정
            if (elements.checkbox) {
                const storageKey = `enablePreview${modalType.charAt(0).toUpperCase() + modalType.slice(1)}Mode`;
                const isEnabled = utils.storage.get(storageKey, true);
                elements.checkbox.checked = isEnabled;
                
                elements.checkbox.addEventListener('change', (e) => {
                    const enabled = e.target.checked;
                    utils.storage.set(storageKey, enabled);
                    
                    if (enabled && !state.isPreviewMode) {
                        previewController.enable();
                    } else if (!enabled && state.isPreviewMode) {
                        previewController.disable();
                    }
                });
            }
            
            // 버튼 설정
            if (elements.forceBtn) {
                elements.forceBtn.addEventListener('click', () => {
                    if (!state.isPreviewMode) {
                        previewController.enable();
                    } else {
                        notificationManager.show('미리보기가 이미 활성화되어 있습니다', 'info');
                    }
                });
            }
            
            if (elements.disableBtn) {
                elements.disableBtn.addEventListener('click', () => {
                    if (state.isPreviewMode) {
                        previewController.disable();
                    } else {
                        notificationManager.show('미리보기가 이미 비활성화되어 있습니다', 'info');
                    }
                });
            }
            
            log(`🎛️ ${modalType} 모달 미리보기 컨트롤 설정 완료`);
        }
    };
    
    // ========== 알림 관리 ==========
    const notificationManager = {
        show(message, type = 'info') {
            if (typeof window.showNotification === 'function') {
                window.showNotification(message, type);
            } else {
                log(`📢 ${message}`);
            }
        }
    };
    
    // ========== 이벤트 관리 ==========
    const eventManager = {
        /**
         * 모달 관찰자 설정
         */
        setupObservers() {
            config.previewSupportedModals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (!modal) return;
                
                // 기존 관찰자 제거
                if (state.observers.has(modalId)) {
                    state.observers.get(modalId).disconnect();
                }
                
                // 새 관찰자 생성
                const observer = new MutationObserver(
                    utils.debounce((mutations) => {
                        mutations.forEach(mutation => {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                                const display = modal.style.display;
                                if (display === 'flex' || display === 'block') {
                                    setTimeout(() => {
                                        previewController.enable();
                                        controlManager.setupAll();
                                    }, 100);
                                } else if (display === 'none' || !display) {
                                    if (!modalManager.isAnyPreviewModalOpen()) {
                                        previewController.disable();
                                    }
                                }
                            }
                        });
                    }, 100)
                );
                
                observer.observe(modal, {
                    attributes: true,
                    attributeFilter: ['style']
                });
                
                state.observers.set(modalId, observer);
            });
        },
        
        /**
         * 클릭 이벤트 설정
         */
        setupClickHandlers() {
            // 디바운스된 핸들러
            const handleClick = utils.debounce((e) => {
                const target = e.target;
                const buttonText = target.textContent || '';
                const closestButton = target.closest('button');
                
                const isPreviewTrigger = config.previewTriggerKeywords.some(keyword => 
                    buttonText.toLowerCase().includes(keyword.toLowerCase()) || 
                    target.id?.toLowerCase().includes(keyword.toLowerCase()) ||
                    closestButton?.textContent?.toLowerCase().includes(keyword.toLowerCase())
                );
                
                if (isPreviewTrigger) {
                    log('🔍 설정 버튼 클릭 감지:', buttonText || target.id);
                    
                    // 다중 체크
                    [100, 300, 500].forEach(delay => {
                        setTimeout(() => {
                            if (modalManager.isAnyPreviewModalOpen() && !state.isPreviewMode) {
                                previewController.enable();
                                controlManager.setupAll();
                            }
                        }, delay);
                    });
                }
            }, 50);
            
            document.addEventListener('click', handleClick);
            state.eventListeners.set('click', handleClick);
        },
        
        /**
         * 키보드 단축키 설정
         */
        setupKeyboardShortcuts() {
            const handleKeydown = (e) => {
                // 모달이 열린 상태에서만 작동
                if (!modalManager.isAnyPreviewModalOpen()) return;
                
                // ESC 키로 모달 닫기
                if (e.code === 'Escape') {
                    const openModal = modalManager.findOpenModal();
                    if (openModal) {
                        e.preventDefault();
                        openModal.style.display = 'none';
                        const closeBtn = openModal.querySelector('.close');
                        if (closeBtn) closeBtn.click();
                        notificationManager.show('설정이 닫혔습니다 (ESC키)', 'info');
                    }
                    return;
                }
                
                // Ctrl + 1~9: 미리보기 축소 비율 설정
                if (e.ctrlKey && e.code >= 'Digit1' && e.code <= 'Digit9') {
                    e.preventDefault();
                    const digit = parseInt(e.code.replace('Digit', ''));
                    const newScale = digit * 10;
                    
                    state.previewScale = Math.max(config.minScale, Math.min(config.maxScale, newScale));
                    if (state.isPreviewMode) {
                        previewController.applyScale(state.previewScale);
                    }
                    
                    // UI 업데이트
                    this.updateAllSliders();
                    
                    notificationManager.show(`미리보기 크기: ${state.previewScale}%`, 'info');
                }
                
                // Ctrl + 0: 미리보기 리셋
                else if (e.ctrlKey && e.code === 'Digit0') {
                    e.preventDefault();
                    state.previewScale = config.defaultScale;
                    if (state.isPreviewMode) {
                        previewController.applyScale(state.previewScale);
                    }
                    
                    this.updateAllSliders();
                    
                    notificationManager.show('미리보기 크기 리셋: 80%', 'info');
                }
            };
            
            document.addEventListener('keydown', handleKeydown);
            state.eventListeners.set('keydown', handleKeydown);
        },
        
        /**
         * 모든 슬라이더 UI 업데이트
         */
        updateAllSliders() {
            const sliderIds = ['previewScale', 'themePreviewScale', 'colorPreviewScale', 'fontPreviewScale'];
            const valueIds = ['previewScaleValue', 'themePreviewScaleValue', 'colorPreviewScaleValue', 'fontPreviewScaleValue'];
            
            sliderIds.forEach((sliderId, index) => {
                const slider = document.getElementById(sliderId);
                const valueSpan = document.getElementById(valueIds[index]);
                if (slider) slider.value = state.previewScale;
                if (valueSpan) valueSpan.textContent = state.previewScale + '%';
            });
        }
    };
    
    // ========== 초기화 ==========
    const init = () => {
        // DOM 로드 완료 대기
        const initialize = () => {
            // 설정 복원
            const savedScale = utils.storage.get('previewScale');
            if (savedScale) {
                state.previewScale = Math.max(config.minScale, Math.min(config.maxScale, savedScale));
            }
            
            // 이벤트 설정
            eventManager.setupObservers();
            eventManager.setupClickHandlers();
            eventManager.setupKeyboardShortcuts();
            
            // 동적 모달 감지
            const bodyObserver = new MutationObserver(
                utils.debounce((mutations) => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                node.classList?.contains('modal') &&
                                config.previewSupportedModals.includes(node.id)) {
                                setTimeout(() => {
                                    previewController.enable();
                                    controlManager.setupAll();
                                }, 100);
                            }
                        });
                    });
                }, 100)
            );
            
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            state.observers.set('body', bodyObserver);
            
            log('✅ 미리보기 제어 시스템 초기화 완료');
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    };
    
    // ========== 공개 API ==========
    window.PreviewControl = {
        enable: () => previewController.enable(),
        disable: () => previewController.disable(),
        setScale: (scale) => {
            state.previewScale = Math.max(config.minScale, Math.min(config.maxScale, scale));
            if (state.isPreviewMode) {
                previewController.applyScale(state.previewScale);
            }
        },
        getScale: () => state.previewScale,
        isEnabled: () => state.isPreviewMode,
        cleanup: () => {
            // 모든 관찰자 제거
            state.observers.forEach(observer => observer.disconnect());
            state.observers.clear();
            
            // 모든 이벤트 리스너 제거
            state.eventListeners.forEach((handler, event) => {
                document.removeEventListener(event, handler);
            });
            state.eventListeners.clear();
            
            // 미리보기 비활성화
            previewController.disable();
            
            log('🧹 미리보기 제어 시스템 정리 완료');
        }
    };
    
    // 초기화 실행
    init();
    
})();