/**
 * 깨끗한 시작 화면 수정
 * - 시작할 때 뜨는 엉뚱한 모달들 숨기기
 * - 모달은 필요할 때만 표시되도록 수정
 */

(function() {
    'use strict';
    
    console.log('🧹 깨끗한 시작 화면 수정 시작');
    
    // ========== 1. 시작할 때 모든 모달 숨기기 ==========
    function hideAllModalsOnStartup() {
        console.log('👻 시작 시 모든 모달 숨기기');
        
        const modalSelectors = [
            '.modal',
            '[id*="Modal"]',
            '[id*="modal"]',
            '[class*="modal"]',
            '#themeModal',
            '#backupMenuModal', 
            '#editMemoModal',
            '#excelExportModal',
            '#scheduleModal',
            '#cloudSettingsModal',
            '#layoutModal',
            '#fontSizeModal',
            '#colorModeModal',
            '#confirmDialog',
            '#unifiedCalendarModal'
        ];
        
        let hiddenCount = 0;
        
        modalSelectors.forEach(selector => {
            try {
                const modals = document.querySelectorAll(selector);
                modals.forEach(modal => {
                    // 모달이 보이고 있다면 숨기기
                    const computedStyle = window.getComputedStyle(modal);
                    if (computedStyle.display !== 'none' && modal.style.display !== 'none') {
                        modal.style.display = 'none';
                        modal.style.visibility = 'hidden';
                        modal.setAttribute('aria-hidden', 'true');
                        hiddenCount++;
                        console.log(`🚫 숨김: ${modal.id || modal.className}`);
                    }
                });
            } catch (e) {
                console.log(`선택자 오류 건너뛰기: ${selector}`);
            }
        });
        
        console.log(`✅ ${hiddenCount}개 모달 숨김 완료`);
        
        // body에 modal-open 클래스가 있다면 제거
        document.body.classList.remove('modal-open');
        
        return hiddenCount;
    }
    
    // ========== 2. CSS로 기본 숨김 상태 강제 ==========
    function applyHiddenByDefaultCSS() {
        console.log('🎨 기본 숨김 CSS 적용');
        
        const style = document.createElement('style');
        style.id = 'cleanStartupCSS';
        style.textContent = `
            /* 기본적으로 모든 모달 숨김 */
            .modal,
            [id*="Modal"],
            [id*="modal"],
            [class*="modal"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            /* 명시적으로 보여질 때만 표시 */
            .modal.show,
            .modal[data-show="true"],
            [id*="Modal"].show,
            [id*="Modal"][data-show="true"] {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* 특정 모달들 기본 숨김 */
            #themeModal,
            #backupMenuModal,
            #editMemoModal,
            #excelExportModal, 
            #scheduleModal,
            #cloudSettingsModal,
            #layoutModal,
            #fontSizeModal,
            #colorModeModal,
            #confirmDialog,
            #unifiedCalendarModal {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        
        // 기존 스타일 제거 후 추가
        const existing = document.getElementById('cleanStartupCSS');
        if (existing) existing.remove();
        document.head.appendChild(style);
        
        console.log('✅ 기본 숨김 CSS 적용 완료');
    }
    
    // ========== 3. 모달 표시 함수 오버라이드 ==========
    function overrideModalShowFunctions() {
        console.log('🔧 모달 표시 함수 오버라이드');
        
        // 안전한 모달 표시 함수
        window.safeShowModal = function(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.warn(`모달을 찾을 수 없습니다: ${modalId}`);
                return false;
            }
            
            console.log(`📱 모달 표시: ${modalId}`);
            
            // 다른 모든 모달 숨기기
            hideAllModalsOnStartup();
            
            // 해당 모달만 표시
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('show');
            modal.setAttribute('data-show', 'true');
            
            // 모달 위치 강제 조정
            if (window.UltimateModalFix && typeof window.UltimateModalFix.fixModal === 'function') {
                window.UltimateModalFix.fixModal(modal);
            }
            
            return true;
        };
        
        // 안전한 모달 숨기기 함수
        window.safeHideModal = function(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.warn(`모달을 찾을 수 없습니다: ${modalId}`);
                return false;
            }
            
            console.log(`🚫 모달 숨기기: ${modalId}`);
            
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('show');
            modal.setAttribute('data-show', 'false');
            
            return true;
        };
        
        // 기존 함수들 오버라이드
        const originalFunctions = [
            'showThemeModal',
            'showBackupMenuModal', 
            'showEditMemoModal',
            'showExcelExportModal',
            'showScheduleModal',
            'showCloudSettingsModal',
            'showLayoutModal',
            'showFontSizeModal',
            'showColorModeModal'
        ];
        
        originalFunctions.forEach(funcName => {
            const originalFunc = window[funcName];
            if (typeof originalFunc === 'function') {
                window[funcName] = function(...args) {
                    console.log(`🔄 ${funcName} 호출됨`);
                    
                    // 원본 함수 실행
                    const result = originalFunc.apply(this, args);
                    
                    // 즉시 위치 수정
                    setTimeout(() => {
                        if (window.UltimateModalFix && typeof window.UltimateModalFix.fixAll === 'function') {
                            window.UltimateModalFix.fixAll();
                        }
                    }, 100);
                    
                    return result;
                };
            }
        });
        
        console.log('✅ 모달 표시 함수 오버라이드 완료');
    }
    
    // ========== 4. 자동 모달 생성 방지 ==========
    function preventAutoModalCreation() {
        console.log('🛑 자동 모달 생성 방지');
        
        // MutationObserver로 자동 생성되는 모달 즉시 숨기기
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 새로 추가된 노드가 모달인지 확인
                        const isModal = node.classList?.contains('modal') || 
                                      node.id?.toLowerCase().includes('modal') ||
                                      node.className?.toLowerCase().includes('modal');
                        
                        if (isModal) {
                            console.log(`🚫 자동 생성된 모달 즉시 숨기기: ${node.id || node.className}`);
                            node.style.display = 'none';
                            node.style.visibility = 'hidden';
                            node.setAttribute('aria-hidden', 'true');
                        }
                        
                        // 자식 노드 중 모달 찾아서 숨기기
                        try {
                            const childModals = node.querySelectorAll?.('.modal, [id*="Modal"], [class*="modal"]');
                            childModals?.forEach(modal => {
                                console.log(`🚫 자식 모달 숨기기: ${modal.id || modal.className}`);
                                modal.style.display = 'none';
                                modal.style.visibility = 'hidden';
                                modal.setAttribute('aria-hidden', 'true');
                            });
                        } catch (e) {
                            // 선택자 오류 무시
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ 자동 모달 생성 방지 설정 완료');
        
        return observer;
    }
    
    // ========== 5. 주기적 청소 ==========
    function setupPeriodicCleaning() {
        console.log('🧽 주기적 청소 설정');
        
        const cleanUnwantedModals = () => {
            const visibleModals = document.querySelectorAll('.modal:not([style*="display: none"]), [id*="Modal"]:not([style*="display: none"])');
            let cleanedCount = 0;
            
            visibleModals.forEach(modal => {
                // 사용자가 명시적으로 열지 않은 모달들 숨기기
                if (!modal.classList.contains('user-opened') && 
                    !modal.hasAttribute('data-user-opened') &&
                    !modal.classList.contains('show')) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.setAttribute('aria-hidden', 'true');
                    cleanedCount++;
                }
            });
            
            if (cleanedCount > 0) {
                console.log(`🧹 ${cleanedCount}개 불필요한 모달 정리됨`);
            }
        };
        
        // 5초마다 청소
        setInterval(cleanUnwantedModals, 5000);
        
        // 윈도우 포커스 시에도 청소
        window.addEventListener('focus', cleanUnwantedModals);
    }
    
    // ========== 6. 공개 API ==========
    function setupPublicAPI() {
        window.CleanStartup = {
            // 모든 모달 숨기기
            hideAll: function() {
                return hideAllModalsOnStartup();
            },
            
            // 안전하게 모달 표시
            show: function(modalId) {
                return window.safeShowModal(modalId);
            },
            
            // 안전하게 모달 숨기기
            hide: function(modalId) {
                return window.safeHideModal(modalId);
            },
            
            // 상태 확인
            status: function() {
                const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
                const visibleModals = Array.from(allModals).filter(modal => 
                    modal.style.display !== 'none' && 
                    window.getComputedStyle(modal).display !== 'none'
                );
                
                return {
                    전체모달수: allModals.length,
                    표시된모달수: visibleModals.length,
                    표시된모달들: visibleModals.map(m => m.id || m.className)
                };
            },
            
            // 강제 정리
            cleanup: function() {
                const hidden = hideAllModalsOnStartup();
                applyHiddenByDefaultCSS();
                return `${hidden}개 모달 정리 완료`;
            }
        };
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 깨끗한 시작 화면 초기화');
        
        // 1. CSS 적용
        applyHiddenByDefaultCSS();
        
        // 2. 모든 모달 숨기기
        hideAllModalsOnStartup();
        
        // 3. 모달 함수 오버라이드
        overrideModalShowFunctions();
        
        // 4. 자동 생성 방지
        preventAutoModalCreation();
        
        // 5. 주기적 청소
        setupPeriodicCleaning();
        
        // 6. 공개 API
        setupPublicAPI();
        
        console.log('✅ 깨끗한 시작 화면 초기화 완료');
        
        // 3초 후에도 한 번 더 정리
        setTimeout(() => {
            hideAllModalsOnStartup();
            console.log('🔄 3초 후 추가 정리 완료');
        }, 3000);
    }
    
    // 즉시 실행 (응급처치)
    applyHiddenByDefaultCSS();
    setTimeout(() => {
        hideAllModalsOnStartup();
    }, 500);
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('✅ 깨끗한 시작 화면 로드 완료');
    console.log('💡 모든 모달 숨기기: CleanStartup.hideAll()');
    console.log('💡 상태 확인: CleanStartup.status()');
    
})();