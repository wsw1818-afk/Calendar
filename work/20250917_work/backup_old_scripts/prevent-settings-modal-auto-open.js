/**
 * 창 닫기 시 설정 모달 자동 열림 방지 시스템
 * 달력 앱에서 창을 닫을 때 설정 창이 자동으로 열리는 문제 해결
 */

(function() {
    'use strict';

    console.log('🚫 설정 모달 자동 열림 방지 시스템 로드됨');

    // 창이 닫히고 있는 상태를 추적
    let isWindowClosing = false;
    let isPageUnloading = false;

    // beforeunload 이벤트에서 창 닫기 상태 설정
    window.addEventListener('beforeunload', function(e) {
        console.log('🚪 창 닫기 감지됨 - 설정 모달 자동 열림 방지 활성화');
        isWindowClosing = true;
        isPageUnloading = true;

        // 모든 setTimeout과 setInterval을 정리
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }

        const highestIntervalId = setInterval(() => {}, 0);
        for (let i = 0; i < highestIntervalId; i++) {
            clearInterval(i);
        }

        console.log('⏱️ 모든 타이머 정리 완료');
    });

    // unload 이벤트에서도 상태 설정
    window.addEventListener('unload', function(e) {
        console.log('🚪 페이지 언로드 감지됨');
        isWindowClosing = true;
        isPageUnloading = true;
    });

    // pagehide 이벤트도 처리 (모바일 등에서)
    window.addEventListener('pagehide', function(e) {
        console.log('📱 페이지 숨김 감지됨');
        isWindowClosing = true;
        isPageUnloading = true;
    });

    // visibilitychange 이벤트로 창이 숨겨질 때 감지
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('👁️ 페이지가 숨겨짐 - 설정 모달 방지 활성화');
            isWindowClosing = true;
        }
    });

    // 원본 settingsModal 관련 함수들을 보호
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay, ...args) {
        // 창이 닫히고 있을 때는 설정 모달 관련 setTimeout 차단
        if (isWindowClosing && typeof callback === 'function') {
            const callbackStr = callback.toString();
            if (callbackStr.includes('settingsModal') ||
                callbackStr.includes('설정') ||
                callbackStr.includes('settings') ||
                callbackStr.includes('modal')) {
                console.log('🚫 창 닫기 중 설정 모달 관련 setTimeout 차단됨');
                return -1; // 빈 타이머 ID 반환
            }
        }
        return originalSetTimeout.call(this, callback, delay, ...args);
    };

    // 설정 버튼 클릭 이벤트를 오버라이드
    function preventSettingsModalAutoOpen() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            // 기존 이벤트 리스너 제거
            const newSettingsBtn = settingsBtn.cloneNode(true);
            settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

            // 새로운 안전한 이벤트 리스너 추가
            newSettingsBtn.addEventListener('click', function(e) {
                // 창이 닫히고 있을 때는 설정 모달 열기 차단
                if (isWindowClosing || isPageUnloading) {
                    console.log('🚫 창 닫기 중이므로 설정 모달 열기 차단됨');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                console.log('⚙️ 설정 버튼 안전 클릭 - 모달 열기');

                // 정상적인 설정 모달 열기
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal) {
                    settingsModal.style.display = 'block';

                    if (typeof loadCurrentSettingsToModal === 'function') {
                        loadCurrentSettingsToModal();
                    }
                }
            });

            console.log('✅ 설정 버튼 안전 이벤트 등록 완료');
        }
    }

    // DOM이 로드된 후 설정 버튼 보호 적용
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preventSettingsModalAutoOpen);
    } else {
        preventSettingsModalAutoOpen();
    }

    // 추가 보안: 설정 모달을 강제로 열려는 시도를 차단
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        const result = originalQuerySelector.call(this, selector);

        // 창이 닫히고 있을 때 설정 모달 관련 쿼리 차단
        if (isWindowClosing && selector && (
            selector.includes('settingsModal') ||
            selector.includes('#settingsModal') ||
            selector.includes('.modal#settingsModal')
        )) {
            console.log('🚫 창 닫기 중 설정 모달 쿼리 차단됨:', selector);
            return null;
        }

        return result;
    };

    const originalGetElementById = document.getElementById;
    document.getElementById = function(id) {
        // 창이 닫히고 있을 때 settingsModal getElementById 차단
        if (isWindowClosing && id === 'settingsModal') {
            console.log('🚫 창 닫기 중 settingsModal getElementById 차단됨');
            return null;
        }

        return originalGetElementById.call(this, id);
    };

    // 모달 표시를 차단하는 스타일 보호
    function blockModalDisplay() {
        if (isWindowClosing) {
            const settingsModal = originalGetElementById.call(document, 'settingsModal');
            if (settingsModal && settingsModal.style.display === 'block') {
                console.log('🚫 창 닫기 중 설정 모달 강제 숨김');
                settingsModal.style.display = 'none';
            }
        }
    }

    // 주기적으로 모달 상태 체크 (창이 닫히고 있을 때만)
    setInterval(() => {
        if (isWindowClosing) {
            blockModalDisplay();
        }
    }, 100);

    // 페이지가 다시 활성화될 때 상태 초기화 (뒤로가기 등)
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            console.log('📄 페이지가 캐시에서 복원됨 - 상태 초기화');
            isWindowClosing = false;
            isPageUnloading = false;
        }
    });

    // focus 이벤트로 창이 다시 활성화될 때 상태 초기화
    window.addEventListener('focus', function() {
        if (isWindowClosing) {
            console.log('🎯 창이 다시 포커스됨 - 창 닫기 상태 해제');
            isWindowClosing = false;
            isPageUnloading = false;
        }
    });

    console.log('✅ 설정 모달 자동 열림 방지 시스템 초기화 완료');
})();