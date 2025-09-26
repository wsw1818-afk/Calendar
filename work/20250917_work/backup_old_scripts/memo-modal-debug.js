/**
 * 메모 모달 디버그 및 강제 활성화
 * 개선된 메모 모달이 제대로 작동하지 않을 때 사용하는 긴급 패치
 */

(function() {
    'use strict';
    
    console.log('🔧 메모 모달 디버그 모드 시작');
    
    // ========== 강제 초기화 ==========
    function forceMemoModalFix() {
        console.log('🚑 메모 모달 강제 수정 시작');
        
        // 1. 기존 메모 모달들 완전 제거
        const oldModals = document.querySelectorAll('#memoModal, #memoModalBackup, .modal');
        oldModals.forEach(modal => {
            if (modal.id.includes('memo') || modal.querySelector('#modalDate')) {
                modal.remove();
                console.log('🗑️ 기존 메모 모달 제거:', modal.id);
            }
        });
        
        // 2. 개선된 메모 모달이 있는지 확인
        let improvedModal = document.getElementById('improvedMemoModal');
        if (!improvedModal) {
            console.log('⚠️ 개선된 메모 모달이 없음, 새로 생성');
            createSimpleMemoModal();
        } else {
            console.log('✅ 개선된 메모 모달 발견, 활성화');
            activateImprovedModal(improvedModal);
        }
        
        // 3. 날짜 클릭 이벤트 강제 재설정
        setupForceClickEvents();
        
        console.log('✅ 메모 모달 강제 수정 완료');
    }
    
    // ========== 간단한 메모 모달 생성 ==========
    function createSimpleMemoModal() {
        const modal = document.createElement('div');
        modal.id = 'simpleMemoModal';
        modal.className = 'simple-memo-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 380px;
            height: 480px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            z-index: 10000;
            display: none;
            flex-direction: column;
            font-family: 'Segoe UI', -apple-system, sans-serif;
        `;
        
        modal.innerHTML = `
            <div class="simple-memo-header" style="
                padding: 16px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: grab;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.4;
                    font-size: 16px;
                    pointer-events: none;
                ">⋮⋮</div>
                <h3 id="simpleMemoDate" style="margin: 0; font-size: 16px;">날짜 선택</h3>
                <button id="simpleMemoClose" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                ">✕</button>
            </div>
            
            <div class="simple-memo-body" style="
                padding: 16px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
            ">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="simpleMemoTitle" placeholder="📝 제목" style="
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        font-size: 14px;
                    ">
                    <button id="simpleMemoSave" style="
                        padding: 8px 16px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">저장</button>
                </div>
                
                <textarea id="simpleMemoContent" placeholder="메모 내용을 입력하세요..." style="
                    width: 100%;
                    height: 100px;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    resize: none;
                    font-family: inherit;
                "></textarea>
                
                <div id="simpleMemoList" style="
                    flex: 1;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 8px;
                    overflow-y: auto;
                    background: #f9f9f9;
                ">
                    <div style="text-align: center; color: #999; padding: 20px;">
                        📝 메모가 없습니다
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        initSimpleMemoModal();
    }
    
    // ========== 간단한 메모 모달 초기화 ==========
    function initSimpleMemoModal() {
        const modal = document.getElementById('simpleMemoModal');
        
        // 닫기 버튼
        document.getElementById('simpleMemoClose').onclick = () => {
            modal.style.display = 'none';
        };
        
        // 저장 버튼
        document.getElementById('simpleMemoSave').onclick = saveSimpleMemo;
        
        // Enter 키 저장
        document.getElementById('simpleMemoTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSimpleMemo();
            }
        });
        
        console.log('✅ 간단한 메모 모달 초기화 완료');
    }
    
    // ========== 개선된 모달 활성화 ==========
    function activateImprovedModal(modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = '10000';
        modal.style.position = 'fixed';
        modal.style.right = '20px';
        modal.style.top = '20px';
        modal.style.width = '350px';
        modal.style.height = '450px';
    }
    
    // ========== 강제 클릭 이벤트 ==========
    function setupForceClickEvents() {
        // 기존 이벤트 제거
        const newBody = document.body.cloneNode(true);
        document.body.parentNode.replaceChild(newBody, document.body);
        
        // 새 이벤트 설정
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
            
            openForceMemoModal(dateStr);
            e.stopPropagation();
            e.preventDefault();
        }, true);
        
        console.log('🔄 강제 클릭 이벤트 설정 완료');
    }
    
    // ========== 강제 메모 모달 열기 ==========
    function openForceMemoModal(dateStr) {
        console.log('📝 강제 메모 모달 열기:', dateStr);
        
        // 개선된 모달 찾기
        let modal = document.getElementById('improvedMemoModal') || 
                   document.getElementById('simpleMemoModal');
        
        if (!modal) {
            createSimpleMemoModal();
            modal = document.getElementById('simpleMemoModal');
        }
        
        // 모달 표시
        modal.style.display = 'flex';
        modal.style.zIndex = '10001';
        
        // 날짜 설정
        const dateTitle = modal.querySelector('h3') || modal.querySelector('#simpleMemoDate');
        if (dateTitle) {
            const [year, month, day] = dateStr.split('-');
            dateTitle.textContent = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        }
        
        // 메모 로드
        loadMemosForForceModal(dateStr, modal);
        
        // 입력 필드 포커스
        const titleInput = modal.querySelector('#simpleMemoTitle') || 
                          modal.querySelector('#improvedMemoTitle');
        if (titleInput) {
            titleInput.focus();
        }
        
        // 현재 날짜 저장
        modal.dataset.currentDate = dateStr;
    }
    
    // ========== 간단한 메모 저장 ==========
    function saveSimpleMemo() {
        const modal = document.getElementById('simpleMemoModal');
        const title = document.getElementById('simpleMemoTitle').value.trim();
        const content = document.getElementById('simpleMemoContent').value.trim();
        const dateStr = modal.dataset.currentDate;
        
        if (!title && !content) {
            alert('제목이나 내용을 입력해주세요');
            return;
        }
        
        const memo = {
            id: Date.now(),
            title: title || '제목 없음',
            content: content,
            date: dateStr,
            timestamp: new Date().toISOString()
        };
        
        // localStorage에 저장
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        if (!memos[dateStr]) {
            memos[dateStr] = [];
        }
        memos[dateStr].push(memo);
        localStorage.setItem('memos', JSON.stringify(memos));
        
        // 입력 필드 초기화
        document.getElementById('simpleMemoTitle').value = '';
        document.getElementById('simpleMemoContent').value = '';
        
        // 메모 리스트 새로고침
        loadMemosForForceModal(dateStr, modal);
        
        // 성공 메시지
        showForceNotification('메모가 저장되었습니다! ✅');
        
        console.log('💾 메모 저장됨:', memo);
    }
    
    // ========== 강제 메모 로드 ==========
    function loadMemosForForceModal(dateStr, modal) {
        const memos = JSON.parse(localStorage.getItem('memos') || '{}');
        const dayMemos = (memos[dateStr] || []).sort((a, b) => {
            // timestamp 기준으로 날짜순 정렬 (최신순)
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        const listContainer = modal.querySelector('#simpleMemoList');
        if (!listContainer) return;
        
        if (dayMemos.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    📝 메모가 없습니다
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = dayMemos.map(memo => `
            <div style="
                background: white;
                border-radius: 6px;
                padding: 8px;
                margin-bottom: 8px;
                border: 1px solid #eee;
            ">
                <div style="
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 4px;
                    color: #333;
                ">${memo.title}</div>
                <div style="
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 4px;
                ">${memo.content}</div>
                <div style="
                    font-size: 11px;
                    color: #999;
                    text-align: right;
                ">${new Date(memo.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }
    
    // ========== 강제 알림 ==========
    function showForceNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4caf50;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10002;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // ========== 즉시 실행 ==========
    setTimeout(() => {
        forceMemoModalFix();
    }, 1000);
    
    // 전역 디버그 함수 노출
    window.debugMemoModal = forceMemoModalFix;
    window.openDebugMemo = openForceMemoModal;
    
    console.log('🔧 메모 모달 디버그 시스템 준비 완료');
    console.log('💡 문제가 있으면 콘솔에서 debugMemoModal() 실행');
    
})();