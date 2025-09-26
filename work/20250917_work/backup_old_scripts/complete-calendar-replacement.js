// 완전한 달력 교체 시스템 - 모든 기존 달력을 대체

(function() {
    'use strict';
    
    console.log('🚀 완전한 달력 교체 시스템 시작');
    
    let isReplaced = false;
    
    function replaceCalendar() {
        if (isReplaced) return;
        isReplaced = true;
        
        console.log('📅 기존 달력 제거 및 새로운 달력 생성 중...');
        
        // 1. 기존 달력 완전 제거
        removeExistingCalendar();
        
        // 2. 새로운 달력 생성
        createNewCalendar();
        
        // 3. 스타일 적용
        applyCalendarStyles();
        
        // 4. 이벤트 바인딩
        bindCalendarEvents();
        
        console.log('✅ 새로운 달력 생성 완료');
    }
    
    function removeExistingCalendar() {
        // 기존 달력 관련 요소들 모두 제거
        const existingElements = document.querySelectorAll('.container, .calendar, .days, .weekdays');
        existingElements.forEach(el => el.remove());
        
        // body 내용 정리
        const body = document.body;
        const childrenToRemove = [];
        for (let child of body.children) {
            if (child.classList.contains('container') || 
                child.classList.contains('calendar') ||
                child.classList.contains('wide-view-indicator') ||
                child.id === 'daysContainer') {
                childrenToRemove.push(child);
            }
        }
        childrenToRemove.forEach(child => child.remove());
    }
    
    function createNewCalendar() {
        // 메인 컨테이너 생성
        const container = document.createElement('div');
        container.className = 'new-calendar-container';
        container.innerHTML = `
            <div class="new-calendar-header">
                <button id="newPrevBtn" class="nav-btn">‹</button>
                <h1 id="newMonthYear">2025년 8월</h1>
                <button id="newNextBtn" class="nav-btn">›</button>
            </div>
            
            <div class="new-action-bar">
                <button class="action-btn">공지 쓰기</button>
                <button class="action-btn">생성 모드</button>
                <button class="action-btn">스티커</button>
                <button class="action-btn">엑셀</button>
                <button class="action-btn">구글 드라이브</button>
                <select class="mode-select">
                    <option>모든 카테고리</option>
                </select>
            </div>
            
            <div class="new-weekdays">
                <div class="new-weekday sunday">일요일</div>
                <div class="new-weekday">월요일</div>
                <div class="new-weekday">화요일</div>
                <div class="new-weekday">수요일</div>
                <div class="new-weekday">목요일</div>
                <div class="new-weekday">금요일</div>
                <div class="new-weekday saturday">토요일</div>
            </div>
            
            <div class="new-calendar-grid" id="newCalendarGrid">
                <!-- 날짜들이 동적으로 생성됩니다 -->
            </div>
        `;
        
        document.body.appendChild(container);
        
        // 날짜 생성
        generateCalendarDates();
        
        // 테마 토글 버튼 생성
        createThemeToggle();
    }
    
    function generateCalendarDates() {
        const grid = document.getElementById('newCalendarGrid');
        const year = 2025;
        const month = 8; // 8월
        
        // 8월의 첫 날과 마지막 날
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay(); // 0 = 일요일
        
        // 이전 달의 마지막 날들 (회색으로 표시)
        const prevMonth = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonth.getDate();
        
        grid.innerHTML = '';
        
        // 이전 달 날짜들
        for (let i = startDay - 1; i >= 0; i--) {
            const dayDiv = createDayElement(prevMonthDays - i, true, false);
            grid.appendChild(dayDiv);
        }
        
        // 현재 달 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = (day === new Date().getDate() && month === new Date().getMonth() + 1);
            const dayDiv = createDayElement(day, false, isToday);
            grid.appendChild(dayDiv);
        }
        
        // 다음 달 날짜들 (42칸 채우기 - 6주)
        const totalCells = 42;
        const currentCells = startDay + daysInMonth;
        const remainingCells = totalCells - currentCells;
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayDiv = createDayElement(day, true, false);
            grid.appendChild(dayDiv);
        }
    }
    
    function createDayElement(dayNumber, isOtherMonth, isToday) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'new-day';
        
        if (isOtherMonth) {
            dayDiv.classList.add('other-month');
        }
        
        if (isToday) {
            dayDiv.classList.add('today');
        }
        
        // 공휴일 체크 (8월 15일 광복절)
        if (!isOtherMonth && dayNumber === 15) {
            dayDiv.classList.add('holiday');
        }
        
        // 주말 체크
        const totalDays = document.querySelectorAll('.new-day').length;
        const dayIndex = totalDays % 7;
        if (dayIndex === 0) dayDiv.classList.add('sunday');
        if (dayIndex === 6) dayDiv.classList.add('saturday');
        
        dayDiv.innerHTML = `
            <span class="day-number">${dayNumber}</span>
            ${!isOtherMonth && dayNumber === 15 ? '<div class="holiday-label">광복절</div>' : ''}
        `;
        
        return dayDiv;
    }
    
    function createThemeToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'new-theme-toggle';
        toggle.innerHTML = `
            <button id="newThemeBtn" class="theme-btn">
                <span class="theme-icon">🌙</span>
            </button>
        `;
        document.body.appendChild(toggle);
    }
    
    function applyCalendarStyles() {
        const style = document.createElement('style');
        style.id = 'new-calendar-styles';
        style.textContent = `
            /* 새로운 달력 전용 스타일 */
            body {
                margin: 0;
                padding: 20px;
                font-family: 'Segoe UI', 'Malgun Gothic', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            
            .new-calendar-container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .new-calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 20px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 15px;
            }
            
            #newMonthYear {
                font-size: 32px;
                font-weight: 700;
                color: #667eea;
                margin: 0;
            }
            
            .nav-btn {
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: #667eea;
                color: white;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .nav-btn:hover {
                background: #5a67d8;
                transform: scale(1.1);
            }
            
            .new-action-bar {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 10px;
                flex-wrap: wrap;
            }
            
            .action-btn, .mode-select {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                background: #667eea;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .action-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            
            .new-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .new-weekday {
                text-align: center;
                padding: 15px;
                font-weight: 700;
                font-size: 14px;
                background: #667eea;
                color: white;
                border-radius: 8px;
            }
            
            .new-weekday.sunday {
                background: #e53e3e;
            }
            
            .new-weekday.saturday {
                background: #3182ce;
            }
            
            .new-calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
            }
            
            .new-day {
                min-height: 100px;
                padding: 15px;
                background: white;
                border: 2px solid transparent;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .new-day:hover {
                background: rgba(102, 126, 234, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .new-day.other-month {
                opacity: 0.3;
                background: #f7fafc;
            }
            
            .new-day.today {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-color: #ffd700;
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
                animation: pulse 2s infinite;
            }
            
            .new-day.holiday {
                border-color: #e53e3e;
            }
            
            .new-day.holiday .day-number {
                color: #e53e3e !important;
                font-weight: 800;
            }
            
            .new-day.sunday .day-number {
                color: #e53e3e;
                font-weight: 700;
            }
            
            .new-day.saturday .day-number {
                color: #3182ce;
                font-weight: 700;
            }
            
            .day-number {
                font-size: 28px;
                font-weight: 700;
                color: #2d3748;
                display: block;
                margin-bottom: 5px;
            }
            
            .new-day.today .day-number {
                color: white !important;
            }
            
            .holiday-label {
                font-size: 11px;
                color: #e53e3e;
                font-weight: 600;
                background: rgba(229, 62, 62, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                margin-top: 5px;
                text-align: center;
            }
            
            .new-theme-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 1000;
            }
            
            .theme-btn {
                width: 60px;
                height: 60px;
                border: none;
                border-radius: 50%;
                background: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 24px;
            }
            
            .theme-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            @keyframes pulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
                }
                50% { 
                    box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
                }
            }
            
            /* 다크 모드 */
            [data-theme="dark"] body {
                background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            }
            
            [data-theme="dark"] .new-calendar-container {
                background: rgba(45, 55, 72, 0.95);
                color: white;
            }
            
            [data-theme="dark"] .new-day {
                background: #4a5568;
                color: white;
            }
            
            [data-theme="dark"] .new-day:hover {
                background: rgba(102, 126, 234, 0.3);
            }
            
            [data-theme="dark"] .day-number {
                color: white;
            }
            
            /* 반응형 */
            @media (max-width: 768px) {
                .new-calendar-container {
                    margin: 10px;
                    padding: 20px;
                }
                
                .new-day {
                    min-height: 80px;
                    padding: 10px;
                }
                
                .day-number {
                    font-size: 22px;
                }
                
                #newMonthYear {
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function bindCalendarEvents() {
        // 테마 토글
        const themeBtn = document.getElementById('newThemeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                
                this.innerHTML = newTheme === 'dark' ? '<span class="theme-icon">☀️</span>' : '<span class="theme-icon">🌙</span>';
                localStorage.setItem('theme', newTheme);
            });
        }
        
        // 월 네비게이션 (기본 동작만)
        const prevBtn = document.getElementById('newPrevBtn');
        const nextBtn = document.getElementById('newNextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                console.log('이전 월로 이동');
                // 여기에 월 변경 로직 추가 가능
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                console.log('다음 월로 이동');
                // 여기에 월 변경 로직 추가 가능
            });
        }
        
        // 날짜 클릭 이벤트
        document.addEventListener('click', function(e) {
            if (e.target.closest('.new-day')) {
                const day = e.target.closest('.new-day');
                const dayNumber = day.querySelector('.day-number').textContent;
                console.log(`${dayNumber}일 클릭됨`);
                // 여기에 메모/일정 기능 추가 가능
            }
        });
    }
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceCalendar);
    } else {
        replaceCalendar();
    }
    
    // 추가 실행 (안전장치)
    setTimeout(replaceCalendar, 100);
    setTimeout(replaceCalendar, 500);
    setTimeout(replaceCalendar, 1000);
    
})();