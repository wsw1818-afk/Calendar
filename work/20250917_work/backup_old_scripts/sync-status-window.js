// Google Drive 동기화 상태창
(function() {
    'use strict';

    let statusWindow = null;
    let updateInterval = null;

    /**
     * 동기화 상태창 생성
     */
    function createSyncStatusWindow() {
        const window = document.createElement('div');
        window.id = 'syncStatusWindow';
        window.innerHTML = `
            <div class="sync-status-header">
                <h3>☁️ Google Drive 동기화 상태</h3>
                <div class="sync-status-controls">
                    <button onclick="refreshSyncStatus()" title="새로고침">🔄</button>
                    <button onclick="toggleSyncStatusWindow()" title="최소화/복원">📊</button>
                    <button onclick="closeSyncStatusWindow()" title="닫기">✕</button>
                </div>
            </div>
            <div class="sync-status-body">
                <div class="sync-status-section">
                    <h4>📡 연결 상태</h4>
                    <div class="status-item">
                        <span class="status-label">Google 계정:</span>
                        <span id="googleAccountStatus" class="status-value">확인 중...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Drive API:</span>
                        <span id="driveApiStatus" class="status-value">확인 중...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">자동 동기화:</span>
                        <span id="autoSyncStatus" class="status-value">확인 중...</span>
                    </div>
                </div>

                <div class="sync-status-section">
                    <h4>📊 동기화 통계</h4>
                    <div class="status-item">
                        <span class="status-label">마지막 동기화:</span>
                        <span id="lastSyncTime" class="status-value">없음</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">다음 동기화:</span>
                        <span id="nextSyncTime" class="status-value">계산 중...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">동기화 횟수:</span>
                        <span id="syncCount" class="status-value">0</span>
                    </div>
                </div>

                <div class="sync-status-section">
                    <h4>📁 데이터 정보</h4>
                    <div class="status-item">
                        <span class="status-label">달력 메모:</span>
                        <span id="calendarMemoCount" class="status-value">0개</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">스티키 메모:</span>
                        <span id="stickyMemoCount" class="status-value">0개</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">데이터 크기:</span>
                        <span id="dataSize" class="status-value">계산 중...</span>
                    </div>
                </div>

                <div class="sync-status-section">
                    <h4>🔄 현재 상태</h4>
                    <div class="current-status" id="currentSyncStatus">
                        <div class="status-indicator" id="statusIndicator">⚪</div>
                        <div class="status-message" id="statusMessage">대기 중</div>
                    </div>
                    <div class="progress-bar" id="syncProgressBar" style="display: none;">
                        <div class="progress-fill" id="syncProgress"></div>
                    </div>
                </div>

                <div class="sync-status-actions">
                    <button onclick="performManualSync()" class="action-button primary">🔄 수동 동기화</button>
                    <button onclick="toggleAutoSync()" class="action-button secondary" id="toggleAutoSyncBtn">자동 동기화 설정</button>
                    <button onclick="viewSyncHistory()" class="action-button secondary">📋 동기화 기록</button>
                </div>
            </div>
        `;

        // 스타일 적용
        window.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border: 2px solid #007bff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            max-height: 80vh;
            overflow-y: auto;
        `;

        return window;
    }

    /**
     * 동기화 상태창 스타일
     */
    function injectStatusWindowStyles() {
        if (document.getElementById('syncStatusWindowStyles')) return;

        const style = document.createElement('style');
        style.id = 'syncStatusWindowStyles';
        style.textContent = `
            #syncStatusWindow {
                font-size: 13px;
                line-height: 1.4;
            }

            .sync-status-header {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 12px 15px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .sync-status-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .sync-status-controls {
                display: flex;
                gap: 8px;
            }

            .sync-status-controls button {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .sync-status-controls button:hover {
                background: rgba(255,255,255,0.3);
            }

            .sync-status-body {
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
            }

            .sync-status-section {
                margin-bottom: 18px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }

            .sync-status-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .sync-status-section h4 {
                margin: 0 0 10px 0;
                font-size: 13px;
                font-weight: 600;
                color: #333;
            }

            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .status-label {
                color: #666;
                font-weight: 500;
            }

            .status-value {
                font-weight: 600;
                color: #333;
            }

            .status-value.online { color: #28a745; }
            .status-value.offline { color: #dc3545; }
            .status-value.warning { color: #ffc107; }
            .status-value.syncing { color: #17a2b8; }

            .current-status {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 10px;
            }

            .status-indicator {
                font-size: 16px;
                min-width: 20px;
                text-align: center;
            }

            .status-message {
                font-weight: 500;
                color: #333;
            }

            .progress-bar {
                height: 6px;
                background: #e9ecef;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                width: 0%;
                transition: width 0.3s ease;
            }

            .sync-status-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 15px;
            }

            .action-button {
                padding: 8px 12px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .action-button.primary {
                background: #007bff;
                color: white;
            }

            .action-button.primary:hover {
                background: #0056b3;
            }

            .action-button.secondary {
                background: #6c757d;
                color: white;
            }

            .action-button.secondary:hover {
                background: #545b62;
            }

            #syncStatusWindow.minimized .sync-status-body {
                display: none;
            }

            #syncStatusWindow.minimized {
                height: auto;
            }

            .sync-history {
                max-height: 200px;
                overflow-y: auto;
                background: #f8f9fa;
                border-radius: 5px;
                padding: 10px;
                margin-top: 10px;
            }

            .history-item {
                padding: 5px 0;
                border-bottom: 1px solid #dee2e6;
                font-size: 11px;
                color: #666;
            }

            .history-item:last-child {
                border-bottom: none;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 동기화 상태 업데이트
     */
    function updateSyncStatus() {
        if (!statusWindow) return;

        try {
            // Google 계정 상태 (강화된 토큰 확인 + 자동 복구)
            const googleAccountStatus = document.getElementById('googleAccountStatus');
            
            // 여러 localStorage 키에서 토큰 검색
            const hasAccessToken = localStorage.getItem('googleAccessToken') || localStorage.getItem('googleDriveAccessToken');
            const savedTokenData = localStorage.getItem('googleDriveToken');
            let parsedTokenData = null;
            
            if (savedTokenData) {
                try {
                    parsedTokenData = JSON.parse(savedTokenData);
                } catch (e) {
                    console.warn('저장된 토큰 데이터 파싱 실패:', e);
                }
            }
            
            const isAuthenticated = window.isAuthenticated || false;
            let hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            
            // 토큰 자동 복구 시도 (우선순위: 전체 토큰 데이터 > 액세스 토큰만)
            const tokenToRecover = (parsedTokenData && parsedTokenData.access_token) ? parsedTokenData.access_token : hasAccessToken;
            
            if (tokenToRecover && !hasGapiToken && typeof gapi !== 'undefined' && gapi.client) {
                console.log('🔧 강화된 토큰 자동 복구 시도...');
                console.log('복구 토큰 소스:', parsedTokenData ? '전체 토큰 데이터' : '액세스 토큰만');
                
                try {
                    // 토큰 만료 시간 확인
                    if (parsedTokenData && parsedTokenData.expires_at && parsedTokenData.expires_at <= Date.now()) {
                        console.log('⚠️ 저장된 토큰이 만료되었습니다.');
                        localStorage.removeItem('googleDriveToken');
                        localStorage.removeItem('googleDriveAccessToken');
                        localStorage.removeItem('googleAccessToken');
                        hasGapiToken = null;
                    } else {
                        // 토큰 설정
                        const tokenConfig = {
                            access_token: tokenToRecover,
                            token_type: 'Bearer'
                        };
                        
                        // 만료 시간이 있으면 추가
                        if (parsedTokenData && parsedTokenData.expires_at) {
                            tokenConfig.expires_in = Math.floor((parsedTokenData.expires_at - Date.now()) / 1000);
                        }
                        
                        gapi.client.setToken(tokenConfig);
                        hasGapiToken = gapi.client.getToken();
                        window.isAuthenticated = true;
                        
                        // localStorage 동기화
                        if (parsedTokenData && parsedTokenData.access_token) {
                            localStorage.setItem('googleDriveAccessToken', parsedTokenData.access_token);
                            localStorage.setItem('googleAccessToken', parsedTokenData.access_token);
                        }
                        
                        console.log('✅ 강화된 토큰 자동 복구 성공');
                        console.log('토큰 상태:', { hasGapiToken: !!hasGapiToken, isAuthenticated: window.isAuthenticated });
                    }
                } catch (error) {
                    console.error('❌ 토큰 자동 복구 실패:', error);
                    
                    // 오류 발생 시 모든 토큰 정리
                    localStorage.removeItem('googleDriveToken');
                    localStorage.removeItem('googleDriveAccessToken');
                    localStorage.removeItem('googleAccessToken');
                    window.isAuthenticated = false;
                }
            }
            
            if ((isAuthenticated || hasGapiToken) && (hasAccessToken || parsedTokenData || hasGapiToken)) {
                googleAccountStatus.textContent = '✅ 연결됨';
                googleAccountStatus.className = 'status-value online';
            } else if (hasAccessToken || parsedTokenData || hasGapiToken) {
                googleAccountStatus.textContent = '⚠️ 토큰 있음 (확인 필요)';
                googleAccountStatus.className = 'status-value warning';
            } else {
                googleAccountStatus.textContent = '❌ 연결 안됨';
                googleAccountStatus.className = 'status-value offline';
            }

            // Drive API 상태
            const driveApiStatus = document.getElementById('driveApiStatus');
            if (window.gapiInited && window.gisInited) {
                driveApiStatus.textContent = '✅ 활성화됨';
                driveApiStatus.className = 'status-value online';
            } else {
                driveApiStatus.textContent = '❌ 초기화 필요';
                driveApiStatus.className = 'status-value offline';
            }

            // 자동 동기화 상태
            const autoSyncStatus = document.getElementById('autoSyncStatus');
            const autoSyncEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
            if (autoSyncEnabled) {
                const syncInterval = parseInt(localStorage.getItem('syncInterval') || '300000') / 60000;
                autoSyncStatus.textContent = `✅ 활성화 (${syncInterval}분)`;
                autoSyncStatus.className = 'status-value online';
            } else {
                autoSyncStatus.textContent = '❌ 비활성화';
                autoSyncStatus.className = 'status-value offline';
            }

            // 마지막 동기화 시간
            const lastSyncTime = document.getElementById('lastSyncTime');
            const lastSync = parseInt(localStorage.getItem('lastSyncTime') || '0');
            if (lastSync > 0) {
                const timeAgo = getTimeAgo(lastSync);
                lastSyncTime.textContent = `${new Date(lastSync).toLocaleString('ko-KR')} (${timeAgo})`;
            } else {
                lastSyncTime.textContent = '동기화 기록 없음';
            }

            // 다음 동기화 시간
            const nextSyncTime = document.getElementById('nextSyncTime');
            if (autoSyncEnabled && lastSync > 0) {
                const nextSync = lastSync + parseInt(localStorage.getItem('syncInterval') || '300000');
                const timeUntilNext = Math.max(0, nextSync - Date.now());
                if (timeUntilNext > 0) {
                    nextSyncTime.textContent = `${Math.ceil(timeUntilNext / 60000)}분 후`;
                } else {
                    nextSyncTime.textContent = '곧 동기화 예정';
                }
            } else {
                nextSyncTime.textContent = autoSyncEnabled ? '계산 중...' : '비활성화됨';
            }

            // 동기화 횟수
            const syncCount = document.getElementById('syncCount');
            const count = localStorage.getItem('syncCount') || '0';
            syncCount.textContent = `${count}회`;

            // 데이터 정보
            updateDataInfo();

            // 현재 동기화 상태
            updateCurrentStatus();

            // 자동 동기화 버튼 텍스트 업데이트
            const toggleBtn = document.getElementById('toggleAutoSyncBtn');
            if (toggleBtn) {
                toggleBtn.textContent = autoSyncEnabled ? '🔄 자동 동기화 끄기' : '🔄 자동 동기화 켜기';
            }

        } catch (error) {
            console.error('동기화 상태 업데이트 오류:', error);
        }
    }

    /**
     * 데이터 정보 업데이트
     */
    function updateDataInfo() {
        try {
            // 달력 메모 개수
            const calendarMemos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
            const calendarMemoCount = Object.keys(calendarMemos).length;
            document.getElementById('calendarMemoCount').textContent = `${calendarMemoCount}개`;

            // 스티키 메모 개수
            let stickyMemoCount = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('memos_')) {
                    const memos = JSON.parse(localStorage.getItem(key) || '[]');
                    stickyMemoCount += memos.length;
                }
            }
            document.getElementById('stickyMemoCount').textContent = `${stickyMemoCount}개`;

            // 데이터 크기 계산
            let totalSize = 0;
            totalSize += JSON.stringify(calendarMemos).length;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('memos_') || key === 'calendarMemos')) {
                    totalSize += localStorage.getItem(key).length;
                }
            }

            const sizeInKB = (totalSize / 1024).toFixed(2);
            document.getElementById('dataSize').textContent = `${sizeInKB} KB`;

        } catch (error) {
            console.error('데이터 정보 업데이트 오류:', error);
        }
    }

    /**
     * 현재 상태 업데이트
     */
    function updateCurrentStatus() {
        const indicator = document.getElementById('statusIndicator');
        const message = document.getElementById('statusMessage');
        
        if (window.isCurrentlySyncing) {
            indicator.textContent = '🔄';
            message.textContent = '동기화 진행 중...';
            message.className = 'status-message syncing';
            showProgressBar(true);
        } else {
            // 더 정확한 연결 상태 확인
            const hasToken = localStorage.getItem('googleAccessToken');
            let hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            let isAuthenticated = window.isAuthenticated || false;
            
            // 자동 복구가 되었는지 확인하고 상태 업데이트
            if (!isAuthenticated && hasGapiToken) {
                isAuthenticated = true;
                window.isAuthenticated = true;
            }
            
            const isConnected = (isAuthenticated || hasGapiToken || hasToken) && window.gapiInited && window.gisInited;
            const autoSyncEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
            
            console.log('🔍 현재 상태 디버그:', {
                hasToken: !!hasToken,
                hasGapiToken: !!hasGapiToken,
                isAuthenticated,
                gapiInited: window.gapiInited,
                gisInited: window.gisInited,
                isConnected,
                autoSyncEnabled
            });
            
            if (isConnected && autoSyncEnabled) {
                indicator.textContent = '✅';
                message.textContent = '모든 시스템 정상';
                message.className = 'status-message online';
            } else if (isConnected && !autoSyncEnabled) {
                indicator.textContent = '⚠️';
                message.textContent = '연결됨 (자동 동기화 꺼짐)';
                message.className = 'status-message warning';
            } else if ((hasToken || hasGapiToken || isAuthenticated) && (!window.gapiInited || !window.gisInited)) {
                indicator.textContent = '⚠️';
                message.textContent = 'API 초기화 중...';
                message.className = 'status-message warning';
            } else if (hasToken || hasGapiToken || isAuthenticated) {
                indicator.textContent = '⚠️';
                message.textContent = '로그인됨 (설정 확인 필요)';
                message.className = 'status-message warning';
            } else {
                indicator.textContent = '❌';
                message.textContent = '로그인 필요';
                message.className = 'status-message offline';
            }
            showProgressBar(false);
        }
    }

    /**
     * 진행률 표시줄 표시/숨김
     */
    function showProgressBar(show) {
        const progressBar = document.getElementById('syncProgressBar');
        if (progressBar) {
            progressBar.style.display = show ? 'block' : 'none';
            if (show) {
                animateProgress();
            }
        }
    }

    /**
     * 진행률 애니메이션
     */
    function animateProgress() {
        const progress = document.getElementById('syncProgress');
        if (!progress) return;

        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 20;
            if (width >= 90) {
                width = 90;
                clearInterval(interval);
            }
            progress.style.width = width + '%';
        }, 200);
    }

    /**
     * 시간 전 계산
     */
    function getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }

    /**
     * 동기화 상태창 표시
     */
    function showSyncStatusWindow() {
        if (statusWindow && document.contains(statusWindow)) {
            statusWindow.style.display = 'block';
            return;
        }

        injectStatusWindowStyles();
        statusWindow = createSyncStatusWindow();
        document.body.appendChild(statusWindow);

        // 드래그 기능 추가
        makeDraggable(statusWindow);

        // 실시간 업데이트 시작
        updateSyncStatus();
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateSyncStatus, 2000);

        console.log('🔍 동기화 상태창이 열렸습니다.');
    }

    /**
     * 동기화 상태창 숨김
     */
    function hideSyncStatusWindow() {
        if (statusWindow) {
            statusWindow.style.display = 'none';
        }
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    /**
     * 동기화 상태창 닫기
     */
    function closeSyncStatusWindow() {
        if (statusWindow && document.contains(statusWindow)) {
            statusWindow.remove();
            statusWindow = null;
        }
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        console.log('🔍 동기화 상태창이 닫혔습니다.');
    }

    /**
     * 동기화 상태창 최소화/복원
     */
    function toggleSyncStatusWindow() {
        if (statusWindow) {
            statusWindow.classList.toggle('minimized');
        }
    }

    /**
     * 드래그 기능
     */
    function makeDraggable(element) {
        const header = element.querySelector('.sync-status-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.style.cursor = 'move';

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        function handleMouseMove(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = (initialX + deltaX) + 'px';
            element.style.top = (initialY + deltaY) + 'px';
            element.style.right = 'auto';
        }

        function handleMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }

    /**
     * 전역 함수들
     */
    window.showSyncStatusWindow = showSyncStatusWindow;
    window.hideSyncStatusWindow = hideSyncStatusWindow;
    window.closeSyncStatusWindow = closeSyncStatusWindow;
    window.toggleSyncStatusWindow = toggleSyncStatusWindow;
    window.refreshSyncStatus = updateSyncStatus;

    window.performManualSync = function() {
        if (typeof window.autoSyncSystem !== 'undefined' && window.autoSyncSystem.performManualSync) {
            window.autoSyncSystem.performManualSync('상태창-수동동기화');
        } else {
            alert('자동 동기화 시스템을 찾을 수 없습니다.');
        }
    };

    window.toggleAutoSync = function() {
        if (typeof window.autoSyncSystem !== 'undefined' && window.autoSyncSystem.toggle) {
            window.autoSyncSystem.toggle();
            setTimeout(updateSyncStatus, 500);
        } else {
            alert('자동 동기화 시스템을 찾을 수 없습니다.');
        }
    };

    window.viewSyncHistory = function() {
        const historyData = {
            lastSync: localStorage.getItem('lastSyncTime'),
            syncCount: localStorage.getItem('syncCount') || '0',
            autoSyncEnabled: localStorage.getItem('autoSyncEnabled') === 'true'
        };
        
        console.log('동기화 기록:', historyData);
        alert(`동기화 기록:\n총 ${historyData.syncCount}회 동기화\n마지막: ${historyData.lastSync ? new Date(parseInt(historyData.lastSync)).toLocaleString('ko-KR') : '없음'}\n자동 동기화: ${historyData.autoSyncEnabled ? '켜짐' : '꺼짐'}`);
    };

    // 키보드 단축키 (Ctrl + Shift + S)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            if (statusWindow && statusWindow.style.display !== 'none') {
                closeSyncStatusWindow();
            } else {
                showSyncStatusWindow();
            }
        }
    });

    console.log('🔍 Google Drive 동기화 상태창 시스템 로드됨 (Ctrl+Shift+S로 열기)');
})();