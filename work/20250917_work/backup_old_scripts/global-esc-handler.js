/**
 * 전역 ESC 키 핸들러 - 모든 모달과 메뉴에 ESC로 닫기 기능 제공
 */

(function() {
    'use strict';
    
    console.log('⌨️ 전역 ESC 키 핸들러 초기화');
    
    // ========== 모든 모달 ID 목록 ==========
    const modalIds = [
        'memoModal',
        'themeModal', 
        'backupMenuModal',
        'editMemoModal',
        'excelExportModal',
        'scheduleModal',
        'cloudSettingsModal',
        'layoutModal',
        'lockModal',
        'confirmDialog',
        'colorModeModal',
        'fontModal'
    ];
    
    // ========== ESC 키 이벤트 핸들러 ==========
    function handleEscapeKey(e) {
        if (e.code === 'Escape' || e.key === 'Escape') {
            // 입력 필드에서 ESC를 누른 경우 포커스 해제만 하고 모달은 닫지 않음
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.target.blur();
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            let modalClosed = false;
            
            // 1. 열린 모달 찾아서 닫기 (우선순위 순서)
            for (const modalId of modalIds) {
                const modal = document.getElementById(modalId);
                if (modal && isModalOpen(modal)) {
                    closeModal(modal, modalId);
                    modalClosed = true;
                    break;
                }
            }
            
            // 2. 다른 열린 모달들 체크 (동적 생성된 모달들)
            if (!modalClosed) {
                const openModals = document.querySelectorAll('.modal[style*="block"], .modal[style*="flex"]');
                openModals.forEach(modal => {
                    if (isModalOpen(modal)) {
                        closeModal(modal, modal.id);
                        modalClosed = true;
                    }
                });
            }
            
            // 3. 드롭다운 메뉴들 닫기
            if (!modalClosed) {
                closeDropdownMenus();
                modalClosed = true;
            }
            
            // 4. 알림 표시
            if (modalClosed) {
                showNotification('창이 닫혔습니다 (ESC키)', 'info');
            }
        }
    }
    
    // ========== 모달 열림 상태 확인 ==========
    function isModalOpen(modal) {
        if (!modal) return false;
        
        const display = window.getComputedStyle(modal).display;
        const visibility = window.getComputedStyle(modal).visibility;
        
        return (display === 'flex' || display === 'block') && 
               visibility !== 'hidden' && 
               modal.style.display !== 'none';
    }
    
    // ========== 모달 닫기 ==========
    function closeModal(modal, modalId) {
        console.log(`🔒 모달 닫기: ${modalId}`);
        
        // 1. 스타일로 숨기기
        modal.style.display = 'none';
        
        // 2. 닫기 버튼 찾아서 클릭 (이벤트 핸들러 실행)
        const closeBtn = modal.querySelector('.close, [id$="Close"], .cancel-btn, .modal-close');
        if (closeBtn) {
            closeBtn.click();
        }
        
        // 3. 특별한 처리가 필요한 모달들
        switch (modalId) {
            case 'memoModal':
                // 메모 모달의 경우 통합 캘린더 시스템의 closeModal 호출
                if (typeof window.UnifiedCalendar?.closeModal === 'function') {
                    window.UnifiedCalendar.closeModal();
                }
                break;
                
            case 'layoutModal':
                // 레이아웃 모달의 경우 미리보기 모드 해제
                if (typeof window.PreviewControl?.disable === 'function') {
                    window.PreviewControl.disable();
                }
                break;
                
            case 'themeModal':
                // 테마 모달 특별 처리
                const themeCloseBtn = document.getElementById('themeClose');
                if (themeCloseBtn) {
                    themeCloseBtn.click();
                }
                break;
                
            case 'scheduleModal':
                // 스케줄 모달 특별 처리
                const scheduleCloseBtn = document.getElementById('scheduleClose');
                if (scheduleCloseBtn) {
                    scheduleCloseBtn.click();
                }
                break;
                
            case 'backupMenuModal':
                // 백업 메뉴 모달 특별 처리
                const backupCloseBtn = document.getElementById('backupMenuClose');
                if (backupCloseBtn) {
                    backupCloseBtn.click();
                }
                break;
                
            case 'cloudSettingsModal':
                // 클라우드 설정 모달 특별 처리
                const cloudCloseBtn = document.getElementById('cloudSettingsClose');
                if (cloudCloseBtn) {
                    cloudCloseBtn.click();
                }
                break;
        }
        
        // 4. body 클래스 정리
        document.body.classList.remove('modal-open');
    }
    
    // ========== 드롭다운 메뉴 닫기 ==========
    function closeDropdownMenus() {
        let menuClosed = false;
        
        // 1. 날짜 선택 드롭다운
        const dateDropdown = document.getElementById('dateDropdown');
        if (dateDropdown && dateDropdown.style.display !== 'none') {
            dateDropdown.style.display = 'none';
            menuClosed = true;
        }
        
        // 2. 다른 드롭다운들
        const dropdowns = document.querySelectorAll('.dropdown, .date-dropdown, [id$="Dropdown"]');
        dropdowns.forEach(dropdown => {
            if (dropdown.style.display === 'block' || dropdown.style.display === 'flex') {
                dropdown.style.display = 'none';
                menuClosed = true;
            }
        });
        
        // 3. 열린 메뉴들 (visible 클래스가 있는 것들)
        const visibleMenus = document.querySelectorAll('.visible, .show, .open, [aria-expanded="true"]');
        visibleMenus.forEach(menu => {
            menu.classList.remove('visible', 'show', 'open');
            menu.setAttribute('aria-expanded', 'false');
            menuClosed = true;
        });
        
        return menuClosed;
    }
    
    // ========== 알림 표시 ==========
    function showNotification(message, type = 'info') {
        // 다양한 알림 시스템 시도
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // 간단한 알림 표시
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                z-index: 1000000;
                animation: fadeInOut 3s ease-in-out forwards;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            notification.textContent = message;
            
            // 애니메이션 CSS 추가
            if (!document.getElementById('escNotificationStyle')) {
                const style = document.createElement('style');
                style.id = 'escNotificationStyle';
                style.textContent = `
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateX(100%); }
                        15% { opacity: 1; transform: translateX(0); }
                        85% { opacity: 1; transform: translateX(0); }
                        100% { opacity: 0; transform: translateX(100%); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            // 3초 후 제거
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
    }
    
    // ========== 고급 모달 감지 ==========
    function findOpenModals() {
        const allModals = document.querySelectorAll('.modal, [class*="modal"], [id*="modal"], [id*="Modal"]');
        const openModals = [];
        
        allModals.forEach(modal => {
            if (isModalOpen(modal)) {
                openModals.push(modal);
            }
        });
        
        return openModals;
    }
    
    // ========== 컨텍스트 메뉴 닫기 ==========
    function closeContextMenus() {
        const contextMenus = document.querySelectorAll('.context-menu, .right-click-menu');
        let menuClosed = false;
        
        contextMenus.forEach(menu => {
            if (menu.style.display !== 'none') {
                menu.style.display = 'none';
                menuClosed = true;
            }
        });
        
        return menuClosed;
    }
    
    // ========== 이벤트 리스너 등록 ==========
    function initEscHandler() {
        // 기존 ESC 핸들러가 있다면 제거
        document.removeEventListener('keydown', handleEscapeKey);
        
        // 새로운 ESC 핸들러 등록 (capture phase)
        document.addEventListener('keydown', handleEscapeKey, true);
        
        // 추가적인 이벤트 리스너 등록 (bubble phase)
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Escape') {
                // 혹시 놓친 모달들을 위한 백업 처리
                setTimeout(() => {
                    const remainingModals = findOpenModals();
                    if (remainingModals.length > 0) {
                        remainingModals.forEach(modal => {
                            modal.style.display = 'none';
                        });
                        console.log(`🔧 백업 처리로 ${remainingModals.length}개 모달 닫음`);
                    }
                }, 100);
            }
        }, false);
        
        console.log('✅ 전역 ESC 키 핸들러 등록 완료');
    }
    
    // ========== 페이지 로드 시 초기화 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEscHandler);
    } else {
        initEscHandler();
    }
    
    // ========== 공개 API ==========
    window.GlobalEscHandler = {
        closeAllModals: function() {
            modalIds.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && isModalOpen(modal)) {
                    closeModal(modal, modalId);
                }
            });
        },
        closeAllMenus: closeDropdownMenus,
        isAnyModalOpen: function() {
            return findOpenModals().length > 0;
        }
    };
    
    console.log('✅ 전역 ESC 키 핸들러 초기화 완료');
    
})();