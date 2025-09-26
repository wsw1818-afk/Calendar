// 🔧 완전히 새로운 모달 생성 스크립트
console.log('🔧 완전히 새로운 모달 생성 시작');

// 기존 모달 완전 제거하고 새로 생성
function createFreshModal() {
    console.log('🗑️ 기존 모달 제거');

    // 기존 모달들 완전 제거
    const oldDateModal = document.getElementById('dateMemoModal');
    const oldSettingsModal = document.getElementById('settingsModal');

    if (oldDateModal) oldDateModal.remove();
    if (oldSettingsModal) oldSettingsModal.remove();

    // 완전히 새로운 날짜 모달 생성
    const newDateModal = document.createElement('div');
    newDateModal.id = 'dateMemoModal';
    newDateModal.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 2147483647 !important;
        background: white !important;
        border: 3px solid #333 !important;
        border-radius: 15px !important;
        padding: 30px !important;
        min-width: 500px !important;
        min-height: 400px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7) !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    newDateModal.innerHTML = `
        <div style="display: flex !important; flex-direction: column !important; height: 100% !important;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">📅 날짜별 메모</h2>
            <div style="flex: 1; padding: 20px; background: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px;" id="modalDateInfo">날짜: 2025년 9월 17일</p>
                <p style="margin: 10px 0 0 0; color: #666;">이 날짜에 4개의 메모가 있습니다.</p>
                <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                    <div>• dsadasdasddasdasdasdasdasdsad</div>
                    <div>• 테스트 스티커 메모이것은 스티커 메모 기능 테스트입니다...</div>
                    <div>• 테스트 스티커 메모이것은 스티커 메모 기능 테스트입니다...</div>
                    <div>• 📅 테스트 일정</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="document.getElementById('dateMemoModal').remove()" style="
                    padding: 10px 20px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">닫기</button>
                <button style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">메모 추가</button>
            </div>
        </div>
    `;

    // 새로운 설정 모달 생성
    const newSettingsModal = document.createElement('div');
    newSettingsModal.id = 'settingsModal';
    newSettingsModal.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 2147483647 !important;
        background: white !important;
        border: 3px solid #333 !important;
        border-radius: 15px !important;
        padding: 30px !important;
        width: 500px !important;
        height: 400px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7) !important;
        display: none !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    newSettingsModal.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">⚙️ 설정</h2>
        <div style="flex: 1; padding: 20px; background: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">글꼴 크기</label>
                <input type="range" min="0.8" max="1.5" step="0.1" value="1.0" style="width: 100%;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">달력 가로 크기</label>
                <input type="range" min="0.8" max="2.0" step="0.1" value="1.2" style="width: 100%;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">달력 세로 크기</label>
                <input type="range" min="0.8" max="2.0" step="0.1" value="1.0" style="width: 100%;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">주 시작일</label>
                <select style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="일요일" selected>일요일</option>
                    <option value="월요일">월요일</option>
                </select>
            </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="document.getElementById('settingsModal').style.display='none'" style="
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">취소</button>
            <button style="
                padding: 10px 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">저장</button>
        </div>
    `;

    // body에 추가
    document.body.appendChild(newDateModal);
    document.body.appendChild(newSettingsModal);

    // 모달을 최상위로 보장
    setTimeout(() => {
        if (newDateModal) {
            newDateModal.style.zIndex = '2147483647';
            newDateModal.style.display = 'block';
            newDateModal.style.visibility = 'visible';
            newDateModal.style.opacity = '1';
        }
    }, 10);

    console.log('✅ 완전히 새로운 모달 생성 완료');
    console.log('📅 날짜 모달이 자동으로 표시됩니다');

    return { dateModal: newDateModal, settingsModal: newSettingsModal };
}

// 새로운 클릭 이벤트 핸들러
function setupNewClickHandlers() {
    // 날짜 클릭
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.day');
        if (target && e.isTrusted) {
            const dayText = target.textContent.trim();
            const day = parseInt(dayText);

            if (!isNaN(day) && day >= 1 && day <= 31) {
                console.log(`📅 새로운 날짜 클릭: ${day}일`);

                // 기존 모달 제거하고 새로 생성
                const modals = createFreshModal();

                // 새 모달의 날짜 정보 업데이트
                if (modals.dateModal) {
                    const dateInfo = modals.dateModal.querySelector('#modalDateInfo');
                    if (dateInfo) {
                        const currentYear = 2025; // 현재 달력이 보여주는 연도
                        const currentMonth = 9;   // 현재 달력이 보여주는 월
                        dateInfo.textContent = `날짜: ${currentYear}년 ${currentMonth}월 ${day}일`;
                        console.log(`📅 모달 날짜 업데이트: ${currentYear}년 ${currentMonth}월 ${day}일`);
                    }
                }
            }
        }
    }, true);

    // 설정 버튼 클릭
    document.addEventListener('click', function(e) {
        if ((e.target.id === 'settingsBtn' || e.target.closest('#settingsBtn')) && e.isTrusted) {
            console.log('⚙️ 새로운 설정 버튼 클릭');

            const modals = createFreshModal();
            // 날짜 모달 숨기고 설정 모달 표시
            if (modals.dateModal) {
                modals.dateModal.style.display = 'none';
            }
            if (modals.settingsModal) {
                modals.settingsModal.style.cssText = `
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    z-index: 2147483647 !important;
                    background: white !important;
                    border: 3px solid #333 !important;
                    border-radius: 15px !important;
                    padding: 30px !important;
                    width: 500px !important;
                    height: 400px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.7) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;

                // 추가로 보장
                setTimeout(() => {
                    modals.settingsModal.style.zIndex = '2147483647';
                    modals.settingsModal.style.display = 'flex';
                }, 10);
            }
        }
    }, true);

    console.log('✅ 새로운 클릭 핸들러 등록 완료');
}

// 전역 함수
window.createFreshModal = createFreshModal;
window.testNewModal = function() {
    console.log('🧪 새로운 모달 테스트');
    createFreshModal();
};

// DOM 준비되면 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            setupNewClickHandlers();
            console.log('🚀 완전히 새로운 모달 시스템 준비 완료');
        }, 1000);
    });
} else {
    setTimeout(() => {
        setupNewClickHandlers();
        console.log('🚀 완전히 새로운 모달 시스템 준비 완료');
    }, 1000);
}

console.log('✅ 완전히 새로운 모달 생성 스크립트 로드 완료');