/**
 * 최종 해결책 - 브라우저 콘솔에 붙여넣기용
 * 모든 간섭 시스템 제거하고 순수하게 작동하는 모달 시스템
 */

// 즉시 실행 함수
(function finalSolution() {
    console.log('🎯 최종 해결책 실행');
    
    // 1. 모든 간섭 함수들 완전 무력화
    const interfereFunctions = [
        'enablePreview', 'disablePreview', 'toggleSafePreview', 'togglePreview',
        'showPreview', 'hidePreview', 'safeShowModal', 'safeHideModal',
        'hideAllModalsNow', 'fixAllModalsNow', 'restoreCalendarNow',
        'showModalSafely', 'hideAllAutoModals', 'fixModalPositionsNow'
    ];
    
    interfereFunctions.forEach(funcName => {
        window[funcName] = function() {
            console.log(`🚫 ${funcName} 차단됨`);
            return false;
        };
    });
    
    // 2. 간섭 객체들 무력화
    if (window.CleanStartup) {
        window.CleanStartup.hideAll = () => 0;
        window.CleanStartup.cleanup = () => 0;
    }
    
    if (window.DisableAutoPreview) {
        window.DisableAutoPreview.restore = () => {};
        window.DisableAutoPreview.disable = () => {};
    }
    
    if (window.PreviewControl) {
        window.PreviewControl.enable = () => false;
        window.PreviewControl.disable = () => true;
        window.PreviewControl.isEnabled = () => false;
    }
    
    if (window.StablePreview) {
        window.StablePreview.isActive = false;
        window.StablePreview.isTransitioning = false;
    }
    
    // 3. 달력 변형 완전 방지 CSS
    const antiDeformCSS = document.createElement('style');
    antiDeformCSS.id = 'finalSolutionCSS';
    antiDeformCSS.textContent = `
        /* 달력 원본 모양 고정 */
        body, .container, .calendar-container, #calendar {
            transform: none !important;
            scale: 1 !important;
            zoom: 1 !important;
            width: auto !important;
            height: auto !important;
        }
        
        /* 미리보기 모드 완전 차단 */
        .safe-preview-mode, .preview-mode, .unified-preview-mode {
            transform: none !important;
            scale: 1 !important;
        }
        
        /* 자동 생성 모달들만 숨김 */
        .modal:not(.user-opened),
        [id*="Modal"]:not(.user-opened) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        /* 사용자가 연 모달은 표시 */
        .modal.user-opened,
        [id*="Modal"].user-opened {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            transform: none !important;
        }
    `;
    
    const existing = document.getElementById('finalSolutionCSS');
    if (existing) existing.remove();
    document.head.appendChild(antiDeformCSS);
    
    // 4. 사용자 클릭 감지 및 모달 제어
    window.UserModalState = {
        clickedButtons: new Set(),
        allowedModals: new Set(['fontSizeModal', 'colorModeModal', 'themeModal', 'layoutModal', 'stickerModal', 'excelModal', 'googleDriveModal'])
    };
    
    // 메뉴 버튼 클릭 감지
    document.addEventListener('click', function(e) {
        const target = e.target;
        const isMenuButton = target.id?.includes('Btn') || target.tagName === 'BUTTON';
        
        if (isMenuButton) {
            console.log(`🎯 사용자 클릭: ${target.id}`);
            
            // 버튼과 모달 매핑
            const buttonModalMap = {
                'fontSizeDetailBtn': 'fontSizeModal',
                'colorModeDetailBtn': 'colorModeModal',
                'themeBtn': 'themeModal',
                'layoutBtn': 'layoutModal',
                'stickerBtn': 'stickerModal',
                'excelBtn': 'excelModal',
                'googleDriveBtn': 'googleDriveModal'
            };
            
            const modalId = buttonModalMap[target.id];
            if (modalId && window.UserModalState.allowedModals.has(modalId)) {
                window.UserModalState.clickedButtons.add(modalId);
                console.log(`✅ 모달 허용: ${modalId}`);
                
                // 1초 후 해당 모달을 사용자 모달로 마킹
                setTimeout(() => {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('user-opened');
                        modal.setAttribute('data-user-opened', 'true');
                        console.log(`👤 사용자 모달로 마킹: ${modalId}`);
                    }
                }, 1000);
            }
        }
    }, true);
    
    // 5. MutationObserver로 새 모달 감지
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.id) {
                    const isModal = node.classList?.contains('modal') || node.id?.toLowerCase().includes('modal');
                    
                    if (isModal) {
                        const modalId = node.id;
                        
                        if (window.UserModalState.clickedButtons.has(modalId)) {
                            console.log(`✅ 사용자 모달 표시: ${modalId}`);
                            node.classList.add('user-opened');
                            node.setAttribute('data-user-opened', 'true');
                        } else {
                            console.log(`🚫 자동 모달 숨김: ${modalId}`);
                            node.classList.remove('user-opened');
                            node.removeAttribute('data-user-opened');
                        }
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 6. 달력 변형 실시간 방지
    function keepCalendarNormal() {
        document.body.style.transform = 'none';
        document.body.style.scale = '1';
        document.body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
        
        const containers = document.querySelectorAll('.container, .calendar-container');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.scale = '1';
        });
    }
    
    // 즉시 실행 및 주기적 실행
    keepCalendarNormal();
    setInterval(keepCalendarNormal, 500);
    
    // 7. 모달 닫기 감지
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.user-opened');
            openModals.forEach(modal => {
                window.UserModalState.clickedButtons.delete(modal.id);
                modal.classList.remove('user-opened');
                modal.removeAttribute('data-user-opened');
                console.log(`🚪 모달 닫기: ${modal.id}`);
            });
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close') || 
            e.target.id?.includes('Close') ||
            e.target.textContent === '×' ||
            e.target.classList.contains('modal')) {
            
            const modal = e.target.closest('.modal') || e.target;
            if (modal && modal.id && modal.classList.contains('user-opened')) {
                window.UserModalState.clickedButtons.delete(modal.id);
                modal.classList.remove('user-opened');
                modal.removeAttribute('data-user-opened');
                console.log(`🚪 모달 닫기: ${modal.id}`);
            }
        }
    });
    
    // 8. 전역 함수
    window.openModalClean = function(modalId) {
        window.UserModalState.clickedButtons.add(modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('user-opened');
            modal.setAttribute('data-user-opened', 'true');
            console.log(`📱 모달 열기: ${modalId}`);
            return true;
        }
        return false;
    };
    
    window.closeAllModalsClean = function() {
        const openModals = document.querySelectorAll('.modal.user-opened');
        openModals.forEach(modal => {
            window.UserModalState.clickedButtons.delete(modal.id);
            modal.classList.remove('user-opened');
            modal.removeAttribute('data-user-opened');
        });
        console.log(`🧹 ${openModals.length}개 모달 닫음`);
        return openModals.length;
    };
    
    window.getModalStatus = function() {
        const status = {
            허용된모달들: Array.from(window.UserModalState.clickedButtons),
            열린모달들: Array.from(document.querySelectorAll('.modal.user-opened')).map(m => m.id),
            달력변형여부: document.body.style.transform !== 'none' && document.body.style.transform !== ''
        };
        console.table(status);
        return status;
    };
    
    // 즉시 기존 모달들 정리
    const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
    allModals.forEach(modal => {
        if (!modal.classList.contains('user-opened')) {
            modal.classList.remove('user-opened');
            modal.removeAttribute('data-user-opened');
        }
    });
    
    console.log('✅ 최종 해결책 완료');
    console.log('💡 모달 열기: openModalClean("fontSizeModal")');
    console.log('💡 모든 모달 닫기: closeAllModalsClean()');
    console.log('💡 상태 확인: getModalStatus()');
    
    return '최종 해결책 적용 완료!';
})();