/**
 * 강력한 버튼 수정 스크립트
 * 모든 버튼과 메뉴가 반드시 작동하도록 강제 수정
 */

(function() {
    'use strict';
    
    console.log('💪 강력한 버튼 수정 시작...');
    
    // ==========================================
    // 1. 모든 이벤트 차단 무력화
    // ==========================================
    function disableEventBlocking() {
        console.log('⚔️ 이벤트 차단 무력화...');
        
        // stopPropagation 무력화
        Event.prototype.stopPropagation = function() {
            console.log('⚠️ stopPropagation 호출 차단됨');
            // 아무것도 하지 않음
        };
        
        // stopImmediatePropagation 무력화
        Event.prototype.stopImmediatePropagation = function() {
            console.log('⚠️ stopImmediatePropagation 호출 차단됨');
            // 아무것도 하지 않음
        };
        
        // preventDefault는 특정 경우에만 허용
        const originalPreventDefault = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function() {
            if (this.type === 'submit' || this.type === 'keydown') {
                originalPreventDefault.call(this);
            }
            // 클릭 이벤트는 preventDefault 무시
        };
        
        console.log('✅ 이벤트 차단 무력화 완료');
    }
    
    // ==========================================
    // 2. CSS 최강 우선순위 적용
    // ==========================================
    function applyUltimateCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* 최강 우선순위로 모든 버튼 활성화 */
            * {
                pointer-events: auto !important;
            }
            
            button,
            .btn,
            [onclick],
            input[type="button"],
            input[type="submit"],
            .modal-close,
            .action-btn,
            .nav-btn {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 999999 !important;
                position: relative !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: inline-block !important;
            }
            
            /* 닫기 버튼 초강력 설정 */
            .modal-close,
            [onclick*="close"],
            [onclick*="Close"] {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 9999999 !important;
                background: #ff6b6b !important;
                color: white !important;
                border: none !important;
                border-radius: 50% !important;
                width: 30px !important;
                height: 30px !important;
                font-size: 16px !important;
                font-weight: bold !important;
                text-align: center !important;
                line-height: 28px !important;
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
            }
            
            .modal-close:hover {
                background: #ff5252 !important;
                transform: scale(1.1) !important;
            }
            
            /* 날짜 클릭 방해 요소 제거 */
            .day-number,
            .holiday-label,
            .memo-indicator,
            .memo-count {
                pointer-events: none !important;
            }
            
            .day {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 최강 CSS 적용 완료');
    }
    
    // ==========================================
    // 3. 직접 이벤트 리스너 강제 등록
    // ==========================================
    function forceAttachEventListeners() {
        console.log('🔨 강제 이벤트 리스너 등록...');
        
        // 모든 onclick 요소에 직접 리스너 등록
        document.querySelectorAll('[onclick]').forEach((element, index) => {
            const onclickCode = element.getAttribute('onclick');
            
            // 기존 리스너 모두 제거
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // 강력한 클릭 리스너 등록
            ['click', 'mousedown', 'touchstart'].forEach(eventType => {
                newElement.addEventListener(eventType, function(e) {
                    console.log(`🖱️ ${eventType}: ${onclickCode.substring(0, 30)}...`);
                    
                    try {
                        // 직접 실행
                        const result = eval(onclickCode);
                        console.log(`✅ 실행 성공: ${onclickCode.substring(0, 30)}...`);
                        return result;
                    } catch (error) {
                        console.error(`❌ 실행 오류: ${error.message}`);
                        
                        // Function 생성자로 재시도
                        try {
                            const func = new Function(onclickCode);
                            const result = func.call(this);
                            console.log(`✅ Function 재시도 성공`);
                            return result;
                        } catch (e2) {
                            console.error(`❌ Function 재시도도 실패: ${e2.message}`);
                        }
                    }
                }, { capture: true, passive: false });
            });
            
            console.log(`${index + 1}. ${onclickCode.substring(0, 50)}... 등록됨`);
        });
        
        console.log('✅ 강제 이벤트 리스너 등록 완료');
    }
    
    // ==========================================
    // 4. 모달 닫기 함수 직접 구현
    // ==========================================
    function implementDirectModalClose() {
        console.log('🔒 직접 모달 닫기 구현...');
        
        // 강력한 closeModal 함수
        window.closeModal = function(modalId) {
            console.log(`💥 강제 모달 닫기: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important;';
                modal.remove(); // 아예 제거
                
                setTimeout(() => {
                    // DOM에서 완전히 제거 후 재생성 준비
                    location.reload(); // 강제 새로고침으로 깔끔하게
                }, 100);
            }
            
            // 모든 모달 숨기기
            document.querySelectorAll('.modal, [id*="Modal"]').forEach(m => {
                m.style.display = 'none';
            });
            
            console.log(`✅ 모달 ${modalId} 강제 닫기 완료`);
        };
        
        // 전역 닫기 함수들 추가
        window.forceCloseAllModals = function() {
            document.querySelectorAll('.modal, [id*="Modal"]').forEach(modal => {
                modal.style.display = 'none';
            });
            console.log('✅ 모든 모달 강제 닫기');
        };
        
        console.log('✅ 직접 모달 닫기 구현 완료');
    }
    
    // ==========================================
    // 5. 키보드 단축키로 모달 제어
    // ==========================================
    function setupKeyboardControls() {
        document.addEventListener('keydown', function(e) {
            // ESC - 모든 모달 닫기
            if (e.key === 'Escape') {
                console.log('🔑 ESC로 모든 모달 닫기');
                window.forceCloseAllModals();
            }
            
            // Ctrl+Shift+X - 강제 새로고침
            if (e.ctrlKey && e.shiftKey && e.key === 'X') {
                console.log('🔄 강제 새로고침');
                location.reload();
            }
        }, { capture: true });
        
        console.log('✅ 키보드 단축키 설정 완료');
    }
    
    // ==========================================
    // 6. 클릭 감지 및 강제 실행
    // ==========================================
    function setupClickDetection() {
        // 전역 클릭 감지
        document.addEventListener('click', function(e) {
            const target = e.target;
            console.log('🎯 클릭 감지:', target.tagName, target.className, target.id);
            
            // 닫기 버튼 감지
            if (target.className.includes('modal-close') || 
                (target.getAttribute('onclick') && target.getAttribute('onclick').includes('close'))) {
                
                console.log('💥 닫기 버튼 감지됨, 강제 실행');
                
                // onclick 코드 강제 실행
                const onclick = target.getAttribute('onclick');
                if (onclick) {
                    try {
                        eval(onclick);
                        console.log('✅ onclick 강제 실행 성공');
                    } catch (error) {
                        console.error('❌ onclick 실행 실패:', error);
                        // 모달 직접 닫기
                        window.forceCloseAllModals();
                    }
                }
                
                return;
            }
            
            // 일반 버튼 감지
            if (target.tagName === 'BUTTON' || target.getAttribute('onclick')) {
                const onclick = target.getAttribute('onclick');
                if (onclick && !onclick.includes('close')) {
                    console.log('🔘 버튼 클릭 감지, 강제 실행');
                    try {
                        eval(onclick);
                        console.log('✅ 버튼 onclick 실행 성공');
                    } catch (error) {
                        console.error('❌ 버튼 onclick 실행 실패:', error);
                    }
                }
            }
        }, { capture: true, passive: false });
        
        console.log('✅ 클릭 감지 설정 완료');
    }
    
    // ==========================================
    // 7. 디버깅 도구
    // ==========================================
    window.forceDebug = function() {
        console.group('💪 강력한 디버깅');
        
        const onclickElements = document.querySelectorAll('[onclick]');
        console.log(`onclick 요소: ${onclickElements.length}개`);
        
        onclickElements.forEach((el, index) => {
            console.log(`${index + 1}. ${el.tagName}.${el.className}: ${el.getAttribute('onclick')}`);
        });
        
        const modals = document.querySelectorAll('.modal, [id*="Modal"]');
        console.log(`모달: ${modals.length}개`);
        
        modals.forEach((modal, index) => {
            const style = window.getComputedStyle(modal);
            console.log(`${index + 1}. ${modal.id}: display=${style.display}`);
        });
        
        console.groupEnd();
    };
    
    // ==========================================
    // 초기화
    // ==========================================
    function initialize() {
        console.log('💪 강력한 버튼 수정 초기화...');
        
        // 1. 이벤트 차단 무력화
        disableEventBlocking();
        
        // 2. 최강 CSS 적용
        applyUltimateCSS();
        
        // 3. 모달 닫기 직접 구현
        implementDirectModalClose();
        
        // 4. 키보드 단축키 설정
        setupKeyboardControls();
        
        // 5. 클릭 감지 설정
        setupClickDetection();
        
        // 6. 강제 이벤트 리스너 (약간 지연)
        setTimeout(() => {
            forceAttachEventListeners();
        }, 500);
        
        console.log('✅ 강력한 버튼 수정 완료!');
        console.log('💡 ESC: 모달 닫기, Ctrl+Shift+X: 새로고침, forceDebug(): 디버깅');
    }
    
    // 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();