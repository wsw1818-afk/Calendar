/**
 * 향상된 글자 크기 모달 디버그 스크립트
 */

console.log('🔍 향상된 글자 크기 모달 디버그 시작');

// 전역 디버그 함수
window.debugFontModal = function() {
    console.log('=== 글자 크기 모달 상세 디버그 ===');
    
    // 1. AdvancedControls 상태 확인
    console.log('1. AdvancedControls 상태:');
    console.log('  - 존재 여부:', !!window.AdvancedControls);
    if (window.AdvancedControls) {
        console.log('  - 메서드 목록:', Object.keys(window.AdvancedControls));
        console.log('  - openFontSizeModal 타입:', typeof window.AdvancedControls.openFontSizeModal);
    }
    
    // 2. 버튼 상태 확인
    const fontBtn = document.getElementById('fontSizeDetailBtn');
    console.log('2. 버튼 상태:');
    console.log('  - 버튼 존재:', !!fontBtn);
    if (fontBtn) {
        console.log('  - 버튼 클래스:', fontBtn.className);
        console.log('  - 버튼 텍스트:', fontBtn.textContent);
        console.log('  - onclick 핸들러:', fontBtn.onclick?.toString().substring(0, 100));
    }
    
    // 3. 필요한 CSS/스타일 확인
    console.log('3. CSS 스타일시트:');
    const stylesheets = Array.from(document.styleSheets);
    const relevantStyles = stylesheets.filter(sheet => {
        try {
            return sheet.href && (
                sheet.href.includes('advanced-controls') ||
                sheet.href.includes('modal') ||
                sheet.href.includes('theme')
            );
        } catch (e) {
            return false;
        }
    });
    console.log('  - 관련 스타일시트:', relevantStyles.map(s => s.href));
    
    // 4. 기존 모달 확인
    const existingModals = document.querySelectorAll('[id*="Modal"], [id*="modal"]');
    console.log('4. 기존 모달들:', Array.from(existingModals).map(m => m.id));
    
    // 5. 메모리/성능 정보
    console.log('5. 메모리 정보:');
    if (performance.memory) {
        console.log('  - 사용 중인 JS 힙:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB');
    }
    
    console.log('=== 디버그 정보 끝 ===');
};

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 향상된 디버그 시작');
    
    // 지연된 디버그 (모든 스크립트 로드 대기)
    setTimeout(() => {
        window.debugFontModal();
        
        // 글자 크기 버튼에 강화된 이벤트 핸들러 추가
        const fontBtn = document.getElementById('fontSizeDetailBtn');
        if (fontBtn) {
            // 기존 이벤트 제거하고 새로운 안전한 핸들러 추가
            fontBtn.removeAttribute('onclick');
            
            // 새로운 안전한 클릭 핸들러
            fontBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                console.log('🎯 글자 크기 버튼 클릭 - 안전한 핸들러');
                
                try {
                    // 1단계: 기본 검증
                    if (!window.AdvancedControls) {
                        throw new Error('AdvancedControls가 로드되지 않았습니다');
                    }
                    
                    if (typeof window.AdvancedControls.openFontSizeModal !== 'function') {
                        throw new Error('openFontSizeModal이 함수가 아닙니다');
                    }
                    
                    // 2단계: 함수 호출 전 상태 확인
                    console.log('함수 호출 직전 상태:');
                    console.log('  - 현재 모달들:', document.querySelectorAll('.modal').length);
                    console.log('  - body 클래스:', document.body.className);
                    
                    // 3단계: 안전한 함수 호출
                    console.log('openFontSizeModal 함수 호출 시도...');
                    const result = window.AdvancedControls.openFontSizeModal();
                    console.log('함수 호출 결과:', result);
                    
                    // 4단계: 호출 후 상태 확인
                    setTimeout(() => {
                        const modal = document.getElementById('fontSizeModal');
                        console.log('모달 생성 확인:', !!modal);
                        if (modal) {
                            console.log('모달 표시 상태:', modal.style.display);
                            console.log('모달 클래스:', modal.className);
                        }
                    }, 100);
                    
                } catch (error) {
                    console.error('❌ 글자 크기 모달 오류:', error);
                    console.error('오류 위치:', error.stack);
                    
                    // 상세한 오류 분석
                    analyzeError(error);
                    
                    // 안전한 대체 모달 생성
                    createSafeAlternativeModal(error);
                }
            });
            
            console.log('✅ 글자 크기 버튼에 안전한 핸들러 추가완료');
        } else {
            console.warn('⚠️ 글자 크기 버튼을 찾을 수 없음');
        }
    }, 2000);
});

// 오류 분석 함수
function analyzeError(error) {
    console.log('🔬 오류 분석:');
    
    if (error.message.includes('fontSettings')) {
        console.log('  - fontSettings 객체 관련 오류');
        console.log('  - 현재 fontSettings:', window.AdvancedControls?.getFontSettings?.());
    }
    
    if (error.message.includes('Object.entries')) {
        console.log('  - Object.entries 관련 오류');
        console.log('  - 대상 객체가 null/undefined일 가능성');
    }
    
    if (error.message.includes('innerHTML')) {
        console.log('  - DOM 조작 관련 오류');
        console.log('  - 템플릿 리터럴 문법 오류 가능성');
    }
    
    if (error.message.includes('querySelector') || error.message.includes('getElementById')) {
        console.log('  - DOM 선택자 오류');
        console.log('  - 요소를 찾을 수 없음');
    }
}

// 안전한 대체 모달 생성
function createSafeAlternativeModal(originalError) {
    console.log('🆘 안전한 대체 모달 생성');
    
    try {
        // 기존 오류 모달 제거
        const existingModal = document.getElementById('fontSizeModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 최소한의 안전한 모달 생성
        const safeModal = document.createElement('div');
        safeModal.id = 'fontSizeModal';
        safeModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <button onclick="this.closest('#fontSizeModal').remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
            <h2 style="margin: 0 0 20px 0; color: #333;">📝 글자 크기 설정</h2>
            <div style="margin: 20px 0; color: #666;">
                <p>원본 모달 로드 중 오류가 발생했습니다.</p>
                <details style="margin: 10px 0;">
                    <summary style="cursor: pointer; color: #007bff;">오류 세부정보</summary>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; overflow: auto;">${originalError.message}\n\n${originalError.stack}</pre>
                </details>
            </div>
            <div style="margin: 20px 0;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600;">기본 글자 크기:</label>
                <input type="range" id="safeFontSize" min="10" max="24" value="14" style="width: 100%; margin-bottom: 10px;">
                <div style="text-align: center;">
                    <span id="safeFontSizeValue" style="background: #007bff; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px;">14px</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="applySafeFontSize()" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px;">적용</button>
                <button onclick="this.closest('#fontSizeModal').remove()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">취소</button>
            </div>
        `;
        
        // 슬라이더 이벤트
        const slider = modalContent.querySelector('#safeFontSize');
        const valueSpan = modalContent.querySelector('#safeFontSizeValue');
        
        slider.addEventListener('input', function() {
            valueSpan.textContent = this.value + 'px';
        });
        
        // 전역 적용 함수
        window.applySafeFontSize = function() {
            const fontSize = slider.value;
            document.documentElement.style.setProperty('--base-font-size', fontSize + 'px');
            document.querySelectorAll('.day-number, .calendar *').forEach(el => {
                el.style.fontSize = fontSize + 'px';
            });
            
            localStorage.setItem('safeFontSize', fontSize);
            alert(`글자 크기가 ${fontSize}px로 설정되었습니다.`);
            safeModal.remove();
        };
        
        safeModal.appendChild(modalContent);
        document.body.appendChild(safeModal);
        
        console.log('✅ 안전한 대체 모달 생성 완료');
        
    } catch (fallbackError) {
        console.error('💥 대체 모달 생성도 실패:', fallbackError);
        
        // 최후 수단: alert 사용
        alert(`글자 크기 모달 오류:\n${originalError.message}\n\n페이지를 새로고침해 주세요.`);
    }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (window.applySafeFontSize) {
        delete window.applySafeFontSize;
    }
    if (window.debugFontModal) {
        delete window.debugFontModal;
    }
});

console.log('✅ 향상된 글자 크기 모달 디버그 스크립트 로드 완료');