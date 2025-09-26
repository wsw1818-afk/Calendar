/**
 * 설정 버튼 클릭 문제 해결 스크립트
 * prevent-settings-modal-auto-open.js로 인해 설정 모달이 열리지 않는 문제 수정
 */

(function() {
    'use strict';

    console.log('🔧 설정 버튼 클릭 수정 스크립트 로드됨');

    function fixSettingsButtonClick() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (!settingsBtn) {
            console.error('❌ 설정 버튼을 찾을 수 없습니다');
            return;
        }

        // 기존 이벤트 리스너 완전 제거
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

        // 새로운 안전한 클릭 이벤트 추가
        newSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('⚙️ 설정 버튼 클릭됨 - 모달 열기 시도');

            // 설정 모달 강제 표시
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                // 모든 방해 요소 제거
                settingsModal.style.display = 'block';
                settingsModal.style.visibility = 'visible';
                settingsModal.style.opacity = '1';
                settingsModal.style.zIndex = '9999';

                // 모달이 숨겨지지 않도록 클래스 제거
                settingsModal.classList.remove('ultimate-hidden');

                // 설정 로드
                if (typeof loadCurrentSettingsToModal === 'function') {
                    try {
                        loadCurrentSettingsToModal();
                        console.log('✅ 설정 데이터 로드 완료');
                    } catch (error) {
                        console.error('❌ 설정 데이터 로드 중 오류:', error);
                    }
                }

                console.log('✅ 설정 모달이 열렸습니다');
            } else {
                console.error('❌ 설정 모달을 찾을 수 없습니다');

                // 모달 재생성 시도
                if (typeof recreateSettingsModal === 'function') {
                    try {
                        const newModal = recreateSettingsModal();
                        if (newModal) {
                            newModal.style.display = 'block';
                            console.log('✅ 설정 모달 재생성 및 열기 완료');
                        }
                    } catch (error) {
                        console.error('❌ 설정 모달 재생성 중 오류:', error);
                    }
                }
            }
        });

        console.log('✅ 설정 버튼 클릭 이벤트 수정 완료');
    }

    // prevent-settings-modal-auto-open.js의 차단 변수 무력화
    function disableModalBlocking() {
        // 전역 차단 변수들을 찾아서 비활성화
        if (window.isWindowClosing !== undefined) {
            window.isWindowClosing = false;
            console.log('🔓 isWindowClosing 변수 비활성화');
        }

        if (window.isPageUnloading !== undefined) {
            window.isPageUnloading = false;
            console.log('🔓 isPageUnloading 변수 비활성화');
        }

        // setTimeout이 오버라이드된 경우 원본으로 복원
        if (window.originalSetTimeout) {
            window.setTimeout = window.originalSetTimeout;
            console.log('🔓 setTimeout 함수 복원');
        }

        // getElementById가 오버라이드된 경우 원본으로 복원
        if (document.originalGetElementById) {
            document.getElementById = document.originalGetElementById;
            console.log('🔓 getElementById 함수 복원');
        }

        // querySelector가 오버라이드된 경우 원본으로 복원
        if (document.originalQuerySelector) {
            document.querySelector = document.originalQuerySelector;
            console.log('🔓 querySelector 함수 복원');
        }
    }

    // 모달 차단을 주기적으로 해제
    function maintainModalAccess() {
        // 창 닫기 관련 변수들을 지속적으로 false로 유지
        if (typeof window.isWindowClosing !== 'undefined') {
            window.isWindowClosing = false;
        }
        if (typeof window.isPageUnloading !== 'undefined') {
            window.isPageUnloading = false;
        }
    }

    // DOM 로드 완료 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                disableModalBlocking();
                fixSettingsButtonClick();

                // 주기적으로 모달 접근 권한 유지
                setInterval(maintainModalAccess, 1000);
            }, 500); // prevent-settings-modal-auto-open.js 실행 후에 실행되도록 지연
        });
    } else {
        setTimeout(() => {
            disableModalBlocking();
            fixSettingsButtonClick();

            // 주기적으로 모달 접근 권한 유지
            setInterval(maintainModalAccess, 1000);
        }, 500);
    }

    console.log('✅ 설정 버튼 클릭 수정 시스템 초기화 완료');
})();