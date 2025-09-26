/**
 * 영구적 달력 날짜 클릭 수정 스크립트
 *
 * 문제: 달력 날짜를 클릭해도 메모창이 열리지 않음
 * 원인: 자동 클릭 차단 로직이 정상적인 사용자 클릭도 차단
 * 해결: 차단 로직 제거 및 강제 이벤트 핸들러 설정
 *
 * 이 스크립트를 HTML에 추가하여 문제를 영구적으로 해결
 */

(function() {
    'use strict';

    console.log('🚀 영구적 달력 날짜 클릭 수정 시작...');

    // 수정 함수
    function applyCalendarFix() {
        console.log('🔧 달력 수정 적용 중...');

        // 1. 모든 차단 변수 제거
        window._preventAutoOpenDateModal = false;
        window.preventAutoOpenDateModal = false;
        window.blockDateModal = false;
        window.autoOpenPrevented = false;
        delete window._preventAutoOpenDateModal;
        delete window.preventAutoOpenDateModal;
        delete window.blockDateModal;
        delete window.autoOpenPrevented;

        // 2. openDateMemoModal 함수 강제 교체
        window.openDateMemoModal = function(selectedDate) {
            console.log('💪 강제 openDateMemoModal 실행:', selectedDate);

            const dateMemoModal = document.getElementById('dateMemoModal');
            if (!dateMemoModal) {
                console.error('❌ dateMemoModal을 찾을 수 없습니다');
                return false;
            }

            // 현재 날짜 설정
            window.currentDate = selectedDate;

            // 모달 강제 표시
            dateMemoModal.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 10000 !important; position: fixed !important; pointer-events: auto !important;';
            dateMemoModal.className = 'memo-modal show';

            // 메모 로드
            const dateMemoText = document.getElementById('dateMemoText');
            const dateMemoTitle = document.getElementById('dateMemoTitle');

            try {
                const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                const dateMemos = memos.filter(memo => memo.date === selectedDate);

                if (dateMemos.length > 0) {
                    const firstMemo = dateMemos[0];
                    if (dateMemoTitle) dateMemoTitle.value = firstMemo.title || '';
                    if (dateMemoText) dateMemoText.value = firstMemo.content || '';
                } else {
                    if (dateMemoTitle) dateMemoTitle.value = '';
                    if (dateMemoText) dateMemoText.value = '';
                }
            } catch (e) {
                if (dateMemoTitle) dateMemoTitle.value = '';
                if (dateMemoText) dateMemoText.value = '';
            }

            console.log('✅ 메모 모달 강제 열림!');
            return true;
        };

        // 3. 날짜 클릭 이벤트 재설정
        const dayElements = document.querySelectorAll('.day');
        console.log('📅 날짜 요소 개수:', dayElements.length);

        dayElements.forEach((day, index) => {
            // 기존 이벤트 제거를 위해 복제
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);

            // 새 이벤트 추가
            newDay.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const dayText = this.textContent.trim();
                console.log('🎯 날짜 클릭:', dayText);

                if (!dayText || isNaN(dayText) || dayText === '') return;

                // 날짜 선택
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');

                // 날짜 생성
                const yearSelect = document.getElementById('yearSelect');
                const monthSelect = document.getElementById('monthSelect');
                const currentYear = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
                const currentMonth = monthSelect ? monthSelect.value.replace('월', '').padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0');
                const selectedDate = `${currentYear}-${currentMonth}-${dayText.padStart(2, '0')}`;

                // 강제로 메모 모달 열기
                window.openDateMemoModal(selectedDate);
            }, true); // capture 모드 사용
        });

        console.log('✅ 달력 수정 적용 완료!');
    }

    // MutationObserver로 달력 변경 감지
    const observer = new MutationObserver((mutations) => {
        let calendarChanged = false;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('day') ||
                        node.querySelector?.('.day') ||
                        node.id === 'daysGrid'
                    )) {
                        calendarChanged = true;
                    }
                });
            }
        });

        if (calendarChanged) {
            console.log('📅 달력 변경 감지 - 수정 재적용');
            setTimeout(applyCalendarFix, 100);
        }
    });

    // DOM 준비 완료 후 실행
    function initialize() {
        // 초기 수정 적용
        applyCalendarFix();

        // 달력 변경 감지 시작
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 주기적으로 체크 (보험)
        setInterval(() => {
            const dayElements = document.querySelectorAll('.day');
            if (dayElements.length > 0) {
                // openDateMemoModal 함수가 원래대로 돌아갔는지 체크
                if (window.openDateMemoModal && !window.openDateMemoModal.toString().includes('강제')) {
                    console.log('⚠️ 수정이 덮어씌워짐 감지 - 재적용');
                    applyCalendarFix();
                }
            }
        }, 5000);

        console.log('🎉 영구적 달력 날짜 클릭 수정 초기화 완료!');
    }

    // DOM이 준비되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 약간 지연 후 실행
        setTimeout(initialize, 100);
    }

    // 전역 함수로 노출 (수동 실행 가능)
    window.applyCalendarFix = applyCalendarFix;

})();