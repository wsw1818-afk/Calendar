/**
 * 모달 위치 수정 스크립트
 * - 미리보기 모드에서도 모달이 정확한 위치에 표시
 * - 모든 모달의 위치를 화면 중앙으로 고정
 */

(function() {
    'use strict';
    
    console.log('📍 모달 위치 수정 시작');
    
    // ========== 1. 모달 위치 고정 함수 ==========
    function fixModalPosition(modal) {
        if (!modal) return;
        
        console.log(`📍 모달 위치 수정: ${modal.id}`);
        
        // 모달을 뷰포트 중앙에 고정
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0, 0, 0, 0.5)';
        
        // 모달 콘텐츠 위치 수정
        const modalContent = modal.querySelector('.modal-content') || 
                           modal.querySelector('.modal-body') || 
                           modal.querySelector('div');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.transform = 'none';
            modalContent.style.top = 'auto';
            modalContent.style.left = 'auto';
            modalContent.style.margin = 'auto';
            modalContent.style.maxWidth = '90vw';
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflow = 'auto';
            modalContent.style.background = 'white';
            modalContent.style.borderRadius = '10px';
            modalContent.style.padding = '20px';
            modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        }
    }
    
    // ========== 2. 모든 기존 모달 위치 수정 ==========
    function fixAllExistingModals() {
        console.log('🔍 기존 모달 위치 수정');
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            fixModalPosition(modal);
        });
        
        console.log(`✅ ${modals.length}개 모달 위치 수정 완료`);
    }
    
    // ========== 3. 새로 생성되는 모달 감시 ==========
    function setupModalObserver() {
        console.log('👁️ 모달 감시자 설정');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 모달이 추가된 경우
                        if (node.classList?.contains('modal') || node.id?.includes('Modal')) {
                            console.log(`새 모달 감지: ${node.id}`);
                            setTimeout(() => {
                                fixModalPosition(node);
                            }, 50);
                        }
                        
                        // 자식에 모달이 있는 경우
                        const childModals = node.querySelectorAll?.('.modal, [id*="Modal"]');
                        childModals?.forEach(modal => {
                            setTimeout(() => {
                                fixModalPosition(modal);
                            }, 50);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ 모달 감시자 활성화');
    }
    
    // ========== 4. 특정 모달 ID별 수정 ==========
    function fixSpecificModals() {
        console.log('🎯 특정 모달 수정');
        
        const modalIds = [
            'fontSizeModal',
            'colorModeModal',
            'themeModal',
            'layoutModal',
            'excelExportModal',
            'stickerModal',
            'unifiedCalendarModal',
            'editMemoModal'
        ];
        
        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                fixModalPosition(modal);
                console.log(`✅ ${id} 위치 수정`);
            }
        });
    }
    
    // ========== 5. 미리보기 모드 보정 ==========
    function fixPreviewModeModals() {
        console.log('🔍 미리보기 모드 모달 보정');
        
        // 미리보기 모드에서 모달이 축소되지 않도록
        const style = document.createElement('style');
        style.id = 'modalPositionFix';
        style.textContent = `
            /* 모든 모달을 뷰포트 전체에 고정 */
            .modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 10000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transform: none !important;
                transform-origin: center !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* 특정 모달 ID들 강제 중앙 정렬 */
            #fontSizeModal,
            #colorModeModal,
            #themeModal,
            #layoutModal,
            #excelModal,
            #excelExportModal,
            #stickerModal,
            #unifiedCalendarModal,
            #editMemoModal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                background: rgba(0, 0, 0, 0.5) !important;
            }
            
            /* 모달 콘텐츠 중앙 정렬 */
            .modal-content,
            .modal > div:first-child {
                position: relative !important;
                transform: none !important;
                margin: auto !important;
                max-width: 90vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
            }
            
            /* 미리보기 모드에서도 모달은 정상 크기 */
            body.safe-preview-mode .modal,
            body.preview-mode .modal,
            body.unified-preview-mode .modal {
                transform: none !important;
                scale: 1 !important;
            }
            
            /* 드래그 중일 때도 위치 보정 */
            .modal.dragging {
                position: fixed !important;
                z-index: 10001 !important;
            }
        `;
        
        // 기존 스타일 제거 후 추가
        const existing = document.getElementById('modalPositionFix');
        if (existing) existing.remove();
        document.head.appendChild(style);
        
        console.log('✅ 모달 위치 CSS 적용');
    }
    
    // ========== 6. 주기적 위치 체크 ==========
    function setupPeriodicCheck() {
        console.log('⏰ 주기적 위치 체크 설정');
        
        setInterval(() => {
            const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
            modals.forEach(modal => {
                // 모달이 화면 밖에 있다면 위치 수정
                const rect = modal.getBoundingClientRect();
                if (rect.left < -100 || rect.top < -100 || rect.left > window.innerWidth) {
                    console.log(`위치 이상 감지, 수정: ${modal.id}`);
                    fixModalPosition(modal);
                }
            });
        }, 3000);
    }
    
    // ========== 7. 모달 닫기 버튼 수정 ==========
    function fixModalCloseButtons() {
        console.log('❌ 모달 닫기 버튼 수정');
        
        document.addEventListener('click', function(e) {
            // 모달 배경 클릭으로 닫기
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                console.log('모달 배경 클릭으로 닫기');
            }
            
            // 닫기 버튼 클릭
            if (e.target.classList.contains('close') || e.target.textContent === '×') {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    console.log('닫기 버튼으로 모달 닫기');
                }
            }
        });
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 모달 위치 수정 초기화');
        
        // 1. CSS 스타일 적용
        fixPreviewModeModals();
        
        // 2. 기존 모달 수정
        fixAllExistingModals();
        fixSpecificModals();
        
        // 3. 감시자 설정
        setupModalObserver();
        
        // 4. 주기적 체크
        setupPeriodicCheck();
        
        // 5. 닫기 버튼 수정
        fixModalCloseButtons();
        
        console.log('✅ 모달 위치 수정 완료');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // ========== 즉시 수정 함수 ==========
    window.fixModalPositionsNow = function() {
        console.log('🚨 즉시 모든 모달 위치 수정');
        
        // 1. CSS 강제 적용
        const forceStyle = document.createElement('style');
        forceStyle.id = 'forceModalCenter';
        forceStyle.textContent = `
            .modal, [id*="Modal"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 10000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transform: none !important;
                background: rgba(0, 0, 0, 0.5) !important;
            }
        `;
        
        const existing = document.getElementById('forceModalCenter');
        if (existing) existing.remove();
        document.head.appendChild(forceStyle);
        
        // 2. 모든 모달 직접 수정
        const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
        allModals.forEach(modal => {
            modal.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 10000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transform: none !important;
                background: rgba(0, 0, 0, 0.5) !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            console.log(`즉시 수정: ${modal.id}`);
        });
        
        console.log(`✅ ${allModals.length}개 모달 즉시 수정 완료`);
    };
    
    // 전역 유틸리티
    window.modalPositionFix = {
        fixAll: fixAllExistingModals,
        fixSpecific: fixSpecificModals,
        fixModal: fixModalPosition,
        fixNow: window.fixModalPositionsNow,
        reset: init
    };
    
    console.log('✅ 모달 위치 수정 스크립트 로드');
    console.log('💡 수동 수정: modalPositionFix.fixAll()');
    
})();