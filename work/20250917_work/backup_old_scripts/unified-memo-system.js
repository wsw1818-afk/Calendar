// 통합 메모 관리 시스템 - 모든 메모 관련 문제 해결
(function() {
    'use strict';

    console.log('🎯 통합 메모 관리 시스템 로드됨');

    // ===== 전역 상태 관리 =====
    const MemoSystem = {
        data: [],  // 실제 메모 데이터 (단일 소스)
        locks: {
            memos: true,      // 기본 잠금 상태
            dateMemos: true,  // 기본 잠금 상태
            stickyMemos: true // 기본 잠금 상태
        },
        selectedDate: null,
        currentDetailId: null,
        initialized: false
    };

    // ===== 데이터 관리 함수 =====
    
    // localStorage에서 메모 로드 (단일 소스)
    function loadMemosFromStorage() {
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                MemoSystem.data = JSON.parse(stored);
                console.log(`✅ 메모 로드 완료: ${MemoSystem.data.length}개`);
            } else {
                MemoSystem.data = [];
                console.log('📭 저장된 메모가 없습니다');
            }
        } catch (error) {
            console.error('❌ 메모 로드 실패:', error);
            MemoSystem.data = [];
        }
        
        // 전역 변수 동기화
        window.memos = MemoSystem.data;
        window.allMemos = MemoSystem.data;
        window.stickyMemos = MemoSystem.data;
        
        return MemoSystem.data;
    }

    // localStorage에 메모 저장
    function saveMemosToStorage() {
        try {
            // HTML에서 정의된 safelyStoreData 함수 사용
            if (typeof window.safelyStoreData === 'function') {
                const saveResult = window.safelyStoreData('calendarMemos', MemoSystem.data);
                if (!saveResult.success) {
                    console.error('❌ 메모 저장 실패:', saveResult.message);
                    alert('메모 저장 실패: ' + saveResult.message);
                    return false;
                }
            } else {
                // 폴백: 기본 localStorage 사용
                localStorage.setItem('calendarMemos', JSON.stringify(MemoSystem.data));
            }
            
            // 전역 변수 동기화
            window.memos = MemoSystem.data;
            window.allMemos = MemoSystem.data;
            window.stickyMemos = MemoSystem.data;
            
            console.log(`✅ 메모 저장 완료: ${MemoSystem.data.length}개`);
            return true;
        } catch (error) {
            console.error('❌ 메모 저장 실패:', error);
            alert('메모 저장 중 오류 발생: ' + error.message);
            return false;
        }
    }

    // ===== 메모 CRUD 함수 =====
    
    // 메모 추가
    function addMemo(title, content, date = null) {
        const now = new Date();
        const memo = {
            id: Date.now(),
            title: title,
            content: content,
            date: date || now.toISOString().split('T')[0], // YYYY-MM-DD 형식
            timestamp: now.toISOString(),
            // 상세 시간 정보 추가
            createdAt: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                date: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds(),
                displayTime: now.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }),
                shortTime: now.toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
            }
        };
        
        MemoSystem.data.unshift(memo);
        saveMemosToStorage();
        refreshAllUI();
        
        console.log('📝 메모 추가됨 (상세 시간 포함):', memo);
        return memo;
    }

    // 메모 삭제 (확인창 없이 즉시, 중복 방지)
    const deletingMemos = new Set();
    function deleteMemoById(id) {
        // 이미 삭제 중인 메모면 무시
        if (deletingMemos.has(id)) {
            console.warn(`⚠️ 이미 삭제 처리 중인 메모: ${id}`);
            return false;
        }
        
        // 잠금 상태 확인
        if (MemoSystem.locks.dateMemos) {
            console.warn(`🔒 날짜별 메모가 잠겨있어 삭제가 차단됨: ${id}`);
            alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
            return false;
        }
        
        // 삭제 중 표시
        deletingMemos.add(id);
        
        const beforeCount = MemoSystem.data.length;
        MemoSystem.data = MemoSystem.data.filter(m => m.id != id);
        const afterCount = MemoSystem.data.length;
        
        if (beforeCount === afterCount) {
            console.warn(`⚠️ 삭제할 메모를 찾을 수 없음: ${id}`);
            deletingMemos.delete(id);
            return false;
        }
        
        saveMemosToStorage();
        
        console.log(`✅ 메모 삭제됨: ${id} (${beforeCount} → ${afterCount})`);
        
        // UI 업데이트 (약간의 지연으로 안정화)
        setTimeout(() => {
            refreshAllUI();
            deletingMemos.delete(id);
            
            // 모든 processing 플래그 정리 (삭제 후 혹시 남아있을 수 있는 플래그들)
            const allMemoItems = document.querySelectorAll('.memo-item');
            allMemoItems.forEach(item => {
                if (item.dataset.processing === 'true') {
                    item.dataset.processing = 'false';
                }
            });
            
            // 모든 삭제 버튼 processing 플래그도 정리
            const allDeleteBtns = document.querySelectorAll('.memo-item-delete');
            allDeleteBtns.forEach(btn => {
                if (btn.dataset.processing === 'true') {
                    btn.dataset.processing = 'false';
                }
            });
            
            console.log(`🧹 메모 삭제 완료 후 모든 processing 플래그 정리됨`);
        }, 100); // 약간 더 긴 지연으로 안정성 확보
        
        return true;
    }

    // 메모 찾기
    function findMemoById(id) {
        return MemoSystem.data.find(m => m.id == id);
    }

    // ===== UI 업데이트 함수 =====
    
    // 모든 UI 새로고침 (중복 방지)
    let refreshInProgress = false;
    function refreshAllUI() {
        // 이미 새로고침 중이면 건너뛰기
        if (refreshInProgress) {
            console.log('⚠️ 이미 새로고침 중 - 건너뛰기');
            return;
        }
        
        refreshInProgress = true;
        console.log('🔄 전체 UI 새로고침 시작');
        
        try {
            // 먼저 데이터 재로드
            loadMemosFromStorage();
            
            // 각 리스트 업데이트 (스티키 메모는 HTML에서 처리)
            refreshMemoList();
            // refreshStickyMemoList(); // HTML loadStickyMemos()가 처리
            refreshDateMemoList();
            
            // 달력 업데이트
            if (window.updateCalendarDisplay) {
                try { 
                    window.updateCalendarDisplay(); 
                } catch (e) {
                    console.error('달력 업데이트 오류:', e);
                }
            }
            
            console.log('✅ 전체 UI 새로고침 완료');
        } catch (error) {
            console.error('❌ UI 새로고침 오류:', error);
        } finally {
            // 새로고침 완료 후 플래그 해제 (약간의 지연)
            setTimeout(() => {
                refreshInProgress = false;
            }, 100);
        }
    }

    // 일반 메모 리스트 새로고침 (memoList 요소가 없으므로 빈 함수)
    function refreshMemoList() {
        console.log('📝 일반 메모 리스트: HTML에 memoList 요소가 없음 - 스티키 메모로 통합됨');
        // HTML에 memoList 요소가 없으므로 스티키 메모 리스트로 대체
        // 실제 동작은 refreshStickyMemoList()에서 모든 메모를 처리
    }

    // 스티커 메모 리스트 새로고침 (HTML 함수 사용으로 비활성화)
    function refreshStickyMemoList() {
        console.log('📝 스티키 메모 리스트: HTML loadStickyMemos() 함수에서 처리 - unified 시스템 건너뜀');
        // HTML의 loadStickyMemos() 함수가 처리하므로 여기서는 아무것도 하지 않음
        // 이렇게 해서 메모장과 메모 리스트 충돌 방지
    }

    // 날짜별 메모 리스트 새로고침
    function refreshDateMemoList() {
        const element = document.getElementById('dateMemoList');
        if (!element) return;
        
        // 모달이 열려있지 않으면 리스트를 업데이트하지 않음 (자동 열림 방지)
        const dateModal = document.getElementById('dateMemoModal');
        if (!dateModal || dateModal.style.display !== 'block') {
            console.log('📋 날짜별 메모 리스트: 모달이 닫혀있어 렌더링 생략');
            return;
        }
        
        if (!MemoSystem.selectedDate) {
            console.log('📋 날짜별 메모 리스트: 선택된 날짜가 없어 렌더링 생략');
            return;
        }
        
        // 데이터를 다시 로드하여 최신 상태 보장
        loadMemosFromStorage();
        const dateMemos = MemoSystem.data.filter(m => m.date === MemoSystem.selectedDate);
        
        console.log(`📋 날짜별 메모 필터링 결과: ${dateMemos.length}개 (전체: ${MemoSystem.data.length}개, 선택 날짜: ${MemoSystem.selectedDate})`);
        dateMemos.forEach((memo, index) => {
            console.log(`  ${index + 1}. ${memo.title} (${memo.date})`);
        });
        
        if (dateMemos.length === 0) {
            element.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">이 날짜에 저장된 메모가 없습니다</div>';
            console.log('📋 날짜별 메모 리스트: 메모가 없어 빈 상태 표시');
            return;
        }
        
        const isUnlocked = !MemoSystem.locks.dateMemos;
        console.log(`📋 날짜별 메모 리스트 렌더링 시작: 잠금상태=${MemoSystem.locks.dateMemos ? '잠김' : '해제'}, UI상태=${isUnlocked ? '해제' : '잠김'}`);
        element.innerHTML = dateMemos.map(memo => {
            // 리치 텍스트인 경우 HTML 태그 제거하여 순수 텍스트만 추출
            let displayContent = memo.content || '';
            if (memo.isRichText) {
                // HTML 태그 제거
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = displayContent;
                displayContent = tempDiv.textContent || tempDiv.innerText || '';
            }
            
            // 내용을 100자로 제한
            const truncatedContent = displayContent.substring(0, 100);
            const contentWithEllipsis = displayContent.length > 100 ? truncatedContent + '...' : truncatedContent;
            
            // 첨부파일 표시
            const attachmentIndicator = memo.attachments && memo.attachments.length > 0 
                ? `<div class="memo-attachment-indicator">📎 ${memo.attachments.length}</div>` 
                : '';
            
            // 시간 정보 생성
            const timeInfo = memo.createdAt ? memo.createdAt.shortTime : 
                            (memo.timestamp ? new Date(memo.timestamp).toLocaleString('ko-KR', {
                                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
                            }) : '시간 정보 없음');
                            
            return `
                <div class="memo-item ${isUnlocked ? 'unlocked' : ''}" data-memo-id="${memo.id}">
                    <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                    <div class="memo-item-content">${contentWithEllipsis}</div>
                    <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                    <div class="memo-item-time">⏰ ${timeInfo}</div>
                    ${attachmentIndicator}
                    <div class="memo-item-preview">클릭하여 보기</div>
                    ${isUnlocked ? `<button class="memo-item-edit visible" onclick="event.stopPropagation(); editDateMemo(${memo.id})" title="편집">✏️</button>` : ''}
                    ${isUnlocked ? `<button class="memo-item-delete visible" data-memo-id="${memo.id}" title="삭제">🗑️</button>` : ''}
                </div>
            `;
        }).join('');
        
        // 디버깅: 생성된 메모 아이템 개수 확인
        const memoItems = element.querySelectorAll('.memo-item');
        console.log(`📋 날짜별 메모 리스트 렌더링 완료: ${memoItems.length}개 메모, 잠금상태: ${MemoSystem.locks.dateMemos ? '잠김' : '해제'}`);
        
        // 이벤트 리스너 추가 (onclick 속성 대신)
        memoItems.forEach((item, index) => {
            const memoId = item.dataset.memoId;
            console.log(`  메모 ${index + 1}: data-memo-id="${memoId}"`);
            
            // 메모 클릭 이벤트 (이벤트 리스너 방식)
            item.addEventListener('click', function(e) {
                // 삭제 버튼 클릭이 아닌 경우에만 처리
                if (!e.target.closest('.memo-item-delete')) {
                    // 이벤트 완전 차단 (모달 외부 클릭 감지 방지)
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // 이미 처리 중이거나 같은 ID가 열려있으면 무시
                    if (window._openingMemoDetail || window.currentMemoId === parseInt(memoId)) {
                        console.log('⚠️ 메모 상세 중복 호출 방지:', memoId);
                        return;
                    }
                    
                    console.log('📋 메모 상세보기 이벤트 리스너 (완전 격리):', memoId);
                    
                    // HTML의 openMemoDetail 함수 직접 호출
                    if (typeof window.openMemoDetail === 'function') {
                        window.openMemoDetail(parseInt(memoId));
                    }
                }
            });
            
            // 삭제 버튼 이벤트 리스너 추가 (잠금 해제 시에만)
            const deleteButtons = item.querySelectorAll('.memo-item-delete');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const memoId = btn.dataset.memoId;
                    console.log('🗑️ 삭제 버튼 클릭:', memoId);
                    
                    if (confirm('정말 이 메모를 삭제하시겠습니까?')) {
                        deleteMemoById(parseInt(memoId));
                    }
                });
            });
        });
    }

    // ===== 이벤트 바인딩 =====
    
    function bindMemoListEvents(container) {
        // 이미 바인딩된 경우 중복 방지
        if (container.dataset.eventsBinding === 'true') {
            return;
        }
        
        // 이벤트 위임 사용 (중복 방지)
        container.addEventListener('click', function(e) {
            const memoItem = e.target.closest('.memo-item[data-clickable="true"]');
            const deleteBtn = e.target.closest('.memo-item-delete[data-action="delete"]');
            
            if (deleteBtn) {
                // 삭제 버튼 클릭 처리
                e.stopPropagation();
                e.preventDefault();
                
                const memoId = deleteBtn.dataset.memoId;
                if (!memoId) return;
                
                // 중복 클릭 방지
                if (deleteBtn.dataset.processing === 'true') {
                    console.log(`⚠️ 이미 삭제 처리 중: ${memoId}`);
                    return;
                }
                deleteBtn.dataset.processing = 'true';
                
                // 잠금 상태 확인
                const listId = container.id;
                let isLocked = true;
                
                if (listId === 'memoList') {
                    isLocked = MemoSystem.locks.memos;
                } else if (listId === 'stickyMemoList') {
                    isLocked = MemoSystem.locks.stickyMemos;
                } else if (listId === 'dateMemoList') {
                    isLocked = MemoSystem.locks.dateMemos;
                }
                
                if (isLocked) {
                    alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                    deleteBtn.dataset.processing = 'false';
                    return;
                }
                
                console.log(`🗑️ 메모 삭제 시도: ${memoId} (${listId})`);
                
                // 삭제 실행
                const success = deleteMemoById(memoId);
                
                // 처리 완료 (약간의 지연 후)
                setTimeout(() => {
                    if (deleteBtn && deleteBtn.parentElement) {
                        deleteBtn.dataset.processing = 'false';
                    }
                }, 100);
                
            } else if (memoItem) {
                // 메모 아이템 클릭 처리
                e.preventDefault();
                e.stopPropagation(); // 이벤트 버블링 방지
                
                const memoId = memoItem.dataset.memoId;
                if (memoId && memoItem.dataset.processing !== 'true') {
                    memoItem.dataset.processing = 'true';
                    
                    console.log(`📋 메모 상세보기 요청: ${memoId}`);
                    showMemoDetail(memoId);
                    
                    setTimeout(() => {
                        if (memoItem && memoItem.parentElement) {
                            memoItem.dataset.processing = 'false';
                        }
                    }, 350);
                } else {
                    console.log(`⚠️ 메모 클릭 무시: ${memoId} (processing: ${memoItem.dataset.processing})`);
                }
            }
        });
        
        // 바인딩 완료 표시
        container.dataset.eventsBinding = 'true';
        console.log(`✅ ${container.id} 이벤트 바인딩 완료`);
    }

    // ===== 메모 상세보기 =====
    
    let showingDetail = false; // 중복 호출 방지
    
    function showMemoDetail(id) {
        console.log(`🔍 메모 상세보기 시도: ${id} (현재: ${MemoSystem.currentDetailId}, showingDetail: ${showingDetail})`);
        
        // 이미 상세보기가 진행 중이면 무시
        if (showingDetail) {
            console.log('⚠️ 메모 상세보기 이미 진행 중, 무시:', id);
            return;
        }
        
        // 현재 표시 중인 메모와 같으면 새로고침만
        if (MemoSystem.currentDetailId === id) {
            console.log('🔄 동일한 메모 새로고침:', id);
            // 동일한 메모라도 새로고침 허용 (내용이 바뀔 수 있음)
        }
        
        showingDetail = true;
        
        const memo = findMemoById(id);
        if (!memo) {
            console.error(`❌ 메모를 찾을 수 없음: ${id}`);
            alert('메모를 찾을 수 없습니다.');
            refreshAllUI(); // UI 정리
            showingDetail = false;
            return;
        }
        
        MemoSystem.currentDetailId = id;
        
        // 상세 모달에 내용 채우기
        const titleEl = document.getElementById('memoDetailTitle');
        const dateEl = document.getElementById('memoDetailDate');
        const bodyEl = document.getElementById('memoDetailBody');
        
        if (titleEl) titleEl.textContent = memo.title;
        if (dateEl) dateEl.textContent = `📅 ${memo.date}`;
        if (bodyEl) bodyEl.textContent = memo.content;
        
        // 모달 표시
        const modal = document.getElementById('memoDetailModal');
        if (modal) {
            modal.style.display = 'block';
        }
        
        console.log('📋 메모 상세보기:', memo.title);
        
        // 처리 완료 플래그 해제 (약간의 지연으로)
        setTimeout(() => {
            showingDetail = false;
        }, 300);
    }

    // ===== 잠금 시스템 =====
    
    function toggleLock(type) {
        const startTime = Date.now();
        console.log(`🎯 Unified toggleLock 함수 호출됨: ${type}`);
        
        // 진단 시스템에 상호작용 추적
        if (window.DiagnosticSystem) {
            window.DiagnosticSystem.trackInteraction(`TOGGLE_LOCK_${type.toUpperCase()}`, `#dateMemoLockToggle`, true, 0);
        }
        
        MemoSystem.locks[type] = !MemoSystem.locks[type];
        
        // HTML 전역 변수와 동기화
        if (type === 'dateMemos') {
            window.isDateMemosUnlocked = !MemoSystem.locks[type];
            console.log('🔄 HTML 전역 변수 동기화:', window.isDateMemosUnlocked ? '해제' : '잠김');
        } else if (type === 'memos') {
            window.isMemosUnlocked = !MemoSystem.locks[type];
            console.log('🔄 HTML 전역 변수 동기화:', window.isMemosUnlocked ? '해제' : '잠김');
        }
        
        // UI 업데이트
        let toggleEl = null;
        if (type === 'memos') {
            toggleEl = document.getElementById('memoLockToggle');
        } else if (type === 'stickyMemos') {
            toggleEl = document.getElementById('stickyMemoLockToggle');
        } else if (type === 'dateMemos') {
            toggleEl = document.getElementById('dateMemoLockToggle');
        }
        
        if (toggleEl) {
            const icon = toggleEl.querySelector('.lock-icon');
            const text = toggleEl.querySelector('.lock-text');
            
            console.log('🔍 요소 찾기 결과:', {toggle: !!toggleEl, icon: !!icon, text: !!text});
            
            if (MemoSystem.locks[type]) {
                toggleEl.classList.remove('unlocked');
                if (icon) icon.textContent = '🔒';
                if (text) text.textContent = '잠금';
            } else {
                toggleEl.classList.add('unlocked');
                if (icon) icon.textContent = '🔓';
                if (text) text.textContent = '해제됨';
            }
        } else {
            console.warn(`⚠️ ${type} 잠금 토글 요소를 찾을 수 없습니다`);
        }
        
        // 날짜별 메모의 경우 HTML의 displayDateMemos 호출
        if (type === 'dateMemos') {
            try {
                if (window.displayDateMemos) {
                    console.log('🔄 displayDateMemos 호출');
                    window.displayDateMemos();
                } else {
                    console.warn('⚠️ displayDateMemos 함수를 찾을 수 없습니다');
                }
            } catch (error) {
                console.warn('⚠️ displayDateMemos 호출 중 오류:', error);
            }
        }
        
        // 리스트 새로고침
        refreshAllUI();
        
        // 성능 측정
        const duration = Date.now() - startTime;
        if (window.DiagnosticSystem) {
            window.DiagnosticSystem.measurePerformance(`toggleLock_${type}`, startTime);
        }
        
        console.log(`✅ ${type} 잠금 상태 토글 완료: ${MemoSystem.locks[type] ? '잠김' : '해제'} (${duration}ms)`);
        
        // 잠금 상태 변경 후 자동 검증
        setTimeout(() => {
            const toggle = document.getElementById('dateMemoLockToggle');
            const actualState = toggle ? !toggle.classList.contains('unlocked') : null;
            const expectedState = MemoSystem.locks[type];
            
            if (actualState !== expectedState && actualState !== null) {
                console.error(`🚨 잠금 상태 불일치 감지!`, {
                    type,
                    expected: expectedState ? '잠김' : '해제',
                    actual: actualState ? '잠김' : '해제',
                    toggleElement: !!toggle
                });
                
                if (window.DiagnosticSystem) {
                    window.DiagnosticSystem.detectIssue('LOCK_STATE_MISMATCH', `${type} 잠금 상태 UI와 로직 불일치`, {
                        expected: expectedState,
                        actual: actualState,
                        severity: 'error'
                    });
                }
            } else {
                console.log(`✅ ${type} 잠금 상태 검증 통과: ${expectedState ? '잠김' : '해제'}`);
            }
        }, 100);
    }

    // ===== 기존 함수 대체 =====
    
    function replaceGlobalFunctions() {
        // 메모 로드 함수들 (스티키 메모는 HTML 함수 사용)
        window.loadMemos = refreshMemoList;
        // window.displayStickyMemos는 HTML loadStickyMemos로 처리
        window.displayDateMemos = refreshDateMemoList;
        
        // 메모 삭제 함수
        window.deleteMemo = deleteMemoById;
        window.deleteMemoFromList = deleteMemoById;
        
        // 메모 상세보기는 HTML 함수 사용 (덮어쓰지 않음)
        // HTML의 openMemoDetail 함수를 그대로 사용
        // 전역 접근을 위해 MemoSystem 데이터를 노출
        window.MemoSystem = MemoSystem;
        
        // 메모 상세보기 관련 함수들은 HTML에서 처리 (덮어쓰지 않음)
        // HTML의 closeMemoDetail, editMemo, deleteMemoFromDetail 함수들을 그대로 사용
        
        // 메모 저장 (일반 메모)
        window.saveMemo = function() {
            const title = document.getElementById('memoTitleInput')?.value?.trim();
            const content = document.getElementById('memoContentInput')?.value?.trim();
            
            if (!title) {
                alert('메모 제목을 입력해주세요!');
                return;
            }
            
            const memo = addMemo(title, content);
            
            // 입력창 초기화
            const titleInput = document.getElementById('memoTitleInput');
            const contentInput = document.getElementById('memoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            console.log('💾 일반 메모 저장:', memo.title);
        };
        
        // 스티커 메모 저장 (통합 에디터 지원)
        window.saveStickyMemo = function() {
            const richEditor = document.getElementById('stickyMemoRichEditor');
            const textEditor = document.getElementById('stickyMemoUnifiedInput');
            
            let content;
            let isRichText = false;
            
            // 현재 활성 에디터에 따라 내용 가져오기
            if (richEditor && richEditor.style.display !== 'none') {
                // 리치 에디터가 활성
                const richContent = richEditor.innerHTML.trim();
                if (!richContent || richContent === '<br>' || richContent === '<div><br></div>') {
                    alert('메모 내용을 입력해주세요!');
                    return;
                }
                content = richContent;
                isRichText = true;
            } else if (textEditor) {
                // 텍스트 에디터가 활성
                const unifiedText = textEditor.value.trim();
                if (!unifiedText) {
                    alert('메모 내용을 입력해주세요!');
                    return;
                }
                content = unifiedText;
                isRichText = false;
            } else {
                // 기존 방식 호환성 지원 (구형 입력 필드)
                const title = document.getElementById('stickyMemoTitleInput')?.value?.trim();
                const oldContent = document.getElementById('stickyMemoContentInput')?.value?.trim();
                
                if (!title) {
                    alert('메모 제목을 입력해주세요!');
                    return;
                }
                
                const memo = addMemo(title, oldContent);
                
                // 입력창 초기화
                const titleInput = document.getElementById('stickyMemoTitleInput');
                const contentInput = document.getElementById('stickyMemoContentInput');
                if (titleInput) titleInput.value = '';
                if (contentInput) contentInput.value = '';
                
                console.log('💾 스티커 메모 저장 (기존 방식):', memo.title);
                return;
            }
            
            // 제목과 내용 분리 (새로운 통합 방식)
            let title, mainContent;
            if (isRichText) {
                const textContent = richEditor.textContent || richEditor.innerText || '';
                const lines = textContent.split('\n');
                title = lines[0].trim() || '제목 없음';
                mainContent = content; // HTML 형태로 저장
            } else {
                const lines = content.split('\n');
                title = lines[0].trim() || '제목 없음';
                mainContent = lines.slice(1).join('\n').trim();
            }
            
            const memo = {
                id: Date.now(),
                title: title,
                content: mainContent,
                isRichText: isRichText,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
                timestamp: new Date().toISOString()
            };
            
            // 메모 저장
            MemoSystem.data.unshift(memo);
            saveMemosToStorage();
            
            // 입력창 초기화
            if (richEditor) richEditor.innerHTML = '';
            if (textEditor) textEditor.value = '';
            
            // UI 새로고침
            refreshAllUI();
            
            console.log('💾 스티커 메모 저장 (통합 방식):', memo.title);
        };
        
        // 날짜별 메모 저장 - HTML 함수 우선 사용 (첨부파일 처리 때문에)
        // HTML의 saveDateMemo 함수가 있으면 덮어쓰지 않음
        if (typeof window.saveDateMemo !== 'function') {
            window.saveDateMemo = function() {
                if (!MemoSystem.selectedDate) {
                    alert('날짜가 선택되지 않았습니다!');
                    return;
                }
                
                const title = document.getElementById('dateMemoTitleInput')?.value?.trim();
                const content = document.getElementById('dateMemoContentInput')?.value?.trim();
                
                if (!title) {
                    alert('메모 제목을 입력해주세요!');
                    return;
                }
                
                // 첨부파일 포함하여 메모 생성 (간단한 버전)
                const memo = {
                    id: Date.now(),
                    title: title,
                    content: content,
                    date: MemoSystem.selectedDate,
                    attachments: window.dateMemoAttachments ? [...window.dateMemoAttachments] : [],
                    timestamp: new Date().toISOString()
                };
                
                MemoSystem.data.unshift(memo);
                saveMemosToStorage();
                
                // 입력창 초기화
                const titleInput = document.getElementById('dateMemoTitleInput');
                const contentInput = document.getElementById('dateMemoContentInput');
                if (titleInput) titleInput.value = '';
                if (contentInput) contentInput.value = '';
                
                // 첨부파일 초기화
                if (window.clearAttachments && window.dateMemoAttachments) {
                    window.clearAttachments('dateMemoAttachmentList', window.dateMemoAttachments);
                }
                
                // UI 새로고침
                refreshAllUI();
                
                console.log('💾 unified 백업 날짜별 메모 저장:', memo.title, '(날짜:', MemoSystem.selectedDate, ')');
            };
        } else {
            console.log('✅ HTML saveDateMemo 함수 유지 - unified 시스템은 백업만 제공');
        }
        
        // 날짜별 메모 모달 열기 - HTML 함수와 충돌 방지
        const originalOpenDateMemoModal = window.openDateMemoModal;
        
        if (typeof originalOpenDateMemoModal === 'function') {
            // HTML 함수가 있으면 그대로 사용하고 후처리만 추가
            window.openDateMemoModal = function(year, month, date, preventAutoOpen = false) {
                // 자동 열림 방지 플래그가 설정된 경우 실행하지 않음
                if (preventAutoOpen) {
                    console.log('📅 자동 모달 열림 방지됨:', year, month, date);
                    return;
                }
                
                // 모달이 방금 닫힌 상태면 무시하되, 다른 날짜는 허용 (재열림 방지)
                const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                if (typeof window.modalJustClosed !== 'undefined' && window.modalJustClosed) {
                    // 같은 날짜만 차단하고, 다른 날짜는 허용
                    if (window.lastClosedModalDate === selectedDate) {
                        console.log('🔒 unified: 같은 날짜 모달 재열림 차단:', selectedDate);
                        return;
                    } else {
                        console.log('🔄 unified: 다른 날짜이므로 모달 열림 허용:', selectedDate);
                        window.modalJustClosed = false; // 다른 날짜면 차단 해제
                    }
                }
                
                // 이미 같은 날짜로 모달이 열려있으면 실행하지 않음
                const dateModal = document.getElementById('dateMemoModal');
                if (dateModal && dateModal.style.display === 'block' && MemoSystem.selectedDate === selectedDate) {
                    console.log('📅 이미 같은 날짜 모달이 열려있음:', selectedDate);
                    return;
                }
                
                // 초기화 중 자동 열림 방지 제거 - 사용자 클릭 허용
                // if (window._preventAutoOpenDateModal && !window._userClickOverride) {
                //     console.log('🚫 초기화 중 자동 열림 차단');
                //     return;
                // }
                
                // 원래 HTML 함수 실행 (HTML에서 이미 보호 함수 호출하므로 중복 호출 제거)
                originalOpenDateMemoModal(year, month, date);

                // show-modal 클래스 추가하여 조건부 CSS 적용
                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.classList.add('show-modal');

                    // 마우스 클릭 위치에 모달 배치
                    const modalContent = modal.querySelector('.memo-modal-content');
                    if (modalContent && window._lastClickPosition) {
                        const { x, y } = window._lastClickPosition;
                        const maxX = window.innerWidth - 400; // 모달 최소 폭
                        const maxY = window.innerHeight - 300; // 모달 최소 높이

                        modalContent.style.left = `${Math.min(x, maxX)}px`;
                        modalContent.style.top = `${Math.min(y, maxY)}px`;

                        console.log('📍 모달 위치 설정:', { x: Math.min(x, maxX), y: Math.min(y, maxY) });
                    } else {
                        // 기본 위치 (화면 중앙)
                        if (modalContent) {
                            modalContent.style.left = '50%';
                            modalContent.style.top = '50%';
                            modalContent.style.transform = 'translate(-50%, -50%)';
                        }
                    }
                }

                // unified 시스템 추가 처리
                MemoSystem.selectedDate = selectedDate;
                MemoSystem.locks.dateMemos = true;
                refreshDateMemoList();
                
                console.log('📅 HTML openDateMemoModal + unified 시스템 처리 완료:', selectedDate);
            };
        } else {
            // HTML 함수가 없는 경우에만 백업 함수 제공
            window.openDateMemoModal = function(year, month, date) {
                const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                MemoSystem.selectedDate = selectedDate;
                
                const modal = document.getElementById('dateMemoModal');
                if (modal) modal.style.display = 'block';
                
                MemoSystem.locks.dateMemos = true;
                refreshDateMemoList();
                
                console.log('📅 백업 openDateMemoModal 함수 실행:', selectedDate);
            };
        }
        
        // 날짜별 메모 모달 닫기 - HTML 함수를 덮어쓰지 않고 백업만 제공
        // HTML의 closeDateMemoModal 함수를 그대로 사용하되, 상태만 동기화
        const originalCloseDateMemoModal = window.closeDateMemoModal;
        
        // HTML 함수 실행 후 추가 처리를 위한 훅 설정
        if (typeof originalCloseDateMemoModal === 'function') {
            // HTML 함수를 강화하여 show-modal 클래스 제거 추가
            window.closeDateMemoModal = function() {
                console.log('🔒 unified closeDateMemoModal 호출됨');

                // show-modal 클래스 제거 (CSS 숨김 적용)
                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.classList.remove('show-modal');
                    console.log('✅ show-modal 클래스 제거됨');
                }

                // unified 시스템 상태 초기화
                MemoSystem.selectedDate = null;
                MemoSystem.locks.dateMemos = false;

                // 원래 HTML 함수 실행
                return originalCloseDateMemoModal.apply(this, arguments);
            };
            console.log('✅ HTML closeDateMemoModal 함수 강화 완료 - show-modal 클래스 제거 추가');
        } else {
            // HTML 함수가 없는 경우 백업 함수 제공
            window.closeDateMemoModal = function() {
                console.log('🔒 unified 백업 closeDateMemoModal 실행');

                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.classList.remove('show-modal');
                    modal.style.display = 'none';
                }

                // unified 시스템 상태 동기화
                MemoSystem.locks.dateMemos = false;
                MemoSystem.selectedDate = null;

                console.log('📅 백업 closeDateMemoModal 함수 실행 완료');
            };
        }
        
        // 스티커 메모 관련 함수들은 HTML에서 처리 (덮어쓰지 않음)
        // HTML의 openStickyMemo, closeStickyMemo, createStickyMemo, loadStickyMemos 등을 그대로 사용
        
        // 달력 표시 업데이트 (강화된 버전)
        window.updateCalendarDisplay = function() {
            console.log('🔄 통합시스템 달력 표시 강제 업데이트 시작');
            console.log('📍 updateCalendarDisplay 호출 위치:', new Error().stack.split('\n')[1]?.trim());
            
            // DOM 요소 강제 초기화를 생략 - 달력 날짜 표시 문제 방지
            // const grid = document.getElementById('daysGrid');
            // if (grid) {
            //     // 이벤트와 DOM 완전 초기화
            //     const parent = grid.parentNode;
            //     const newGrid = grid.cloneNode(false);
            //     parent.replaceChild(newGrid, grid);
            //     console.log('🗑️ 기존 달력 DOM 완전 제거 (이벤트 포함)');
            // }
            console.log('✅ 달력 DOM 초기화 생략 - 날짜 표시 보존');
            
            // localStorage 강제 새로고침 (브라우저 캐시 방지)
            const currentTime = Date.now();
            const tempKey = 'calendarMemos_refresh_' + currentTime;
            const memos = localStorage.getItem('calendarMemos');
            localStorage.setItem(tempKey, memos || '[]');
            localStorage.removeItem(tempKey);
            
            // 더 긴 지연을 두어 모든 처리가 완료되도록 함
            setTimeout(() => {
                console.log('🔄 달력 다시 생성 시작');
                if (window.createCalendar) {
                    try { 
                        window.createCalendar(); // 달력을 완전히 다시 그리기
                        
                        // 브라우저 강제 리페인트 트리거
                        const calendar = document.getElementById('calendar');
                        if (calendar) {
                            calendar.style.display = 'none';
                            calendar.offsetHeight; // 강제 reflow
                            calendar.style.display = '';
                            console.log('🎨 브라우저 강제 리페인트 완료');
                        }
                    } catch (e) {
                        console.error('달력 업데이트 오류:', e);
                    }
                }
                console.log('📅 통합시스템 달력 표시 강제 업데이트 완료');
                
                // 추가 검증: 메모 데이터 상태 로그
                const finalMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                console.log('📊 최종 메모 데이터:', finalMemos.length + '개');
                finalMemos.forEach(memo => {
                    console.log(`  - ${memo.date}: ${memo.title}`);
                });
            }, 100); // 100ms로 지연 시간 증가
        };
        
        // 잠금 토글
        window.toggleMemoLock = () => toggleLock('memos');
        window.toggleStickyMemoLock = () => toggleLock('stickyMemos');
        window.toggleDateMemoLock = () => toggleLock('dateMemos');
        
        // 날짜 선택
        window.selectedDate = null;
        Object.defineProperty(window, 'selectedDate', {
            get: () => MemoSystem.selectedDate,
            set: (value) => {
                MemoSystem.selectedDate = value;
                refreshDateMemoList();
            }
        });
        
        // 잠금 상태
        window.isMemosUnlocked = false;
        Object.defineProperty(window, 'isMemosUnlocked', {
            get: () => !MemoSystem.locks.memos,
            set: (value) => {
                MemoSystem.locks.memos = !value;
                refreshAllUI();
            }
        });
        
        window.isDateMemosUnlocked = false;
        Object.defineProperty(window, 'isDateMemosUnlocked', {
            get: () => !MemoSystem.locks.dateMemos,
            set: (value) => {
                MemoSystem.locks.dateMemos = !value;
                refreshDateMemoList();
            }
        });
        
        // displayDateMemos 함수 정의 (잠금 상태 변경시 메모 리스트 즉시 업데이트)
        window.displayDateMemos = function() {
            console.log('🔄 displayDateMemos 호출됨');
            
            const dateModal = document.getElementById('dateMemoModal');
            const detailModal = document.getElementById('memoDetailModal');
            const isDateModalOpen = dateModal && dateModal.style.display === 'block';
            const isDetailModalOpen = detailModal && detailModal.style.display === 'block';
            
            console.log(`📊 모달 상태: 날짜=${isDateModalOpen ? '열림' : '닫힌'}, 상세=${isDetailModalOpen ? '열림' : '닫힌'}`);
            
            // 날짜별 메모 모달이 열려있으면 항상 리스트를 새로고침 (잠금 상태 변경 반영)
            if (isDateModalOpen) {
                console.log('📋 날짜별 메모 모달이 열려있음 - 리스트 강제 새로고침');
                refreshDateMemoList();
            } else {
                console.log('📋 날짜별 메모 모달이 닫혀있음 - 리스트 새로고침 생략');
            }
        };
        
        console.log('✅ 전역 함수 대체 완료');
    }

    // ===== 디버깅 도구 =====
    
    function addDebugTools() {
        // 시스템 상태 확인
        window.memoSystemStatus = function() {
            console.log('=== 📊 메모 시스템 상태 ===');
            console.log('메모 개수:', MemoSystem.data.length);
            console.log('잠금 상태:', MemoSystem.locks);
            console.log('선택된 날짜:', MemoSystem.selectedDate);
            console.log('현재 상세보기 ID:', MemoSystem.currentDetailId);
            
            // UI 요소 확인
            ['memoList', 'stickyMemoList', 'dateMemoList'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const items = el.querySelectorAll('.memo-item').length;
                    console.log(`${id}: ${items}개 표시됨`);
                }
            });
            
            return MemoSystem;
        };
        
        // 강제 새로고침
        window.memoSystemRefresh = function() {
            console.log('🔄 메모 시스템 강제 새로고침');
            loadMemosFromStorage();
            refreshAllUI();
            return '✅ 새로고침 완료';
        };
        
        // 메모 전체 삭제 (테스트용)
        window.memoSystemClear = function() {
            if (confirm('⚠️ 정말로 모든 메모를 삭제하시겠습니까?')) {
                MemoSystem.data = [];
                saveMemosToStorage();
                refreshAllUI();
                return '✅ 모든 메모 삭제됨';
            }
            return '❌ 취소됨';
        };
        
        console.log('✅ 디버깅 도구 추가');
        console.log('🛠️ 사용 가능: memoSystemStatus(), memoSystemRefresh(), memoSystemClear()');
    }

    // ===== 초기화 =====
    
    function initialize() {
        // 이미 초기화되었으면 건너뛰기
        if (MemoSystem.initialized) {
            console.warn('⚠️ 메모 시스템이 이미 초기화되었습니다');
            return;
        }
        
        console.log('🚀 통합 메모 관리 시스템 초기화');
        
        // 모든 모달 강제 닫기 (초기화 시)
        const modals = ['dateMemoModal', 'memoDetailModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                // 모든 인라인 스타일 제거
                modal.style.position = '';
                modal.style.top = '';
                modal.style.left = '';
                modal.style.width = '';
                modal.style.height = '';
                modal.style.backgroundColor = '';
                modal.classList.remove('has-positioned-content');
            }
        });
        console.log('🔒 초기화 시 모든 메모 모달 닫기 완료');
        
        // 자동 열림 방지 플래그 설정 (초기화 중 날짜 메모창 자동 열림 차단)
        window._preventAutoOpenDateModal = true;
        setTimeout(() => {
            window._preventAutoOpenDateModal = false;
            window.modalJustClosed = false; // 모달 재열림 차단도 함께 해제
            console.log('✅ 날짜 메모창 자동 열림 방지 해제');
        }, 500); // 0.5초로 단축하여 빠른 사용자 상호작용 허용
        
        // 데이터 로드
        loadMemosFromStorage();
        
        // 기존 함수 강제 덮어쓰기 (충돌 방지)
        forceReplaceConflictingFunctions();
        
        // 기존 함수 대체
        replaceGlobalFunctions();
        
        // UI 초기화
        refreshAllUI();
        
        // 디버깅 도구
        addDebugTools();
        
        // 모든 상태 변수 초기화
        MemoSystem.selectedDate = null;
        MemoSystem.currentDetailId = null;
        
        // 초기화 완료 표시
        MemoSystem.initialized = true;
        
        console.log('✅ 통합 메모 관리 시스템 초기화 완료');
        console.log('📊 현재 메모:', MemoSystem.data.length, '개');
    }

    // 충돌하는 함수들 강제 덮어쓰기 - 잠금 상태는 건드리지 않음
    function forceReplaceConflictingFunctions() {
        // HTML 내부의 메모 관련 전역 변수들 초기화
        window.memos = MemoSystem.data;
        window.allMemos = MemoSystem.data;
        window.stickyMemos = MemoSystem.data;
        window.selectedDate = MemoSystem.selectedDate;
        window.currentMemoId = MemoSystem.currentDetailId;
        
        // 잠금 상태는 절대 변경하지 않음 - 사용자가 직접 제어해야 함
        // isMemosUnlocked와 isDateMemosUnlocked는 그대로 유지
        
        console.log('⚡ 충돌 함수 덮어쓰기 완료 (잠금 상태 보존)');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 약간의 지연을 주어 다른 스크립트들이 먼저 로드되도록 함
        setTimeout(initialize, 100);
    }
    
    // 주기적 충돌 복구는 비활성화 (과도한 새로고침 방지)
    // 필요시에만 수동으로 호출하도록 변경
    
    // 데이터 불일치 감지 시에만 복구 실행
    window.addEventListener('focus', () => {
        if (MemoSystem.initialized) {
            // 페이지가 포커스를 얻을 때만 동기화 체크
            const storedCount = JSON.parse(localStorage.getItem('calendarMemos') || '[]').length;
            if (storedCount !== MemoSystem.data.length) {
                console.log('🔄 데이터 불일치 감지 - 동기화 실행');
                forceReplaceConflictingFunctions();
                loadMemosFromStorage();
                refreshAllUI();
            }
        }
    });

})();