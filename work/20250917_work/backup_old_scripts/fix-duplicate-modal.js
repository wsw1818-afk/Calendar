/**
 * 중복 모달 ID 문제 해결 스크립트
 */

console.log('🔧 중복 모달 ID 문제 해결 시작');

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 지연 실행으로 모든 스크립트 로드 대기
    setTimeout(() => {
        fixDuplicateModals();
        fixFontSizeModalIssue();
    }, 3000);
});

// 중복 모달 ID 수정
function fixDuplicateModals() {
    console.log('🔍 중복 모달 ID 검사 및 수정');
    
    // 모든 요소의 ID 수집
    const allElements = document.querySelectorAll('[id]');
    const idCounts = {};
    const duplicates = {};
    
    // ID 카운트
    allElements.forEach(el => {
        const id = el.id;
        idCounts[id] = (idCounts[id] || 0) + 1;
        
        if (idCounts[id] > 1) {
            if (!duplicates[id]) {
                duplicates[id] = [];
            }
            duplicates[id].push(el);
        }
    });
    
    // 중복 ID 출력
    const duplicateIds = Object.keys(duplicates);
    console.log('중복 ID 목록:', duplicateIds);
    
    // themeModal 중복 수정
    if (duplicates['themeModal']) {
        console.log('themeModal 중복 발견, 수정 중...');
        duplicates['themeModal'].forEach((modal, index) => {
            if (index > 0) {  // 첫 번째는 유지, 나머지는 ID 변경
                const newId = `themeModal_duplicate_${index}`;
                console.log(`themeModal -> ${newId} 변경`);
                modal.id = newId;
                modal.classList.add('duplicate-modal-removed');
            }
        });
    }
    
    // 기존 fontSizeModal 제거 (새로 생성할 예정)
    if (duplicates['fontSizeModal'] || document.getElementById('fontSizeModal')) {
        console.log('기존 fontSizeModal 감지, 제거 중...');
        const existingFontModals = document.querySelectorAll('#fontSizeModal, [id*="fontSizeModal"]');
        existingFontModals.forEach((modal, index) => {
            console.log(`기존 fontSizeModal ${index} 제거:`, modal.className);
            modal.remove();
        });
    }
    
    // 기타 중복 ID들 처리
    duplicateIds.forEach(id => {
        if (id !== 'themeModal' && id !== 'fontSizeModal') {
            console.log(`${id} 중복 처리 중...`);
            duplicates[id].forEach((el, index) => {
                if (index > 0) {
                    el.id = `${id}_dup_${index}`;
                    el.classList.add('duplicate-id-fixed');
                }
            });
        }
    });
    
    console.log('✅ 중복 모달 ID 수정 완료');
}

// fontSizeModal 관련 문제 해결
function fixFontSizeModalIssue() {
    console.log('🔧 fontSizeModal 문제 해결');
    
    // AdvancedControls 함수 재정의 (안전한 버전)
    if (window.AdvancedControls && window.AdvancedControls.openFontSizeModal) {
        console.log('기존 openFontSizeModal 함수 백업 및 재정의');
        
        // 원본 함수 백업
        window.AdvancedControls._originalOpenFontSizeModal = window.AdvancedControls.openFontSizeModal;
        
        // 안전한 함수로 재정의
        window.AdvancedControls.openFontSizeModal = function() {
            console.log('🚀 안전한 openFontSizeModal 함수 실행');
            
            try {
                // 1. 모든 기존 fontSizeModal 완전 제거
                const existingModals = document.querySelectorAll('[id*="fontSizeModal"], [class*="fontSizeModal"]');
                existingModals.forEach(modal => {
                    console.log('기존 모달 제거:', modal.id, modal.className);
                    modal.remove();
                });
                
                // 2. DOM 정리 후 잠깐 대기
                setTimeout(() => {
                    try {
                        console.log('원본 함수 호출 시도');
                        window.AdvancedControls._originalOpenFontSizeModal();
                        
                        // 3. 모달이 생성되었는지 확인
                        setTimeout(() => {
                            const newModal = document.getElementById('fontSizeModal');
                            if (newModal) {
                                console.log('✅ 모달 생성 성공');
                                
                                // 모달에 추가 안전장치 적용
                                applyModalSafeguards(newModal);
                            } else {
                                console.warn('⚠️ 모달 생성 실패, 폴백 모달 생성');
                                createUltimateFallbackModal();
                            }
                        }, 100);
                        
                    } catch (innerError) {
                        console.error('원본 함수 호출 실패:', innerError);
                        createUltimateFallbackModal();
                    }
                }, 50);
                
            } catch (error) {
                console.error('안전한 함수에서도 오류:', error);
                createUltimateFallbackModal();
            }
        };
        
        console.log('✅ openFontSizeModal 함수 재정의 완료');
    }
    
    // 글자 크기 버튼에 최종 안전장치 추가
    const fontBtn = document.getElementById('fontSizeDetailBtn');
    if (fontBtn) {
        // 모든 기존 이벤트 제거
        const newBtn = fontBtn.cloneNode(true);
        fontBtn.parentNode.replaceChild(newBtn, fontBtn);
        
        // 새로운 안전한 이벤트 추가
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 최종 안전장치 - 글자 크기 버튼 클릭');
            
            if (window.AdvancedControls && window.AdvancedControls.openFontSizeModal) {
                window.AdvancedControls.openFontSizeModal();
            } else {
                console.warn('AdvancedControls 없음, 즉시 폴백 모달 생성');
                createUltimateFallbackModal();
            }
        });
        
        console.log('✅ 글자 크기 버튼 최종 안전장치 적용');
    }
}

// 모달 안전장치 적용
function applyModalSafeguards(modal) {
    console.log('🛡️ 모달 안전장치 적용');
    
    // 모달 고유성 보장
    modal.setAttribute('data-modal-safe', 'true');
    modal.style.zIndex = '10002';
    
    // 닫기 이벤트 강화
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.remove();
            console.log('모달 안전하게 닫힘');
        });
    }
    
    // ESC 키 이벤트
    const handleEsc = function(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
            console.log('ESC키로 모달 닫힘');
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    console.log('모달 안전장치 적용 완료');
}

// 최종 폴백 모달 (절대 실패하지 않음)
function createUltimateFallbackModal() {
    console.log('🆘 최종 폴백 모달 생성');
    
    // 기존 모달 완전 제거
    document.querySelectorAll('[id*="fontSizeModal"]').forEach(m => m.remove());
    
    // 순수 JavaScript로 모달 생성 (템플릿 리터럴 사용 안함)
    const modal = document.createElement('div');
    modal.id = 'fontSizeModal';
    modal.className = 'modal ultimate-fallback';
    modal.style.cssText = 'display:flex;position:fixed;z-index:10003;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,0.6);align-items:center;justify-content:center;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;padding:30px;border-radius:15px;box-shadow:0 10px 40px rgba(0,0,0,0.3);max-width:600px;width:90%;position:relative;';
    
    // 제목
    const title = document.createElement('h2');
    title.textContent = '📝 글자 크기 설정 (안전 모드)';
    title.style.cssText = 'margin:0 0 20px 0;color:#333;';
    content.appendChild(title);
    
    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:15px;background:none;border:none;font-size:24px;cursor:pointer;color:#999;';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);
    
    // 설명
    const desc = document.createElement('p');
    desc.textContent = '원본 모달에서 오류가 발생하여 안전 모드로 실행됩니다.';
    desc.style.cssText = 'color:#666;margin-bottom:20px;';
    content.appendChild(desc);
    
    // 슬라이더 컨테이너
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = 'margin:20px 0;';
    
    const label = document.createElement('label');
    label.textContent = '전체 글자 크기:';
    label.style.cssText = 'display:block;margin-bottom:10px;font-weight:600;';
    sliderContainer.appendChild(label);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'ultimateFontSize';
    slider.min = '8';
    slider.max = '32';
    slider.value = '14';
    slider.style.cssText = 'width:100%;margin-bottom:10px;';
    sliderContainer.appendChild(slider);
    
    const valueDisplay = document.createElement('div');
    valueDisplay.style.cssText = 'text-align:center;';
    const valueSpan = document.createElement('span');
    valueSpan.id = 'ultimateFontSizeValue';
    valueSpan.textContent = '14px';
    valueSpan.style.cssText = 'background:#007bff;color:white;padding:8px 16px;border-radius:20px;font-weight:600;';
    valueDisplay.appendChild(valueSpan);
    sliderContainer.appendChild(valueDisplay);
    
    content.appendChild(sliderContainer);
    
    // 버튼 컨테이너
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'text-align:center;margin-top:25px;';
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '적용';
    applyBtn.style.cssText = 'background:#28a745;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;margin-right:10px;font-size:14px;';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '취소';
    cancelBtn.style.cssText = 'background:#6c757d;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:14px;';
    
    btnContainer.appendChild(applyBtn);
    btnContainer.appendChild(cancelBtn);
    content.appendChild(btnContainer);
    
    modal.appendChild(content);
    
    // 이벤트 연결
    slider.oninput = function() {
        valueSpan.textContent = this.value + 'px';
    };
    
    applyBtn.onclick = function() {
        const fontSize = slider.value;
        
        // CSS 변수로 적용
        document.documentElement.style.setProperty('--global-font-size', fontSize + 'px');
        
        // 직접 적용
        document.querySelectorAll('body, .day-number, .calendar, .modal').forEach(el => {
            el.style.fontSize = fontSize + 'px';
        });
        
        // 로컬 저장
        localStorage.setItem('ultimateFontSize', fontSize);
        
        alert('글자 크기가 ' + fontSize + 'px로 적용되었습니다.');
        modal.remove();
    };
    
    cancelBtn.onclick = () => modal.remove();
    
    // DOM에 추가
    document.body.appendChild(modal);
    
    console.log('✅ 최종 폴백 모달 생성 완료');
}

// 전역 정리 함수
window.fixModalIssues = function() {
    fixDuplicateModals();
    fixFontSizeModalIssue();
    console.log('수동 모달 문제 수정 완료');
};

console.log('✅ 중복 모달 ID 문제 해결 스크립트 로드 완료');
console.log('💡 수동 실행: fixModalIssues() 함수 사용 가능');