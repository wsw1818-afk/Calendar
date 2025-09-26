/**
 * 궁극적인 모달 위치 수정
 * - 모든 모달을 강제로 화면 중앙에 고정
 * - 미리보기 모드와 관계없이 정확한 위치 보장
 * - 실시간 위치 모니터링 및 자동 보정
 */

(function() {
    'use strict';
    
    console.log('🎯 궁극적인 모달 위치 수정 시작');
    
    // ========== 전역 설정 ==========
    const MODAL_CONFIG = {
        zIndex: 999999,
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        contentMaxWidth: '90vw',
        contentMaxHeight: '90vh',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    };
    
    // ========== 1. 강력한 CSS 오버라이드 ==========
    function applyUltimateModalCSS() {
        console.log('🎨 궁극적인 모달 CSS 적용');
        
        const style = document.createElement('style');
        style.id = 'ultimateModalFix';
        style.textContent = `
            /* === 모든 모달 강제 중앙 정렬 === */
            .modal,
            [id*="Modal"],
            [id*="modal"],
            [class*="modal"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                transform: none !important;
                translate: none !important;
                scale: none !important;
                rotate: none !important;
                z-index: ${MODAL_CONFIG.zIndex} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${MODAL_CONFIG.backdropColor} !important;
                backdrop-filter: blur(3px) !important;
                animation: modalFadeIn 0.3s ease !important;
            }
            
            /* === 특정 모달 ID 강제 적용 === */
            #fontSizeModal,
            #colorModeModal,
            #themeModal,
            #layoutModal,
            #excelModal,
            #excelExportModal,
            #stickerModal,
            #unifiedCalendarModal,
            #editMemoModal,
            #memoModal,
            #scheduleModal,
            #backupMenuModal,
            #cloudSettingsModal,
            #lockModal,
            #confirmDialog {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: ${MODAL_CONFIG.zIndex} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: ${MODAL_CONFIG.backdropColor} !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
            }
            
            /* === 모달 콘텐츠 중앙 정렬 === */
            .modal-content,
            .modal-body,
            .modal > div:first-child,
            .modal-dialog,
            .modal-wrapper {
                position: relative !important;
                margin: auto !important;
                max-width: ${MODAL_CONFIG.contentMaxWidth} !important;
                max-height: ${MODAL_CONFIG.contentMaxHeight} !important;
                width: auto !important;
                height: auto !important;
                transform: none !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                bottom: auto !important;
                background: white !important;
                border-radius: ${MODAL_CONFIG.borderRadius} !important;
                padding: ${MODAL_CONFIG.padding} !important;
                box-shadow: ${MODAL_CONFIG.boxShadow} !important;
                overflow: auto !important;
                z-index: ${MODAL_CONFIG.zIndex + 1} !important;
            }
            
            /* === 미리보기 모드에서도 모달은 정상 크기 === */
            body.safe-preview-mode .modal,
            body.preview-mode .modal,
            body.unified-preview-mode .modal,
            body[style*="transform"] .modal {
                transform: none !important;
                scale: 1 !important;
                zoom: 1 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
            }
            
            /* === 드래그 중에도 화면 내 유지 === */
            .modal.dragging,
            .modal[data-dragging="true"] {
                position: fixed !important;
                z-index: ${MODAL_CONFIG.zIndex + 10} !important;
                min-top: 0px !important;
                min-left: 0px !important;
                max-top: calc(100vh - 100px) !important;
                max-left: calc(100vw - 100px) !important;
            }
            
            /* === 애니메이션 === */
            @keyframes modalFadeIn {
                0% { 
                    opacity: 0; 
                    transform: scale(0.9); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1); 
                }
            }
            
            /* === 닫기 버튼 스타일링 === */
            .modal .close,
            .modal [id*="Close"],
            .modal .modal-close {
                position: absolute !important;
                top: 15px !important;
                right: 20px !important;
                background: #ff4757 !important;
                color: white !important;
                border: none !important;
                border-radius: 50% !important;
                width: 30px !important;
                height: 30px !important;
                font-size: 18px !important;
                cursor: pointer !important;
                z-index: ${MODAL_CONFIG.zIndex + 2} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: background 0.2s ease !important;
            }
            
            .modal .close:hover,
            .modal [id*="Close"]:hover {
                background: #ff3742 !important;
                transform: scale(1.1) !important;
            }
        `;
        
        // 기존 스타일 제거 후 새로 추가
        const existing = document.getElementById('ultimateModalFix');
        if (existing) existing.remove();
        document.head.appendChild(style);
        
        console.log('✅ 궁극적인 모달 CSS 적용 완료');
    }
    
    // ========== 2. JavaScript로 강제 위치 조정 ==========
    function forceModalPosition(modal) {
        if (!modal || !modal.style) return;
        
        console.log(`🔧 강제 위치 조정: ${modal.id || modal.className}`);
        
        // 모달 컨테이너 스타일 강제 적용
        modal.style.cssText = `
            position: fixed !important;
            top: 0px !important;
            left: 0px !important;
            right: 0px !important;
            bottom: 0px !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0px !important;
            padding: 0px !important;
            z-index: ${MODAL_CONFIG.zIndex} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: ${MODAL_CONFIG.backdropColor} !important;
            transform: none !important;
            translate: none !important;
            scale: none !important;
        `;
        
        // 모달 콘텐츠 찾아서 중앙 정렬
        const content = modal.querySelector('.modal-content, .modal-body, .modal-dialog, .modal-wrapper') || 
                       modal.querySelector('div:not(.modal-backdrop)') ||
                       modal.children[0];
        
        if (content) {
            content.style.cssText = `
                position: relative !important;
                margin: auto !important;
                max-width: ${MODAL_CONFIG.contentMaxWidth} !important;
                max-height: ${MODAL_CONFIG.contentMaxHeight} !important;
                width: auto !important;
                height: auto !important;
                background: white !important;
                border-radius: ${MODAL_CONFIG.borderRadius} !important;
                padding: ${MODAL_CONFIG.padding} !important;
                box-shadow: ${MODAL_CONFIG.boxShadow} !important;
                overflow: auto !important;
                z-index: ${MODAL_CONFIG.zIndex + 1} !important;
                transform: none !important;
            `;
        }
        
        // 포커스 설정
        modal.setAttribute('tabindex', '-1');
        modal.focus();
    }
    
    // ========== 3. 모든 기존 모달 즉시 수정 ==========
    function fixAllExistingModals() {
        console.log('🔄 모든 기존 모달 즉시 수정');
        
        // 다양한 선택자로 모달 찾기
        const selectors = [
            '.modal',
            '[id*="Modal"]',
            '[id*="modal"]', 
            '[class*="modal"]',
            '#fontSizeModal',
            '#colorModeModal',
            '#themeModal',
            '#layoutModal',
            '#memoModal',
            '#scheduleModal',
            '#backupMenuModal',
            '#editMemoModal',
            '#excelExportModal',
            '#cloudSettingsModal',
            '#lockModal',
            '#confirmDialog'
        ];
        
        const allModals = new Set();
        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(modal => allModals.add(modal));
            } catch (e) {
                console.log(`선택자 오류 건너뛰기: ${selector}`);
            }
        });
        
        allModals.forEach(modal => {
            forceModalPosition(modal);
        });
        
        console.log(`✅ ${allModals.size}개 모달 위치 수정 완료`);
    }
    
    // ========== 4. 실시간 모달 감시 ==========
    function setupModalMonitoring() {
        console.log('👁️ 실시간 모달 감시 설정');
        
        // MutationObserver로 새로운 모달 감지
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 추가된 노드가 모달인지 확인
                        const isModal = node.classList?.contains('modal') || 
                                      node.id?.toLowerCase().includes('modal') ||
                                      node.className?.toLowerCase().includes('modal');
                        
                        if (isModal) {
                            console.log(`새 모달 감지: ${node.id || node.className}`);
                            setTimeout(() => forceModalPosition(node), 50);
                        }
                        
                        // 자식 노드 중 모달 찾기
                        try {
                            const childModals = node.querySelectorAll?.('.modal, [id*="Modal"], [class*="modal"]');
                            childModals?.forEach(modal => {
                                setTimeout(() => forceModalPosition(modal), 50);
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
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('✅ 모달 감시자 활성화');
        
        return observer;
    }
    
    // ========== 5. 주기적 위치 검사 및 보정 ==========
    function setupPeriodicFix() {
        console.log('⏰ 주기적 위치 검사 설정');
        
        const checkAndFix = () => {
            const allModals = document.querySelectorAll('.modal, [id*="Modal"], [class*="modal"]');
            let fixedCount = 0;
            
            allModals.forEach(modal => {
                // 표시된 모달만 체크
                const isVisible = modal.style.display !== 'none' && 
                                window.getComputedStyle(modal).display !== 'none';
                
                if (!isVisible) return;
                
                const rect = modal.getBoundingClientRect();
                
                // 위치가 이상한 경우 수정
                const isWrongPosition = rect.top < -50 || 
                                       rect.left < -50 || 
                                       rect.top > window.innerHeight ||
                                       rect.left > window.innerWidth ||
                                       rect.width > window.innerWidth * 1.5 ||
                                       rect.height > window.innerHeight * 1.5;
                
                if (isWrongPosition) {
                    console.log(`위치 이상 감지, 수정: ${modal.id || modal.className}`);
                    forceModalPosition(modal);
                    fixedCount++;
                }
            });
            
            if (fixedCount > 0) {
                console.log(`🔧 ${fixedCount}개 모달 위치 자동 보정`);
            }
        };
        
        // 2초마다 체크
        setInterval(checkAndFix, 2000);
        
        // 윈도우 리사이즈 시에도 체크
        window.addEventListener('resize', () => {
            setTimeout(checkAndFix, 100);
        });
    }
    
    // ========== 6. 모달 열기 이벤트 감지 ==========
    function setupModalOpenDetection() {
        console.log('🎪 모달 열기 이벤트 감지 설정');
        
        // 클릭 이벤트로 모달 열기 감지
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 모달을 여는 버튼들 감지
            const modalTriggers = [
                '[data-toggle="modal"]',
                '[onclick*="Modal"]',
                '[onclick*="modal"]',
                '#fontSizeBtn',
                '#colorModeBtn',
                '#themeBtn',
                '#layoutBtn'
            ];
            
            const isTrigger = modalTriggers.some(selector => {
                try {
                    return target.matches(selector) || target.closest(selector);
                } catch (e) {
                    return false;
                }
            });
            
            if (isTrigger) {
                console.log('모달 트리거 클릭 감지');
                setTimeout(() => {
                    fixAllExistingModals();
                }, 100);
                setTimeout(() => {
                    fixAllExistingModals();
                }, 500);
            }
        });
    }
    
    // ========== 7. 공개 API ==========
    function setupPublicAPI() {
        window.UltimateModalFix = {
            // 즉시 모든 모달 수정
            fixAll: function() {
                console.log('🚨 즉시 모든 모달 수정 실행');
                applyUltimateModalCSS();
                fixAllExistingModals();
                return '모든 모달 위치 수정 완료';
            },
            
            // 특정 모달 수정
            fixModal: function(modalElement) {
                if (modalElement) {
                    forceModalPosition(modalElement);
                    return `모달 수정 완료: ${modalElement.id || modalElement.className}`;
                }
                return '모달 요소를 찾을 수 없습니다';
            },
            
            // 상태 체크
            status: function() {
                const modals = document.querySelectorAll('.modal, [id*="Modal"]');
                const visibleModals = Array.from(modals).filter(modal => 
                    modal.style.display !== 'none' && 
                    window.getComputedStyle(modal).display !== 'none'
                );
                
                return {
                    전체모달수: modals.length,
                    표시된모달수: visibleModals.length,
                    표시된모달들: visibleModals.map(m => m.id || m.className)
                };
            },
            
            // 강제 리셋
            reset: function() {
                applyUltimateModalCSS();
                setupModalMonitoring();
                fixAllExistingModals();
                return '모달 시스템 리셋 완료';
            }
        };
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 궁극적인 모달 위치 수정 초기화');
        
        // 1. CSS 적용
        applyUltimateModalCSS();
        
        // 2. 기존 모달 수정
        fixAllExistingModals();
        
        // 3. 실시간 감시 설정
        setupModalMonitoring();
        
        // 4. 주기적 검사 설정
        setupPeriodicFix();
        
        // 5. 모달 열기 감지
        setupModalOpenDetection();
        
        // 6. 공개 API 설정
        setupPublicAPI();
        
        console.log('✅ 궁극적인 모달 위치 수정 완료');
        
        // 즉시 한 번 더 수정
        setTimeout(() => {
            fixAllExistingModals();
        }, 1000);
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // 즉시 실행 (응급처치)
    applyUltimateModalCSS();
    setTimeout(fixAllExistingModals, 200);
    
    console.log('✅ 궁극적인 모달 위치 수정 로드 완료');
    console.log('💡 수동 수정: UltimateModalFix.fixAll()');
    console.log('💡 상태 확인: UltimateModalFix.status()');
    
})();