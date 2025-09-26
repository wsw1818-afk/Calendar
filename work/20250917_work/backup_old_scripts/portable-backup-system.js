/**
 * 달력앱 포터블 백업 및 복원 시스템
 * 모든 데이터를 백업/복원하여 다른 환경에서도 동일하게 사용 가능
 */

class PortableBackupSystem {
    constructor() {
        this.version = '1.0.0';
        this.backupKeys = [
            // 메모 데이터
            'memos',
            'calendarMemos', 
            'stickyMemos',
            'dateMemos',
            
            // 설정 데이터
            'calendarSettings',
            'fontScale',
            'calendarSize',
            'daySize',
            'weekStartDay',
            'theme',
            
            // Google Drive 설정
            'googleDriveSettings',
            'googleClientId',
            'googleApiKey',
            'googleAccessToken',
            'googleTokenData',
            'googleDriveToken',
            'googleDriveAccessToken',
            
            // 기타 설정
            'lockState',
            'confirmedAlarms',
            'deletionTracker',
            'autoSyncSettings'
        ];
        
        this.init();
    }
    
    init() {
        console.log('📦 포터블 백업 시스템 초기화');
        this.createBackupUI();
        this.setupEventListeners();
    }
    
    /**
     * 전체 데이터 백업 생성
     */
    createFullBackup() {
        console.log('📤 전체 데이터 백업 생성 시작...');
        
        const backupData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            data: {}
        };
        
        // localStorage 데이터 수집
        this.backupKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    // JSON 파싱 시도
                    backupData.data[key] = JSON.parse(value);
                } catch (e) {
                    // 일반 문자열로 저장
                    backupData.data[key] = value;
                }
            }
        });
        
        // 추가 데이터 수집
        this.collectAdditionalData(backupData);
        
        console.log('✅ 백업 데이터 수집 완료:', backupData);
        return backupData;
    }
    
    /**
     * 추가 데이터 수집 (파일, 설정 등)
     */
    collectAdditionalData(backupData) {
        // 브라우저 정보
        backupData.browserInfo = {
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
        
        // 현재 메모 통계
        const memos = JSON.parse(localStorage.getItem('memos') || '[]');
        const calendarMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        
        backupData.statistics = {
            totalMemos: memos.length,
            calendarMemos: calendarMemos.length,
            lastBackup: new Date().toISOString(),
            dataSize: JSON.stringify(backupData.data).length
        };
    }
    
    /**
     * 백업 파일 다운로드
     */
    downloadBackup() {
        const backupData = this.createFullBackup();
        const filename = `calendar-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('💾 백업 파일 다운로드 완료:', filename);
        this.showNotification(`✅ 백업 완료: ${filename}`, 'success');
    }
    
    /**
     * 백업 파일에서 데이터 복원
     */
    async restoreFromBackup(file) {
        console.log('📥 백업 파일에서 데이터 복원 시작...');
        
        try {
            const text = await file.text();
            const backupData = JSON.parse(text);
            
            // 백업 파일 유효성 검증
            if (!this.validateBackupFile(backupData)) {
                throw new Error('유효하지 않은 백업 파일입니다.');
            }
            
            // 현재 데이터 임시 백업
            const tempBackup = this.createFullBackup();
            
            console.log('🔄 데이터 복원 중...');
            
            // 데이터 복원
            Object.entries(backupData.data).forEach(([key, value]) => {
                try {
                    if (typeof value === 'object') {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        localStorage.setItem(key, value);
                    }
                    console.log(`✅ 복원 완료: ${key}`);
                } catch (error) {
                    console.error(`❌ 복원 실패: ${key}`, error);
                }
            });
            
            console.log('✅ 데이터 복원 완료');
            
            // 페이지 새로고침으로 적용
            this.showNotification('✅ 데이터 복원 완료! 페이지를 새로고침합니다.', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ 백업 복원 실패:', error);
            this.showNotification(`❌ 복원 실패: ${error.message}`, 'error');
        }
    }
    
    /**
     * 백업 파일 유효성 검증
     */
    validateBackupFile(backupData) {
        if (!backupData || typeof backupData !== 'object') {
            return false;
        }
        
        if (!backupData.version || !backupData.timestamp || !backupData.data) {
            return false;
        }
        
        // 필수 데이터 키 확인
        const hasEssentialData = ['memos', 'calendarMemos'].some(key => 
            backupData.data.hasOwnProperty(key)
        );
        
        return hasEssentialData;
    }
    
    /**
     * 데이터 동기화 (클라우드 백업과 로컬 데이터 병합)
     */
    syncWithCloud() {
        console.log('☁️ 클라우드와 데이터 동기화 시작...');
        if (window.cloudAutoSync && window.cloudAutoSync.isGoogleAuthenticated()) {
            window.cloudAutoSync.manualSync();
        } else {
            this.showNotification('☁️ Google Drive 연결이 필요합니다. 통합 클라우드 설정에서 연결하세요.', 'warning');
        }
    }
    
    /**
     * 자동 동기화 토글
     */
    toggleAutoSync() {
        if (!window.cloudAutoSync) {
            this.showNotification('❌ 자동 동기화 시스템이 로드되지 않았습니다.', 'error');
            return;
        }
        
        if (!window.cloudAutoSync.isGoogleAuthenticated()) {
            this.showNotification('🔗 먼저 Google Drive에 연결해주세요.', 'warning');
            return;
        }
        
        const status = window.cloudAutoSync.getSyncStatus();
        
        if (status.isAutoSyncRunning) {
            window.cloudAutoSync.stopAutoSync();
            this.showNotification('⏹️ 자동 동기화를 중지했습니다.', 'info');
        } else {
            window.cloudAutoSync.startAutoSync();
            this.showNotification('🚀 자동 동기화를 시작했습니다. (5분 간격)', 'success');
        }
        
        // UI 업데이트
        setTimeout(() => {
            this.updateSyncButtonText();
        }, 500);
    }
    
    /**
     * 동기화 버튼 텍스트 업데이트
     */
    updateSyncButtonText() {
        const autoSyncBtn = document.querySelector('.auto-sync-toggle-btn');
        if (autoSyncBtn && window.cloudAutoSync) {
            const status = window.cloudAutoSync.getSyncStatus();
            
            if (!status.isAuthenticated) {
                autoSyncBtn.textContent = '🔗 Google Drive 연결 필요';
                autoSyncBtn.disabled = true;
            } else if (status.isAutoSyncRunning) {
                autoSyncBtn.textContent = '⏹️ 자동 동기화 중지';
                autoSyncBtn.disabled = false;
            } else {
                autoSyncBtn.textContent = '🚀 자동 동기화 시작';
                autoSyncBtn.disabled = false;
            }
        }
    }
    
    /**
     * 백업/복원 UI 생성
     */
    createBackupUI() {
        // 백업 버튼을 기존 액션 버튼 영역에 추가
        const actionButtons = document.querySelector('.action-bar');
        if (actionButtons) {
            const backupBtn = document.createElement('button');
            backupBtn.id = 'backupBtn';
            backupBtn.innerHTML = '💾 백업';
            backupBtn.title = '데이터 백업 및 복원';
            backupBtn.style.cssText = `
                background: linear-gradient(45deg, #6f42c1, #5a32a3);
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9em;
                font-weight: bold;
                transition: all 0.3s ease;
                margin: 0 5px;
            `;
            
            // hover 효과
            backupBtn.onmouseenter = () => {
                backupBtn.style.background = 'linear-gradient(45deg, #5a32a3, #4c2a85)';
                backupBtn.style.transform = 'translateY(-2px)';
                backupBtn.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.3)';
            };
            
            backupBtn.onmouseleave = () => {
                backupBtn.style.background = 'linear-gradient(45deg, #6f42c1, #5a32a3)';
                backupBtn.style.transform = 'translateY(0)';
                backupBtn.style.boxShadow = 'none';
            };
            
            actionButtons.appendChild(backupBtn);
        }
    }
    
    /**
     * 백업 모달 생성
     */
    createBackupModal() {
        const modalHtml = `
            <div class="modal-backdrop" id="backupModalBackdrop">
                <div class="modal-container backup-modal">
                    <div class="modal-header">
                        <h2>📦 데이터 백업 & 복원</h2>
                        <button class="modal-close" onclick="closeBackupModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="backup-section">
                            <h3>📤 데이터 백업</h3>
                            <p>모든 메모, 설정, Google Drive 연동 정보를 백업합니다.</p>
                            <button class="backup-btn" onclick="portableBackup.downloadBackup()">
                                💾 전체 백업 다운로드
                            </button>
                        </div>
                        
                        <div class="restore-section">
                            <h3>📥 데이터 복원</h3>
                            <p>백업 파일을 선택하여 데이터를 복원합니다.</p>
                            <input type="file" id="backupFileInput" accept=".json" style="display: none;">
                            <button class="restore-btn" onclick="document.getElementById('backupFileInput').click()">
                                📂 백업 파일 선택
                            </button>
                        </div>
                        
                        <div class="sync-section">
                            <h3>☁️ 클라우드 자동 동기화</h3>
                            <p>Google Drive와 실시간 자동 동기화됩니다. (5분 간격)</p>
                            <div id="cloudSyncStatus" class="sync-status-display">
                                <span class="sync-status">동기화 상태 확인 중...</span>
                            </div>
                            <div class="sync-controls">
                                <button class="sync-btn" onclick="portableBackup.syncWithCloud()">
                                    🔄 수동 동기화
                                </button>
                                <button class="auto-sync-toggle-btn" onclick="portableBackup.toggleAutoSync()">
                                    🚀 자동 동기화 설정
                                </button>
                                <button class="folder-settings-btn" onclick="portableBackup.openFolderSettings()">
                                    📁 저장 위치 설정
                                </button>
                            </div>
                            <div class="current-backup-folder">
                                <small id="currentFolderDisplay">📁 저장 위치: 확인 중...</small>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>📋 현재 데이터 현황</h4>
                            <div id="dataStatus"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.updateDataStatus();
    }
    
    /**
     * 현재 데이터 상태 업데이트
     */
    updateDataStatus() {
        const statusDiv = document.getElementById('dataStatus');
        if (statusDiv) {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const calendarMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const hasGoogleAuth = !!localStorage.getItem('googleAccessToken');
            
            statusDiv.innerHTML = `
                <div class="data-stats">
                    <div class="stat-item">📝 일반 메모: ${memos.length}개</div>
                    <div class="stat-item">📅 달력 메모: ${calendarMemos.length}개</div>
                    <div class="stat-item">☁️ Google 연동: ${hasGoogleAuth ? '연결됨' : '미연결'}</div>
                    <div class="stat-item">💾 마지막 백업: ${localStorage.getItem('lastBackupTime') || '없음'}</div>
                </div>
            `;
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 백업 버튼 클릭
        document.addEventListener('click', (e) => {
            if (e.target.id === 'backupBtn') {
                this.openBackupModal();
            }
        });
        
        // 파일 선택 시 복원 실행
        document.addEventListener('change', (e) => {
            if (e.target.id === 'backupFileInput') {
                const file = e.target.files[0];
                if (file) {
                    this.restoreFromBackup(file);
                }
            }
        });
    }
    
    /**
     * 폴더 설정 열기
     */
    async openFolderSettings() {
        if (!window.driveFolderManager) {
            this.showNotification('❌ 폴더 관리 시스템이 로드되지 않았습니다.', 'error');
            return;
        }
        
        if (!window.driveFolderManager.isAuthenticated()) {
            this.showNotification('🔗 먼저 Google Drive에 연결해주세요.', 'warning');
            return;
        }
        
        try {
            await window.driveFolderManager.createFolderSelectionUI();
        } catch (error) {
            this.showNotification('폴더 설정을 열 수 없습니다: ' + error.message, 'error');
        }
    }
    
    /**
     * 현재 폴더 표시 업데이트
     */
    updateCurrentFolderDisplay() {
        const display = document.getElementById('currentFolderDisplay');
        if (display && window.driveFolderManager) {
            const settings = window.driveFolderManager.getCurrentSettings();
            
            if (settings.isAuthenticated && settings.folderName) {
                display.textContent = `📁 저장 위치: ${settings.folderName}`;
                display.style.color = '#28a745';
            } else if (settings.isAuthenticated) {
                display.textContent = '📁 저장 위치: 기본 폴더 (미설정)';
                display.style.color = '#ffc107';
            } else {
                display.textContent = '📁 저장 위치: Google Drive 미연결';
                display.style.color = '#6c757d';
            }
        }
    }
    
    /**
     * 백업 모달 열기
     */
    openBackupModal() {
        // 중복 모달 방지 체크
        const existingModal = document.getElementById('backupModalBackdrop');
        if (existingModal) {
            console.log('📦 백업 모달이 이미 열려있음 - 중복 생성 방지');
            return;
        }
        
        this.createBackupModal();
        document.getElementById('backupModalBackdrop').style.display = 'flex';
        
        // 동기화 상태 업데이트
        setTimeout(() => {
            this.updateSyncButtonText();
            this.updateCurrentFolderDisplay();
            if (window.cloudAutoSync) {
                window.cloudAutoSync.updateSyncUI();
            }
        }, 100);
    }
    
    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        
        // 간단한 알림 표시
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // 타입별 색상
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// 백업 모달 닫기 함수
window.closeBackupModal = function() {
    const modal = document.getElementById('backupModalBackdrop');
    if (modal) {
        modal.remove();
    }
};

// 전역 인스턴스 생성
window.portableBackup = new PortableBackupSystem();

console.log('✅ 포터블 백업 시스템 로드 완료');
console.log('💾 사용법: 우상단 "백업" 버튼 클릭 또는 portableBackup.downloadBackup() 실행');