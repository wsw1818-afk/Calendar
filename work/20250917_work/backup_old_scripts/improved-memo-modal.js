/**
 * 개선된 메모 모달 - 사이드 패널 형태
 * 달력을 가리지 않고 동시에 보이는 메모 작성 인터페이스
 */

(function() {
    'use strict';
    
    console.log('📝 개선된 메모 모달 초기화');
    
    // ========== 메모 모달 설정 ==========
    const memoModalConfig = {
        mode: localStorage.getItem('memoModalMode') || 'side-panel', // side-panel, popup, mini-popup
        position: localStorage.getItem('memoModalPosition') || 'right', // left, right, top, bottom
        size: localStorage.getItem('memoModalSize') || 'medium', // small, medium, large
        autoHide: localStorage.getItem('memoAutoHide') === 'true',
        draggable: localStorage.getItem('memoDraggable') !== 'false',
        pinned: localStorage.getItem('memoPinned') === 'true'
    };
    
    // ========== 기존 메모 모달 개선 ==========
    function improveExistingMemoModal() {
        const existingModal = document.getElementById('memoModal');
        if (existingModal) {
            // 기존 모달을 완전히 숨김
            existingModal.style.display = 'none !important';
            existingModal.style.visibility = 'hidden';
            existingModal.style.opacity = '0';
            existingModal.style.pointerEvents = 'none';
            existingModal.id = 'memoModalBackup';
            console.log('✅ 기존 메모 모달 비활성화');
        }
        
        // 기존 모달 관련 이벤트 제거
        document.querySelectorAll('.day').forEach(day => {
            const clonedDay = day.cloneNode(true);
            day.parentNode.replaceChild(clonedDay, day);
        });
        
        // 새로운 개선된 모달 생성
        createImprovedMemoModal();
    }
    
    // ========== 새로운 개선된 메모 모달 생성 ==========
    function createImprovedMemoModal() {
        const modal = document.createElement('div');
        modal.id = 'improvedMemoModal';
        modal.className = `memo-modal-improved mode-${memoModalConfig.mode} position-${memoModalConfig.position} size-${memoModalConfig.size}`;
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <!-- 모달 헤더 -->
            <div class="improved-memo-header">
                <div class="memo-date-title">
                    <h3 id="improvedModalDate">날짜 선택</h3>
                    <div class="memo-count-badge">
                        <span id="improvedMemoCount">0</span>개
                    </div>
                </div>
                <div class="memo-header-controls">
                    <button id="memoModeToggle" class="mode-toggle-btn" title="모드 전환">
                        📱
                    </button>
                    <button id="memoPositionToggle" class="position-toggle-btn" title="위치 변경">
                        🔄
                    </button>
                    <button id="memoPinToggle" class="pin-toggle-btn ${memoModalConfig.pinned ? 'pinned' : ''}" title="고정/해제">
                        📌
                    </button>
                    <button id="memoMinimizeToggle" class="minimize-btn" title="최소화">
                        ➖
                    </button>
                    <button id="improvedMemoClose" class="improved-close-btn" title="닫기">
                        ✕
                    </button>
                </div>
            </div>
            
            <!-- 메모 콘텐츠 -->
            <div class="improved-memo-content">
                <!-- 빠른 메모 작성 -->
                <div class="quick-memo-section">
                    <div class="quick-input-group">
                        <input type="text" id="improvedMemoTitle" placeholder="📝 제목" maxlength="50">
                        <button id="quickSaveBtn" class="quick-save-btn">저장</button>
                    </div>
                    <textarea id="improvedMemoContent" placeholder="메모 내용을 입력하세요..." rows="3"></textarea>
                </div>
                
                <!-- 메모 리스트 -->
                <div class="improved-memo-list">
                    <div class="memo-list-header">
                        <span class="list-title">📋 메모 목록</span>
                        <div class="list-controls">
                            <button id="memoSortBtn" class="sort-btn" title="정렬">⚡</button>
                            <button id="memoFilterBtn" class="filter-btn" title="필터">🔍</button>
                        </div>
                    </div>
                    <div id="improvedMemoList" class="memo-list-container">
                        <!-- 메모 항목들이 여기에 표시됩니다 -->
                    </div>
                </div>
            </div>
            
            <!-- 상태 바 -->
            <div class="improved-memo-footer">
                <div class="memo-stats">
                    <span id="totalMemoStats">전체: 0개</span>
                    <span id="todayMemoStats">오늘: 0개</span>
                </div>
                <div class="memo-actions">
                    <button id="memoExportBtn" class="footer-btn" title="내보내기">📤</button>
                    <button id="memoImportBtn" class="footer-btn" title="가져오기">📥</button>
                    <button id="memoSettingsBtn" class="footer-btn" title="설정">⚙️</button>
                </div>
            </div>
            
            <!-- 리사이즈 핸들 -->
            <div class="resize-handle resize-handle-right"></div>
            <div class="resize-handle resize-handle-bottom"></div>
            <div class="resize-handle resize-handle-corner"></div>
        `;
        
        document.body.appendChild(modal);
        initImprovedMemoModal();
    }
    
    // ========== 모달 초기화 ==========
    function initImprovedMemoModal() {
        const modal = document.getElementById('improvedMemoModal');
        if (!modal) return;
        
        // 모드 전환 버튼
        document.getElementById('memoModeToggle').onclick = toggleMemoMode;
        
        // 위치 전환 버튼
        document.getElementById('memoPositionToggle').onclick = toggleMemoPosition;
        
        // 핀 토글 버튼
        document.getElementById('memoPinToggle').onclick = toggleMemoPin;
        
        // 최소화 버튼
        document.getElementById('memoMinimizeToggle').onclick = minimizeMemoModal;
        
        // 닫기 버튼
        document.getElementById('improvedMemoClose').onclick = closeMemoModal;
        
        // 빠른 저장 버튼
        document.getElementById('quickSaveBtn').onclick = quickSaveMemo;
        
        // Enter 키로 빠른 저장
        document.getElementById('improvedMemoTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                quickSaveMemo();
            }
        });
        
        // 드래그 기능 초기화
        if (memoModalConfig.draggable) {
            initDragFunctionality();
        }
        
        // 리사이즈 기능 초기화
        initResizeFunctionality();
        
        // 자동 숨김 설정
        if (memoModalConfig.autoHide) {
            initAutoHideFunctionality();
        }
        
        console.log('✅ 개선된 메모 모달 초기화 완료');
    }
    
    // ========== 메모 모달 열기 (개선된 버전) ==========
    function openImprovedMemoModal(dateStr) {
        const modal = document.getElementById('improvedMemoModal');
        if (!modal) {
            createImprovedMemoModal();
            setTimeout(() => openImprovedMemoModal(dateStr), 100);
            return;
        }
        
        // 날짜 설정
        const dateTitle = document.getElementById('improvedModalDate');
        if (dateTitle) {
            dateTitle.textContent = formatDateForDisplay(dateStr);
        }
        
        // 현재 메모 로드
        loadMemosForDate(dateStr);
        
        // 모달 표시
        modal.style.display = 'block';
        
        // 애니메이션 적용
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 입력 필드에 포커스
        const titleInput = document.getElementById('improvedMemoTitle');
        if (titleInput) {
            titleInput.focus();
        }
        
        // 현재 선택된 날짜 저장
        modal.dataset.currentDate = dateStr;
        
        // 강제로 맨 앞에 표시
        modal.style.zIndex = '9999';
        modal.style.position = 'fixed';
        modal.style.pointerEvents = 'auto';
        
        // 저장된 위치가 있으면 복원, 없으면 중앙에 배치
        const savedPosition = JSON.parse(localStorage.getItem('memoModalLastPosition') || 'null');
        if (savedPosition) {
            modal.style.left = savedPosition.x + 'px';
            modal.style.top = savedPosition.y + 'px';
            modal.style.transform = 'none';
        } else {
            // 기본 중앙 위치
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
        }
        
        console.log(`📝 개선된 메모 모달 열림: ${dateStr}`);
    }
    
    // ========== 모드 전환 ==========
    function toggleMemoMode() {
        const modes = ['side-panel', 'popup', 'mini-popup'];
        const currentModeIndex = modes.indexOf(memoModalConfig.mode);
        const nextModeIndex = (currentModeIndex + 1) % modes.length;
        const newMode = modes[nextModeIndex];
        
        memoModalConfig.mode = newMode;
        localStorage.setItem('memoModalMode', newMode);
        
        const modal = document.getElementById('improvedMemoModal');
        modal.className = modal.className.replace(/mode-\w+/, `mode-${newMode}`);
        
        showModeChangeNotification(newMode);
    }
    
    // ========== 위치 전환 ==========
    function toggleMemoPosition() {
        const positions = ['right', 'left', 'top', 'bottom'];
        const currentPosIndex = positions.indexOf(memoModalConfig.position);
        const nextPosIndex = (currentPosIndex + 1) % positions.length;
        const newPosition = positions[nextPosIndex];
        
        memoModalConfig.position = newPosition;
        localStorage.setItem('memoModalPosition', newPosition);
        
        const modal = document.getElementById('improvedMemoModal');
        modal.className = modal.className.replace(/position-\w+/, `position-${newPosition}`);
        
        showPositionChangeNotification(newPosition);
    }
    
    // ========== 고정/해제 토글 ==========
    function toggleMemoPin() {
        memoModalConfig.pinned = !memoModalConfig.pinned;
        localStorage.setItem('memoPinned', memoModalConfig.pinned);
        
        const pinBtn = document.getElementById('memoPinToggle');
        pinBtn.classList.toggle('pinned', memoModalConfig.pinned);
        pinBtn.title = memoModalConfig.pinned ? '고정 해제' : '고정';
        
        showNotification(memoModalConfig.pinned ? '메모창이 고정되었습니다' : '메모창 고정이 해제되었습니다');
    }
    
    // ========== 최소화 ==========
    function minimizeMemoModal() {
        const modal = document.getElementById('improvedMemoModal');
        modal.classList.toggle('minimized');
        
        const minimizeBtn = document.getElementById('memoMinimizeToggle');
        minimizeBtn.textContent = modal.classList.contains('minimized') ? '➕' : '➖';
        minimizeBtn.title = modal.classList.contains('minimized') ? '복원' : '최소화';
    }
    
    // ========== 모달 닫기 ==========
    function closeMemoModal() {
        const modal = document.getElementById('improvedMemoModal');
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // 입력 필드 초기화
        document.getElementById('improvedMemoTitle').value = '';
        document.getElementById('improvedMemoContent').value = '';
    }
    
    // ========== 빠른 메모 저장 ==========
    function quickSaveMemo() {
        const titleInput = document.getElementById('improvedMemoTitle');
        const contentInput = document.getElementById('improvedMemoContent');
        const modal = document.getElementById('improvedMemoModal');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const dateStr = modal.dataset.currentDate;
        
        if (!title && !content) {
            showNotification('제목이나 내용을 입력해주세요', 'warning');
            return;
        }
        
        // 메모 저장 로직 (기존 함수 활용)
        const memo = {
            id: Date.now(),
            title: title || '제목 없음',
            content: content,
            date: dateStr,
            timestamp: new Date().toISOString(),
            category: 'general'
        };
        
        saveMemoToStorage(memo);
        loadMemosForDate(dateStr);
        
        // 입력 필드 초기화
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();
        
        showNotification('메모가 저장되었습니다', 'success');
    }
    
    // ========== 강화된 드래그 기능 ==========
    function initDragFunctionality() {
        const modal = document.getElementById('improvedMemoModal');
        const header = modal.querySelector('.improved-memo-header');
        
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let modalStart = { x: 0, y: 0 };
        
        // 드래그 시작
        function startDrag(e) {
            // 버튼 클릭 시 드래그 방지
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            
            isDragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            
            const rect = modal.getBoundingClientRect();
            modalStart = { x: rect.left, y: rect.top };
            
            // 드래그 중 스타일
            modal.style.transition = 'none';
            modal.style.transform = 'none'; // transform 제거하여 정확한 위치 계산
            modal.style.cursor = 'grabbing';
            header.style.cursor = 'grabbing';
            
            // 전체 화면에서 마우스 추적
            document.body.style.userSelect = 'none';
            document.body.style.pointerEvents = 'none';
            modal.style.pointerEvents = 'auto';
            
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 드래그 중
        function duringDrag(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            let newX = modalStart.x + deltaX;
            let newY = modalStart.y + deltaY;
            
            // 화면 경계 제한
            const modalRect = modal.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 최소 20px 여백 유지
            newX = Math.max(20, Math.min(windowWidth - modalRect.width - 20, newX));
            newY = Math.max(20, Math.min(windowHeight - modalRect.height - 20, newY));
            
            modal.style.left = newX + 'px';
            modal.style.top = newY + 'px';
        }
        
        // 드래그 종료
        function endDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            
            // 스타일 복원
            modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            modal.style.cursor = 'default';
            header.style.cursor = 'grab';
            
            document.body.style.userSelect = '';
            document.body.style.pointerEvents = '';
            
            // 위치 저장 (localStorage에 마지막 위치 저장)
            const rect = modal.getBoundingClientRect();
            localStorage.setItem('memoModalLastPosition', JSON.stringify({
                x: rect.left,
                y: rect.top
            }));
        }
        
        // 이벤트 리스너 등록
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', duringDrag);
        document.addEventListener('mouseup', endDrag);
        
        // 터치 이벤트 지원 (모바일)
        header.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startDrag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {}, stopPropagation: () => {} });
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            duringDrag({ clientX: touch.clientX, clientY: touch.clientY });
        });
        
        document.addEventListener('touchend', endDrag);
        
        // 헤더에 드래그 힌트 스타일
        header.style.cursor = 'grab';
        header.title = '드래그해서 이동할 수 있습니다';
        
        console.log('✅ 강화된 드래그 기능 초기화 완료');
    }
    
    // ========== 리사이즈 기능 ==========
    function initResizeFunctionality() {
        const modal = document.getElementById('improvedMemoModal');
        const handles = modal.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            let isResizing = false;
            let startX, startY, startWidth, startHeight;
            
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                
                const rect = modal.getBoundingClientRect();
                startWidth = parseInt(document.defaultView.getComputedStyle(modal).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(modal).height, 10);
                
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                if (handle.classList.contains('resize-handle-right')) {
                    modal.style.width = (startWidth + e.clientX - startX) + 'px';
                }
                
                if (handle.classList.contains('resize-handle-bottom')) {
                    modal.style.height = (startHeight + e.clientY - startY) + 'px';
                }
                
                if (handle.classList.contains('resize-handle-corner')) {
                    modal.style.width = (startWidth + e.clientX - startX) + 'px';
                    modal.style.height = (startHeight + e.clientY - startY) + 'px';
                }
            });
            
            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }
    
    // ========== 자동 숨김 기능 ==========
    function initAutoHideFunctionality() {
        const modal = document.getElementById('improvedMemoModal');
        let hideTimer;
        
        const startHideTimer = () => {
            if (memoModalConfig.pinned) return;
            hideTimer = setTimeout(() => {
                modal.classList.add('auto-hidden');
            }, 3000);
        };
        
        const stopHideTimer = () => {
            clearTimeout(hideTimer);
            modal.classList.remove('auto-hidden');
        };
        
        modal.addEventListener('mouseenter', stopHideTimer);
        modal.addEventListener('mouseleave', startHideTimer);
        modal.addEventListener('focus', stopHideTimer, true);
        modal.addEventListener('blur', startHideTimer, true);
    }
    
    // ========== 유틸리티 함수들 ==========
    function formatDateForDisplay(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    }
    
    function loadMemosForDate(dateStr) {
        // 기존 메모 로드 로직 활용
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        const dayMemos = (memos[dateStr] || []).sort((a, b) => {
            // timestamp 기준으로 날짜순 정렬 (최신순)  
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        updateMemoList(dayMemos);
        updateMemoStats(dayMemos.length);
    }
    
    function updateMemoList(memos) {
        const listContainer = document.getElementById('improvedMemoList');
        if (!listContainer) return;
        
        if (memos.length === 0) {
            listContainer.innerHTML = '<div class="no-memo-message">📝 메모가 없습니다</div>';
            return;
        }
        
        listContainer.innerHTML = memos.map(memo => `
            <div class="memo-item" data-memo-id="${memo.id || memo.timestamp}">
                <div class="memo-item-header">
                    <span class="memo-title">${memo.title || '제목 없음'}</span>
                    <div class="memo-item-actions">
                        <button class="edit-memo-btn" title="편집">✏️</button>
                        <button class="delete-memo-btn" title="삭제">🗑️</button>
                    </div>
                </div>
                <div class="memo-content">${memo.content}</div>
                <div class="memo-timestamp">${formatTimestamp(memo.timestamp)}</div>
            </div>
        `).join('');
    }
    
    function updateMemoStats(count) {
        const countBadge = document.getElementById('improvedMemoCount');
        if (countBadge) {
            countBadge.textContent = count;
        }
    }
    
    function saveMemoToStorage(memo) {
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        if (!memos[memo.date]) {
            memos[memo.date] = [];
        }
        memos[memo.date].push(memo);
        localStorage.setItem('memos', JSON.stringify(memos));
    }
    
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    function showModeChangeNotification(mode) {
        const modeNames = {
            'side-panel': '사이드 패널',
            'popup': '팝업',
            'mini-popup': '미니 팝업'
        };
        showNotification(`${modeNames[mode]} 모드로 변경되었습니다`);
    }
    
    function showPositionChangeNotification(position) {
        const positionNames = {
            'right': '오른쪽',
            'left': '왼쪽',
            'top': '상단',
            'bottom': '하단'
        };
        showNotification(`${positionNames[position]} 위치로 이동되었습니다`);
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `memo-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10001;
            animation: slideInFromRight 0.3s ease;
        `;
        
        const colors = {
            info: '#2196f3',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
    
    // ========== 기존 openMemoModal 함수 오버라이드 ==========
    function overrideExistingFunctions() {
        // 전역 openMemoModal 함수를 개선된 버전으로 교체
        if (window.openMemoModal) {
            window.originalOpenMemoModal = window.openMemoModal;
        }
        
        window.openMemoModal = function(dateStr) {
            openImprovedMemoModal(dateStr);
        };
    }
    
    // ========== 초기화 ==========
    function initialize() {
        console.log('🚀 개선된 메모 모달 시스템 시작');
        
        // DOM 로드 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    function init() {
        setTimeout(() => {
            improveExistingMemoModal();
            overrideExistingFunctions();
            setupDayClickEvents(); // 날짜 클릭 이벤트 재설정
            
            console.log('✅ 개선된 메모 모달 시스템 준비 완료');
        }, 500);
    }
    
    // ========== 날짜 클릭 이벤트 재설정 ==========
    function setupDayClickEvents() {
        // 기존 이벤트 제거 후 새로 설정
        document.addEventListener('click', function(e) {
            const dayElement = e.target.closest('.day');
            if (!dayElement || dayElement.classList.contains('empty')) return;
            
            // 날짜 추출
            const dayNumber = dayElement.querySelector('.day-number')?.textContent;
            if (!dayNumber) return;
            
            // 현재 표시된 년월 가져오기
            const monthYearElement = document.getElementById('monthYear');
            if (!monthYearElement) return;
            
            const monthYearText = monthYearElement.textContent;
            const yearMatch = monthYearText.match(/(\d{4})년/);
            const monthMatch = monthYearText.match(/(\d{1,2})월/);
            
            if (!yearMatch || !monthMatch) return;
            
            const year = yearMatch[1];
            const month = monthMatch[1].padStart(2, '0');
            const day = dayNumber.padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            // 개선된 메모 모달 열기
            openImprovedMemoModal(dateStr);
            e.stopPropagation();
            e.preventDefault();
        });
        
        console.log('📅 날짜 클릭 이벤트 재설정 완료');
    }
    
    // 시작
    initialize();
    
    // 전역 API 노출
    window.ImprovedMemoModal = {
        open: openImprovedMemoModal,
        close: closeMemoModal,
        toggleMode: toggleMemoMode,
        togglePosition: toggleMemoPosition,
        getConfig: () => memoModalConfig
    };
    
})();