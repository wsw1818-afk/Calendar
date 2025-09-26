/**
 * 달력 날짜 클릭 기능 완전 수정
 * 달력이 새로 생성될 때마다 자동으로 이벤트 리스너가 추가되도록 함
 */

(function() {
    'use strict';

    console.log('🔧 달력 날짜 클릭 기능 완전 수정 시작...');

    // 날짜 클릭 이벤트 핸들러 함수
    function addDateClickHandlers() {
        const dayElements = document.querySelectorAll('.day');
        console.log('📅 날짜 요소에 이벤트 리스너 추가:', dayElements.length);

        dayElements.forEach(day => {
            // 이미 이벤트가 추가되어 있는지 확인
            if (day.dataset.clickHandlerAdded) return;

            day.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const dayText = this.textContent.trim();
                console.log('📅 날짜 클릭됨:', dayText);

                // 빈 날짜나 잘못된 날짜 필터링
                if (!dayText || isNaN(dayText) || dayText === '') return;

                // 날짜 선택 표시
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');

                // 현재 년월 가져오기
                const yearSelect = document.getElementById('yearSelect');
                const monthSelect = document.getElementById('monthSelect');
                const currentYear = yearSelect ? yearSelect.value : '2025';
                const currentMonth = monthSelect ? monthSelect.value.replace('월', '').padStart(2, '0') : '09';
                const selectedDate = `${currentYear}-${currentMonth}-${dayText.padStart(2, '0')}`;

                console.log('📅 선택된 날짜:', selectedDate);

                // 메모 모달 열기
                openDateMemoModal(selectedDate);
            });

            // 이벤트 추가 완료 표시
            day.dataset.clickHandlerAdded = 'true';
        });
    }

    // 메모 모달 열기 함수
    function openDateMemoModal(selectedDate) {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) {
            console.error('❌ dateMemoModal을 찾을 수 없습니다');
            return;
        }

        // 현재 날짜 설정
        window.currentDate = selectedDate;

        // 모달 표시
        dateMemoModal.style.display = 'block';
        dateMemoModal.style.visibility = 'visible';
        dateMemoModal.classList.add('show');

        // 해당 날짜의 메모 로드
        const dateMemoText = document.getElementById('dateMemoText');
        const dateMemoTitle = document.getElementById('dateMemoTitle');

        // localStorage에서 해당 날짜의 메모 찾기
        try {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const dateMemos = memos.filter(memo => memo.date === selectedDate);

            if (dateMemos.length > 0) {
                // 첫 번째 메모를 표시
                const firstMemo = dateMemos[0];
                if (dateMemoTitle) dateMemoTitle.value = firstMemo.title || '';
                if (dateMemoText) dateMemoText.value = firstMemo.content || '';
            } else {
                // 새 메모를 위해 빈 값으로 설정
                if (dateMemoTitle) dateMemoTitle.value = '';
                if (dateMemoText) dateMemoText.value = '';
            }
        } catch (e) {
            console.warn('메모 로드 중 오류:', e);
            if (dateMemoTitle) dateMemoTitle.value = '';
            if (dateMemoText) dateMemoText.value = '';
        }

        console.log('📋 날짜 메모 모달 열림:', selectedDate);
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
            console.log('📅 달력 변경 감지 - 이벤트 리스너 재추가');
            setTimeout(addDateClickHandlers, 100);
        }
    });

    // DOM 관찰 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 초기 이벤트 리스너 추가
    setTimeout(addDateClickHandlers, 100);

    // 주기적으로 이벤트 리스너 확인 및 추가
    setInterval(() => {
        const dayElements = document.querySelectorAll('.day:not([data-click-handler-added])');
        if (dayElements.length > 0) {
            console.log('📅 이벤트 누락된 날짜 요소 발견:', dayElements.length);
            addDateClickHandlers();
        }
    }, 2000);

    console.log('✅ 달력 날짜 클릭 기능 완전 수정 완료!');

})();