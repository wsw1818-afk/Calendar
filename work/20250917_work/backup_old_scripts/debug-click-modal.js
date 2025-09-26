// 메모 모달 클릭 디버깅
(function() {
    'use strict';

    console.log('🔍 메모 모달 클릭 디버깅 시작');

    // 전역 클릭 위치 추적 강화
    document.addEventListener('click', function(e) {
        window._lastClickPosition = {
            x: e.clientX,
            y: e.clientY
        };
        console.log('📍 클릭 위치 저장:', window._lastClickPosition);
    }, true); // capture phase에서 실행

    // 달력 날짜 클릭 감지
    document.addEventListener('click', function(e) {
        const target = e.target;

        // 달력 날짜 셀인지 확인
        if (target.classList.contains('calendar-day') ||
            target.closest('.calendar-day') ||
            target.dataset.date ||
            target.closest('[data-date]')) {

            console.log('📅 달력 날짜 클릭 감지:', target);
            console.log('📍 클릭 위치:', { x: e.clientX, y: e.clientY });

            // 모달 강제 표시 테스트
            setTimeout(() => {
                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    console.log('🔍 모달 요소 확인:', modal);
                    console.log('🔍 모달 클래스:', modal.classList.toString());
                    console.log('🔍 모달 스타일:', modal.style.display);

                    // 강제 표시
                    modal.classList.add('show-modal');
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';

                    const modalContent = modal.querySelector('.memo-modal-content');
                    if (modalContent) {
                        console.log('🔍 모달 컨텐츠 확인:', modalContent);

                        // 클릭 위치에 배치
                        modalContent.style.left = `${e.clientX}px`;
                        modalContent.style.top = `${e.clientY}px`;
                        modalContent.style.transform = 'none';

                        console.log('✅ 모달 강제 표시 완료');
                    } else {
                        console.error('❌ 모달 컨텐츠 없음');
                    }
                } else {
                    console.error('❌ 모달 요소 없음');
                }
            }, 100);
        }
    });

    // openDateMemoModal 함수 호출 감지
    if (typeof window.openDateMemoModal === 'function') {
        const originalFunction = window.openDateMemoModal;
        window.openDateMemoModal = function() {
            console.log('🚀 openDateMemoModal 호출됨:', arguments);
            const result = originalFunction.apply(this, arguments);
            console.log('✅ openDateMemoModal 실행 완료');
            return result;
        };
        console.log('✅ openDateMemoModal 함수 래핑 완료');
    } else {
        console.error('❌ openDateMemoModal 함수 없음');
    }

    console.log('🔍 메모 모달 클릭 디버깅 초기화 완료');
})();