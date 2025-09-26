/**
 * 글자 크기 모달 디버그 스크립트
 */

console.log('🔍 글자 크기 모달 디버그 시작');

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    
    // 필요한 스크립트가 로드되었는지 확인
    setTimeout(() => {
        console.log('=== 디버그 정보 ===');
        console.log('window.AdvancedControls 존재:', !!window.AdvancedControls);
        
        if (window.AdvancedControls) {
            console.log('AdvancedControls 메서드들:', Object.keys(window.AdvancedControls));
            console.log('openFontSizeModal 함수:', typeof window.AdvancedControls.openFontSizeModal);
        }
        
        // 글자 크기 버튼 찾기
        const fontBtn = document.getElementById('fontSizeDetailBtn');
        console.log('글자 크기 버튼 존재:', !!fontBtn);
        
        if (fontBtn) {
            console.log('버튼 이벤트 핸들러:', fontBtn.onclick);
            
            // 버튼에 안전한 클릭 핸들러 추가
            fontBtn.addEventListener('click', function() {
                console.log('글자 크기 버튼 클릭됨');
                
                try {
                    if (window.AdvancedControls && typeof window.AdvancedControls.openFontSizeModal === 'function') {
                        console.log('openFontSizeModal 함수 호출 시도');
                        window.AdvancedControls.openFontSizeModal();
                        console.log('openFontSizeModal 함수 호출 성공');
                    } else {
                        console.error('AdvancedControls 또는 openFontSizeModal이 없습니다');
                        
                        // 수동으로 모달 생성 시도
                        console.log('수동 모달 생성 시도');
                        createFallbackFontModal();
                    }
                } catch (error) {
                    console.error('글자 크기 모달 열기 오류:', error);
                    console.error('스택 트레이스:', error.stack);
                    
                    // 폴백 모달 생성
                    createFallbackFontModal();
                }
            });
        }
        
        console.log('=== 디버그 정보 끝 ===');
    }, 1000);
});

// 폴백 모달 생성 함수
function createFallbackFontModal() {
    console.log('폴백 모달 생성 시작');
    
    try {
        // 기존 모달 제거
        const existingModal = document.getElementById('fontSizeModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 간단한 글자 크기 모달 생성
        const modal = document.createElement('div');
        modal.id = 'fontSizeModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.style.zIndex = '10000';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; margin: 50px auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <span class="close" style="position: absolute; top: 15px; right: 20px; font-size: 28px; cursor: pointer;">&times;</span>
                <h3>📝 글자 크기 설정</h3>
                <p>글자 크기 모달이 성공적으로 생성되었습니다!</p>
                <div style="margin: 20px 0;">
                    <label>전체 글자 크기:</label>
                    <input type="range" id="tempFontSize" min="10" max="24" value="14" style="width: 100%;">
                    <span id="tempFontSizeValue">14px</span>
                </div>
                <button onclick="this.closest('.modal').remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">적용</button>
            </div>
        `;
        
        // 닫기 버튼 이벤트
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            modal.remove();
        };
        
        // 슬라이더 이벤트
        const slider = modal.querySelector('#tempFontSize');
        const valueSpan = modal.querySelector('#tempFontSizeValue');
        slider.oninput = function() {
            valueSpan.textContent = this.value + 'px';
        };
        
        document.body.appendChild(modal);
        console.log('폴백 모달 생성 완료');
        
    } catch (error) {
        console.error('폴백 모달 생성 실패:', error);
        alert('글자 크기 모달을 열 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
    }
}

// 전역 오류 캐처
window.addEventListener('error', function(e) {
    if (e.message.includes('openFontSizeModal') || e.message.includes('fontSizeModal')) {
        console.error('글자 크기 모달 관련 오류 감지:', e.message);
        console.error('파일:', e.filename, '라인:', e.lineno);
    }
});

console.log('🔍 글자 크기 모달 디버그 스크립트 로드 완료');