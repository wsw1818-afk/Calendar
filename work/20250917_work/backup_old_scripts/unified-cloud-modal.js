// 통합 클라우드 설정 모달
(function() {
    'use strict';
    
    // 테스트 결과 표시 함수
    function showTestResult(message, type, targetId = 'testResult') {
        // 메시지 표시 방법을 여러 방법으로 시도
        
        // 1. 지정된 ID의 요소에 표시 시도
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.style.display = 'block';
            targetElement.innerHTML = message.replace(/\n/g, '<br>');
            targetElement.className = `test-result ${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
            return;
        }
        
        // 2. 알림 시스템 사용 시도
        if (typeof window.showNotification === 'function') {
            const duration = type === 'success' ? 3000 : type === 'error' ? 5000 : 2000;
            window.showNotification(message, type, duration);
            return;
        }
        
        // 3. 콘솔 로그
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 4. 간단한 알럿 (오류인 경우만)
        if (type === 'error') {
            alert(message);
        }
    }

    /**
     * 통합 클라우드 설정 모달 표시
     */
    function showUnifiedCloudModal() {
        const modal = createUnifiedModal('☁️ 구글 드라이브 & 자동 동기화 설정');
        const content = modal.querySelector('.modal-body');
        
        // 현재 설정값 가져오기
        const isAuthenticated = window.isAuthenticated || false;
        const autoSyncSystem = window.autoSyncSystem;
        const autoSyncEnabled = autoSyncSystem ? autoSyncSystem.isEnabled() : false;
        const intervalMinutes = autoSyncSystem ? autoSyncSystem.getInterval() : 5;
        const customFileName = autoSyncSystem ? autoSyncSystem.getCustomFileName() : '';
        const lastSyncTime = autoSyncSystem ? autoSyncSystem.getLastSyncTime() : 0;
        
        // API 설정값
        const CLIENT_ID = window.CLIENT_ID || localStorage.getItem('googleDriveClientId') || '';
        const API_KEY = window.API_KEY || localStorage.getItem('googleDriveApiKey') || '';
        const isConfigured = CLIENT_ID && API_KEY && 
                           CLIENT_ID !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' && 
                           API_KEY !== 'YOUR_API_KEY_HERE';
        
        content.innerHTML = `
            <div style="padding: 25px;">
                <!-- 탭 네비게이션 -->
                <div class="tab-navigation" style="display: flex; margin-bottom: 30px; border-bottom: 2px solid #e0e0e0;">
                    <button class="tab-btn active" data-tab="connection" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #3498db; border-bottom: 3px solid #3498db; cursor: pointer; transition: all 0.3s;">
                        🔗 연결 설정
                    </button>
                    <button class="tab-btn" data-tab="sync" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #666; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.3s;">
                        🔄 자동 동기화
                    </button>
                    <button class="tab-btn" data-tab="backup" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #666; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.3s;">
                        📦 백업 관리
                    </button>
                </div>

                <!-- 연결 설정 탭 -->
                <div class="tab-content" id="connection-tab">
                    <!-- 연결 상태 -->
                    <div style="background: ${isAuthenticated ? '#e8f5e8' : '#fff3cd'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid ${isAuthenticated ? '#4caf50' : '#ffc107'};">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 28px; margin-right: 15px;">${isAuthenticated ? '✅' : isConfigured ? '⚠️' : '❌'}</span>
                            <div>
                                <h3 style="margin: 0; color: #2c3e50; margin-bottom: 5px;">
                                    ${isAuthenticated ? '구글 드라이브 연결됨' : isConfigured ? 'API 설정 완료 - 연결 대기중' : '연결되지 않음'}
                                </h3>
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    ${isAuthenticated ? 
                                        '구글 드라이브가 성공적으로 연결되어 백업이 가능합니다.' :
                                        isConfigured ? 
                                        'API 설정이 완료되었습니다. 아래 연결 버튼을 클릭하여 인증을 완료하세요.' :
                                        'API 키와 클라이언트 ID를 설정한 후 구글 드라이브에 연결하세요.'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        ${isAuthenticated ? `
                            <div style="display: flex; gap: 15px; margin-top: 15px;">
                                <button onclick="window.performQuickBackup()" 
                                        style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    📤 즉시 백업
                                </button>
                                <button onclick="window.testDriveConnection()" 
                                        style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    🧪 연결 테스트
                                </button>
                                <button onclick="window.disconnectDrive()" 
                                        style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    🔌 연결 해제
                                </button>
                            </div>
                        ` : isConfigured ? `
                            <div style="margin-top: 15px;">
                                <button onclick="window.connectToDrive()" 
                                        style="background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; margin-right: 10px;">
                                    🔐 Google Drive 인증
                                </button>
                                <button onclick="window.showManualAuthDialog()" 
                                        style="background: #f39c12; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                                    🔐 수동 인증
                                </button>
                            </div>
                        ` : `
                            <div style="margin-top: 15px; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                                <p style="margin: 0; color: #2980b9; font-weight: 500; font-size: 14px;">
                                    💡 먼저 아래의 API 설정을 완료해주세요.
                                </p>
                            </div>
                        `}
                    </div>

                    ${!isAuthenticated ? `
                    <!-- API 설정 -->
                    <div style="margin-bottom: 30px;">
                        <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                            <span style="margin-right: 10px;">🔑</span>
                            Google API 설정
                        </h4>
                        
                        <!-- 빠른 시작 가이드 -->
                        <details style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                            <summary style="cursor: pointer; font-weight: 500; color: #3498db; list-style: none;">
                                🚀 빠른 설정 가이드 (클릭하여 펼치기)
                            </summary>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                    <div style="display: flex; margin-bottom: 15px;">
                                        <div style="width: 30px; height: 30px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">1</div>
                                        <div style="flex: 1;">
                                            <strong>Google Cloud Console 접속</strong>
                                            <p style="margin: 5px 0 10px 0; color: #666; font-size: 14px;">프로젝트 생성 및 Drive API 활성화</p>
                                            <button onclick="window.open('https://console.cloud.google.com/', '_blank')" 
                                                    style="background: #4285f4; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                                                Console 열기
                                            </button>
                                        </div>
                                    </div>
                                    <div style="display: flex; margin-bottom: 15px;">
                                        <div style="width: 30px; height: 30px; background: #27ae60; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">2</div>
                                        <div style="flex: 1;">
                                            <strong>OAuth 2.0 클라이언트 ID 생성</strong>
                                            <p style="margin: 5px 0; color: #666; font-size: 14px;">웹 애플리케이션 유형으로 생성, 현재 도메인을 승인된 JavaScript 원본에 추가</p>
                                        </div>
                                    </div>
                                    <div style="display: flex;">
                                        <div style="width: 30px; height: 30px; background: #f39c12; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">3</div>
                                        <div style="flex: 1;">
                                            <strong>API 키 생성</strong>
                                            <p style="margin: 5px 0; color: #666; font-size: 14px;">브라우저 키로 생성 후 Drive API로 제한</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                        
                        <div class="form-group" style="margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                🔑 클라이언트 ID <span style="color: #e74c3c; font-size: 12px;">*필수</span>
                            </label>
                            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                                <input type="text" id="clientId" 
                                       style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px; font-family: monospace;" 
                                       placeholder="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                                       value="${CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' ? '' : CLIENT_ID}">
                                <button onclick="window.pasteFromClipboard('clientId')" 
                                        style="background: #95a5a6; color: white; border: none; padding: 14px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                    📋 붙여넣기
                                </button>
                            </div>
                            <small style="color: #7f8c8d; font-size: 12px;">OAuth 2.0 클라이언트 ID (웹 애플리케이션 유형)</small>
                        </div>

                        <div class="form-group" style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                🗝️ API 키 <span style="color: #e74c3c; font-size: 12px;">*필수</span>
                            </label>
                            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                                <input type="password" id="apiKey" 
                                       style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px; font-family: monospace;" 
                                       placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                       value="${API_KEY === 'YOUR_API_KEY_HERE' ? '' : API_KEY}">
                                <button onclick="window.pasteFromClipboard('apiKey')" 
                                        style="background: #95a5a6; color: white; border: none; padding: 14px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                    📋 붙여넣기
                                </button>
                            </div>
                            <small style="color: #7f8c8d; font-size: 12px;">Google Drive API 키 (브라우저 키 권장)</small>
                        </div>

                        <!-- API 설정 테스트 및 저장 -->
                        <div style="text-align: center; margin-bottom: 25px;">
                            <button onclick="window.testAPISettings()" 
                                    style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 15px 35px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; margin-right: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                🧪 API 연결 테스트
                            </button>
                            <button onclick="window.saveAPISettings()" 
                                    style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 15px 35px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; margin-right: 15px; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                                💾 설정 저장
                            </button>
                            <button onclick="window.diagnoseConnection()" 
                                    style="background: linear-gradient(135deg, #e67e22, #f39c12); color: white; border: none; padding: 15px 35px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);">
                                🔍 연결 진단
                            </button>
                        </div>
                        
                        <div id="apiTestResult" style="padding: 15px; border-radius: 8px; font-size: 14px; font-weight: 500; display: none; margin-top: 15px;"></div>
                    </div>
                    ` : ''}
                </div>

                <!-- 자동 동기화 탭 -->
                <div class="tab-content" id="sync-tab" style="display: none;">
                    <!-- 동기화 상태 -->
                    <div style="background: ${autoSyncEnabled ? '#e8f5e8' : '#fff3cd'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid ${autoSyncEnabled ? '#4caf50' : '#ffc107'};">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 28px; margin-right: 15px;">${autoSyncEnabled ? '✅' : '⏸️'}</span>
                            <div>
                                <h3 style="margin: 0; color: #2c3e50; margin-bottom: 5px;">자동 동기화 ${autoSyncEnabled ? '활성화' : '비활성화'}</h3>
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    ${autoSyncEnabled ? 
                                        `메모 변경 시 자동으로 구글 드라이브에 백업됩니다. (${intervalMinutes}분 간격)` :
                                        '자동 동기화가 비활성화되어 있습니다. 수동으로 백업해야 합니다.'
                                    }
                                </p>
                                ${lastSyncTime > 0 ? `
                                    <div style="margin-top: 8px; font-size: 13px; color: #555; background: rgba(255,255,255,0.7); padding: 5px 10px; border-radius: 15px; display: inline-block;">
                                        <strong>마지막 동기화:</strong> ${new Date(lastSyncTime).toLocaleString('ko-KR')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    ${!isAuthenticated ? `
                        <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">먼저 구글 드라이브 연결이 필요합니다</h3>
                            <p style="color: #666; margin-bottom: 20px;">자동 동기화 기능을 사용하려면 먼저 '연결 설정' 탭에서 구글 드라이브를 연결해주세요.</p>
                            <button onclick="window.switchToTab('connection')" 
                                    style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
                                📡 연결 설정으로 이동
                            </button>
                        </div>
                    ` : `
                        <!-- 동기화 설정 -->
                        <div style="margin-bottom: 30px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">⚙️</span>
                                동기화 및 백업 설정
                            </h4>
                            
                            <div style="margin-bottom: 25px;">
                                <label style="display: flex; align-items: center; cursor: pointer; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid ${autoSyncEnabled ? '#27ae60' : '#e0e0e0'}; transition: all 0.3s;">
                                    <input type="checkbox" id="autoSyncEnabled" ${autoSyncEnabled ? 'checked' : ''} 
                                           style="margin-right: 20px; transform: scale(1.3);">
                                    <div>
                                        <div style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">🔄 자동 동기화 활성화</div>
                                        <div style="font-size: 14px; color: #666;">메모가 변경될 때 자동으로 구글 드라이브에 백업합니다</div>
                                    </div>
                                </label>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                    ⏱️ 동기화 간격
                                </label>
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                                        <input type="range" id="syncIntervalSlider" 
                                               min="1" max="60" value="${intervalMinutes}" 
                                               style="flex: 1; height: 8px; background: #ddd; border-radius: 4px; outline: none; -webkit-appearance: none;">
                                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; border-radius: 8px; min-width: 80px; text-align: center; font-weight: 600; font-size: 16px;" id="intervalDisplay">
                                            ${intervalMinutes}분
                                        </div>
                                    </div>
                                    <small style="color: #7f8c8d; font-size: 13px;">
                                        💡 변경 후 최소 대기 시간입니다. 너무 짧으면 Google API 제한에 걸릴 수 있습니다.
                                    </small>
                                </div>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                    📝 파일명 접두사 <small style="color: #7f8c8d; font-weight: normal;">(선택사항)</small>
                                </label>
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                                    <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                                        <input type="text" id="customFileNamePrefix" 
                                               value="${customFileName}" 
                                               placeholder="예: 내-달력-메모, 회사-업무-일정, 개인-일정-백업"
                                               style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px;">
                                        <button onclick="window.previewSyncFileName()" 
                                                style="background: #3498db; color: white; border: none; padding: 14px 20px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                            👁️ 미리보기
                                        </button>
                                    </div>
                                    <small style="color: #7f8c8d; font-size: 12px;">
                                        비어있으면 기본 형식을 사용합니다: "달력메모-변경-YYYY-MM-DD-HHMMSS.json"
                                    </small>
                                    <div id="fileNamePreview" style="margin-top: 12px; padding: 12px; background: white; border-radius: 6px; font-family: monospace; font-size: 13px; color: #2c3e50; display: none; border: 1px dashed #3498db;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 동기화 테스트 -->
                        <div style="background: #ecf0f1; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">🧪</span>
                                동기화 테스트
                            </h4>
                            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                                <button onclick="window.testSyncConnection()" 
                                        style="background: #17a2b8; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    🔍 연결 테스트
                                </button>
                                <button onclick="window.performTestSync()" 
                                        style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    🚀 수동 동기화
                                </button>
                                <button onclick="window.viewSyncHistory()" 
                                        style="background: #6c757d; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    📊 동기화 기록
                                </button>
                            </div>
                            
                            <!-- 자동 백업 설정 섹션 -->
                            <div style="margin-top: 30px; padding: 20px; background: #f1f8ff; border-radius: 12px; border: 2px solid #e3f2fd;">
                                <h5 style="margin: 0 0 15px 0; color: #1565c0; display: flex; align-items: center;">
                                    <span style="margin-right: 8px;">📦</span>
                                    자동 백업 (5분마다)
                                </h5>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" id="autoBackupEnabled" ${autoSyncSystem && autoSyncSystem.getBackupStatus ? autoSyncSystem.getBackupStatus().autoBackupEnabled : true} 
                                               style="margin-right: 12px; transform: scale(1.2);">
                                        <span style="font-weight: 500; color: #2c3e50;">📦 5분마다 자동으로 클라우드에 백업</span>
                                    </label>
                                    <div style="margin-top: 8px; font-size: 12px; color: #666; margin-left: 32px;">
                                        메모나 일정이 변경되면 5분 후 자동으로 Google Drive에 백업됩니다.
                                    </div>
                                </div>
                                
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                                    <button onclick="window.performManualBackup()" 
                                            style="background: #8e44ad; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                        📦 지금 백업
                                    </button>
                                    <button onclick="window.checkCloudBackups()" 
                                            style="background: #e67e22; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                        📥 클라우드에서 복원
                                    </button>
                                    <button onclick="window.viewBackupStatus()" 
                                            style="background: #34495e; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                        📊 백업 상태
                                    </button>
                                </div>
                                
                                <div id="backupStatus" style="margin-top: 15px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-radius: 8px; font-size: 13px; color: #2980b9; display: none;">
                                    백업 상태를 확인 중...
                                </div>
                            </div>
                            
                            <div id="syncTestResult" style="padding: 15px; border-radius: 8px; font-size: 14px; font-weight: 500; display: none;"></div>
                        </div>
                    `}
                </div>

                <!-- 백업 관리 탭 -->
                <div class="tab-content" id="backup-tab" style="display: none;">
                    ${!isAuthenticated ? `
                        <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">먼저 구글 드라이브 연결이 필요합니다</h3>
                            <p style="color: #666; margin-bottom: 20px;">백업 관리 기능을 사용하려면 먼저 '연결 설정' 탭에서 구글 드라이브를 연결해주세요.</p>
                            <button onclick="window.switchToTab('connection')" 
                                    style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
                                📡 연결 설정으로 이동
                            </button>
                        </div>
                    ` : `
                        <!-- 현재 메모 정보 -->
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <h3 style="margin: 0 0 10px 0; font-size: 20px;">📊 현재 메모 상태</h3>
                                    <div style="font-size: 16px; opacity: 0.9;">
                                        <span id="currentMemoCount" style="font-weight: 600;">계산 중...</span>개의 메모가 저장되어 있습니다
                                    </div>
                                    ${lastSyncTime > 0 ? `
                                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                                            마지막 백업: ${new Date(lastSyncTime).toLocaleString('ko-KR')}
                                        </div>
                                    ` : `
                                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                                            아직 백업된 적이 없습니다
                                        </div>
                                    `}
                                </div>
                                <div style="font-size: 48px; opacity: 0.3;">📝</div>
                            </div>
                        </div>

                        <!-- 백업 액션 -->
                        <div style="margin-bottom: 30px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">📤</span>
                                백업 실행
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                                <button onclick="window.performQuickBackup()" 
                                        style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 20px; border-radius: 12px; cursor: pointer; text-align: left; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                                    <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
                                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 5px;">즉시 백업</div>
                                    <div style="font-size: 13px; opacity: 0.9;">현재 메모를 즉시 백업합니다</div>
                                </button>
                                <button onclick="window.showCustomBackupModal()" 
                                        style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; padding: 20px; border-radius: 12px; cursor: pointer; text-align: left; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">
                                    <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
                                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 5px;">사용자 지정 백업</div>
                                    <div style="font-size: 13px; opacity: 0.9;">파일명을 직접 지정하여 백업</div>
                                </button>
                            </div>
                        </div>

                        <!-- 백업 복원 -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">📥</span>
                                백업 복원
                            </h4>
                            <div style="background: #fff5f5; border: 2px solid #e74c3c; border-radius: 12px; padding: 20px;">
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                                    <div>
                                        <div style="font-weight: 600; color: #c0392b; margin-bottom: 5px;">주의사항</div>
                                        <div style="color: #7f8c8d; font-size: 14px;">백업을 복원하면 현재의 모든 메모가 덮어쓰여집니다.</div>
                                    </div>
                                </div>
                                <button onclick="window.showRestoreModal()" 
                                        style="background: #e74c3c; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">
                                    📥 백업에서 복원하기
                                </button>
                            </div>
                        </div>
                    `}
                </div>

                <!-- 하단 버튼 -->
                <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e0e0e0;">
                    <button onclick="window.saveUnifiedSettings()" 
                            style="flex: 1; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 18px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                        💾 모든 설정 저장
                    </button>
                    <button onclick="closeUnifiedModal()" 
                            style="background: #95a5a6; color: white; border: none; padding: 18px 30px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 500;">
                        닫기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // 이벤트 리스너 및 초기화
        setupUnifiedModalEvents();
        updateCurrentMemoCount();
        
        // 연결 상태 실시간 모니터링 시작
        startConnectionMonitoring();
    }

    /**
     * 통합 모달 이벤트 리스너 설정
     */
    function setupUnifiedModalEvents() {
        // 탭 전환 이벤트
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                switchToTab(tabName);
            });
        });

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
        const autoSyncCheckbox = document.getElementById('autoSyncEnabled');
        if (autoSyncCheckbox) {
            const label = autoSyncCheckbox.closest('label');
            if (label) {
                autoSyncCheckbox.addEventListener('change', () => {
                    if (autoSyncCheckbox.checked) {
                        label.style.borderColor = '#27ae60';
                        label.style.background = '#f8fff8';
                    } else {
                        label.style.borderColor = '#e0e0e0';
                        label.style.background = '#f8f9fa';
                    }
                });
            }
        }
    }

    /**
     * 현재 메모 개수 업데이트
     */
    function updateCurrentMemoCount() {
        setTimeout(() => {
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
            const count = Object.keys(memos).length;
            const countEl = document.getElementById('currentMemoCount');
            if (countEl) {
                countEl.textContent = count;
            }
        }, 100);
    }

    /**
     * 연결 상태 실시간 모니터링 시작
     */
    function startConnectionMonitoring() {
        const monitoringInterval = setInterval(() => {
            // 모달이 닫혔으면 모니터링 중지
            if (!document.querySelector('.unified-modal')) {
                clearInterval(monitoringInterval);
                return;
            }
            
            updateConnectionStatus();
        }, 3000); // 3초마다 상태 확인
        
        // 초기 상태 업데이트
        updateConnectionStatus();
    }
    
    /**
     * 연결 상태 업데이트
     */
    function updateConnectionStatus() {
        // API 로딩 상태 확인
        const gapiLoaded = typeof gapi !== 'undefined';
        const gisLoaded = typeof google !== 'undefined' && google.accounts;
        const gapiInited = window.gapiInited || false;
        const gisInited = window.gisInited || false;
        const isAuthenticated = window.isAuthenticated || false;
        
        // 상태 표시 요소들 찾기
        const statusCards = document.querySelectorAll('.status-card');
        const connectionBtns = document.querySelectorAll('[onclick*="connectToDrive"], [onclick*="disconnectDrive"]');
        
        statusCards.forEach(card => {
            const icon = card.querySelector('.status-icon');
            const titleEl = card.querySelector('strong');
            const descEl = card.querySelector('p');
            
            if (!icon || !titleEl || !descEl) return;
            
            if (isAuthenticated) {
                // 연결됨
                card.style.background = '#e8f5e8';
                card.style.borderColor = '#4caf50';
                icon.textContent = '✅';
                titleEl.textContent = '구글 드라이브 연결됨';
                descEl.textContent = '구글 드라이브가 성공적으로 연결되어 백업이 가능합니다.';
            } else if (!gapiLoaded || !gisLoaded) {
                // 라이브러리 로딩 안됨
                card.style.background = '#ffebee';
                card.style.borderColor = '#f44336';
                icon.textContent = '❌';
                titleEl.textContent = '라이브러리 로딩 실패';
                descEl.textContent = 'Google API 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.';
            } else if (!gapiInited || !gisInited) {
                // 초기화 중
                card.style.background = '#e3f2fd';
                card.style.borderColor = '#2196f3';
                icon.textContent = '🔄';
                titleEl.textContent = 'API 초기화 중';
                descEl.textContent = 'Google API를 초기화하고 있습니다. 잠시만 기다려주세요.';
            } else {
                const clientId = localStorage.getItem('googleDriveClientId');
                const apiKey = localStorage.getItem('googleDriveApiKey');
                
                if (!clientId || !apiKey) {
                    // 설정 필요
                    card.style.background = '#fff3cd';
                    card.style.borderColor = '#ffc107';
                    icon.textContent = '⚙️';
                    titleEl.textContent = 'API 설정 필요';
                    descEl.textContent = 'API 키와 클라이언트 ID를 설정한 후 구글 드라이브에 연결하세요.';
                } else {
                    // 연결 대기
                    card.style.background = '#fff3cd';
                    card.style.borderColor = '#ffc107';
                    icon.textContent = '⚠️';
                    titleEl.textContent = 'API 설정 완료 - 연결 대기중';
                    descEl.textContent = 'API 설정이 완료되었습니다. 아래 연결 버튼을 클릭하여 인증을 완료하세요.';
                }
            }
        });
        
        // 연결 버튼 상태 업데이트
        connectionBtns.forEach(btn => {
            if (isAuthenticated) {
                if (btn.onclick && btn.onclick.toString().includes('connectToDrive')) {
                    btn.style.display = 'none';
                }
                if (btn.onclick && btn.onclick.toString().includes('disconnectDrive')) {
                    btn.style.display = 'inline-block';
                }
            } else {
                if (btn.onclick && btn.onclick.toString().includes('connectToDrive')) {
                    btn.style.display = 'inline-block';
                    btn.disabled = !gapiInited || !gisInited;
                }
                if (btn.onclick && btn.onclick.toString().includes('disconnectDrive')) {
                    btn.style.display = 'none';
                }
            }
        });
    }

    /**
     * 탭 전환 함수
     */
    window.switchToTab = function(tabName) {
        // 모든 탭 버튼 비활성화
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.style.color = '#666';
            btn.style.borderBottom = '3px solid transparent';
        });

        // 모든 탭 내용 숨기기
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        // 선택된 탭 활성화
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-tab`);
        
        if (selectedBtn) {
            selectedBtn.style.color = '#3498db';
            selectedBtn.style.borderBottom = '3px solid #3498db';
        }
        
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
    };

    /**
     * 통합 모달 생성
     */
    function createUnifiedModal(title) {
        console.log('🔧 [수정된 버전] createUnifiedModal 함수 실행 중 - 안전한 모달 제거 로직');
        // 기존 통합 클라우드 모달만 제거 (다른 모달은 유지)
        const existingUnifiedModals = document.querySelectorAll('.unified-modal, .sync-modal, .drive-modal');
        console.log('🔍 제거 대상 모달들:', existingUnifiedModals.length, '개 발견');
        existingUnifiedModals.forEach(modal => {
            if (modal && modal.parentNode) {
                console.log(`🚪 통합 클라우드 모달 제거: ${modal.className}`);
                modal.remove();
            }
        });
        
        const modal = document.createElement('div');
        modal.className = 'unified-modal';
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
            z-index: 10000;
            backdrop-filter: blur(2px);
        `;

        // 백드롭 클릭 및 ESC 키 이벤트
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeModal();
            }
        });

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
            border-radius: 16px;
            max-width: 900px;
            max-height: 90vh;
            width: 95%;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
        `;
        
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">
                ${title}
            </h2>
            <button onclick="closeUnifiedModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; padding: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">×</button>
        `;
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 0;
            overflow-y: auto;
            max-height: calc(90vh - 100px);
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);

        return modal;
    }

    /**
     * 클립보드에서 붙여넣기
     */
    window.pasteFromClipboard = async function(fieldId) {
        try {
            const text = await navigator.clipboard.readText();
            const field = document.getElementById(fieldId);
            if (field && text.trim()) {
                field.value = text.trim();
                showTestResult(`✅ ${fieldId === 'clientId' ? '클라이언트 ID' : 'API 키'}가 붙여넣기되었습니다.`, 'success', 'apiTestResult');
            }
        } catch (error) {
            console.error('클립보드 읽기 실패:', error);
            showTestResult('❌ 클립보드 읽기 실패. 직접 입력해주세요.', 'error', 'apiTestResult');
        }
    };

    /**
     * 파일명 미리보기
     */
    window.previewSyncFileName = function() {
        const customFileNameInput = document.getElementById('customFileNamePrefix');
        const previewDiv = document.getElementById('fileNamePreview');
        
        if (!customFileNameInput || !previewDiv) return;
        
        const prefix = customFileNameInput.value.trim();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        
        let fileName;
        if (prefix) {
            fileName = `${prefix}-${dateStr}-${timeStr}.json`;
        } else {
            fileName = `달력메모-변경-${dateStr}-${timeStr}.json`;
        }
        
        previewDiv.innerHTML = `<strong>파일명 미리보기:</strong><br>${fileName}`;
        previewDiv.style.display = 'block';
    };

    /**
     * 수동 동기화 테스트
     */
    window.performTestSync = async function() {
        try {
            showTestResult('🧪 수동 동기화 테스트 시작...', 'info', 'syncTestResult');
            
            if (!window.isAuthenticated) {
                showTestResult('❌ 구글 드라이브가 연결되지 않았습니다.', 'error', 'syncTestResult');
                return;
            }
            
            if (typeof window.performQuickBackup !== 'function') {
                showTestResult('❌ 백업 함수를 찾을 수 없습니다.', 'error', 'syncTestResult');
                return;
            }
            
            // 빠른 백업 실행
            await window.performQuickBackup();
            showTestResult('✅ 수동 동기화 테스트 완료!', 'success', 'syncTestResult');
            
        } catch (error) {
            console.error('수동 동기화 테스트 실패:', error);
            showTestResult(`❌ 테스트 실패: ${error.message}`, 'error', 'syncTestResult');
        }
    };

    /**
     * 통합 설정 저장 함수
     */
    window.saveUnifiedSettings = function() {
        try {
            console.log('💾 통합 설정 저장 시작...');
            
            let savedSettings = [];
            let hasChanges = false;
            
            // API 설정 저장 (연결 설정 탭)
            const clientIdInput = document.getElementById('clientId');
            const apiKeyInput = document.getElementById('apiKey');
            
            if (clientIdInput && apiKeyInput) {
                const clientId = clientIdInput.value.trim();
                const apiKey = apiKeyInput.value.trim();
                
                if (clientId && apiKey) {
                    const currentClientId = localStorage.getItem('googleDriveClientId');
                    const currentApiKey = localStorage.getItem('googleDriveApiKey');
                    
                    if (clientId !== currentClientId || apiKey !== currentApiKey) {
                        localStorage.setItem('googleDriveClientId', clientId);
                        localStorage.setItem('googleDriveApiKey', apiKey);
                        window.CLIENT_ID = clientId;
                        window.API_KEY = apiKey;
                        savedSettings.push('🔑 API 설정');
                        hasChanges = true;
                    }
                }
            }
            
            // 자동 동기화 설정 저장 (동기화 탭)
            const autoSyncCheckbox = document.getElementById('autoSyncEnabled');
            const syncIntervalSlider = document.getElementById('syncIntervalSlider');
            const customFileNameInput = document.getElementById('customFileNamePrefix');
            
            if (autoSyncCheckbox) {
                const isEnabled = autoSyncCheckbox.checked;
                const currentEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
                
                if (isEnabled !== currentEnabled) {
                    localStorage.setItem('autoSyncEnabled', isEnabled.toString());
                    savedSettings.push('🔄 자동 동기화 활성화 상태');
                    hasChanges = true;
                    
                    // 자동 동기화 시스템에 변경사항 적용
                    if (window.autoSyncSystem) {
                        window.autoSyncSystem.toggle(isEnabled);
                    }
                }
            }
            
            if (syncIntervalSlider) {
                const intervalMinutes = parseInt(syncIntervalSlider.value);
                const intervalMs = intervalMinutes * 60 * 1000;
                const currentInterval = parseInt(localStorage.getItem('syncInterval') || '300000');
                
                if (intervalMs !== currentInterval) {
                    localStorage.setItem('syncInterval', intervalMs.toString());
                    savedSettings.push('⏱️ 동기화 간격');
                    hasChanges = true;
                    
                    // 자동 동기화 시스템에 간격 변경 적용 (재시작 필요)
                    if (window.autoSyncSystem) {
                        // 간격 변경은 시스템 재시작 필요
                        console.log('🔄 동기화 간격 변경됨:', intervalMs / 60000, '분');
                    }
                }
            }
            
            if (customFileNameInput) {
                const customFileName = customFileNameInput.value.trim();
                const currentFileName = localStorage.getItem('customFileName') || '';
                
                if (customFileName !== currentFileName) {
                    localStorage.setItem('customFileName', customFileName);
                    savedSettings.push('📝 파일명 접두사');
                    hasChanges = true;
                    
                    // 자동 동기화 시스템에 파일명 변경 적용
                    if (window.autoSyncSystem) {
                        window.autoSyncSystem.setCustomFileName(customFileName);
                    }
                }
            }
            
            // 결과 표시
            if (hasChanges && savedSettings.length > 0) {
                const message = `✅ 설정이 저장되었습니다!\n\n저장된 항목:\n${savedSettings.map(item => `• ${item}`).join('\n')}`;
                
                // 사용자에게 알림
                if (typeof window.showNotification === 'function') {
                    window.showNotification('💾 설정이 저장되었습니다!', 'success', 3000);
                }
                
                // 테스트 결과 영역에 표시
                showTestResult(message, 'success', 'apiTestResult');
                showTestResult(message, 'success', 'syncTestResult');
                
                console.log('✅ 통합 설정 저장 완료:', savedSettings);

                // 설정이 API 관련이라면 새로고침 제안
                const needsReload = savedSettings.some(setting => setting.includes('API'));
                if (needsReload) {
                    setTimeout(() => {
                        if (confirm('API 설정이 변경되었습니다. 변경사항을 적용하려면 페이지를 새로고침해야 합니다.\n지금 새로고침하시겠습니까?')) {
                            location.reload();
                        }
                    }, 2000);
                } else {
                    // API 설정이 아닌 일반 설정만 변경된 경우 모달 닫기
                    setTimeout(() => {
                        closeUnifiedModal();
                    }, 1500);
                }
                
            } else {
                const message = '💡 변경된 설정이 없습니다.';
                showTestResult(message, 'info', 'apiTestResult');
                showTestResult(message, 'info', 'syncTestResult');
                console.log('💡 변경된 설정 없음');

                // 변경된 설정이 없는 경우에도 모달 닫기
                setTimeout(() => {
                    closeUnifiedModal();
                }, 1000);
            }
            
        } catch (error) {
            console.error('설정 저장 실패:', error);
            const errorMessage = `❌ 설정 저장 실패: ${error.message}`;
            showTestResult(errorMessage, 'error', 'apiTestResult');
            showTestResult(errorMessage, 'error', 'syncTestResult');
        }
    };

    // 전역 함수로 노출
    window.showUnifiedCloudModal = showUnifiedCloudModal;

    // 기존 개별 모달 함수들을 통합 모달로 리다이렉션
    window.showCloudSettingsModal = showUnifiedCloudModal;
    window.showSyncSettingsModal = showUnifiedCloudModal;
    
    // 드라이브 버튼도 통합 모달로 연결
    setTimeout(() => {
        const driveBtn = document.getElementById('driveBtn');
        if (driveBtn) {
            driveBtn.onclick = showUnifiedCloudModal;
            driveBtn.textContent = '☁️ 클라우드 설정';
        }
    }, 1000);

    /**
     * 연결 진단 함수
     */
    window.diagnoseConnection = function() {
        showTestResult('시스템 진단을 시작합니다...', 'info', 'apiTestResult');
        
        let diagnostics = [];
        
        // 1. Google API 라이브러리 로딩 확인
        if (typeof gapi === 'undefined') {
            diagnostics.push('❌ Google API 라이브러리가 로드되지 않았습니다.');
        } else {
            diagnostics.push('✅ Google API 라이브러리가 로드되었습니다.');
        }
        
        // 2. Google Identity Services 확인
        if (typeof google === 'undefined' || !google.accounts) {
            diagnostics.push('❌ Google Identity Services가 로드되지 않았습니다.');
        } else {
            diagnostics.push('✅ Google Identity Services가 로드되었습니다.');
        }
        
        // 3. 설정 확인
        const clientId = localStorage.getItem('googleDriveClientId');
        const apiKey = localStorage.getItem('googleDriveApiKey');
        
        if (!clientId) {
            diagnostics.push('❌ 클라이언트 ID가 저장되지 않았습니다.');
        } else {
            diagnostics.push('✅ 클라이언트 ID가 저장되어 있습니다.');
            
            if (!clientId.includes('.apps.googleusercontent.com')) {
                diagnostics.push('⚠️ 클라이언트 ID 형식이 올바르지 않을 수 있습니다.');
            }
        }
        
        if (!apiKey) {
            diagnostics.push('❌ API 키가 저장되지 않았습니다.');
        } else {
            diagnostics.push('✅ API 키가 저장되어 있습니다.');
            
            if (!apiKey.startsWith('AIza')) {
                diagnostics.push('⚠️ API 키 형식이 올바르지 않을 수 있습니다.');
            }
        }
        
        // 4. 초기화 상태 확인
        if (typeof window.gapiInited !== 'undefined') {
            if (window.gapiInited) {
                diagnostics.push('✅ Google API가 초기화되었습니다.');
            } else {
                diagnostics.push('❌ Google API 초기화가 완료되지 않았습니다.');
            }
        } else {
            diagnostics.push('❌ Google API 초기화 상태를 확인할 수 없습니다.');
        }
        
        if (typeof window.gisInited !== 'undefined') {
            if (window.gisInited) {
                diagnostics.push('✅ Google Identity Services가 초기화되었습니다.');
            } else {
                diagnostics.push('❌ Google Identity Services 초기화가 완료되지 않았습니다.');
            }
        } else {
            diagnostics.push('❌ Google Identity Services 초기화 상태를 확인할 수 없습니다.');
        }
        
        // 5. 인증 상태 확인
        if (typeof window.isAuthenticated !== 'undefined' && window.isAuthenticated) {
            diagnostics.push('✅ 구글 드라이브에 인증되어 있습니다.');
        } else {
            diagnostics.push('❌ 구글 드라이브 인증이 필요합니다.');
        }
        
        // 6. 토큰 클라이언트 확인
        if (typeof window.tokenClient !== 'undefined' && window.tokenClient) {
            diagnostics.push('✅ Token Client가 초기화되어 있습니다.');
        } else {
            diagnostics.push('❌ Token Client가 초기화되지 않았습니다.');
        }
        
        // 진단 결과 표시
        const diagnosticsText = diagnostics.join(' ');
        const needsForceInit = diagnosticsText.includes('초기화 상태를 확인할 수 없습니다') || 
                              diagnosticsText.includes('초기화가 완료되지 않았습니다');
        
        const resultHtml = `
            <div style="text-align: left;">
                <strong>🔍 시스템 진단 결과:</strong><br><br>
                ${diagnostics.map(item => `${item}<br>`).join('')}
                <br>
                <strong>💡 추천 해결 방법:</strong><br>
                ${getRecommendations(diagnostics).map(item => `• ${item}<br>`).join('')}
                ${needsForceInit ? `<br>
                <button onclick="window.forceInitializeAPIs()" 
                        style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; margin-top: 10px;">
                    🔧 강제 초기화 실행
                </button>` : ''}
            </div>
        `;
        
        showTestResult(resultHtml, 'info', 'apiTestResult');
    };
    
    /**
     * 진단 결과에 따른 추천사항 생성
     */
    function getRecommendations(diagnostics) {
        const recommendations = [];
        const diagnosticsText = diagnostics.join(' ');
        
        if (diagnosticsText.includes('Google API 라이브러리가 로드되지 않았습니다')) {
            recommendations.push('페이지를 새로고침하여 Google API 라이브러리를 다시 로드하세요.');
        }
        
        if (diagnosticsText.includes('설정되지 않았습니다')) {
            recommendations.push('위의 입력 필드에 클라이언트 ID와 API 키를 입력한 후 "설정 저장" 버튼을 클릭하세요.');
        }
        
        if (diagnosticsText.includes('초기화가 완료되지 않았습니다')) {
            recommendations.push('잠시 기다린 후 다시 시도하거나 페이지를 새로고침하세요.');
        }
        
        if (diagnosticsText.includes('형식이 올바르지 않을 수 있습니다')) {
            recommendations.push('Google Cloud Console에서 올바른 클라이언트 ID와 API 키를 다시 복사하세요.');
        }
        
        if (diagnosticsText.includes('인증이 필요합니다')) {
            recommendations.push('모든 설정이 완료되면 "구글 드라이브 연결" 버튼을 클릭하세요.');
        }
        
        if (diagnosticsText.includes('초기화 상태를 확인할 수 없습니다')) {
            recommendations.push('아래 "강제 초기화" 버튼을 클릭하여 API를 다시 초기화하세요.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('모든 설정이 정상입니다. 연결을 시도해보세요.');
        }
        
        return recommendations;
    }

    /**
     * 강제 API 초기화
     */
    window.forceInitializeAPIs = async function() {
        showTestResult('API 강제 초기화를 시작합니다...', 'info', 'apiTestResult');
        
        try {
            const clientId = localStorage.getItem('googleDriveClientId');
            const apiKey = localStorage.getItem('googleDriveApiKey');
            
            if (!clientId || !apiKey) {
                throw new Error('저장된 API 설정을 찾을 수 없습니다. 먼저 API 키와 클라이언트 ID를 설정하세요.');
            }
            
            // 전역 변수 초기화
            window.gapiInited = false;
            window.gisInited = false;
            window.isAuthenticated = false;
            window.tokenClient = null;
            
            let initResults = [];
            
            // 1. Google API 강제 초기화
            if (typeof gapi !== 'undefined') {
                try {
                    showTestResult('Google API 초기화 중...', 'info', 'apiTestResult');
                    
                    await new Promise((resolve, reject) => {
                        gapi.load('client', async () => {
                            try {
                                await gapi.client.init({
                                    apiKey: apiKey,
                                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                                });
                                window.gapiInited = true;
                                initResults.push('✅ Google API 초기화 성공');
                                resolve();
                            } catch (error) {
                                window.gapiInited = false;
                                initResults.push(`❌ Google API 초기화 실패: ${error.message}`);
                                reject(error);
                            }
                        });
                    });
                } catch (error) {
                    initResults.push(`❌ Google API 초기화 실패: ${error.message}`);
                }
            } else {
                initResults.push('❌ Google API 라이브러리가 로드되지 않았습니다.');
            }
            
            // 2. Google Identity Services 강제 초기화
            if (typeof google !== 'undefined' && google.accounts) {
                try {
                    showTestResult('Google Identity Services 초기화 중...', 'info', 'apiTestResult');
                    
                    window.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
                        callback: (response) => {
                            if (response.error) {
                                console.error('인증 실패:', response.error);
                                return;
                            }
                            window.isAuthenticated = true;
                            console.log('인증 성공');
                        },
                    });
                    
                    window.gisInited = true;
                    initResults.push('✅ Google Identity Services 초기화 성공');
                } catch (error) {
                    window.gisInited = false;
                    window.tokenClient = null;
                    initResults.push(`❌ Google Identity Services 초기화 실패: ${error.message}`);
                }
            } else {
                initResults.push('❌ Google Identity Services가 로드되지 않았습니다.');
            }
            
            // 결과 표시
            const resultHtml = `
                <div style="text-align: left;">
                    <strong>🔧 강제 초기화 결과:</strong><br><br>
                    ${initResults.map(item => `${item}<br>`).join('')}
                    <br>
                    ${window.gapiInited && window.gisInited ? 
                        '<strong style="color: #27ae60;">✅ 초기화 완료! 이제 구글 드라이브 연결을 시도할 수 있습니다.</strong>' :
                        '<strong style="color: #e74c3c;">❌ 일부 초기화에 실패했습니다. 페이지를 새로고침해보세요.</strong>'
                    }
                </div>
            `;
            
            showTestResult(resultHtml, window.gapiInited && window.gisInited ? 'success' : 'error', 'apiTestResult');
            
        } catch (error) {
            console.error('강제 초기화 실패:', error);
            showTestResult(`❌ 강제 초기화 실패: ${error.message}`, 'error', 'apiTestResult');
        }
    };

    /**
     * API 설정 테스트
     */
    window.testAPISettings = async function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const resultDiv = document.getElementById('apiTestResult');

        if (!clientId || !apiKey) {
            showTestResult('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error', 'apiTestResult');
            return;
        }

        showTestResult('API 연결 테스트 중...', 'info', 'apiTestResult');

        try {
            // 기본 형식 검증
            if (!clientId.includes('.apps.googleusercontent.com')) {
                throw new Error('올바르지 않은 클라이언트 ID 형식입니다.');
            }

            if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
                throw new Error('올바르지 않은 API 키 형식입니다.');
            }

            // Drive API는 OAuth2만 지원하므로 형식 검증만 수행
            showTestResult('✅ API 형식 검증 완료! Drive API는 OAuth2 인증이 필요합니다.\n\n다음 단계:\n1. 설정을 저장하세요\n2. Google Cloud Console에서 Drive API를 활성화하세요\n3. "구글 드라이브 연결" 버튼을 클릭하세요', 'success', 'apiTestResult');
            
        } catch (err) {
            showTestResult(`❌ 테스트 실패: ${err.message}`, 'error', 'apiTestResult');
        }
    };

    /**
     * API 설정 저장
     */
    window.saveAPISettings = function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!clientId || !apiKey) {
            showTestResult('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error', 'apiTestResult');
            return;
        }

        localStorage.setItem('googleDriveClientId', clientId);
        localStorage.setItem('googleDriveApiKey', apiKey);

        window.CLIENT_ID = clientId;
        window.API_KEY = apiKey;

        showTestResult('✅ 설정이 저장되었습니다. 페이지를 새로고침하여 적용하세요.', 'success', 'apiTestResult');
        
        setTimeout(() => {
            if (confirm('설정을 적용하려면 페이지를 새로고침해야 합니다. 지금 새로고침 하시겠습니까?')) {
                location.reload();
            }
        }, 2000);
    };

    /**
     * 구글 드라이브 연결 (간단 로그인)
     */
    window.connectToDrive = async function() {
        showTestResult('Google Identity Services를 사용한 간단 로그인을 시도합니다...', 'info', 'apiTestResult');
        
        try {
            // Google Identity Services로 간단 로그인
            if (typeof google !== 'undefined' && google.accounts) {
                const CLIENT_ID = localStorage.getItem('googleDriveClientId');
                
                if (!CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com') {
                    showTestResult('❌ 먼저 Google 클라이언트 ID를 설정해주세요.', 'error', 'apiTestResult');
                    return;
                }
                
                console.log('🔍 클라이언트 ID 확인:', CLIENT_ID ? CLIENT_ID.substring(0, 20) + '...' : '없음');
                console.log('🔍 Google Identity Services 상태:', {
                    googleDefined: typeof google !== 'undefined',
                    accountsDefined: typeof google !== 'undefined' && !!google.accounts,
                    oauth2Defined: typeof google !== 'undefined' && !!google.accounts && !!google.accounts.oauth2
                });
                
                // Google Identity Services 토큰 클라이언트 초기화
                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
                    callback: (tokenResponse) => {
                        if (tokenResponse.access_token) {
                            console.log('✅ Google 로그인 성공!');
                            localStorage.setItem('googleAccessToken', tokenResponse.access_token);
                            
                            // 사용자 정보 가져오기
                            fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`)
                                .then(response => response.json())
                                .then(userInfo => {
                                    showTestResult(`🎉 Google 로그인 완료! 환영합니다, ${userInfo.name}님!`, 'success', 'apiTestResult');
                                    
                                    // 토큰 데이터 완전 저장 (만료 시간 포함)
                                    const tokenData = {
                                        access_token: tokenResponse.access_token,
                                        token_type: 'Bearer',
                                        expires_in: tokenResponse.expires_in || 3600,
                                        expires_at: Date.now() + ((tokenResponse.expires_in || 3600) * 1000),
                                        scope: tokenResponse.scope || 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile'
                                    };
                                    
                                    // 완전한 토큰 데이터 저장
                                    localStorage.setItem('googleDriveToken', JSON.stringify(tokenData));
                                    localStorage.setItem('googleDriveAccessToken', tokenResponse.access_token);
                                    localStorage.setItem('googleAccessToken', tokenResponse.access_token);
                                    
                                    console.log('💾 토큰 데이터 완전 저장 완료:', tokenData);
                                    
                                    // Google Drive API 초기화
                                    if (typeof gapi !== 'undefined' && gapi.client) {
                                        gapi.client.setToken({
                                            access_token: tokenResponse.access_token,
                                            token_type: 'Bearer',
                                            expires_in: tokenResponse.expires_in || 3600
                                        });
                                        
                                        console.log('🔧 GAPI 토큰 설정 완료');
                                    }
                                    
                                    // 전역 인증 상태 업데이트
                                    window.isAuthenticated = true;
                                    
                                    // google-drive-integration.js 상태도 동기화
                                    if (typeof window.updateDriveButton === 'function') {
                                        window.updateDriveButton();
                                    }
                                    
                                    // 상태 인디케이터 업데이트
                                    if (typeof window.updateDriveStatus === 'function') {
                                        window.updateDriveStatus('connected', '연결됨', userInfo.name);
                                    }
                                    
                                    // 상태창이 열려있다면 즉시 업데이트
                                    if (typeof window.refreshSyncStatus === 'function') {
                                        setTimeout(() => {
                                            window.refreshSyncStatus();
                                        }, 500);
                                    }
                                    
                                    // 기존 인증 상태 업데이트 함수 호출
                                    if (typeof window.updateAuthStatus === 'function') {
                                        window.updateAuthStatus();
                                    }
                                    
                                    console.log('✅ 모든 인증 상태 동기화 완료');
                                    
                                    // 자동 동기화 활성화 제안
                                    setTimeout(() => {
                                        if (confirm('Google Drive 로그인이 완료되었습니다.\n자동 동기화 기능을 활성화하시겠습니까?\n(달력 데이터가 5분마다 자동으로 Google Drive에 백업됩니다)')) {
                                            enableAutoSync();
                                        }
                                    }, 2000);
                                })
                                .catch(error => {
                                    console.error('사용자 정보 가져오기 실패:', error);
                                    showTestResult('🎉 Google 로그인 완료!', 'success', 'apiTestResult');
                                });
                        } else {
                            showTestResult('❌ 로그인에 실패했습니다.', 'error', 'apiTestResult');
                        }
                    },
                    error_callback: (error) => {
                        console.error('Google 로그인 오류:', error);
                        showTestResult('❌ Google 로그인 중 오류가 발생했습니다.', 'error', 'apiTestResult');
                    }
                });
                
                // 간단한 토큰 요청 (popup 방식으로 변경)
                console.log('🚀 Google 인증 창 요청 시작...');
                console.log('🔍 클라이언트 ID:', CLIENT_ID.substring(0, 20) + '...');
                console.log('🔍 현재 Origin:', window.location.origin);
                
                try {
                    // popup: false로 설정하여 redirect 방식 방지
                    tokenClient.requestAccessToken({
                        prompt: 'consent',
                        popup: true,  // popup 모드 강제
                        mode: 'popup' // popup 모드 명시적 지정
                    });
                    console.log('✅ requestAccessToken() 호출 완료 (popup 모드)');
                } catch (error) {
                    console.error('❌ requestAccessToken() 호출 실패:', error);
                    console.error('🔍 오류 상세:', {
                        message: error.message,
                        stack: error.stack,
                        clientId: CLIENT_ID,
                        origin: window.location.origin
                    });
                    showTestResult('❌ 인증 창 열기 실패: ' + error.message, 'error', 'apiTestResult');
                }
                
            } else {
                showTestResult('❌ Google Identity Services가 로드되지 않았습니다.', 'error', 'apiTestResult');
            }
        } catch (error) {
            console.error('Google 로그인 오류:', error);
            showTestResult('❌ Google 로그인 중 오류가 발생했습니다: ' + error.message, 'error', 'apiTestResult');
        }
        
        return;
    };

    /**
     * 자동 동기화 활성화 함수
     */
    window.enableAutoSync = function() {
        try {
            // 자동 동기화 설정 활성화
            localStorage.setItem('autoSyncEnabled', 'true');
            localStorage.setItem('syncInterval', '300000'); // 5분
            
            // 자동 동기화 시스템에 알림
            if (typeof window.autoSyncSystem !== 'undefined' && window.autoSyncSystem.enable) {
                window.autoSyncSystem.enable();
                console.log('✅ 자동 동기화 활성화됨');
                
                // 사용자에게 알림
                if (typeof window.showNotification === 'function') {
                    window.showNotification('🔄 자동 동기화가 활성화되었습니다! (5분 간격)', 'success', 3000);
                } else {
                    alert('🔄 자동 동기화가 활성화되었습니다! (5분 간격)');
                }
            } else {
                // 페이지 새로고침으로 자동 동기화 시작
                console.log('자동 동기화 시스템 재로드 필요');
                setTimeout(() => {
                    if (confirm('자동 동기화 활성화를 위해 페이지를 새로고침하시겠습니까?')) {
                        location.reload();
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('자동 동기화 활성화 실패:', error);
            alert('자동 동기화 활성화에 실패했습니다: ' + error.message);
        }
    };

    // 테스트 함수들 정의
    if (!window.testManualSync) {
        window.testManualSync = async function() {
            if (typeof window.autoSyncSystem === 'undefined') {
                showTestResult('❌ 자동 동기화 시스템이 로드되지 않았습니다.', 'error', 'syncTestResult');
                return;
            }

            try {
                showTestResult('수동 동기화 테스트 시작...', 'info', 'syncTestResult');
                await autoSyncSystem.performManualSync('테스트-동기화');
                showTestResult('✅ 수동 동기화 완료!', 'success', 'syncTestResult');
            } catch (error) {
                showTestResult('❌ 수동 동기화 실패: ' + error.message, 'error', 'syncTestResult');
            }
        };
    }

    if (!window.viewSyncHistory) {
        window.viewSyncHistory = function() {
            const lastSync = window.autoSyncSystem ? window.autoSyncSystem.getLastSyncTime() : 0;
            const historyText = lastSync > 0 ? 
                `마지막 동기화: ${new Date(lastSync).toLocaleString('ko-KR')}` :
                '동기화 기록이 없습니다.';
                
            showTestResult(historyText, 'info', 'syncTestResult');
        };
    }

    // 즉시 백업 함수
    if (!window.performQuickBackup) {
        window.performQuickBackup = async function() {
            try {
                console.log('📤 즉시 백업 시작...');
                
                // 디버깅 정보 출력
                console.log('🔍 즉시 백업 시작 전 상태:', {
                    isAuthenticated: window.isAuthenticated,
                    hasUploadFunction: typeof window.uploadBackupWithCustomName === 'function',
                    gapiInited: window.gapiInited,
                    gisInited: window.gisInited
                });
                
                if (!window.isAuthenticated) {
                    console.log('❌ 백업 실패: 인증되지 않음');
                    throw new Error('먼저 구글 드라이브에 연결해주세요.');
                }
                
                if (typeof window.uploadBackupWithCustomName !== 'function') {
                    console.log('❌ 백업 실패: 업로드 함수 없음');
                    throw new Error('백업 함수가 로드되지 않았습니다. 페이지를 새로고침하거나 google-drive-integration.js 파일을 확인하세요.');
                }
                
                showTestResult('📤 즉시 백업 중...', 'info');
                
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];
                const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
                const fileName = `달력메모-즉시백업-${dateStr}-${timeStr}.json`;
                
                const result = await window.uploadBackupWithCustomName(fileName, false);
                
                if (result) {
                    showTestResult('✅ 즉시 백업 완료!', 'success');
                    
                    // 자동 동기화 시스템의 마지막 동기화 시간도 업데이트
                    if (window.autoSyncSystem) {
                        localStorage.setItem('lastSyncTime', Date.now().toString());
                        window.autoSyncSystem.updateUI();
                    }
                } else {
                    showTestResult('❌ 즉시 백업 실패', 'error');
                }
                
            } catch (error) {
                console.error('즉시 백업 실패:', error);
                const errorMessage = error && error.message ? error.message : '알 수 없는 오류가 발생했습니다';
                showTestResult('❌ 즉시 백업 실패: ' + errorMessage, 'error');
            }
        };
    }
    
    // 드라이브 연결 테스트 함수
    if (!window.testDriveConnection) {
        window.testDriveConnection = async function() {
            try {
                console.log('🧪 드라이브 연결 테스트 시작...');
                showTestResult('🧪 구글 드라이브 연결 테스트 중...', 'info');
                
                // 기본 연결 상태 확인
                const hasToken = localStorage.getItem('googleDriveAccessToken');
                const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
                
                if (!hasToken && !hasGapiToken) {
                    showTestResult('❌ 토큰이 없습니다. 먼저 로그인하세요.', 'error');
                    return;
                }
                
                if (typeof gapi === 'undefined' || !gapi.client) {
                    showTestResult('❌ Google API가 로드되지 않았습니다.', 'error');
                    return;
                }
                
                // 드라이브 API 테스트
                const response = await gapi.client.drive.about.get({ fields: 'user' });
                
                if (response && response.result && response.result.user) {
                    const user = response.result.user;
                    showTestResult(`✅ 연결 성공!\n사용자: ${user.displayName}\n이메일: ${user.emailAddress}`, 'success');
                } else {
                    showTestResult('❌ 사용자 정보를 가져올 수 없습니다.', 'error');
                }
                
            } catch (error) {
                console.error('드라이브 연결 테스트 실패:', error);
                
                let errorMessage = '❌ 연결 테스트 실패: ';
                if (error.status === 401) {
                    errorMessage += '인증이 만료되었습니다. 다시 로그인하세요.';
                } else if (error.status === 403) {
                    errorMessage += 'API 권한이 없습니다. Google Cloud Console 설정을 확인하세요.';
                } else {
                    errorMessage += error.message || '알 수 없는 오류';
                }
                
                showTestResult(errorMessage, 'error');
            }
        };
    }
    
    // 동기화 연결 테스트 함수
    if (!window.testSyncConnection) {
        window.testSyncConnection = async function() {
            try {
                console.log('🔄 동기화 연결 테스트 시작...');
                showTestResult('🔄 동기화 연결 테스트 중...', 'info');
                
                // 연결 상태 확인
                const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
                const hasTokenData = localStorage.getItem('googleDriveToken');
                const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
                const isWindowAuthenticated = window.isAuthenticated;
                
                const connectionStatus = {
                    '인증 상태': isWindowAuthenticated ? '✅' : '❌',
                    '액세스 토큰': hasAccessToken ? '✅' : '❌',
                    '토큰 데이터': hasTokenData ? '✅' : '❌',
                    'GAPI 토큰': hasGapiToken ? '✅' : '❌',
                    '백업 함수': typeof window.uploadBackupWithCustomName === 'function' ? '✅' : '❌',
                    '자동 동기화': window.autoSyncSystem ? (window.autoSyncSystem.isEnabled() ? '✅ 활성' : '⏸️ 비활성') : '❌'
                };
                
                let resultMessage = '🔍 동기화 시스템 상태:\n';
                for (const [key, value] of Object.entries(connectionStatus)) {
                    resultMessage += `${key}: ${value}\n`;
                }
                
                // 전체적인 상태 판단
                const isFullyConnected = isWindowAuthenticated && hasAccessToken && hasGapiToken && typeof window.uploadBackupWithCustomName === 'function';
                
                if (isFullyConnected) {
                    resultMessage += '\n✅ 동기화 시스템 정상 작동!';
                    showTestResult(resultMessage, 'success', 'syncTestResult');
                } else {
                    resultMessage += '\n⚠️ 일부 구성 요소에 문제 있음';
                    showTestResult(resultMessage, 'warning', 'syncTestResult');
                }
                
            } catch (error) {
                console.error('동기화 연결 테스트 실패:', error);
                showTestResult('❌ 동기화 연결 테스트 실패: ' + error.message, 'error', 'syncTestResult');
            }
        };
    }

    /**
     * 통합 모달 닫기 함수
     */
    window.closeUnifiedModal = function() {
        const modals = document.querySelectorAll('.unified-modal, .sync-modal, .drive-modal');
        modals.forEach(modal => {
            if (modal && modal.parentNode) {
                console.log('🚪 통합 모달 닫기:', modal.className);
                modal.remove();
            }
        });
    };

})();
