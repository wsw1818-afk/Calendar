// 한국 공휴일 데이터 및 표시 기능

class KoreanHolidays {
    constructor() {
        this.holidays = this.initHolidays();
        this.isProcessing = false; // 중복 실행 방지 플래그
        this.lastProcessedMonth = null; // 마지막 처리된 월 정보
        this.init();
    }

    initHolidays() {
        return {
            // 고정 공휴일 (매년 동일)
            fixed: [
                { month: 1, day: 1, name: '신정' },
                { month: 3, day: 1, name: '3·1절' },
                { month: 5, day: 5, name: '어린이날' },
                { month: 6, day: 6, name: '현충일' },
                { month: 8, day: 15, name: '광복절' },
                { month: 10, day: 3, name: '개천절' },
                { month: 10, day: 9, name: '한글날' },
                { month: 12, day: 25, name: '크리스마스' }
            ],
            
            // 가변 공휴일 (연도별로 다름) - 2024-2026년
            variable: {
                2024: [
                    { month: 2, day: 9, name: '설날 전날' },
                    { month: 2, day: 10, name: '설날' },
                    { month: 2, day: 11, name: '설날 다음날' },
                    { month: 2, day: 12, name: '설 대체공휴일' },
                    { month: 4, day: 10, name: '국회의원선거일' },
                    { month: 5, day: 6, name: '어린이날 대체공휴일' },
                    { month: 5, day: 15, name: '부처님오신날' },
                    { month: 9, day: 16, name: '추석 전날' },
                    { month: 9, day: 17, name: '추석' },
                    { month: 9, day: 18, name: '추석 다음날' }
                ],
                2025: [
                    { month: 1, day: 28, name: '설날 전날' },
                    { month: 1, day: 29, name: '설날' },
                    { month: 1, day: 30, name: '설날 다음날' },
                    { month: 5, day: 5, name: '부처님오신날' },
                    { month: 10, day: 5, name: '추석 전날' },
                    { month: 10, day: 6, name: '추석' },
                    { month: 10, day: 7, name: '추석 다음날' },
                    { month: 10, day: 8, name: '추석 대체공휴일' }
                ],
                2026: [
                    { month: 2, day: 16, name: '설날 전날' },
                    { month: 2, day: 17, name: '설날' },
                    { month: 2, day: 18, name: '설날 다음날' },
                    { month: 5, day: 24, name: '부처님오신날' },
                    { month: 9, day: 24, name: '추석 전날' },
                    { month: 9, day: 25, name: '추석' },
                    { month: 9, day: 26, name: '추석 다음날' }
                ]
            }
        };
    }

    init() {
        // DOM이 로드된 후 공휴일 표시
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.displayHolidays());
        } else {
            this.displayHolidays();
        }
        
        // 달력 변경 시에도 공휴일 표시
        this.observeCalendarChanges();
    }

    getHoliday(year, month, day) {
        // 고정 공휴일 확인
        const fixedHoliday = this.holidays.fixed.find(h => h.month === month && h.day === day);
        if (fixedHoliday) {
            return fixedHoliday.name;
        }

        // 가변 공휴일 확인
        const yearHolidays = this.holidays.variable[year];
        if (yearHolidays) {
            const variableHoliday = yearHolidays.find(h => h.month === month && h.day === day);
            if (variableHoliday) {
                return variableHoliday.name;
            }
        }

        return null;
    }

    isHoliday(year, month, day) {
        return this.getHoliday(year, month, day) !== null;
    }

    displayHolidays() {
        // 현재 표시된 달력의 연월 정보 가져오기
        const monthYearElement = document.getElementById('monthYear');
        if (!monthYearElement) return;

        const monthYearText = monthYearElement.textContent;
        const [year, month] = this.parseMonthYear(monthYearText);
        
        if (!year || !month) return;
        
        // 중복 실행 방지 - 더 엄격한 체크
        const currentMonth = `${year}-${month}`;
        if (this.isProcessing || this.lastProcessedMonth === currentMonth) {
            console.log('⚠️ 공휴일 처리 중복 실행 방지:', currentMonth);
            return;
        }
        
        this.isProcessing = true;
        this.lastProcessedMonth = currentMonth;
        
        console.log(`🏮 공휴일 처리 시작: ${year}년 ${month}월`);

        // 모든 날짜 셀에 공휴일 정보 추가
        const dayElements = document.querySelectorAll('.day:not(.other-month)'); // 다른 달 날짜 제외
        let processedCount = 0;
        
        dayElements.forEach((dayElement, index) => {
            // 먼저 기존 공휴일 표시 완전 정리
            this.removeHolidayMark(dayElement);
            
            const dayNumber = this.extractDayNumber(dayElement);
            if (dayNumber && dayNumber >= 1 && dayNumber <= 31) {
                const holidayName = this.getHoliday(year, month, dayNumber);
                if (holidayName) {
                    this.markAsHoliday(dayElement, holidayName, dayNumber);
                    processedCount++;
                    console.log(`🎌 ${month}월 ${dayNumber}일 - ${holidayName}`);
                }
            }
        });
        
        console.log(`✅ 공휴일 처리 완료: ${processedCount}개 공휴일 표시`);
        
        // 처리 완료
        setTimeout(() => {
            this.isProcessing = false;
        }, 200);
    }

    parseMonthYear(text) {
        // "2025년 8월" 형태에서 연도와 월 추출
        const match = text.match(/(\d{4})년\s*(\d{1,2})월/);
        if (match) {
            return [parseInt(match[1]), parseInt(match[2])];
        }
        return [null, null];
    }

    extractDayNumber(dayElement) {
        // 날짜 셀에서 날짜 숫자 추출 - 개선된 버전
        const textContent = dayElement.textContent.trim();
        
        // 첫 번째 숫자를 찾기
        const match = textContent.match(/\d+/);
        if (match) {
            const dayNum = parseInt(match[0]);
            // 유효한 날짜 범위 확인 (1-31)
            if (dayNum >= 1 && dayNum <= 31) {
                return dayNum;
            }
        }
        
        // data-date 속성이나 다른 방법으로도 시도
        const dataDate = dayElement.getAttribute('data-date');
        if (dataDate) {
            const parts = dataDate.split('-');
            if (parts.length === 3) {
                return parseInt(parts[2]);
            }
        }
        
        return null;
    }

    markAsHoliday(dayElement, holidayName, dayNumber) {
        // 공휴일 클래스 추가
        dayElement.classList.add('holiday');
        
        // 이미 공휴일이 표시된 경우 중복 방지
        const existingHoliday = dayElement.querySelector('.holiday-name, .holiday-label');
        if (existingHoliday && existingHoliday.textContent === holidayName) {
            console.log(`⚠️ 이미 표시된 공휴일: ${dayNumber}일 ${holidayName}`);
            return; // 중복 처리 방지
        }

        // 기존 공휴일 표시 완전 제거
        const allHolidayElements = dayElement.querySelectorAll('.holiday-name, .holiday-label');
        allHolidayElements.forEach(el => el.remove());

        // 새로운 공휴일 라벨 생성 (index.html의 스타일과 일치)
        const holidayLabel = document.createElement('div');
        holidayLabel.className = 'holiday-label';
        holidayLabel.textContent = holidayName;
        dayElement.appendChild(holidayLabel);

        // 날짜 숫자를 빨간색으로 만들기 (간단한 방법)
        const dayNumberElement = dayElement.querySelector('.day-number, span');
        if (dayNumberElement) {
            dayNumberElement.style.color = '#e53e3e';
            dayNumberElement.style.fontWeight = '800';
        }
        
        console.log(`🎌 공휴일 표시 완료: ${dayNumber}일 ${holidayName}`);
    }

    removeHolidayMark(dayElement) {
        // 공휴일 클래스 제거
        dayElement.classList.remove('holiday');
        
        // 모든 공휴일 관련 요소 완전 제거
        const holidayElements = dayElement.querySelectorAll('.holiday-name, .holiday-label, .holiday-date');
        holidayElements.forEach(el => el.remove());
        
        // 기존 holiday-date 클래스 제거
        const holidayDates = dayElement.querySelectorAll('*');
        holidayDates.forEach(el => {
            el.classList.remove('holiday-date');
        });
        
        // 중복된 공휴일 텍스트 완전 정리
        this.cleanupDuplicateHolidayContent(dayElement);
    }
    
    cleanupDuplicateHolidayContent(dayElement) {
        // 중복된 공휴일 내용 완전 정리
        const textContent = dayElement.textContent;
        
        // 공휴일 이름이 중복으로 표시되고 있는지 확인
        const holidayNames = ['신정', '설날', '3·1절', '어린이날', '현충일', '광복절', '개천절', '한글날', '크리스마스', '부처님오신날', '추석'];
        
        holidayNames.forEach(name => {
            // 같은 공휴일 이름이 여러 번 나오면 하나만 남기고 제거
            const regex = new RegExp(name, 'g');
            const matches = textContent.match(regex);
            if (matches && matches.length > 1) {
                console.log(`🧹 중복 공휴일 정리: ${name} (${matches.length}개 → 1개)`);
                
                // 중복된 공휴일 텍스트를 포함한 요소들 찾아서 정리
                const childElements = Array.from(dayElement.children);
                let foundFirst = false;
                
                childElements.forEach(child => {
                    if (child.textContent.includes(name)) {
                        if (foundFirst) {
                            child.remove(); // 두 번째부터는 제거
                        } else {
                            foundFirst = true;
                        }
                    }
                });
            }
        });
    }

    cleanupDuplicateNumbers(dayElement) {
        // 중복된 날짜 숫자 정리
        const allText = dayElement.textContent;
        const numbers = allText.match(/\d+/g);
        
        if (numbers && numbers.length > 1) {
            // 첫 번째 숫자만 남기고 나머지 제거
            const correctNumber = numbers[0];
            const children = Array.from(dayElement.childNodes);
            
            let hasCorrectNumber = false;
            children.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (/^\d+$/.test(child.textContent.trim()) && !hasCorrectNumber) {
                        hasCorrectNumber = true;
                    } else if (/^\d+$/.test(child.textContent.trim())) {
                        child.remove();
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (/^\d+$/.test(child.textContent.trim()) && !hasCorrectNumber) {
                        hasCorrectNumber = true;
                    } else if (/^\d+$/.test(child.textContent.trim())) {
                        child.remove();
                    }
                }
            });
        }
    }

    observeCalendarChanges() {
        // 달력 변경 감지를 위한 MutationObserver - 중복 방지
        const targetNode = document.getElementById('daysContainer') || document.querySelector('.days');
        if (!targetNode) return;

        let observerTimeout = null;
        const observer = new MutationObserver(() => {
            if (observerTimeout) {
                clearTimeout(observerTimeout);
            }
            observerTimeout = setTimeout(() => {
                this.lastProcessedMonth = null; // 월 변경 시 플래그 리셋
                this.displayHolidays();
            }, 300);
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: false // subtree를 false로 하여 성능 향상
        });

        // 월 변경 버튼 감지 - 디바운스 적용
        let buttonTimeout = null;
        const handleMonthChange = () => {
            if (buttonTimeout) {
                clearTimeout(buttonTimeout);
            }
            buttonTimeout = setTimeout(() => {
                this.lastProcessedMonth = null;
                this.displayHolidays();
            }, 400);
        };

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', handleMonthChange);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', handleMonthChange);
        }

        // monthYear 클릭 감지 (날짜 선택기) - 한 번만 등록
        const monthYear = document.getElementById('monthYear');
        if (monthYear && !monthYear.hasAttribute('data-holiday-listener')) {
            monthYear.setAttribute('data-holiday-listener', 'true');
            monthYear.addEventListener('click', () => {
                setTimeout(() => {
                    this.lastProcessedMonth = null;
                    this.displayHolidays();
                }, 800);
            });
        }
    }

    // 공휴일 목록 가져오기 (특정 연월)
    getHolidaysForMonth(year, month) {
        const holidays = [];
        
        // 고정 공휴일
        this.holidays.fixed
            .filter(h => h.month === month)
            .forEach(h => holidays.push({ ...h, year }));
        
        // 가변 공휴일
        const yearHolidays = this.holidays.variable[year];
        if (yearHolidays) {
            yearHolidays
                .filter(h => h.month === month)
                .forEach(h => holidays.push({ ...h, year }));
        }
        
        return holidays.sort((a, b) => a.day - b.day);
    }
}

// CSS 스타일 추가
const holidayStyles = `
<style>
.day.holiday {
    position: relative;
}

.day.holiday .holiday-date,
.day.holiday > span:first-child,
.day.holiday > *:first-child {
    color: #dc2626 !important;
    font-weight: 800 !important;
}

.holiday-name {
    font-size: 11px !important;
    color: #dc2626 !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    margin-top: 4px !important;
    text-align: left !important;
    word-break: keep-all !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: 100% !important;
}

/* 다크 모드에서의 공휴일 색상 */
[data-theme="dark"] .day.holiday .holiday-date,
[data-theme="dark"] .day.holiday > span:first-child,
[data-theme="dark"] .day.holiday > *:first-child {
    color: #f87171 !important;
}

[data-theme="dark"] .holiday-name {
    color: #f87171 !important;
}

/* 모바일에서 공휴일 이름 크기 조정 */
@media (max-width: 768px) {
    .holiday-name {
        font-size: 9px !important;
    }
}

@media (max-width: 480px) {
    .holiday-name {
        font-size: 8px !important;
    }
}
</style>
`;

// 스타일 추가
document.head.insertAdjacentHTML('beforeend', holidayStyles);

// 전역 인스턴스 생성 - 강력한 중복 방지
if (!window.koreanHolidays && !window.koreanHolidaysInitialized) {
    window.koreanHolidaysInitialized = true;
    console.log('🏮 한국 공휴일 시스템 초기화 중...');
    
    // 짧은 지연 후 생성 (다른 스크립트와 충돌 방지)
    setTimeout(() => {
        if (!window.koreanHolidays) {
            window.koreanHolidays = new KoreanHolidays();
            console.log('✅ 한국 공휴일 시스템 초기화 완료');
        }
    }, 300);
} else {
    console.log('⚠️ 한국 공휴일 시스템 이미 초기화됨, 중복 실행 방지');
}