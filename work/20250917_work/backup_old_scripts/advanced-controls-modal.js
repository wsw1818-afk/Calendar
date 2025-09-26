/**
 * 고급 컨트롤 모달 - 글자 크기 및 색상 설정
 * 상세한 글자 크기 조절과 색상 모드 기능 제공
 */

(function() {
    'use strict';
    
    console.log('🎛️ 고급 컨트롤 모달 초기화');
    
    // ========== 글자 크기 설정 ==========
    const fontSettings = {
        global: parseInt(localStorage.getItem('globalFontSize') || '14'),
        calendar: parseInt(localStorage.getItem('calendarFontSize') || '14'),
        date: parseInt(localStorage.getItem('dateFontSize') || '14'),
        weekday: parseInt(localStorage.getItem('weekdayFontSize') || '16'),
        header: parseInt(localStorage.getItem('headerFontSize') || '20'),
        memo: parseInt(localStorage.getItem('memoFontSize') || '13'),
        button: parseInt(localStorage.getItem('buttonFontSize') || '14'),
        preset: localStorage.getItem('fontPreset') || 'default'
    };
    
    const fontPresets = {
        tiny: { global: 10, calendar: 10, date: 10, weekday: 12, header: 16, memo: 9, button: 10 },
        small: { global: 12, calendar: 12, date: 12, weekday: 14, header: 18, memo: 11, button: 12 },
        default: { global: 14, calendar: 14, date: 14, weekday: 16, header: 20, memo: 13, button: 14 },
        large: { global: 16, calendar: 16, date: 16, weekday: 18, header: 22, memo: 15, button: 16 },
        xlarge: { global: 18, calendar: 18, date: 18, weekday: 20, header: 24, memo: 17, button: 18 },
        huge: { global: 22, calendar: 22, date: 22, weekday: 24, header: 28, memo: 20, button: 20 }
    };
    
    // ========== 색상 설정 ==========
    const colorSettings = {
        currentPalette: localStorage.getItem('colorPalette') || 'default',
        customColors: JSON.parse(localStorage.getItem('customColorSettings') || '{}'),
        brightness: parseInt(localStorage.getItem('colorBrightness') || '100'),
        contrast: parseInt(localStorage.getItem('colorContrast') || '100'),
        saturation: parseInt(localStorage.getItem('colorSaturation') || '100')
    };
    
    const colorPalettes = {
        default: {
            name: '기본 파레트',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            calendar: '#ffffff',
            today: '#f5f5f5',
            memo: '#f0f8ff',
            selected: '#e3f2fd',
            hover: '#f8f9fa'
        },
        ocean: {
            name: '바다 파레트',
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            calendar: '#ffffff',
            today: '#e8f4ff',
            memo: '#e0ffe0',
            selected: '#e0f2f1',
            hover: '#f1f8f6'
        },
        sunset: {
            name: '석양 파레트', 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            calendar: '#ffffff',
            today: '#fff8dc',
            memo: '#fff0e6',
            selected: '#fff3e0',
            hover: '#fafafa'
        },
        forest: {
            name: '숲 파레트',
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            calendar: '#ffffff',
            today: '#f0fff0',
            memo: '#e8f5e8',
            selected: '#e8f8f5',
            hover: '#f5faf8'
        },
        sakura: {
            name: '벚꽃 파레트',
            background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
            calendar: '#ffffff',
            today: '#ffecec',
            memo: '#ffe4e1',
            selected: '#fce4ec',
            hover: '#fdf2f2'
        },
        lavender: {
            name: '라벤더 파레트',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            calendar: '#ffffff',
            today: '#f3e5f5',
            memo: '#e6e6fa',
            selected: '#f3e5f5',
            hover: '#faf5ff'
        },
        monochrome: {
            name: '모노크롬',
            background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
            calendar: '#ffffff',
            today: '#f8f9fa',
            memo: '#e9ecef',
            selected: '#dee2e6',
            hover: '#f1f3f4'
        },
        neon: {
            name: '네온',
            background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
            calendar: '#ffffff',
            today: '#fff5f5',
            memo: '#fff8e1',
            selected: '#fff3e0',
            hover: '#fffde7'
        }
    };
    
    // ========== 글자 크기 모달 생성 ==========
    function openFontSizeModal() {
        try {
            console.log('📝 글자 크기 모달 열기');
            
            // 기존 모달 제거
            const existingModal = document.getElementById('fontSizeModal');
            if (existingModal) {
                existingModal.remove();
                console.log('기존 글자 크기 모달 제거');
            }
        
        const modal = document.createElement('div');
        modal.id = 'fontSizeModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content draggable large">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <div class="modal-header">
                    <h3>📝 글자 크기 상세 설정</h3>
                </div>
                <div class="font-modal-content">
                    <!-- 글자 크기 미리보기 제어 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🔍</span>
                            글자 크기 미리보기 제어
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2);">
                            <label style="display: flex; align-items: center; cursor: pointer; font-weight: 600; color: #1976d2;">
                                <input type="checkbox" id="enableFontPreview" checked style="width: 18px; height: 18px; margin-right: 8px; accent-color: #2196f3; cursor: pointer;">
                                글자 크기 미리보기 자동 활성화
                            </label>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">글자 크기 설정 시 자동으로 화면을 축소하여 실시간 미리보기를 제공합니다</small>
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2);">
                            <label style="font-weight: 600; color: #1976d2;">글자 크기 미리보기 축소 비율</label>
                            <div class="slider-container" style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                                <input type="range" id="fontPreviewScale" min="30" max="100" value="80" style="flex: 1; height: 6px; border-radius: 3px; background: #e3f2fd; outline: none; -webkit-appearance: none;">
                                <span id="fontPreviewScaleValue" style="background: #2196f3; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 12px; min-width: 45px; text-align: center;">80%</span>
                            </div>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">화면 축소 정도를 조절합니다 (30% ~ 100%)</small>
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2); text-align: center;">
                            <button id="forceFontPreviewBtn" class="action-btn secondary" style="padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin: 0 4px 8px 0; background: #f5f5f5; color: #666; border: 1px solid #ddd;">수동 활성화</button>
                            <button id="disableFontPreviewBtn" class="action-btn secondary" style="padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin: 0 4px 8px 0; background: #f5f5f5; color: #666; border: 1px solid #ddd;">비활성화</button>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">글자 크기 미리보기를 수동으로 제어할 수 있습니다</small>
                        </div>
                    </div>
                    
                    <!-- 프리셋 선택 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">⚡</span>
                            빠른 설정 (프리셋)
                        </div>
                        <div class="preset-grid">
                            ${Object.entries(fontPresets).map(([key, preset]) => `
                                <button class="preset-btn font-preset-btn ${fontSettings.preset === key ? 'active' : ''}" 
                                        data-preset="${key}">
                                    <div class="preset-name">${getPresetName(key)}</div>
                                    <div class="preset-size">${preset.global}px</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 개별 설정 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🔧</span>
                            개별 글자 크기 설정
                        </div>
                        <div class="font-controls-grid">
                            <div class="font-control-group">
                                <label>전체 기본 크기</label>
                                <div class="slider-control">
                                    <input type="range" id="globalFontSlider" min="8" max="32" value="${fontSettings.global}">
                                    <span class="size-value">${fontSettings.global}px</span>
                                </div>
                            </div>
                            
                            <div class="font-control-group">
                                <label>달력 날짜 숫자</label>
                                <div class="slider-control">
                                    <input type="range" id="calendarFontSlider" min="8" max="28" value="${fontSettings.calendar}">
                                    <span class="size-value">${fontSettings.calendar}px</span>
                                </div>
                            </div>
                            
                            <div class="font-control-group">
                                <label>요일 헤더</label>
                                <div class="slider-control">
                                    <input type="range" id="weekdayFontSlider" min="10" max="24" value="${fontSettings.weekday}">
                                    <span class="size-value">${fontSettings.weekday}px</span>
                                </div>
                            </div>
                            
                            <div class="font-control-group">
                                <label>월/년 표시</label>
                                <div class="slider-control">
                                    <input type="range" id="headerFontSlider" min="16" max="36" value="${fontSettings.header}">
                                    <span class="size-value">${fontSettings.header}px</span>
                                </div>
                            </div>
                            
                            <div class="font-control-group">
                                <label>메모 텍스트</label>
                                <div class="slider-control">
                                    <input type="range" id="memoFontSlider" min="8" max="20" value="${fontSettings.memo}">
                                    <span class="size-value">${fontSettings.memo}px</span>
                                </div>
                            </div>
                            
                            <div class="font-control-group">
                                <label>버튼 텍스트</label>
                                <div class="slider-control">
                                    <input type="range" id="buttonFontSlider" min="10" max="20" value="${fontSettings.button}">
                                    <span class="size-value">${fontSettings.button}px</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 미리보기 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">👁️</span>
                            미리보기
                        </div>
                        <div class="font-preview">
                            <div class="preview-header" style="font-size: ${fontSettings.header}px;">2024년 8월</div>
                            <div class="preview-weekday" style="font-size: ${fontSettings.weekday}px;">월요일</div>
                            <div class="preview-date" style="font-size: ${fontSettings.calendar}px;">23</div>
                            <div class="preview-memo" style="font-size: ${fontSettings.memo}px;">📝 메모 예시</div>
                            <button class="preview-button" style="font-size: ${fontSettings.button}px;">예시 버튼</button>
                        </div>
                    </div>
                    
                    <!-- 고급 옵션 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">⚙️</span>
                            고급 옵션
                        </div>
                        <div class="advanced-font-options">
                            <label>
                                <input type="checkbox" id="fontSmoothingEnabled" 
                                       ${localStorage.getItem('fontSmoothing') === 'true' ? 'checked' : ''}>
                                글자 안티에일리어싱 (부드러운 글자)
                            </label>
                            <label>
                                <input type="checkbox" id="boldDatesEnabled"
                                       ${localStorage.getItem('boldDates') === 'true' ? 'checked' : ''}>
                                날짜 숫자 굵게 표시
                            </label>
                            <label>
                                <input type="checkbox" id="responsiveFontEnabled"
                                       ${localStorage.getItem('responsiveFont') !== 'false' ? 'checked' : ''}>
                                화면 크기에 따른 자동 조절
                            </label>
                            <label>
                                <input type="checkbox" id="wideViewEnabled"
                                       ${localStorage.getItem('wideView') === 'true' ? 'checked' : ''}>
                                📐 와이드 뷰 모드 (달력 전체 화면)
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="resetFontBtn" class="cancel-btn">기본값 복원</button>
                    <button id="applyFontBtn" class="save-btn">적용</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('글자 크기 모달 DOM에 추가');
        
        // 모달 초기화
        initFontModal();
        console.log('글자 크기 모달 초기화 완료');
        
        } catch (error) {
            console.error('글자 크기 모달 생성 오류:', error);
            console.error('오류 스택:', error.stack);
            
            // 간단한 폴백 모달
            const fallbackModal = document.createElement('div');
            fallbackModal.id = 'fontSizeModal';
            fallbackModal.className = 'modal';
            fallbackModal.style.cssText = 'display: block; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4);';
            
            fallbackModal.innerHTML = `
                <div style="background: white; margin: 15% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 500px;">
                    <span onclick="this.closest('.modal').remove()" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                    <h3>📝 글자 크기 설정</h3>
                    <p style="color: #666;">모달을 불러오는 중 오류가 발생했습니다.</p>
                    <p style="color: #333;">오류: ${error.message}</p>
                    <button onclick="this.closest('.modal').remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">확인</button>
                </div>
            `;
            
            document.body.appendChild(fallbackModal);
        }
    }
    
    // ========== 색상 모달 생성 ==========
    function openColorModeModal() {
        console.log('🎨 색상 모드 모달 열기');
        
        const modal = document.createElement('div');
        modal.id = 'colorModeModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content draggable large">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <div class="modal-header">
                    <h3>🎨 색상 모드 상세 설정</h3>
                </div>
                <div class="color-modal-content">
                    <!-- 색상 모드 미리보기 제어 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🔍</span>
                            색상 모드 미리보기 제어
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2);">
                            <label style="display: flex; align-items: center; cursor: pointer; font-weight: 600; color: #1976d2;">
                                <input type="checkbox" id="enableColorPreview" checked style="width: 18px; height: 18px; margin-right: 8px; accent-color: #2196f3; cursor: pointer;">
                                색상 모드 미리보기 자동 활성화
                            </label>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">색상 변경 시 자동으로 화면을 축소하여 실시간 미리보기를 제공합니다</small>
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2);">
                            <label style="font-weight: 600; color: #1976d2;">색상 모드 미리보기 축소 비율</label>
                            <div class="slider-container" style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                                <input type="range" id="colorPreviewScale" min="30" max="100" value="80" style="flex: 1; height: 6px; border-radius: 3px; background: #e3f2fd; outline: none; -webkit-appearance: none;">
                                <span id="colorPreviewScaleValue" style="background: #2196f3; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 12px; min-width: 45px; text-align: center;">80%</span>
                            </div>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">화면 축소 정도를 조절합니다 (30% ~ 100%)</small>
                        </div>
                        
                        <div class="control-group" style="background: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(33, 150, 243, 0.2); text-align: center;">
                            <button id="forceColorPreviewBtn" class="action-btn secondary" style="padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin: 0 4px 8px 0; background: #f5f5f5; color: #666; border: 1px solid #ddd;">수동 활성화</button>
                            <button id="disableColorPreviewBtn" class="action-btn secondary" style="padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin: 0 4px 8px 0; background: #f5f5f5; color: #666; border: 1px solid #ddd;">비활성화</button>
                            <small style="color: #666; font-size: 11px; margin-top: 5px; display: block; font-style: italic;">색상 모드 미리보기를 수동으로 제어할 수 있습니다</small>
                        </div>
                    </div>
                    
                    <!-- 색상 파레트 선택 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🎨</span>
                            색상 파레트 선택
                        </div>
                        <div class="palette-grid">
                            ${Object.entries(colorPalettes).map(([key, palette]) => `
                                <div class="palette-item ${colorSettings.currentPalette === key ? 'active' : ''}" 
                                     data-palette="${key}">
                                    <div class="palette-preview" style="background: ${palette.background}">
                                        <div class="palette-sample today" style="background: ${palette.today}"></div>
                                        <div class="palette-sample memo" style="background: ${palette.memo}"></div>
                                    </div>
                                    <div class="palette-name">${palette.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 색상 조정 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🎛️</span>
                            색상 조정
                        </div>
                        <div class="color-adjustment-controls">
                            <div class="adjustment-group">
                                <label>밝기</label>
                                <div class="slider-control">
                                    <input type="range" id="brightnessSlider" min="50" max="150" value="${colorSettings.brightness}">
                                    <span class="adjustment-value">${colorSettings.brightness}%</span>
                                </div>
                            </div>
                            
                            <div class="adjustment-group">
                                <label>대비</label>
                                <div class="slider-control">
                                    <input type="range" id="contrastSlider" min="50" max="200" value="${colorSettings.contrast}">
                                    <span class="adjustment-value">${colorSettings.contrast}%</span>
                                </div>
                            </div>
                            
                            <div class="adjustment-group">
                                <label>채도</label>
                                <div class="slider-control">
                                    <input type="range" id="saturationSlider" min="0" max="200" value="${colorSettings.saturation}">
                                    <span class="adjustment-value">${colorSettings.saturation}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 개별 색상 설정 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">🔧</span>
                            개별 색상 설정
                        </div>
                        <div class="individual-color-controls">
                            <div class="color-setting-group">
                                <label>페이지 배경</label>
                                <input type="color" id="pageBgColor" value="#667eea">
                                <button class="gradient-btn" data-target="pageBg">그라데이션</button>
                            </div>
                            
                            <div class="color-setting-group">
                                <label>달력 배경</label>
                                <input type="color" id="calendarBgColor" value="#ffffff">
                            </div>
                            
                            <div class="color-setting-group">
                                <label>오늘 날짜</label>
                                <input type="color" id="todayBgColor" value="#f5f5f5">
                            </div>
                            
                            <div class="color-setting-group">
                                <label>메모가 있는 날</label>
                                <input type="color" id="memoBgColor" value="#f0f8ff">
                            </div>
                            
                            <div class="color-setting-group">
                                <label>선택된 날짜</label>
                                <input type="color" id="selectedBgColor" value="#e3f2fd">
                            </div>
                            
                            <div class="color-setting-group">
                                <label>호버 효과</label>
                                <input type="color" id="hoverBgColor" value="#f8f9fa">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 특수 효과 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">✨</span>
                            특수 효과
                        </div>
                        <div class="special-effects">
                            <label>
                                <input type="checkbox" id="shadowEffectEnabled"
                                       ${localStorage.getItem('shadowEffect') === 'true' ? 'checked' : ''}>
                                그림자 효과
                            </label>
                            <label>
                                <input type="checkbox" id="glowEffectEnabled"
                                       ${localStorage.getItem('glowEffect') === 'true' ? 'checked' : ''}>
                                발광 효과 (오늘 날짜)
                            </label>
                            <label>
                                <input type="checkbox" id="animatedBgEnabled"
                                       ${localStorage.getItem('animatedBg') === 'true' ? 'checked' : ''}>
                                배경 애니메이션
                            </label>
                            <label>
                                <input type="checkbox" id="seasonalColorsEnabled"
                                       ${localStorage.getItem('seasonalColors') === 'true' ? 'checked' : ''}>
                                계절별 자동 색상
                            </label>
                        </div>
                    </div>
                    
                    <!-- 미리보기 -->
                    <div class="section-card">
                        <div class="section-title">
                            <span class="section-icon">👁️</span>
                            실시간 미리보기
                        </div>
                        <div class="color-preview">
                            <div class="preview-calendar">
                                <div class="preview-header">2024년 8월</div>
                                <div class="preview-weekdays">
                                    <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                </div>
                                <div class="preview-dates">
                                    <div class="preview-date">1</div>
                                    <div class="preview-date today">23</div>
                                    <div class="preview-date memo">25</div>
                                    <div class="preview-date">30</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="saveColorPresetBtn" class="secondary-btn">프리셋 저장</button>
                    <button id="resetColorBtn" class="cancel-btn">기본값 복원</button>
                    <button id="applyColorBtn" class="save-btn">적용</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        initColorModal();
    }
    
    // ========== 유틸리티 함수 ==========
    function getPresetName(key) {
        const names = {
            tiny: '미니',
            small: '작게',
            default: '기본',
            large: '크게',
            xlarge: '특대',
            huge: '초대형'
        };
        return names[key] || key;
    }
    
    // ========== 글자 모달 초기화 ==========
    function initFontModal() {
        try {
            console.log('글자 모달 초기화 시작');
        // 프리셋 버튼 이벤트
        document.querySelectorAll('.font-preset-btn').forEach(btn => {
            btn.onclick = () => {
                const preset = btn.dataset.preset;
                applyFontPreset(preset);
                document.querySelectorAll('.font-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
        
        // 슬라이더 이벤트
        const sliders = ['global', 'calendar', 'weekday', 'header', 'memo', 'button'];
        sliders.forEach(type => {
            const slider = document.getElementById(`${type}FontSlider`);
            if (slider) {
                slider.oninput = () => {
                    const value = slider.value;
                    slider.nextElementSibling.textContent = value + 'px';
                    fontSettings[type] = parseInt(value);
                    updateFontPreview();
                };
            }
        });
        
        // 체크박스 이벤트 (와이드 뷰 포함)
        const checkboxes = ['fontSmoothingEnabled', 'boldDatesEnabled', 'responsiveFontEnabled', 'wideViewEnabled'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.onchange = () => {
                    const key = id.replace('Enabled', '');
                    const storageKey = key === 'wideView' ? 'wideView' : 
                                     key === 'fontSmoothing' ? 'fontSmoothing' :
                                     key === 'boldDates' ? 'boldDates' : 'responsiveFont';
                    localStorage.setItem(storageKey, checkbox.checked);
                    
                    // 와이드 뷰의 경우 즉시 적용
                    if (id === 'wideViewEnabled') {
                        applyWideView(checkbox.checked);
                    }
                };
            }
        });
        
        // 적용 버튼
        document.getElementById('applyFontBtn').onclick = () => {
            applyFontSettings();
            document.getElementById('fontSizeModal').remove();
        };
        
        // 리셋 버튼
        const resetBtn = document.getElementById('resetFontBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                applyFontPreset('default');
            };
        }
        
        console.log('글자 모달 초기화 성공');
        
        } catch (error) {
            console.error('글자 모달 초기화 오류:', error);
        }
    }
    
    // ========== 색상 모달 초기화 ==========
    function initColorModal() {
        // 파레트 선택 이벤트
        document.querySelectorAll('.palette-item').forEach(item => {
            item.onclick = () => {
                const palette = item.dataset.palette;
                selectColorPalette(palette);
                document.querySelectorAll('.palette-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            };
        });
        
        // 조정 슬라이더 이벤트
        ['brightness', 'contrast', 'saturation'].forEach(type => {
            const slider = document.getElementById(`${type}Slider`);
            if (slider) {
                slider.oninput = () => {
                    const value = slider.value;
                    slider.nextElementSibling.textContent = value + '%';
                    colorSettings[type] = parseInt(value);
                    updateColorPreview();
                };
            }
        });
        
        // 적용 버튼
        document.getElementById('applyColorBtn').onclick = () => {
            applyColorSettings();
            document.getElementById('colorModeModal').remove();
        };
        
        // 리셋 버튼
        document.getElementById('resetColorBtn').onclick = () => {
            selectColorPalette('default');
        };
    }
    
    // ========== 설정 적용 함수들 ==========
    function applyFontPreset(presetKey) {
        const preset = fontPresets[presetKey];
        if (!preset) return;
        
        Object.assign(fontSettings, preset);
        fontSettings.preset = presetKey;
        
        // UI 업데이트
        Object.keys(preset).forEach(key => {
            const slider = document.getElementById(`${key}FontSlider`);
            if (slider) {
                slider.value = preset[key];
                slider.nextElementSibling.textContent = preset[key] + 'px';
            }
        });
        
        updateFontPreview();
    }
    
    function selectColorPalette(paletteKey) {
        const palette = colorPalettes[paletteKey];
        if (!palette) return;
        
        colorSettings.currentPalette = paletteKey;
        
        // UI 업데이트
        document.getElementById('pageBgColor').value = '#667eea';
        document.getElementById('calendarBgColor').value = palette.calendar;
        document.getElementById('todayBgColor').value = palette.today;
        document.getElementById('memoBgColor').value = palette.memo;
        
        updateColorPreview();
    }
    
    function updateFontPreview() {
        const preview = document.querySelector('.font-preview');
        if (!preview) return;
        
        preview.querySelector('.preview-header').style.fontSize = fontSettings.header + 'px';
        preview.querySelector('.preview-weekday').style.fontSize = fontSettings.weekday + 'px';
        preview.querySelector('.preview-date').style.fontSize = fontSettings.calendar + 'px';
        preview.querySelector('.preview-memo').style.fontSize = fontSettings.memo + 'px';
        preview.querySelector('.preview-button').style.fontSize = fontSettings.button + 'px';
    }
    
    function updateColorPreview() {
        // 실시간 미리보기 업데이트 로직
        const preview = document.querySelector('.color-preview');
        if (!preview) return;
        
        const palette = colorPalettes[colorSettings.currentPalette];
        if (!palette) return;
        
        const previewCalendar = preview.querySelector('.preview-calendar');
        previewCalendar.style.background = palette.calendar;
        
        const today = preview.querySelector('.today');
        today.style.background = palette.today;
        
        const memo = preview.querySelector('.memo');
        memo.style.background = palette.memo;
    }
    
    function applyFontSettings() {
        // localStorage에 저장
        Object.keys(fontSettings).forEach(key => {
            localStorage.setItem(key === 'preset' ? 'fontPreset' : key + 'FontSize', fontSettings[key]);
        });
        
        // 실제 페이지에 적용
        document.documentElement.style.setProperty('--base-font-size', fontSettings.global + 'px');
        
        // 각 요소별 적용
        document.querySelectorAll('.day-number').forEach(elem => {
            elem.style.fontSize = fontSettings.calendar + 'px';
            if (localStorage.getItem('boldDates') === 'true') {
                elem.style.fontWeight = 'bold';
            }
        });
        
        document.querySelectorAll('.weekday').forEach(elem => {
            elem.style.fontSize = fontSettings.weekday + 'px';
        });
        
        const header = document.querySelector('#monthYear');
        if (header) {
            header.style.fontSize = fontSettings.header + 'px';
        }
        
        // 폰트 스무딩 적용
        if (localStorage.getItem('fontSmoothing') === 'true') {
            document.body.style.webkitFontSmoothing = 'antialiased';
            document.body.style.mozOsxFontSmoothing = 'grayscale';
        }
        
        // 와이드 뷰 적용
        const wideViewEnabled = localStorage.getItem('wideView') === 'true';
        applyWideView(wideViewEnabled);
        
        showNotification('글자 크기 설정이 적용되었습니다');
    }
    
    function applyColorSettings() {
        const palette = colorPalettes[colorSettings.currentPalette];
        if (!palette) return;
        
        // localStorage에 저장
        localStorage.setItem('colorPalette', colorSettings.currentPalette);
        localStorage.setItem('colorBrightness', colorSettings.brightness);
        localStorage.setItem('colorContrast', colorSettings.contrast);
        localStorage.setItem('colorSaturation', colorSettings.saturation);
        
        // 페이지에 적용
        document.body.style.background = palette.background;
        document.body.style.filter = `brightness(${colorSettings.brightness}%) contrast(${colorSettings.contrast}%) saturate(${colorSettings.saturation}%)`;
        
        const container = document.querySelector('.container');
        if (container) {
            container.style.background = palette.calendar;
        }
        
        // 특수 효과 적용
        if (localStorage.getItem('shadowEffect') === 'true') {
            document.querySelectorAll('.day').forEach(elem => {
                elem.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });
        }
        
        if (localStorage.getItem('glowEffect') === 'true') {
            const today = document.querySelector('.day.today');
            if (today) {
                today.style.boxShadow = `0 0 10px ${palette.today}`;
            }
        }
        
        showNotification(`${palette.name} 색상이 적용되었습니다`);
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'advanced-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
    
    // ========== 와이드 뷰 적용 ==========
    function applyWideView(enabled) {
        const container = document.querySelector('.container');
        const calendar = document.querySelector('.calendar');
        
        if (enabled) {
            // 와이드 뷰 활성화
            if (container) {
                container.style.maxWidth = '100%';
                container.style.width = '100%';
                container.style.padding = '10px';
            }
            if (calendar) {
                calendar.style.maxWidth = '100%';
                calendar.style.width = '100%';
            }
            
            // 달력 날짜 셀 크기 조정
            document.querySelectorAll('.day').forEach(day => {
                day.style.minHeight = '100px';
                day.style.padding = '6px';
            });
            
            showNotification('와이드 뷰 모드가 활성화되었습니다');
        } else {
            // 와이드 뷰 비활성화 (기본 뷰)
            if (container) {
                container.style.maxWidth = '1200px';
                container.style.width = 'auto';
                container.style.padding = '20px';
            }
            if (calendar) {
                calendar.style.maxWidth = '1200px';
                calendar.style.width = 'auto';
            }
            
            // 달력 날짜 셀 크기 복원
            document.querySelectorAll('.day').forEach(day => {
                day.style.minHeight = '120px';
                day.style.padding = '8px 4px';
            });
            
            showNotification('기본 뷰 모드가 활성화되었습니다');
        }
        
        localStorage.setItem('wideView', enabled);
    }
    
    // ========== 전역 API 노출 ==========
    window.AdvancedControls = {
        openFontSizeModal,
        openColorModeModal,
        applyFontPreset,
        selectColorPalette,
        applyWideView,
        getFontSettings: () => fontSettings,
        getColorSettings: () => colorSettings
    };
    
    console.log('✅ 고급 컨트롤 모달 준비 완료');
    
    // 페이지 로드 시 와이드 뷰 설정 적용
    document.addEventListener('DOMContentLoaded', () => {
        const wideViewEnabled = localStorage.getItem('wideView') === 'true';
        if (wideViewEnabled) {
            applyWideView(true);
        }
    });
    
    // DOM이 이미 로드되었다면 즉시 적용
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const wideViewEnabled = localStorage.getItem('wideView') === 'true';
        if (wideViewEnabled) {
            setTimeout(() => applyWideView(true), 100);
        }
    }
    
})();