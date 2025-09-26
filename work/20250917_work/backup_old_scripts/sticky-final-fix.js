/**
 * 스티커 메모 최종 수정 - DOM 분리 방지 및 자동 닫힘 완전 차단
 * 모든 닫힘 시도를 차단하고 DOM에서 분리되지 않도록 보장
 */

(function() {
    'use strict';
    
    console.log('🔥 스티커 메모 최종 수정 시작');
    
    // 전역 상태
    window._stickyFinalState = {
        element: null,
        isOpen: false,
        protectionActive: false,
        domObserver: null
    };
    
    /**
     * 스티커 메모 DOM 보호
     */
    function protectStickyDOM() {
        if (window._stickyFinalState.domObserver) {
            window._stickyFinalState.domObserver.disconnect();
        }
        
        // DOM 변경 감시
        window._stickyFinalState.domObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // 스티커 메모가 제거되려 하면
                mutation.removedNodes.forEach((node) => {
                    if (node.id === 'stickyMemo' || (node.querySelector && node.querySelector('#stickyMemo'))) {
                        console.warn('🚨 스티커 메모 제거 시도 감지 - 복원');
                        
                        // 즉시 다시 추가
                        if (!document.getElementById('stickyMemo')) {
                            document.body.appendChild(node);
                            ensureStickyVisible();
                        }
                    }
                });
                
                // 스타일 변경 감시
                if (mutation.type === 'attributes' && mutation.target.id === 'stickyMemo') {
                    const sticky = mutation.target;
                    
                    // display none이나 visibility hidden 시도 차단
                    if (sticky.style.display === 'none' || 
                        sticky.style.visibility === 'hidden' ||
                        sticky.style.opacity === '0') {
                        
                        if (window._stickyFinalState.protectionActive) {
                            console.warn('🛡️ 스티커 메모 숨김 시도 차단');
                            ensureStickyVisible();
                        }
                    }
                }
            });
        });
        
        // body 전체 감시
        window._stickyFinalState.domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('🛡️ DOM 보호 활성화');
    }
    
    /**
     * 스티커 메모 생성 또는 가져오기
     */
    function getOrCreateSticky() {
        let sticky = document.getElementById('stickyMemo');
        
        if (!sticky) {
            console.log('📝 스티커 메모 새로 생성');
            
            sticky = document.createElement('div');
            sticky.id = 'stickyMemo';
            sticky.className = 'sticky-memo sticky-visible';
            sticky.innerHTML = `
                <div class="sticky-header">
                    <div class="sticky-title">📝 스티커 메모</div>
                    <button class="sticky-control-btn sticky-close" id="stickyClose" title="닫기">✕</button>
                </div>
                <div class="sticky-content" style="padding: 20px;">
                    <textarea class="sticky-textarea" 
                        style="width: 100%; height: 300px; border: none; background: transparent; resize: none; outline: none; font-size: 14px;" 
                        placeholder="메모를 입력하세요..."></textarea>
                </div>
            `;
            
            document.body.appendChild(sticky);
            setupCloseButton(sticky);
        }
        
        window._stickyFinalState.element = sticky;
        return sticky;
    }
    
    /**
     * 스티커 메모 강제 표시
     */
    function ensureStickyVisible() {
        const sticky = getOrCreateSticky();
        
        // body에 없으면 추가
        if (!document.body.contains(sticky)) {
            document.body.appendChild(sticky);
            console.log('📌 스티커 메모를 body에 추가');
        }
        
        // 강제 표시 스타일
        const styles = {
            'display': 'flex !important',
            'flex-direction': 'column !important',
            'visibility': 'visible !important',
            'opacity': '1 !important',
            'position': 'fixed !important',
            'z-index': '2147483647 !important',
            'pointer-events': 'auto !important',
            'width': '350px',
            'min-height': '400px',
            'left': '50%',
            'top': '50%',
            'transform': 'translate(-50%, -50%)',
            'background': 'linear-gradient(135deg, rgba(255, 249, 196, 0.98) 0%, rgba(255, 245, 157, 0.98) 100%)',
            'border-radius': '20px',
            'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 120px rgba(255, 193, 7, 0.5)',
            'border': '1px solid rgba(255, 193, 7, 0.3)'
        };
        
        // 인라인 스타일로 직접 설정
        sticky.setAttribute('style', Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; '));
        
        // 클래스도 추가
        sticky.classList.add('sticky-visible');
        sticky.classList.remove('sticky-hidden');
        
        window._stickyFinalState.isOpen = true;
        
        console.log('✅ 스티커 메모 강제 표시');
    }
    
    /**
     * 닫기 버튼 설정
     */
    function setupCloseButton(sticky) {
        const closeBtn = sticky.querySelector('#stickyClose');
        
        if (closeBtn) {
            // 기존 이벤트 제거
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // 새 이벤트
            newCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔴 닫기 버튼 클릭');
                
                // 보호 비활성화하고 닫기
                window._stickyFinalState.protectionActive = false;
                window._stickyFinalState.isOpen = false;
                
                sticky.style.display = 'none';
                
                // 3초 후 보호 재활성화
                setTimeout(() => {
                    window._stickyFinalState.protectionActive = true;
                }, 3000);
            });
        }
    }
    
    /**
     * openStickyMemo 완전 재정의
     */
    const originalOpen = window.openStickyMemo;
    
    window.openStickyMemo = function() {
        console.log('🚀 최종 openStickyMemo 실행');
        
        // 보호 활성화
        window._stickyFinalState.protectionActive = true;
        
        // 원본 함수 실행 (있으면)
        if (originalOpen && typeof originalOpen === 'function') {
            try {
                originalOpen();
            } catch (e) {
                console.error('원본 openStickyMemo 오류:', e);
            }
        }
        
        // 강제 표시
        ensureStickyVisible();
        
        // DOM 보호 시작
        protectStickyDOM();
        
        // 15초간 강력 보호
        let protectionCount = 0;
        const protectionInterval = setInterval(() => {
            protectionCount++;
            
            if (protectionCount > 30) { // 15초 (500ms * 30)
                clearInterval(protectionInterval);
                console.log('⏰ 강력 보호 종료');
                return;
            }
            
            const sticky = document.getElementById('stickyMemo');
            
            if (!sticky || !document.body.contains(sticky)) {
                console.warn(`🔄 [${protectionCount}/30] 스티커 메모 복원`);
                ensureStickyVisible();
            } else if (sticky.style.display === 'none' || 
                      sticky.style.visibility === 'hidden') {
                console.warn(`🔄 [${protectionCount}/30] 스티커 메모 재표시`);
                ensureStickyVisible();
            }
        }, 500);
        
        console.log('✅ 스티커 메모 열기 완료 (15초 강력 보호)');
    };
    
    /**
     * closeStickyMemo 차단
     */
    const originalClose = window.closeStickyMemo;
    
    window.closeStickyMemo = function() {
        if (window._stickyFinalState.protectionActive && window._stickyFinalState.isOpen) {
            console.warn('🚫 보호 중 - 닫기 차단');
            ensureStickyVisible();
            return;
        }
        
        if (originalClose && typeof originalClose === 'function') {
            originalClose();
        }
    };
    
    /**
     * 강제 닫기
     */
    window.forceStickyClose = function() {
        console.log('💪 강제 닫기');
        window._stickyFinalState.protectionActive = false;
        window._stickyFinalState.isOpen = false;
        
        const sticky = document.getElementById('stickyMemo');
        if (sticky) {
            sticky.style.display = 'none';
        }
    };
    
    /**
     * CSS 추가
     */
    function addFinalCSS() {
        if (document.getElementById('sticky-final-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-final-styles';
        style.textContent = `
            /* 스티커 메모 최우선 표시 */
            #stickyMemo {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 2147483647 !important;
                position: fixed !important;
                pointer-events: auto !important;
            }
            
            /* 숨김 시도 무효화 */
            #stickyMemo.sticky-visible {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 애니메이션 제거 */
            #stickyMemo * {
                animation: none !important;
                transition: none !important;
            }
            
            /* 다른 요소 z-index 제한 */
            body > *:not(#stickyMemo) {
                z-index: 9999 !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 디버그
     */
    window.debugStickyFinal = function() {
        console.group('🔥 스티커 메모 최종 상태');
        console.log('상태:', window._stickyFinalState);
        
        const sticky = document.getElementById('stickyMemo');
        if (sticky) {
            console.log('DOM 존재:', true);
            console.log('부모:', sticky.parentNode?.tagName);
            console.log('표시 상태:', {
                display: sticky.style.display,
                visibility: sticky.style.visibility,
                opacity: sticky.style.opacity
            });
        } else {
            console.log('DOM 존재:', false);
        }
        
        console.groupEnd();
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('🔥 스티커 메모 최종 수정 초기화');
        
        // CSS 추가
        addFinalCSS();
        
        // DOM 보호 시작
        protectStickyDOM();
        
        // 기존 스티커 확인
        const existing = document.getElementById('stickyMemo');
        if (existing) {
            window._stickyFinalState.element = existing;
            setupCloseButton(existing);
        }
        
        console.log('✅ 스티커 메모 최종 수정 준비 완료');
    }
    
    // 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🔥 스티커 메모 최종 수정 로드 완료');
    console.log('🛠️ 명령어: debugStickyFinal(), forceStickyClose()');
    
})();