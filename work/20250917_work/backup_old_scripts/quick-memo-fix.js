// 즉시 메모 데이터 수정 스크립트
(function() {
    'use strict';
    
    console.log('🚀 즉시 메모 데이터 수정 실행');

    // localStorage에서 calendarMemos 로드하여 window.memos 설정
    function loadMemoData() {
        try {
            const calendarMemos = localStorage.getItem('calendarMemos');
            if (calendarMemos) {
                const memos = JSON.parse(calendarMemos);
                
                // 전역 변수들 설정
                window.memos = memos;
                window.allMemos = memos;
                window.stickyMemos = memos;
                
                console.log('✅ 메모 데이터 로드 성공:', memos.length, '개');
                
                // 샘플 데이터 표시
                if (memos.length > 0) {
                    console.log('📝 메모 샘플:', memos.slice(0, 3).map(m => ({
                        id: m.id,
                        title: m.title,
                        date: m.date
                    })));
                }
                
                return memos;
            } else {
                console.warn('⚠️ calendarMemos가 localStorage에 없습니다.');
                window.memos = [];
                return [];
            }
        } catch (error) {
            console.error('❌ 메모 데이터 로드 실패:', error);
            window.memos = [];
            return [];
        }
    }

    // openMemoDetail 함수 즉시 수정
    function fixOpenMemoDetail() {
        window.openMemoDetail = function(id) {
            console.log('🔍 메모 상세보기 호출, ID:', id);
            
            // 메모 데이터 다시 로드 (최신 상태 보장)
            const memos = loadMemoData();
            
            if (!memos || memos.length === 0) {
                console.error('❌ 메모 데이터가 없습니다!');
                alert('저장된 메모가 없습니다.');
                return;
            }
            
            // ID로 메모 찾기 (다양한 타입 매칭)
            const targetId = id;
            let memo = memos.find(m => m.id === targetId) || 
                      memos.find(m => m.id == targetId) ||
                      memos.find(m => String(m.id) === String(targetId));
            
            if (!memo) {
                console.error('❌ 메모를 찾을 수 없습니다. ID:', id);
                console.log('📋 사용 가능한 메모 ID들:', memos.map(m => m.id));
                alert(`메모를 찾을 수 없습니다.\nID: ${id}\n사용 가능한 메모: ${memos.length}개`);
                return;
            }
            
            console.log('✅ 메모 찾음:', memo);
            
            // 상세 모달 표시
            showMemoDetail(memo);
        };
        
        console.log('✅ openMemoDetail 함수 수정 완료');
    }

    // 메모 상세 모달 표시 함수
    function showMemoDetail(memo) {
        // currentMemoId 설정
        window.currentMemoId = memo.id;
        
        // 모달 요소들 가져오기
        const memoDetailModal = document.getElementById('memoDetailModal');
        const titleElement = document.getElementById('memoDetailTitle');
        const dateElement = document.getElementById('memoDetailDate');
        const bodyElement = document.getElementById('memoDetailBody');
        
        if (!memoDetailModal || !titleElement || !dateElement || !bodyElement) {
            console.error('❌ 메모 상세 모달 요소를 찾을 수 없습니다.');
            alert('메모 모달을 표시할 수 없습니다.');
            return;
        }
        
        // 내용 설정
        titleElement.textContent = memo.title || '제목 없음';
        dateElement.textContent = `📅 ${memo.date || '날짜 없음'}`;
        bodyElement.textContent = memo.content || '내용 없음';
        
        // 모달 스타일 및 표시
        memoDetailModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = memoDetailModal.querySelector('.memo-modal-content');
        if (modalContent) {
            modalContent.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                margin: 0;
            `;
        }
        
        console.log('✅ 메모 상세 모달 표시 완료');
        
        // 모달 닫기 이벤트
        memoDetailModal.onclick = function(e) {
            if (e.target === memoDetailModal) {
                closeMemoDetail();
            }
        };
        
        // ESC 키 이벤트
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                closeMemoDetail();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 모달 닫기 함수 개선
    function fixCloseMemoDetail() {
        window.closeMemoDetail = function() {
            console.log('🔒 메모 상세 모달 닫기');
            
            const memoDetailModal = document.getElementById('memoDetailModal');
            if (memoDetailModal) {
                memoDetailModal.style.display = 'none';
                memoDetailModal.onclick = null;
            }
            
            window.currentMemoId = null;
        };
        
        console.log('✅ closeMemoDetail 함수 수정 완료');
    }

    // 디버깅 도구 추가
    function addQuickDebugTools() {
        window.quickDebug = function() {
            console.log('=== 🔍 빠른 디버깅 정보 ===');
            
            const calendarMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            console.log('localStorage[calendarMemos]:', calendarMemos.length, '개');
            console.log('window.memos:', window.memos ? window.memos.length : 'undefined');
            
            if (calendarMemos.length > 0) {
                console.table(calendarMemos.map(m => ({
                    ID: m.id,
                    타입: typeof m.id,
                    제목: m.title,
                    날짜: m.date
                })));
            }
            
            return calendarMemos;
        };

        window.testMemoClick = function(id) {
            console.log('🧪 메모 클릭 테스트, ID:', id);
            if (window.openMemoDetail) {
                window.openMemoDetail(id);
            } else {
                console.error('openMemoDetail 함수가 없습니다.');
            }
        };
        
        console.log('✅ 디버깅 도구 추가: quickDebug(), testMemoClick(id)');
    }

    // 즉시 실행
    function execute() {
        console.log('🎯 즉시 수정 실행 중...');
        
        // 1. 메모 데이터 로드
        const memos = loadMemoData();
        
        // 2. 함수들 수정
        fixOpenMemoDetail();
        fixCloseMemoDetail();
        
        // 3. 디버깅 도구 추가
        addQuickDebugTools();
        
        console.log('🎉 즉시 수정 완료!');
        console.log('📋 사용 가능한 메모:', memos.length, '개');
        
        // 콘솔에 도움말 표시
        console.log('%c💡 도움말', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log('- quickDebug(): 메모 데이터 상태 확인');
        console.log('- testMemoClick(ID): 특정 메모 클릭 테스트');
        
        if (memos.length > 0) {
            const firstMemo = memos[0];
            console.log(`- 예시: testMemoClick(${firstMemo.id})`);
        }
    }

    // 즉시 실행
    execute();
    
    // DOM 로드 후에도 한 번 더 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', execute);
    }
    
    // 1초 후에도 실행 (다른 스크립트들과의 타이밍 이슈 해결)
    setTimeout(execute, 1000);

})();