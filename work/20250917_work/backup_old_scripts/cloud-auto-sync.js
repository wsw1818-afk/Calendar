/**
 * 클라우드 자동 동기화 시스템
 * Google Drive를 통한 실시간 백업 및 복원
 */

class CloudAutoSyncSystem {
    constructor() {
        this.version = '1.0.0';
        this.syncFileName = 'calendar-app-auto-backup.json';
        this.syncInterval = 5 * 60 * 1000; // 5분마다 동기화
        this.lastSyncTime = 0;
        this.syncTimer = null;
        this.isInitialized = false;
        this.deviceId = this.generateDeviceId();
        
        this.init();
    }
    
    async init() {
        console.log('☁️ 클라우드 자동 동기화 시스템 초기화');
        
        // Google API 로드 대기
        await this.waitForGoogleAPI();
        
        // 인증 상태 확인 및 자동 동기화 시작
        this.checkAuthAndStartSync();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // UI 업데이트
        this.updateSyncUI();
        
        this.isInitialized = true;
        console.log('✅ 클라우드 자동 동기화 시스템 초기화 완료');
    }
    
    /**
     * Google API 로드 대기
     */
    async waitForGoogleAPI() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof gapi !== 'undefined' && 
                    typeof google !== 'undefined' &&
                    google.accounts) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * 고유 디바이스 ID 생성
     */
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
    
    /**
     * 인증 상태 확인 및 자동 동기화 시작
     */
    checkAuthAndStartSync() {
        // 인증 상태 변화 감지
        setInterval(() => {
            const isAuthenticated = this.isGoogleAuthenticated();
            
            if (isAuthenticated && !this.syncTimer) {
                console.log('🔗 Google Drive 인증 감지 - 자동 동기화 시작');
                this.startAutoSync();
            } else if (!isAuthenticated && this.syncTimer) {
                console.log('🔌 Google Drive 인증 해제 - 자동 동기화 중지');
                this.stopAutoSync();
            }
        }, 10000); // 10초마다 확인
    }
    
    /**
     * Google 인증 상태 확인
     */
    isGoogleAuthenticated() {
        const accessToken = localStorage.getItem('googleAccessToken') || 
                          localStorage.getItem('googleDriveAccessToken');
        
        if (!accessToken) return false;
        
        // 토큰 만료 시간 확인
        const tokenData = JSON.parse(localStorage.getItem('googleTokenData') || '{}');
        if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
            console.log('⚠️ Google 토큰 만료됨');
            return false;
        }
        
        return true;
    }
    
    /**
     * 자동 동기화 시작
     */
    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        console.log('🚀 자동 동기화 시작 - 5분 간격');
        
        // 즉시 한 번 동기화
        this.performSync();
        
        // 주기적 동기화 설정
        this.syncTimer = setInterval(() => {
            this.performSync();
        }, this.syncInterval);
        
        this.updateSyncUI();
    }
    
    /**
     * 자동 동기화 중지
     */
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        console.log('⏹️ 자동 동기화 중지');
        this.updateSyncUI();
    }
    
    /**
     * 동기화 수행
     */
    async performSync() {
        if (!this.isGoogleAuthenticated()) {
            console.log('❌ Google 인증되지 않음 - 동기화 건너뛰기');
            return;
        }
        
        try {
            console.log('🔄 클라우드 동기화 시작...');
            
            // 1. 클라우드에서 최신 데이터 확인
            const cloudData = await this.downloadFromCloud();
            
            // 2. 로컬 데이터와 비교
            const localData = this.getLocalData();
            
            // 3. 병합 및 동기화
            const syncResult = await this.syncData(localData, cloudData);
            
            // 4. UI 업데이트
            this.updateSyncUI();
            
            console.log('✅ 클라우드 동기화 완료:', syncResult);
            
        } catch (error) {
            console.error('❌ 클라우드 동기화 실패:', error);
            this.showSyncNotification(`동기화 실패: ${error.message}`, 'error');
        }
    }
    
    /**
     * 클라우드에서 데이터 다운로드
     */
    async downloadFromCloud() {
        const accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
            throw new Error('Google 인증 토큰이 없습니다');
        }
        
        try {
            // 설정된 폴더 확인
            let searchQuery = `name='${this.syncFileName}'`;
            let searchUrl = 'https://www.googleapis.com/drive/v3/files?';
            let folderId = null;
            
            if (window.driveFolderManager) {
                const folderSettings = window.driveFolderManager.getCurrentSettings();
                if (folderSettings.folderId) {
                    folderId = folderSettings.folderId;
                    searchQuery += ` and '${folderId}' in parents`;
                    searchUrl += `q=${encodeURIComponent(searchQuery)}`;
                } else {
                    searchUrl += `q=${encodeURIComponent(searchQuery)}&spaces=appDataFolder`;
                }
            } else {
                searchUrl += `q=${encodeURIComponent(searchQuery)}&spaces=appDataFolder`;
            }
            
            // Google Drive에서 파일 검색
            const searchResponse = await fetch(searchUrl, 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!searchResponse.ok) {
                throw new Error('Google Drive 파일 검색 실패');
            }
            
            const searchData = await searchResponse.json();
            
            if (searchData.files && searchData.files.length > 0) {
                const fileId = searchData.files[0].id;
                
                // 파일 내용 다운로드
                const downloadResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );
                
                if (!downloadResponse.ok) {
                    throw new Error('Google Drive 파일 다운로드 실패');
                }
                
                const cloudData = await downloadResponse.json();
                console.log('📥 클라우드 데이터 다운로드 완료');
                return cloudData;
            } else {
                console.log('📭 클라우드에 백업 파일이 없음');
                return null;
            }
            
        } catch (error) {
            console.error('❌ 클라우드 다운로드 오류:', error);
            throw error;
        }
    }
    
    /**
     * 클라우드에 데이터 업로드
     */
    async uploadToCloud(data) {
        const accessToken = localStorage.getItem('googleAccessToken');
        if (!accessToken) {
            throw new Error('Google 인증 토큰이 없습니다');
        }
        
        // 설정된 폴더 확인
        let folderId = null;
        if (window.driveFolderManager) {
            const folderSettings = window.driveFolderManager.getCurrentSettings();
            if (folderSettings.folderId) {
                folderId = folderSettings.folderId;
            } else if (folderSettings.isAuthenticated) {
                // 기본 폴더 생성/확인
                try {
                    const backupFolder = await window.driveFolderManager.ensureBackupFolder();
                    folderId = backupFolder.id;
                } catch (error) {
                    console.warn('⚠️ 백업 폴더 생성 실패, AppData 폴더 사용:', error);
                }
            }
        }
        
        const uploadData = {
            ...data,
            syncInfo: {
                deviceId: this.deviceId,
                lastModified: Date.now(),
                version: this.version,
                folderId: folderId
            }
        };
        
        const fileContent = JSON.stringify(uploadData, null, 2);
        
        try {
            // 기존 파일 검색 (폴더 지정)
            let searchQuery = `name='${this.syncFileName}'`;
            let searchUrl = 'https://www.googleapis.com/drive/v3/files?';
            
            if (folderId) {
                searchQuery += ` and '${folderId}' in parents`;
                searchUrl += `q=${encodeURIComponent(searchQuery)}`;
            } else {
                searchUrl += `q=${encodeURIComponent(searchQuery)}&spaces=appDataFolder`;
            }
            
            const searchResponse = await fetch(searchUrl,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            const searchData = await searchResponse.json();
            let fileId = null;
            
            if (searchData.files && searchData.files.length > 0) {
                fileId = searchData.files[0].id;
            }
            
            // 멀티파트 업로드 준비
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
            
            const metadata = {
                'name': this.syncFileName,
                'parents': fileId ? undefined : (folderId ? [folderId] : ['appDataFolder'])
            };
            
            const multipartRequestBody = 
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
                close_delim;
            
            const method = fileId ? 'PATCH' : 'POST';
            const url = fileId ? 
                `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart` :
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            
            const uploadResponse = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': `multipart/related; boundary="${boundary}"`
                },
                body: multipartRequestBody
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Google Drive 업로드 실패');
            }
            
            const result = await uploadResponse.json();
            console.log('📤 클라우드 업로드 완료:', result.id);
            
            return result;
            
        } catch (error) {
            console.error('❌ 클라우드 업로드 오류:', error);
            throw error;
        }
    }
    
    /**
     * 로컬 데이터 가져오기
     */
    getLocalData() {
        const backupKeys = [
            'memos', 'calendarMemos', 'stickyMemos',
            'calendarSettings', 'fontScale', 'calendarSize', 'daySize',
            'weekStartDay', 'theme', 'confirmedAlarms'
        ];
        
        const localData = {
            version: this.version,
            timestamp: Date.now(),
            deviceId: this.deviceId,
            data: {}
        };
        
        backupKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    localData.data[key] = JSON.parse(value);
                } catch (e) {
                    localData.data[key] = value;
                }
            }
        });
        
        return localData;
    }
    
    /**
     * 로컬과 클라우드 데이터 동기화
     */
    async syncData(localData, cloudData) {
        let syncResult = {
            action: 'none',
            conflicts: [],
            updated: []
        };
        
        // 클라우드 데이터가 없으면 로컬 데이터 업로드
        if (!cloudData) {
            await this.uploadToCloud(localData);
            syncResult.action = 'upload';
            syncResult.updated.push('전체 데이터 업로드');
            this.showSyncNotification('✅ 클라우드에 백업 완료', 'success');
            return syncResult;
        }
        
        // 타임스탬프 비교
        const localTime = localData.timestamp;
        const cloudTime = cloudData.syncInfo?.lastModified || cloudData.timestamp;
        
        if (Math.abs(localTime - cloudTime) < 30000) { // 30초 이내면 동일한 것으로 간주
            console.log('📊 로컬과 클라우드 데이터가 동일함');
            syncResult.action = 'none';
            return syncResult;
        }
        
        if (localTime > cloudTime) {
            // 로컬이 더 최신 - 클라우드에 업로드
            await this.uploadToCloud(localData);
            syncResult.action = 'upload';
            syncResult.updated.push('클라우드 업데이트');
            this.showSyncNotification('📤 클라우드 업데이트 완료', 'success');
        } else {
            // 클라우드가 더 최신 - 로컬에 적용
            await this.applyCloudData(cloudData);
            syncResult.action = 'download';
            syncResult.updated.push('로컬 업데이트');
            this.showSyncNotification('📥 클라우드에서 동기화 완료', 'success');
        }
        
        // 마지막 동기화 시간 업데이트
        this.lastSyncTime = Date.now();
        localStorage.setItem('lastCloudSync', this.lastSyncTime.toString());
        
        return syncResult;
    }
    
    /**
     * 클라우드 데이터를 로컬에 적용
     */
    async applyCloudData(cloudData) {
        if (!cloudData.data) return;
        
        console.log('📥 클라우드 데이터를 로컬에 적용 중...');
        
        Object.entries(cloudData.data).forEach(([key, value]) => {
            try {
                if (typeof value === 'object') {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
                console.log(`✅ 동기화 적용: ${key}`);
            } catch (error) {
                console.error(`❌ 동기화 적용 실패: ${key}`, error);
            }
        });
        
        // UI 새로고침 트리거
        if (typeof window.memoSystemRefresh === 'function') {
            window.memoSystemRefresh();
        }
        
        console.log('✅ 클라우드 데이터 적용 완료');
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 데이터 변경 감지
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            originalSetItem.call(localStorage, key, value);
            
            // 메모 관련 데이터 변경 시 즉시 동기화
            const syncKeys = ['memos', 'calendarMemos', 'stickyMemos'];
            if (syncKeys.includes(key) && this.isGoogleAuthenticated()) {
                console.log(`📝 데이터 변경 감지: ${key} - 즉시 동기화 예약`);
                this.scheduleImmediateSync();
            }
        };
        
        // 창 포커스 시 동기화
        window.addEventListener('focus', () => {
            if (this.isGoogleAuthenticated()) {
                console.log('👁️ 창 포커스 - 동기화 확인');
                this.performSync();
            }
        });
        
        // 페이지 종료 시 최종 동기화
        window.addEventListener('beforeunload', () => {
            if (this.isGoogleAuthenticated()) {
                navigator.sendBeacon('/api/sync', JSON.stringify(this.getLocalData()));
            }
        });
    }
    
    /**
     * 즉시 동기화 예약 (중복 방지)
     */
    scheduleImmediateSync() {
        if (this.immediateSyncTimer) {
            clearTimeout(this.immediateSyncTimer);
        }
        
        this.immediateSyncTimer = setTimeout(() => {
            this.performSync();
        }, 5000); // 5초 후 동기화
    }
    
    /**
     * 동기화 UI 업데이트
     */
    updateSyncUI() {
        const syncStatus = document.getElementById('cloudSyncStatus');
        if (syncStatus) {
            const isAuth = this.isGoogleAuthenticated();
            const isRunning = !!this.syncTimer;
            
            let statusText = '';
            let statusClass = '';
            
            if (!isAuth) {
                statusText = '☁️ 오프라인';
                statusClass = 'offline';
            } else if (isRunning) {
                const lastSync = this.lastSyncTime ? 
                    new Date(this.lastSyncTime).toLocaleTimeString() : '없음';
                statusText = `🔄 자동 동기화 중 (마지막: ${lastSync})`;
                statusClass = 'syncing';
            } else {
                statusText = '⚠️ 동기화 중지됨';
                statusClass = 'stopped';
            }
            
            syncStatus.innerHTML = `
                <span class="sync-status ${statusClass}">${statusText}</span>
            `;
        }
        
        // 백업 모달의 동기화 버튼 업데이트
        this.updateBackupModalSyncButton();
    }
    
    /**
     * 백업 모달의 동기화 버튼 업데이트
     */
    updateBackupModalSyncButton() {
        const syncBtn = document.querySelector('.sync-btn');
        if (syncBtn) {
            const isAuth = this.isGoogleAuthenticated();
            const isRunning = !!this.syncTimer;
            
            if (!isAuth) {
                syncBtn.textContent = '🔗 Google Drive 연결 필요';
                syncBtn.disabled = true;
            } else if (isRunning) {
                syncBtn.textContent = '⏹️ 자동 동기화 중지';
                syncBtn.disabled = false;
                syncBtn.onclick = () => this.stopAutoSync();
            } else {
                syncBtn.textContent = '🚀 자동 동기화 시작';
                syncBtn.disabled = false;
                syncBtn.onclick = () => this.startAutoSync();
            }
        }
    }
    
    /**
     * 동기화 알림 표시
     */
    showSyncNotification(message, type = 'info') {
        console.log(`🔔 [SYNC ${type.toUpperCase()}] ${message}`);
        
        // 기존 포터블 백업 시스템의 알림 사용
        if (window.portableBackup) {
            window.portableBackup.showNotification(message, type);
        }
    }
    
    /**
     * 수동 동기화 실행
     */
    async manualSync() {
        console.log('🔄 수동 동기화 실행');
        await this.performSync();
    }
    
    /**
     * 동기화 상태 정보 반환
     */
    getSyncStatus() {
        return {
            isAuthenticated: this.isGoogleAuthenticated(),
            isAutoSyncRunning: !!this.syncTimer,
            lastSyncTime: this.lastSyncTime,
            deviceId: this.deviceId,
            syncInterval: this.syncInterval
        };
    }
}

// 전역 인스턴스 생성
window.cloudAutoSync = new CloudAutoSyncSystem();

// 포터블 백업 시스템과 연동
if (window.portableBackup) {
    // 포터블 백업 시스템의 클라우드 동기화 함수 오버라이드
    window.portableBackup.syncWithCloud = function() {
        if (window.cloudAutoSync.isGoogleAuthenticated()) {
            window.cloudAutoSync.manualSync();
        } else {
            this.showNotification('☁️ Google Drive 연결이 필요합니다', 'warning');
        }
    };
}

console.log('✅ 클라우드 자동 동기화 시스템 로드 완료');
console.log('🔄 사용법: cloudAutoSync.manualSync() 또는 자동 동기화 활성화');