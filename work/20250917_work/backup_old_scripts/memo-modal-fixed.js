/**
 * 메모 모달 완전 수정 버전
 * 새로고침 후 즉시 작동, 안전한 위치 설정, 드래그 기능 개선
 */

(function() {
    'use strict';
    
    console.log('🔥 메모 모달 완전 수정 버전 시작');
    
    let memoModal = null;
    let isDragging = false;
    let currentDate = null;
    
    // ========== 즉시 실행: 기존 모달 비활성화 ==========
    function disableExistingModals() {
        // 모든 기존 메모 모달 찾아서 완전 비활성화
        const selectors = ['#memoModal', '#memoModalBackup', '#improvedMemoModal', '#simpleMemoModal'];
        selectors.forEach(selector => {
            const modal = document.querySelector(selector);
            if (modal) {
                modal.style.display = 'none !important';
                modal.style.visibility = 'hidden';
                modal.style.zIndex = '-999';
                modal.remove(); // 완전 제거
            }
        });
        
        console.log('🗑️ 기존 메모 모달들 완전 제거');
    }
    
    // ========== 새로운 메모 모달 생성 ==========
    function createFixedMemoModal() {
        if (document.getElementById('fixedMemoModal')) {
            document.getElementById('fixedMemoModal').remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'fixedMemoModal';
        modal.className = 'fixed-memo-modal';
        modal.style.cssText = `
            position: fixed !important;
            width: 420px;
            height: 520px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
            z-index: 999999 !important;
            display: none;
            flex-direction: column;
            font-family: 'Segoe UI', -apple-system, 'Malgun Gothic', sans-serif;
            border: 1px solid #e0e0e0;
            overflow: hidden;
            top: 50vh;
            left: 50vw;
            transform: translate(-50%, -50%);
            margin: 0;
            box-sizing: border-box;
        `;
        
        modal.innerHTML = `
            <div class="fixed-memo-header" style="
                padding: 16px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                cursor: grab;
                user-select: none;
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 16px 16px 0 0;
            ">
                <div style="
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.4;
                    font-size: 18px;
                    letter-spacing: -2px;
                    pointer-events: none;
                ">⋮⋮</div>
                
                <div class="memo-date-info">
                    <h3 id="fixedMemoDate" style="margin: 0; font-size: 18px; font-weight: 600;">날짜 선택</h3>
                    <div id="fixedMemoCount" style="
                        background: rgba(255, 255, 255, 0.2);
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 12px;
                        margin-top: 4px;
                        display: inline-block;
                    ">0개</div>
                </div>
                
                <div class="memo-header-actions" style="display: flex; gap: 8px;">
                    <button id="resetPositionBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    " title="중앙으로 이동">🎯</button>
                    
                    <button id="fixedMemoClose" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">✕</button>
                </div>
            </div>
            
            <div class="fixed-memo-content" style="
                padding: 20px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 16px;
                overflow-y: auto;
                background: #fafbfc;
            ">
                <!-- 빠른 메모 작성 -->
                <div class="quick-memo-form" style="
                    background: white;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #e6e8eb;
                ">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <input type="text" id="fixedMemoTitle" placeholder="📝 메모 제목" style="
                            flex: 1;
                            padding: 10px 14px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            font-size: 14px;
                            font-family: inherit;
                        ">
                        <button id="fixedMemoSave" style="
                            padding: 10px 18px;
                            background: #667eea;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            white-space: nowrap;
                        ">저장</button>
                    </div>
                    
                    <textarea id="fixedMemoContent" placeholder="메모 내용을 자유롭게 작성하세요..." style="
                        width: 100%;
                        height: 80px;
                        padding: 10px 14px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        resize: none;
                        font-family: inherit;
                        line-height: 1.4;
                    "></textarea>
                </div>
                
                <!-- 메모 목록 -->
                <div class="memo-list-section" style="
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e6e8eb;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div class="memo-list-header" style="
                        padding: 16px;
                        border-bottom: 1px solid #f0f0f0;
                        font-weight: 600;
                        color: #333;
                        background: #f8f9fa;
                    ">
                        📋 저장된 메모
                    </div>
                    
                    <div id="fixedMemoList" style="
                        flex: 1;
                        padding: 8px;
                        overflow-y: auto;
                        max-height: 200px;
                    ">
                        <div class="no-memo-placeholder" style="
                            text-align: center;
                            color: #999;
                            padding: 30px;
                            font-style: italic;
                        ">📝 아직 메모가 없습니다</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        memoModal = modal;
        
        console.log('✅ 새로운 메모 모달 생성 완료');
        return modal;
    }
    
    // ========== 이벤트 초기화 ==========
    function initFixedMemoEvents() {
        const modal = memoModal;
        if (!modal) return;
        
        // 닫기 버튼
        const closeBtn = document.getElementById('fixedMemoClose');
        if (closeBtn) {
            closeBtn.onclick = closeMemoModal;
        }
        
        // 위치 리셋 버튼
        const resetBtn = document.getElementById('resetPositionBtn');
        if (resetBtn) {
            resetBtn.onclick = resetModalPosition;
        }
        
        // 저장 버튼
        const saveBtn = document.getElementById('fixedMemoSave');
        if (saveBtn) {
            saveBtn.onclick = saveMemo;
        }
        
        // 제목 입력에서 Enter 키
        const titleInput = document.getElementById('fixedMemoTitle');
        if (titleInput) {
            titleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveMemo();
                }
            });
        }
        
        // 드래그 기능 초기화
        initDragFunctionality();
        
        console.log('✅ 메모 모달 이벤트 초기화 완료');
    }
    
    // ========== 안전한 드래그 기능 ==========
    function initDragFunctionality() {
        const modal = memoModal;
        if (!modal) {
            console.error('❌ 메모 모달이 생성되지 않음');
            return;
        }
        
        const header = modal.querySelector('.fixed-memo-header');
        if (!header) {
            console.error('❌ 드래그 헤더를 찾을 수 없음, modal:', modal);
            console.error('modal.innerHTML:', modal.innerHTML.substring(0, 200));
            return;
        }
        console.log('✅ 드래그 헤더 찾음:', header);
        
        let dragState = {
            isDragging: false,
            startX: 0,
            startY: 0,
            modalStartX: 0,
            modalStartY: 0
        };
        
        // 드래그 시작
        function startDrag(e) {
            // 버튼 클릭은 드래그하지 않음
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            
            dragState.isDragging = true;
            dragState.startX = e.clientX || (e.touches && e.touches[0].clientX);
            dragState.startY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const rect = modal.getBoundingClientRect();
            dragState.modalStartX = rect.left;
            dragState.modalStartY = rect.top;
            
            // 드래그 중 스타일
            modal.style.transition = 'none';
            modal.style.transform = 'none';
            header.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
        }
        
        // 드래그 중 (향상된 안정성)
        function onDrag(e) {
            if (!dragState.isDragging) return;
            
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const currentY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // 유효한 좌표인지 확인
            if (typeof currentX !== 'number' || typeof currentY !== 'number') return;
            
            const deltaX = currentX - dragState.startX;
            const deltaY = currentY - dragState.startY;
            
            let newX = dragState.modalStartX + deltaX;
            let newY = dragState.modalStartY + deltaY;
            
            // 안전 영역 계산 (화면 경계에서 최소 20px 여백)
            const modalWidth = modal.offsetWidth;
            const modalHeight = modal.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 경계 확인 강화
            const minX = 20;
            const minY = 20;
            const maxX = Math.max(minX, windowWidth - modalWidth - 20);
            const maxY = Math.max(minY, windowHeight - modalHeight - 20);
            
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            
            // 유효성 재검사
            if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
                modal.style.left = newX + 'px';
                modal.style.top = newY + 'px';
            }
            
            e.preventDefault();
        }
        
        // 드래그 종료
        function endDrag() {
            if (!dragState.isDragging) return;
            
            dragState.isDragging = false;
            
            // 스타일 복원
            modal.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            header.style.cursor = 'grab';
            document.body.style.userSelect = '';
            
            // 위치 저장
            const rect = modal.getBoundingClientRect();
            localStorage.setItem('fixedMemoPosition', JSON.stringify({
                x: rect.left,
                y: rect.top
            }));
        }
        
        // 헤더 스타일 설정
        header.style.cursor = 'grab';
        header.style.userSelect = 'none';
        
        // 이벤트 리스너 등록
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        
        // 터치 이벤트 지원
        header.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        
        console.log('✅ 드래그 기능 초기화 완료');
    }
    
    // ========== 안전한 위치 설정 ==========
    function setSafePosition() {
        const modal = memoModal;
        if (!modal) return;
        
        // 저장된 위치 확인
        const savedPos = JSON.parse(localStorage.getItem('fixedMemoPosition') || 'null');
        
        if (savedPos && isPositionSafe(savedPos)) {
            // 저장된 위치가 안전하면 사용
            modal.style.left = savedPos.x + 'px';
            modal.style.top = savedPos.y + 'px';
            modal.style.transform = 'none';
        } else {
            // 안전하지 않거나 저장된 위치가 없으면 중앙에 배치
            modal.style.top = '50vh';
            modal.style.left = '50vw';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.margin = '0';
            
            // 잘못된 위치 정보 삭제
            localStorage.removeItem('fixedMemoPosition');
        }
    }
    
    // ========== 위치 안전성 검사 ==========
    function isPositionSafe(position) {
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            return false;
        }
        
        const modalWidth = 420;
        const modalHeight = 520;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 화면 내부에 있는지 확인 (최소 50px은 보여야 함)
        return (
            position.x >= -modalWidth + 50 &&
            position.x <= windowWidth - 50 &&
            position.y >= 20 &&
            position.y <= windowHeight - 50
        );
    }
    
    // ========== 위치 리셋 ==========
    function resetModalPosition() {
        const modal = memoModal;
        if (!modal) return;
        
        modal.style.top = '50vh';
        modal.style.left = '50vw';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.margin = '0';
        modal.style.position = 'fixed';
        
        localStorage.removeItem('fixedMemoPosition');
        
        showNotification('메모창을 중앙으로 이동했습니다');
    }
    
    // ========== 날짜 클릭 이벤트 설정 (강력한 버전) ==========
    function setupDateClickEvents() {
        // 기존 이벤트 완전 제거
        document.removeEventListener('click', handleDateClick, true);
        
        // 새 이벤트 등록 (capture 단계에서)
        document.addEventListener('click', handleDateClick, true);
        
        // 추가 안전장치: body에도 이벤트 등록
        document.body.addEventListener('click', handleDateClick, false);
        
        console.log('📅 날짜 클릭 이벤트 등록 완료');
    }
    
    // ========== 날짜 클릭 핸들러 ==========
    function handleDateClick(e) {
        const dayElement = e.target.closest('.day');
        if (!dayElement || dayElement.classList.contains('empty')) return;
        
        // 메모 모달이 열려있으면 무시
        if (memoModal && memoModal.style.display !== 'none') return;
        
        // 날짜 정보 추출
        const dayNumber = dayElement.querySelector('.day-number')?.textContent || 
                         dayElement.textContent.trim().match(/^\d+/)?.[0];
        
        if (!dayNumber || !dayNumber.match(/^\d+$/)) return;
        
        // 현재 표시된 월/년 가져오기
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
        
        // 메모 모달 열기
        openMemoModal(dateStr);
        
        e.stopPropagation();
        e.preventDefault();
    }
    
    // ========== 메모 모달 열기 ==========
    function openMemoModal(dateStr) {
        if (!memoModal) {
            createFixedMemoModal();
            initFixedMemoEvents();
        }
        
        currentDate = dateStr;
        
        // 날짜 표시 업데이트
        const dateTitle = document.getElementById('fixedMemoDate');
        if (dateTitle) {
            const [year, month, day] = dateStr.split('-');
            dateTitle.textContent = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        }
        
        // 안전한 위치 설정
        setSafePosition();
        
        // 모달 표시
        memoModal.style.display = 'flex';
        
        // 메모 로드
        loadMemosForDate(dateStr);
        
        // 입력 필드에 포커스
        setTimeout(() => {
            const titleInput = document.getElementById('fixedMemoTitle');
            if (titleInput) {
                titleInput.focus();
            }
        }, 100);
        
        console.log(`📝 메모 모달 열림: ${dateStr}`);
    }
    
    // ========== 메모 모달 닫기 ==========
    function closeMemoModal() {
        if (memoModal) {
            memoModal.style.display = 'none';
            
            // 입력 필드 초기화
            const titleInput = document.getElementById('fixedMemoTitle');
            const contentInput = document.getElementById('fixedMemoContent');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
        }
        currentDate = null;
    }
    
    // ========== 메모 저장 ==========
    function saveMemo() {
        console.log('💾 메모 저장 시도, currentDate:', currentDate);
        
        if (!currentDate) {
            console.error('❌ currentDate가 설정되지 않음');
            showNotification('날짜가 설정되지 않았습니다', 'warning');
            return;
        }
        
        const titleInput = document.getElementById('fixedMemoTitle');
        const contentInput = document.getElementById('fixedMemoContent');
        
        if (!titleInput || !contentInput) {
            console.error('❌ 입력 요소를 찾을 수 없음', { titleInput, contentInput });
            showNotification('입력 요소를 찾을 수 없습니다', 'error');
            return;
        }
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        console.log('📝 입력 내용:', { title, content });
        
        if (!title && !content) {
            showNotification('제목이나 내용을 입력해주세요', 'warning');
            titleInput.focus();
            return;
        }
        
        const memo = {
            id: Date.now(),
            title: title || '제목 없음',
            content: content,
            date: currentDate,
            timestamp: new Date().toISOString()
        };
        
        // localStorage에 저장
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        if (!memos[currentDate]) {
            memos[currentDate] = [];
        }
        memos[currentDate].push(memo);
        localStorage.setItem('memos', JSON.stringify(memos));
        
        // 입력 필드 초기화
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();
        
        // 메모 목록 새로고침
        loadMemosForDate(currentDate);
        
        showNotification('메모가 저장되었습니다! ✅', 'success');
    }
    
    // ========== 메모 로드 ==========
    function loadMemosForDate(dateStr) {
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        const dayMemos = (memos[dateStr] || []).sort((a, b) => {
            // timestamp 기준으로 날짜순 정렬 (최신순)
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // 카운트 업데이트
        const countElement = document.getElementById('fixedMemoCount');
        if (countElement) {
            countElement.textContent = dayMemos.length + '개';
        }
        
        // 메모 리스트 업데이트
        const listContainer = document.getElementById('fixedMemoList');
        if (!listContainer) return;
        
        if (dayMemos.length === 0) {
            listContainer.innerHTML = `
                <div class="no-memo-placeholder" style="
                    text-align: center;
                    color: #999;
                    padding: 30px;
                    font-style: italic;
                ">📝 아직 메모가 없습니다</div>
            `;
            return;
        }
        
        listContainer.innerHTML = dayMemos.map(memo => `
            <div class="memo-item" data-id="${memo.id}" style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
                transition: all 0.2s;
                cursor: pointer;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 6px;
                ">
                    <div style="
                        font-weight: 600;
                        color: #333;
                        font-size: 14px;
                        line-height: 1.3;
                    ">${memo.title}</div>
                    <button onclick="deleteMemo('${dateStr}', ${memo.id})" style="
                        background: none;
                        border: none;
                        color: #dc3545;
                        cursor: pointer;
                        padding: 2px;
                        opacity: 0.7;
                        font-size: 14px;
                    " title="삭제">🗑️</button>
                </div>
                <div style="
                    color: #666;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 6px;
                    word-wrap: break-word;
                ">${memo.content}</div>
                <div style="
                    font-size: 11px;
                    color: #999;
                    text-align: right;
                ">${formatTimestamp(memo.timestamp)}</div>
            </div>
        `).join('');
    }
    
    // ========== 메모 삭제 ==========
    window.deleteMemo = function(dateStr, memoId) {
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        if (memos[dateStr]) {
            memos[dateStr] = memos[dateStr].filter(memo => memo.id !== memoId);
            if (memos[dateStr].length === 0) {
                delete memos[dateStr];
            }
            localStorage.setItem('memos', JSON.stringify(memos));
            loadMemosForDate(dateStr);
            showNotification('메모가 삭제되었습니다', 'info');
        }
    };
    
    // ========== 시간 포맷 ==========
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // ========== 알림 표시 ==========
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
    
    // ========== CSS 스타일 추가 ==========
    function addStyles() {
        if (document.getElementById('fixedMemoStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'fixedMemoStyles';
        style.textContent = `
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutToRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .memo-item:hover {
                background: #e9ecef !important;
                transform: translateY(-1px);
            }
            
            .fixed-memo-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .fixed-memo-content::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            
            .fixed-memo-content::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 3px;
            }
            
            .fixed-memo-content::-webkit-scrollbar-thumb:hover {
                background: #999;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========== 초기화 ==========
    function initialize() {
        // 중복 실행 방지
        if (window.memoModalInitialized) {
            console.log('⚠️ 메모 모달 이미 초기화됨, 중복 실행 방지');
            return;
        }
        window.memoModalInitialized = true;
        
        console.log('🚀 메모 모달 완전 수정 초기화 시작');
        
        // 즉시 기존 모달 비활성화
        disableExistingModals();
        
        // 스타일 추가
        addStyles();
        
        // DOM이 준비되면 실행
        function init() {
            // 이미 초기화되었으면 중단
            if (memoModal && memoModal.parentNode) {
                console.log('✅ 메모 모달 이미 정상 동작 중');
                return;
            }
            
            disableExistingModals(); // 한 번 더 확인
            createFixedMemoModal();
            initFixedMemoEvents();
            setupDateClickEvents();
            
            console.log('✅ 메모 모달 완전 수정 초기화 완료');
        }
        
        // 한 번만 실행하도록 개선
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            setTimeout(init, 50); // 짧은 지연 후 한 번만 실행
        }
    }
    
    // 즉시 시작
    initialize();
    
    // 전역 API
    window.FixedMemoModal = {
        open: openMemoModal,
        close: closeMemoModal,
        reset: resetModalPosition
    };
    
})();