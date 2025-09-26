/**
 * 설정 모달 자동 열림 및 닫기 문제 해결
 */

(function() {
    'use strict';
    
    console.log('📦 설정 모달 수정 스크립트 로드');
    
    // DOM 로드 완료 대기
    function waitForDOMReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSettingsModalFix);
        } else {
            initSettingsModalFix();
        }
    }
    
    // 설정 모달 초기화 및 수정
    function initSettingsModalFix() {
        console.log('🔧 설정 모달 수정 시작');
        
        // 1. 설정 모달 찾기
        const settingsModal = document.getElementById('settingsModal');
        
        if (settingsModal) {
            console.log('✅ 설정 모달 발견');
            
            // 2. 초기 상태를 숨김으로 강제 설정
            settingsModal.style.display = 'none';
            settingsModal.style.visibility = 'hidden';
            settingsModal.classList.remove('show', 'active', 'open');
            
            console.log('🚫 설정 모달 숨김 처리 완료');
            
            // 3. 닫기 버튼 이벤트 수정
            fixCloseButton();
            
            // 4. ESC 키로 닫기 가능하도록 설정
            setupEscapeKey();
            
            // 5. 모달 외부 클릭으로 닫기
            setupOutsideClick();
            
            // 6. 설정 버튼에 올바른 이벤트 연결
            setupSettingsButton();
            
        } else {
            console.log('⚠️ 설정 모달을 찾을 수 없음 - 재시도');
            setTimeout(initSettingsModalFix, 500);
        }
    }
    
    // 닫기 버튼 수정
    function fixCloseButton() {
        // 모든 가능한 닫기 버튼 선택자
        const closeSelectors = [
            '#settingsModal .modal-close',
            '#settingsModal button[onclick*="cancel"]',
            '#settingsModal button[onclick*="close"]',
            '#settingsModal .close',
            '#settingsModal button.close',
            '#settingsModal [aria-label="닫기"]',
            '#settingsModal [aria-label="Close"]'
        ];
        
        closeSelectors.forEach(selector => {
            const closeBtn = document.querySelector(selector);
            if (closeBtn) {
                // 기존 이벤트 제거
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                // 새 이벤트 추가
                newCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeSettingsModal();
                });
                
                console.log('✅ 닫기 버튼 이벤트 수정:', selector);
            }
        });
    }
    
    // ESC 키로 닫기
    function setupEscapeKey() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal && settingsModal.style.display !== 'none') {
                    e.preventDefault();
                    closeSettingsModal();
                    console.log('⌨️ ESC 키로 설정 모달 닫기');
                }
            }
        });
    }
    
    // 모달 외부 클릭으로 닫기
    function setupOutsideClick() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', function(e) {
                // 모달 배경(오버레이) 클릭 시 닫기
                if (e.target === settingsModal) {
                    closeSettingsModal();
                    console.log('🖱️ 외부 클릭으로 설정 모달 닫기');
                }
            });
        }
    }
    
    // 설정 버튼 이벤트 수정
    function setupSettingsButton() {
        // 설정 버튼 찾기
        const settingsButtons = document.querySelectorAll(
            'button[onclick*="showModal(\'settingsModal\')"],' +
            'button[onclick*="openSettings"],' +
            '.settings-button,' +
            '[data-modal="settings"]'
        );
        
        settingsButtons.forEach(btn => {
            // 기존 이벤트 제거
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 새 이벤트 추가
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openSettingsModal();
            });
            
            console.log('✅ 설정 버튼 이벤트 수정');
        });
    }
    
    // 설정 모달 열기
    function openSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            // 의도적으로 열었음을 표시
            window.settingsModalIntentionallyOpened = true;
            
            settingsModal.style.display = 'block';
            settingsModal.style.visibility = 'visible';
            settingsModal.style.opacity = '1';
            settingsModal.classList.add('show');
            
            // 모달 내부 컨텐츠도 표시
            const modalContent = settingsModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = '';
            }
            
            console.log('📂 설정 모달 열기');
            
            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                const firstInput = settingsModal.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
                // 1초 후에 의도적 열림 플래그 제거
                setTimeout(() => {
                    window.settingsModalIntentionallyOpened = false;
                }, 1000);
            }, 100);
        }
    }
    
    // 설정 모달 닫기
    function closeSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'none';
            settingsModal.style.visibility = 'hidden';
            settingsModal.classList.remove('show', 'active', 'open');
            console.log('📁 설정 모달 닫기');
        }
    }
    
    // 전역 함수로 노출 (기존 코드 호환성)
    window.closeSettingsModal = closeSettingsModal;
    window.openSettingsModal = openSettingsModal;
    
    // cancelSettings 함수가 있다면 대체
    if (typeof window.cancelSettings !== 'undefined') {
        window.cancelSettings = closeSettingsModal;
    }
    
    // closeModal 함수 오버라이드
    const originalCloseModal = window.closeModal;
    window.closeModal = function(modalId) {
        if (modalId === 'settingsModal') {
            closeSettingsModal();
        } else if (originalCloseModal) {
            originalCloseModal(modalId);
        } else {
            // 기본 닫기 동작
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }
    };
    
    // 반복적으로 설정 모달 강제 닫기 (다른 스크립트 대응)
    const forceCloseIntervals = [0, 50, 100, 200, 300, 500, 1000, 2000];
    forceCloseIntervals.forEach(delay => {
        setTimeout(() => {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                // 인라인 스타일로 강제 숨김
                settingsModal.style.setProperty('display', 'none', 'important');
                settingsModal.style.setProperty('visibility', 'hidden', 'important');
                settingsModal.style.setProperty('opacity', '0', 'important');
                settingsModal.classList.remove('show', 'active', 'open');
                
                // 모달 내부 컨텐츠도 숨기기
                const modalContent = settingsModal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.setProperty('display', 'none', 'important');
                }
                
                if (delay > 0 && settingsModal.style.display !== 'none') {
                    console.log(`⚠️ [${delay}ms] 설정 모달 강제 닫기`);
                }
            }
        }, delay);
    });
    
    // MutationObserver로 설정 모달 감시
    const observer = new MutationObserver((mutations) => {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display !== 'none') {
            // 사용자가 의도적으로 연 것이 아니면 닫기
            if (!window.settingsModalIntentionallyOpened) {
                settingsModal.style.setProperty('display', 'none', 'important');
                settingsModal.style.setProperty('visibility', 'hidden', 'important');
                console.log('🚫 MutationObserver: 설정 모달 자동 열림 차단');
            }
        }
    });
    
    // 설정 모달 감시 시작
    setTimeout(() => {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            observer.observe(settingsModal, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            console.log('👁️ 설정 모달 감시 시작');
        }
    }, 100);
    
    // 초기화 시작
    waitForDOMReady();
    
})();

console.log('✨ 설정 모달 수정 스크립트 준비 완료');