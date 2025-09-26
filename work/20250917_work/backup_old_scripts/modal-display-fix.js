// 모달 표시 문제 완전 해결 스크립트
// 메모 상세 모달 닫기 후 날짜별 메모 모달의 일부분만 보이는 문제 수정

(function() {
    console.log('🔧 모달 표시 문제 해결 스크립트 로드됨');

    // 원본 closeMemoDetail 함수 백업
    const originalCloseMemoDetail = window.closeMemoDetail;

    // closeMemoDetail 함수 강화
    window.closeMemoDetail = function() {
        console.log('🔧 강화된 closeMemoDetail 호출 - 모달 표시 복원');

        // 1. 원본 함수 실행
        if (originalCloseMemoDetail) {
            originalCloseMemoDetail.call(this);
        }

        // 2. 메모 상세 모달 완전 숨김
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            memoDetailModal.style.display = 'none';
            memoDetailModal.style.visibility = 'hidden';
            memoDetailModal.style.zIndex = '1001';
            console.log('✅ 메모 상세 모달 완전 숨김 처리');
        }

        // 3. 날짜별 메모 모달 완전 복원
        setTimeout(() => {
            const dateMemoModal = document.getElementById('dateMemoModal');
            if (dateMemoModal) {
                console.log('🔄 날짜별 메모 모달 상태 복원 시작');

                // 모달 전체 표시 설정
                dateMemoModal.style.display = 'block';
                dateMemoModal.style.visibility = 'visible';
                dateMemoModal.style.zIndex = '1000';
                dateMemoModal.style.position = 'fixed';
                dateMemoModal.style.top = '50%';
                dateMemoModal.style.left = '50%';
                dateMemoModal.style.transform = 'translate(-50%, -50%)';
                dateMemoModal.style.maxHeight = '80vh';
                dateMemoModal.style.overflow = 'auto';

                // 모달 내부 요소들 강제 표시
                const modalContent = dateMemoModal.querySelector('.memo-modal-content');
                if (modalContent) {
                    modalContent.style.display = 'block';
                    modalContent.style.visibility = 'visible';
                    console.log('✅ 모달 콘텐츠 영역 복원');
                }

                // 헤더 영역 복원
                const header = dateMemoModal.querySelector('h2');
                if (header) {
                    header.style.display = 'block';
                    header.style.visibility = 'visible';
                    console.log('✅ 모달 헤더 복원');
                }

                // 저장 영역 복원
                const saveArea = dateMemoModal.querySelector('.memo-input-area');
                if (saveArea) {
                    saveArea.style.display = 'block';
                    saveArea.style.visibility = 'visible';
                    console.log('✅ 저장 영역 복원');
                }

                // 잠금 버튼 영역 복원
                const lockArea = dateMemoModal.querySelector('.memo-list-header');
                if (lockArea) {
                    lockArea.style.display = 'flex';
                    lockArea.style.visibility = 'visible';
                    console.log('✅ 잠금 버튼 영역 복원');
                }

                // 메모 목록 영역 복원
                const memoList = dateMemoModal.querySelector('.date-memo-list');
                if (memoList) {
                    memoList.style.display = 'block';
                    memoList.style.visibility = 'visible';
                    console.log('✅ 메모 목록 영역 복원');
                }

                console.log('✅ 날짜별 메모 모달 완전 복원 완료');
            }
        }, 100);

        // 4. 전역 상태 정리
        setTimeout(() => {
            // 현재 메모 ID 정리
            if (window.currentMemoId) {
                window.currentMemoId = null;
                console.log('🧹 currentMemoId 정리 완료');
            }

            // 스크롤 위치 복원
            const body = document.body;
            if (body.style.overflow === 'hidden') {
                body.style.overflow = '';
                console.log('📜 스크롤 복원');
            }

            console.log('✅ 모달 표시 문제 해결 완료');
        }, 150);
    };

    // ESC 키 이벤트 강화
    const originalEscHandler = document.onkeydown;
    document.onkeydown = function(event) {
        if (event.key === 'Escape') {
            const memoDetailModal = document.getElementById('memoDetailModal');
            if (memoDetailModal && memoDetailModal.style.display === 'block') {
                console.log('🔑 ESC 키로 모달 닫기 - 표시 문제 해결 적용');
                window.closeMemoDetail();
                return;
            }
        }

        // 원본 핸들러 실행
        if (originalEscHandler) {
            originalEscHandler.call(this, event);
        }
    };

    // 모달 외부 클릭 이벤트 강화
    function enhanceModalOutsideClick() {
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            memoDetailModal.onclick = function(event) {
                if (event.target === memoDetailModal) {
                    console.log('🖱️ 모달 외부 클릭 - 표시 문제 해결 적용');
                    window.closeMemoDetail();
                }
            };
        }
    }

    // DOM 로드 후 이벤트 설정
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceModalOutsideClick);
    } else {
        enhanceModalOutsideClick();
    }

    // 주기적으로 모달 상태 검사 및 수정
    function checkModalState() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        const memoDetailModal = document.getElementById('memoDetailModal');

        // 날짜별 메모 모달이 열려있는데 일부만 보이는 경우 수정
        if (dateMemoModal && dateMemoModal.style.display === 'block') {
            const modalContent = dateMemoModal.querySelector('.memo-modal-content');
            if (modalContent && modalContent.style.display === 'none') {
                console.log('⚠️ 모달 표시 문제 감지 - 자동 수정');

                modalContent.style.display = 'block';
                modalContent.style.visibility = 'visible';

                // 모든 주요 영역 복원
                const selectors = ['h2', '.memo-input-area', '.memo-list-header', '.date-memo-list'];
                selectors.forEach(selector => {
                    const element = dateMemoModal.querySelector(selector);
                    if (element) {
                        element.style.display = element.tagName === 'H2' ? 'block' :
                                                selector === '.memo-list-header' ? 'flex' : 'block';
                        element.style.visibility = 'visible';
                    }
                });

                console.log('✅ 모달 표시 자동 수정 완료');
            }
        }
    }

    // 5초마다 모달 상태 검사
    setInterval(checkModalState, 5000);

    console.log('✅ 모달 표시 문제 해결 스크립트 초기화 완료');
    console.log('🛠️ 이제 메모 상세 모달을 닫아도 날짜별 메모 모달이 완전히 표시됩니다');

})();