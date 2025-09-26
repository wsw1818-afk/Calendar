/**
 * 통합 캘린더 시스템 - 메모 및 일정 관리
 * 모든 기존 충돌 코드 제거 후 단일 시스템으로 통합
 * 
 * 기능:
 * 1. 메모 작성/수정/삭제
 * 2. 일정 추가/수정/삭제
 * 3. 드래그 가능한 모달
 * 4. LocalStorage 기반 데이터 저장
 */

(function() {
    'use strict';
    
    console.log('🚀 통합 캘린더 시스템 시작');
    
    // ========== 전역 변수 ==========
    let currentModal = null;
    let currentDate = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let isLocked = false;
    // PIN 기능 제거됨 - 간단한 토글 방식 사용
    
    // ========== 기존 시스템 정리 ==========
    function cleanupOldSystems() {
        console.log('🧹 기존 시스템 정리 중...');
        
        // 모든 기존 메모 모달 제거
        const oldModals = document.querySelectorAll([
            '#memoModal',
            '#improvedMemoModal',
            '#simpleMemoModal',
            '#fixedMemoModal',
            '#memoModalBackup',
            '.memo-modal',
            '.memo-modal-improved',
            '[id*="memo"][id*="modal"]'
        ].join(','));
        
        oldModals.forEach(modal => {
            console.log('제거:', modal.id || modal.className);
            modal.remove();
        });
        
        // 기존 이벤트 리스너 제거를 위한 페이지 리로드 방지
        // 대신 capture phase 사용하여 우선순위 확보
        
        console.log('✅ 기존 시스템 정리 완료');
    }
    
    // ========== 통합 모달 생성 ==========
    function createUnifiedModal() {
        console.log('📝 통합 모달 생성 중...');
        
        // 기존 모달이 있으면 제거
        if (currentModal) {
            currentModal.remove();
        }
        
        currentModal = document.createElement('div');
        currentModal.id = 'unifiedCalendarModal';
        currentModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 450px;
            height: 550px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 999999;
            display: none;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
            overflow: hidden;
        `;
        
        currentModal.innerHTML = `
            <div id="unifiedModalHeader" style="
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                cursor: move;
                user-select: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3 id="unifiedModalTitle" style="margin: 0; font-size: 18px; font-weight: 600;">
                    날짜 선택
                </h3>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="unifiedLockBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'" title="잠금 설정">
                        <span id="lockIcon">🔓</span>
                        <span id="lockText" style="font-size: 12px;">열림</span>
                    </button>
                    <button id="unifiedCloseBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
                </div>
            </div>
            
            <div style="
                padding: 20px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            ">
                <!-- 탭 선택 -->
                <div style="
                    display: flex;
                    gap: 10px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 10px;
                ">
                    <button id="memoTabBtn" class="tab-btn active" style="
                        padding: 8px 16px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 8px 8px 0 0;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s;
                    ">📝 메모</button>
                    <button id="scheduleTabBtn" class="tab-btn" style="
                        padding: 8px 16px;
                        background: #e9ecef;
                        color: #495057;
                        border: none;
                        border-radius: 8px 8px 0 0;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s;
                    ">📅 일정</button>
                </div>
                
                <!-- 메모 탭 내용 -->
                <div id="memoTabContent" class="tab-content" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="
                        background: white;
                        padding: 15px;
                        border-radius: 12px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    ">
                        <textarea id="unifiedMemoContent" placeholder="메모 제목을 첫 번째 줄에 입력&#10;내용은 두 번째 줄부터 자유롭게 작성" style="
                            width: 100%;
                            height: 100px;
                            padding: 10px;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 14px;
                            resize: none;
                            box-sizing: border-box;
                        "></textarea>
                        <button id="unifiedSaveMemoBtn" style="
                            width: 100%;
                            padding: 10px;
                            background: #667eea;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            margin-top: 10px;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#5a67d8'"
                           onmouseout="this.style.background='#667eea'">메모 저장</button>
                    </div>
                    
                    <div id="unifiedMemoList" style="
                        background: white;
                        border-radius: 12px;
                        padding: 15px;
                        max-height: 200px;
                        overflow-y: auto;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    ">
                        <div style="text-align: center; color: #adb5bd; padding: 20px;">
                            저장된 메모가 없습니다
                        </div>
                    </div>
                </div>
                
                <!-- 일정 탭 내용 -->
                <div id="scheduleTabContent" class="tab-content" style="display: none; flex-direction: column; gap: 15px;">
                    <div style="
                        background: white;
                        padding: 15px;
                        border-radius: 12px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    ">
                        <input type="text" id="unifiedScheduleTitle" placeholder="일정 제목" style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 14px;
                            margin-bottom: 10px;
                            box-sizing: border-box;
                        ">
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="time" id="unifiedScheduleTime" style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #dee2e6;
                                border-radius: 8px;
                                font-size: 14px;
                            ">
                            <select id="unifiedScheduleCategory" style="
                                flex: 1;
                                padding: 10px;
                                border: 1px solid #dee2e6;
                                border-radius: 8px;
                                font-size: 14px;
                                background: white;
                            ">
                                <option value="회의">회의</option>
                                <option value="업무">업무</option>
                                <option value="개인">개인</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        
                        <!-- 알람 설정 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <input type="checkbox" id="unifiedScheduleAlarm" style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #28a745;
                                ">
                                <span style="font-size: 14px; font-weight: 500;">🔔 알람 설정</span>
                            </label>
                            <select id="unifiedAlarmTime" disabled style="
                                width: 100%;
                                padding: 8px 10px;
                                border: 1px solid #dee2e6;
                                border-radius: 6px;
                                font-size: 13px;
                                background: #f8f9fa;
                                color: #6c757d;
                            ">
                                <option value="0">일정 시간에</option>
                                <option value="5">5분 전</option>
                                <option value="10">10분 전</option>
                                <option value="15">15분 전</option>
                                <option value="30">30분 전</option>
                                <option value="60">1시간 전</option>
                            </select>
                        </div>
                        
                        <!-- 팝업 알림 설정 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="unifiedSchedulePopup" style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #ffc107;
                                ">
                                <span style="font-size: 14px; font-weight: 500;">💬 팝업 알림</span>
                            </label>
                        </div>
                        
                        <!-- 첨부파일 -->
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
                                📎 첨부파일
                            </label>
                            <input type="file" id="unifiedScheduleFile" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif" style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #dee2e6;
                                border-radius: 6px;
                                font-size: 13px;
                                background: white;
                            ">
                            <div id="attachedFiles" style="
                                margin-top: 8px;
                                font-size: 12px;
                                color: #6c757d;
                            "></div>
                        </div>
                        <textarea id="unifiedScheduleDesc" placeholder="일정 상세 설명 (필요시 작성)" style="
                            width: 100%;
                            height: 60px;
                            padding: 10px;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            font-size: 14px;
                            resize: none;
                            box-sizing: border-box;
                        "></textarea>
                        <button id="unifiedSaveScheduleBtn" style="
                            width: 100%;
                            padding: 10px;
                            background: #28a745;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            margin-top: 10px;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#218838'"
                           onmouseout="this.style.background='#28a745'">일정 저장</button>
                    </div>
                    
                    <div id="unifiedScheduleList" style="
                        background: white;
                        border-radius: 12px;
                        padding: 15px;
                        max-height: 200px;
                        overflow-y: auto;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    ">
                        <div style="text-align: center; color: #adb5bd; padding: 20px;">
                            등록된 일정이 없습니다
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(currentModal);
        console.log('✅ 통합 모달 생성 완료');
        
        // 이벤트 바인딩
        bindModalEvents();
    }
    
    // ========== 이벤트 바인딩 ==========
    function bindModalEvents() {
        console.log('🔗 이벤트 바인딩 중...');
        
        // 닫기 버튼
        const closeBtn = document.getElementById('unifiedCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // 잠금 버튼
        const lockBtn = document.getElementById('unifiedLockBtn');
        if (lockBtn) {
            lockBtn.onclick = toggleLock;
        }
        
        // 탭 전환
        const memoTab = document.getElementById('memoTabBtn');
        const scheduleTab = document.getElementById('scheduleTabBtn');
        
        if (memoTab && scheduleTab) {
            memoTab.onclick = () => switchTab('memo');
            scheduleTab.onclick = () => switchTab('schedule');
        }
        
        // 메모 저장
        const saveMemoBtn = document.getElementById('unifiedSaveMemoBtn');
        if (saveMemoBtn) {
            saveMemoBtn.onclick = saveMemo;
        }
        
        // 일정 저장
        const saveScheduleBtn = document.getElementById('unifiedSaveScheduleBtn');
        if (saveScheduleBtn) {
            saveScheduleBtn.onclick = saveSchedule;
        }
        
        // Enter 키 이벤트
        const scheduleTitle = document.getElementById('unifiedScheduleTitle');
        
        if (scheduleTitle) {
            scheduleTitle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveSchedule();
            });
        }
        
        // 알람 체크박스 이벤트
        const alarmCheckbox = document.getElementById('unifiedScheduleAlarm');
        const alarmSelect = document.getElementById('unifiedAlarmTime');
        
        if (alarmCheckbox && alarmSelect) {
            alarmCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    alarmSelect.disabled = false;
                    alarmSelect.style.background = 'white';
                    alarmSelect.style.color = '#333';
                } else {
                    alarmSelect.disabled = true;
                    alarmSelect.style.background = '#f8f9fa';
                    alarmSelect.style.color = '#6c757d';
                }
            });
        }
        
        // 첨부파일 이벤트
        const fileInput = document.getElementById('unifiedScheduleFile');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileAttachment);
        }
        
        // 드래그 이벤트
        setupDragEvents();
        
        console.log('✅ 이벤트 바인딩 완료');
    }
    
    // ========== 드래그 기능 ==========
    function setupDragEvents() {
        const header = document.getElementById('unifiedModalHeader');
        if (!header) return;
        
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        function startDrag(e) {
            if (e.target.id === 'unifiedCloseBtn') return;
            
            isDragging = true;
            const rect = currentModal.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            header.style.cursor = 'grabbing';
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;
            
            // 화면 경계 제한
            const maxX = window.innerWidth - currentModal.offsetWidth;
            const maxY = window.innerHeight - currentModal.offsetHeight;
            
            newX = Math.max(0, Math.min(maxX, newX));
            newY = Math.max(0, Math.min(maxY, newY));
            
            currentModal.style.left = newX + 'px';
            currentModal.style.top = newY + 'px';
            currentModal.style.transform = 'none';
            
            e.preventDefault();
        }
        
        function endDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            header.style.cursor = 'move';
        }
    }
    
    // ========== 탭 전환 ==========
    function switchTab(tab) {
        const memoTab = document.getElementById('memoTabBtn');
        const scheduleTab = document.getElementById('scheduleTabBtn');
        const memoContent = document.getElementById('memoTabContent');
        const scheduleContent = document.getElementById('scheduleTabContent');
        
        if (tab === 'memo') {
            memoTab.style.background = '#667eea';
            memoTab.style.color = 'white';
            scheduleTab.style.background = '#e9ecef';
            scheduleTab.style.color = '#495057';
            
            memoContent.style.display = 'flex';
            scheduleContent.style.display = 'none';
        } else {
            scheduleTab.style.background = '#28a745';
            scheduleTab.style.color = 'white';
            memoTab.style.background = '#e9ecef';
            memoTab.style.color = '#495057';
            
            scheduleContent.style.display = 'flex';
            memoContent.style.display = 'none';
        }
    }
    
    // ========== 모달 열기 ==========
    function openModal(dateStr) {
        console.log('📅 모달 열기:', dateStr);
        
        if (!currentModal) {
            createUnifiedModal();
        }
        
        currentDate = dateStr;
        currentModal.style.display = 'flex';
        
        // 날짜 표시
        const [year, month, day] = dateStr.split('-');
        const title = document.getElementById('unifiedModalTitle');
        if (title) {
            title.textContent = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        }
        
        // 데이터 로드
        loadMemos();
        loadSchedules();
        
        // 입력 필드 초기화
        clearInputs();
        
        // 메모 탭 활성화
        switchTab('memo');
        
        // 키보드 이벤트 리스너 추가 (스페이스바로 메모 삭제)
        setupMemoKeyboardEvents();
        
        // 메모 입력 필드에 포커스
        setTimeout(() => {
            const memoContent = document.getElementById('unifiedMemoContent');
            if (memoContent) memoContent.focus();
        }, 100);
    }
    
    // ========== 키보드 이벤트 설정 ==========
    let currentSelectedMemo = null;
    let keyboardEventListener = null;
    
    function setupMemoKeyboardEvents() {
        // 기존 이벤트 리스너 제거
        if (keyboardEventListener) {
            document.removeEventListener('keydown', keyboardEventListener);
        }
        
        keyboardEventListener = function(e) {
            // 입력 필드에서 이벤트 발생 시 무시
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // 스페이스바 (32) 이벤트
            if (e.code === 'Space' && currentSelectedMemo && !isLocked) {
                e.preventDefault();
                const memoId = currentSelectedMemo.dataset.memoId;
                if (memoId && currentDate) {
                    // 확인 없이 바로 삭제
                    deleteMemo(currentDate, memoId);
                    currentSelectedMemo = null;
                    showNotification('메모가 삭제되었습니다 (스페이스바)', 'info');
                }
            }
            
            // Delete 키 (8, 46) 이벤트 (추가 지원)
            else if ((e.code === 'Delete' || e.code === 'Backspace') && currentSelectedMemo && !isLocked) {
                e.preventDefault();
                const memoId = currentSelectedMemo.dataset.memoId;
                if (memoId && currentDate) {
                    deleteMemo(currentDate, memoId);
                    currentSelectedMemo = null;
                    showNotification('메모가 삭제되었습니다 (Delete키)', 'info');
                }
            }
            
            // ESC 키로 모달 닫기
            else if (e.code === 'Escape') {
                e.preventDefault();
                closeModal();
                showNotification('모달이 닫혔습니다 (ESC키)', 'info');
            }
        };
        
        document.addEventListener('keydown', keyboardEventListener);
        
        // 메모 선택 이벤트 설정
        setupMemoSelection();
    }
    
    function setupMemoSelection() {
        // 메모 클릭으로 선택/해제
        setTimeout(() => {
            const memoList = document.getElementById('unifiedMemoList');
            if (memoList) {
                memoList.addEventListener('click', function(e) {
                    const memoItem = e.target.closest('.unified-memo-item');
                    if (memoItem) {
                        // 이전 선택 해제
                        if (currentSelectedMemo) {
                            currentSelectedMemo.style.outline = '';
                            currentSelectedMemo.style.backgroundColor = '';
                        }
                        
                        // 새 선택 적용
                        if (currentSelectedMemo === memoItem) {
                            currentSelectedMemo = null;
                        } else {
                            currentSelectedMemo = memoItem;
                            memoItem.style.outline = '2px solid #007bff';
                            memoItem.style.backgroundColor = '#e3f2fd';
                        }
                        
                        // 상태 표시
                        updateDeleteHint();
                    }
                });
            }
        }, 100);
    }
    
    function updateDeleteHint() {
        const hintElement = document.getElementById('deleteHint');
        if (hintElement) {
            hintElement.remove();
        }
        
        if (currentSelectedMemo && !isLocked) {
            const hint = document.createElement('div');
            hint.id = 'deleteHint';
            hint.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0,123,255,0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000001;
                animation: fadeInOut 3s ease-in-out;
            `;
            hint.textContent = '💡 스페이스바 또는 Delete키로 삭제';
            document.body.appendChild(hint);
            
            // 3초 후 자동 제거
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.remove();
                }
            }, 3000);
        }
    }

    // ========== 모달 닫기 ==========
    function closeModal() {
        console.log('❌ 모달 닫기');
        
        if (currentModal) {
            currentModal.style.display = 'none';
        }
        
        // 키보드 이벤트 리스너 제거
        if (keyboardEventListener) {
            document.removeEventListener('keydown', keyboardEventListener);
            keyboardEventListener = null;
        }
        
        // 선택 상태 초기화
        currentSelectedMemo = null;
        
        // 힌트 제거
        const hintElement = document.getElementById('deleteHint');
        if (hintElement) {
            hintElement.remove();
        }
        
        // 메모 창을 닫을 때 자동으로 잠금 상태로 변경
        if (!isLocked) {
            isLocked = true;
            localStorage.setItem('calendarLocked', 'true');
            updateLockUI();
            console.log('🔒 메모 창 닫기 시 자동 잠금 활성화');
        }
        
        clearInputs();
        currentDate = null;
    }
    
    // ========== 잠금 토글 ==========
    function toggleLock() {
        const lockModal = createLockModal('toggle');
        document.body.appendChild(lockModal);
    }
    
    // ========== 잠금 모달 생성 ==========
    function createLockModal(type) {
        const modal = document.createElement('div');
        modal.id = 'lockModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const isLock = !isLocked; // 현재 상태에 따라 결정
        const title = isLock ? '🔒 메모 삭제 보호 활성화' : '🔓 메모 삭제 보호 해제';
        const subtitle = isLock ? '메모 삭제를 방지하기 위해 보호 모드를 활성화합니다' : '메모 삭제가 가능하도록 보호 모드를 해제합니다';
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px;
                width: 360px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">${isLock ? '🔒' : '🔓'}</div>
                <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #333;">${title}</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">${subtitle}</p>
                
                <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: left;">
                    ${isLock ? `
                        <div style="color: #dc3545; font-weight: 600; margin-bottom: 8px;">🛡️ 보호 활성화 후:</div>
                        <div style="font-size: 14px; color: #666; line-height: 1.4;">
                            • 메모 삭제가 불가능해집니다<br>
                            • 메모 작성 및 편집은 정상적으로 가능합니다<br>
                            • 창을 닫으면 자동으로 다시 보호됩니다<br>
                            • 일정 기능은 영향을 받지 않습니다
                        </div>
                    ` : `
                        <div style="color: #ffc107; font-weight: 600; margin-bottom: 8px;">⚠️ 보호 해제 후:</div>
                        <div style="font-size: 14px; color: #666; line-height: 1.4;">
                            • 메모 삭제가 가능해집니다<br>
                            • 모든 메모 기능을 사용할 수 있습니다<br>
                            • <strong>창을 닫으면 자동으로 다시 보호됩니다</strong><br>
                            • 삭제 시 주의하세요
                        </div>
                    `}
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="lockCancelBtn" style="
                        flex: 1;
                        padding: 14px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                        transition: background 0.3s;
                    ">취소</button>
                    <button id="lockConfirmBtn" style="
                        flex: 1;
                        padding: 14px;
                        background: ${isLock ? '#dc3545' : '#28a745'};
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        transition: background 0.3s;
                    ">${isLock ? '보호 활성화' : '보호 해제'}</button>
                </div>
            </div>
        `;
        
        // 이벤트 바인딩
        const cancelBtn = modal.querySelector('#lockCancelBtn');
        const confirmBtn = modal.querySelector('#lockConfirmBtn');
        
        cancelBtn.onclick = () => modal.remove();
        confirmBtn.onclick = () => {
            if (isLock) {
                handleLockEnable(modal);
            } else {
                handleLockDisable(modal);
            }
        };
        
        // 배경 클릭 시 닫기
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        return modal;
    }
    
    // ========== 잠금 활성화 처리 ==========
    function handleLockEnable(modal) {
        // 잠금 상태 변경
        isLocked = true;
        localStorage.setItem('calendarLocked', 'true');
        updateLockUI();
        
        modal.remove();
        showLockNotification('메모 삭제 보호가 활성화되었습니다 🛡️', 'success');
        
        // 메모 삭제 보호 모드 활성화 (내용은 계속 보임)
        console.log('🔒 메모 잠금 설정 완료');
    }
    
    // ========== 잠금 해제 처리 ==========
    function handleLockDisable(modal) {
        // 잠금 해제
        isLocked = false;
        localStorage.setItem('calendarLocked', 'false');
        updateLockUI();
        
        modal.remove();
        showLockNotification('메모 삭제 보호가 해제되었습니다 ⚠️', 'warning');
        
        // 메모 내용 다시 표시
        if (currentDate) {
            loadMemos();
        }
        console.log('🔓 메모 잠금 해제 완료');
    }
    
    // ========== 잠금 UI 업데이트 ==========
    function updateLockUI() {
        const lockIcon = document.getElementById('lockIcon');
        const lockText = document.getElementById('lockText');
        
        if (lockIcon && lockText) {
            if (isLocked) {
                lockIcon.textContent = '🔒';
                lockText.textContent = '잠김';
            } else {
                lockIcon.textContent = '🔓';
                lockText.textContent = '열림';
            }
        }
    }
    
    // ========== 메모 내용 숨기기 ==========
    function hideMemosContent() {
        const memoList = document.getElementById('unifiedMemoList');
        if (memoList) {
            memoList.innerHTML = `
                <div style="
                    text-align: center;
                    color: #adb5bd;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                ">
                    <div style="font-size: 48px;">🔒</div>
                    <div style="font-size: 16px; font-weight: 500;">메모가 잠겨있습니다</div>
                    <div style="font-size: 14px;">잠금 버튼을 클릭하여 해제하세요</div>
                </div>
            `;
        }
        
        // 입력 필드도 비활성화
        const inputs = ['unifiedMemoContent'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = true;
                element.placeholder = '메모가 잠겨있습니다';
            }
        });
        
        const saveBtn = document.getElementById('unifiedSaveMemoBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
            saveBtn.textContent = '잠김';
        }
    }
    
    // ========== 잠금 알림 ==========
    function showLockNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${colors[type]};
            color: white;
            border-radius: 8px;
            z-index: 1000001;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // ========== 입력 필드 초기화 ==========
    function clearInputs() {
        const inputs = [
            'unifiedMemoContent',
            'unifiedScheduleTitle',
            'unifiedScheduleTime',
            'unifiedScheduleDesc'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        // 체크박스와 선택상자 초기화
        const alarmCheckbox = document.getElementById('unifiedScheduleAlarm');
        const popupCheckbox = document.getElementById('unifiedSchedulePopup');
        const alarmSelect = document.getElementById('unifiedAlarmTime');
        const fileInput = document.getElementById('unifiedScheduleFile');
        const attachedFiles = document.getElementById('attachedFiles');
        
        if (alarmCheckbox) alarmCheckbox.checked = false;
        if (popupCheckbox) popupCheckbox.checked = false;
        if (alarmSelect) {
            alarmSelect.selectedIndex = 0;
            alarmSelect.disabled = true;
            alarmSelect.style.background = '#f8f9fa';
            alarmSelect.style.color = '#6c757d';
        }
        if (fileInput) fileInput.value = '';
        if (attachedFiles) attachedFiles.innerHTML = '';
    }
    
    // ========== 첨부파일 처리 ==========
    function handleFileAttachment(event) {
        const files = event.target.files;
        const attachedFiles = document.getElementById('attachedFiles');
        
        if (files.length === 0) {
            attachedFiles.innerHTML = '';
            return;
        }
        
        let fileList = '';
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileSize = (file.size / 1024).toFixed(1);
            fileList += `<div style="margin-bottom: 4px;">📄 ${file.name} (${fileSize}KB)</div>`;
        }
        
        attachedFiles.innerHTML = fileList;
    }
    
    // ========== 메모 저장 ==========
    function saveMemo() {
        // 삭제 보호 모드에서도 메모 저장은 가능
        
        if (!currentDate) {
            showNotification('날짜가 선택되지 않았습니다', 'error');
            return;
        }
        
        const contentInput = document.getElementById('unifiedMemoContent');
        
        if (!contentInput) return;
        
        const fullContent = contentInput.value.trim();
        
        if (!fullContent) {
            showNotification('메모 내용을 입력해주세요', 'warning');
            contentInput.focus();
            return;
        }
        
        // 첫째 줄을 제목으로, 나머지를 내용으로 분리
        const lines = fullContent.split('\n');
        const title = lines[0].trim() || '제목 없음';
        const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : '';
        
        const memo = {
            id: Date.now(),
            title: title,
            content: content,
            date: currentDate,
            timestamp: new Date().toISOString()
        };
        
        // localStorage에 저장
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        if (!memos[currentDate]) {
            memos[currentDate] = [];
        }
        memos[currentDate].push(memo);
        localStorage.setItem('calendarMemos', JSON.stringify(memos));
        
        // 입력 필드 초기화
        contentInput.value = '';
        contentInput.focus();
        
        // 리스트 새로고침
        loadMemos();
        
        // 성공 알림
        showNotification('메모가 저장되었습니다', 'success');
        
        // 달력에 마커 추가
        updateCalendarMarker(currentDate, 'memo');
    }
    
    // ========== 일정 저장 ==========
    function saveSchedule() {
        if (!currentDate) {
            showNotification('날짜가 선택되지 않았습니다', 'error');
            return;
        }
        
        const titleInput = document.getElementById('unifiedScheduleTitle');
        const timeInput = document.getElementById('unifiedScheduleTime');
        const categorySelect = document.getElementById('unifiedScheduleCategory');
        const descInput = document.getElementById('unifiedScheduleDesc');
        const alarmCheckbox = document.getElementById('unifiedScheduleAlarm');
        const alarmSelect = document.getElementById('unifiedAlarmTime');
        const popupCheckbox = document.getElementById('unifiedSchedulePopup');
        const fileInput = document.getElementById('unifiedScheduleFile');
        
        if (!titleInput || !timeInput) return;
        
        const title = titleInput.value.trim();
        const time = timeInput.value;
        
        if (!title) {
            showNotification('일정 제목을 입력해주세요', 'warning');
            titleInput.focus();
            return;
        }
        
        // 첨부파일 처리
        const attachedFiles = [];
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                attachedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                });
            }
        }
        
        const schedule = {
            id: Date.now(),
            title: title,
            time: time || '00:00',
            category: categorySelect.value,
            description: descInput.value.trim(),
            date: currentDate,
            timestamp: new Date().toISOString(),
            alarm: {
                enabled: alarmCheckbox.checked,
                minutes: alarmCheckbox.checked ? parseInt(alarmSelect.value) : 0
            },
            popup: popupCheckbox.checked,
            attachments: attachedFiles
        };
        
        // localStorage에 저장
        const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
        if (!schedules[currentDate]) {
            schedules[currentDate] = [];
        }
        schedules[currentDate].push(schedule);
        
        // 시간순 정렬
        schedules[currentDate].sort((a, b) => {
            return a.time.localeCompare(b.time);
        });
        
        localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
        
        // 입력 필드 초기화
        clearInputs();
        titleInput.focus();
        
        // 알람 설정
        if (schedule.alarm.enabled) {
            setupAlarmNotification(schedule);
        }
        
        // 팝업 설정
        if (schedule.popup) {
            setupSchedulePopup(schedule);
        }
        
        // 리스트 새로고침
        loadSchedules();
        
        // 성공 알림
        let message = '일정이 저장되었습니다';
        if (schedule.alarm.enabled) {
            message += ` (${schedule.alarm.minutes === 0 ? '정시' : schedule.alarm.minutes + '분 전'} 알람 설정됨)`;
        }
        showNotification(message, 'success');
        
        // 달력에 마커 추가
        updateCalendarMarker(currentDate, 'schedule');
    }
    
    // ========== 메모 로드 ==========
    function loadMemos() {
        if (!currentDate) return;
        
        const listContainer = document.getElementById('unifiedMemoList');
        if (!listContainer) return;
        
        // 삭제 보호 모드에서도 메모는 정상 표시 (삭제만 방지)
        
        // 입력 필드 활성화
        const inputs = ['unifiedMemoContent'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = false;
                element.placeholder = id.includes('Title') ? '메모 제목 입력' : '메모 내용을 자유롭게 작성하세요';
            }
        });
        
        const saveBtn = document.getElementById('unifiedSaveMemoBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.textContent = '메모 저장';
        }
        
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        const dayMemos = (memos[currentDate] || []).sort((a, b) => {
            // timestamp 기준으로 날짜순 정렬 (최신순)
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        if (dayMemos.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; color: #adb5bd; padding: 20px;">
                    저장된 메모가 없습니다
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = dayMemos.map(memo => `
            <div class="unified-memo-item" data-memo-id="${memo.id}" style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 10px;
                border-left: 3px solid #667eea;
                position: relative;
                cursor: pointer;
                transition: background-color 0.2s ease;
            ">
${isLocked ? `
                    <div style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 4px 8px;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    ">🔒 보호됨</div>
                ` : `
                    <button onclick="UnifiedCalendar.deleteMemo('${currentDate}', ${memo.id})" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 4px 8px;
                        cursor: pointer;
                        font-size: 12px;
                    ">삭제</button>
                `}
                <div style="
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 5px;
                    color: #212529;
                    padding-right: 50px;
                ">${memo.title}</div>
                <div style="
                    font-size: 13px;
                    color: #495057;
                    margin-bottom: 5px;
                    line-height: 1.4;
                ">${memo.content}</div>
                <div style="
                    font-size: 11px;
                    color: #adb5bd;
                    text-align: right;
                ">${new Date(memo.timestamp).toLocaleString('ko-KR')}</div>
            </div>
        `).join('');
    }
    
    // ========== 일정 로드 ==========
    function loadSchedules() {
        if (!currentDate) return;
        
        const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
        const daySchedules = schedules[currentDate] || [];
        
        const listContainer = document.getElementById('unifiedScheduleList');
        if (!listContainer) return;
        
        if (daySchedules.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; color: #adb5bd; padding: 20px;">
                    등록된 일정이 없습니다
                </div>
            `;
            return;
        }
        
        const categoryColors = {
            '회의': '#dc3545',
            '업무': '#007bff',
            '개인': '#28a745',
            '기타': '#6c757d'
        };
        
        listContainer.innerHTML = daySchedules.map(schedule => `
            <div style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 10px;
                border-left: 3px solid ${categoryColors[schedule.category] || '#6c757d'};
                position: relative;
            ">
                <button onclick="UnifiedCalendar.deleteSchedule('${currentDate}', ${schedule.id})" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 12px;
                ">삭제</button>
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                ">
                    <span style="
                        background: ${categoryColors[schedule.category] || '#6c757d'};
                        color: white;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 500;
                    ">${schedule.category}</span>
                    <span style="
                        font-weight: 600;
                        font-size: 14px;
                        color: #212529;
                    ">${schedule.time}</span>
                    ${schedule.alarm && schedule.alarm.enabled ? `
                        <span style="
                            color: #28a745;
                            font-size: 12px;
                        " title="알람 ${schedule.alarm.minutes === 0 ? '정시' : schedule.alarm.minutes + '분 전'}">🔔</span>
                    ` : ''}
                    ${schedule.popup ? `
                        <span style="
                            color: #ffc107;
                            font-size: 12px;
                        " title="팝업 알림">💬</span>
                    ` : ''}
                    ${schedule.attachments && schedule.attachments.length > 0 ? `
                        <span style="
                            color: #6c757d;
                            font-size: 12px;
                        " title="${schedule.attachments.length}개 파일">📎</span>
                    ` : ''}
                </div>
                <div style="
                    font-weight: 500;
                    font-size: 14px;
                    margin-bottom: 5px;
                    color: #212529;
                    padding-right: 50px;
                ">${schedule.title}</div>
                ${schedule.description ? `
                    <div style="
                        font-size: 13px;
                        color: #6c757d;
                        margin-top: 5px;
                        font-style: italic;
                    ">${schedule.description}</div>
                ` : ''}
                ${schedule.attachments && schedule.attachments.length > 0 ? `
                    <div style="
                        font-size: 12px;
                        color: #6c757d;
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 1px solid #dee2e6;
                    ">
                        <strong>첨부파일:</strong><br>
                        ${schedule.attachments.map(file => `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`).join('<br>')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // ========== 메모 삭제 ==========
    function deleteMemo(dateStr, memoId) {
        // 잠금 상태일 때 삭제 방지
        if (isLocked) {
            showNotification('🔒 메모가 삭제 보호 모드입니다. 잠금 버튼을 눌러 보호를 해제하세요.', 'warning');
            return;
        }

        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        if (memos[dateStr]) {
            memos[dateStr] = memos[dateStr].filter(memo => memo.id !== memoId);
            if (memos[dateStr].length === 0) {
                delete memos[dateStr];
            }
            localStorage.setItem('calendarMemos', JSON.stringify(memos));
            loadMemos();
            showNotification('메모가 삭제되었습니다', 'info');
            updateCalendarMarker(dateStr, 'memo');
        }
    }
    
    // ========== 일정 삭제 ==========
    function deleteSchedule(dateStr, scheduleId) {
        const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
        if (schedules[dateStr]) {
            schedules[dateStr] = schedules[dateStr].filter(schedule => schedule.id !== scheduleId);
            if (schedules[dateStr].length === 0) {
                delete schedules[dateStr];
            }
            localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
            loadSchedules();
            showNotification('일정이 삭제되었습니다', 'info');
            updateCalendarMarker(dateStr, 'schedule');
        }
    }
    
    // ========== 알림 표시 ==========
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            z-index: 1000000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // ========== 달력 마커 업데이트 ==========
    function updateCalendarMarker(dateStr, type) {
        // 달력의 해당 날짜에 마커 추가/제거
        const [year, month, day] = dateStr.split('-');
        const dayElements = document.querySelectorAll('.day');
        
        dayElements.forEach(dayEl => {
            const dayNum = dayEl.querySelector('.day-number')?.textContent;
            if (dayNum == parseInt(day)) {
                const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
                const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
                
                const hasMemo = memos[dateStr] && memos[dateStr].length > 0;
                const hasSchedule = schedules[dateStr] && schedules[dateStr].length > 0;
                
                // 기존 마커 제거
                const existingMarker = dayEl.querySelector('.unified-marker');
                if (existingMarker) {
                    existingMarker.remove();
                }
                
                // 새 마커 추가
                if (hasMemo || hasSchedule) {
                    const marker = document.createElement('div');
                    marker.className = 'unified-marker';
                    marker.style.cssText = `
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        display: flex;
                        gap: 2px;
                    `;
                    
                    if (hasMemo) {
                        marker.innerHTML += `<span style="
                            width: 6px;
                            height: 6px;
                            background: #667eea;
                            border-radius: 50%;
                        "></span>`;
                    }
                    
                    if (hasSchedule) {
                        marker.innerHTML += `<span style="
                            width: 6px;
                            height: 6px;
                            background: #28a745;
                            border-radius: 50%;
                        "></span>`;
                    }
                    
                    dayEl.style.position = 'relative';
                    dayEl.appendChild(marker);
                }
            }
        });
    }
    
    // ========== 날짜 클릭 이벤트 설정 ==========
    function setupDateClickEvents() {
        console.log('📅 날짜 클릭 이벤트 설정 중...');
        
        // 날짜 클릭 이벤트 (Capture phase로 우선순위 확보)
        document.addEventListener('click', function(e) {
            const day = e.target.closest('.day');
            if (!day || day.classList.contains('empty')) return;
            
            const dayNumber = day.querySelector('.day-number')?.textContent ||
                             day.textContent.match(/\d+/)?.[0];
            
            if (!dayNumber) return;
            
            const monthYear = document.getElementById('monthYear')?.textContent;
            if (!monthYear) return;
            
            const year = monthYear.match(/(\d{4})/)?.[1] || new Date().getFullYear();
            const month = monthYear.match(/(\d{1,2})월/)?.[1] || new Date().getMonth() + 1;
            
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            
            console.log('📅 날짜 클릭:', dateStr);
            openModal(dateStr);
            
            e.stopPropagation();
            e.preventDefault();
        }, true); // Capture phase 사용
        
        // +새 일정 추가 버튼 제거됨 - 일정 추가는 날짜 클릭으로 메모 모달을 통해 진행
        
        console.log('✅ 날짜 클릭 이벤트 설정 완료');
    }
    
    // ========== 초기화 ==========
    function initialize() {
        console.log('🚀 통합 캘린더 시스템 초기화 시작');
        
        try {
            // 1. 기존 시스템 정리
            cleanupOldSystems();
            
            // 2. 통합 모달 생성
            createUnifiedModal();
            
            // 3. 날짜 클릭 이벤트 설정
            setupDateClickEvents();
            
            // 4. 애니메이션 스타일 추가
            addAnimationStyles();
            
            // 5. 기존 데이터가 있는 날짜에 마커 표시
            markExistingData();
            
            // 6. 잠금 상태 복원
            restoreLockState();
            
            // 7. 알람 시스템 초기화
            requestNotificationPermission();
            loadActiveAlarms();
            
            console.log('✅ 통합 캘린더 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ 초기화 오류:', error);
            setTimeout(initialize, 1000);
        }
    }
    
    // ========== 애니메이션 스타일 추가 ==========
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            #unifiedCalendarModal * {
                box-sizing: border-box;
            }
            
            #unifiedCalendarModal button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            #unifiedCalendarModal input:focus,
            #unifiedCalendarModal textarea:focus,
            #unifiedCalendarModal select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== 기존 데이터 마커 표시 ==========
    function markExistingData() {
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
        const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
        
        const allDates = new Set([
            ...Object.keys(memos),
            ...Object.keys(schedules)
        ]);
        
        allDates.forEach(dateStr => {
            updateCalendarMarker(dateStr);
        });
    }
    
    // ========== 잠금 상태 복원 ==========
    function restoreLockState() {
        const storedLocked = localStorage.getItem('calendarLocked');
        
        if (storedLocked === 'true') {
            isLocked = true;
            updateLockUI();
            console.log('🔒 잠금 상태 복원됨');
        } else {
            isLocked = false;
            updateLockUI();
            console.log('🔓 열린 상태로 시작');
        }
    }
    
    // ========== 실행 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    // 추가 안전장치
    window.addEventListener('load', () => {
        if (!currentModal) {
            setTimeout(initialize, 500);
        }
    });
    
    // ========== 알람 시스템 ==========
    const activeAlarms = new Map(); // 활성 알람 저장
    
    function setupAlarmNotification(schedule) {
        if (!schedule.alarm || !schedule.alarm.enabled) {
            return;
        }
        
        const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
        const alarmTime = new Date(scheduleDateTime.getTime() - (schedule.alarm.minutes * 60 * 1000));
        const now = new Date();
        
        // 이미 지난 알람은 설정하지 않음
        if (alarmTime <= now) {
            console.log('⏰ 알람 시간이 이미 지났습니다:', schedule.title);
            return;
        }
        
        const timeoutId = setTimeout(() => {
            showAlarmNotification(schedule);
            playAlarmSound();
            activeAlarms.delete(schedule.id);
        }, alarmTime.getTime() - now.getTime());
        
        activeAlarms.set(schedule.id, {
            timeoutId,
            schedule,
            alarmTime
        });
        
        console.log(`⏰ 알람 설정됨: ${schedule.title} - ${alarmTime.toLocaleString()}`);
    }
    
    function showAlarmNotification(schedule) {
        // 브라우저 알림 권한 요청
        if (Notification.permission === 'granted') {
            const notification = new Notification(`일정 알림: ${schedule.title}`, {
                body: `${schedule.time}에 예정된 일정입니다.\n${schedule.description || ''}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/></svg>',
                tag: `schedule-${schedule.id}`,
                requireInteraction: true
            });
            
            notification.onclick = () => {
                window.focus();
                openModal(schedule.date);
                notification.close();
            };
        }
        
        // 커스텀 알림 팝업 표시
        showCustomAlarmPopup(schedule);
    }
    
    function showCustomAlarmPopup(schedule) {
        const popup = document.createElement('div');
        popup.id = 'alarmPopup';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            border: 2px solid #667eea;
            animation: slideInFromRight 0.5s ease;
        `;
        
        popup.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">🔔 일정 알림</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
            </div>
            <div style="padding: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">${schedule.title}</h4>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">⏰ ${schedule.time}</p>
                ${schedule.description ? `<p style="margin: 0 0 12px 0; color: #777; font-size: 13px;">${schedule.description}</p>` : ''}
                <div style="display: flex; gap: 8px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex: 1; padding: 8px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">확인</button>
                    <button onclick="snoozeAlarm('${schedule.id}')" style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">5분 후 다시</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // 10초 후 자동 제거
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    }
    
    function playAlarmSound() {
        // Web Audio API를 사용한 알림음 생성
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('알림음 재생 실패:', error);
        }
    }
    
    function snoozeAlarm(scheduleId) {
        const popup = document.getElementById('alarmPopup');
        if (popup) popup.remove();
        
        // 5분 후 다시 알림
        setTimeout(() => {
            const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
            const schedule = Object.values(schedules).flat().find(s => s.id == scheduleId);
            if (schedule) {
                showAlarmNotification(schedule);
                playAlarmSound();
            }
        }, 5 * 60 * 1000);
        
        console.log('⏰ 알람 5분 후 재알림 설정됨');
    }
    
    function cancelAlarm(scheduleId) {
        const alarm = activeAlarms.get(scheduleId);
        if (alarm) {
            clearTimeout(alarm.timeoutId);
            activeAlarms.delete(scheduleId);
            console.log('⏰ 알람 취소됨:', scheduleId);
        }
    }
    
    function loadActiveAlarms() {
        // 페이지 로드 시 모든 일정의 알람과 팝업을 다시 설정
        const schedules = JSON.parse(localStorage.getItem('calendarSchedules') || '{}');
        Object.values(schedules).flat().forEach(schedule => {
            if (schedule.alarm && schedule.alarm.enabled) {
                setupAlarmNotification(schedule);
            }
            if (schedule.popup) {
                setupSchedulePopup(schedule);
            }
        });
    }
    
    // 브라우저 알림 권한 요청
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('알림 권한:', permission);
            });
        }
    }
    
    // ========== 팝업 시스템 ==========
    function setupSchedulePopup(schedule) {
        if (!schedule.popup) return;
        
        const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
        const now = new Date();
        
        if (scheduleDateTime <= now) return;
        
        setTimeout(() => {
            showSchedulePopup(schedule);
        }, scheduleDateTime.getTime() - now.getTime());
        
        console.log(`📋 팝업 설정됨: ${schedule.title} - ${scheduleDateTime.toLocaleString()}`);
    }
    
    function showSchedulePopup(schedule) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            max-width: 90vw;
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            border: 3px solid #28a745;
            animation: bounceIn 0.6s ease;
        `;
        
        popup.innerHTML = `
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 16px; border-radius: 13px 13px 0 0; text-align: center;">
                <h3 style="margin: 0; font-size: 18px;">📋 일정 시작</h3>
            </div>
            <div style="padding: 20px; text-align: center;">
                <h2 style="margin: 0 0 12px 0; color: #333;">${schedule.title}</h2>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 16px;">⏰ ${schedule.time}</p>
                ${schedule.description ? `<p style="margin: 0 0 16px 0; color: #777; line-height: 1.4;">${schedule.description}</p>` : ''}
                ${schedule.attachments && schedule.attachments.length > 0 ? `
                    <div style="margin: 12px 0; text-align: left;">
                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">📎 첨부파일:</p>
                        ${schedule.attachments.map(file => 
                            `<div style="margin: 4px 0; padding: 4px 8px; background: #f8f9fa; border-radius: 4px; font-size: 14px;">📄 ${file.name}</div>`
                        ).join('')}
                    </div>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">확인</button>
            </div>
        `;
        
        // 바운스 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(popup);
        
        // 클릭으로 닫기
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }
    
    // ========== 전역 API 노출 ==========
    window.UnifiedCalendar = {
        openModal,
        closeModal,
        deleteMemo,
        deleteSchedule,
        saveMemo,
        saveSchedule,
        setupAlarmNotification,
        cancelAlarm,
        snoozeAlarm: (id) => snoozeAlarm(id)
    };
    
    // snoozeAlarm을 전역으로 노출
    window.snoozeAlarm = snoozeAlarm;
    
    console.log('✅ 통합 캘린더 시스템 로드 완료');
    
})();