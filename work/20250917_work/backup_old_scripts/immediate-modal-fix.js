/**
 * 즉시 실행 모달 수정 - 브라우저 콘솔에 붙여넣기용
 * 페이지를 새로고침하지 않고도 즉시 모든 모달 위치 수정
 */

// 즉시 실행 함수
(function immediateModalFix() {
    console.log('🚨 즉시 모달 위치 수정 실행');
    
    // 1. 강력한 CSS 즉시 적용
    const style = document.createElement('style');
    style.id = 'immediateModalFix';
    style.textContent = `
        /* 모든 모달 강제 중앙 정렬 */
        .modal, [id*="Modal"], [id*="modal"], [class*="modal"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
        }
        
        /* 특정 모달 ID들 */
        #fontSizeModal, #colorModeModal, #themeModal, #layoutModal,
        #memoModal, #scheduleModal, #backupMenuModal, #editMemoModal,
        #excelExportModal, #cloudSettingsModal, #lockModal, #confirmDialog {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
        }
        
        /* 모달 콘텐츠 */
        .modal-content, .modal-body, .modal > div:first-child {
            position: relative !important;
            margin: auto !important;
            max-width: 90vw !important;
            max-height: 90vh !important;
            background: white !important;
            border-radius: 12px !important;
            padding: 20px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            overflow: auto !important;
            transform: none !important;
        }
        
        /* 미리보기 모드에서도 모달은 정상 */
        body[style*="transform"] .modal {
            transform: none !important;
            scale: 1 !important;
        }
    `;
    
    // 기존 스타일 제거 후 추가
    const existing = document.getElementById('immediateModalFix');
    if (existing) existing.remove();
    document.head.appendChild(style);
    
    // 2. 모든 모달 JavaScript로 강제 위치 조정
    const allModals = document.querySelectorAll('.modal, [id*="Modal"], [id*="modal"], [class*="modal"]');
    let fixedCount = 0;
    
    allModals.forEach(modal => {
        modal.style.cssText = `
            position: fixed !important;
            top: 0px !important;
            left: 0px !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            margin: 0px !important;
            padding: 0px !important;
            transform: none !important;
        `;
        
        // 모달 콘텐츠도 수정
        const content = modal.querySelector('.modal-content, .modal-body') || modal.children[0];
        if (content) {
            content.style.cssText = `
                position: relative !important;
                margin: auto !important;
                max-width: 90vw !important;
                max-height: 90vh !important;
                background: white !important;
                border-radius: 12px !important;
                padding: 20px !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                overflow: auto !important;
                transform: none !important;
            `;
        }
        
        fixedCount++;
    });
    
    console.log(`✅ ${fixedCount}개 모달 즉시 위치 수정 완료`);
    
    // 3. 전역 수정 함수 등록
    window.fixAllModalsNow = function() {
        document.querySelectorAll('.modal, [id*="Modal"]').forEach(modal => {
            modal.style.cssText = `
                position: fixed !important;
                top: 0px !important;
                left: 0px !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 999999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(0, 0, 0, 0.5) !important;
            `;
        });
        return '모든 모달 위치 즉시 수정 완료!';
    };
    
    return `즉시 모달 수정 완료! ${fixedCount}개 모달 처리됨`;
})();