/**
 * 간단하고 확실하게 작동하는 메모 모달
 * 모든 기존 메모 모달 비활성화 후 완전히 새로 생성
 */

(function() {
    'use strict';
    
    console.log('🚀 간단한 메모 모달 시작');
    
    let currentDate = null;
    let modal = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    // ========== 기존 모달 완전 제거 ==========
    function removeOldModals() {
        console.log('🗑️ 기존 모달들 제거 중...');
        
        // 모든 기존 메모 모달 제거
        const oldModals = document.querySelectorAll(
            '#memoModal, #improvedMemoModal, #simpleMemoModal, #fixedMemoModal, .memo-modal, .modal'
        );
        
        oldModals.forEach(modal => {
            if (modal.id.includes('memo') || modal.querySelector('[id*="memo"]')) {
                console.log('제거:', modal.id || modal.className);
                modal.remove();
            }
        });
        
        // 기존 스타일 비활성화
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent.includes('memo') && style.textContent.includes('modal')) {
                style.textContent += '\n#memoModal, #improvedMemoModal { display: none !important; }';
            }
        });
        
        console.log('✅ 기존 모달 제거 완료');
    }
    
    // ========== 새 메모 모달 생성 ==========
    function createModal() {
        console.log('📝 새 메모 모달 생성 중...');
        
        modal = document.createElement('div');
        modal.id = 'simpleMemoModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 999999;
            display: none;
            flex-direction: column;
            font-family: Arial, sans-serif;
            border: 1px solid #ccc;
        `;
        
        modal.innerHTML = `
            <div id="simpleMemoHeader" style="
                padding: 15px;
                background: #4a90e2;
                color: white;
                border-radius: 12px 12px 0 0;
                cursor: grab;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            ">
                <h3 id="simpleMemoTitle" style="margin: 0; font-size: 16px;">날짜 선택</h3>
                <button id="simpleMemoCloseBtn" style="
                    background: rgba(255,255,255,0.3);
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            </div>
            
            <div style="
                padding: 20px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 15px;
            ">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="simpleMemoTitleInput" placeholder="제목 입력" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                    ">
                    <button id="simpleMemoSaveBtn" style="
                        padding: 8px 15px;
                        background: #4a90e2;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">저장</button>
                </div>
                
                <textarea id="simpleMemoContentInput" placeholder="메모 내용을 입력하세요..." style="
                    width: 100%;
                    height: 120px;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    resize: vertical;
                    box-sizing: border-box;
                "></textarea>
                
                <div id="simpleMemoList" style="
                    flex: 1;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    padding: 10px;
                    overflow-y: auto;
                    background: #f9f9f9;
                    min-height: 150px;
                ">
                    <div style="text-align: center; color: #999; padding: 20px;">
                        메모가 없습니다
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ 메모 모달 생성 완료');
        
        // 이벤트 바인딩
        bindEvents();
    }
    
    // ========== 이벤트 바인딩 ==========
    function bindEvents() {
        console.log('🔗 이벤트 바인딩 중...');
        
        // 닫기 버튼
        const closeBtn = document.getElementById('simpleMemoCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
            console.log('✅ 닫기 버튼 이벤트 연결');
        }
        
        // 저장 버튼
        const saveBtn = document.getElementById('simpleMemoSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveMemo;
            console.log('✅ 저장 버튼 이벤트 연결');
        }
        
        // 제목 Enter 키
        const titleInput = document.getElementById('simpleMemoTitleInput');
        if (titleInput) {
            titleInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveMemo();
                }
            });
            console.log('✅ 제목 입력 이벤트 연결');
        }
        
        // 드래그 이벤트
        const header = document.getElementById('simpleMemoHeader');
        if (header) {
            header.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);
            console.log('✅ 드래그 이벤트 연결');
        }
        
        console.log('✅ 모든 이벤트 바인딩 완료');
    }
    
    // ========== 드래그 기능 ==========
    function startDrag(e) {
        if (e.target.id === 'simpleMemoCloseBtn') return; // 닫기 버튼은 드래그 안 함
        
        isDragging = true;
        const rect = modal.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        const header = document.getElementById('simpleMemoHeader');
        if (header) header.style.cursor = 'grabbing';
        e.preventDefault();
        
        console.log('🖱️ 드래그 시작');
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // 화면 경계 확인
        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;
        
        const safeX = Math.max(0, Math.min(maxX, newX));
        const safeY = Math.max(0, Math.min(maxY, newY));
        
        modal.style.left = safeX + 'px';
        modal.style.top = safeY + 'px';
        modal.style.transform = 'none';
        
        e.preventDefault();
    }
    
    function endDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        const header = document.getElementById('simpleMemoHeader');
        if (header) header.style.cursor = 'grab';
        
        console.log('🖱️ 드래그 종료');
    }
    
    // ========== 모달 열기 ==========
    function openModal(dateStr) {
        console.log('📅 모달 열기:', dateStr);
        
        if (!modal) {
            console.error('❌ 모달이 생성되지 않음');
            createModal(); // 모달이 없으면 다시 생성
            if (!modal) {
                console.error('❌ 모달 생성 실패');
                return;
            }
        }
        
        currentDate = dateStr;
        modal.style.display = 'flex';
        
        // 날짜 표시 (안전하게)
        const modalTitle = document.getElementById('simpleMemoTitle');
        if (modalTitle) {
            const [year, month, day] = dateStr.split('-');
            const title = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
            modalTitle.textContent = title;
        } else {
            console.error('❌ simpleMemoTitle 요소를 찾을 수 없음');
        }
        
        // 메모 로드
        loadMemos(dateStr);
        
        // 입력 필드 초기화 및 포커스 (안전하게)
        const titleInput = document.getElementById('simpleMemoTitleInput');
        const contentInput = document.getElementById('simpleMemoContentInput');
        
        if (titleInput) {
            titleInput.value = '';
            titleInput.focus();
        } else {
            console.error('❌ memoTitle 입력 요소를 찾을 수 없음');
        }
        
        if (contentInput) {
            contentInput.value = '';
        } else {
            console.error('❌ memoContent 입력 요소를 찾을 수 없음');
        }
        
        console.log('✅ 모달 열기 완료');
    }
    
    // ========== 모달 닫기 ==========
    function closeModal() {
        console.log('❌ 모달 닫기');
        
        if (modal) {
            modal.style.display = 'none';
        }
        currentDate = null;
        
        console.log('✅ 모달 닫기 완료');
    }
    
    // ========== 메모 저장 ==========
    function saveMemo() {
        console.log('💾 메모 저장 시도');
        
        if (!currentDate) {
            alert('날짜가 선택되지 않았습니다.');
            return;
        }
        
        const titleInput = document.getElementById('simpleMemoTitleInput');
        const contentInput = document.getElementById('simpleMemoContentInput');
        
        if (!titleInput || !contentInput) {
            console.error('❌ 입력 요소를 찾을 수 없음');
            alert('입력 요소를 찾을 수 없습니다.');
            return;
        }
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title && !content) {
            alert('제목이나 내용을 입력해주세요.');
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
        
        console.log('💾 메모 저장됨:', memo);
        
        // 입력 필드 초기화 (안전하게)
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        
        // 메모 리스트 새로고침
        loadMemos(currentDate);
        
        // 성공 알림
        showNotification('메모가 저장되었습니다! ✅');
        
        // 제목 입력에 포커스
        if (titleInput) titleInput.focus();
    }
    
    // ========== 메모 로드 ==========
    function loadMemos(dateStr) {
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        const dayMemos = (memos[dateStr] || []).sort((a, b) => {
            // timestamp 기준으로 날짜순 정렬 (최신순)
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        const listContainer = document.getElementById('simpleMemoList');
        if (!listContainer) return;
        
        if (dayMemos.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    메모가 없습니다
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = dayMemos.map(memo => `
            <div style="
                background: white;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                border: 1px solid #ddd;
                position: relative;
            ">
                <div style="
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 5px;
                    color: #333;
                ">${memo.title}</div>
                <div style="
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 5px;
                    line-height: 1.4;
                ">${memo.content}</div>
                <div style="
                    font-size: 11px;
                    color: #999;
                    text-align: right;
                ">${new Date(memo.timestamp).toLocaleString('ko-KR')}</div>
                <button onclick="deleteMemo('${dateStr}', ${memo.id})" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: #ff4757;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 2px 6px;
                    cursor: pointer;
                    font-size: 11px;
                ">삭제</button>
            </div>
        `).join('');
        
        console.log('📋 메모 로드 완료:', dayMemos.length + '개');
    }
    
    // ========== 메모 삭제 ==========
    window.deleteMemo = function(dateStr, memoId) {
        console.log('🗑️ 메모 삭제:', dateStr, memoId);
        
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        if (memos[dateStr]) {
            memos[dateStr] = memos[dateStr].filter(memo => memo.id !== memoId);
            if (memos[dateStr].length === 0) {
                delete memos[dateStr];
            }
            localStorage.setItem('memos', JSON.stringify(memos));
            loadMemos(dateStr);
            showNotification('메모가 삭제되었습니다');
        }
    };
    
    // ========== 알림 표시 ==========
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 10px 20px;
            background: #4a90e2;
            color: white;
            border-radius: 6px;
            z-index: 1000000;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // ========== 날짜 클릭 이벤트 설정 ==========
    function setupDateClicks() {
        console.log('📅 날짜 클릭 이벤트 설정 중...');
        
        // 기존 이벤트 제거를 위해 새로운 리스너 추가
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
            
            console.log('📅 날짜 클릭됨:', dateStr);
            openModal(dateStr);
            
            e.stopPropagation();
            e.preventDefault();
        }, true);
        
        console.log('✅ 날짜 클릭 이벤트 설정 완료');
    }
    
    // ========== 초기화 ==========
    function initialize() {
        console.log('🚀 간단한 메모 모달 초기화 시작');
        
        try {
            // 1. 기존 모달 제거
            removeOldModals();
            
            // 2. 새 모달 생성
            createModal();
            
            // 3. 모달이 제대로 생성되었는지 확인
            if (!modal || !document.getElementById('simpleMemoTitle')) {
                console.error('❌ 모달 생성 실패, 재시도');
                setTimeout(() => {
                    createModal();
                    setupDateClicks();
                }, 500);
                return;
            }
            
            // 4. 날짜 클릭 이벤트 설정
            setupDateClicks();
            
            console.log('✅ 간단한 메모 모달 초기화 완료');
            
        } catch (error) {
            console.error('❌ 초기화 중 오류:', error);
            // 재시도
            setTimeout(initialize, 1000);
        }
    }
    
    // ========== 실행 ==========
    // DOM 준비되면 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    // 추가 안전장치
    window.addEventListener('load', () => {
        setTimeout(initialize, 200);
    });
    
    // 전역 API
    window.simpleOpenMemo = openModal;
    window.simpleCloseMemo = closeModal;
    
    console.log('🎯 간단한 메모 모달 스크립트 로드 완료');
    
})();