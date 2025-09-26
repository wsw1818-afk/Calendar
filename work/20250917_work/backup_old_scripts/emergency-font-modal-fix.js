/**
 * 긴급 글자 크기 모달 에러 수정 스크립트
 */

console.log('🚨 긴급 글자 크기 모달 에러 수정 시작');

// 전역 에러 캐처
window.addEventListener('error', function(e) {
    if (e.message && (
        e.message.includes('fontSettings') ||
        e.message.includes('fontPresets') ||
        e.message.includes('openFontSizeModal') ||
        e.message.includes('글자') ||
        e.message.includes('font')
    )) {
        console.error('🚨 글자 크기 관련 에러 감지:', e.message);
        console.error('파일:', e.filename);
        console.error('라인:', e.lineno);
        console.error('스택:', e.error?.stack);
        
        // 즉시 안전한 모달 생성
        createEmergencyFontModal(e.message);
        return true; // 에러 처리됨
    }
});

// Promise 에러 캐처
window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.toString().includes('font')) {
        console.error('🚨 Promise 에러:', e.reason);
        createEmergencyFontModal(e.reason.toString());
        e.preventDefault();
    }
});

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupEmergencyFontHandler();
        monitorFontModalErrors();
    }, 1000);
});

// 긴급 글자 크기 핸들러 설정
function setupEmergencyFontHandler() {
    console.log('🔧 긴급 글자 크기 핸들러 설정');
    
    // 모든 글자 크기 관련 버튼 찾기
    const fontButtons = [
        document.getElementById('fontSizeDetailBtn'),
        document.querySelector('[onclick*="FontSize"]'),
        document.querySelector('button[title*="글자"]'),
        document.querySelector('.font-detail-btn')
    ].filter(btn => btn !== null);
    
    console.log('찾은 글자 크기 버튼:', fontButtons.length);
    
    fontButtons.forEach((btn, index) => {
        if (btn) {
            console.log(`버튼 ${index}:`, btn.id, btn.className, btn.textContent);
            
            // 기존 이벤트 완전 제거
            btn.removeAttribute('onclick');
            
            // parentNode가 있는지 확인하고 안전하게 처리
            let targetBtn = btn;
            if (btn && btn.parentNode) {
                try {
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    targetBtn = newBtn; // 새 버튼 사용
                    console.log(`✅ 버튼 ${index} 클론 및 교체 성공`);
                } catch (replaceError) {
                    console.warn(`⚠️ 버튼 ${index} 교체 실패, 원본 사용:`, replaceError.message);
                    targetBtn = btn; // 원본 버튼 사용
                }
            } else {
                console.log(`ℹ️ 버튼 ${index} parentNode 없음, 원본 사용`);
            }
            
            // 새로운 안전한 이벤트 추가
            targetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🎯 긴급 글자 크기 버튼 클릭됨');
                
                try {
                    // 1차: 기존 함수 시도
                    if (window.AdvancedControls?.openFontSizeModal) {
                        console.log('기존 함수 시도...');
                        window.AdvancedControls.openFontSizeModal();
                    } else {
                        throw new Error('AdvancedControls.openFontSizeModal 없음');
                    }
                } catch (error) {
                    console.error('1차 시도 실패:', error.message);
                    
                    // 2차: 안전한 모달 생성
                    createEmergencyFontModal(error.message);
                }
            });
            
            console.log(`✅ 버튼 ${index} 안전장치 적용 완료`);
        }
    });
}

// 글자 모달 에러 모니터링
function monitorFontModalErrors() {
    console.log('📊 글자 모달 에러 모니터링 시작');
    
    // console.error 오버라이드
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        
        if (message.includes('font') || 
            message.includes('글자') ||
            message.includes('FontSize') ||
            message.includes('fontSettings') ||
            message.includes('fontPresets')) {
            
            console.log('🚨 글자 관련 에러 감지:', message);
            
            // 3초 후 안전한 모달 제공
            setTimeout(() => {
                if (!document.getElementById('fontSizeModal')) {
                    createEmergencyFontModal(message);
                }
            }, 3000);
        }
        
        // 원본 console.error 호출
        originalError.apply(console, args);
    };
}

// 긴급 안전한 글자 크기 모달 생성
function createEmergencyFontModal(errorMessage = '알 수 없는 오류') {
    console.log('🚨 긴급 안전한 글자 크기 모달 생성');
    
    try {
        // 기존 모달 제거
        document.querySelectorAll('#fontSizeModal, [id*="fontModal"]').forEach(m => {
            m.remove();
        });
        
        // 순수 JavaScript로 모달 생성 (템플릿 리터럴 없음)
        const modal = document.createElement('div');
        modal.id = 'fontSizeModal';
        modal.className = 'modal emergency-font-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10005;
            font-family: 'Segoe UI', Arial, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.className = 'modal-content emergency-content';
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: emergencyModalIn 0.3s ease;
        `;
        
        // 애니메이션 추가
        if (!document.getElementById('emergencyModalStyles')) {
            const style = document.createElement('style');
            style.id = 'emergencyModalStyles';
            style.textContent = `
                @keyframes emergencyModalIn {
                    from { opacity: 0; transform: scale(0.7) translateY(-50px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 제목
        const title = document.createElement('h2');
        title.textContent = '📝 글자 크기 설정 (안전 모드)';
        title.style.cssText = 'margin: 0 0 20px 0; color: #333; text-align: center;';
        content.appendChild(title);
        
        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
            line-height: 1;
            padding: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            transition: all 0.2s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#f0f0f0';
        closeBtn.onmouseout = () => closeBtn.style.background = 'none';
        closeBtn.onclick = () => modal.remove();
        content.appendChild(closeBtn);
        
        // 에러 정보 (접을 수 있음)
        const errorInfo = document.createElement('details');
        errorInfo.style.cssText = 'margin-bottom: 20px; background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeaa7;';
        
        const errorSummary = document.createElement('summary');
        errorSummary.textContent = '⚠️ 오류 정보';
        errorSummary.style.cssText = 'cursor: pointer; font-weight: 600; color: #856404;';
        errorInfo.appendChild(errorSummary);
        
        const errorDetails = document.createElement('div');
        errorDetails.style.cssText = 'margin-top: 10px; font-size: 12px; color: #6c5f00; font-family: monospace;';
        errorDetails.textContent = errorMessage;
        errorInfo.appendChild(errorDetails);
        
        content.appendChild(errorInfo);
        
        // 설명
        const description = document.createElement('div');
        description.style.cssText = 'margin-bottom: 25px; color: #666; line-height: 1.5; word-wrap: break-word; white-space: normal;';
        description.innerHTML = `
            <p style="margin: 0 0 15px 0; padding: 12px; background: rgba(255, 235, 59, 0.1); border-radius: 8px; border-left: 4px solid #ffc107;">
                ⚠️ <strong>안전 모드</strong><br>
                원본 글자 크기 모달에서 오류가 발생하여 안전 모드로 실행됩니다.
            </p>
            <p style="margin: 0; font-size: 14px; color: #888; padding: 8px; background: rgba(0, 0, 0, 0.05); border-radius: 6px;">
                🔧 이 모드에서는 기본적인 글자 크기 조절 기능을 안전하게 제공합니다.
            </p>
        `;
        content.appendChild(description);
        
        // 글자 크기 설정 섹션
        const fontSection = document.createElement('div');
        fontSection.style.cssText = 'margin: 25px 0;';
        
        // 전체 글자 크기
        const globalLabel = document.createElement('label');
        globalLabel.textContent = '전체 글자 크기:';
        globalLabel.style.cssText = 'display: block; margin-bottom: 10px; font-weight: 600; color: #333;';
        fontSection.appendChild(globalLabel);
        
        const globalSlider = document.createElement('input');
        globalSlider.type = 'range';
        globalSlider.id = 'emergencyGlobalFont';
        globalSlider.min = '8';
        globalSlider.max = '32';
        globalSlider.value = localStorage.getItem('emergencyGlobalFont') || '14';
        globalSlider.style.cssText = 'width: 100%; margin-bottom: 10px;';
        fontSection.appendChild(globalSlider);
        
        const globalValue = document.createElement('div');
        globalValue.style.cssText = 'text-align: center; margin-bottom: 20px;';
        const globalSpan = document.createElement('span');
        globalSpan.id = 'emergencyGlobalFontValue';
        globalSpan.textContent = globalSlider.value + 'px';
        globalSpan.style.cssText = 'background: #007bff; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block;';
        globalValue.appendChild(globalSpan);
        fontSection.appendChild(globalValue);
        
        // 달력 날짜 크기
        const dateLabel = document.createElement('label');
        dateLabel.textContent = '달력 날짜 숫자:';
        dateLabel.style.cssText = 'display: block; margin-bottom: 10px; font-weight: 600; color: #333;';
        fontSection.appendChild(dateLabel);
        
        const dateSlider = document.createElement('input');
        dateSlider.type = 'range';
        dateSlider.id = 'emergencyDateFont';
        dateSlider.min = '10';
        dateSlider.max = '28';
        dateSlider.value = localStorage.getItem('emergencyDateFont') || '16';
        dateSlider.style.cssText = 'width: 100%; margin-bottom: 10px;';
        fontSection.appendChild(dateSlider);
        
        const dateValue = document.createElement('div');
        dateValue.style.cssText = 'text-align: center; margin-bottom: 20px;';
        const dateSpan = document.createElement('span');
        dateSpan.id = 'emergencyDateFontValue';
        dateSpan.textContent = dateSlider.value + 'px';
        dateSpan.style.cssText = 'background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block;';
        dateValue.appendChild(dateSpan);
        fontSection.appendChild(dateValue);
        
        content.appendChild(fontSection);
        
        // 미리보기 섹션
        const previewSection = document.createElement('div');
        previewSection.style.cssText = 'margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: center;';
        
        const previewTitle = document.createElement('h4');
        previewTitle.textContent = '👁️ 미리보기';
        previewTitle.style.cssText = 'margin: 0 0 15px 0; color: #495057;';
        previewSection.appendChild(previewTitle);
        
        const previewContent = document.createElement('div');
        previewContent.id = 'fontPreview';
        previewContent.style.cssText = 'border: 2px dashed #dee2e6; padding: 15px; border-radius: 8px; background: white;';
        previewContent.innerHTML = `
            <div style="font-size: ${globalSlider.value}px; margin-bottom: 10px;">일반 텍스트 (${globalSlider.value}px)</div>
            <div style="font-size: ${dateSlider.value}px; font-weight: bold; color: #007bff;">달력 날짜 숫자 (${dateSlider.value}px)</div>
        `;
        previewSection.appendChild(previewContent);
        
        content.appendChild(previewSection);
        
        // 버튼 섹션
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = 'text-align: center; margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 20px;';
        
        const applyBtn = document.createElement('button');
        applyBtn.textContent = '적용하기';
        applyBtn.style.cssText = `
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            margin-right: 15px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            transition: all 0.3s;
        `;
        applyBtn.onmouseover = () => {
            applyBtn.style.transform = 'translateY(-2px)';
            applyBtn.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
        };
        applyBtn.onmouseout = () => {
            applyBtn.style.transform = 'translateY(0)';
            applyBtn.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '취소';
        cancelBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
            transition: all 0.3s;
        `;
        cancelBtn.onmouseover = () => {
            cancelBtn.style.background = '#5a6268';
            cancelBtn.style.transform = 'translateY(-1px)';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.background = '#6c757d';
            cancelBtn.style.transform = 'translateY(0)';
        };
        
        buttonSection.appendChild(applyBtn);
        buttonSection.appendChild(cancelBtn);
        content.appendChild(buttonSection);
        
        modal.appendChild(content);
        
        // 이벤트 연결
        globalSlider.oninput = function() {
            const value = this.value;
            globalSpan.textContent = value + 'px';
            updatePreview();
            localStorage.setItem('emergencyGlobalFont', value);
        };
        
        dateSlider.oninput = function() {
            const value = this.value;
            dateSpan.textContent = value + 'px';
            updatePreview();
            localStorage.setItem('emergencyDateFont', value);
        };
        
        function updatePreview() {
            const preview = document.getElementById('fontPreview');
            if (preview) {
                preview.innerHTML = `
                    <div style="font-size: ${globalSlider.value}px; margin-bottom: 10px;">일반 텍스트 (${globalSlider.value}px)</div>
                    <div style="font-size: ${dateSlider.value}px; font-weight: bold; color: #007bff;">달력 날짜 숫자 (${dateSlider.value}px)</div>
                `;
            }
        }
        
        applyBtn.onclick = function() {
            const globalSize = globalSlider.value;
            const dateSize = dateSlider.value;
            
            try {
                // CSS 변수로 적용
                document.documentElement.style.setProperty('--emergency-global-font', globalSize + 'px');
                document.documentElement.style.setProperty('--emergency-date-font', dateSize + 'px');
                
                // 직접 적용
                document.querySelectorAll('body, .calendar, .container').forEach(el => {
                    el.style.fontSize = globalSize + 'px';
                });
                
                document.querySelectorAll('.day-number, .calendar .day').forEach(el => {
                    el.style.fontSize = dateSize + 'px';
                });
                
                // 로컬 저장
                localStorage.setItem('emergencyFontApplied', 'true');
                localStorage.setItem('emergencyGlobalFont', globalSize);
                localStorage.setItem('emergencyDateFont', dateSize);
                
                // 성공 알림
                const successDiv = document.createElement('div');
                successDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
                    z-index: 10010;
                    font-weight: 600;
                    animation: slideInRight 0.5s ease;
                `;
                successDiv.textContent = `✅ 글자 크기 적용됨: 전체 ${globalSize}px, 날짜 ${dateSize}px`;
                
                document.body.appendChild(successDiv);
                
                setTimeout(() => {
                    successDiv.style.animation = 'slideOutRight 0.5s ease';
                    setTimeout(() => successDiv.remove(), 500);
                }, 3000);
                
                modal.remove();
                
            } catch (applyError) {
                console.error('적용 중 오류:', applyError);
                alert('설정 적용 중 오류가 발생했습니다: ' + applyError.message);
            }
        };
        
        cancelBtn.onclick = () => modal.remove();
        
        // ESC 키 지원
        const handleEsc = function(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // 배경 클릭으로 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // DOM에 추가
        document.body.appendChild(modal);
        
        console.log('✅ 긴급 안전한 글자 크기 모달 생성 완료');
        
        // 포커스 설정
        setTimeout(() => {
            globalSlider.focus();
        }, 100);
        
    } catch (emergencyError) {
        console.error('💥 긴급 모달 생성도 실패:', emergencyError);
        
        // 최후 수단: confirm 사용
        const fontSize = prompt('글자 크기를 입력하세요 (8-32px):', '14');
        if (fontSize && !isNaN(fontSize)) {
            const size = Math.max(8, Math.min(32, parseInt(fontSize)));
            document.body.style.fontSize = size + 'px';
            document.querySelectorAll('.day-number, .calendar .day').forEach(el => {
                el.style.fontSize = size + 'px';
            });
            alert(`글자 크기가 ${size}px로 설정되었습니다.`);
        }
    }
}

// 페이지 로드 시 이전 설정 복원
window.addEventListener('load', function() {
    if (localStorage.getItem('emergencyFontApplied') === 'true') {
        const globalSize = localStorage.getItem('emergencyGlobalFont') || '14';
        const dateSize = localStorage.getItem('emergencyDateFont') || '16';
        
        document.documentElement.style.setProperty('--emergency-global-font', globalSize + 'px');
        document.documentElement.style.setProperty('--emergency-date-font', dateSize + 'px');
        
        console.log('✅ 이전 긴급 글자 크기 설정 복원:', globalSize + 'px,', dateSize + 'px');
    }
});

// 수동 실행 함수
window.openEmergencyFontModal = function(reason = '수동 실행') {
    createEmergencyFontModal(reason);
};

console.log('✅ 긴급 글자 크기 모달 에러 수정 스크립트 로드 완료');
console.log('💡 수동 실행: openEmergencyFontModal() 함수 사용 가능');