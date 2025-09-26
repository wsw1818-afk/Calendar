// 설정 저장 문제 해결 스크립트
// 설정 저장 후 명확한 피드백 제공 및 오류 처리 강화

(function() {
    'use strict';
    
    console.log('🔧 설정 저장 기능 개선 스크립트 시작');
    
    // 기존 saveSettings 함수 개선
    window.originalSaveSettings = window.saveSettings;
    
    window.saveSettings = function() {
        console.log('💾 설정 저장 시작...');
        
        try {
            // 저장 성공 플래그
            let saveSuccess = true;
            let saveErrors = [];
            
            // 테마 설정 저장
            try {
                const themeSelect = document.getElementById('themeSelect');
                if (themeSelect) {
                    const themeValue = themeSelect.value;
                    document.documentElement.setAttribute('data-theme', themeValue);
                    localStorage.setItem('theme', themeValue);
                    console.log('✅ 테마 설정 저장:', themeValue);
                    
                    // 테마 버튼 아이콘 업데이트
                    const themeToggle = document.getElementById('themeToggle');
                    if (themeToggle) {
                        themeToggle.textContent = themeValue === 'dark' ? '☀️' : '🌙';
                    }
                } else {
                    saveErrors.push('테마 선택 요소를 찾을 수 없습니다');
                }
            } catch (error) {
                saveErrors.push('테마 설정 저장 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // 글꼴 크기 설정 저장
            try {
                const fontSizeSlider = document.getElementById('fontSizeSlider');
                if (fontSizeSlider) {
                    const fontSize = fontSizeSlider.value;
                    localStorage.setItem('fontSize', fontSize);
                    applyFontSize(parseFloat(fontSize));
                    console.log('✅ 글꼴 크기 설정 저장:', fontSize);
                } else {
                    saveErrors.push('글꼴 크기 슬라이더를 찾을 수 없습니다');
                }
            } catch (error) {
                saveErrors.push('글꼴 크기 설정 저장 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // 달력 크기 설정 저장
            try {
                const widthSlider = document.getElementById('widthSlider');
                const heightSlider = document.getElementById('heightSlider');
                
                if (widthSlider && heightSlider) {
                    const widthScale = widthSlider.value;
                    const heightScale = heightSlider.value;
                    localStorage.setItem('widthScale', widthScale);
                    localStorage.setItem('heightScale', heightScale);
                    applyCalendarSize(widthScale, heightScale);
                    console.log('✅ 달력 크기 설정 저장:', { width: widthScale, height: heightScale });
                } else {
                    saveErrors.push('달력 크기 슬라이더를 찾을 수 없습니다');
                }
            } catch (error) {
                saveErrors.push('달력 크기 설정 저장 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // 일자 크기 설정 저장
            try {
                const dateSizeSlider = document.getElementById('dateSizeSlider');
                if (dateSizeSlider) {
                    const dateSize = dateSizeSlider.value;
                    localStorage.setItem('dateSize', dateSize);
                    applyDateSize(parseFloat(dateSize));
                    console.log('✅ 일자 크기 설정 저장:', dateSize);
                } else {
                    saveErrors.push('일자 크기 슬라이더를 찾을 수 없습니다');
                }
            } catch (error) {
                saveErrors.push('일자 크기 설정 저장 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // 주 시작일 설정 저장
            try {
                const weekStartSelect = document.querySelector('#settingsModal select.form-select');
                if (weekStartSelect) {
                    const weekStart = weekStartSelect.value;
                    localStorage.setItem('weekStart', weekStart);
                    console.log('✅ 주 시작일 설정 저장:', weekStart);
                } else {
                    saveErrors.push('주 시작일 선택 요소를 찾을 수 없습니다');
                }
            } catch (error) {
                saveErrors.push('주 시작일 설정 저장 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // localStorage 저장 확인
            try {
                localStorage.setItem('settingsLastSaved', new Date().toISOString());
                console.log('✅ 설정 저장 타임스탬프 기록');
            } catch (error) {
                saveErrors.push('localStorage 접근 실패: ' + error.message);
                saveSuccess = false;
            }
            
            // 결과에 따른 사용자 피드백
            if (saveSuccess && saveErrors.length === 0) {
                // 완전 성공
                console.log('🎉 모든 설정이 성공적으로 저장되었습니다');
                
                // 성공 알림 표시
                showSaveSuccessNotification();
                
                // 모달 닫기
                closeModal('settingsModal');
                
                // 달력 새로고침
                createCalendar();
                
            } else if (saveSuccess && saveErrors.length > 0) {
                // 부분 성공 (일부 경고)
                console.warn('⚠️ 설정 저장 완료 (일부 경고):', saveErrors);
                alert(`⚠️ 설정이 저장되었지만 일부 경고가 있습니다:\n\n${saveErrors.join('\n')}`);
                
                closeModal('settingsModal');
                createCalendar();
                
            } else {
                // 실패
                console.error('❌ 설정 저장 실패:', saveErrors);
                alert(`❌ 설정 저장 중 오류가 발생했습니다:\n\n${saveErrors.join('\n')}`);
            }
            
        } catch (error) {
            console.error('💥 설정 저장 중 예상치 못한 오류:', error);
            alert('설정 저장 중 예상치 못한 오류가 발생했습니다.\n다시 시도해주세요.');
        }
    };
    
    // 성공 알림 표시 함수
    function showSaveSuccessNotification() {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.settings-save-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = 'settings-save-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease-out;
            ">
                <span style="font-size: 18px;">✅</span>
                <span>설정이 저장되었습니다!</span>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            </style>
        `;
        
        document.body.appendChild(notification);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // localStorage 상태 확인 함수
    function checkLocalStorageHealth() {
        try {
            const testKey = 'localStorage_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return { success: true, message: 'localStorage 정상' };
        } catch (error) {
            return { success: false, message: 'localStorage 오류: ' + error.message };
        }
    }
    
    // 설정 로드 기능 강화
    const originalLoadSettings = window.loadSettings;
    
    window.loadSettings = function() {
        console.log('📖 설정 로드 시작...');
        
        // localStorage 상태 확인
        const storageHealth = checkLocalStorageHealth();
        if (!storageHealth.success) {
            console.error('❌ localStorage 문제:', storageHealth.message);
            alert('브라우저 저장소에 문제가 있어 설정을 불러올 수 없습니다.\n브라우저를 다시 시작해보세요.');
            return;
        }
        
        try {
            // 기존 로드 함수 실행
            if (originalLoadSettings) {
                originalLoadSettings();
            }
            
            // 로드 성공 로그
            const lastSaved = localStorage.getItem('settingsLastSaved');
            if (lastSaved) {
                const savedDate = new Date(lastSaved);
                console.log('📋 설정 로드 완료 (마지막 저장:', savedDate.toLocaleString(), ')');
            } else {
                console.log('📋 설정 로드 완료 (기본값 사용)');
            }
            
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            alert('설정을 불러오는 중 오류가 발생했습니다.\n기본 설정으로 초기화됩니다.');
        }
    };
    
    // 설정 초기화 함수 추가
    window.resetSettingsToDefault = function() {
        if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
            try {
                localStorage.removeItem('theme');
                localStorage.removeItem('fontSize');
                localStorage.removeItem('widthScale');
                localStorage.removeItem('heightScale');
                localStorage.removeItem('dateSize');
                localStorage.removeItem('weekStart');
                localStorage.removeItem('settingsLastSaved');
                
                console.log('🔄 설정 초기화 완료');
                alert('설정이 초기화되었습니다.\n페이지를 새로고침합니다.');
                location.reload();
                
            } catch (error) {
                console.error('❌ 설정 초기화 실패:', error);
                alert('설정 초기화 중 오류가 발생했습니다.');
            }
        }
    };
    
    console.log('✅ 설정 저장 기능 개선 완료');
    
})();