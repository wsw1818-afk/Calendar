/**
 * 스티커 메모 종합 수정 - 열린 상태 유지 보장
 * 모든 자동 닫힘 시도를 차단하고 안정적인 표시 보장
 */

(function() {
    'use strict';
    
    console.log('🛡️ 스티커 메모 종합 보호 시스템 시작');
    
    // 전역 상태 관리
    window._stickyProtection = {
        isProtected: false,
        protectionTimer: null,
        openCount: 0
    };
    
    // 원본 함수들 백업
    const originals = {
        openStickyMemo: window.openStickyMemo,
        closeStickyMemo: window.closeStickyMemo,
        createStickyMemo: window.createStickyMemo,
        setTimeout: window.setTimeout,
        setInterval: window.setInterval
    };
    
    /**
     * 스티커 메모 열기 보호
     */
    window.openStickyMemo = function() {
        console.log('🔐 보호된 openStickyMemo 실행');
        
        // 보호 상태 설정
        window._stickyProtection.isProtected = true;
        window._stickyProtection.openCount++;
        
        // 기존 타이머 제거
        if (window._stickyProtection.protectionTimer) {
            clearTimeout(window._stickyProtection.protectionTimer);
        }
        
        // 원본 함수 실행
        if (originals.openStickyMemo) {
            originals.openStickyMemo.apply(this, arguments);
        }
        
        // 강제 표시 보장
        ensureStickyVisible();
        
        // 10초간 보호 유지
        window._stickyProtection.protectionTimer = originals.setTimeout(() => {
            window._stickyProtection.isProtected = false;
            console.log('⏰ 보호 기간 종료 - 정상 닫기 허용');
        }, 10000);
        
        console.log('✅ 스티커 메모 열기 완료 (10초간 보호)');
    };
    
    /**
     * 스티커 메모 닫기 차단/허용
     */
    window.closeStickyMemo = function() {
        // 보호 중이면 차단
        if (window._stickyProtection.isProtected) {
            console.warn('🚫 보호 중 - 닫기 차단됨');
            
            // 스티커가 숨겨졌을 수 있으니 다시 표시
            ensureStickyVisible();
            return;
        }
        
        // 보호 중이 아니면 정상 닫기
        console.log('✅ 정상 닫기 허용');
        if (originals.closeStickyMemo) {
            originals.closeStickyMemo.apply(this, arguments);
        }
    };
    
    /**
     * 강제 닫기 함수 (사용자가 명시적으로 닫을 때만)
     */
    window.forceCloseStickyMemo = function() {
        console.log('💪 강제 닫기 실행');
        window._stickyProtection.isProtected = false;
        
        if (originals.closeStickyMemo) {
            originals.closeStickyMemo();
        }
    };
    
    /**
     * 스티커 메모 강제 표시
     */
    function ensureStickyVisible() {
        const stickyMemo = document.getElementById('stickyMemo');
        
        if (!stickyMemo) {
            console.warn('⚠️ 스티커 메모 요소를 찾을 수 없음 - 생성 시도');
            
            // 생성 함수 시도
            if (window.createStickyMemo) {
                const newSticky = window.createStickyMemo();
                if (newSticky) {
                    ensureStickyVisible(); // 재귀 호출로 표시
                }
            }
            return;
        }
        
        // DOM에 없으면 추가
        if (!document.body.contains(stickyMemo)) {
            document.body.appendChild(stickyMemo);
            console.log('📌 스티커 메모를 body에 추가');
        }
        
        // 강제 표시 스타일
        const styles = {
            'display': 'flex',
            'visibility': 'visible',
            'opacity': '1',
            'position': 'fixed',
            'z-index': '2147483647',
            'pointer-events': 'auto',
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
        
        Object.entries(styles).forEach(([prop, value]) => {
            stickyMemo.style.setProperty(prop, value, 'important');
        });
        
        console.log('👁️ 스티커 메모 강제 표시 완료');
    }
    
    /**
     * setTimeout 후킹 - closeStickyMemo 호출 차단
     */
    window.setTimeout = function(callback, delay, ...args) {
        if (typeof callback === 'function') {
            const callbackStr = callback.toString();
            
            // 보호 중이고 closeStickyMemo를 호출하려 하면 차단
            if (window._stickyProtection.isProtected && 
                (callbackStr.includes('closeStickyMemo') || 
                 callbackStr.includes('display') && callbackStr.includes('none') ||
                 callbackStr.includes('visibility') && callbackStr.includes('hidden'))) {
                
                console.warn('⏱️ setTimeout으로 닫기 시도 차단');
                return -1; // 가짜 타이머 ID 반환
            }
        }
        
        return originals.setTimeout.apply(this, arguments);
    };
    
    /**
     * setInterval 후킹 - closeStickyMemo 호출 차단
     */
    window.setInterval = function(callback, delay, ...args) {
        if (typeof callback === 'function') {
            const callbackStr = callback.toString();
            
            // 보호 중이고 closeStickyMemo를 호출하려 하면 차단
            if (window._stickyProtection.isProtected && 
                (callbackStr.includes('closeStickyMemo') || 
                 callbackStr.includes('display') && callbackStr.includes('none'))) {
                
                console.warn('🔄 setInterval로 닫기 시도 차단');
                return -1; // 가짜 인터벌 ID 반환
            }
        }
        
        return originals.setInterval.apply(this, arguments);
    };
    
    /**
     * 닫기 버튼 이벤트 재설정
     */
    function setupCloseButton() {
        // MutationObserver로 닫기 버튼 감시
        const observer = new MutationObserver((mutations) => {
            const closeBtn = document.getElementById('stickyClose');
            
            if (closeBtn && !closeBtn.hasAttribute('data-protected')) {
                closeBtn.setAttribute('data-protected', 'true');
                
                // 기존 이벤트 제거
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                // 새 이벤트 설정 (강제 닫기)
                newCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔴 닫기 버튼 클릭 - 강제 닫기');
                    window.forceCloseStickyMemo();
                });
                
                console.log('✅ 닫기 버튼 보호 설정');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 보호 CSS 추가
     */
    function addProtectionCSS() {
        if (document.getElementById('sticky-protection-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-protection-styles';
        style.textContent = `
            /* 스티커 메모 최우선 표시 */
            #stickyMemo {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 2147483647 !important;
                pointer-events: auto !important;
            }
            
            /* 보호 중일 때 숨김 방지 */
            body.sticky-protected #stickyMemo {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 닫기 애니메이션 비활성화 */
            #stickyMemo {
                transition: none !important;
                animation: none !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 보호 CSS 추가 완료');
    }
    
    /**
     * 디버그 함수
     */
    window.debugStickyProtection = function() {
        console.group('🛡️ 스티커 메모 보호 상태');
        console.log('보호 상태:', window._stickyProtection);
        
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            const computed = window.getComputedStyle(stickyMemo);
            console.log('DOM 요소:', stickyMemo);
            console.log('표시 상태:', {
                display: computed.display,
                visibility: computed.visibility,
                opacity: computed.opacity,
                zIndex: computed.zIndex
            });
        } else {
            console.log('❌ 스티커 메모 요소 없음');
        }
        
        console.groupEnd();
    };
    
    /**
     * 수동 보호 토글
     */
    window.toggleStickyProtection = function(enable) {
        window._stickyProtection.isProtected = enable;
        
        if (enable) {
            console.log('🔐 보호 활성화');
            document.body.classList.add('sticky-protected');
            ensureStickyVisible();
        } else {
            console.log('🔓 보호 비활성화');
            document.body.classList.remove('sticky-protected');
        }
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('🛡️ 스티커 메모 종합 보호 시스템 초기화');
        
        // CSS 추가
        addProtectionCSS();
        
        // 닫기 버튼 설정
        setupCloseButton();
        
        // 페이지 로드 시 기존 스티커 확인
        const existingSticky = document.getElementById('stickyMemo');
        if (existingSticky) {
            const computed = window.getComputedStyle(existingSticky);
            if (computed.display !== 'none') {
                console.log('📌 기존 표시된 스티커 메모 발견 - 보호 활성화');
                window._stickyProtection.isProtected = true;
                ensureStickyVisible();
            }
        }
        
        console.log('✅ 스티커 메모 종합 보호 시스템 준비 완료');
    }
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🛡️ 스티커 메모 종합 보호 시스템 로드 완료');
    console.log('🛠️ 명령어:');
    console.log('  - debugStickyProtection(): 보호 상태 확인');
    console.log('  - toggleStickyProtection(true/false): 보호 수동 전환');
    console.log('  - forceCloseStickyMemo(): 강제 닫기');
    
})();