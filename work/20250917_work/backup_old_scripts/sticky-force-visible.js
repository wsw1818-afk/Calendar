/**
 * 스티커 메모 강제 표시 수정
 * 스티커 창이 열려도 보이지 않는 문제 해결
 */

(function() {
    'use strict';
    
    console.log('👁️ 스티커 메모 강제 표시 시스템 시작');
    
    /**
     * 스티커 메모 강제 표시
     */
    function forceShowStickyMemo() {
        const stickyMemo = document.getElementById('stickyMemo');
        
        if (!stickyMemo) {
            console.error('❌ 스티커 메모 요소를 찾을 수 없습니다');
            return false;
        }
        
        console.log('🔧 스티커 메모 강제 표시 시작');
        
        // 1. 모든 인라인 스타일 제거
        stickyMemo.removeAttribute('style');
        
        // 2. 강제 스타일 적용
        const criticalStyles = {
            'position': 'fixed',
            'z-index': '2147483647',
            'display': 'flex',
            'flex-direction': 'column',
            'visibility': 'visible',
            'opacity': '1',
            'width': '350px',
            'min-height': '400px',
            'max-height': '80vh',
            'background': 'linear-gradient(135deg, rgba(255, 249, 196, 0.98) 0%, rgba(255, 245, 157, 0.98) 100%)',
            'border-radius': '20px',
            'box-shadow': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 120px rgba(255, 193, 7, 0.5)',
            'border': '1px solid rgba(255, 193, 7, 0.3)',
            'backdrop-filter': 'blur(20px) saturate(180%)',
            'pointer-events': 'auto',
            'transform': 'translateZ(0)',
            'will-change': 'transform',
            'left': '50%',
            'top': '50%',
            'margin-left': '-175px',
            'margin-top': '-200px'
        };
        
        // 스타일 적용
        Object.entries(criticalStyles).forEach(([prop, value]) => {
            stickyMemo.style.setProperty(prop, value, 'important');
        });
        
        // 3. body 최상위로 이동
        if (stickyMemo.parentNode !== document.body) {
            document.body.appendChild(stickyMemo);
            console.log('📤 스티커 메모를 body 최상위로 이동');
        }
        
        // 4. 클래스 추가
        stickyMemo.classList.add('sticky-memo-visible');
        
        // 5. 다른 요소들 z-index 낮추기
        const allElements = document.querySelectorAll('*:not(#stickyMemo)');
        allElements.forEach(el => {
            const zIndex = window.getComputedStyle(el).zIndex;
            if (zIndex && parseInt(zIndex) > 1000) {
                el.style.setProperty('z-index', '999', 'important');
            }
        });
        
        console.log('✅ 스티커 메모 강제 표시 완료');
        return true;
    }
    
    /**
     * openStickyMemo 함수 완전 재정의
     */
    function redefineOpenStickyMemo() {
        const originalOpen = window.openStickyMemo;
        
        window.openStickyMemo = function() {
            console.log('👁️ 강제 표시 openStickyMemo 실행');
            
            // 기존 함수 실행
            if (originalOpen) {
                originalOpen.apply(this, arguments);
            }
            
            // 강제 표시 실행 (여러 번 시도)
            let attempts = 0;
            const maxAttempts = 10;
            
            const showInterval = setInterval(() => {
                attempts++;
                console.log(`🔄 표시 시도 ${attempts}/${maxAttempts}`);
                
                const success = forceShowStickyMemo();
                
                if (success || attempts >= maxAttempts) {
                    clearInterval(showInterval);
                    
                    if (success) {
                        console.log('✅ 스티커 메모 표시 성공');
                        
                        // 추가 보호 조치
                        protectVisibility();
                    } else {
                        console.error('❌ 스티커 메모 표시 실패');
                    }
                }
            }, 100);
        };
        
        console.log('✅ openStickyMemo 함수 재정의 완료');
    }
    
    /**
     * 표시 상태 보호
     */
    function protectVisibility() {
        const stickyMemo = document.getElementById('stickyMemo');
        if (!stickyMemo) return;
        
        // MutationObserver로 스타일 변경 감시
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = stickyMemo.style.display;
                    const visibility = stickyMemo.style.visibility;
                    
                    if (display === 'none' || visibility === 'hidden') {
                        console.warn('⚠️ 숨김 시도 감지 - 강제 표시 유지');
                        stickyMemo.style.setProperty('display', 'flex', 'important');
                        stickyMemo.style.setProperty('visibility', 'visible', 'important');
                        stickyMemo.style.setProperty('opacity', '1', 'important');
                    }
                }
            }
        });
        
        observer.observe(stickyMemo, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('🛡️ 표시 상태 보호 활성화');
    }
    
    /**
     * 전역 CSS 추가
     */
    function addForceVisibleCSS() {
        if (document.getElementById('sticky-force-visible-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-force-visible-styles';
        style.textContent = `
            /* 스티커 메모 강제 표시 */
            #stickyMemo,
            #stickyMemo.sticky-memo-visible {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 2147483647 !important;
                position: fixed !important;
            }
            
            /* 숨김 클래스 무효화 */
            #stickyMemo.hidden,
            #stickyMemo.hide,
            #stickyMemo[style*="display: none"],
            #stickyMemo[style*="display:none"],
            #stickyMemo[style*="visibility: hidden"],
            #stickyMemo[style*="visibility:hidden"] {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 다른 요소들 z-index 제한 */
            body > *:not(#stickyMemo) {
                z-index: 999 !important;
                max-z-index: 999 !important;
            }
            
            /* 스티커 메모 내부 요소 표시 보장 */
            #stickyMemo * {
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 강제 표시 CSS 추가 완료');
    }
    
    /**
     * 수동 표시 함수
     */
    window.forceShowSticky = function() {
        console.log('🚨 수동 강제 표시 실행');
        
        // 스티커 메모가 없으면 생성
        let stickyMemo = document.getElementById('stickyMemo');
        
        if (!stickyMemo) {
            console.log('📝 스티커 메모 생성 시도');
            
            if (window.createStickyMemo) {
                stickyMemo = window.createStickyMemo();
            } else if (window.createUnifiedStickyMemo) {
                stickyMemo = window.createUnifiedStickyMemo();
            }
        }
        
        if (stickyMemo) {
            forceShowStickyMemo();
            protectVisibility();
            console.log('✅ 수동 강제 표시 완료');
        } else {
            console.error('❌ 스티커 메모를 생성할 수 없습니다');
        }
    };
    
    /**
     * 디버그 함수
     */
    window.debugStickyVisibility = function() {
        const stickyMemo = document.getElementById('stickyMemo');
        
        console.group('👁️ 스티커 메모 표시 상태 디버그');
        
        if (stickyMemo) {
            const rect = stickyMemo.getBoundingClientRect();
            const computed = window.getComputedStyle(stickyMemo);
            
            console.log('📌 요소 존재:', true);
            console.log('📊 Computed 스타일:', {
                display: computed.display,
                visibility: computed.visibility,
                opacity: computed.opacity,
                zIndex: computed.zIndex,
                position: computed.position
            });
            console.log('📐 위치 및 크기:', {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                isVisible: rect.width > 0 && rect.height > 0
            });
            console.log('👪 부모 요소:', stickyMemo.parentNode.tagName);
            console.log('🎨 인라인 스타일:', stickyMemo.style.cssText);
            console.log('📝 클래스:', stickyMemo.className);
            
            // 가시성 테스트
            const isInViewport = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
            console.log('👁️ 뷰포트 내:', isInViewport);
            
        } else {
            console.log('❌ 스티커 메모 요소가 없습니다');
        }
        
        console.groupEnd();
    };
    
    /**
     * 초기화
     */
    function init() {
        console.log('👁️ 스티커 메모 강제 표시 시스템 초기화');
        
        // CSS 추가
        addForceVisibleCSS();
        
        // openStickyMemo 재정의
        redefineOpenStickyMemo();
        
        // 기존 스티커 메모 확인
        const existingSticky = document.getElementById('stickyMemo');
        if (existingSticky) {
            console.log('📌 기존 스티커 메모 발견 - 강제 표시');
            forceShowStickyMemo();
            protectVisibility();
        }
        
        console.log('✅ 스티커 메모 강제 표시 시스템 준비 완료');
    }
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('👁️ 스티커 메모 강제 표시 시스템 로드 완료');
    console.log('🛠️ 명령어: forceShowSticky(), debugStickyVisibility()');
    
})();