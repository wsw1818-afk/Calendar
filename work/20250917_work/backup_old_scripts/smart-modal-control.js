/**
 * 스마트 모달 제어
 * - 사용자가 의도적으로 연 모달은 표시 허용
 * - 자동으로 뜨는 불필요한 모달만 숨김
 * - clean-startup-fix.js 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🧠 스마트 모달 제어 시작');
    
    // ========== 전역 상태 관리 ==========
    window.SmartModalControl = {
        userOpenedModals: new Set(),
        isUserAction: false,
        allowedModals: new Set([
            'fontSizeModal',
            'colorModeModal',
            'themeModal',
            'layoutModal',
            'stickerModal',
            'excelModal',
            'googleDriveModal',
            'memoModal',
            'scheduleModal',
            'editMemoModal'
        ])
    };
    
    // ========== 1. 사용자 클릭 감지 ==========
    function setupUserActionDetection() {
        console.log('👆 사용자 클릭 감지 설정');
        
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 메뉴 버튼 클릭 감지
            const isMenuButton = target.id?.includes('Btn') || 
                               target.id?.includes('btn') ||
                               target.classList.contains('menu-button') ||
                               target.classList.contains('control-button') ||
                               target.tagName === 'BUTTON';
            
            if (isMenuButton) {
                console.log(`🎯 사용자 메뉴 클릭: ${target.id || target.className}`);
                
                // 사용자 액션 플래그 설정 (3초간 유지)
                window.SmartModalControl.isUserAction = true;
                
                setTimeout(() => {
                    window.SmartModalControl.isUserAction = false;
                }, 3000);
                
                // 클릭된 버튼에 따라 해당 모달을 허용 목록에 추가
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
                    window.SmartModalControl.userOpenedModals.add(modalId);
                    console.log(`✅ 모달 허용: ${modalId}`);
                }
            }
        }, true);
        
        console.log('✅ 사용자 클릭 감지 설정 완료');
    }
    
    // ========== 2. 스마트 모달 표시 제어 ==========
    function smartModalDisplay(modal, modalId) {
        // 사용자가 클릭해서 열려는 모달인지 확인
        const isUserIntended = window.SmartModalControl.isUserAction && 
                              window.SmartModalControl.allowedModals.has(modalId);
        
        const isUserOpened = window.SmartModalControl.userOpenedModals.has(modalId);
        
        if (isUserIntended || isUserOpened) {
            console.log(`✅ 모달 표시 허용: ${modalId} (사용자 의도)`);
            
            // 모달을 보이게 설정
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('user-opened');
            modal.setAttribute('data-user-opened', 'true');
            
            // 위치 수정
            if (window.UltimateModalFix && typeof window.UltimateModalFix.fixModal === 'function') {
                setTimeout(() => {
                    window.UltimateModalFix.fixModal(modal);
                }, 50);
            }
            
            return true;
        } else {
            console.log(`🚫 모달 표시 차단: ${modalId} (자동 생성)`);
            
            // 모달을 숨김
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('user-opened');
            modal.removeAttribute('data-user-opened');
            
            return false;
        }
    }
    
    // ========== 3. MutationObserver 오버라이드 ==========
    function setupSmartMutationObserver() {
        console.log('👁️ 스마트 모달 감지 설정');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 새로 추가된 노드가 모달인지 확인
                        const isModal = node.classList?.contains('modal') || 
                                      node.id?.toLowerCase().includes('modal');
                        
                        if (isModal) {
                            const modalId = node.id;
                            console.log(`🔍 새 모달 감지: ${modalId}`);
                            
                            setTimeout(() => {
                                smartModalDisplay(node, modalId);
                            }, 100);
                        }
                        
                        // 자식 노드 중 모달 찾기
                        try {
                            const childModals = node.querySelectorAll?.('.modal, [id*="Modal"]');
                            childModals?.forEach(modal => {
                                const modalId = modal.id;
                                console.log(`🔍 자식 모달 감지: ${modalId}`);
                                
                                setTimeout(() => {
                                    smartModalDisplay(modal, modalId);
                                }, 100);
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
        
        console.log('✅ 스마트 모달 감지 설정 완료');
        
        return observer;
    }
    
    // ========== 4. 모든 간섭 시스템 완전 무력화 ==========
    function disableAllInterferenceSystems() {
        console.log('🔧 모든 간섭 시스템 무력화');
        
        // clean-startup-fix 완전 무력화
        if (window.CleanStartup) {
            window.CleanStartup.hideAll = () => { console.log('🚫 CleanStartup.hideAll 차단됨'); return 0; };
            window.CleanStartup.show = () => true;
            window.CleanStartup.hide = () => true;
            window.CleanStartup.cleanup = () => { console.log('🚫 CleanStartup.cleanup 차단됨'); return 0; };
        }
        
        // disable-auto-preview 무력화
        if (window.DisableAutoPreview) {
            window.DisableAutoPreview.restore = () => { console.log('🚫 DisableAutoPreview.restore 차단됨'); };
            window.DisableAutoPreview.disable = () => { console.log('🚫 DisableAutoPreview.disable 차단됨'); };
        }
        
        // 미리보기 관련 모든 함수 무력화
        const previewFunctions = [
            'enablePreview', 'disablePreview', 'toggleSafePreview', 'togglePreview',
            'showPreview', 'hidePreview', 'safeShowModal', 'safeHideModal'
        ];
        
        previewFunctions.forEach(funcName => {
            window[funcName] = function() {
                console.log(`🚫 ${funcName} 차단됨`);
                return false;
            };
        });
        
        // 미리보기 객체들 무력화
        if (window.PreviewControl) {
            window.PreviewControl.enable = () => false;
            window.PreviewControl.disable = () => true;
            window.PreviewControl.isEnabled = () => false;
        }
        
        if (window.StablePreview) {
            window.StablePreview.isActive = false;
            window.StablePreview.isTransitioning = false;
        }
        
        if (window.stablePreview) {
            window.stablePreview.enable = () => false;
            window.stablePreview.toggle = () => false;
            window.stablePreview.disable = () => true;
        }
        
        console.log('✅ 모든 간섭 시스템 무력화 완료');
    }
    
    // ========== 달력 변형 방지 ==========
    function preventCalendarDeformation() {
        // 달력 원본 상태 유지
        document.body.style.transform = 'none';
        document.body.style.scale = '1';
        document.body.style.zoom = '1';
        document.body.classList.remove('safe-preview-mode', 'preview-mode', 'unified-preview-mode');
        
        const containers = document.querySelectorAll('.container, .calendar-container, #calendar');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.scale = '1';
            container.style.zoom = '1';
        });
    }
    
    // ========== 5. 모달 닫기 감지 ==========
    function setupModalCloseDetection() {
        console.log('🚪 모달 닫기 감지 설정');
        
        // ESC 키로 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // 열린 모달들을 허용 목록에서 제거
                const openModals = document.querySelectorAll('.modal[style*="flex"], .modal[style*="block"]');
                openModals.forEach(modal => {
                    if (modal.id) {
                        window.SmartModalControl.userOpenedModals.delete(modal.id);
                        console.log(`🚪 모달 닫기: ${modal.id}`);
                    }
                });
            }
        });
        
        // 클릭으로 닫기
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 닫기 버튼 클릭 감지
            if (target.classList.contains('close') || 
                target.id?.includes('Close') ||
                target.textContent === '×' ||
                target.classList.contains('modal-close')) {
                
                const modal = target.closest('.modal');
                if (modal && modal.id) {
                    window.SmartModalControl.userOpenedModals.delete(modal.id);
                    console.log(`🚪 모달 닫기: ${modal.id}`);
                }
            }
            
            // 모달 배경 클릭으로 닫기
            if (target.classList.contains('modal')) {
                if (target.id) {
                    window.SmartModalControl.userOpenedModals.delete(target.id);
                    console.log(`🚪 모달 닫기: ${target.id}`);
                }
            }
        });
        
        console.log('✅ 모달 닫기 감지 설정 완료');
    }
    
    // ========== 6. 공개 API ==========
    function setupPublicAPI() {
        window.SmartModalControl.show = function(modalId) {
            this.userOpenedModals.add(modalId);
            const modal = document.getElementById(modalId);
            if (modal) {
                return smartModalDisplay(modal, modalId);
            }
            return false;
        };
        
        window.SmartModalControl.hide = function(modalId) {
            this.userOpenedModals.delete(modalId);
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.setAttribute('aria-hidden', 'true');
                return true;
            }
            return false;
        };
        
        window.SmartModalControl.status = function() {
            return {
                사용자액션중: this.isUserAction,
                허용된모달들: Array.from(this.userOpenedModals),
                표시된모달들: Array.from(document.querySelectorAll('.modal[style*="flex"], .modal[style*="block"]')).map(m => m.id)
            };
        };
        
        window.SmartModalControl.cleanup = function() {
            this.userOpenedModals.clear();
            this.isUserAction = false;
            
            // 자동 생성된 모달들만 숨기기
            const allModals = document.querySelectorAll('.modal, [id*="Modal"]');
            let hiddenCount = 0;
            
            allModals.forEach(modal => {
                if (!modal.classList.contains('user-opened')) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.setAttribute('aria-hidden', 'true');
                    hiddenCount++;
                }
            });
            
            return `${hiddenCount}개 자동 모달 정리 완료`;
        };
    }
    
    // ========== 초기화 ==========
    function init() {
        console.log('🚀 스마트 모달 제어 초기화');
        
        // 1. 사용자 클릭 감지
        setupUserActionDetection();
        
        // 2. 스마트 모달 감지
        setupSmartMutationObserver();
        
        // 3. 모든 간섭 시스템 무력화
        disableAllInterferenceSystems();
        
        // 4. 모달 닫기 감지
        setupModalCloseDetection();
        
        // 5. 공개 API
        setupPublicAPI();
        
        // 6. 달력 변형 방지 (즉시 실행 + 주기적 실행)
        preventCalendarDeformation();
        setInterval(preventCalendarDeformation, 1000);
        
        console.log('✅ 스마트 모달 제어 초기화 완료');
        
        // 3초 후 자동 생성 모달들 정리
        setTimeout(() => {
            window.SmartModalControl.cleanup();
        }, 3000);
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('✅ 스마트 모달 제어 로드 완료');
    console.log('💡 상태 확인: SmartModalControl.status()');
    console.log('💡 정리: SmartModalControl.cleanup()');
    
})();