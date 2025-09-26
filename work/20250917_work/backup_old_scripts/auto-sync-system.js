// 자동 동기화 시스템
(function() {
    'use strict';

    // 동기화 설정 (자동 동기화를 기본값으로 활성화)
    let autoSyncEnabled = JSON.parse(localStorage.getItem('autoSyncEnabled') || 'true'); // 기본값 true로 변경
    let syncInterval = parseInt(localStorage.getItem('syncInterval') || '300000'); // 기본 5분
    let lastSyncTime = parseInt(localStorage.getItem('lastSyncTime') || '0');
    let customFileName = localStorage.getItem('customFileName') || '';
    let syncIntervalId = null;
    let dataChangeTimer = null;
    
    // 강화된 동기화 기능을 위한 추가 변수들
    let autoBackupEnabled = JSON.parse(localStorage.getItem('autoBackupEnabled') || 'true');
    let lastBackupTime = parseInt(localStorage.getItem('lastBackupTime') || '0');
    let backupRetryCount = 0;
    let maxBackupRetries = 3;
    
    // 중복 방지를 위한 변수들
    let currentSyncPromise = null; // 현재 진행 중인 동기화 Promise
    let pendingSync = null; // 대기 중인 동기화 요청
    let syncDebounceTimer = null; // 디바운스 타이머
    let lastSyncedDataHash = null; // 마지막 동기화된 데이터 해시
    let lastChangeDetectionTime = 0; // 마지막 변경 감지 시간

    // 원본 localStorage 메서드 백업
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    /**
     * 데이터 해시 생성 (간단한 해시)
     */
    function generateDataHash(data) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트 정수로 변환
        }
        return hash.toString();
    }

    /**
     * 현재 메모 데이터의 해시 계산
     */
    function getCurrentDataHash() {
        const memos = localStorage.getItem('calendarMemos') || '{}';
        return generateDataHash(memos);
    }

    /**
     * localStorage 변경 감지 시스템
     */
    function setupLocalStorageMonitoring() {
        // setItem 오버라이드
        localStorage.setItem = function(key, value) {
            const oldValue = localStorage.getItem(key);
            const result = originalSetItem.apply(this, arguments);
            
            // 메모 관련 데이터 변경 감지
            if (key === 'calendarMemos' || key.startsWith('memos_')) {
                if (oldValue !== value) {
                    handleDataChange('modified', key, { oldValue, newValue: value });
                }
            }
            
            return result;
        };

        // removeItem 오버라이드
        localStorage.removeItem = function(key) {
            const oldValue = localStorage.getItem(key);
            const result = originalRemoveItem.apply(this, arguments);
            
            if (key === 'calendarMemos' || key.startsWith('memos_')) {
                if (oldValue !== null) {
                    handleDataChange('removed', key, { oldValue });
                }
            }
            
            return result;
        };

        // clear 오버라이드 (전체 삭제 시)
        localStorage.clear = function() {
            const memoKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key === 'calendarMemos' || key.startsWith('memos_')) {
                    memoKeys.push(key);
                }
            }
            
            const result = originalClear.apply(this, arguments);
            
            if (memoKeys.length > 0) {
                handleDataChange('cleared', null, { clearedKeys: memoKeys });
            }
            
            return result;
        };
    }

    /**
     * 데이터 변경 처리 (강화된 중복 방지)
     */
    function handleDataChange(type, key, data) {
        const now = Date.now();
        console.log(`📝 메모 데이터 변경 감지: ${type}`, { key, data, timestamp: new Date(now).toLocaleTimeString() });
        
        if (!autoSyncEnabled) {
            console.log('자동 동기화가 비활성화되어 있습니다.');
            return;
        }

        // 현재 데이터 해시 계산
        const currentDataHash = getCurrentDataHash();
        
        // 데이터가 실제로 변경되지 않았으면 무시
        if (lastSyncedDataHash && currentDataHash === lastSyncedDataHash) {
            console.log('🚫 데이터 내용이 변경되지 않음 - 동기화 생략');
            return;
        }

        // 너무 짧은 시간 내 중복 호출 방지 (1초 이내)
        if (now - lastChangeDetectionTime < 1000) {
            console.log(`🚫 너무 짧은 간격의 변경 감지 (${now - lastChangeDetectionTime}ms) - 무시`);
            return;
        }
        
        lastChangeDetectionTime = now;

        // 현재 동기화 진행 중이면 대기열에 추가
        if (currentSyncPromise) {
            console.log('🔄 동기화 진행 중 - 대기열에 최신 요청으로 갱신');
            pendingSync = { type, key, data, hash: currentDataHash, timestamp: now };
            return;
        }

        // 기존 디바운스 타이머 클리어
        if (syncDebounceTimer) {
            clearTimeout(syncDebounceTimer);
            console.log('⏰ 기존 디바운스 타이머 클리어');
        }

        // 3초 디바운스 (연속 변경 시 마지막 변경만 처리)
        syncDebounceTimer = setTimeout(() => {
            // 다시 한 번 데이터 변경 확인
            const finalDataHash = getCurrentDataHash();
            if (lastSyncedDataHash && finalDataHash === lastSyncedDataHash) {
                console.log('🚫 최종 확인: 데이터가 변경되지 않음 - 동기화 취소');
                return;
            }
            
            console.log(`🚀 디바운스 완료 - 동기화 실행 (해시: ${finalDataHash})`);
            performAutoSyncSafe(type, key, finalDataHash);
        }, 3000);
        
        console.log(`⏰ 3초 디바운스 타이머 시작 (해시: ${currentDataHash})`);
    }

    /**
     * 안전한 자동 동기화 실행 (중복 방지)
     */
    async function performAutoSyncSafe(changeType, changedKey, dataHash = null) {
        // 이미 진행 중인 동기화가 있으면 대기열에 추가
        if (currentSyncPromise) {
            console.log('🔄 동기화 진행 중 - 새 요청을 대기열에 추가');
            const currentDataHash = dataHash || getCurrentDataHash();
            pendingSync = { type: changeType, key: changedKey, hash: currentDataHash, timestamp: Date.now() };
            return;
        }

        try {
            // 최종 데이터 변경 확인
            const finalDataHash = dataHash || getCurrentDataHash();
            if (lastSyncedDataHash && finalDataHash === lastSyncedDataHash) {
                console.log('🚫 동기화 시작 전 최종 확인: 데이터 변경 없음 - 취소');
                return;
            }

            console.log(`🚀 동기화 시작 - 데이터 해시: ${finalDataHash}`);
            
            // 동기화 시작
            currentSyncPromise = performAutoSync(changeType, changedKey);
            await currentSyncPromise;
            
            // 동기화 성공 시 해시 업데이트
            lastSyncedDataHash = finalDataHash;
            console.log(`✅ 동기화 성공 - 해시 업데이트: ${finalDataHash}`);
            
            // 동기화 완료 후 대기 중인 요청이 있으면 처리
            if (pendingSync) {
                console.log('🔄 대기 중인 동기화 요청 처리 중...');
                const pending = pendingSync;
                pendingSync = null; // 먼저 클리어
                
                // 대기 중인 요청의 데이터가 현재와 다른지 확인
                const currentDataHash = getCurrentDataHash();
                if (pending.hash !== currentDataHash) {
                    console.log(`🔄 대기 요청 데이터 변경 감지 (${pending.hash} → ${currentDataHash}) - 3초 후 실행`);
                    setTimeout(() => {
                        performAutoSyncSafe(pending.type, pending.key, currentDataHash);
                    }, 3000);
                } else {
                    console.log('🚫 대기 요청과 현재 데이터가 동일 - 스킵');
                }
            }
            
        } catch (error) {
            console.error('안전한 동기화 실행 실패:', error);
        } finally {
            currentSyncPromise = null;
        }
    }

    /**
     * 자동 동기화 실행 (재시도 로직 포함)
     */
    async function performAutoSync(changeType, changedKey, retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 2000; // 2초
        
        try {
            const retryText = retryCount > 0 ? ` (재시도 ${retryCount}/${maxRetries})` : '';
            console.log(`🔄 자동 동기화 시작...${retryText}`);
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                const statusText = retryCount > 0 ? `동기화 재시도 중 (${retryCount}/${maxRetries})` : '동기화 중';
                window.updateSyncStatus('syncing', statusText);
            }
            window.isCurrentlySyncing = true;
            
            // 구글 드라이브 연결 상태 확인 (강화된 확인)
            const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
            const hasTokenData = localStorage.getItem('googleDriveToken');
            const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            const isWindowAuthenticated = window.isAuthenticated;
            
            // 토큰이 있는지 다중 검증
            const hasValidToken = hasAccessToken || hasTokenData || hasGapiToken;
            const isConnected = isWindowAuthenticated || hasValidToken;
            
            console.log('🔍 동기화 연결 상태 상세:', {
                isWindowAuthenticated,
                hasAccessToken: !!hasAccessToken,
                hasTokenData: !!hasTokenData,
                hasGapiToken: !!hasGapiToken,
                isConnected,
                hasUploadFunction: typeof window.uploadBackupWithCustomName === 'function'
            });
            
            if (!isConnected || typeof window.uploadBackupWithCustomName !== 'function') {
                console.log('❌ 구글 드라이브가 연결되지 않았거나 업로드 함수가 없습니다.');
                
                let errorMessage = '자동 동기화 실패: ';
                if (!isConnected) {
                    errorMessage += '구글 드라이브 연결 필요';
                } else {
                    errorMessage += '백업 함수 로드 오류';
                }
                
                showNotification(errorMessage, 'error');
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('error', '연결 필요');
                }
                window.isCurrentlySyncing = false;
                return;
            }

            // 파일명 생성
            const fileName = generateSyncFileName(changeType, changedKey);
            
            // 자동 백업 실행
            const result = await window.uploadBackupWithCustomName(fileName, true); // silent 모드
            
            if (result) {
                lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', lastSyncTime.toString());
                console.log('✅ 자동 동기화 완료:', fileName);
                
                // 조용한 알림
                showNotification(`☁️ 자동 동기화 완료: ${fileName}`, 'success', 2000);
                
                // 동기화 상태 UI 업데이트
                updateSyncStatusUI();
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('synced', '동기화됨', '방금 전');
                }
            }
            
        } catch (error) {
            console.error(`❌ 자동 동기화 실패 (시도 ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // 재시도 가능한 오류인지 확인
            const isRetryableError = 
                error.message.includes('네트워크') ||
                error.message.includes('network') ||
                error.message.includes('timeout') ||
                error.message.includes('503') ||
                error.message.includes('502') ||
                error.message.includes('500') ||
                (error.status >= 500 && error.status < 600);
            
            // 재시도 로직
            if (retryCount < maxRetries && isRetryableError) {
                console.log(`🔄 ${retryDelay/1000}초 후 재시도 예정... (${retryCount + 1}/${maxRetries})`);
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('retrying', '재시도 대기중', `${retryDelay/1000}초 후`);
                }
                
                // 지연 후 재시도
                setTimeout(() => {
                    performAutoSync(changeType, changedKey, retryCount + 1);
                }, retryDelay);
                
                return; // finally 블록으로 가지 않고 여기서 종료
            }
            
            // 최종 실패
            const finalError = retryCount > 0 
                ? `자동 동기화 최종 실패 (${retryCount + 1}회 시도): ${error.message}`
                : `자동 동기화 실패: ${error.message}`;
                
            showNotification(finalError, 'error');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                const errorStatus = retryCount > 0 
                    ? `${retryCount + 1}회 시도 후 실패`
                    : '동기화 실패';
                window.updateSyncStatus('error', errorStatus, error.message);
            }
        } finally {
            // 재시도 중이 아닐 때만 동기화 상태 해제
            if (retryCount >= maxRetries || !window.isCurrentlySyncing) {
                window.isCurrentlySyncing = false;
            }
        }
    }

    /**
     * 동기화 파일명 생성
     */
    function generateSyncFileName(changeType, changedKey) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
        
        // 사용자 지정 파일명이 있으면 사용
        if (customFileName.trim()) {
            return `${customFileName}-${dateStr}-${timeStr}.json`;
        }
        
        // 기본 파일명 패턴
        const changeTypeKr = {
            'modified': '수정',
            'removed': '삭제',
            'cleared': '전체삭제',
            'manual': '수동'
        }[changeType] || '변경';
        
        return `달력메모-${changeTypeKr}-${dateStr}-${timeStr}.json`;
    }

    /**
     * 정기 동기화 시작
     */
    function startPeriodicSync() {
        if (syncIntervalId) {
            clearInterval(syncIntervalId);
        }
        
        if (autoSyncEnabled && syncInterval > 0) {
            syncIntervalId = setInterval(() => {
                const timeSinceLastSync = Date.now() - lastSyncTime;
                
                // 마지막 동기화 후 설정된 간격이 지났고 현재 동기화 중이 아니면 실행
                if (timeSinceLastSync >= syncInterval && !currentSyncPromise) {
                    performAutoSyncSafe('periodic', null);
                }
            }, Math.min(syncInterval, 60000)); // 최대 1분마다 체크
            
            console.log(`🔄 정기 동기화 시작: ${syncInterval / 1000}초 간격`);
        }
    }

    /**
     * 정기 동기화 중지
     */
    function stopPeriodicSync() {
        if (syncIntervalId) {
            clearInterval(syncIntervalId);
            syncIntervalId = null;
            console.log('🔄 정기 동기화 중지');
        }
    }

    /**
     * 자동 동기화 활성화/비활성화
     */
    function toggleAutoSync(enabled) {
        autoSyncEnabled = enabled;
        localStorage.setItem('autoSyncEnabled', JSON.stringify(enabled));
        
        if (enabled) {
            startPeriodicSync();
            showNotification('자동 동기화가 활성화되었습니다.', 'success');
        } else {
            stopPeriodicSync();
            showNotification('자동 동기화가 비활성화되었습니다.', 'info');
        }
        
        updateSyncStatusUI();
    }

    /**
     * 동기화 간격 설정
     */
    function setSyncInterval(intervalMinutes) {
        syncInterval = intervalMinutes * 60 * 1000; // 분을 밀리초로 변환
        localStorage.setItem('syncInterval', syncInterval.toString());
        
        if (autoSyncEnabled) {
            startPeriodicSync(); // 새로운 간격으로 재시작
        }
        
        console.log(`동기화 간격 설정: ${intervalMinutes}분`);
    }

    /**
     * 사용자 지정 파일명 설정
     */
    function setCustomFileName(fileName) {
        customFileName = fileName.trim();
        localStorage.setItem('customFileName', customFileName);
        console.log('사용자 지정 파일명:', customFileName);
    }

    /**
     * 동기화 상태 UI 업데이트
     */
    function updateSyncStatusUI() {
        // 동기화 상태 표시 요소들 업데이트
        const statusElements = document.querySelectorAll('.sync-status');
        const enabledElements = document.querySelectorAll('.sync-enabled-indicator');
        const lastSyncElements = document.querySelectorAll('.last-sync-time');
        
        const statusText = autoSyncEnabled ? '활성화' : '비활성화';
        const statusColor = autoSyncEnabled ? '#4caf50' : '#f44336';
        const lastSyncText = lastSyncTime > 0 ? 
            `마지막 동기화: ${new Date(lastSyncTime).toLocaleString('ko-KR')}` : 
            '아직 동기화되지 않음';
        
        statusElements.forEach(el => {
            el.textContent = statusText;
            el.style.color = statusColor;
        });
        
        enabledElements.forEach(el => {
            el.style.display = autoSyncEnabled ? 'inline' : 'none';
        });
        
        lastSyncElements.forEach(el => {
            el.textContent = lastSyncText;
        });
    }

    /**
     * 조용한 알림 표시
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // 기존 알림이 있다면 제거
        const existing = document.querySelector('.auto-sync-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `auto-sync-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            max-width: 350px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // 타입별 배경색
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };
        notification.style.background = colors[type] || colors.info;
        
        // 애니메이션 CSS 추가
        if (!document.querySelector('#auto-sync-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auto-sync-notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * 수동 동기화 실행 (중복 방지)
     */
    async function performManualSync(fileName = '') {
        // 이미 동기화 진행 중이면 중단
        if (currentSyncPromise) {
            showNotification('❌ 동기화가 이미 진행 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
            return false;
        }
        
        try {
            showNotification('수동 동기화 시작...', 'info');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('syncing', '수동 동기화 중');
            }
            window.isCurrentlySyncing = true;
            
            // 구글 드라이브 연결 상태 확인 (강화된 확인)
            const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
            const hasTokenData = localStorage.getItem('googleDriveToken');
            const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            const isWindowAuthenticated = window.isAuthenticated;
            
            // 토큰이 있는지 다중 검증
            const hasValidToken = hasAccessToken || hasTokenData || hasGapiToken;
            const isConnected = isWindowAuthenticated || hasValidToken;
            
            console.log('🔍 수동 동기화 연결 상태 상세:', {
                isWindowAuthenticated,
                hasAccessToken: !!hasAccessToken,
                hasTokenData: !!hasTokenData,
                hasGapiToken: !!hasGapiToken,
                isConnected,
                hasUploadFunction: typeof window.uploadBackupWithCustomName === 'function'
            });
            
            if (!isConnected || typeof window.uploadBackupWithCustomName !== 'function') {
                let errorMessage = '구글 드라이브가 연결되지 않았습니다.';
                if (!isConnected) {
                    errorMessage = '구글 드라이브에 로그인이 필요합니다.';
                } else if (typeof window.uploadBackupWithCustomName !== 'function') {
                    errorMessage = '백업 함수가 로드되지 않았습니다.';
                }
                throw new Error(errorMessage);
            }
            
            const syncFileName = fileName || generateSyncFileName('manual', null);
            const result = await window.uploadBackupWithCustomName(syncFileName, false);
            
            if (result) {
                lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', lastSyncTime.toString());
                showNotification('수동 동기화 완료!', 'success');
                updateSyncStatusUI();
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('synced', '동기화됨', '방금 전');
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('수동 동기화 실패:', error);
            showNotification('수동 동기화 실패: ' + error.message, 'error');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('error', '동기화 실패', error.message);
            }
            
            throw error;
        } finally {
            window.isCurrentlySyncing = false;
        }
    }

    /**
     * 자동 동기화 강제 활성화
     */
    function enableAutoSync() {
        console.log('🔄 자동 동기화 강제 활성화');
        autoSyncEnabled = true;
        localStorage.setItem('autoSyncEnabled', 'true');
        
        // 정기 동기화 시작
        startPeriodicSync();
        
        // UI 업데이트
        updateSyncStatusUI();
        
        // 첫 번째 동기화 실행 (3초 후, 중복 방지)
        setTimeout(() => {
            if (window.isAuthenticated && !currentSyncPromise) {
                performAutoSyncSafe('enabled', 'system');
            }
        }, 3000);
        
        return true;
    }

    /**
     * 전역 함수로 노출
     */
    /**
     * 자동 백업 시작 - 5분마다 백업 확인
     */
    function startAutoBackup() {
        console.log('📦 자동 백업 시스템 시작 - 5분마다 백업 실행');
        
        // 기존 백업 타이머 클리어
        if (window.autoBackupTimer) {
            clearInterval(window.autoBackupTimer);
        }
        
        // 5분(300,000ms)마다 백업 실행
        window.autoBackupTimer = setInterval(() => {
            performAutoBackup();
        }, 300000);
        
        // 즉시 첫 번째 백업 실행 (3초 후)
        setTimeout(() => {
            performAutoBackup();
        }, 3000);
    }

    /**
     * 자동 백업 실행
     */
    async function performAutoBackup() {
        if (!autoBackupEnabled) {
            console.log('🚫 자동 백업 비활성화됨');
            return;
        }
        
        const now = Date.now();
        const timeSinceLastBackup = now - lastBackupTime;
        
        // 최소 4분 간격으로 백업 (너무 잦은 백업 방지)
        if (timeSinceLastBackup < 240000) { // 4분
            console.log(`⏰ 백업 대기 중 (${Math.round((240000 - timeSinceLastBackup) / 1000)}초 후 백업 가능)`);
            return;
        }
        
        try {
            console.log('📦 자동 백업 시작...');
            
            // UI 상태 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('syncing', '자동 백업 중');
            }
            
            // 현재 메모 데이터 백업
            const success = await backupToCloud();
            
            if (success) {
                lastBackupTime = now;
                localStorage.setItem('lastBackupTime', lastBackupTime.toString());
                backupRetryCount = 0;
                
                console.log('✅ 자동 백업 완료');
                
                // UI 상태 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('success', '백업 완료');
                }
                
                // 성공 알림 (5초 후 자동 사라짐)
                showBackupNotification('success', `📦 자동 백업 완료 (${new Date().toLocaleTimeString()})`);
                
            } else {
                backupRetryCount++;
                if (backupRetryCount < maxBackupRetries) {
                    console.log(`❌ 백업 실패 - ${maxBackupRetries - backupRetryCount}회 재시도 남음`);
                    setTimeout(() => performAutoBackup(), 30000); // 30초 후 재시도
                } else {
                    console.log('❌ 백업 최대 재시도 횟수 초과');
                    showBackupNotification('error', '자동 백업이 실패했습니다. 나중에 다시 시도됩니다.');
                    backupRetryCount = 0; // 리셋
                }
            }
            
        } catch (error) {
            console.error('자동 백업 오류:', error);
            showBackupNotification('error', '백업 중 오류가 발생했습니다.');
        }
    }

    /**
     * 클라우드에 백업
     */
    async function backupToCloud() {
        try {
            // Google Drive 연결 상태 확인
            if (!isGoogleDriveConnected()) {
                console.log('❌ Google Drive 미연결 - 백업 생략');
                return false;
            }
            
            // 오늘 이미 백업했는지 확인
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const lastBackupDate = localStorage.getItem('lastBackupDate');
            
            if (lastBackupDate === today) {
                console.log('✅ 오늘 이미 백업 완료 - 중복 백업 방지');
                return true; // 성공으로 처리 (중복 백업 방지)
            }
            
            // 현재 모든 데이터 수집
            const backupData = {
                memos: JSON.parse(localStorage.getItem('calendarMemos') || '[]'),
                schedules: JSON.parse(localStorage.getItem('calendarSchedules') || '[]'),
                settings: {
                    fontSize: localStorage.getItem('fontSize'),
                    calendarSize: JSON.parse(localStorage.getItem('calendarSize') || '{}'),
                    theme: localStorage.getItem('theme'),
                    startOfWeek: localStorage.getItem('startOfWeek')
                },
                backupTime: new Date().toISOString(),
                version: '2.0'
            };
            
            // 백업 파일명 생성
            const fileName = customFileName || `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            // Google Drive API를 통해 업로드 (기존 함수 사용)
            if (typeof window.uploadBackupWithCustomName === 'function') {
                const result = await window.uploadBackupWithCustomName(fileName, true); // silent=true for auto backup
                // result에 id나 fileId가 있으면 성공으로 처리
                const isSuccess = result && (result.success || result.id || result.fileId || result.fileLink);
                
                // 백업 성공 시 오늘 날짜 저장
                if (isSuccess) {
                    const today = new Date().toISOString().split('T')[0];
                    localStorage.setItem('lastBackupDate', today);
                    console.log(`✅ 백업 성공 - 날짜 기록: ${today}`);
                }
                
                return isSuccess;
            } else if (typeof window.uploadFileToGoogleDrive === 'function') {
                const result = await window.uploadFileToGoogleDrive(fileName, JSON.stringify(backupData, null, 2), 'application/json');
                return result && result.id;
            } else if (typeof window.uploadToGoogleDrive === 'function') {
                const result = await window.uploadToGoogleDrive(fileName, JSON.stringify(backupData, null, 2));
                return result.success;
            } else {
                console.log('❌ Google Drive 업로드 함수 없음 - 사용 가능한 함수들:', Object.keys(window).filter(key => key.includes('upload')));
                return false;
            }
            
        } catch (error) {
            console.error('클라우드 백업 오류:', error);
            return false;
        }
    }

    /**
     * 클라우드에서 최신 업데이트 확인
     */
    async function checkForCloudUpdates() {
        try {
            if (!isGoogleDriveConnected()) {
                console.log('📡 Google Drive 미연결 - 업데이트 확인 생략');
                return;
            }
            
            console.log('📡 클라우드 업데이트 확인 중...');
            
            // Google Drive에서 백업 파일 목록 가져오기
            if (typeof window.listGoogleDriveFiles === 'function') {
                const files = await window.listGoogleDriveFiles();
                const backupFiles = files.filter(file => 
                    file.name.includes('calendar-backup') && file.name.endsWith('.json')
                );
                
                if (backupFiles.length > 0) {
                    // 가장 최신 백업 파일 찾기
                    const latestBackup = backupFiles.reduce((latest, current) => 
                        new Date(current.modifiedTime) > new Date(latest.modifiedTime) ? current : latest
                    );
                    
                    const cloudUpdateTime = new Date(latestBackup.modifiedTime).getTime();
                    const localUpdateTime = parseInt(localStorage.getItem('lastBackupTime') || '0');
                    
                    // 클라우드가 더 최신이면 동기화 제안
                    if (cloudUpdateTime > localUpdateTime + 60000) { // 1분 차이 이상
                        console.log('🆕 클라우드에 더 최신 백업 발견');
                        showSyncPrompt(latestBackup);
                    } else {
                        console.log('✅ 로컬 데이터가 최신입니다');
                    }
                } else {
                    console.log('📭 클라우드에 백업 파일 없음');
                }
            }
            
        } catch (error) {
            console.error('클라우드 업데이트 확인 오류:', error);
        }
    }

    /**
     * 동기화 확인 프롬프트 표시
     */
    function showSyncPrompt(backupFile) {
        const syncTime = new Date(backupFile.modifiedTime).toLocaleString();
        const message = `🔄 클라우드에서 더 최신 백업을 발견했습니다.\n\n백업 시간: ${syncTime}\n파일명: ${backupFile.name}\n\n이 백업으로 동기화하시겠습니까?\n(현재 데이터는 덮어쓰여집니다)`;
        
        if (confirm(message)) {
            restoreFromCloud(backupFile.id, backupFile.name);
        }
    }

    /**
     * 클라우드에서 복원
     */
    async function restoreFromCloud(fileId, fileName = 'backup') {
        try {
            console.log('📥 클라우드에서 데이터 복원 중...', fileName);
            
            // UI 상태 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('syncing', '클라우드에서 복원 중');
            }
            
            showBackupNotification('info', '클라우드에서 데이터를 복원하고 있습니다...');
            
            // Google Drive에서 파일 다운로드 (GAPI 직접 사용)
            if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
                throw new Error('Google Drive API가 초기화되지 않았습니다');
            }

            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            const content = response.body || response.result;
            const backupData = JSON.parse(content);
            
            // 데이터 복원
            if (backupData.memos) {
                localStorage.setItem('calendarMemos', JSON.stringify(backupData.memos));
                console.log('✅ 메모 데이터 복원 완료:', Object.keys(backupData.memos).length, '개');
            }
            if (backupData.schedules) {
                localStorage.setItem('calendarSchedules', JSON.stringify(backupData.schedules));
                console.log('✅ 일정 데이터 복원 완료:', backupData.schedules.length, '개');
            }
            if (backupData.settings) {
                const settings = backupData.settings;
                if (settings.fontSize) localStorage.setItem('fontSize', settings.fontSize);
                if (settings.calendarSize) localStorage.setItem('calendarSize', JSON.stringify(settings.calendarSize));
                if (settings.theme) localStorage.setItem('theme', settings.theme);
                if (settings.startOfWeek) localStorage.setItem('startOfWeek', settings.startOfWeek);
                console.log('✅ 설정 데이터 복원 완료');
            }
            
            // 복원 완료 후 상태 업데이트
            lastBackupTime = Date.now();
            localStorage.setItem('lastBackupTime', lastBackupTime.toString());
            
            console.log('✅ 클라우드 복원 완료');
            showBackupNotification('success', `📥 ${fileName}에서 데이터를 성공적으로 복원했습니다.`);
            
            // 페이지 새로고침하여 복원된 데이터 적용
            setTimeout(() => {
                if (confirm('✅ 복원이 완료되었습니다!\n\n복원된 데이터를 적용하려면 페이지를 새로고침해야 합니다.\n지금 새로고침하시겠습니까?')) {
                    location.reload();
                }
            }, 2000);
            
            return true;
                
        } catch (error) {
            console.error('❌ 클라우드 복원 오류:', error);
            showBackupNotification('error', `❌ 복원 실패: ${error.message}`);
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('error', '복원 실패', error.message);
            }
            
            return false;
        }
    }

    /**
     * Google Drive 연결 상태 확인
     */
    function isGoogleDriveConnected() {
        const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
        const hasTokenData = localStorage.getItem('googleDriveToken');
        const isWindowAuthenticated = window.isAuthenticated;
        const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
        
        return isWindowAuthenticated || hasAccessToken || hasTokenData || hasGapiToken;
    }

    /**
     * 백업 알림 표시
     */
    function showBackupNotification(type, message) {
        // 기존 알림 제거
        const existing = document.querySelector('.backup-notification');
        if (existing) {
            existing.remove();
        }
        
        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `backup-notification backup-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            opacity: 0;
            transition: opacity 0.3s ease;
            line-height: 1.4;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 페이드 인
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // 5초 후 자동 제거 (오류는 8초)
        const delay = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, delay);
    }

    /**
     * 수동 백업 실행
     */
    async function performManualBackup() {
        try {
            console.log('🚀 수동 백업 시작');
            showBackupNotification('info', '수동 백업을 시작합니다...');
            
            // Google Drive의 기존 백업 함수 사용
            if (typeof window.uploadBackupWithCustomName === 'function') {
                // 수동 백업은 시간 정보 포함하여 중복 허용
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
                const fileName = `manual-backup-${dateStr}-${timeStr}.json`;
                const result = await window.uploadBackupWithCustomName(fileName, false); // silent=false for manual backup
                
                if (result && (result.success || result.id || result.fileId || result.fileLink)) {
                    lastBackupTime = Date.now();
                    localStorage.setItem('lastBackupTime', lastBackupTime.toString());
                    
                    const actualFileName = result.fileName || fileName;
                    const memoCount = result.memoCount || '';
                    showBackupNotification('success', `✅ 수동 백업 완료!\n파일명: ${actualFileName}\n메모: ${memoCount}개\n시간: ${new Date().toLocaleString()}`);
                    console.log('✅ 수동 백업 성공:', result);
                } else {
                    showBackupNotification('error', `❌ 수동 백업 실패: 결과 없음`);
                    console.error('❌ 수동 백업 실패:', result);
                }
            } else {
                throw new Error('Google Drive 업로드 함수가 없습니다');
            }
        } catch (error) {
            showBackupNotification('error', `❌ 수동 백업 중 오류: ${error.message}`);
            console.error('수동 백업 오류:', error);
        }
    }

    /**
     * 클라우드 백업 목록 확인 및 복원 UI
     */
    async function checkCloudBackups() {
        try {
            console.log('🔍 클라우드 백업 목록 확인 중...');
            showBackupNotification('info', '클라우드에서 백업 목록을 확인하고 있습니다...');
            
            // GAPI를 통해 직접 파일 목록 조회
            if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
                throw new Error('Google Drive API가 초기화되지 않았습니다');
            }

            const response = await gapi.client.drive.files.list({
                q: "trashed=false and (name contains 'calendar-backup' or name contains 'manual-backup' or name contains '달력메모')",
                orderBy: 'createdTime desc',
                pageSize: 20,
                fields: 'files(id, name, createdTime, size, modifiedTime)'
            });

            const backupFiles = response.result.files || [];

            if (backupFiles.length === 0) {
                showBackupNotification('info', '📭 클라우드에 백업 파일이 없습니다');
                return;
            }

            // 백업 선택 UI 표시
            let options = '🔍 클라우드 백업 목록:\n\n';
            backupFiles.slice(0, 10).forEach((file, index) => {
                const date = new Date(file.modifiedTime || file.createdTime).toLocaleString();
                const size = file.size ? `${(file.size / 1024).toFixed(1)}KB` : '크기 불명';
                options += `${index + 1}. ${file.name}\n   📅 ${date}\n   💾 ${size}\n\n`;
            });

            options += '복원할 백업을 선택하세요 (1-' + Math.min(10, backupFiles.length) + ', 취소는 0):';
            
            const choice = prompt(options);
            const choiceNum = parseInt(choice);
            
            if (choiceNum > 0 && choiceNum <= backupFiles.length) {
                const selectedFile = backupFiles[choiceNum - 1];
                const confirmMsg = `📥 선택한 백업으로 복원하시겠습니까?\n\n파일: ${selectedFile.name}\n시간: ${new Date(selectedFile.modifiedTime || selectedFile.createdTime).toLocaleString()}\n\n⚠️ 현재 데이터는 덮어쓰여집니다!`;
                
                if (confirm(confirmMsg)) {
                    await restoreFromCloud(selectedFile.id, selectedFile.name);
                }
            }
            
        } catch (error) {
            showBackupNotification('error', `❌ 클라우드 백업 확인 실패: ${error.message}`);
            console.error('클라우드 백업 확인 오류:', error);
        }
    }

    /**
     * 백업 상태 정보 표시
     */
    function viewBackupStatus() {
        const status = window.autoSyncSystem.getBackupStatus();
        const syncEnabled = window.autoSyncSystem.isEnabled();
        
        let statusMessage = '📊 백업 상태 정보\n\n';
        statusMessage += `🔄 자동 동기화: ${syncEnabled ? '✅ 활성화' : '❌ 비활성화'}\n`;
        statusMessage += `📦 자동 백업: ${status.autoBackupEnabled ? '✅ 활성화' : '❌ 비활성화'}\n`;
        statusMessage += `⏰ 백업 간격: 5분\n`;
        statusMessage += `📅 마지막 백업: ${status.lastBackupTime}\n`;
        statusMessage += `⏳ 경과 시간: ${status.timeSinceLastBackup}분 전\n\n`;
        
        if (status.autoBackupEnabled) {
            const nextBackup = Math.max(0, 5 - status.timeSinceLastBackup);
            statusMessage += `⏭️ 다음 백업까지: ${nextBackup}분`;
        }
        
        alert(statusMessage);
        console.log('백업 상태:', status);
    }

    // 전역 함수로 노출
    window.performManualBackup = performManualBackup;
    window.checkCloudBackups = checkCloudBackups;
    window.viewBackupStatus = viewBackupStatus;

    window.autoSyncSystem = {
        toggle: toggleAutoSync,
        enable: enableAutoSync,
        setSyncInterval: setSyncInterval,
        setCustomFileName: setCustomFileName,
        performManualSync: performManualSync,
        updateUI: updateSyncStatusUI,
        isEnabled: () => autoSyncEnabled,
        getInterval: () => syncInterval / 60000, // 분 단위로 반환
        getCustomFileName: () => customFileName,
        getLastSyncTime: () => lastSyncTime,
        // 새로운 백업 기능들
        performBackup: performAutoBackup,
        restoreFromCloud: restoreFromCloud,
        checkCloudUpdates: checkForCloudUpdates,
        enableAutoBackup: () => {
            autoBackupEnabled = true;
            localStorage.setItem('autoBackupEnabled', 'true');
            startAutoBackup();
            console.log('✅ 자동 백업 활성화');
        },
        disableAutoBackup: () => {
            autoBackupEnabled = false;
            localStorage.setItem('autoBackupEnabled', 'false');
            if (window.autoBackupTimer) {
                clearInterval(window.autoBackupTimer);
            }
            console.log('❌ 자동 백업 비활성화');
        },
        getBackupStatus: () => ({
            autoBackupEnabled,
            lastBackupTime: new Date(lastBackupTime).toLocaleString(),
            timeSinceLastBackup: Math.round((Date.now() - lastBackupTime) / 1000 / 60) // 분 단위
        })
    };

    /**
     * 초기화
     */
    function initialize() {
        // 현재 데이터 해시 설정 (초기화 시 기준점 설정)
        lastSyncedDataHash = getCurrentDataHash();
        console.log(`🔧 초기 데이터 해시 설정: ${lastSyncedDataHash}`);
        
        // localStorage 모니터링 시작
        setupLocalStorageMonitoring();
        
        // 자동 동기화가 활성화되어 있으면 정기 동기화 시작
        if (autoSyncEnabled) {
            startPeriodicSync();
        }
        
        // UI 상태 업데이트
        setTimeout(() => {
            updateSyncStatusUI();
        }, 1000);
        
        console.log('🔄 자동 동기화 시스템 초기화 완료');
        console.log('설정:', { autoSyncEnabled, syncInterval, customFileName, lastSyncTime, initialHash: lastSyncedDataHash });
        
        // 자동 백업 기능 활성화 시 5분마다 백업 확인
        if (autoBackupEnabled) {
            startAutoBackup();
        }
        
        // 시작 시 클라우드에서 최신 데이터 확인
        setTimeout(() => {
            checkForCloudUpdates();
        }, 3000);
    }

    // 페이지 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();