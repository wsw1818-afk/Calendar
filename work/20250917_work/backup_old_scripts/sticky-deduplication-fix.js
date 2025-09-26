/**
 * 스티커 메모 중복 생성 방지 수정
 * 여러 스크립트 충돌로 인한 중복 창 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🔧 스티커 메모 중복 방지 시스템 시작');
    
    // 전역 플래그로 중복 실행 방지
    if (window._stickyDeduplicationActive) {
        console.warn('⚠️ 중복 방지 시스템이 이미 활성화되어 있습니다.');
        return;
    }
    window._stickyDeduplicationActive = true;
    
    // 상태 관리
    let stickyState = {
        isOpen: false,
        currentElement: null,
        isCreating: false,
        creationTimeout: null
    };
    
    /**
     * 기존 스티커 메모 모두 제거
     */
    function removeAllExistingStickyMemos() {
        const existingMemos = document.querySelectorAll('#stickyMemo, [id*="sticky"], .sticky-memo');
        let removedCount = 0;
        
        existingMemos.forEach(memo => {
            if (memo.id === 'stickyMemo' || memo.classList.contains('sticky-memo')) {
                memo.remove();
                removedCount++;
            }
        });
        
        // DOM에서 완전히 제거 확인
        setTimeout(() => {
            const stillExists = document.getElementById('stickyMemo');
            if (stillExists) {
                stillExists.remove();
                console.log('🗑️ 남은 스티커 메모 강제 제거');
            }
        }, 50);
        
        if (removedCount > 0) {
            console.log(`🗑️ ${removedCount}개의 기존 스티커 메모 제거 완료`);
        }
        
        stickyState.currentElement = null;
        stickyState.isOpen = false;
    }
    
    /**
     * 통합된 스티커 메모 생성
     */
    function createUnifiedStickyMemo() {
        if (stickyState.isCreating) {
            console.log('🚫 이미 생성 중입니다. 중복 생성 방지');
            return null;
        }
        
        stickyState.isCreating = true;
        
        // 기존 메모 완전 제거
        removeAllExistingStickyMemos();
        
        console.log('📝 통합 스티커 메모 생성 시작');
        
        // 새 스티커 메모 생성
        const stickyMemo = document.createElement('div');
        stickyMemo.id = 'stickyMemo';
        stickyMemo.className = 'sticky-memo active';
        
        // 기본 구조 생성
        stickyMemo.innerHTML = `
            <div id="stickyMemoHeader" class="sticky-memo-header">
                <span class="sticky-memo-title">📌 스티커 메모</span>
                <div class="sticky-memo-controls">
                    <button id="stickyMinimize" class="control-btn" title="최소화">—</button>
                    <button id="stickyMaximize" class="control-btn" title="최대화">□</button>
                    <button id="stickyClose" class="control-btn" title="닫기">×</button>
                </div>
            </div>
            <div class="sticky-memo-content">
                <div class="sticky-memo-toolbar">
                    <button id="addStickyMemo" class="toolbar-btn">+ 메모 추가</button>
                    <button id="saveStickyMemo" class="toolbar-btn">💾 저장</button>
                </div>
                <div id="stickyMemoList" class="sticky-memo-list">
                    <div class="empty-message">메모를 추가해보세요!</div>
                </div>
            </div>
        `;
        
        // 기본 스타일 적용
        applyUnifiedStyles(stickyMemo);
        
        // body에 추가
        document.body.appendChild(stickyMemo);
        
        // 상태 업데이트
        stickyState.currentElement = stickyMemo;
        stickyState.isOpen = true;
        stickyState.isCreating = false;
        
        // 스티커 메모 강제 표시
        stickyMemo.style.display = 'flex';
        stickyMemo.style.visibility = 'visible';
        stickyMemo.style.opacity = '1';
        
        // 전역 참조 설정 (다른 스크립트들을 위해)
        window._currentStickyMemo = stickyMemo;
        
        // 이벤트 설정
        setupUnifiedEvents(stickyMemo);
        
        // 기존 메모 데이터 로드
        loadExistingMemos(stickyMemo);
        
        console.log('✅ 통합 스티커 메모 생성 완료');
        return stickyMemo;
    }
    
    /**
     * 통합 스타일 적용
     */
    function applyUnifiedStyles(element) {
        element.style.cssText = `
            position: fixed !important;
            z-index: 2147483647 !important;
            top: 100px !important;
            left: 100px !important;
            width: 400px !important;
            min-height: 500px !important;
            background: linear-gradient(135deg, rgba(255, 249, 196, 0.98) 0%, rgba(255, 245, 157, 0.98) 100%) !important;
            border-radius: 15px !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 193, 7, 0.3) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: visible !important;
            user-select: none !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;
    }
    
    /**
     * 통합 이벤트 설정
     */
    function setupUnifiedEvents(element) {
        // 닫기 버튼
        const closeBtn = element.querySelector('#stickyClose');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeStickyMemo();
            };
        }
        
        // 최소화 버튼
        const minimizeBtn = element.querySelector('#stickyMinimize');
        if (minimizeBtn) {
            minimizeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                element.style.height = '40px';
                element.querySelector('.sticky-memo-content').style.display = 'none';
            };
        }
        
        // 최대화 버튼
        const maximizeBtn = element.querySelector('#stickyMaximize');
        if (maximizeBtn) {
            maximizeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                element.style.height = 'auto';
                element.querySelector('.sticky-memo-content').style.display = 'block';
            };
        }
        
        // 메모 추가 버튼
        const addBtn = element.querySelector('#addStickyMemo');
        if (addBtn) {
            addBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                addNewStickyMemo();
            };
        }
        
        // 저장 버튼
        const saveBtn = element.querySelector('#saveStickyMemo');
        if (saveBtn) {
            saveBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                saveStickyMemos();
            };
        }
    }
    
    /**
     * 기존 메모 데이터 로드
     */
    function loadExistingMemos(element) {
        try {
            const stickyMemos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
            const memoList = element.querySelector('#stickyMemoList');
            
            if (stickyMemos.length > 0) {
                memoList.innerHTML = '';
                stickyMemos.forEach(memo => {
                    addMemoToList(memoList, memo.text, memo.id);
                });
                console.log(`📂 ${stickyMemos.length}개 기존 메모 로드 완료`);
            }
        } catch (e) {
            console.warn('메모 로드 실패:', e);
        }
    }
    
    /**
     * 메모 리스트에 추가
     */
    function addMemoToList(container, text, id) {
        const memoItem = document.createElement('div');
        memoItem.className = 'sticky-memo-item';
        memoItem.dataset.id = id || Date.now();
        
        memoItem.innerHTML = `
            <div class="memo-text" contenteditable="true">${text || ''}</div>
            <button class="delete-memo-btn" onclick="deleteStickyMemoItem(this)">×</button>
        `;
        
        container.appendChild(memoItem);
    }
    
    /**
     * 새 메모 추가
     */
    function addNewStickyMemo() {
        const element = stickyState.currentElement;
        if (!element) return;
        
        const memoList = element.querySelector('#stickyMemoList');
        const emptyMessage = memoList.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        addMemoToList(memoList, '새 메모를 입력하세요...');
        saveStickyMemos();
    }
    
    /**
     * 메모 저장
     */
    function saveStickyMemos() {
        const element = stickyState.currentElement;
        if (!element) return;
        
        const memoItems = element.querySelectorAll('.sticky-memo-item');
        const memos = Array.from(memoItems).map(item => ({
            id: item.dataset.id,
            text: item.querySelector('.memo-text').textContent.trim()
        })).filter(memo => memo.text);
        
        try {
            localStorage.setItem('stickyMemos', JSON.stringify(memos));
            console.log(`💾 ${memos.length}개 메모 저장 완료`);
        } catch (e) {
            console.error('메모 저장 실패:', e);
        }
    }
    
    /**
     * 스티커 메모 닫기
     */
    function closeStickyMemo() {
        if (stickyState.currentElement) {
            saveStickyMemos();
            stickyState.currentElement.style.display = 'none';
            stickyState.isOpen = false;
            console.log('📝 스티커 메모 닫기');
        }
    }
    
    /**
     * 메모 아이템 삭제
     */
    window.deleteStickyMemoItem = function(button) {
        const memoItem = button.closest('.sticky-memo-item');
        if (memoItem) {
            memoItem.remove();
            saveStickyMemos();
            
            // 메모가 없으면 빈 메시지 표시
            const element = stickyState.currentElement;
            if (element) {
                const memoList = element.querySelector('#stickyMemoList');
                if (memoList.children.length === 0) {
                    memoList.innerHTML = '<div class="empty-message">메모를 추가해보세요!</div>';
                }
            }
        }
    };
    
    /**
     * 통합된 openStickyMemo 함수
     */
    function unifiedOpenStickyMemo() {
        console.log('📝 통합 openStickyMemo 실행');
        
        // 이미 열려있는 경우 표시만
        if (stickyState.isOpen && stickyState.currentElement) {
            stickyState.currentElement.style.display = 'flex';
            stickyState.currentElement.style.visibility = 'visible';
            stickyState.currentElement.style.opacity = '1';
            
            // 전역 참조 업데이트
            window._currentStickyMemo = stickyState.currentElement;
            
            console.log('📝 기존 스티커 메모 표시');
            return;
        }
        
        // 중복 생성 방지 타임아웃
        if (stickyState.creationTimeout) {
            clearTimeout(stickyState.creationTimeout);
        }
        
        stickyState.creationTimeout = setTimeout(() => {
            const element = createUnifiedStickyMemo();
            if (element) {
                // 향상된 이동 시스템 초기화
                if (window.StickyEnhancedMovement) {
                    setTimeout(() => {
                        window.StickyEnhancedMovement.refresh();
                    }, 200);
                }
            }
        }, 100);
    }
    
    /**
     * 기존 함수들 대체
     */
    function replaceExistingFunctions() {
        // 원본 함수 백업
        window._originalOpenStickyMemo = window.openStickyMemo;
        window._originalCreateStickyMemo = window.createStickyMemo;
        
        // 통합 함수로 대체
        window.openStickyMemo = unifiedOpenStickyMemo;
        
        window.createStickyMemo = function() {
            console.log('🔄 createStickyMemo를 통합 버전으로 리다이렉트');
            return createUnifiedStickyMemo();
        };
        
        window.closeStickyMemo = closeStickyMemo;
        
        console.log('🔄 기존 함수들을 통합 버전으로 대체 완료');
    }
    
    /**
     * 스타일 추가
     */
    function addDeduplicationStyles() {
        if (document.getElementById('sticky-deduplication-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-deduplication-styles';
        style.textContent = `
            /* 스티커 메모 중복 방지 스타일 */
            .sticky-memo {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .sticky-memo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 15px 15px 0 0;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .sticky-memo-title {
                font-weight: 600;
                font-size: 16px;
                color: #333;
            }
            
            .sticky-memo-controls {
                display: flex;
                gap: 8px;
            }
            
            .control-btn {
                width: 24px;
                height: 24px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                background: rgba(255, 255, 255, 0.8);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .control-btn:hover {
                background: rgba(255, 255, 255, 1);
                transform: scale(1.1);
            }
            
            .sticky-memo-content {
                padding: 16px;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .sticky-memo-toolbar {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .toolbar-btn {
                padding: 6px 12px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                background: rgba(255, 255, 255, 0.8);
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .toolbar-btn:hover {
                background: rgba(255, 255, 255, 1);
                transform: translateY(-1px);
            }
            
            .sticky-memo-list {
                flex: 1;
                min-height: 300px;
            }
            
            .sticky-memo-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .memo-text {
                flex: 1;
                min-height: 20px;
                outline: none;
                font-size: 14px;
                line-height: 1.4;
                color: #333;
            }
            
            .delete-memo-btn {
                width: 20px;
                height: 20px;
                border: 1px solid #ff4757;
                background: rgba(255, 71, 87, 0.1);
                color: #ff4757;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .delete-memo-btn:hover {
                background: #ff4757;
                color: white;
            }
            
            .empty-message {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px 20px;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 중복 방지 스타일 추가 완료');
    }
    
    /**
     * 초기화
     */
    function init() {
        console.log('🔧 스티커 메모 중복 방지 초기화');
        
        // 스타일 추가
        addDeduplicationStyles();
        
        // 기존 함수 대체
        replaceExistingFunctions();
        
        // 기존 중복 메모 정리
        setTimeout(removeAllExistingStickyMemos, 500);
        
        console.log('✅ 스티커 메모 중복 방지 초기화 완료');
    }
    
    /**
     * 디버그 함수
     */
    window.debugStickyDeduplication = function() {
        console.group('🔧 스티커 메모 중복 방지 디버그');
        console.log('상태:', stickyState);
        console.log('현재 스티커 메모 개수:', document.querySelectorAll('#stickyMemo, [id*="sticky"]').length);
        console.log('활성화 플래그:', window._stickyDeduplicationActive);
        console.groupEnd();
    };
    
    /**
     * 강제 정리 함수
     */
    window.cleanupStickyMemos = function() {
        console.log('🧹 스티커 메모 강제 정리 실행');
        removeAllExistingStickyMemos();
        stickyState.isOpen = false;
        stickyState.currentElement = null;
        stickyState.isCreating = false;
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    console.log('🔧 스티커 메모 중복 방지 시스템 준비 완료');
    console.log('🛠️ 디버그: debugStickyDeduplication(), cleanupStickyMemos()');
    
})();