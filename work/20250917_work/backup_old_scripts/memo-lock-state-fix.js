// 메모 모달 잠금 상태 복원 수정 스크립트
// ESC 키로 메모 상세 닫기 후 새 메모 입력 영역이 계속 보이는 버그 수정

(function() {
    console.log('🔒 메모 잠금 상태 복원 수정 스크립트 로드됨');

    // 잠금 상태를 확인하는 함수
    function isModalLocked(dateMemoModal) {
        const lockButton = dateMemoModal.querySelector('.lock-button, [onclick*="lock"], [class*="lock"]');
        if (!lockButton) return false;

        // 잠금 버튼의 텍스트나 클래스로 상태 확인
        const isLocked = lockButton.textContent.includes('잠금') ||
                        lockButton.classList.contains('locked') ||
                        lockButton.querySelector('.lock-icon');

        console.log('🔍 모달 잠금 상태 확인:', isLocked ? '잠김' : '열림');
        return isLocked;
    }

    // 잠금 상태에 따라 새 메모 입력 영역 숨기기/보이기
    function updateInputAreaByLockState(dateMemoModal) {
        const isLocked = isModalLocked(dateMemoModal);

        // 새 메모 입력 영역들 찾기
        const inputAreas = [
            dateMemoModal.querySelector('.memo-input-area'),
            dateMemoModal.querySelector('.new-memo-section'),
            dateMemoModal.querySelector('.memo-creation-area'),
            dateMemoModal.querySelector('.memo-form')
        ].filter(Boolean);

        // 개별 입력 요소들도 찾기
        const inputElements = dateMemoModal.querySelectorAll('input[type="text"], textarea, [placeholder*="메모"]');
        const saveButton = dateMemoModal.querySelector('button[onclick*="save"], .save-btn, [class*="save"]');
        const attachmentArea = dateMemoModal.querySelector('.attachment-area, [class*="attachment"]');

        if (isLocked) {
            console.log('🔒 잠금 상태 - 새 메모 입력 영역 숨김 처리');

            // 컨테이너 숨기기
            inputAreas.forEach(area => {
                if (area) {
                    area.style.display = 'none';
                    area.style.visibility = 'hidden';
                }
            });

            // 개별 요소들 숨기기
            inputElements.forEach(element => {
                const container = element.closest('div, section, form');
                if (container && container !== dateMemoModal) {
                    container.style.display = 'none';
                    container.style.visibility = 'hidden';
                }
            });

            // 저장 버튼 숨기기
            if (saveButton && saveButton.textContent.includes('저장')) {
                saveButton.style.display = 'none';
                saveButton.style.visibility = 'hidden';
            }

            // 첨부파일 영역 숨기기
            if (attachmentArea) {
                attachmentArea.style.display = 'none';
                attachmentArea.style.visibility = 'hidden';
            }

            console.log('✅ 잠금 상태에서 새 메모 입력 영역 숨김 완료');

        } else {
            console.log('🔓 열림 상태 - 새 메모 입력 영역 표시');

            // 컨테이너 보이기
            inputAreas.forEach(area => {
                if (area) {
                    area.style.display = 'block';
                    area.style.visibility = 'visible';
                }
            });

            // 개별 요소들 보이기
            inputElements.forEach(element => {
                const container = element.closest('div, section, form');
                if (container && container !== dateMemoModal) {
                    container.style.display = 'block';
                    container.style.visibility = 'visible';
                }
            });

            // 저장 버튼 보이기
            if (saveButton) {
                saveButton.style.display = 'block';
                saveButton.style.visibility = 'visible';
            }

            // 첨부파일 영역 보이기
            if (attachmentArea) {
                attachmentArea.style.display = 'block';
                attachmentArea.style.visibility = 'visible';
            }

            console.log('✅ 열림 상태에서 새 메모 입력 영역 표시 완료');
        }

        return isLocked;
    }

    // 원본 closeMemoDetail 함수를 한 번 더 래핑
    if (window.closeMemoDetail) {
        const previousCloseMemoDetail = window.closeMemoDetail;

        window.closeMemoDetail = function() {
            console.log('🔧 잠금 상태 인식 closeMemoDetail 호출');

            // 이전 closeMemoDetail 실행
            const result = previousCloseMemoDetail.apply(this, arguments);

            // 복원 후 잠금 상태에 따라 입력 영역 처리
            setTimeout(() => {
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (dateMemoModal && dateMemoModal.style.display === 'block') {
                    const wasLocked = updateInputAreaByLockState(dateMemoModal);
                    if (wasLocked) {
                        console.log('✅ 잠금 상태 모달 복원 완료 - 입력 영역 숨김');
                    } else {
                        console.log('✅ 열림 상태 모달 복원 완료 - 입력 영역 표시');
                    }
                }
            }, 200); // modal-display-fix.js보다 조금 늦게 실행

            return result;
        };

        console.log('✅ closeMemoDetail 함수 잠금 상태 인식 기능 추가 완료');
    }

    // 잠금 버튼 클릭 이벤트도 강화
    function enhanceLockButton() {
        setTimeout(() => {
            const lockButtons = document.querySelectorAll('#dateMemoModal .lock-button, #dateMemoModal [onclick*="lock"], #dateMemoModal [class*="lock"]');

            lockButtons.forEach(lockButton => {
                if (lockButton && !lockButton.hasAttribute('data-enhanced')) {
                    lockButton.setAttribute('data-enhanced', 'true');

                    lockButton.addEventListener('click', function() {
                        console.log('🔒 잠금 버튼 클릭 감지 - 상태 업데이트 예약');

                        setTimeout(() => {
                            const dateMemoModal = document.getElementById('dateMemoModal');
                            if (dateMemoModal) {
                                updateInputAreaByLockState(dateMemoModal);
                            }
                        }, 100);
                    }, true);

                    console.log('✅ 잠금 버튼 이벤트 강화:', lockButton.textContent);
                }
            });
        }, 1000);
    }

    // 디버깅 함수
    window.debugLockState = function() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) return 'Modal not found';

        const isLocked = isModalLocked(dateMemoModal);
        const inputElements = dateMemoModal.querySelectorAll('input[type="text"], textarea');
        const visibleInputs = Array.from(inputElements).filter(el =>
            window.getComputedStyle(el).display !== 'none' &&
            window.getComputedStyle(el.parentElement).display !== 'none'
        );

        return {
            isLocked: isLocked,
            totalInputs: inputElements.length,
            visibleInputs: visibleInputs.length,
            shouldShowInputs: !isLocked
        };
    };

    // 초기화
    function init() {
        enhanceLockButton();
        console.log('✅ 메모 잠금 상태 복원 수정 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugLockState()');
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