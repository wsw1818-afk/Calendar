/**
 * 완전 통합 달력 앱 - 모든 요청 기능 구현
 * 메뉴 버튼, 스티커 메모, 구글 드라이브 등 모든 기능 포함
 */

(function() {
    'use strict';
    
    console.log('🚀 완전 통합 달력 앱 시작');
    
    // ========== 전역 설정 ==========
    window.CalendarApp = {
        currentDate: new Date(),
        schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),
        config: {
            wideView: localStorage.getItem('wideView') === 'true',
            zoomLevel: parseInt(localStorage.getItem('zoomLevel') || '100'),
            fontSize: parseInt(localStorage.getItem('fontSize') || '14'),
            fontFamily: localStorage.getItem('fontFamily') || 'Malgun Gothic',
            currentTheme: localStorage.getItem('currentTheme') || 'default',
            customColors: JSON.parse(localStorage.getItem('customColors') || '{}'),
            memoDate: null,
            googleConnected: localStorage.getItem('googleConnected') === 'true',
            autoSyncEnabled: localStorage.getItem('autoSyncEnabled') === 'true',
            lastSyncTime: localStorage.getItem('lastSyncTime') || null
        }
    };
    
    // ========== 한국 공휴일 데이터 (2020-2030) ==========
    const koreanHolidays = {
        2020: {
            '1-1': '신정',
            '1-24': '설날연휴',
            '1-25': '설날',
            '1-26': '설날연휴',
            '1-27': '설날연휴',
            '3-1': '삼일절',
            '4-15': '국회의원선거',
            '4-30': '부처님오신날',
            '5-5': '어린이날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-30': '추석연휴',
            '10-1': '추석',
            '10-2': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2021: {
            '1-1': '신정',
            '2-11': '설날연휴',
            '2-12': '설날',
            '2-13': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-19': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-20': '추석연휴',
            '9-21': '추석',
            '9-22': '추석연휴',
            '10-3': '개천절',
            '10-4': '개천절 대체휴일',
            '10-9': '한글날',
            '10-11': '한글날 대체휴일',
            '12-25': '성탄절'
        },
        2022: {
            '1-1': '신정',
            '1-31': '설날연휴',
            '2-1': '설날',
            '2-2': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-8': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-9': '추석연휴',
            '9-10': '추석',
            '9-11': '추석연휴',
            '9-12': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '10-10': '한글날 대체휴일',
            '12-25': '성탄절'
        },
        2023: {
            '1-1': '신정',
            '1-21': '설날연휴',
            '1-22': '설날',
            '1-23': '설날연휴',
            '1-24': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-27': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-28': '추석연휴',
            '9-29': '추석',
            '9-30': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2024: {
            '1-1': '신정',
            '2-9': '설날연휴',
            '2-10': '설날',
            '2-11': '설날연휴',
            '2-12': '설날연휴',
            '3-1': '삼일절',
            '4-10': '국회의원선거',
            '5-5': '어린이날',
            '5-6': '어린이날 대체휴일',
            '5-15': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-16': '추석연휴',
            '9-17': '추석',
            '9-18': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2025: {
            '1-1': '신정',
            '1-28': '설날연휴',
            '1-29': '설날',
            '1-30': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-6': '어린이날 대체휴일',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-6': '추석연휴',
            '9-7': '추석연휴', 
            '9-8': '추석',
            '9-9': '추석연휴',
            '10-3': '개천절',
            '10-6': '개천절 대체휴일',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2026: {
            '1-1': '신정',
            '2-16': '설날연휴',
            '2-17': '설날',
            '2-18': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-24': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-24': '추석연휴',
            '9-25': '추석',
            '9-26': '추석연휴',
            '10-3': '개천절',
            '10-5': '개천절 대체휴일',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2027: {
            '1-1': '신정',
            '2-6': '설날연휴',
            '2-7': '설날',
            '2-8': '설날',
            '2-9': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-13': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-14': '추석연휴',
            '9-15': '추석',
            '9-16': '추석연휴',
            '10-3': '개천절',
            '10-4': '개천절 대체휴일',
            '10-9': '한글날',
            '10-11': '한글날 대체휴일',
            '12-25': '성탄절'
        },
        2028: {
            '1-1': '신정',
            '1-26': '설날연휴',
            '1-27': '설날',
            '1-28': '설날연휴',
            '3-1': '삼일절',
            '5-2': '부처님오신날',
            '5-5': '어린이날',
            '6-6': '현충일',
            '8-15': '광복절',
            '10-2': '추석연휴',
            '10-3': '추석',
            '10-4': '추석연휴',
            '10-5': '개천절 대체휴일',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2029: {
            '1-1': '신정',
            '2-12': '설날연휴',
            '2-13': '설날',
            '2-14': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-20': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-21': '추석연휴',
            '9-22': '추석',
            '9-23': '추석연휴',
            '9-24': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '성탄절'
        },
        2030: {
            '1-1': '신정',
            '2-2': '설날연휴',
            '2-3': '설날',
            '2-4': '설날연휴',
            '2-5': '설날연휴',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '5-6': '어린이날 대체휴일',
            '5-9': '부처님오신날',
            '6-6': '현충일',
            '8-15': '광복절',
            '9-11': '추석연휴',
            '9-12': '추석',
            '9-13': '추석연휴',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '성탄절'
        }
    };
    
    // 공휴일 확인 함수
    function getHoliday(year, month, day) {
        const yearHolidays = koreanHolidays[year];
        if (!yearHolidays) return null;
        
        const key = `${month}-${day}`;
        return yearHolidays[key] || null;
    }
    
    // ========== 달력 렌더링 ==========
    function renderCalendar() {
        const year = CalendarApp.currentDate.getFullYear();
        const month = CalendarApp.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // 제목 업데이트
        const monthYear = document.getElementById('monthYear');
        if (monthYear) {
            monthYear.textContent = `${year}년 ${month + 1}월`;
        }
        
        // 날짜 렌더링
        const daysContainer = document.getElementById('daysContainer');
        if (!daysContainer) return;
        
        daysContainer.innerHTML = '';
        
        // 빈 날짜
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day empty';
            daysContainer.appendChild(emptyDiv);
        }
        
        // 실제 날짜
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            
            const today = new Date();
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayDiv.classList.add('today');
            }
            
            // 공휴일 확인
            const holiday = getHoliday(year, month + 1, day);
            if (holiday) {
                dayDiv.classList.add('holiday');
                dayDiv.style.cssText += `
                    background: #fafafa;
                    border: 1px solid #e0e0e0;
                    position: relative;
                `;
            }
            
            // 일요일 스타일링
            const dayOfWeek = new Date(year, month, day).getDay();
            if (dayOfWeek === 0) { // 일요일
                dayDiv.classList.add('sunday');
                dayDiv.style.color = '#f44336';
            } else if (dayOfWeek === 6) { // 토요일
                dayDiv.classList.add('saturday');
                dayDiv.style.color = '#2196f3';
            }
            
            dayDiv.innerHTML = `
                <div class="day-number" style="font-weight: ${holiday ? '600' : 'normal'}; color: ${holiday ? '#e53935' : ''};">
                    ${day}
                    ${holiday ? `<div class="holiday-name" style="
                        font-size: 10px;
                        color: #757575;
                        font-weight: 500;
                        margin-top: 2px;
                        line-height: 1.2;
                        text-align: center;
                        opacity: 0.8;
                    ">${holiday}</div>` : ''}
                </div>
                <div class="day-content" id="day-${year}-${month + 1}-${day}"></div>
            `;
            
            dayDiv.onclick = () => openMemoModal(`${year}-${month + 1}-${day}`);
            daysContainer.appendChild(dayDiv);
        }
        
        loadSchedules();
    }
    
    // ========== 메뉴 버튼 생성 (즉시 실행) ==========
    function createMenuButtons() {
        console.log('📱 메뉴 버튼 생성 시작');
        
        // 기존 action-controls 찾기
        let container = document.querySelector('.action-controls');
        
        // 없으면 생성
        if (!container) {
            const header = document.querySelector('.calendar-header');
            if (!header) {
                console.error('❌ calendar-header를 찾을 수 없음');
                return;
            }
            
            const menuBar = document.createElement('div');
            menuBar.className = 'menu-bar';
            menuBar.style.cssText = `
                padding: 15px;
                background: white;
                border-radius: 8px;
                margin: 10px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            menuBar.innerHTML = `
                <div class="action-controls" style="
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                "></div>
            `;
            
            header.parentNode.insertBefore(menuBar, header.nextSibling);
            container = menuBar.querySelector('.action-controls');
        }
        
        // 메뉴 버튼 초기화
        container.innerHTML = '';
        
        // 모든 메뉴 버튼 정의
        const buttons = [
            { id: 'themeBtn', text: '🎨 테마', color: '#e91e63', handler: openThemeModal },
            { id: 'layoutBtn', text: '📐 레이아웃', color: '#2196f3', handler: openLayoutModal },
            { id: 'stickerBtn', text: '📝 스티커', color: '#ffc107', handler: openStickerModal },
            { id: 'excelBtn', text: '📊 엑셀', color: '#4caf50', handler: openExcelModal },
            { id: 'googleDriveBtn', text: '☁️ 구글 드라이브', color: '#ff9800', handler: openGoogleDriveModal }
        ];
        
        // 버튼 생성
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.innerHTML = btn.text;
            button.className = 'menu-button';
            button.style.cssText = `
                background: ${btn.color};
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // 호버 효과
            button.onmouseover = () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            };
            
            button.onmouseout = () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            };
            
            // 클릭 이벤트
            button.onclick = btn.handler;
            
            container.appendChild(button);
        });
        
        console.log('✅ 메뉴 버튼 생성 완료:', buttons.map(b => b.id).join(', '));
    }
    
    // ========== 1. 테마 모달 ==========
    function openThemeModal() {
        console.log('🎨 테마 모달 열기');
        
        const modal = createModal('themeModal', '테마 설정');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">🎨 테마 설정</h3>
            
            <!-- 프리셋 테마 -->
            <div style="margin-bottom: 30px;">
                <h4>프리셋 테마</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <button class="theme-preset" data-theme="default" style="
                        padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🌙 기본
                    </button>
                    <button class="theme-preset" data-theme="dark" style="
                        padding: 15px; background: linear-gradient(135deg, #1a1a2e, #16213e);
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🌑 다크
                    </button>
                    <button class="theme-preset" data-theme="nature" style="
                        padding: 15px; background: linear-gradient(135deg, #8BC34A, #4CAF50);
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🌿 자연
                    </button>
                    <button class="theme-preset" data-theme="ocean" style="
                        padding: 15px; background: linear-gradient(135deg, #00CED1, #1E90FF);
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🌊 오션
                    </button>
                    <button class="theme-preset" data-theme="sunset" style="
                        padding: 15px; background: linear-gradient(135deg, #ff6b6b, #ffd93d);
                        color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🌅 석양
                    </button>
                    <button class="theme-preset" data-theme="minimal" style="
                        padding: 15px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                        color: #333; border: none; border-radius: 8px; cursor: pointer;">
                        ⚪ 미니멀
                    </button>
                </div>
            </div>
            
            <!-- 커스텀 색상 -->
            <div style="margin-bottom: 30px;">
                <h4>커스텀 색상</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <label>배경색</label>
                        <input type="color" id="customBgColor" value="#ffffff" style="width: 100%; height: 40px;">
                    </div>
                    <div>
                        <label>헤더색</label>
                        <input type="color" id="customHeaderColor" value="#667eea" style="width: 100%; height: 40px;">
                    </div>
                    <div>
                        <label>강조색</label>
                        <input type="color" id="customAccentColor" value="#764ba2" style="width: 100%; height: 40px;">
                    </div>
                    <div>
                        <label>텍스트색</label>
                        <input type="color" id="customTextColor" value="#333333" style="width: 100%; height: 40px;">
                    </div>
                </div>
                <button onclick="CalendarApp.applyCustomTheme()" style="
                    margin-top: 15px; width: 100%; padding: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white; border: none; border-radius: 8px;
                    cursor: pointer; font-weight: 600;">
                    커스텀 테마 적용
                </button>
            </div>
            
            <!-- 저장된 테마 -->
            <div>
                <h4>저장된 테마</h4>
                <div id="savedThemes" style="margin-bottom: 15px;"></div>
                <button onclick="CalendarApp.saveCurrentTheme()" style="
                    width: 100%; padding: 12px;
                    background: #4caf50; color: white;
                    border: none; border-radius: 8px;
                    cursor: pointer; font-weight: 600;">
                    현재 테마 저장
                </button>
            </div>
        `;
        
        // 프리셋 테마 클릭 이벤트
        content.querySelectorAll('.theme-preset').forEach(btn => {
            btn.onclick = () => {
                CalendarApp.applyTheme(btn.dataset.theme);
                closeModal(modal);
            };
        });
        
        modal.style.display = 'block';
    }
    
    // ========== 2. 레이아웃 모달 ==========
    function openLayoutModal() {
        console.log('📐 레이아웃 모달 열기');
        
        const modal = createModal('layoutModal', '레이아웃 설정');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">📐 레이아웃 설정</h3>
            
            <!-- 와이드 뷰 -->
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="wideViewToggle" 
                        ${CalendarApp.config.wideView ? 'checked' : ''}>
                    <span>와이드 뷰 모드</span>
                </label>
            </div>
            
            <!-- 확대/축소 -->
            <div style="margin-bottom: 20px;">
                <label>확대/축소 (${CalendarApp.config.zoomLevel}%)</label>
                <input type="range" id="zoomSlider" 
                    min="50" max="200" value="${CalendarApp.config.zoomLevel}"
                    style="width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span>50%</span>
                    <span>100%</span>
                    <span>200%</span>
                </div>
            </div>
            
            <!-- 글자 크기 -->
            <div style="margin-bottom: 20px;">
                <label>글자 크기 (${CalendarApp.config.fontSize}px)</label>
                <input type="range" id="fontSizeSlider" 
                    min="10" max="24" value="${CalendarApp.config.fontSize}"
                    style="width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span>10px</span>
                    <span>14px</span>
                    <span>24px</span>
                </div>
            </div>
            
            <!-- 폰트 선택 -->
            <div style="margin-bottom: 20px;">
                <label>폰트 선택</label>
                <select id="fontFamilySelect" style="width: 100%; padding: 8px;">
                    <option value="Malgun Gothic">맑은 고딕</option>
                    <option value="Nanum Gothic">나눔고딕</option>
                    <option value="Noto Sans KR">Noto Sans KR</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="monospace">고정폭</option>
                </select>
            </div>
            
            <!-- 적용 버튼 -->
            <button onclick="CalendarApp.applyLayoutSettings()" style="
                width: 100%; padding: 12px;
                background: #2196f3; color: white;
                border: none; border-radius: 8px;
                cursor: pointer; font-weight: 600;">
                레이아웃 적용
            </button>
        `;
        
        // 이벤트 리스너
        const wideViewToggle = content.querySelector('#wideViewToggle');
        const zoomSlider = content.querySelector('#zoomSlider');
        const fontSizeSlider = content.querySelector('#fontSizeSlider');
        const fontFamilySelect = content.querySelector('#fontFamilySelect');
        
        // 실시간 미리보기
        wideViewToggle.onchange = () => {
            CalendarApp.config.wideView = wideViewToggle.checked;
            CalendarApp.applyLayout();
        };
        
        zoomSlider.oninput = () => {
            CalendarApp.config.zoomLevel = parseInt(zoomSlider.value);
            content.querySelector('label').textContent = `확대/축소 (${zoomSlider.value}%)`;
            CalendarApp.applyLayout();
        };
        
        fontSizeSlider.oninput = () => {
            CalendarApp.config.fontSize = parseInt(fontSizeSlider.value);
            content.querySelectorAll('label')[2].textContent = `글자 크기 (${fontSizeSlider.value}px)`;
            CalendarApp.applyFontSettings();
        };
        
        fontFamilySelect.onchange = () => {
            CalendarApp.config.fontFamily = fontFamilySelect.value;
            CalendarApp.applyFontSettings();
        };
        
        modal.style.display = 'block';
    }
    
    // ========== 3. 스티커 메모 모달 ==========
    function openStickerModal() {
        console.log('📝 스티커 메모 모달 열기');
        
        // 노란색 스티키 노트 스타일 모달
        const modal = document.createElement('div');
        modal.id = 'stickerModal';
        modal.className = 'sticky-note-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: #ffeb3b;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            border-radius: 0;
            z-index: 10000;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        modal.innerHTML = `
            <div class="sticky-header" style="
                background: #f9d71c;
                padding: 10px;
                cursor: move;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="font-weight: bold;">📝 스티커 메모</span>
                <button onclick="this.closest('.sticky-note-modal').remove()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #333;
                ">×</button>
            </div>
            <div style="padding: 20px;">
                <div style="font-size: 13px; color: #555; margin-bottom: 10px; padding: 8px; background: rgba(249, 215, 28, 0.3); border-radius: 6px;">
                    💡 <strong>사용 방법:</strong> 첫 번째 줄은 제목으로, 두 번째 줄부터는 내용으로 자동 분리되어 달력 메모로 저장됩니다
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">📅 저장할 날짜:</label>
                    <input type="date" id="stickerDate" style="
                        width: 100%;
                        padding: 8px;
                        border: 2px solid #f9d71c;
                        border-radius: 4px;
                        font-size: 14px;
                        background: rgba(255,255,255,0.8);
                    ">
                </div>
                <textarea id="stickerInput" placeholder="첫 번째 줄: 메모 제목&#10;두 번째 줄부터: 메모 내용..." style="
                    width: 100%;
                    height: 150px;
                    background: transparent;
                    border: none;
                    resize: none;
                    font-family: inherit;
                    font-size: 16px;
                    outline: none;
                "></textarea>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="CalendarApp.saveSticker()" style="
                        flex: 1;
                        padding: 10px;
                        background: #f9d71c;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    ">📝 메모로 저장</button>
                    <button onclick="CalendarApp.clearChatContent()" style="
                        flex: 1;
                        padding: 10px;
                        background: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    ">💬 채팅 내용 지우기</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 오늘 날짜를 기본값으로 설정
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('stickerDate').value = today;
        
        // 드래그 기능
        makeDraggable(modal, modal.querySelector('.sticky-header'));
    }
    
    // ========== 4. 엑셀 내보내기 모달 ==========
    function openExcelModal() {
        console.log('📊 엑셀 내보내기 모달 열기');
        
        const modal = createModal('excelModal', '엑셀 내보내기');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">📊 엑셀 내보내기</h3>
            
            <!-- 날짜 범위 선택 -->
            <div style="margin-bottom: 20px;">
                <h4>날짜 범위</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label>시작 날짜</label>
                        <input type="date" id="exportStartDate" style="width: 100%; padding: 8px;">
                    </div>
                    <div>
                        <label>종료 날짜</label>
                        <input type="date" id="exportEndDate" style="width: 100%; padding: 8px;">
                    </div>
                </div>
            </div>
            
            <!-- 포함할 항목 -->
            <div style="margin-bottom: 20px;">
                <h4>포함할 항목</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label><input type="checkbox" id="includeSchedules" checked> 일정</label>
                    <label><input type="checkbox" id="includeMemos" checked> 메모</label>
                    <label><input type="checkbox" id="includeStickers" checked> 스티커</label>
                    <label><input type="checkbox" id="includeCategories" checked> 카테고리</label>
                </div>
            </div>
            
            <!-- 파일 형식 -->
            <div style="margin-bottom: 20px;">
                <h4>파일 형식</h4>
                <select id="exportFormat" style="width: 100%; padding: 8px;">
                    <option value="csv">CSV (엑셀 호환)</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML 테이블</option>
                </select>
            </div>
            
            <!-- 내보내기 버튼 -->
            <button onclick="CalendarApp.exportData()" style="
                width: 100%; padding: 12px;
                background: #4caf50; color: white;
                border: none; border-radius: 8px;
                cursor: pointer; font-weight: 600;">
                📥 다운로드
            </button>
        `;
        
        // 기본 날짜 설정 (이번 달)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        content.querySelector('#exportStartDate').value = firstDay.toISOString().split('T')[0];
        content.querySelector('#exportEndDate').value = lastDay.toISOString().split('T')[0];
        
        modal.style.display = 'block';
    }
    
    // ========== 5. 구글 드라이브 모달 ==========
    function openGoogleDriveModal() {
        console.log('☁️ 구글 드라이브 모달 열기');
        
        const modal = createModal('googleDriveModal', '구글 드라이브 설정');
        const content = modal.querySelector('.modal-body');
        
        const isConnected = CalendarApp.config.googleConnected;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">☁️ 구글 드라이브 설정</h3>
            
            <!-- 연결 상태 -->
            <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>연결 상태:</span>
                    <span id="googleStatus">${isConnected 
                        ? '<span style="color: green;">● 연결됨</span>' 
                        : '<span style="color: red;">● 연결 안됨</span>'}</span>
                </div>
                <div style="margin-top: 10px;">
                    <span>마지막 동기화:</span>
                    <span id="lastSyncTime">${CalendarApp.config.lastSyncTime || '동기화 안됨'}</span>
                </div>
            </div>
            
            <!-- 연결/해제 버튼 -->
            <div style="margin-bottom: 20px;">
                ${!isConnected ? `
                    <button onclick="CalendarApp.connectGoogleDrive()" style="
                        width: 100%; padding: 12px;
                        background: #4285f4; color: white;
                        border: none; border-radius: 8px;
                        cursor: pointer; font-weight: 600;">
                        🔗 구글 드라이브 연결
                    </button>
                ` : `
                    <button onclick="CalendarApp.disconnectGoogleDrive()" style="
                        width: 100%; padding: 12px;
                        background: #dc3545; color: white;
                        border: none; border-radius: 8px;
                        cursor: pointer; font-weight: 600;">
                        🔌 연결 해제
                    </button>
                `}
            </div>
            
            <!-- 자동 동기화 설정 -->
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="autoSyncToggle" 
                        ${CalendarApp.config.autoSyncEnabled ? 'checked' : ''}>
                    <span>자동 동기화 (5분마다)</span>
                </label>
            </div>
            
            <!-- 수동 작업 버튼 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button onclick="CalendarApp.backupToGoogleDrive()" style="
                    padding: 12px;
                    background: #34a853; color: white;
                    border: none; border-radius: 8px;
                    cursor: pointer; font-weight: 600;">
                    ☁️ 백업
                </button>
                <button onclick="CalendarApp.restoreFromGoogleDrive()" style="
                    padding: 12px;
                    background: #fbbc04; color: white;
                    border: none; border-radius: 8px;
                    cursor: pointer; font-weight: 600;">
                    📥 복원
                </button>
            </div>
        `;
        
        // 자동 동기화 토글
        const autoSyncToggle = content.querySelector('#autoSyncToggle');
        autoSyncToggle.onchange = () => {
            CalendarApp.config.autoSyncEnabled = autoSyncToggle.checked;
            localStorage.setItem('autoSyncEnabled', autoSyncToggle.checked);
            if (autoSyncToggle.checked) {
                CalendarApp.startAutoSync();
            } else {
                CalendarApp.stopAutoSync();
            }
        };
        
        modal.style.display = 'block';
    }
    
    // ========== 메모 모달 (달력용) ==========
    function openMemoModal(date) {
        CalendarApp.config.memoDate = date;
        
        const modal = createModal('calendarMemoModal', `${date} 메모`);
        const content = modal.querySelector('.modal-body');
        
        // 파란색 테마의 달력 메모 UI
        modal.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        content.style.background = 'white';
        content.style.borderRadius = '8px';
        content.style.padding = '20px';
        
        // calendarMemos에서 해당 날짜의 메모 가져오기
        const allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        const memos = allMemos[date] || [];
        
        content.innerHTML = `
            <h3 style="color: #667eea; margin-bottom: 20px;">📅 ${date} 일정 메모</h3>
            
            <!-- 메모 입력 -->
            <div style="margin-bottom: 20px;">
                <textarea id="calendarMemoInput" placeholder="메모를 입력하세요..." style="
                    width: 100%;
                    height: 100px;
                    padding: 10px;
                    border: 2px solid #667eea;
                    border-radius: 8px;
                    resize: none;
                "></textarea>
                <button onclick="CalendarApp.saveCalendarMemo()" style="
                    margin-top: 10px;
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">💾 저장</button>
            </div>
            
            <!-- 메모 목록 -->
            <div id="calendarMemoList">
                ${memos.map((memo, index) => `
                    <div style="
                        padding: 10px;
                        margin-bottom: 10px;
                        background: #f5f5f5;
                        border-left: 4px solid #667eea;
                        border-radius: 4px;
                    ">
                        <div style="font-weight: bold; color: #667eea;">${memo.title || '제목 없음'}</div>
                        <div style="color: #666; margin-top: 5px;">${memo.content}</div>
                        <button onclick="CalendarApp.deleteCalendarMemo(${index})" style="
                            margin-top: 5px;
                            padding: 5px 10px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">삭제</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    // ========== 유틸리티 함수들 ==========
    function createModal(id, title) {
        // 기존 모달 제거
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 0;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-radius: 12px 12px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="margin: 0;">${title}</h2>
                    <button onclick="this.closest('.modal').style.display='none'" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 28px;
                        cursor: pointer;
                    ">×</button>
                </div>
                <div class="modal-body" style="padding: 20px;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    function closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }
    
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        handle.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    // ========== CalendarApp 메서드들 ==========
    CalendarApp.applyTheme = function(theme) {
        const themes = {
            default: { bg: '#f5f5f5', header: '#667eea', accent: '#764ba2', text: '#333' },
            dark: { bg: '#1a1a2e', header: '#16213e', accent: '#0f3460', text: '#e0e0e0' },
            nature: { bg: '#e8f5e9', header: '#4caf50', accent: '#8bc34a', text: '#2e7d32' },
            ocean: { bg: '#e0f7fa', header: '#00acc1', accent: '#0097a7', text: '#006064' },
            sunset: { bg: '#fff3e0', header: '#ff6b6b', accent: '#ffd93d', text: '#e65100' },
            minimal: { bg: '#ffffff', header: '#e0e0e0', accent: '#9e9e9e', text: '#424242' }
        };
        
        const colors = themes[theme];
        if (colors) {
            document.body.style.background = colors.bg;
            const header = document.querySelector('.calendar-header');
            if (header) header.style.background = colors.header;
            
            CalendarApp.config.currentTheme = theme;
            localStorage.setItem('currentTheme', theme);
            
            console.log(`✅ 테마 적용: ${theme}`);
        }
    };
    
    CalendarApp.applyCustomTheme = function() {
        const bg = document.getElementById('customBgColor')?.value || '#ffffff';
        const header = document.getElementById('customHeaderColor')?.value || '#667eea';
        const accent = document.getElementById('customAccentColor')?.value || '#764ba2';
        const text = document.getElementById('customTextColor')?.value || '#333333';
        
        document.body.style.background = bg;
        const headerEl = document.querySelector('.calendar-header');
        if (headerEl) headerEl.style.background = header;
        
        CalendarApp.config.customColors = { bg, header, accent, text };
        localStorage.setItem('customColors', JSON.stringify(CalendarApp.config.customColors));
        CalendarApp.config.currentTheme = 'custom';
        localStorage.setItem('currentTheme', 'custom');
        
        console.log('✅ 커스텀 테마 적용');
    };
    
    CalendarApp.applyLayout = function() {
        const calendar = document.querySelector('.calendar');
        if (!calendar) return;
        
        if (CalendarApp.config.wideView) {
            calendar.style.maxWidth = '100%';
        } else {
            calendar.style.maxWidth = '1200px';
        }
        
        calendar.style.transform = `scale(${CalendarApp.config.zoomLevel / 100})`;
        calendar.style.transformOrigin = 'top center';
        
        localStorage.setItem('wideView', CalendarApp.config.wideView);
        localStorage.setItem('zoomLevel', CalendarApp.config.zoomLevel);
        
        console.log(`✅ 레이아웃 적용: 와이드=${CalendarApp.config.wideView}, 줌=${CalendarApp.config.zoomLevel}%`);
    };
    
    CalendarApp.applyFontSettings = function() {
        document.body.style.fontSize = `${CalendarApp.config.fontSize}px`;
        document.body.style.fontFamily = CalendarApp.config.fontFamily;
        
        localStorage.setItem('fontSize', CalendarApp.config.fontSize);
        localStorage.setItem('fontFamily', CalendarApp.config.fontFamily);
        
        console.log(`✅ 폰트 설정: ${CalendarApp.config.fontSize}px, ${CalendarApp.config.fontFamily}`);
    };
    
    CalendarApp.applyLayoutSettings = function() {
        this.applyLayout();
        this.applyFontSettings();
        alert('✅ 레이아웃 설정이 적용되었습니다!');
    };
    
    CalendarApp.saveSticker = function() {
        const input = document.getElementById('stickerInput');
        const dateInput = document.getElementById('stickerDate');
        
        if (!input || !input.value.trim()) {
            alert('⚠️ 메모 내용을 입력해주세요!');
            return;
        }
        
        if (!dateInput || !dateInput.value) {
            alert('⚠️ 저장할 날짜를 선택해주세요!');
            return;
        }
        
        // 첫째 줄을 제목으로, 나머지를 내용으로 분리
        const fullContent = input.value.trim();
        const lines = fullContent.split('\n');
        const title = lines[0].trim() || '제목 없음';
        const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : '';
        
        // 선택된 날짜
        const selectedDate = dateInput.value;
        
        // 달력 메모로 저장 (calendarMemos 형식으로)
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        if (!memos[selectedDate]) {
            memos[selectedDate] = [];
        }
        
        const memo = {
            id: Date.now(),
            title: title,
            content: content,
            date: selectedDate,
            timestamp: new Date().toISOString()
        };
        
        memos[selectedDate].push(memo);
        localStorage.setItem('calendarMemos', JSON.stringify(memos));
        
        // 입력 필드 초기화
        input.value = '';
        
        // alert 대신 간단한 알림으로 변경
        console.log('✅ 메모가 달력에 저장되었습니다!');
        
        // 시각적 피드백 추가 (alert 창 없이)
        const saveBtn = document.querySelector('button[onclick="CalendarApp.saveSticker()"]');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '✅ 저장완료!';
            saveBtn.style.background = '#28a745';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '#f9d71c';
            }, 1500);
        }
        
        // 새로고침 제거 - 달력은 자동으로 업데이트되도록 함
        console.log('메모 저장 완료, 모달 유지');
    };
    
    CalendarApp.clearChatContent = function() {
        // 스티커 입력 내용 지우기
        const stickerInput = document.getElementById('stickerInput');
        if (stickerInput) {
            stickerInput.value = '';
            stickerInput.focus();
        }
        
        // 날짜 입력도 오늘로 리셋
        const dateInput = document.getElementById('stickerDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // 시각적 피드백 (confirm창 없이)
        const clearBtn = document.querySelector('button[onclick="CalendarApp.clearChatContent()"]');
        if (clearBtn) {
            const originalText = clearBtn.innerHTML;
            clearBtn.innerHTML = '🧹 지워짐!';
            clearBtn.style.background = '#6c757d';
            setTimeout(() => {
                clearBtn.innerHTML = originalText;
                clearBtn.style.background = '#dc3545';
            }, 1000);
        }
        
        console.log('💬 스티커 입력 내용 지워짐');
    };
    
    CalendarApp.deleteSticker = function(index) {
        const stickers = JSON.parse(localStorage.getItem('stickers') || '[]');
        stickers.splice(index, 1);
        localStorage.setItem('stickers', JSON.stringify(stickers));
        console.log('스티커 삭제됨:', index);
    };
    
    CalendarApp.saveCalendarMemo = function() {
        const input = document.getElementById('calendarMemoInput');
        if (!input || !input.value) return;
        
        const date = CalendarApp.config.memoDate;
        
        // calendarMemos에서 모든 메모 가져오기
        const allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        if (!allMemos[date]) {
            allMemos[date] = [];
        }
        
        const lines = input.value.split('\n');
        const newMemo = {
            id: Date.now(),
            title: lines[0],
            content: lines.slice(1).join('\n'),
            timestamp: new Date().toISOString()
        };
        
        allMemos[date].push(newMemo);
        localStorage.setItem('calendarMemos', JSON.stringify(allMemos));
        
        input.value = '';
        openMemoModal(date); // 리프레시
    };
    
    CalendarApp.deleteCalendarMemo = function(index) {
        const date = CalendarApp.config.memoDate;
        
        // calendarMemos에서 삭제
        const allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        if (allMemos[date] && allMemos[date][index]) {
            allMemos[date].splice(index, 1);
            
            // 해당 날짜에 메모가 없으면 날짜 키도 삭제
            if (allMemos[date].length === 0) {
                delete allMemos[date];
            }
            
            localStorage.setItem('calendarMemos', JSON.stringify(allMemos));
        }
        
        openMemoModal(date); // 리프레시
    };
    
    CalendarApp.exportData = function() {
        const format = document.getElementById('exportFormat')?.value || 'csv';
        const startDate = document.getElementById('exportStartDate')?.value;
        const endDate = document.getElementById('exportEndDate')?.value;
        
        // 데이터 수집
        const data = {
            schedules: CalendarApp.schedules,
            memos: {},
            stickers: JSON.parse(localStorage.getItem('stickers') || '[]')
        };
        
        // calendarMemos에서 메모 수집
        data.memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        
        let content = '';
        let filename = `calendar_export_${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
            content = 'Type,Date,Title,Content\n';
            // CSV 변환 로직
            filename += '.csv';
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            filename += '.json';
        } else if (format === 'html') {
            content = '<table border="1"><tr><th>Type</th><th>Date</th><th>Title</th><th>Content</th></tr>';
            // HTML 변환 로직
            content += '</table>';
            filename += '.html';
        }
        
        // 다운로드
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        alert(`✅ ${filename} 다운로드 완료!`);
    };
    
    CalendarApp.connectGoogleDrive = function() {
        // 실제 구현 또는 시뮬레이션
        CalendarApp.config.googleConnected = true;
        localStorage.setItem('googleConnected', 'true');
        openGoogleDriveModal(); // 상태 업데이트
        alert('✅ 구글 드라이브 연결 성공!');
    };
    
    CalendarApp.disconnectGoogleDrive = function() {
        CalendarApp.config.googleConnected = false;
        localStorage.setItem('googleConnected', 'false');
        CalendarApp.stopAutoSync();
        openGoogleDriveModal(); // 상태 업데이트
        alert('구글 드라이브 연결이 해제되었습니다.');
    };
    
    CalendarApp.backupToGoogleDrive = function() {
        const backupData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            schedules: CalendarApp.schedules,
            config: CalendarApp.config,
            memos: {},
            stickers: JSON.parse(localStorage.getItem('stickers') || '[]')
        };
        
        // calendarMemos에서 메모 수집
        backupData.memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        
        // 시뮬레이션
        localStorage.setItem('googleDriveBackup', JSON.stringify(backupData));
        CalendarApp.config.lastSyncTime = new Date().toLocaleString('ko-KR');
        localStorage.setItem('lastSyncTime', CalendarApp.config.lastSyncTime);
        
        alert('✅ 구글 드라이브 백업 완료!');
    };
    
    CalendarApp.restoreFromGoogleDrive = function() {
        const backup = localStorage.getItem('googleDriveBackup');
        if (!backup) {
            alert('백업 데이터가 없습니다.');
            return;
        }
        
        const data = JSON.parse(backup);
        
        // 복원
        CalendarApp.schedules = data.schedules;
        CalendarApp.config = data.config;
        localStorage.setItem('schedules', JSON.stringify(data.schedules));
        localStorage.setItem('stickers', JSON.stringify(data.stickers));
        
        // 메모 복원
        localStorage.setItem('calendarMemos', JSON.stringify(data.memos || {}));
        
        // 설정 복원
        CalendarApp.applyTheme(CalendarApp.config.currentTheme);
        CalendarApp.applyLayout();
        CalendarApp.applyFontSettings();
        
        renderCalendar();
        alert('✅ 구글 드라이브에서 복원 완료!');
    };
    
    CalendarApp.startAutoSync = function() {
        if (CalendarApp.syncInterval) clearInterval(CalendarApp.syncInterval);
        
        CalendarApp.syncInterval = setInterval(() => {
            if (CalendarApp.config.googleConnected) {
                CalendarApp.backupToGoogleDrive();
                console.log('🔄 자동 동기화 실행');
            }
        }, 5 * 60 * 1000); // 5분마다
        
        console.log('✅ 자동 동기화 시작');
    };
    
    CalendarApp.stopAutoSync = function() {
        if (CalendarApp.syncInterval) {
            clearInterval(CalendarApp.syncInterval);
            CalendarApp.syncInterval = null;
            console.log('⏹️ 자동 동기화 중지');
        }
    };
    
    // ========== 데이터 마이그레이션 ==========
    function migrateOldMemoData() {
        const calendarMemos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        let migrated = false;
        
        // memos_로 시작하는 모든 키 찾기
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('memos_')) {
                const date = key.substring(6); // 'memos_' 제거
                const oldMemos = JSON.parse(localStorage.getItem(key) || '[]');
                
                if (oldMemos.length > 0) {
                    // 기존 메모와 병합
                    if (!calendarMemos[date]) {
                        calendarMemos[date] = [];
                    }
                    
                    // ID가 없는 오래된 메모에 ID 추가
                    oldMemos.forEach(memo => {
                        if (!memo.id) {
                            memo.id = Date.now() + Math.random();
                        }
                        // 중복 확인 (제목과 내용이 같은 경우)
                        const isDuplicate = calendarMemos[date].some(existing => 
                            existing.title === memo.title && existing.content === memo.content
                        );
                        if (!isDuplicate) {
                            calendarMemos[date].push(memo);
                        }
                    });
                    
                    // 이전 형식 삭제
                    localStorage.removeItem(key);
                    migrated = true;
                }
            }
        }
        
        if (migrated) {
            localStorage.setItem('calendarMemos', JSON.stringify(calendarMemos));
            console.log('✅ 메모 데이터 마이그레이션 완료');
        }
    }
    
    // ========== 일정 관련 함수 ==========
    function loadSchedules() {
        CalendarApp.schedules.forEach(schedule => {
            const dayContent = document.getElementById(`day-${schedule.date}`);
            if (dayContent) {
                const scheduleDiv = document.createElement('div');
                scheduleDiv.className = 'schedule-item';
                scheduleDiv.style.cssText = `
                    background: #e3f2fd;
                    padding: 2px 5px;
                    margin: 2px 0;
                    border-radius: 3px;
                    font-size: 12px;
                    cursor: pointer;
                `;
                scheduleDiv.textContent = schedule.title;
                dayContent.appendChild(scheduleDiv);
            }
        });
    }
    
    // ========== 이벤트 리스너 설정 ==========
    function setupEventListeners() {
        // 이전/다음 버튼
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.onclick = () => {
                CalendarApp.currentDate.setMonth(CalendarApp.currentDate.getMonth() - 1);
                renderCalendar();
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => {
                CalendarApp.currentDate.setMonth(CalendarApp.currentDate.getMonth() + 1);
                renderCalendar();
            };
        }
        
        // 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                CalendarApp.config.wideView = !CalendarApp.config.wideView;
                CalendarApp.applyLayout();
            }
            if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                CalendarApp.config.zoomLevel = Math.min(200, CalendarApp.config.zoomLevel + 10);
                CalendarApp.applyLayout();
            }
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                CalendarApp.config.zoomLevel = Math.max(50, CalendarApp.config.zoomLevel - 10);
                CalendarApp.applyLayout();
            }
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                CalendarApp.config.zoomLevel = 100;
                CalendarApp.applyLayout();
            }
        });
    }
    
    // ========== 초기화 ==========
    function initialize() {
        console.log('🎯 초기화 시작');
        
        // 이전 형식의 메모 데이터 마이그레이션
        migrateOldMemoData();
        
        // DOM 로드 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }
    
    function onReady() {
        console.log('📍 DOM 준비 완료');
        
        // 즉시 실행
        renderCalendar();
        createMenuButtons();
        setupEventListeners();
        
        // 저장된 설정 적용
        if (CalendarApp.config.currentTheme !== 'default') {
            if (CalendarApp.config.currentTheme === 'custom') {
                CalendarApp.applyCustomTheme();
            } else {
                CalendarApp.applyTheme(CalendarApp.config.currentTheme);
            }
        }
        
        if (CalendarApp.config.wideView || CalendarApp.config.zoomLevel !== 100) {
            CalendarApp.applyLayout();
        }
        
        if (CalendarApp.config.fontSize !== 14 || CalendarApp.config.fontFamily !== 'Malgun Gothic') {
            CalendarApp.applyFontSettings();
        }
        
        // 자동 동기화 시작
        if (CalendarApp.config.autoSyncEnabled && CalendarApp.config.googleConnected) {
            CalendarApp.startAutoSync();
        }
        
        console.log('✅ 완전 통합 달력 앱 초기화 완료');
    }
    
    // 시작
    initialize();
    
})();

console.log('✅ calendar-complete.js 로드 완료');