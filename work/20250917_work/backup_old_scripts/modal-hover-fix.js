// 모달 hover 시 사라지는 문제 해결 스크립트
console.log('🔧 모달 hover 문제 해결 스크립트 로드됨');

(function() {
    'use strict';

    // X 버튼 제거 스크립트가 모달이 열려있을 때 실행되지 않도록 수정
    function patchXButtonRemoval() {
        // 기존 setInterval을 찾아서 수정
        let originalSetInterval = window.setInterval;

        window.setInterval = function(callback, delay) {
            if (delay === 500 && callback.toString().includes('removeAllXButtons')) {
                console.log('🛡️ X 버튼 제거 setInterval을 안전한 버전으로 교체');

                // 안전한 버전으로 교체
                return originalSetInterval.call(this, function() {
                    // 날짜 메모 모달이 열려있으면 실행하지 않음
                    const dateMemoModal = document.getElementById('dateMemoModal');
                    if (dateMemoModal && dateMemoModal.style.display === 'block') {
                        console.log('🚫 날짜 메모 모달이 열려있어 X 버튼 제거 생략');
                        return;
                    }

                    // 메모 상세 모달이 열려있으면 실행하지 않음
                    const memoDetailModal = document.getElementById('memoDetailModal');
                    if (memoDetailModal && memoDetailModal.style.display === 'block') {
                        console.log('🚫 메모 상세 모달이 열려있어 X 버튼 제거 생략');
                        return;
                    }

                    // 모달이 닫혀있을 때만 실행
                    try {
                        callback();
                    } catch (error) {
                        console.error('❌ X 버튼 제거 중 오류:', error);
                    }
                }, delay);
            }

            return originalSetInterval.call(this, callback, delay);
        };

        console.log('✅ setInterval 패치 완료');
    }

    // fixMemoXButtons 함수 패치
    function patchFixMemoXButtons() {
        // 기존 함수를 찾아서 패치
        if (window.fixMemoXButtons) {
            const originalFixMemoXButtons = window.fixMemoXButtons;

            window.fixMemoXButtons = function() {
                // 모달이 열려있으면 실행하지 않음
                const dateMemoModal = document.getElementById('dateMemoModal');
                const memoDetailModal = document.getElementById('memoDetailModal');

                if ((dateMemoModal && dateMemoModal.style.display === 'block') ||
                    (memoDetailModal && memoDetailModal.style.display === 'block')) {
                    console.log('🚫 모달이 열려있어 fixMemoXButtons 생략');
                    return;
                }

                return originalFixMemoXButtons.apply(this, arguments);
            };

            console.log('✅ fixMemoXButtons 함수 패치 완료');
        }
    }

    // MutationObserver 패치 (너무 민감한 DOM 감시 방지)
    function patchMutationObserver() {
        const OriginalMutationObserver = window.MutationObserver;

        window.MutationObserver = function(callback) {
            const wrappedCallback = function(mutationsList, observer) {
                // 모달이 열려있으면 X 버튼 제거 관련 변경사항 무시
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (dateMemoModal && dateMemoModal.style.display === 'block') {
                    // 모달 내부의 변경사항만 허용
                    const filteredMutations = mutationsList.filter(mutation => {
                        if (mutation.type === 'childList') {
                            for (let node of mutation.addedNodes) {
                                if (node.nodeType === Node.ELEMENT_NODE &&
                                    !dateMemoModal.contains(node)) {
                                    return false; // 모달 외부 변경사항 필터링
                                }
                            }
                        }
                        return true;
                    });

                    if (filteredMutations.length > 0) {
                        callback(filteredMutations, observer);
                    }
                } else {
                    callback(mutationsList, observer);
                }
            };

            return new OriginalMutationObserver(wrappedCallback);
        };

        console.log('✅ MutationObserver 패치 완료');
    }

    // 모달 상태 변경 감지기
    function setupModalStateMonitor() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) return;

        // 모달 상태 변경 감지
        let lastDisplayState = dateMemoModal.style.display;

        setInterval(() => {
            const currentDisplayState = dateMemoModal.style.display;
            if (lastDisplayState !== currentDisplayState) {
                console.log(`📊 모달 상태 변경: ${lastDisplayState} → ${currentDisplayState}`);
                lastDisplayState = currentDisplayState;

                if (currentDisplayState === 'block') {
                    console.log('🔓 모달 열림 - X 버튼 제거 스크립트 비활성화');
                } else {
                    console.log('🔒 모달 닫힘 - X 버튼 제거 스크립트 재활성화');
                }
            }
        }, 100);

        console.log('✅ 모달 상태 모니터링 설정 완료');
    }

    // 클릭 이벤트 디버깅
    function setupClickEventDebugging() {
        document.addEventListener('click', function(e) {
            const dateMemoModal = document.getElementById('dateMemoModal');
            if (dateMemoModal && dateMemoModal.style.display === 'block') {
                console.log('🔍 모달 열려있는 상태에서 클릭:', {
                    target: e.target,
                    targetClass: e.target.className,
                    targetText: e.target.textContent?.trim(),
                    isModal: e.target === dateMemoModal,
                    isTrusted: e.isTrusted
                });

                // 모달 외부 클릭인지 확인
                if (e.target === dateMemoModal) {
                    console.log('⚠️ 모달 외부 클릭 감지 - 닫힐 수 있음');
                }
            }
        }, true);

        console.log('✅ 클릭 이벤트 디버깅 설정 완료');
    }

    // 초기화
    function init() {
        console.log('🚀 모달 hover 문제 해결 시스템 초기화');

        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    patchXButtonRemoval();
                    patchFixMemoXButtons();
                    patchMutationObserver();
                    setupModalStateMonitor();
                    setupClickEventDebugging();
                    console.log('✅ 모달 hover 문제 해결 시스템 초기화 완료');
                }, 1000); // 다른 스크립트가 로드된 후 실행
            });
        } else {
            setTimeout(() => {
                patchXButtonRemoval();
                patchFixMemoXButtons();
                patchMutationObserver();
                setupModalStateMonitor();
                setupClickEventDebugging();
                console.log('✅ 모달 hover 문제 해결 시스템 초기화 완료');
            }, 1000);
        }
    }

    init();
})();