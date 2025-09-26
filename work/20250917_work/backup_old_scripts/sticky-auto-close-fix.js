/**
 * 스티커 메모 자동 닫힘 방지 수정
 * 스티커 창이 열린 후 즉시 닫히는 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🛡️ 스티커 메모 자동 닫힘 방지 시작');
    
    let isPreventingAutoClose = false;
    let autoCloseTimer = null;
    
    /**
     * 자동 닫힘 방지 시스템
     */
    function preventAutoClose() {
        if (isPreventingAutoClose) return;
        
        isPreventingAutoClose = true;
        console.log('🛡️ 자동 닫힘 방지 활성화');
        
        // 원래 closeStickyMemo 함수 백업
        const originalCloseStickyMemo = window.closeStickyMemo;
        
        // closeStickyMemo 함수 재정의 (일시적으로 차단)
        window.closeStickyMemo = function() {
            console.warn('🛡️ 자동 닫힘 차단됨 - 3초 후 허용');
            
            // 3초 후에 원래 함수 복원
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }
            
            autoCloseTimer = setTimeout(() => {
                window.closeStickyMemo = originalCloseStickyMemo;
                isPreventingAutoClose = false;
                console.log('✅ 자동 닫힘 방지 해제 - 수동 닫기 허용');
            }, 3000);
        };
        
        // 수동 닫기 허용 함수
        window.forceCloseStickyMemo = function() {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }
            window.closeStickyMemo = originalCloseStickyMemo;
            isPreventingAutoClose = false;
            originalCloseStickyMemo();
            console.log('🔴 강제 닫기 실행');
        };
    }
    
    /**
     * 스티커 메모 표시 상태 강제 유지
     */
    function enforceVisibility(stickyMemo) {
        if (!stickyMemo) return;
        
        // 표시 상태 강제 설정
        stickyMemo.style.setProperty('display', 'flex', 'important');
        stickyMemo.style.setProperty('visibility', 'visible', 'important');
        stickyMemo.style.setProperty('opacity', '1', 'important');
        
        // 숨김 방지 감시
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    
                    if (target.id === 'stickyMemo' && isPreventingAutoClose) {
                        const display = target.style.display;
                        const visibility = target.style.visibility;
                        const opacity = target.style.opacity;
                        
                        // 숨김 시도 감지 시 강제 표시
                        if (display === 'none' || visibility === 'hidden' || opacity === '0') {
                            console.warn('🛡️ 스티커 메모 숨김 시도 감지 - 강제 표시 유지');
                            target.style.setProperty('display', 'flex', 'important');
                            target.style.setProperty('visibility', 'visible', 'important');
                            target.style.setProperty('opacity', '1', 'important');
                        }
                    }
                }
            }
        });
        
        observer.observe(stickyMemo, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('👁️ 스티커 메모 표시 상태 감시 시작');
    }
    
    /**
     * 이벤트 리스너 무력화
     */
    function disableAutoCloseEvents(stickyMemo) {
        if (!stickyMemo) return;
        
        // 모든 클릭 이벤트 임시 차단
        const originalAddEventListener = stickyMemo.addEventListener;
        
        stickyMemo.addEventListener = function(type, listener, options) {
            if (type === 'click' && isPreventingAutoClose) {
                console.warn('🛡️ 클릭 이벤트 등록 차단:', listener);
                return;
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        // 기존 이벤트 리스너 임시 무력화
        const events = ['click', 'mousedown', 'mouseup'];
        events.forEach(eventType => {
            stickyMemo.addEventListener(eventType, function(e) {
                if (isPreventingAutoClose && e.target.closest('#stickyClose')) {
                    console.warn('🛡️ 닫기 버튼 클릭 차단');
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }, true);
        });
        
        console.log('🛡️ 자동 닫힘 이벤트 무력화 완료');
    }
    
    /**
     * openStickyMemo 함수 감시 및 수정
     */
    function enhanceOpenStickyMemo() {
        const originalOpenStickyMemo = window.openStickyMemo;
        
        if (!originalOpenStickyMemo) {
            console.error('❌ openStickyMemo 함수를 찾을 수 없습니다');
            return;
        }
        
        window.openStickyMemo = function() {
            console.log('🛡️ 강화된 openStickyMemo 실행');
            
            // 자동 닫힘 방지 활성화
            preventAutoClose();
            
            // 원래 함수 실행
            const result = originalOpenStickyMemo.apply(this, arguments);
            
            // 스티커 메모 찾기
            setTimeout(() => {
                const stickyMemo = document.getElementById('stickyMemo');
                
                if (stickyMemo) {
                    console.log('✅ 스티커 메모 발견 - 보호 시스템 적용');
                    
                    // 표시 상태 강제 유지
                    enforceVisibility(stickyMemo);
                    
                    // 자동 닫힘 이벤트 무력화
                    disableAutoCloseEvents(stickyMemo);
                    
                    // 닫기 버튼 재설정
                    const closeBtn = stickyMemo.querySelector('#stickyClose');
                    if (closeBtn) {
                        // 기존 이벤트 제거
                        const newCloseBtn = closeBtn.cloneNode(true);
                        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                        
                        // 새 이벤트 설정 (지연 실행)
                        newCloseBtn.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (confirm('스티커 메모를 닫으시겠습니까?')) {
                                window.forceCloseStickyMemo();
                            }
                        };
                        
                        console.log('🔄 닫기 버튼 이벤트 재설정 완료');
                    }
                    
                } else {
                    console.warn('⚠️ 스티커 메모를 찾을 수 없습니다');
                }
            }, 100);
            
            return result;
        };
        
        console.log('🛡️ openStickyMemo 함수 강화 완료');
    }
    
    /**
     * 전역 타이머 및 인터벌 감시
     */
    function monitorTimers() {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(callback, delay, ...args) {
            // closeStickyMemo를 호출하는 타이머 차단
            if (callback.toString().includes('closeStickyMemo') || 
                callback.toString().includes('display') && callback.toString().includes('none')) {
                
                if (isPreventingAutoClose) {
                    console.warn('🛡️ 의심스러운 setTimeout 차단:', callback.toString().substring(0, 100));
                    return null;
                }
            }
            
            return originalSetTimeout.call(this, callback, delay, ...args);
        };
        
        window.setInterval = function(callback, delay, ...args) {
            // closeStickyMemo를 호출하는 인터벌 차단
            if (callback.toString().includes('closeStickyMemo') || 
                callback.toString().includes('display') && callback.toString().includes('none')) {
                
                if (isPreventingAutoClose) {
                    console.warn('🛡️ 의심스러운 setInterval 차단:', callback.toString().substring(0, 100));
                    return null;
                }
            }
            
            return originalSetInterval.call(this, callback, delay, ...args);
        };
        
        console.log('👁️ 타이머 감시 시스템 활성화');
    }
    
    /**
     * 초기화 함수
     */
    function init() {
        console.log('🛡️ 스티커 메모 자동 닫힘 방지 초기화');
        
        // openStickyMemo 함수 강화
        enhanceOpenStickyMemo();
        
        // 타이머 감시
        monitorTimers();
        
        // 기존 스티커 메모가 있으면 보호 적용
        const existingStickyMemo = document.getElementById('stickyMemo');
        if (existingStickyMemo && existingStickyMemo.style.display !== 'none') {
            console.log('📌 기존 스티커 메모 발견 - 보호 시스템 적용');
            preventAutoClose();
            enforceVisibility(existingStickyMemo);
            disableAutoCloseEvents(existingStickyMemo);
        }
        
        console.log('✅ 스티커 메모 자동 닫힘 방지 시스템 준비 완료');
    }
    
    /**
     * 디버그 함수
     */
    window.debugAutoClose = function() {
        const stickyMemo = document.getElementById('stickyMemo');
        
        console.group('🛡️ 자동 닫힘 방지 디버그');
        console.log('방지 활성화:', isPreventingAutoClose);
        console.log('타이머 ID:', autoCloseTimer);
        
        if (stickyMemo) {
            const style = window.getComputedStyle(stickyMemo);
            console.log('스티커 메모 상태:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity
            });
        }
        
        console.groupEnd();
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🛡️ 스티커 메모 자동 닫힘 방지 로드 완료');
    
})();