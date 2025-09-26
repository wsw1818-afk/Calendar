/**
 * 스티커 메모 가시성 문제 최종 수정
 * 두 번째 클릭 시 사라지는 문제와 display 관리 통합
 */

(function() {
    'use strict';
    
    console.log('🔧 스티커 메모 가시성 수정 시작');
    
    let stickyMemoState = {
        element: null,
        isVisible: false,
        isCreating: false
    };
    
    /**
     * 스티커 메모 요소 찾기 또는 생성
     */
    function getStickyMemo() {
        // 캐시된 요소 확인
        if (stickyMemoState.element && document.body.contains(stickyMemoState.element)) {
            return stickyMemoState.element;
        }
        
        // DOM에서 찾기
        stickyMemoState.element = document.getElementById('stickyMemo');
        
        // 없으면 생성
        if (!stickyMemoState.element && !stickyMemoState.isCreating) {
            stickyMemoState.isCreating = true;
            console.log('📝 스티커 메모 새로 생성');
            
            // 기존 생성 함수 시도
            if (window.createUnifiedStickyMemo) {
                stickyMemoState.element = window.createUnifiedStickyMemo();
            } else if (window.createStickyMemo) {
                stickyMemoState.element = window.createStickyMemo();
            } else {
                // 직접 생성
                stickyMemoState.element = createStickyMemoElement();
            }
            
            stickyMemoState.isCreating = false;
        }
        
        return stickyMemoState.element;
    }
    
    /**
     * 스티커 메모 직접 생성
     */
    function createStickyMemoElement() {
        const stickyMemo = document.createElement('div');
        stickyMemo.id = 'stickyMemo';
        stickyMemo.className = 'sticky-memo';
        stickyMemo.innerHTML = `
            <div class="sticky-header">
                <div class="sticky-title">📝 스티커 메모</div>
                <button class="sticky-control-btn sticky-close" id="stickyClose" title="닫기">✕</button>
            </div>
            <div class="sticky-content" style="padding: 20px;">
                <textarea class="sticky-textarea" style="width: 100%; height: 300px; border: none; background: transparent; resize: none; outline: none; font-size: 14px;" 
                    placeholder="메모를 입력하세요..."></textarea>
            </div>
        `;
        
        document.body.appendChild(stickyMemo);
        console.log('✅ 스티커 메모 요소 생성 완료');
        
        return stickyMemo;
    }
    
    /**
     * 스티커 메모 표시
     */
    function showStickyMemo() {
        const stickyMemo = getStickyMemo();
        
        if (!stickyMemo) {
            console.error('❌ 스티커 메모를 생성할 수 없습니다');
            return;
        }
        
        console.log('👁️ 스티커 메모 표시');
        
        // body 최상위로 이동
        if (stickyMemo.parentNode !== document.body) {
            document.body.appendChild(stickyMemo);
        }
        
        // 표시 스타일 적용
        const styles = {
            'display': 'flex',
            'flex-direction': 'column',
            'visibility': 'visible',
            'opacity': '1',
            'position': 'fixed',
            'z-index': '2147483647',
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
        
        // 상태 업데이트
        stickyMemoState.isVisible = true;
        
        // 클래스 추가
        stickyMemo.classList.add('sticky-visible');
        stickyMemo.classList.remove('sticky-hidden');
        
        console.log('✅ 스티커 메모 표시 완료');
    }
    
    /**
     * 스티커 메모 숨기기
     */
    function hideStickyMemo() {
        const stickyMemo = getStickyMemo();
        
        if (!stickyMemo) return;
        
        console.log('🙈 스티커 메모 숨기기');
        
        stickyMemo.style.setProperty('display', 'none', 'important');
        stickyMemoState.isVisible = false;
        
        stickyMemo.classList.remove('sticky-visible');
        stickyMemo.classList.add('sticky-hidden');
    }
    
    /**
     * 스티커 메모 토글
     */
    function toggleStickyMemo() {
        console.log('🔄 스티커 메모 토글');
        
        const stickyMemo = getStickyMemo();
        
        if (!stickyMemo) {
            showStickyMemo();
            return;
        }
        
        // 현재 표시 상태 확인
        const computed = window.getComputedStyle(stickyMemo);
        const isCurrentlyVisible = (
            computed.display !== 'none' && 
            computed.visibility !== 'hidden' &&
            computed.opacity !== '0'
        );
        
        console.log(`현재 표시 상태: ${isCurrentlyVisible ? '표시됨' : '숨겨짐'}`);
        
        if (isCurrentlyVisible) {
            hideStickyMemo();
        } else {
            showStickyMemo();
        }
    }
    
    /**
     * openStickyMemo 완전 재정의
     */
    function overrideOpenStickyMemo() {
        // 모든 기존 함수 백업
        const originalFunctions = {
            open: window.openStickyMemo,
            create: window.createStickyMemo,
            createUnified: window.createUnifiedStickyMemo
        };
        
        // 새로운 openStickyMemo 정의
        window.openStickyMemo = function() {
            console.log('🎯 통합 openStickyMemo 실행');
            
            // 이미 표시되어 있으면 숨기지 않고 유지
            const stickyMemo = getStickyMemo();
            if (stickyMemo) {
                const computed = window.getComputedStyle(stickyMemo);
                if (computed.display !== 'none') {
                    console.log('📌 이미 표시되어 있음 - 유지');
                    return;
                }
            }
            
            // 표시
            showStickyMemo();
        };
        
        // closeStickyMemo 재정의
        window.closeStickyMemo = function() {
            console.log('🔴 closeStickyMemo 실행');
            hideStickyMemo();
        };
        
        console.log('✅ 함수 재정의 완료');
    }
    
    /**
     * 닫기 버튼 이벤트 설정
     */
    function setupCloseButton() {
        // MutationObserver로 닫기 버튼 감시
        const observer = new MutationObserver((mutations) => {
            const closeBtn = document.getElementById('stickyClose');
            if (closeBtn && !closeBtn.hasAttribute('data-event-set')) {
                closeBtn.setAttribute('data-event-set', 'true');
                
                // 기존 이벤트 제거
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                // 새 이벤트 설정
                newCloseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔴 닫기 버튼 클릭');
                    hideStickyMemo();
                });
                
                console.log('✅ 닫기 버튼 이벤트 설정');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 전역 CSS 추가
     */
    function addVisibilityCSS() {
        if (document.getElementById('sticky-visibility-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-visibility-styles';
        style.textContent = `
            /* 스티커 메모 가시성 */
            #stickyMemo.sticky-visible {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            #stickyMemo.sticky-hidden {
                display: none !important;
            }
            
            /* z-index 최우선 */
            #stickyMemo {
                z-index: 2147483647 !important;
            }
            
            /* 다른 요소들 제한 */
            body > *:not(#stickyMemo) {
                max-z-index: 9999 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 가시성 CSS 추가 완료');
    }
    
    /**
     * 디버그 함수
     */
    window.debugStickyState = function() {
        console.group('🔍 스티커 메모 상태');
        console.log('State:', stickyMemoState);
        
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            const computed = window.getComputedStyle(stickyMemo);
            console.log('DOM 요소:', stickyMemo);
            console.log('Display:', computed.display);
            console.log('Visibility:', computed.visibility);
            console.log('Opacity:', computed.opacity);
            console.log('Z-index:', computed.zIndex);
            console.log('Position:', computed.position);
            console.log('Parent:', stickyMemo.parentNode);
        } else {
            console.log('❌ DOM 요소 없음');
        }
        
        console.groupEnd();
    };
    
    /**
     * 수동 표시 함수
     */
    window.showSticky = function() {
        console.log('🚨 수동 표시 실행');
        showStickyMemo();
    };
    
    window.hideSticky = function() {
        console.log('🚨 수동 숨기기 실행');
        hideStickyMemo();
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('🔧 스티커 메모 가시성 시스템 초기화');
        
        // CSS 추가
        addVisibilityCSS();
        
        // 함수 재정의
        overrideOpenStickyMemo();
        
        // 닫기 버튼 이벤트
        setupCloseButton();
        
        console.log('✅ 스티커 메모 가시성 시스템 준비 완료');
    }
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🔧 스티커 메모 가시성 수정 로드 완료');
    console.log('🛠️ 명령어: showSticky(), hideSticky(), debugStickyState()');
    
})();