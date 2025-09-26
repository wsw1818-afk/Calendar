/**
 * 버튼 클릭 문제 수정 스크립트
 * 모달 닫기 버튼과 상단 메뉴 버튼들의 클릭 이벤트 복구
 */

(function() {
    'use strict';
    
    console.log('🔘 버튼 클릭 문제 수정 시작...');
    
    // ==========================================
    // 1. CSS로 버튼들의 클릭 가능성 보장
    // ==========================================
    function ensureButtonClickability() {
        const style = document.createElement('style');
        style.textContent = `
            /* 모든 버튼 클릭 가능 */
            button,
            .btn,
            .modal-close,
            .close-btn,
            [onclick],
            input[type="button"],
            input[type="submit"] {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 10000 !important;
                position: relative !important;
            }
            
            /* 닫기 버튼 특별 처리 */
            .modal-close,
            .btn-close,
            button.close,
            [onclick*="close"],
            [onclick*="Close"] {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 100000 !important;
                background: transparent !important;
                border: none !important;
                font-size: 20px !important;
                padding: 5px 10px !important;
                color: #666 !important;
            }
            
            .modal-close:hover,
            .btn-close:hover {
                color: #333 !important;
                background: rgba(0,0,0,0.1) !important;
            }
            
            /* 상단 메뉴 버튼들 */
            .action-btn,
            .nav-btn,
            .menu-btn,
            [class*="btn-"] {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1000 !important;
            }
            
            /* 모달 내부 요소들 */
            .modal * {
                pointer-events: auto !important;
            }
            
            /* 특정 요소들만 클릭 차단 해제 */
            .day-number,
            .holiday-label,
            .memo-indicator {
                pointer-events: none !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 버튼 클릭 CSS 적용 완료');
    }
    
    // ==========================================
    // 2. onclick 속성이 있는 모든 요소 재활성화
    // ==========================================
    function reactivateOnclickElements() {
        console.log('🔄 onclick 요소들 재활성화...');
        
        const onclickElements = document.querySelectorAll('[onclick]');
        let reactivatedCount = 0;
        
        onclickElements.forEach(element => {
            const onclickCode = element.getAttribute('onclick');
            
            // 스타일 강제 설정
            element.style.pointerEvents = 'auto';
            element.style.cursor = 'pointer';
            element.style.zIndex = '10000';
            
            // 기존 리스너를 유지하면서 추가 리스너 등록
            element.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log(`🖱️ 클릭: ${onclickCode.substring(0, 50)}...`);
                
                try {
                    // 안전하게 실행
                    const func = new Function('event', onclickCode);
                    func.call(this, e);
                } catch (error) {
                    console.warn('onclick 실행 오류, eval로 재시도:', error);
                    try {
                        eval(onclickCode);
                    } catch (e2) {
                        console.error('onclick 실행 완전 실패:', e2);
                    }
                }
            }, true); // capture phase에서 처리
            
            reactivatedCount++;
        });
        
        console.log(`✅ ${reactivatedCount}개 onclick 요소 재활성화 완료`);
    }
    
    // ==========================================
    // 3. 모달 닫기 함수들 보강
    // ==========================================
    function enhanceCloseModalFunctions() {
        console.log('🔒 모달 닫기 함수 보강...');
        
        // closeModal 함수 보강 (기존 함수 유지하면서 추가)
        const originalCloseModal = window.closeModal;
        window.closeModal = function(modalId) {
            console.log(`🔒 모달 닫기 시도: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.classList.remove('show', 'active');
                
                console.log(`✅ 모달 닫힘: ${modalId}`);
            }
            
            // 백드롭 제거
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.style.display = 'none';
            }
            
            // 원래 함수도 호출
            if (originalCloseModal && originalCloseModal !== window.closeModal) {
                try {
                    originalCloseModal.call(this, modalId);
                } catch (e) {
                    console.warn('원래 closeModal 실행 오류:', e);
                }
            }
        };
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                console.log('🔑 ESC 키로 모달 닫기');
                const visibleModals = document.querySelectorAll('.modal[style*="display: block"], .modal.show');
                visibleModals.forEach(modal => {
                    if (modal.id) {
                        window.closeModal(modal.id);
                    } else {
                        modal.style.display = 'none';
                    }
                });
            }
        });
        
        console.log('✅ 모달 닫기 함수 보강 완료');
    }
    
    // ==========================================
    // 4. 상단 메뉴 버튼들 특별 처리
    // ==========================================
    function fixTopMenuButtons() {
        console.log('📋 상단 메뉴 버튼 수정...');
        
        // 상단 액션 버튼들 찾기
        const actionButtons = document.querySelectorAll('.action-btn, .nav-btn, button[onclick*="openModal"]');
        let fixedCount = 0;
        
        actionButtons.forEach(button => {
            // 스타일 강제 적용
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            button.style.zIndex = '1000';
            button.style.position = 'relative';
            
            // 호버 효과 추가
            button.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
            
            fixedCount++;
        });
        
        console.log(`✅ ${fixedCount}개 상단 메뉴 버튼 수정 완료`);
    }
    
    // ==========================================
    // 5. 모든 버튼 요소 강제 활성화
    // ==========================================
    function forceActivateAllButtons() {
        console.log('🔘 모든 버튼 강제 활성화...');
        
        const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn');
        let activatedCount = 0;
        
        allButtons.forEach(button => {
            // 기본 스타일 설정
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            
            // disabled 속성 제거
            if (button.disabled) {
                button.disabled = false;
            }
            
            // tabindex 설정 (키보드 접근성)
            if (!button.hasAttribute('tabindex')) {
                button.setAttribute('tabindex', '0');
            }
            
            activatedCount++;
        });
        
        console.log(`✅ ${activatedCount}개 버튼 강제 활성화 완료`);
    }
    
    // ==========================================
    // 6. 디버깅 도구
    // ==========================================
    window.debugButtons = function() {
        console.group('🔍 버튼 상태 디버깅');
        
        const onclickElements = document.querySelectorAll('[onclick]');
        console.log(`onclick 요소: ${onclickElements.length}개`);
        
        const buttons = document.querySelectorAll('button');
        console.log(`button 태그: ${buttons.length}개`);
        
        const closeButtons = document.querySelectorAll('.modal-close, [onclick*="close"]');
        console.log(`닫기 버튼: ${closeButtons.length}개`);
        
        closeButtons.forEach((btn, index) => {
            const style = window.getComputedStyle(btn);
            console.log(`닫기버튼 ${index + 1}:`, {
                display: style.display,
                pointerEvents: style.pointerEvents,
                cursor: style.cursor,
                zIndex: style.zIndex,
                onclick: btn.getAttribute('onclick')
            });
        });
        
        console.groupEnd();
    };
    
    // ==========================================
    // 초기화 함수
    // ==========================================
    function initialize() {
        console.log('🚀 버튼 클릭 수정 초기화...');
        
        // 1. CSS 적용
        ensureButtonClickability();
        
        // 2. onclick 요소 재활성화
        reactivateOnclickElements();
        
        // 3. 모달 닫기 함수 보강
        enhanceCloseModalFunctions();
        
        // 4. 상단 메뉴 수정
        fixTopMenuButtons();
        
        // 5. 모든 버튼 활성화
        forceActivateAllButtons();
        
        console.log('✅ 버튼 클릭 수정 완료!');
        console.log('💡 디버깅: debugButtons() 함수로 상태 확인 가능');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    // 안전장치: 모달이 열릴 때마다 버튼 재활성화
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(modalId) {
            const result = originalOpenModal.apply(this, arguments);
            
            // 모달 열린 후 버튼들 재활성화
            setTimeout(() => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.querySelectorAll('button, [onclick]').forEach(btn => {
                        btn.style.pointerEvents = 'auto';
                        btn.style.cursor = 'pointer';
                    });
                }
            }, 100);
            
            return result;
        };
    }
    
})();