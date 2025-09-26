/**
 * 즉시 실행 모달 정리 - 브라우저 콘솔에 붙여넣기용
 * 페이지를 새로고침하지 않고도 즉시 모든 엉뚱한 모달들 숨기기
 */

// 즉시 실행 함수
(function immediateCleanup() {
    console.log('🧹 즉시 모달 정리 실행');
    
    // 1. 강제 숨김 CSS 적용
    const style = document.createElement('style');
    style.id = 'immediateCleanupCSS';
    style.textContent = `
        /* 모든 모달 강제 숨김 */
        .modal,
        [id*="Modal"],
        [id*="modal"],
        [class*="modal"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 특정 모달 ID들 강제 숨김 */
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
            pointer-events: none !important;
        }
    `;
    
    // 기존 스타일 제거 후 추가
    const existing = document.getElementById('immediateCleanupCSS');
    if (existing) existing.remove();
    document.head.appendChild(style);
    
    // 2. 모든 모달 JavaScript로 강제 숨기기
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
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                modal.style.pointerEvents = 'none';
                modal.setAttribute('aria-hidden', 'true');
                hiddenCount++;
                console.log(`🚫 숨김: ${modal.id || modal.className}`);
            });
        } catch (e) {
            console.log(`선택자 오류 건너뛰기: ${selector}`);
        }
    });
    
    // 3. body 클래스 정리
    document.body.classList.remove('modal-open');
    
    // 4. 전역 정리 함수 등록
    window.hideAllModalsNow = function() {
        document.querySelectorAll('.modal, [id*="Modal"], [id*="modal"], [class*="modal"]').forEach(modal => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.classList.remove('modal-open');
        return '모든 모달 숨김 완료!';
    };
    
    // 5. 안전한 모달 표시 함수
    window.showModalSafely = function(modalId) {
        // 먼저 모든 모달 숨기기
        window.hideAllModalsNow();
        
        // 해당 모달만 표시
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modal.setAttribute('aria-hidden', 'false');
            
            // 위치 중앙 정렬
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.zIndex = '999999';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.background = 'rgba(0, 0, 0, 0.5)';
            
            console.log(`✅ 모달 안전하게 표시: ${modalId}`);
            return true;
        }
        
        console.warn(`모달을 찾을 수 없습니다: ${modalId}`);
        return false;
    };
    
    console.log(`✅ ${hiddenCount}개 모달 즉시 정리 완료`);
    
    return `즉시 모달 정리 완료! ${hiddenCount}개 모달 숨김`;
})();