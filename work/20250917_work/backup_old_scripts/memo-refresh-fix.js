// 메모 삭제 후 리스트 새로고침 문제 해결
(function() {
    'use strict';

    console.log('🔄 메모 리스트 새로고침 수정 스크립트 로드됨');

    // 메모 데이터 상태 추적
    let memoDataState = {
        lastMemoCount: 0,
        lastUpdate: Date.now(),
        deletedMemoId: null
    };

    // 안전한 메모 데이터 로딩 함수
    function loadMemoDataSafely() {
        try {
            // localStorage에서 최신 데이터 로드
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                const memos = JSON.parse(stored);
                
                // 전역 변수 업데이트
                window.memos = memos;
                window.allMemos = memos;
                
                console.log('📊 메모 데이터 로드 완료:', memos.length, '개');
                return memos;
            } else {
                console.warn('⚠️ localStorage에 메모 데이터가 없습니다.');
                window.memos = [];
                return [];
            }
        } catch (error) {
            console.error('❌ 메모 데이터 로드 실패:', error);
            window.memos = window.memos || [];
            return window.memos;
        }
    }

    // 개선된 deleteMemo 함수
    function createEnhancedDeleteMemo() {
        const originalDeleteMemo = window.deleteMemo;
        
        window.deleteMemo = function(id) {
            console.log('🗑️ 메모 삭제 시작, ID:', id);
            
            // 최신 메모 데이터 로드
            let memos = loadMemoDataSafely();
            const beforeCount = memos.length;
            
            // 삭제할 메모 찾기
            const memoToDelete = memos.find(m => m.id == id);
            if (!memoToDelete) {
                console.warn('⚠️ 삭제할 메모를 찾을 수 없습니다. ID:', id);
                console.log('사용 가능한 메모 ID들:', memos.map(m => m.id));
                return;
            }
            
            console.log('📝 삭제할 메모:', memoToDelete.title);
            
            // 메모 삭제 (ID 타입 안전하게 비교)
            const filteredMemos = memos.filter(m => m.id != id);
            const afterCount = filteredMemos.length;
            
            if (beforeCount === afterCount) {
                console.error('❌ 메모가 삭제되지 않았습니다!');
                return;
            }
            
            // 전역 변수 업데이트
            window.memos = filteredMemos;
            window.allMemos = filteredMemos;
            
            // localStorage 업데이트
            try {
                localStorage.setItem('calendarMemos', JSON.stringify(filteredMemos));
                console.log('✅ localStorage 업데이트 완료');
            } catch (error) {
                console.error('❌ localStorage 업데이트 실패:', error);
            }
            
            // 상태 업데이트
            memoDataState.lastMemoCount = afterCount;
            memoDataState.lastUpdate = Date.now();
            memoDataState.deletedMemoId = id;
            
            console.log('✅ 메모 삭제 완료:', beforeCount, '→', afterCount);
            
            // UI 업데이트 (지연 실행으로 안정성 보장)
            setTimeout(() => {
                updateAllMemoLists(id);
            }, 100);
        };

        console.log('✅ 향상된 deleteMemo 함수로 교체 완료');
    }

    // 모든 메모 리스트 업데이트 함수
    function updateAllMemoLists(deletedId = null) {
        console.log('🔄 모든 메모 리스트 업데이트 시작');
        
        // 최신 메모 데이터 로드
        const memos = loadMemoDataSafely();
        
        // 각 리스트별로 안전하게 업데이트
        updateMemoList(memos, deletedId);
        updateStickyMemoList(memos, deletedId);
        updateDateMemoList(memos, deletedId);
        
        // 달력 업데이트
        if (window.updateCalendarDisplay) {
            try {
                window.updateCalendarDisplay();
            } catch (error) {
                console.error('❌ 달력 업데이트 오류:', error);
            }
        }
        
        console.log('✅ 모든 메모 리스트 업데이트 완료');
    }

    // 일반 메모 리스트 업데이트
    function updateMemoList(memos, deletedId) {
        const memoList = document.getElementById('memoList');
        if (!memoList) {
            console.warn('⚠️ memoList 요소를 찾을 수 없습니다.');
            return;
        }

        console.log('📋 일반 메모 리스트 업데이트:', memos.length, '개');

        // localStorage에서도 확인하여 실제로 빈지 체크
        let actualMemos = memos;
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                actualMemos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('localStorage 확인 실패:', error);
        }

        if (actualMemos.length === 0) {
            memoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다</div>';
            return;
        } else if (memos.length === 0 && actualMemos.length > 0) {
            console.log('⚠️ window.memos는 비어있지만 localStorage에는 메모가 있음 - 동기화 시도');
            window.memos = actualMemos;
            memos = actualMemos;
        }

        const isMemosUnlocked = window.isMemosUnlocked || false;
        
        try {
            const memoHTML = memos.map(memo => {
                if (!memo || !memo.id) return '';
                
                return `
                    <div class="memo-item ${isMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                        <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                        <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                        <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                        <div class="memo-item-preview">클릭하여 보기</div>
                        <button class="memo-item-delete ${isMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                    </div>
                `;
            }).filter(html => html).join('');
            
            memoList.innerHTML = memoHTML;
            console.log('✅ 일반 메모 리스트 HTML 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 일반 메모 리스트 업데이트 오류:', error);
            memoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
        }
    }

    // 스티커 메모 리스트 업데이트
    function updateStickyMemoList(memos, deletedId) {
        const stickyMemoList = document.getElementById('stickyMemoList');
        if (!stickyMemoList) {
            console.warn('⚠️ stickyMemoList 요소를 찾을 수 없습니다.');
            return;
        }

        console.log('📌 스티커 메모 리스트 업데이트:', memos.length, '개');

        // localStorage에서도 확인하여 실제로 빈지 체크
        let actualMemos = memos;
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                actualMemos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('localStorage 확인 실패:', error);
        }

        if (actualMemos.length === 0) {
            stickyMemoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다</div>';
            return;
        } else if (memos.length === 0 && actualMemos.length > 0) {
            console.log('⚠️ window.memos는 비어있지만 localStorage에는 메모가 있음 - 동기화 시도');
            memos = actualMemos;
        }

        const isMemosUnlocked = window.isMemosUnlocked || false;
        
        try {
            const memoHTML = memos.map(memo => {
                if (!memo || !memo.id) return '';
                
                return `
                    <div class="memo-item ${isMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                        <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                        <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                        <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                        <div class="memo-item-preview">클릭하여 보기</div>
                        <button class="memo-item-delete ${isMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                    </div>
                `;
            }).filter(html => html).join('');
            
            stickyMemoList.innerHTML = memoHTML;
            console.log('✅ 스티커 메모 리스트 HTML 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 스티커 메모 리스트 업데이트 오류:', error);
            stickyMemoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
        }
    }

    // 날짜별 메모 리스트 업데이트
    function updateDateMemoList(allMemos, deletedId) {
        const dateMemoList = document.getElementById('dateMemoList');
        if (!dateMemoList) {
            console.warn('⚠️ dateMemoList 요소를 찾을 수 없습니다.');
            return;
        }

        const selectedDate = window.selectedDate;
        if (!selectedDate) {
            console.warn('⚠️ 선택된 날짜가 없습니다.');
            return;
        }

        // localStorage에서도 확인하여 실제로 빈지 체크
        let actualMemos = allMemos;
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                actualMemos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('localStorage 확인 실패:', error);
        }

        // 선택된 날짜의 메모들만 필터링
        const dateMemos = actualMemos.filter(memo => memo.date === selectedDate);
        
        console.log('📅 날짜별 메모 리스트 업데이트:', dateMemos.length, '개 (날짜:', selectedDate, ')');

        if (dateMemos.length === 0) {
            dateMemoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">이 날짜에 저장된 메모가 없습니다</div>';
            return;
        }

        const isDateMemosUnlocked = window.isDateMemosUnlocked || false;
        
        try {
            const memoHTML = dateMemos.map(memo => {
                if (!memo || !memo.id) return '';
                
                return `
                    <div class="memo-item ${isDateMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                        <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                        <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                        <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                        <div class="memo-item-preview">클릭하여 보기</div>
                        <button class="memo-item-delete ${isDateMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                    </div>
                `;
            }).filter(html => html).join('');
            
            dateMemoList.innerHTML = memoHTML;
            console.log('✅ 날짜별 메모 리스트 HTML 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 날짜별 메모 리스트 업데이트 오류:', error);
            dateMemoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
        }
    }

    // 기존 리스트 업데이트 함수들을 안전한 버전으로 교체
    function replaceExistingUpdateFunctions() {
        // loadMemos 함수 교체
        window.loadMemos = function() {
            console.log('📋 loadMemos 호출됨 (수정된 버전)');
            const memos = loadMemoDataSafely();
            updateMemoList(memos);
        };

        // displayStickyMemos 함수 교체
        window.displayStickyMemos = function() {
            console.log('📌 displayStickyMemos 호출됨 (수정된 버전)');
            const memos = loadMemoDataSafely();
            updateStickyMemoList(memos);
        };

        // displayDateMemos 함수 교체 (기존 로직 유지하면서 개선)
        const originalDisplayDateMemos = window.displayDateMemos;
        window.displayDateMemos = function() {
            console.log('📅 displayDateMemos 호출됨 (수정된 버전)');
            const memos = loadMemoDataSafely();
            updateDateMemoList(memos);
        };

        console.log('✅ 기존 리스트 업데이트 함수들 교체 완료');
    }

    // 시각적 업데이트 애니메이션
    function addVisualUpdateEffects() {
        // CSS 애니메이션 추가
        if (!document.querySelector('#memo-refresh-styles')) {
            const styles = document.createElement('style');
            styles.id = 'memo-refresh-styles';
            styles.textContent = `
                .memo-item {
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                
                .memo-item.deleting {
                    opacity: 0.5;
                    transform: scale(0.95);
                }
                
                .memo-item.deleted {
                    opacity: 0;
                    transform: scale(0.8);
                    pointer-events: none;
                }
                
                .memo-list-updating {
                    opacity: 0.8;
                    pointer-events: none;
                }
                
                .memo-list-updated {
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0.5; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // 디버깅 도구
    function addRefreshDebugTools() {
        window.debugMemoRefresh = function() {
            console.log('=== 🔄 메모 새로고침 디버깅 ===');
            
            const memos = loadMemoDataSafely();
            console.log('현재 메모 개수:', memos.length);
            
            const lists = [
                { id: 'memoList', name: '일반 메모' },
                { id: 'stickyMemoList', name: '스티커 메모' },
                { id: 'dateMemoList', name: '날짜별 메모' }
            ];
            
            lists.forEach(({ id, name }) => {
                const element = document.getElementById(id);
                if (element) {
                    const itemCount = element.querySelectorAll('.memo-item').length;
                    console.log(`${name} 리스트: ${itemCount}개 표시됨`);
                } else {
                    console.log(`${name} 리스트: 요소 없음`);
                }
            });
            
            console.log('상태:', memoDataState);
            
            return { memos, memoDataState };
        };

        window.forceRefreshAllLists = function() {
            console.log('🔄 강제 모든 리스트 새로고침');
            updateAllMemoLists();
        };

        console.log('✅ 메모 새로고침 디버깅 도구 추가');
    }

    // 초기화
    function initialize() {
        console.log('🔄 메모 리스트 새로고침 수정 시스템 초기화');
        
        // 메모 데이터 로드
        loadMemoDataSafely();
        
        // 향상된 삭제 함수로 교체
        createEnhancedDeleteMemo();
        
        // 기존 업데이트 함수들 교체
        replaceExistingUpdateFunctions();
        
        // 시각적 효과 추가
        addVisualUpdateEffects();
        
        // 디버깅 도구 추가
        addRefreshDebugTools();
        
        console.log('✅ 메모 리스트 새로고침 수정 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugMemoRefresh(), forceRefreshAllLists()');
    }

    // DOM 로드 완료 후 초기화 (한 번만)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM이 이미 로드된 경우 한 번만 초기화
        initialize();
    }

})();