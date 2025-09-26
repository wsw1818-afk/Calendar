// 🚫 달력 외곽 클릭 시 일정 추가 메뉴 실행 방지 스크립트 - 강화 버전
// 모든 형태의 의도하지 않은 일정 추가 모달 실행을 완전 차단

console.log('🚫 달력 외곽 클릭 일정 추가 방지 스크립트 로드됨 (강화 버전)');

(function() {
    'use strict';

    let isPreventingModal = false;
    let lastIntentionalClick = 0;

    // 더 엄격한 의도적 클릭 확인
    function isIntentionalCreateModalClick(target) {
        // 정확히 일정 추가 버튼을 클릭한 경우만 허용
        if (target && (target.id === 'createBtn' ||
                      target.textContent?.trim() === '➕ 일정 추가')) {
            lastIntentionalClick = Date.now();
            console.log('✅ 의도적인 일정 추가 버튼 클릭 확인됨');
            return true;
        }
        return false;
    }

    // 달력 영역과 허용된 UI 영역 정의
    function isAllowedClickArea(target) {
        if (!target) return false;

        // 허용된 클릭 영역들
        const allowedSelectors = [
            // 달력 관련
            '.calendar-container', '.days-grid', '.day', '.day-number', '.weekday',
            '#daysGrid', '.calendar-header', '.month-year', '.calendar-nav',
            // UI 버튼들
            '.action-btn', '.btn-primary', '.btn-secondary', '.modal-close',
            // 모달과 폼 요소들
            '.modal', '.modal-content', 'input', 'textarea', 'select', 'button',
            // 설정 패널
            '.settings-panel', '.control-group'
        ];

        // 허용된 ID들
        const allowedIds = [
            'createBtn', 'memoBtn', 'excelBtn', 'settingsBtn', 'storageBtn',
            'unifiedCloudBtn', 'syncStatusBtn'
        ];

        // ID 확인
        if (target.id && allowedIds.includes(target.id)) {
            return true;
        }

        // 셀렉터 확인
        for (const selector of allowedSelectors) {
            if (target.closest && target.closest(selector)) {
                return true;
            }
        }

        return false;
    }

    // 원본 openModal 함수 완전 래핑
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(modalId) {
            if (modalId === 'createModal') {
                const timeSinceIntentional = Date.now() - lastIntentionalClick;

                // 최근에 의도적 클릭이 없었다면 차단
                if (timeSinceIntentional > 1000) {
                    console.log('🚫 의도하지 않은 일정 추가 모달 열기 차단 (시간 초과)');
                    return false;
                }
            }

            return originalOpenModal.apply(this, arguments);
        };
    }

    // 모든 클릭 이벤트 모니터링 (최고 우선순위)
    document.addEventListener('click', function(event) {
        const target = event.target;

        // 의도적인 일정 추가 버튼 클릭인지 확인
        if (isIntentionalCreateModalClick(target)) {
            isPreventingModal = false;
            return; // 정상 진행
        }

        // 허용되지 않은 영역 클릭 시 모달 방지 모드 활성화
        if (!isAllowedClickArea(target)) {
            isPreventingModal = true;
            console.log('🚫 달력 외곽 클릭 감지 - 모달 방지 모드 활성화:', {
                tagName: target.tagName,
                id: target.id,
                className: target.className,
                textContent: target.textContent?.trim().substring(0, 50)
            });

            // 즉시 모달 차단
            setTimeout(() => {
                const createModal = document.getElementById('createModal');
                if (createModal && createModal.style.display === 'block') {
                    console.log('🚫 외곽 클릭으로 인한 일정 추가 모달 강제 닫기');
                    createModal.style.display = 'none';

                    if (window.closeModal) {
                        window.closeModal('createModal');
                    }
                }
                isPreventingModal = false;
            }, 10);
        }
    }, true); // capture phase에서 최우선 처리

    // 추가 보안: body 레벨 클릭 이벤트도 모니터링
    document.body.addEventListener('click', function(event) {
        if (isPreventingModal && event.target.tagName === 'BODY') {
            console.log('🚫 body 클릭으로 인한 모달 방지');
            event.stopPropagation();
            event.preventDefault();
        }
    }, true);

    // DOM 변경 감시 (더 강화)
    const modalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' &&
                mutation.attributeName === 'style' &&
                mutation.target.id === 'createModal') {

                const modal = mutation.target;
                if (modal.style.display === 'block') {
                    const timeSinceIntentional = Date.now() - lastIntentionalClick;

                    if (timeSinceIntentional > 1000) {
                        console.log('🚫 MutationObserver: 의도하지 않은 모달 열기 감지하여 차단');
                        modal.style.display = 'none';
                    }
                }
            }
        });
    });

    // 즉시 모달 관찰 시작
    const createModal = document.getElementById('createModal');
    if (createModal) {
        modalObserver.observe(createModal, {
            attributes: true,
            attributeFilter: ['style'],
            childList: false,
            subtree: false
        });
        console.log('👁️ createModal 관찰 시작 (강화 모드)');
    } else {
        // 모달이 아직 없다면 지연 후 다시 시도
        setTimeout(() => {
            const createModal = document.getElementById('createModal');
            if (createModal) {
                modalObserver.observe(createModal, {
                    attributes: true,
                    attributeFilter: ['style']
                });
                console.log('👁️ createModal 관찰 시작 (지연 모드)');
            }
        }, 2000);
    }

    // window 레벨에서도 방지
    window.addEventListener('click', function(event) {
        if (isPreventingModal) {
            console.log('🚫 window 레벨 클릭 방지');
            event.stopImmediatePropagation();
        }
    }, true);

    // 추가 안전장치: openModal 함수 자체를 더 엄격하게 제어
    const strictOpenModal = function(modalId) {
        if (modalId === 'createModal') {
            const timeSinceIntentional = Date.now() - lastIntentionalClick;
            if (timeSinceIntentional > 1000) {
                console.log('🚫 strictOpenModal: 일정 추가 모달 호출 차단');
                return false;
            }
            console.log('✅ strictOpenModal: 정상적인 일정 추가 모달 호출');
        }

        if (originalOpenModal) {
            return originalOpenModal.call(this, modalId);
        }
    };

    // 전역 함수 교체
    window.openModal = strictOpenModal;

    console.log('✅ 달력 외곽 클릭 일정 추가 방지 시스템 초기화 완료 (강화 버전)');
    console.log('🛡️ 이제 의도하지 않은 모든 일정 추가 모달 실행이 차단됩니다');
})();