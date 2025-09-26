/**
 * Google Drive 폴더 관리자
 * 백업 파일 저장 위치 설정 및 관리
 */

class DriveFolderManager {
    constructor() {
        this.version = '1.0.0';
        this.defaultFolderName = 'Calendar App Backups';
        this.selectedFolderId = null;
        this.availableFolders = [];
        
        this.init();
    }
    
    init() {
        console.log('📁 Google Drive 폴더 관리자 초기화');
        this.loadSavedSettings();
    }
    
    /**
     * 저장된 설정 로드
     */
    loadSavedSettings() {
        const savedSettings = localStorage.getItem('driveBackupSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.selectedFolderId = settings.folderId;
                this.defaultFolderName = settings.folderName || this.defaultFolderName;
                console.log('✅ 저장된 Drive 설정 로드:', settings);
            } catch (error) {
                console.error('❌ Drive 설정 로드 실패:', error);
            }
        }
    }
    
    /**
     * 설정 저장
     */
    saveSettings(folderId, folderName) {
        const settings = {
            folderId: folderId,
            folderName: folderName,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('driveBackupSettings', JSON.stringify(settings));
        this.selectedFolderId = folderId;
        this.defaultFolderName = folderName;
        
        console.log('💾 Drive 설정 저장 완료:', settings);
    }
    
    /**
     * Google Drive 인증 확인
     */
    isAuthenticated() {
        const accessToken = localStorage.getItem('googleAccessToken') || 
                          localStorage.getItem('googleDriveAccessToken');
        return !!accessToken;
    }
    
    /**
     * 액세스 토큰 가져오기
     */
    getAccessToken() {
        return localStorage.getItem('googleAccessToken') || 
               localStorage.getItem('googleDriveAccessToken');
    }
    
    /**
     * 사용 가능한 폴더 목록 가져오기
     */
    async getFolderList() {
        if (!this.isAuthenticated()) {
            throw new Error('Google Drive에 연결되지 않았습니다');
        }
        
        const accessToken = this.getAccessToken();
        
        try {
            console.log('📂 Google Drive 폴더 목록 조회 중...');
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder'&orderBy=name&pageSize=100&fields=files(id,name,parents,createdTime)`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('폴더 목록 조회 실패');
            }
            
            const data = await response.json();
            this.availableFolders = data.files || [];
            
            console.log('✅ 폴더 목록 조회 완료:', this.availableFolders.length + '개');
            return this.availableFolders;
            
        } catch (error) {
            console.error('❌ 폴더 목록 조회 실패:', error);
            throw error;
        }
    }
    
    /**
     * 새 폴더 생성
     */
    async createFolder(folderName, parentFolderId = null) {
        if (!this.isAuthenticated()) {
            throw new Error('Google Drive에 연결되지 않았습니다');
        }
        
        const accessToken = this.getAccessToken();
        
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };
        
        if (parentFolderId) {
            folderMetadata.parents = [parentFolderId];
        }
        
        try {
            console.log(`📁 새 폴더 생성 중: ${folderName}`);
            
            const response = await fetch(
                'https://www.googleapis.com/drive/v3/files',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(folderMetadata)
                }
            );
            
            if (!response.ok) {
                throw new Error('폴더 생성 실패');
            }
            
            const newFolder = await response.json();
            console.log('✅ 새 폴더 생성 완료:', newFolder.name);
            
            return newFolder;
            
        } catch (error) {
            console.error('❌ 폴더 생성 실패:', error);
            throw error;
        }
    }
    
    /**
     * 폴더 검색
     */
    async searchFolder(folderName) {
        const folders = await this.getFolderList();
        return folders.filter(folder => 
            folder.name.toLowerCase().includes(folderName.toLowerCase())
        );
    }
    
    /**
     * 기본 백업 폴더 확인/생성
     */
    async ensureBackupFolder() {
        try {
            // 기존 설정된 폴더가 있으면 사용
            if (this.selectedFolderId) {
                const folder = await this.getFolderById(this.selectedFolderId);
                if (folder) {
                    console.log('✅ 기존 설정된 폴더 사용:', folder.name);
                    return folder;
                }
            }
            
            // 기본 백업 폴더 검색
            const existingFolders = await this.searchFolder(this.defaultFolderName);
            
            if (existingFolders.length > 0) {
                const folder = existingFolders[0];
                this.saveSettings(folder.id, folder.name);
                console.log('✅ 기존 백업 폴더 발견:', folder.name);
                return folder;
            }
            
            // 새 백업 폴더 생성
            const newFolder = await this.createFolder(this.defaultFolderName);
            this.saveSettings(newFolder.id, newFolder.name);
            console.log('✅ 새 백업 폴더 생성 완료:', newFolder.name);
            
            return newFolder;
            
        } catch (error) {
            console.error('❌ 백업 폴더 설정 실패:', error);
            throw error;
        }
    }
    
    /**
     * 폴더 ID로 폴더 정보 가져오기
     */
    async getFolderById(folderId) {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        const accessToken = this.getAccessToken();
        
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,parents,createdTime`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!response.ok) {
                return null;
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ 폴더 정보 조회 실패:', error);
            return null;
        }
    }
    
    /**
     * 폴더 선택 UI 생성
     */
    async createFolderSelectionUI() {
        try {
            const folders = await this.getFolderList();
            const currentFolder = this.selectedFolderId ? 
                await this.getFolderById(this.selectedFolderId) : null;
            
            const modalHtml = `
                <div class="modal-backdrop" id="folderSelectionBackdrop">
                    <div class="modal-container folder-selection-modal">
                        <div class="modal-header">
                            <h2>📁 백업 저장 위치 설정</h2>
                            <button class="modal-close" onclick="closeFolderSelection()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="current-folder-section">
                                <h3>📍 현재 설정된 폴더</h3>
                                <div class="current-folder-display">
                                    ${currentFolder ? 
                                        `<span class="folder-name">📁 ${currentFolder.name}</span>` :
                                        `<span class="no-folder">설정된 폴더가 없습니다</span>`
                                    }
                                </div>
                            </div>
                            
                            <div class="folder-actions-section">
                                <h3>📂 폴더 관리</h3>
                                <div class="folder-actions">
                                    <button class="action-btn create-folder-btn" onclick="showCreateFolderForm()">
                                        ➕ 새 폴더 생성
                                    </button>
                                    <button class="action-btn refresh-folders-btn" onclick="refreshFolderList()">
                                        🔄 목록 새로고침
                                    </button>
                                    <button class="action-btn default-folder-btn" onclick="setDefaultFolder()">
                                        🏠 기본 폴더 사용
                                    </button>
                                </div>
                            </div>
                            
                            <div class="create-folder-form" id="createFolderForm" style="display: none;">
                                <h4>새 폴더 생성</h4>
                                <input type="text" id="newFolderName" placeholder="폴더 이름을 입력하세요" maxlength="100">
                                <div class="form-actions">
                                    <button class="create-btn" onclick="createNewFolder()">생성</button>
                                    <button class="cancel-btn" onclick="hideCreateFolderForm()">취소</button>
                                </div>
                            </div>
                            
                            <div class="folder-list-section">
                                <h3>📋 사용 가능한 폴더</h3>
                                <div class="folder-search">
                                    <input type="text" id="folderSearch" placeholder="폴더 검색..." onkeyup="filterFolders()">
                                </div>
                                <div class="folder-list" id="folderList">
                                    <div class="loading">폴더 목록을 불러오는 중...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            this.renderFolderList(folders);
            
        } catch (error) {
            console.error('❌ 폴더 선택 UI 생성 실패:', error);
            this.showNotification('폴더 목록을 불러올 수 없습니다: ' + error.message, 'error');
        }
    }
    
    /**
     * 폴더 목록 렌더링
     */
    renderFolderList(folders) {
        const folderList = document.getElementById('folderList');
        if (!folderList) return;
        
        if (folders.length === 0) {
            folderList.innerHTML = '<div class="no-folders">폴더가 없습니다</div>';
            return;
        }
        
        const folderHtml = folders.map(folder => {
            const isSelected = folder.id === this.selectedFolderId;
            return `
                <div class="folder-item ${isSelected ? 'selected' : ''}" 
                     onclick="selectFolder('${folder.id}', '${folder.name.replace(/'/g, "&#39;")}')">
                    <div class="folder-info">
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">${folder.name}</span>
                        ${isSelected ? '<span class="selected-badge">✓ 선택됨</span>' : ''}
                    </div>
                    <div class="folder-date">
                        ${new Date(folder.createdTime).toLocaleDateString()}
                    </div>
                </div>
            `;
        }).join('');
        
        folderList.innerHTML = folderHtml;
    }
    
    /**
     * 폴더 선택
     */
    selectFolder(folderId, folderName) {
        this.saveSettings(folderId, folderName);
        this.showNotification(`✅ 백업 폴더가 "${folderName}"로 설정되었습니다`, 'success');
        
        // UI 업데이트
        const currentDisplay = document.querySelector('.current-folder-display');
        if (currentDisplay) {
            currentDisplay.innerHTML = `<span class="folder-name">📁 ${folderName}</span>`;
        }
        
        // 선택 상태 업데이트
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[onclick*="${folderId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            selectedItem.querySelector('.folder-info').insertAdjacentHTML('beforeend', 
                '<span class="selected-badge">✓ 선택됨</span>');
        }
    }
    
    /**
     * 기본 폴더 사용 설정
     */
    async setDefaultFolder() {
        try {
            this.showNotification('기본 폴더를 설정하는 중...', 'info');
            const defaultFolder = await this.ensureBackupFolder();
            this.showNotification(`✅ 기본 폴더 "${defaultFolder.name}"가 설정되었습니다`, 'success');
            
            // UI 업데이트
            setTimeout(() => {
                document.getElementById('folderSelectionBackdrop')?.remove();
            }, 1000);
            
        } catch (error) {
            this.showNotification('기본 폴더 설정 실패: ' + error.message, 'error');
        }
    }
    
    /**
     * 새 폴더 생성 (UI)
     */
    async createNewFolder() {
        const folderNameInput = document.getElementById('newFolderName');
        const folderName = folderNameInput?.value.trim();
        
        if (!folderName) {
            this.showNotification('폴더 이름을 입력해주세요', 'warning');
            return;
        }
        
        try {
            this.showNotification('새 폴더를 생성하는 중...', 'info');
            const newFolder = await this.createFolder(folderName);
            
            this.saveSettings(newFolder.id, newFolder.name);
            this.showNotification(`✅ 새 폴더 "${newFolder.name}"가 생성되고 선택되었습니다`, 'success');
            
            // 폼 숨기기
            this.hideCreateFolderForm();
            
            // 폴더 목록 새로고침
            this.refreshFolderList();
            
        } catch (error) {
            this.showNotification('폴더 생성 실패: ' + error.message, 'error');
        }
    }
    
    /**
     * 폴더 목록 새로고침
     */
    async refreshFolderList() {
        try {
            this.showNotification('폴더 목록을 새로고침하는 중...', 'info');
            const folders = await this.getFolderList();
            this.renderFolderList(folders);
            this.showNotification('✅ 폴더 목록이 새로고침되었습니다', 'success');
        } catch (error) {
            this.showNotification('폴더 목록 새로고침 실패: ' + error.message, 'error');
        }
    }
    
    /**
     * 폴더 검색 필터
     */
    filterFolders() {
        const searchInput = document.getElementById('folderSearch');
        const searchTerm = searchInput?.value.toLowerCase() || '';
        
        const folderItems = document.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            const folderName = item.querySelector('.folder-name')?.textContent.toLowerCase() || '';
            if (folderName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    /**
     * 폴더 생성 폼 표시/숨김
     */
    showCreateFolderForm() {
        const form = document.getElementById('createFolderForm');
        if (form) {
            form.style.display = 'block';
            document.getElementById('newFolderName')?.focus();
        }
    }
    
    hideCreateFolderForm() {
        const form = document.getElementById('createFolderForm');
        if (form) {
            form.style.display = 'none';
            document.getElementById('newFolderName').value = '';
        }
    }
    
    /**
     * 알림 표시
     */
    showNotification(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        
        if (window.portableBackup) {
            window.portableBackup.showNotification(message, type);
        }
    }
    
    /**
     * 현재 설정 정보 가져오기
     */
    getCurrentSettings() {
        return {
            folderId: this.selectedFolderId,
            folderName: this.defaultFolderName,
            isAuthenticated: this.isAuthenticated()
        };
    }
}

// 전역 함수 정의 (UI에서 사용)
window.selectFolder = (folderId, folderName) => {
    window.driveFolderManager.selectFolder(folderId, folderName);
};

window.setDefaultFolder = () => {
    window.driveFolderManager.setDefaultFolder();
};

window.createNewFolder = () => {
    window.driveFolderManager.createNewFolder();
};

window.refreshFolderList = () => {
    window.driveFolderManager.refreshFolderList();
};

window.showCreateFolderForm = () => {
    window.driveFolderManager.showCreateFolderForm();
};

window.hideCreateFolderForm = () => {
    window.driveFolderManager.hideCreateFolderForm();
};

window.filterFolders = () => {
    window.driveFolderManager.filterFolders();
};

window.closeFolderSelection = () => {
    const modal = document.getElementById('folderSelectionBackdrop');
    if (modal) {
        modal.remove();
    }
};

// 전역 인스턴스 생성
window.driveFolderManager = new DriveFolderManager();

console.log('✅ Google Drive 폴더 관리자 로드 완료');
console.log('📁 사용법: driveFolderManager.createFolderSelectionUI() 실행');