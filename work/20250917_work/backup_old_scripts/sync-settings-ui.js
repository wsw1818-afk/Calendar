// 자동 동기화 설정 UI
(function() {
    'use strict';

    /**
     * 자동 동기화 설정 모달 표시
     */
    function showSyncSettingsModal() {
        const modal = createModal('🔄 자동 동기화 설정');
        const content = modal.querySelector('.modal-body');
        
        // 현재 설정값 가져오기
        const autoSyncSystem = window.autoSyncSystem;
        const isEnabled = autoSyncSystem ? autoSyncSystem.isEnabled() : false;
        const intervalMinutes = autoSyncSystem ? autoSyncSystem.getInterval() : 5;
        const customFileName = autoSyncSystem ? autoSyncSystem.getCustomFileName() : '';
        const lastSyncTime = autoSyncSystem ? autoSyncSystem.getLastSyncTime() : 0;
        
        content.innerHTML = `
            <div style="padding: 20px;">
                <!-- 현재 상태 -->
                <div style="background: ${isEnabled ? '#e8f5e8' : '#fff3cd'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid ${isEnabled ? '#4caf50' : '#ffc107'};">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 24px; margin-right: 12px;">${isEnabled ? '✅' : '⚠️'}</span>
                        <h3 style="margin: 0; color: #2c3e50;">자동 동기화 ${isEnabled ? '활성화' : '비활성화'}</h3>
                    </div>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        ${isEnabled ? 
                            `메모가 변경될 때마다 구글 드라이브에 자동으로 백업됩니다. (${intervalMinutes}분 간격)` :
                            '자동 동기화가 비활성화되어 있습니다. 수동으로 백업해야 합니다.'
                        }
                    </p>
                    ${lastSyncTime > 0 ? `
                        <div style="margin-top: 10px; font-size: 13px; color: #555;">
                            <strong>마지막 동기화:</strong> ${new Date(lastSyncTime).toLocaleString('ko-KR')}
                        </div>
                    ` : ''}
                </div>

                <!-- 기본 설정 -->
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">🔧</span>
                        기본 설정
                    </h4>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e0e0e0; transition: all 0.2s;">
                            <input type="checkbox" id="autoSyncEnabled" ${isEnabled ? 'checked' : ''} 
                                   style="margin-right: 15px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500; color: #2c3e50; margin-bottom: 5px;">자동 동기화 활성화</div>
                                <div style="font-size: 13px; color: #666;">메모가 변경될 때 자동으로 구글 드라이브에 백업합니다</div>
                            </div>
                        </label>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2c3e50;">
                            동기화 간격 (분)
                        </label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <input type="range" id="syncIntervalSlider" 
                                   min="1" max="60" value="${intervalMinutes}" 
                                   style="flex: 1; height: 6px; background: #ddd; border-radius: 3px; outline: none; -webkit-appearance: none;">
                            <div style="background: #3498db; color: white; padding: 8px 15px; border-radius: 6px; min-width: 60px; text-align: center; font-weight: 500;" id="intervalDisplay">
                                ${intervalMinutes}분
                            </div>
                        </div>
                        <small style="color: #7f8c8d; font-size: 12px; margin-top: 5px; display: block;">
                            변경 후 최소 대기 시간. 너무 짧으면 구글 API 제한에 걸릴 수 있습니다.
                        </small>
                    </div>
                </div>

                <!-- 파일명 설정 -->
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📝</span>
                        파일명 설정
                    </h4>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #2c3e50;">
                            사용자 지정 파일명 접두사 <small style="color: #7f8c8d;">(선택사항)</small>
                        </label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="customFileNamePrefix" 
                                   value="${customFileName}" 
                                   placeholder="예: 내-달력-메모, 회사-업무-일정"
                                   style="flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
                            <button onclick="window.previewFileName()" 
                                    style="background: #3498db; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; white-space: nowrap;">
                                미리보기
                            </button>
                        </div>
                        <small style="color: #7f8c8d; font-size: 12px; margin-top: 5px; display: block;">
                            비어있으면 기본 파일명 형식을 사용합니다: "달력메모-변경-YYYY-MM-DD-HHMMSS.json"
                        </small>
                        <div id="fileNamePreview" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-family: monospace; font-size: 13px; color: #555; display: none;"></div>
                    </div>
                </div>

                <!-- 고급 설정 -->
                <div style="margin-bottom: 30px;">
                    <details style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                        <summary style="cursor: pointer; font-weight: 500; color: #2c3e50; display: flex; align-items: center;">
                            <span style="margin-right: 10px;">⚙️</span>
                            고급 설정
                        </summary>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; cursor: pointer;">
                                    <input type="checkbox" id="instantSync" 
                                           style="margin-right: 10px; transform: scale(1.1);">
                                    <div>
                                        <div style="font-weight: 500; color: #2c3e50;">즉시 동기화</div>
                                        <div style="font-size: 13px; color: #666;">메모 변경 시 대기시간 없이 즉시 백업 (권장하지 않음)</div>
                                    </div>
                                </label>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; cursor: pointer;">
                                    <input type="checkbox" id="silentMode" checked
                                           style="margin-right: 10px; transform: scale(1.1);">
                                    <div>
                                        <div style="font-weight: 500; color: #2c3e50;">조용한 모드</div>
                                        <div style="font-size: 13px; color: #666;">자동 동기화 시 알림을 최소화합니다</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </details>
                </div>

                <!-- 동기화 테스트 -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h4 style="margin-bottom: 15px; color: #2c3e50; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">🧪</span>
                        동기화 테스트
                    </h4>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button onclick="window.testSyncConnection()" 
                                style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            연결 테스트
                        </button>
                        <button onclick="window.performTestSync()" 
                                style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            수동 동기화 실행
                        </button>
                        <button onclick="window.viewSyncHistory()" 
                                style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            동기화 기록
                        </button>
                    </div>
                    <div id="testResult" style="padding: 10px; border-radius: 6px; font-size: 14px; display: none;"></div>
                </div>

                <!-- 버튼 영역 -->
                <div style="display: flex; gap: 15px;">
                    <button onclick="window.saveSyncSettings()" 
                            style="flex: 1; background: #28a745; color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
                        💾 설정 저장
                    </button>
                    <button onclick="window.resetSyncSettings()" 
                            style="background: #dc3545; color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        🔄 초기화
                    </button>
                    <button onclick="window.closeModal()" 
                            style="background: #6c757d; color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        취소
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // 이벤트 리스너 추가
        setupSyncSettingsEventListeners();
    }

    /**
     * 이벤트 리스너 설정
     */
    function setupSyncSettingsEventListeners() {
        // 슬라이더 이벤트
        const slider = document.getElementById('syncIntervalSlider');
        const display = document.getElementById('intervalDisplay');
        
        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                display.textContent = `${value}분`;
            });
        }

        // 체크박스 스타일링
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.closest('label');
            if (label) {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        label.style.borderColor = '#28a745';
                        label.style.background = '#f8fff8';
                    } else {
                        label.style.borderColor = '#e0e0e0';
                        label.style.background = '#f8f9fa';
                    }
                });
                
                // 초기 상태 설정
                if (checkbox.checked) {
                    label.style.borderColor = '#28a745';
                    label.style.background = '#f8fff8';
                }
            }
        });
    }

    /**
     * 파일명 미리보기
     */
    window.previewFileName = function() {
        const prefix = document.getElementById('customFileNamePrefix').value.trim();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        
        let preview;
        if (prefix) {
            preview = `${prefix}-${dateStr}-${timeStr}.json`;
        } else {
            preview = `달력메모-수정-${dateStr}-${timeStr}.json`;
        }
        
        const previewDiv = document.getElementById('fileNamePreview');
        if (previewDiv) {
            previewDiv.textContent = `미리보기: ${preview}`;
            previewDiv.style.display = 'block';
            
            setTimeout(() => {
                previewDiv.style.display = 'none';
            }, 5000);
        }
    };

    /**
     * 동기화 설정 저장
     */
    window.saveSyncSettings = function() {
        const enabled = document.getElementById('autoSyncEnabled').checked;
        const interval = parseInt(document.getElementById('syncIntervalSlider').value);
        const customPrefix = document.getElementById('customFileNamePrefix').value.trim();
        
        const autoSyncSystem = window.autoSyncSystem;
        if (!autoSyncSystem) {
            showTestResult('자동 동기화 시스템이 로드되지 않았습니다.', 'error');
            return;
        }
        
        try {
            // 설정 저장
            autoSyncSystem.toggle(enabled);
            autoSyncSystem.setSyncInterval(interval);
            autoSyncSystem.setCustomFileName(customPrefix);
            
            showTestResult('설정이 저장되었습니다!', 'success');
            
            setTimeout(() => {
                window.closeModal();
            }, 1500);
            
        } catch (error) {
            console.error('설정 저장 실패:', error);
            showTestResult('설정 저장 실패: ' + error.message, 'error');
        }
    };

    /**
     * 동기화 설정 초기화
     */
    window.resetSyncSettings = function() {
        if (!confirm('모든 동기화 설정을 초기화하시겠습니까?')) return;
        
        const autoSyncSystem = window.autoSyncSystem;
        if (!autoSyncSystem) return;
        
        try {
            // 기본값으로 재설정
            autoSyncSystem.toggle(false);
            autoSyncSystem.setSyncInterval(5);
            autoSyncSystem.setCustomFileName('');
            
            // UI 업데이트
            document.getElementById('autoSyncEnabled').checked = false;
            document.getElementById('syncIntervalSlider').value = 5;
            document.getElementById('intervalDisplay').textContent = '5분';
            document.getElementById('customFileNamePrefix').value = '';
            
            showTestResult('설정이 초기화되었습니다.', 'success');
            
        } catch (error) {
            console.error('설정 초기화 실패:', error);
            showTestResult('설정 초기화 실패: ' + error.message, 'error');
        }
    };

    /**
     * 연결 테스트
     */
    window.testSyncConnection = async function() {
        showTestResult('연결 테스트 중...', 'info');
        
        try {
            if (!window.isAuthenticated) {
                throw new Error('구글 드라이브가 연결되지 않았습니다.');
            }
            
            if (typeof window.uploadBackupWithCustomName !== 'function') {
                throw new Error('업로드 함수를 찾을 수 없습니다.');
            }
            
            // 간단한 API 호출 테스트
            if (typeof gapi !== 'undefined' && gapi.client) {
                await gapi.client.drive.about.get({ fields: 'user' });
            }
            
            showTestResult('✅ 연결 테스트 성공! 동기화가 정상적으로 작동할 것입니다.', 'success');
            
        } catch (error) {
            console.error('연결 테스트 실패:', error);
            showTestResult('❌ 연결 테스트 실패: ' + error.message, 'error');
        }
    };

    /**
     * 수동 동기화 실행
     */
    window.performTestSync = async function() {
        const autoSyncSystem = window.autoSyncSystem;
        if (!autoSyncSystem) {
            showTestResult('자동 동기화 시스템을 찾을 수 없습니다.', 'error');
            return;
        }
        
        try {
            showTestResult('수동 동기화 실행 중...', 'info');
            await autoSyncSystem.performManualSync('테스트-동기화');
            showTestResult('✅ 수동 동기화 완료!', 'success');
        } catch (error) {
            console.error('수동 동기화 실패:', error);
            showTestResult('❌ 수동 동기화 실패: ' + error.message, 'error');
        }
    };

    /**
     * 동기화 기록 보기 (간단한 구현)
     */
    window.viewSyncHistory = function() {
        const lastSync = window.autoSyncSystem ? window.autoSyncSystem.getLastSyncTime() : 0;
        const historyText = lastSync > 0 ? 
            `마지막 동기화: ${new Date(lastSync).toLocaleString('ko-KR')}` :
            '동기화 기록이 없습니다.';
            
        showTestResult(historyText, 'info');
    };

    /**
     * 테스트 결과 표시
     */
    function showTestResult(message, type) {
        const testResult = document.getElementById('testResult');
        if (!testResult) return;
        
        testResult.style.display = 'block';
        testResult.textContent = message;
        testResult.className = `test-result ${type}`;
        
        // 스타일 적용
        const colors = {
            success: { background: '#d4edda', color: '#155724', border: '#c3e6cb' },
            error: { background: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
            info: { background: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
        };
        
        const color = colors[type] || colors.info;
        Object.assign(testResult.style, color);
    }

    /**
     * 모달 생성 (기존 함수 재사용)
     */
    function createModal(title) {
        // 기존 모달이 있다면 제거
        const existingModal = document.querySelector('.sync-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'sync-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // 백드롭 클릭 시 모달 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeModal();
            }
        });

        // ESC 키로 모달 닫기
        const handleEsc = function(e) {
            if (e.key === 'Escape') {
                window.closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            background: white;
            padding: 0;
            border-radius: 12px;
            max-width: 700px;
            max-height: 90vh;
            width: 90%;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 12px 12px 0 0;
        `;
        
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${title}</h2>
            <button onclick="window.closeModal()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
        `;
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 0;
            overflow-y: auto;
            max-height: calc(90vh - 80px);
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);

        return modal;
    }

    // 전역 함수로 노출
    window.showSyncSettingsModal = showSyncSettingsModal;

    // 모달 닫기 함수 개선
    window.closeModal = function() {
        // 모든 종류의 모달 선택자 추가
        const modals = document.querySelectorAll('.sync-modal, .drive-modal, .modal, [class*="modal"]');
        modals.forEach(modal => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
        });
        
        // 백드롭 클릭으로 모달이 닫히지 않는 경우를 위한 추가 처리
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && 
                (style.zIndex > 9999 || el.style.zIndex > 9999) &&
                style.display !== 'none') {
                el.remove();
            }
        });
    };

})();