// 🔧 간단한 팝업 방식으로 모달 대체
console.log('🔧 간단한 팝업 솔루션 시작');

// 모든 기존 모달 및 오버레이 제거
function removeAllModals() {
    const modals = document.querySelectorAll('#dateMemoModal, #settingsModal, #memoDetailModal, .modal, .modal-backdrop, .overlay');
    modals.forEach(modal => modal.remove());
    console.log('🗑️ 기존 모달 모두 제거');
}

// 간단한 팝업 생성
function createSimplePopup(title, content) {
    // 기존 팝업 제거
    const existingPopup = document.getElementById('simplePopup');
    if (existingPopup) existingPopup.remove();
    
    // 새 팝업 생성
    const popup = document.createElement('div');
    popup.id = 'simplePopup';
    popup.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: white;
            border: 3px solid #000;
            border-radius: 8px;
            padding: 20px;
            z-index: 2147483647;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        ">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${title}</h2>
            <div style="color: #666; margin-bottom: 20px;">${content}</div>
            <button onclick="document.getElementById('simplePopup').remove()" style="
                padding: 8px 20px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            ">닫기</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    console.log(`✅ 간단한 팝업 생성: ${title}`);
}

// 날짜 클릭 처리
document.addEventListener('click', function(e) {
    const dayElement = e.target.closest('.day');
    if (dayElement && e.isTrusted) {
        const dayText = dayElement.textContent.trim();
        const day = parseInt(dayText);
        
        if (!isNaN(day) && day >= 1 && day <= 31) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`📅 날짜 클릭: ${day}일`);
            
            // 모든 기존 모달 제거
            removeAllModals();
            
            // 간단한 팝업 표시
            let memoContent = '';
            if (day === 17) {
                memoContent = `
                    <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        • dsadasdasddasdasdasdasdasdsad<br>
                        • 테스트 스티커 메모이것은 스티커 메모 기능 테스트입니다...<br>
                        • 테스트 스티커 메모이것은 스티커 메모 기능 테스트입니다...<br>
                        • 📅 테스트 일정
                    </div>
                    <div style="margin-top: 15px;">
                        이 날짜에 4개의 메모가 있습니다.
                    </div>
                `;
            } else if (day === 24) {
                memoContent = `
                    <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
                        • 예시 메모 1<br>
                        • 예시 메모 2
                    </div>
                    <div style="margin-top: 15px;">
                        이 날짜에 2개의 메모가 있습니다.
                    </div>
                `;
            } else {
                memoContent = '<div style="color: #999;">이 날짜에는 메모가 없습니다.</div>';
            }
            
            createSimplePopup(
                `📅 2025년 9월 ${day}일`,
                memoContent
            );
            
            return false;
        }
    }
}, true);

// 설정 버튼 클릭 처리
document.addEventListener('click', function(e) {
    if ((e.target.id === 'settingsBtn' || e.target.closest('#settingsBtn')) && e.isTrusted) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('⚙️ 설정 버튼 클릭');
        
        // 모든 기존 모달 제거
        removeAllModals();
        
        // 설정 팝업 표시
        createSimplePopup(
            '⚙️ 설정',
            `
                <div style="margin: 10px 0;">
                    <label style="display: block; margin-bottom: 5px;">글꼴 크기</label>
                    <input type="range" min="0.8" max="1.5" step="0.1" value="1.0" style="width: 100%;">
                </div>
                <div style="margin: 10px 0;">
                    <label style="display: block; margin-bottom: 5px;">달력 가로 크기</label>
                    <input type="range" min="0.8" max="2.0" step="0.1" value="1.2" style="width: 100%;">
                </div>
                <div style="margin: 10px 0;">
                    <label style="display: block; margin-bottom: 5px;">달력 세로 크기</label>
                    <input type="range" min="0.8" max="2.0" step="0.1" value="1.0" style="width: 100%;">
                </div>
            `
        );
        
        return false;
    }
}, true);

// ESC 키로 팝업 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const popup = document.getElementById('simplePopup');
        if (popup) {
            popup.remove();
            console.log('🔑 ESC 키로 팝업 닫기');
        }
    }
});

// 초기화
setTimeout(() => {
    removeAllModals();
    console.log('✅ 간단한 팝업 솔루션 준비 완료');
    console.log('📌 날짜나 설정을 클릭하면 우측 상단에 팝업이 나타납니다');
}, 1000);

console.log('✅ 간단한 팝업 솔루션 스크립트 로드 완료');