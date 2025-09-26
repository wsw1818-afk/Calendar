/**
 * 빈 달력 문제 해결 - 날짜가 표시되지 않는 문제 수정
 */

(function() {
    'use strict';

    console.log('📅 달력 표시 문제 해결 시작');

    function fixCalendarDisplay() {
        console.log('🔧 달력 표시 수정 시작');

        // 현재 날짜 확인
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        console.log(`📅 현재: ${currentYear}년 ${currentMonth + 1}월`);

        // 년도/월 선택기 확인 및 수정
        const yearSelect = document.querySelector('select');
        const monthSelect = document.querySelectorAll('select')[1];

        if (yearSelect && monthSelect) {
            yearSelect.value = currentYear + '년';
            monthSelect.selectedIndex = currentMonth;
            console.log('✅ 년도/월 선택기 설정 완료');
        }

        // 달력 그리드 찾기
        const daysGrid = document.querySelector('.days-grid');
        if (!daysGrid) {
            console.error('❌ 달력 그리드를 찾을 수 없습니다');
            return;
        }

        console.log('✅ 달력 그리드 발견:', daysGrid);

        // 달력 강제 생성
        createCalendarForced(currentYear, currentMonth);
    }

    function createCalendarForced(year, month) {
        console.log(`🔧 강제 달력 생성: ${year}년 ${month + 1}월`);

        const daysGrid = document.querySelector('.days-grid');
        if (!daysGrid) {
            console.error('❌ 달력 그리드가 없습니다');
            return;
        }

        // 기존 내용 완전 정리
        daysGrid.innerHTML = '';

        // 해당 월의 첫째 날과 마지막 날 계산
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        console.log(`📊 월 정보: 시작요일=${startingDayOfWeek}, 총일수=${daysInMonth}`);

        // 이전 월 마지막 날들로 빈 공간 채우기
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

        // 이전 월 날짜들
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day other-month';
            dayDiv.textContent = prevLastDay - i;
            dayDiv.style.cssText = `
                padding: 8px;
                text-align: center;
                border: 1px solid #ddd;
                background: #f5f5f5;
                color: #999;
                cursor: pointer;
            `;
            daysGrid.appendChild(dayDiv);
        }

        // 현재 월 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            dayDiv.textContent = day;
            dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // 오늘 날짜 표시
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayDiv.classList.add('today');
                dayDiv.style.backgroundColor = '#007bff';
                dayDiv.style.color = 'white';
            }

            dayDiv.style.cssText = `
                padding: 8px;
                text-align: center;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                min-height: 40px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            `;

            // 클릭 이벤트 추가
            dayDiv.addEventListener('click', function() {
                console.log(`📅 날짜 클릭됨: ${this.dataset.date}`);
                // 기존 openDateMemoModal 함수가 있으면 호출
                if (typeof openDateMemoModal === 'function') {
                    openDateMemoModal(this.dataset.date);
                } else {
                    alert(`${this.dataset.date} 클릭됨!`);
                }
            });

            daysGrid.appendChild(dayDiv);
        }

        // 다음 월 날짜들로 남은 공간 채우기
        const totalCells = daysGrid.children.length;
        const remainingCells = 42 - totalCells; // 6주 * 7일

        for (let day = 1; day <= remainingCells; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day other-month';
            dayDiv.textContent = day;
            dayDiv.style.cssText = `
                padding: 8px;
                text-align: center;
                border: 1px solid #ddd;
                background: #f5f5f5;
                color: #999;
                cursor: pointer;
            `;
            daysGrid.appendChild(dayDiv);
        }

        console.log(`✅ 달력 생성 완료: ${daysGrid.children.length}개 셀`);
    }

    // 년도/월 변경 이벤트 추가
    function setupDateSelectors() {
        const yearSelect = document.querySelector('select');
        const monthSelect = document.querySelectorAll('select')[1];

        if (yearSelect && monthSelect) {
            yearSelect.addEventListener('change', function() {
                const year = parseInt(this.value);
                const month = monthSelect.selectedIndex;
                createCalendarForced(year, month);
                console.log(`📅 년도 변경: ${year}년 ${month + 1}월`);
            });

            monthSelect.addEventListener('change', function() {
                const year = parseInt(yearSelect.value);
                const month = this.selectedIndex;
                createCalendarForced(year, month);
                console.log(`📅 월 변경: ${year}년 ${month + 1}월`);
            });

            console.log('✅ 날짜 선택기 이벤트 등록 완료');
        }
    }

    // 진단 패널도 강제로 표시
    function ensureDiagnosticPanel() {
        // 3초 후에 진단 패널이 없으면 수동으로 생성
        setTimeout(() => {
            if (!document.getElementById('clickDiagnosticPanel')) {
                console.log('🔧 진단 패널이 없어서 수동 생성');

                const panel = document.createElement('div');
                panel.id = 'clickDiagnosticPanel';
                panel.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 300px;
                    height: 200px;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    border: 2px solid #00ff00;
                    border-radius: 8px;
                    z-index: 999999;
                    font-family: monospace;
                    font-size: 12px;
                    padding: 10px;
                `;
                panel.innerHTML = `
                    <strong>🔍 클릭 진단기 (단순 버전)</strong>
                    <button onclick="this.parentElement.remove()" style="float:right; background:red; color:white; border:none;">✕</button>
                    <hr>
                    <div>✅ 달력 표시 수정 완료</div>
                    <div>📅 날짜 클릭 테스트 준비됨</div>
                    <div>⚙️ 설정 버튼 클릭 테스트 준비됨</div>
                `;
                document.body.appendChild(panel);
            }
        }, 3000);
    }

    // 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                fixCalendarDisplay();
                setupDateSelectors();
                ensureDiagnosticPanel();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            fixCalendarDisplay();
            setupDateSelectors();
            ensureDiagnosticPanel();
        }, 1000);
    }

    // 전역 함수로 등록
    window.fixCalendar = fixCalendarDisplay;
    window.createCalendarForced = createCalendarForced;

    console.log('✅ 달력 표시 수정 시스템 로드 완료');
    console.log('🛠️ 수동 실행: fixCalendar() 또는 createCalendarForced(2025, 8)');
})();