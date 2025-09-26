// 🔧 설정 초기화 문제 수정 스크립트
// 설정 모달 열릴 때 NaN/undefined 값으로 설정되는 문제 해결

console.log('🔧 설정 초기화 수정 스크립트 로드됨');

// 기본 설정값 정의
const DEFAULT_SETTINGS = {
    fontSize: 1.0,
    calendarWidth: 1.0,
    calendarHeight: 1.0,
    dayFontSize: 1.0,
    weekStart: '일요일',
    theme: 'light'
};

// localStorage에서 안전하게 설정 로드
function loadSafeSettings() {
    try {
        const saved = localStorage.getItem('calendarSettings');
        let settings = saved ? JSON.parse(saved) : {};

        // 각 설정값 검증 및 기본값 설정
        Object.keys(DEFAULT_SETTINGS).forEach(key => {
            if (settings[key] === undefined ||
                settings[key] === null ||
                isNaN(settings[key]) ||
                (typeof settings[key] === 'number' && !isFinite(settings[key]))) {
                settings[key] = DEFAULT_SETTINGS[key];
                console.log(`⚠️ ${key} 설정값 복원: ${DEFAULT_SETTINGS[key]}`);
            }
        });

        console.log('✅ 안전한 설정 로드 완료:', settings);
        return settings;

    } catch (error) {
        console.error('❌ 설정 로드 실패, 기본값 사용:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

// 설정 안전 저장
function saveSafeSettings(settings) {
    try {
        // 설정값 검증
        const validatedSettings = {};
        Object.keys(DEFAULT_SETTINGS).forEach(key => {
            const value = settings[key];
            if (value !== undefined && value !== null && !isNaN(value) && isFinite(value)) {
                validatedSettings[key] = value;
            } else {
                validatedSettings[key] = DEFAULT_SETTINGS[key];
                console.log(`⚠️ ${key} 잘못된 값 수정: ${value} → ${DEFAULT_SETTINGS[key]}`);
            }
        });

        localStorage.setItem('calendarSettings', JSON.stringify(validatedSettings));
        console.log('✅ 안전한 설정 저장 완료:', validatedSettings);
        return validatedSettings;

    } catch (error) {
        console.error('❌ 설정 저장 실패:', error);
        return settings;
    }
}

// 글꼴 크기 적용 함수 개선
function applySafeFontSize(value) {
    try {
        // 값 검증
        const fontSize = parseFloat(value);
        if (isNaN(fontSize) || !isFinite(fontSize)) {
            console.warn(`⚠️ 잘못된 글꼴 크기: ${value}, 기본값 사용`);
            value = DEFAULT_SETTINGS.fontSize;
        }

        const root = document.documentElement;
        const scale = Math.max(0.7, Math.min(1.5, fontSize));

        root.style.setProperty('--font-scale', scale.toString());

        // 적용 확인
        const applied = getComputedStyle(root).getPropertyValue('--font-scale').trim();
        console.log(`✅ 글꼴 크기 안전 적용: ${scale} (확인: ${applied})`);

        return scale;
    } catch (error) {
        console.error('❌ 글꼴 크기 적용 실패:', error);
        return DEFAULT_SETTINGS.fontSize;
    }
}

// 달력 크기 적용 함수 개선
function applySafeCalendarSize(width, height) {
    try {
        // 값 검증
        const w = parseFloat(width);
        const h = parseFloat(height);

        if (isNaN(w) || !isFinite(w)) {
            console.warn(`⚠️ 잘못된 달력 가로 크기: ${width}, 기본값 사용`);
            width = DEFAULT_SETTINGS.calendarWidth;
        }

        if (isNaN(h) || !isFinite(h)) {
            console.warn(`⚠️ 잘못된 달력 세로 크기: ${height}, 기본값 사용`);
            height = DEFAULT_SETTINGS.calendarHeight;
        }

        const calendar = document.querySelector('.calendar-container') || document.querySelector('#calendar');
        if (calendar) {
            const finalWidth = Math.max(0.5, Math.min(2.0, width));
            const finalHeight = Math.max(0.5, Math.min(2.0, height));

            calendar.style.transform = `scale(${finalWidth}, ${finalHeight})`;

            console.log(`✅ 달력 크기 안전 적용: ${finalWidth} x ${finalHeight}`);
            return { width: finalWidth, height: finalHeight };
        }

        return { width: DEFAULT_SETTINGS.calendarWidth, height: DEFAULT_SETTINGS.calendarHeight };
    } catch (error) {
        console.error('❌ 달력 크기 적용 실패:', error);
        return { width: DEFAULT_SETTINGS.calendarWidth, height: DEFAULT_SETTINGS.calendarHeight };
    }
}

// 설정 모달 열기 이벤트 가로채기
const originalOpenSettingsModal = window.openSettingsModal;
if (originalOpenSettingsModal) {
    window.openSettingsModal = function() {
        console.log('🔧 설정 모달 열기 - 안전 초기화 실행');

        // 안전한 설정 로드
        const settings = loadSafeSettings();

        // 설정 적용
        applySafeFontSize(settings.fontSize);
        applySafeCalendarSize(settings.calendarWidth, settings.calendarHeight);

        // 슬라이더 값 안전 설정
        setTimeout(() => {
            const fontSlider = document.getElementById('fontSizeSlider');
            const widthSlider = document.getElementById('widthSlider');
            const heightSlider = document.getElementById('heightSlider');
            const dayFontSlider = document.getElementById('dayFontSizeSlider');

            if (fontSlider) {
                fontSlider.value = settings.fontSize;
                console.log(`📊 글꼴 슬라이더 설정: ${settings.fontSize}`);
            }

            if (widthSlider) {
                widthSlider.value = settings.calendarWidth;
                console.log(`📊 가로 슬라이더 설정: ${settings.calendarWidth}`);
            }

            if (heightSlider) {
                heightSlider.value = settings.calendarHeight;
                console.log(`📊 세로 슬라이더 설정: ${settings.calendarHeight}`);
            }

            if (dayFontSlider) {
                dayFontSlider.value = settings.dayFontSize;
                console.log(`📊 일자 슬라이더 설정: ${settings.dayFontSize}`);
            }
        }, 100);

        return originalOpenSettingsModal.apply(this, arguments);
    };
}

// 설정 취소 함수 완전 재정의 (원본 함수의 NaN 문제 방지)
const originalCancelSettings = window.cancelSettings;
window.cancelSettings = function() {
    console.log('🔄 설정 취소 - 안전한 복원 실행');

    try {
        // 안전한 설정 로드
        const settings = loadSafeSettings();

        // 설정 적용
        applySafeFontSize(settings.fontSize);
        applySafeCalendarSize(settings.calendarWidth, settings.calendarHeight);

        // 모달 닫기 (원본 함수의 모달 닫기 부분만 실행)
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
        }

        console.log('✅ 설정 안전 취소 완료');

    } catch (error) {
        console.error('❌ 설정 취소 중 오류:', error);

        // 오류 발생 시 기본값으로 복원
        applySafeFontSize(DEFAULT_SETTINGS.fontSize);
        applySafeCalendarSize(DEFAULT_SETTINGS.calendarWidth, DEFAULT_SETTINGS.calendarHeight);
    }
};

// 페이지 로드 시 설정 검증 및 복원
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 페이지 로드 시 설정 검증 시작');

    const settings = loadSafeSettings();
    applySafeFontSize(settings.fontSize);
    applySafeCalendarSize(settings.calendarWidth, settings.calendarHeight);

    // 검증된 설정 다시 저장
    saveSafeSettings(settings);

    console.log('✅ 페이지 로드 시 설정 검증 완료');
});

console.log('✅ 설정 초기화 수정 시스템 로드 완료');