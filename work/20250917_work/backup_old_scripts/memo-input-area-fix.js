// 메모 입력 영역 숨김 처리 스크립트
// 메모 상세에서 돌아왔을 때 새 메모 입력 창이 보이지 않도록 수정

(function() {
    console.log('📝 메모 입력 영역 숨김 처리 시작');

    // 새 메모 입력 영역을 숨기는 함수
    function hideNewMemoInputArea() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) return;

        // 새 메모 입력 영역 찾기 (여러 방식으로)
        const inputContainers = [
            dateMemoModal.querySelector('.memo-input-area'),
            dateMemoModal.querySelector('.new-memo-section'),
            dateMemoModal.querySelector('.memo-creation-area'),
            dateMemoModal.querySelector('.memo-form'),
            dateMemoModal.querySelector('[class*="input"]'),
            dateMemoModal.querySelector('[class*="create"]'),
            dateMemoModal.querySelector('[class*="new"]')
        ];

        // 컨테이너가 없으면 직접 textbox들의 부모를 찾기
        const textboxes = dateMemoModal.querySelectorAll('input[type="text"], textarea, [placeholder*="메모"]');

        let hideTargets = [];

        // 컨테이너 방식으로 찾기
        inputContainers.forEach(container => {
            if (container && !hideTargets.includes(container)) {
                hideTargets.push(container);
            }
        });

        // textbox들의 공통 부모 찾기
        if (textboxes.length > 0) {
            textboxes.forEach(textbox => {
                let parent = textbox.parentElement;
                // 적절한 레벨의 부모 찾기 (너무 높지 않게)
                for (let i = 0; i < 3 && parent && parent !== dateMemoModal; i++) {
                    if (parent.contains(textboxes[0]) && parent.contains(textboxes[textboxes.length - 1])) {
                        if (!hideTargets.includes(parent)) {
                            hideTargets.push(parent);
                        }
                        break;
                    }
                    parent = parent.parentElement;
                }
            });
        }

        // 타겟이 없으면 textbox들을 개별적으로 처리
        if (hideTargets.length === 0) {
            textboxes.forEach(textbox => {
                if (textbox.parentElement && !hideTargets.includes(textbox.parentElement)) {
                    hideTargets.push(textbox.parentElement);
                }
            });
        }

        console.log('📝 새 메모 입력 영역 숨김 대상:', hideTargets.length, '개');

        hideTargets.forEach((target, i) => {
            if (target) {
                console.log(`📝 숨김 처리 ${i+1}:`, target.className || target.tagName);
                target.style.display = 'none';
                target.style.visibility = 'hidden';
                target.setAttribute('aria-hidden', 'true');
            }
        });

        // 추가로 저장 버튼도 찾아서 숨기기
        const saveButton = dateMemoModal.querySelector('button[onclick*="save"], button:contains("저장"), .save-btn, [class*="save"]');
        if (saveButton && saveButton.textContent.includes('저장')) {
            console.log('💾 저장 버튼 숨김 처리');
            saveButton.style.display = 'none';
        }

        // 첨부파일 영역도 숨기기
        const attachmentArea = dateMemoModal.querySelector('.attachment-area, [class*="attachment"], [class*="file"]');
        if (attachmentArea) {
            console.log('📎 첨부파일 영역 숨김 처리');
            attachmentArea.style.display = 'none';
        }

        return hideTargets.length > 0;
    }

    // 새 메모 입력 영역을 보이게 하는 함수 (필요시)
    function showNewMemoInputArea() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) return;

        // 숨겨진 요소들 다시 보이기
        const hiddenElements = dateMemoModal.querySelectorAll('[aria-hidden="true"]');
        hiddenElements.forEach(element => {
            if (element.style.display === 'none') {
                element.style.display = '';
                element.style.visibility = '';
                element.removeAttribute('aria-hidden');
                console.log('👁️ 입력 영역 복원:', element.className || element.tagName);
            }
        });
    }

    // closeMemoDetail 함수를 확장하여 입력 영역 숨기기
    function enhanceCloseMemoDetail() {
        if (window.closeMemoDetail) {
            const originalCloseMemoDetail = window.closeMemoDetail;

            window.closeMemoDetail = function() {
                console.log('🔧 확장된 closeMemoDetail 호출 - 입력 영역 숨김 포함');

                // 원본 함수 실행
                const result = originalCloseMemoDetail.apply(this, arguments);

                // 약간의 지연 후 입력 영역 숨기기 (복원 로직 이후에)
                setTimeout(() => {
                    const success = hideNewMemoInputArea();
                    if (success) {
                        console.log('✅ 메모 입력 영역 숨김 완료');
                    } else {
                        console.log('⚠️ 메모 입력 영역 숨김 실패 - 다시 시도');
                        // 조금 더 지연 후 재시도
                        setTimeout(hideNewMemoInputArea, 100);
                    }
                }, 50);

                return result;
            };

            console.log('✅ closeMemoDetail 함수 확장 완료');
        } else {
            console.log('⚠️ closeMemoDetail 함수가 없어서 나중에 다시 시도');
            // 함수가 아직 로드되지 않았을 경우 지연 재시도
            setTimeout(enhanceCloseMemoDetail, 1000);
        }
    }

    // ESC 키 핸들러도 확장
    function enhanceEscKeyHandler() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                const memoDetailModal = document.getElementById('memoDetailModal');
                const dateMemoModal = document.getElementById('dateMemoModal');

                // 메모 상세가 열려있고 ESC가 처리된 후
                if (memoDetailModal && memoDetailModal.style.display === 'block') {
                    console.log('🔑 ESC 키 감지 - 입력 영역 숨김 예약');

                    // ESC 처리 후 입력 영역 숨기기
                    setTimeout(() => {
                        if (dateMemoModal && dateMemoModal.style.display === 'block') {
                            const success = hideNewMemoInputArea();
                            if (success) {
                                console.log('✅ ESC 후 메모 입력 영역 숨김 완료');
                            }
                        }
                    }, 100);
                }
            }
        }, false); // bubble phase에서 처리 (기존 ESC 처리 이후)

        console.log('✅ ESC 키 입력 영역 숨김 핸들러 등록 완료');
    }

    // 날짜 클릭 시에도 입력 영역이 보이지 않도록 처리
    function enhanceDateMemoModal() {
        const originalOpenDateMemoModal = window.openDateMemoModal;

        if (originalOpenDateMemoModal) {
            window.openDateMemoModal = function() {
                console.log('📅 확장된 openDateMemoModal 호출 - 입력 영역 기본 숨김');

                // 원본 함수 실행
                const result = originalOpenDateMemoModal.apply(this, arguments);

                // 모달이 열린 후 입력 영역 숨기기
                setTimeout(() => {
                    hideNewMemoInputArea();
                    console.log('✅ 날짜 메모 모달 열기 후 입력 영역 숨김 완료');
                }, 100);

                return result;
            };

            console.log('✅ openDateMemoModal 함수 확장 완료');
        }
    }

    // 잠금 버튼 클릭 시 입력 영역 토글
    function enhanceLockButton() {
        setTimeout(() => {
            const lockButton = document.querySelector('#dateMemoModal .lock-button, #dateMemoModal [onclick*="lock"], #dateMemoModal [class*="lock"]');
            if (lockButton) {
                lockButton.addEventListener('click', function() {
                    console.log('🔒 잠금 버튼 클릭 감지');

                    setTimeout(() => {
                        // 잠금 상태 확인
                        const isLocked = this.textContent.includes('잠금') || this.classList.contains('locked');

                        if (isLocked) {
                            // 잠금 상태면 입력 영역 숨기기
                            hideNewMemoInputArea();
                            console.log('🔒 잠금 상태 - 입력 영역 숨김');
                        } else {
                            // 잠금 해제 상태면 입력 영역 보이기
                            showNewMemoInputArea();
                            console.log('🔓 잠금 해제 - 입력 영역 표시');
                        }
                    }, 50);
                });

                console.log('✅ 잠금 버튼 이벤트 확장 완료');
            }
        }, 1000);
    }

    // 디버깅 함수
    function debugInputArea() {
        return {
            hideNewMemoInputArea,
            showNewMemoInputArea,
            currentState: (() => {
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (!dateMemoModal) return 'Modal not found';

                const textboxes = dateMemoModal.querySelectorAll('input[type="text"], textarea');
                return {
                    modalVisible: dateMemoModal.style.display !== 'none',
                    textboxCount: textboxes.length,
                    visibleTextboxes: Array.from(textboxes).filter(box =>
                        window.getComputedStyle(box).display !== 'none'
                    ).length
                };
            })()
        };
    }

    // 초기화
    function init() {
        enhanceCloseMemoDetail();
        enhanceEscKeyHandler();
        enhanceDateMemoModal();
        enhanceLockButton();

        // 디버깅 도구를 전역으로 등록
        window.debugInputArea = debugInputArea;
        window.hideNewMemoInputArea = hideNewMemoInputArea;
        window.showNewMemoInputArea = showNewMemoInputArea;

        console.log('✅ 메모 입력 영역 숨김 처리 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugInputArea(), hideNewMemoInputArea(), showNewMemoInputArea()');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 500);
    });

})();