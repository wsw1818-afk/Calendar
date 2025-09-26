/**
 * 즉시 실행 최종 모달 수정 - 브라우저 콘솔에 붙여넣기용
 * 사용자가 클릭한 모달은 보이고, 자동 생성된 모달은 숨기는 완전한 해결책
 */

// 즉시 실행 함수
(function immediateModalFixFinal() {
    console.log('🧠 즉시 최종 모달 수정 실행');
    
    // 1. 전역 상태 설정
    window.UserModalControl = {
        userOpenedModals: new Set(),
        isUserClicking: false,
        allowedModals: new Set([
            'fontSizeModal', 'colorModeModal', 'themeModal', 'layoutModal',
            'stickerModal', 'excelModal', 'googleDriveModal', 'memoModal'
        ])
    };
    
    // 2. 사용자 클릭 감지
    document.addEventListener('click', function(e) {
        const target = e.target;
        const isMenuButton = target.id?.includes('Btn') || target.tagName === 'BUTTON';
        
        if (isMenuButton) {
            console.log(`🎯 사용자 클릭: ${target.id}`);
            window.UserModalControl.isUserClicking = true;
            
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
            if (modalId) {
                window.UserModalControl.userOpenedModals.add(modalId);
                console.log(`✅ 모달 허용: ${modalId}`);
            }
            
            // 3초 후 플래그 해제
            setTimeout(() => {
                window.UserModalControl.isUserClicking = false;
            }, 3000);
        }
    }, true);
    
    // 3. 스마트 모달 표시/숨김 함수
    function smartModalControl(modal, modalId) {
        const isUserIntended = window.UserModalControl.isUserClicking && 
                              window.UserModalControl.allowedModals.has(modalId);
        const isUserOpened = window.UserModalControl.userOpenedModals.has(modalId);
        
        if (isUserIntended || isUserOpened) {
            console.log(`✅ 모달 표시: ${modalId}`);
            
            // 모달 표시
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('user-opened');
            
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
            modal.style.transform = 'none';
            
            return true;
        } else {
            console.log(`🚫 모달 숨김: ${modalId} (자동 생성)`);
            
            // 모달 숨김
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.setAttribute('aria-hidden', 'true');
            
            return false;
        }
    }
    
    // 4. 기존 모달들 스마트 제어
    const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
    allModals.forEach(modal => {
        if (modal.id) {
            smartModalControl(modal, modal.id);
        }
    });
    
    // 5. MutationObserver로 새 모달 감지
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const isModal = node.classList?.contains('modal') || 
                                  node.id?.toLowerCase().includes('modal');
                    
                    if (isModal && node.id) {
                        setTimeout(() => {
                            smartModalControl(node, node.id);
                        }, 100);
                    }
                    
                    // 자식 모달들도 확인
                    try {
                        const childModals = node.querySelectorAll?.('.modal, [id*="Modal"]');
                        childModals?.forEach(modal => {
                            if (modal.id) {
                                setTimeout(() => {
                                    smartModalControl(modal, modal.id);
                                }, 100);
                            }
                        });
                    } catch (e) {
                        // 무시
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 6. 달력 변형 방지
    function preventCalendarDeformation() {
        document.body.style.transform = 'none';
        document.body.style.scale = '1';
        document.body.classList.remove('safe-preview-mode', 'preview-mode');
        
        const containers = document.querySelectorAll('.container, .calendar-container');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.scale = '1';
        });
    }
    
    // 주기적으로 달력 변형 방지
    setInterval(preventCalendarDeformation, 1000);
    
    // 7. 전역 함수 등록
    window.showModalSmart = function(modalId) {
        window.UserModalControl.userOpenedModals.add(modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            return smartModalControl(modal, modalId);
        }
        return false;
    };
    
    window.hideAllAutoModals = function() {
        const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
        let hiddenCount = 0;
        
        allModals.forEach(modal => {
            if (!modal.classList.contains('user-opened') && modal.id) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.setAttribute('aria-hidden', 'true');
                hiddenCount++;
            }
        });
        
        console.log(`🧹 ${hiddenCount}개 자동 모달 숨김`);
        return `${hiddenCount}개 자동 모달 숨김 완료`;
    };
    
    window.checkModalStatus = function() {
        const status = {
            사용자클릭중: window.UserModalControl.isUserClicking,
            허용된모달들: Array.from(window.UserModalControl.userOpenedModals),
            표시중인모달들: Array.from(document.querySelectorAll('.modal[style*="flex"], .modal[style*="block"]')).map(m => m.id)
        };
        
        console.table(status);
        return status;
    };
    
    // 8. 미리보기 함수들 무력화
    const previewFunctions = ['enablePreview', 'disablePreview', 'toggleSafePreview'];
    previewFunctions.forEach(funcName => {
        window[funcName] = function() {
            console.log(`🚫 ${funcName} 차단됨`);
            preventCalendarDeformation();
            return false;
        };
    });
    
    // 즉시 실행
    preventCalendarDeformation();
    hideAllAutoModals();
    
    console.log('✅ 즉시 최종 모달 수정 완료');
    console.log('💡 모달 표시: showModalSmart("fontSizeModal")');
    console.log('💡 자동 모달 숨기기: hideAllAutoModals()');
    console.log('💡 상태 확인: checkModalStatus()');
    
    return '최종 모달 제어 시스템 활성화 완료!';
})();