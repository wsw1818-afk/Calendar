// 상태 인디케이터 관리 시스템
(function() {
    'use strict';

    /**
     * 구글 드라이브 연결 상태 업데이트
     */
    function updateDriveStatus(status, text, details = '') {
        const driveStatus = document.getElementById('driveStatus');
        if (!driveStatus) return;

        const icon = driveStatus.querySelector('.status-icon');
        const textEl = driveStatus.querySelector('.status-text');
        
        // 모든 상태 클래스 제거
        driveStatus.className = 'status-indicator';
        
        switch(status) {
            case 'connected':
                icon.textContent = '✅';
                textEl.textContent = text || '연결됨';
                driveStatus.classList.add('connected');
                driveStatus.title = `구글 드라이브 연결됨${details ? ' - ' + details : ''}`;
                break;
                
            case 'connecting':
                icon.textContent = '🔄';
                textEl.textContent = text || '연결 중';
                driveStatus.classList.add('syncing');
                driveStatus.title = '구글 드라이브에 연결하고 있습니다...';
                break;
                
            case 'error':
                icon.textContent = '❌';
                textEl.textContent = text || '연결 실패';
                driveStatus.classList.add('error');
                driveStatus.title = `구글 드라이브 연결 실패${details ? ' - ' + details : ''}`;
                break;
                
            case 'warning':
                icon.textContent = '⚠️';
                textEl.textContent = text || '설정 필요';
                driveStatus.classList.add('warning');
                driveStatus.title = '구글 드라이브 설정이 필요합니다';
                break;
                
            default: // disconnected
                icon.textContent = '❌';
                textEl.textContent = text || '연결 안됨';
                driveStatus.title = '구글 드라이브에 연결되지 않음';
                break;
        }
    }

    /**
     * 동기화 상태 업데이트
     */
    function updateSyncStatus(status, text, details = '') {
        const syncStatus = document.getElementById('syncStatus');
        if (!syncStatus) return;

        const icon = syncStatus.querySelector('.status-icon');
        const textEl = syncStatus.querySelector('.status-text');
        
        // 모든 상태 클래스 제거
        syncStatus.className = 'status-indicator';
        
        switch(status) {
            case 'syncing':
                icon.textContent = '🔄';
                textEl.textContent = text || '동기화 중';
                syncStatus.classList.add('syncing');
                syncStatus.title = `데이터를 동기화하고 있습니다${details ? ' - ' + details : ''}`;
                break;
                
            case 'synced':
                icon.textContent = '✅';
                textEl.textContent = text || '동기화됨';
                syncStatus.classList.add('connected');
                syncStatus.title = `동기화 완료${details ? ' - ' + details : ''}`;
                break;
                
            case 'error':
                icon.textContent = '❌';
                textEl.textContent = text || '동기화 실패';
                syncStatus.classList.add('error');
                syncStatus.title = `동기화 실패${details ? ' - ' + details : ''}`;
                break;
                
            case 'waiting':
                icon.textContent = '⏳';
                textEl.textContent = text || '대기 중';
                syncStatus.title = '다음 동기화를 대기 중입니다';
                break;
                
            case 'disabled':
                icon.textContent = '⏸️';
                textEl.textContent = text || '비활성화';
                syncStatus.classList.add('warning');
                syncStatus.title = '자동 동기화가 비활성화되어 있습니다';
                break;
                
            default: // idle
                icon.textContent = '⏸️';
                textEl.textContent = text || '대기중';
                syncStatus.title = '동기화 대기 상태';
                break;
        }
    }

    /**
     * 상태 인디케이터 초기화
     */
    function initializeStatusIndicators() {
        console.log('📊 상태 인디케이터 초기화 시작');
        
        // 초기 상태 설정 - 인증 상태 확인 후 설정
        setTimeout(() => {
            checkAndUpdateInitialStatus();
        }, 500);
        
        // 클릭 이벤트 추가
        const driveStatus = document.getElementById('driveStatus');
        const syncStatus = document.getElementById('syncStatus');
        
        if (driveStatus) {
            driveStatus.addEventListener('click', () => {
                if (typeof window.showUnifiedCloudModal === 'function') {
                    window.showUnifiedCloudModal();
                } else {
                    console.warn('통합 클라우드 모달 함수를 찾을 수 없습니다.');
                }
            });
        }
        
        if (syncStatus) {
            syncStatus.addEventListener('click', () => {
                if (typeof window.showUnifiedCloudModal === 'function') {
                    // 자동 동기화 탭으로 이동
                    window.showUnifiedCloudModal();
                    setTimeout(() => {
                        if (typeof window.switchToTab === 'function') {
                            window.switchToTab('sync');
                        }
                    }, 100);
                } else {
                    console.warn('통합 클라우드 모달 함수를 찾을 수 없습니다.');
                }
            });
        }
        
        console.log('✅ 상태 인디케이터 초기화 완료');
    }

    /**
     * 초기 상태 확인 및 업데이트
     */
    function checkAndUpdateInitialStatus() {
        console.log('🔍 초기 상태 확인 시작');
        
        // Google Drive 인증 상태 확인
        const hasAccessToken = localStorage.getItem('googleAccessToken') || localStorage.getItem('googleDriveAccessToken');
        const savedTokenData = localStorage.getItem('googleDriveToken');
        let hasGapiToken = false;
        
        if (typeof gapi !== 'undefined' && gapi.client) {
            try {
                const token = gapi.client.getToken();
                hasGapiToken = token && token.access_token;
            } catch (e) {
                hasGapiToken = false;
            }
        }
        
        const isAuthenticated = window.isAuthenticated || hasGapiToken || hasAccessToken;
        
        console.log('🔍 초기 상태 확인 결과:', {
            isAuthenticated: window.isAuthenticated,
            hasGapiToken,
            hasAccessToken: !!hasAccessToken,
            savedTokenData: !!savedTokenData,
            finalStatus: isAuthenticated
        });
        
        if (isAuthenticated) {
            const savedToken = getSavedTokenForStatus();
            if (savedToken && savedToken.expires_at) {
                let remainingHours = Math.floor((savedToken.expires_at - Date.now()) / (1000 * 60 * 60));
                
                // 토큰이 유효하면 최소 1시간으로 표시 (Google Drive 통합과 동일한 로직)
                if (remainingHours <= 0 && isAuthenticated) {
                    remainingHours = 1; // 인증이 성공했으면 최소 1시간으로 표시
                }
                
                if (remainingHours > 0) {
                    updateDriveStatus('connected', '연결됨', `${remainingHours}시간 남음`);
                } else {
                    updateDriveStatus('warning', '토큰 만료', '갱신 필요');
                }
            } else {
                updateDriveStatus('connected', '연결됨');
            }
            
            // 자동 동기화 상태에 따라 Sync 상태 설정
            const autoSyncEnabled = localStorage.getItem('autoSyncEnabled') === 'true';
            if (autoSyncEnabled) {
                updateSyncStatus('connected', '자동 동기화');
            } else {
                updateSyncStatus('idle', '대기중');
            }
        } else {
            updateDriveStatus('disconnected', '연결 안됨');
            updateSyncStatus('idle', '대기중');
        }
        
        console.log('✅ 초기 상태 설정 완료');
    }

    /**
     * Google Drive 상태 모니터링
     */
    function monitorDriveStatus() {
        setInterval(() => {
            // 더 정확한 인증 상태 확인
            const hasAccessToken = localStorage.getItem('googleAccessToken') || localStorage.getItem('googleDriveAccessToken');
            const savedTokenData = localStorage.getItem('googleDriveToken');
            let hasGapiToken = false;
            
            // GAPI 토큰 확인
            if (typeof gapi !== 'undefined' && gapi.client) {
                try {
                    const token = gapi.client.getToken();
                    hasGapiToken = token && token.access_token;
                } catch (e) {
                    hasGapiToken = false;
                }
            }
            
            const isAuthenticated = window.isAuthenticated || hasGapiToken || hasAccessToken;
            
            if (isAuthenticated) {
                // 토큰 만료 시간 확인
                const savedToken = getSavedTokenForStatus();
                if (savedToken && savedToken.expires_at) {
                    let remainingHours = Math.floor((savedToken.expires_at - Date.now()) / (1000 * 60 * 60));
                    
                    // 토큰이 유효하면 최소 1시간으로 표시 (Google Drive 통합과 동일한 로직)
                    if (remainingHours <= 0 && isAuthenticated) {
                        remainingHours = 1; // 인증이 성공했으면 최소 1시간으로 표시
                    }
                    
                    if (remainingHours > 0) {
                        updateDriveStatus('connected', '연결됨', `${remainingHours}시간 남음`);
                    } else {
                        updateDriveStatus('warning', '토큰 만료', '갱신 필요');
                    }
                } else {
                    updateDriveStatus('connected', '연결됨');
                }
            } else if (typeof window.gapiInited !== 'undefined' && typeof window.gisInited !== 'undefined') {
                if (!window.gapiInited || !window.gisInited) {
                    updateDriveStatus('warning', '초기화 중');
                } else {
                    const clientId = localStorage.getItem('googleDriveClientId');
                    const apiKey = localStorage.getItem('googleDriveApiKey');
                    
                    if (!clientId || !apiKey) {
                        updateDriveStatus('warning', '설정 필요');
                    } else {
                        updateDriveStatus('disconnected', '연결 안됨');
                    }
                }
            }
        }, 3000); // 3초마다 체크
    }

    /**
     * 자동 동기화 상태 모니터링
     */
    function monitorSyncStatus() {
        setInterval(() => {
            if (typeof window.autoSyncSystem !== 'undefined' && window.autoSyncSystem) {
                const isEnabled = window.autoSyncSystem.isEnabled();
                const lastSyncTime = window.autoSyncSystem.getLastSyncTime();
                
                if (!isEnabled) {
                    updateSyncStatus('disabled', '비활성화');
                } else if (window.isCurrentlySyncing) {
                    updateSyncStatus('syncing', '동기화 중');
                } else if (lastSyncTime > 0) {
                    const timeSinceSync = Date.now() - lastSyncTime;
                    const minutesAgo = Math.floor(timeSinceSync / (1000 * 60));
                    
                    if (minutesAgo < 1) {
                        updateSyncStatus('synced', '방금 동기화');
                    } else if (minutesAgo < 60) {
                        updateSyncStatus('synced', '동기화됨', `${minutesAgo}분 전`);
                    } else {
                        const hoursAgo = Math.floor(minutesAgo / 60);
                        updateSyncStatus('synced', '동기화됨', `${hoursAgo}시간 전`);
                    }
                } else {
                    updateSyncStatus('waiting', '대기 중');
                }
            } else {
                updateSyncStatus('disabled', '시스템 없음');
            }
        }, 2000); // 2초마다 체크
    }

    /**
     * 저장된 토큰 정보 가져오기 (상태 표시용)
     */
    function getSavedTokenForStatus() {
        try {
            const tokenStr = localStorage.getItem('googleDriveToken');
            if (!tokenStr) return null;
            
            const tokenData = JSON.parse(tokenStr);
            
            // 토큰이 만료되었는지 확인
            if (Date.now() >= tokenData.expires_at) {
                return null;
            }
            
            return tokenData;
        } catch (error) {
            return null;
        }
    }

    // 전역 함수로 노출
    window.updateDriveStatus = updateDriveStatus;
    window.updateSyncStatus = updateSyncStatus;
    window.initializeStatusIndicators = initializeStatusIndicators;

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeStatusIndicators, 500);
            setTimeout(monitorDriveStatus, 1000);
            setTimeout(monitorSyncStatus, 1500);
        });
    } else {
        setTimeout(initializeStatusIndicators, 500);
        setTimeout(monitorDriveStatus, 1000);
        setTimeout(monitorSyncStatus, 1500);
    }

    console.log('📊 상태 인디케이터 시스템 로드됨');
})();