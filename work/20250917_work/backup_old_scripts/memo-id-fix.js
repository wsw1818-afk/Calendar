// 메모 ID 매칭 문제 해결 스크립트
(function() {
    'use strict';

    console.log('메모 ID 매칭 수정 스크립트 로드됨');

    // 메모 데이터를 모든 가능한 소스에서 가져오는 함수
    function getAllMemoData() {
        const sources = [
            { name: 'window.memos', data: window.memos },
            { name: 'window.allMemos', data: window.allMemos },
            { name: 'window.stickyMemos', data: window.stickyMemos }
        ];

        // localStorage에서도 가져오기 (여러 키 시도)
        const storageKeys = ['calendarMemos', 'memos', 'stickyMemos', 'allMemos'];
        
        storageKeys.forEach(key => {
            try {
                const storedMemos = localStorage.getItem(key);
                if (storedMemos) {
                    const parsed = JSON.parse(storedMemos);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        sources.push({ 
                            name: `localStorage[${key}]`, 
                            data: parsed 
                        });
                    }
                }
            } catch (e) {
                console.warn(`localStorage[${key}] 메모 데이터 파싱 실패:`, e);
            }
        });

        // 각 소스에서 유효한 데이터 찾기
        const allMemos = [];
        
        sources.forEach(source => {
            if (Array.isArray(source.data) && source.data.length > 0) {
                console.log(`${source.name}에서 ${source.data.length}개 메모 발견`);
                
                source.data.forEach(memo => {
                    // 중복 제거 (ID 기준)
                    if (memo && memo.id && !allMemos.find(existing => existing.id == memo.id)) {
                        allMemos.push({
                            ...memo,
                            source: source.name
                        });
                    }
                });
            }
        });

        console.log('통합된 총 메모 개수:', allMemos.length);
        return allMemos;
    }

    // 메모를 ID로 찾는 강화된 함수
    function findMemoById(targetId) {
        console.log('메모 검색 시작, 대상 ID:', targetId);
        
        // 타입 변환된 ID들
        const searchIds = [
            targetId,
            String(targetId),
            parseInt(targetId),
            Number(targetId)
        ].filter(id => id !== null && id !== undefined && !isNaN(id));

        console.log('검색할 ID 변형들:', searchIds);

        const allMemos = getAllMemoData();
        
        if (allMemos.length === 0) {
            console.error('사용 가능한 메모가 없습니다!');
            return null;
        }

        // 각 메모의 ID를 로그로 확인
        console.log('사용 가능한 메모 ID들:', allMemos.map(m => ({
            id: m.id,
            type: typeof m.id,
            title: m.title,
            source: m.source
        })));

        // 다양한 방식으로 메모 검색
        for (const searchId of searchIds) {
            // 정확한 매치
            let found = allMemos.find(memo => memo.id === searchId);
            if (found) {
                console.log('정확한 매치 발견:', found);
                return found;
            }

            // 타입 변환 매치
            found = allMemos.find(memo => memo.id == searchId);
            if (found) {
                console.log('타입 변환 매치 발견:', found);
                return found;
            }

            // 문자열 매치
            found = allMemos.find(memo => String(memo.id) === String(searchId));
            if (found) {
                console.log('문자열 매치 발견:', found);
                return found;
            }
        }

        console.error('메모를 찾을 수 없음. 검색 ID:', targetId);
        console.error('사용 가능한 메모들:', allMemos);
        return null;
    }

    // 원래 openMemoDetail 함수를 더욱 강화
    function enhanceOpenMemoDetail() {
        const originalOpenMemoDetail = window.openMemoDetail;
        
        window.openMemoDetail = function(id) {
            console.log('=== 강화된 openMemoDetail 호출됨 ===');
            console.log('요청된 ID:', id, '(타입:', typeof id, ')');
            
            const memo = findMemoById(id);
            
            if (!memo) {
                console.error('메모를 찾을 수 없습니다. ID:', id);
                
                // 사용자에게 더 나은 오류 정보 제공
                const allMemos = getAllMemoData();
                if (allMemos.length === 0) {
                    alert('저장된 메모가 없습니다. 메모를 먼저 작성해주세요.');
                } else {
                    alert(`메모를 찾을 수 없습니다.\n요청된 ID: ${id}\n사용 가능한 메모: ${allMemos.length}개\n\n페이지를 새로고침 해보세요.`);
                }
                return;
            }

            console.log('메모 발견:', memo);

            // 메모 상세 표시 로직
            try {
                // currentMemoId 설정
                window.currentMemoId = memo.id;
                
                // 상세 모달에 내용 채우기
                const titleElement = document.getElementById('memoDetailTitle');
                const dateElement = document.getElementById('memoDetailDate');
                const bodyElement = document.getElementById('memoDetailBody');
                
                if (!titleElement || !dateElement || !bodyElement) {
                    console.error('메모 상세 모달 요소를 찾을 수 없습니다.');
                    alert('메모 표시 기능에 문제가 있습니다. 페이지를 새로고침 해주세요.');
                    return;
                }

                titleElement.textContent = memo.title || '제목 없음';
                dateElement.textContent = `📅 ${memo.date || '날짜 없음'}`;
                bodyElement.textContent = memo.content || '내용 없음';
                
                console.log('모달 내용 설정 완료');
                
                // 상세 모달 표시
                const memoDetailModal = document.getElementById('memoDetailModal');
                if (!memoDetailModal) {
                    console.error('memoDetailModal 요소를 찾을 수 없습니다.');
                    alert('메모 모달을 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
                    return;
                }

                // 모달 스타일 설정 및 표시
                const modalContent = memoDetailModal.querySelector('.memo-modal-content');
                if (modalContent) {
                    // 모달 배경 스타일
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
                        backdrop-filter: blur(5px);
                    `;

                    // 모달 내용 스타일
                    modalContent.style.cssText = `
                        background: white;
                        border-radius: 12px;
                        padding: 20px;
                        width: 90%;
                        max-width: 500px;
                        max-height: 80vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        position: relative;
                        margin: 0;
                        transform: scale(1);
                        animation: modalFadeIn 0.3s ease;
                    `;
                }

                // 모달 표시
                memoDetailModal.style.display = 'flex';
                console.log('메모 상세 모달 표시 완료');

                // ESC 키로 닫기
                const handleEscKey = (e) => {
                    if (e.key === 'Escape') {
                        window.closeMemoDetail();
                        document.removeEventListener('keydown', handleEscKey);
                    }
                };
                document.addEventListener('keydown', handleEscKey);

                // 모달 외부 클릭으로 닫기
                memoDetailModal.onclick = (e) => {
                    if (e.target === memoDetailModal) {
                        window.closeMemoDetail();
                    }
                };

            } catch (error) {
                console.error('메모 상세 표시 중 오류:', error);
                alert('메모를 표시하는 중 오류가 발생했습니다.');
            }
        };

        console.log('openMemoDetail 함수 강화 완료');
    }

    // 메모 리스트 생성 시 올바른 ID가 사용되는지 확인
    function validateMemoListIds() {
        // 모든 메모 아이템의 onclick 속성 검사
        setTimeout(() => {
            const memoItems = document.querySelectorAll('.memo-item[onclick]');
            console.log('메모 아이템 onclick 속성 검사:', memoItems.length, '개');

            memoItems.forEach((item, index) => {
                const onclick = item.getAttribute('onclick');
                const match = onclick.match(/openMemoDetail\((\d+)\)/);
                
                if (match) {
                    const displayedId = match[1];
                    console.log(`메모 아이템 ${index + 1}: ID ${displayedId}`);
                    
                    // 실제로 이 ID의 메모가 존재하는지 확인
                    const memo = findMemoById(displayedId);
                    if (!memo) {
                        console.warn(`⚠️ 메모 아이템의 ID ${displayedId}에 해당하는 메모가 없습니다!`);
                        
                        // 아이템에 시각적 표시 추가
                        item.style.border = '2px solid #ff6b6b';
                        item.title = `오류: 메모 ID ${displayedId}를 찾을 수 없음`;
                    }
                }
            });
        }, 1000);
    }

    // 메모 데이터 동기화 함수
    function syncMemoData() {
        console.log('메모 데이터 동기화 시작...');
        
        // localStorage에서 직접 메모 데이터 로드
        let calendarMemos = [];
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                calendarMemos = JSON.parse(stored);
                console.log('calendarMemos에서 로드:', calendarMemos.length, '개');
            }
        } catch (e) {
            console.error('calendarMemos 로드 실패:', e);
        }

        // window.memos 설정
        if (!window.memos || window.memos.length === 0) {
            if (calendarMemos.length > 0) {
                window.memos = calendarMemos;
                console.log('✅ window.memos 설정 완료:', calendarMemos.length, '개');
                
                // 전역 접근을 위해 다른 변수들도 설정
                window.allMemos = calendarMemos;
                window.stickyMemos = calendarMemos;
            } else {
                console.warn('⚠️ localStorage에 메모 데이터가 없습니다.');
                window.memos = [];
            }
        }

        const allMemos = getAllMemoData();
        console.log('최종 통합된 메모 개수:', allMemos.length);
        
        // 메모 데이터 확인을 위한 상세 로그
        if (allMemos.length > 0) {
            console.log('메모 데이터 샘플:', allMemos.slice(0, 3).map(m => ({
                id: m.id,
                title: m.title,
                date: m.date
            })));
        }
        
        return allMemos;
    }

    // 디버깅 도구 추가
    function addDebugTools() {
        window.debugMemoId = function(id) {
            console.log('=== 메모 ID 디버깅 ===');
            console.log('검색 대상 ID:', id);
            
            const result = findMemoById(id);
            if (result) {
                console.log('✅ 메모 찾음:', result);
            } else {
                console.log('❌ 메모 찾을 수 없음');
            }
            
            return result;
        };

        window.listAllMemos = function() {
            const allMemos = getAllMemoData();
            console.table(allMemos.map(m => ({
                ID: m.id,
                타입: typeof m.id,
                제목: m.title,
                날짜: m.date,
                소스: m.source
            })));
            return allMemos;
        };
    }

    // 초기화
    function initialize() {
        console.log('메모 ID 매칭 수정 시스템 초기화');
        
        enhanceOpenMemoDetail();
        syncMemoData();
        addDebugTools();
        
        // DOM 로드 후 검증
        setTimeout(() => {
            validateMemoListIds();
        }, 2000);
        
        console.log('메모 ID 매칭 수정 시스템 초기화 완료');
        console.log('디버깅 도구: debugMemoId(id), listAllMemos()');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 지연 초기화
    setTimeout(initialize, 1000);

})();