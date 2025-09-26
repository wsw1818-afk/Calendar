// 🎯 간단한 모달 표시 수정 스크립트 - 최종 솔루션
console.log('🎯 간단한 모달 표시 수정 시작');

// 모든 다른 모달 스크립트들을 우회하는 직접적인 접근
function showSettingsModalDirectly() {
    console.log('⚙️ 설정 모달 직접 표시 시작');

    const modal = document.getElementById('settingsModal');
    if (!modal) {
        console.log('❌ 설정 모달을 찾을 수 없음');
        return;
    }

    // 기존 모든 스타일 완전 제거
    modal.removeAttribute('style');
    modal.className = 'modal';

    // 모달 콘텐츠 찾기
    let modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.removeAttribute('style');
        modalContent.className = 'modal-content';
    }

    // 새로운 설정 모달 HTML을 직접 생성
    modal.innerHTML = `
        <div class="modal-content" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 1000001;
            overflow-y: auto;
        ">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f0f0f0;
            ">
                <h2 style="
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                    font-weight: bold;
                ">⚙️ 설정</h2>
                <button onclick="document.getElementById('settingsModal').style.display='none'" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 18px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>

            <div class="modal-body">
                <div style="margin-bottom: 25px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #555;
                        font-size: 16px;
                    ">📝 글꼴 크기</label>
                    <input type="range" id="fontSizeSlider" min="0.8" max="1.5" step="0.1" value="1.0" style="
                        width: 100%;
                        height: 8px;
                        margin-bottom: 10px;
                    ">
                    <div style="
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    ">현재: <span id="fontSizeValue">1.0</span></div>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #555;
                        font-size: 16px;
                    ">📏 달력 가로 크기</label>
                    <input type="range" id="calendarWidthSlider" min="0.8" max="2.0" step="0.1" value="1.2" style="
                        width: 100%;
                        height: 8px;
                        margin-bottom: 10px;
                    ">
                    <div style="
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    ">현재: <span id="widthValue">1.2</span></div>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #555;
                        font-size: 16px;
                    ">📐 달력 세로 크기</label>
                    <input type="range" id="calendarHeightSlider" min="0.8" max="2.0" step="0.1" value="1.0" style="
                        width: 100%;
                        height: 8px;
                        margin-bottom: 10px;
                    ">
                    <div style="
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    ">현재: <span id="heightValue">1.0</span></div>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #555;
                        font-size: 16px;
                    ">📅 주 시작일</label>
                    <select id="weekStartSelect" style="
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        font-size: 16px;
                    ">
                        <option value="일요일">일요일</option>
                        <option value="월요일">월요일</option>
                    </select>
                </div>

                <div style="margin-bottom: 30px;">
                    <label style="
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #555;
                        font-size: 16px;
                    ">🎨 테마</label>
                    <select id="themeSelect" style="
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        font-size: 16px;
                    ">
                        <option value="light">밝은 테마</option>
                        <option value="dark">어두운 테마</option>
                    </select>
                </div>
            </div>

            <div class="modal-footer" style="
                display: flex;
                justify-content: space-between;
                gap: 15px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
            ">
                <button onclick="resetSettings()" style="
                    flex: 1;
                    padding: 12px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                ">🔄 초기화</button>
                <button onclick="saveSettingsAndClose()" style="
                    flex: 2;
                    padding: 12px 20px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                ">💾 저장하고 닫기</button>
            </div>
        </div>
    `;

    // 모달 컨테이너 스타일 설정
    modal.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0,0,0,0.6) !important;
        z-index: 1000000 !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
    `;

    // 슬라이더 이벤트 리스너 추가
    setupSettingsEvents();
    loadCurrentSettings();

    console.log('✅ 설정 모달 직접 표시 완료');
}

// 설정 이벤트 설정
function setupSettingsEvents() {
    const fontSlider = document.getElementById('fontSizeSlider');
    const widthSlider = document.getElementById('calendarWidthSlider');
    const heightSlider = document.getElementById('calendarHeightSlider');

    if (fontSlider) {
        fontSlider.addEventListener('input', function() {
            document.getElementById('fontSizeValue').textContent = this.value;
        });
    }

    if (widthSlider) {
        widthSlider.addEventListener('input', function() {
            document.getElementById('widthValue').textContent = this.value;
        });
    }

    if (heightSlider) {
        heightSlider.addEventListener('input', function() {
            document.getElementById('heightValue').textContent = this.value;
        });
    }
}

// 현재 설정 로드
function loadCurrentSettings() {
    const settings = {
        fontSize: localStorage.getItem('fontSize') || '1.0',
        calendarWidth: localStorage.getItem('calendarWidth') || '1.2',
        calendarHeight: localStorage.getItem('calendarHeight') || '1.0',
        weekStart: localStorage.getItem('weekStart') || '일요일',
        theme: localStorage.getItem('theme') || 'light'
    };

    const fontSlider = document.getElementById('fontSizeSlider');
    const widthSlider = document.getElementById('calendarWidthSlider');
    const heightSlider = document.getElementById('calendarHeightSlider');
    const weekSelect = document.getElementById('weekStartSelect');
    const themeSelect = document.getElementById('themeSelect');

    if (fontSlider) {
        fontSlider.value = settings.fontSize;
        document.getElementById('fontSizeValue').textContent = settings.fontSize;
    }
    if (widthSlider) {
        widthSlider.value = settings.calendarWidth;
        document.getElementById('widthValue').textContent = settings.calendarWidth;
    }
    if (heightSlider) {
        heightSlider.value = settings.calendarHeight;
        document.getElementById('heightValue').textContent = settings.calendarHeight;
    }
    if (weekSelect) weekSelect.value = settings.weekStart;
    if (themeSelect) themeSelect.value = settings.theme;
}

// 설정 저장 및 닫기
window.saveSettingsAndClose = function() {
    const fontSlider = document.getElementById('fontSizeSlider');
    const widthSlider = document.getElementById('calendarWidthSlider');
    const heightSlider = document.getElementById('calendarHeightSlider');
    const weekSelect = document.getElementById('weekStartSelect');
    const themeSelect = document.getElementById('themeSelect');

    if (fontSlider) localStorage.setItem('fontSize', fontSlider.value);
    if (widthSlider) localStorage.setItem('calendarWidth', widthSlider.value);
    if (heightSlider) localStorage.setItem('calendarHeight', heightSlider.value);
    if (weekSelect) localStorage.setItem('weekStart', weekSelect.value);
    if (themeSelect) localStorage.setItem('theme', themeSelect.value);

    document.getElementById('settingsModal').style.display = 'none';
    console.log('✅ 설정 저장 및 모달 닫기 완료');

    // 설정 적용
    if (typeof applySettings === 'function') {
        applySettings();
    }
};

// 설정 초기화
window.resetSettings = function() {
    localStorage.removeItem('fontSize');
    localStorage.removeItem('calendarWidth');
    localStorage.removeItem('calendarHeight');
    localStorage.removeItem('weekStart');
    localStorage.removeItem('theme');

    loadCurrentSettings();
    console.log('🔄 설정 초기화 완료');
};

// 설정 버튼 클릭 이벤트 재정의
function setupSimpleSettingsButton() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (!settingsBtn) {
        setTimeout(setupSimpleSettingsButton, 500);
        return;
    }

    // 기존 이벤트 리스너 제거
    const newBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);

    // 새로운 이벤트 리스너 등록 (최우선 처리)
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log('⚙️ 간단한 설정 모달 표시');
        showSettingsModalDirectly();

        return false;
    }, true);

    console.log('✅ 간단한 설정 버튼 핸들러 등록 완료');
}

// ESC 키 처리
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('settingsModal');
        if (modal && modal.style.display !== 'none') {
            modal.style.display = 'none';
            console.log('🔑 ESC로 간단한 모달 닫기');
        }
    }
});

// 모달 배경 클릭으로 닫기
document.addEventListener('click', function(e) {
    if (e.target.id === 'settingsModal') {
        e.target.style.display = 'none';
        console.log('🖱️ 배경 클릭으로 간단한 모달 닫기');
    }
});

// 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(setupSimpleSettingsButton, 1500);
    });
} else {
    setTimeout(setupSimpleSettingsButton, 200);
}

console.log('✅ 간단한 모달 표시 수정 스크립트 로드 완료');

// 전역 함수로 노출
window.showSettingsModalDirectly = showSettingsModalDirectly;