// 메모 리스트 복원 수정 스크립트
// 메모 상세 닫기 후 날짜 메모 모달의 메모 리스트가 사라지는 버그 해결

(function() {
    console.log('📝 메모 리스트 복원 수정 스크립트 로드됨');

    // 날짜 메모 모달에 메모 리스트를 강제 복원하는 함수
    function forceRestoreMemoList() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal || dateMemoModal.style.display === 'none') {
            console.log('📝 날짜 메모 모달이 열려있지 않음 - 복원 건너뛰기');
            return false;
        }

        console.log('📝 메모 리스트 강제 복원 시작');

        // 현재 선택된 날짜 확인
        const selectedDate = window.selectedDate || getCurrentSelectedDate();
        if (!selectedDate) {
            console.log('⚠️ 선택된 날짜가 없어서 복원할 수 없음');
            return false;
        }

        console.log('📅 복원할 날짜:', selectedDate);

        // 기존 메모 리스트 영역 찾기
        let memoListContainer = dateMemoModal.querySelector('.date-memo-list, #dateMemoList');

        // 메모 리스트 컨테이너가 없으면 생성
        if (!memoListContainer) {
            console.log('📝 메모 리스트 컨테이너가 없어서 생성');
            memoListContainer = document.createElement('div');
            memoListContainer.className = 'date-memo-list';
            memoListContainer.id = 'dateMemoList';

            // 적절한 위치에 삽입
            const lockSection = dateMemoModal.querySelector('.lock-section');
            if (lockSection) {
                lockSection.parentNode.insertBefore(memoListContainer, lockSection.nextSibling);
            } else {
                dateMemoModal.appendChild(memoListContainer);
            }
        }

        // 메모 데이터 로드 (올바른 키 사용)
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        const dateMemos = memos.filter(memo => {
            const memoDate = new Date(memo.date).toISOString().split('T')[0];
            return memoDate === selectedDate;
        });

        console.log(`📝 ${selectedDate} 날짜의 메모 ${dateMemos.length}개 찾음`);

        // 메모 리스트 HTML 생성
        let memoListHTML = '';
        if (dateMemos.length > 0) {
            dateMemos.forEach(memo => {
                const formattedDate = new Date(memo.date).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                memoListHTML += `
                    <div class="memo-item" data-memo-id="${memo.id}" style="cursor: pointer; margin: 8px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9;">
                        <div class="memo-item-content">
                            <div style="font-weight: bold; color: #333;">📝 ${memo.title || memo.content.substring(0, 30)}</div>
                            <div style="color: #666; margin: 4px 0;">${memo.content.substring(0, 50)}${memo.content.length > 50 ? '...' : ''}</div>
                            <div style="font-size: 12px; color: #999;">📅 ${selectedDate}</div>
                            <div style="font-size: 12px; color: #999;">⏰ ${formattedDate}</div>
                            <div style="font-size: 12px; color: #007bff; margin-top: 4px;">클릭하여 보기</div>
                        </div>
                    </div>
                `;
            });
        } else {
            memoListHTML = '<div style="text-align: center; color: #999; padding: 20px;">이 날짜에는 메모가 없습니다.</div>';
        }

        // 메모 리스트 업데이트
        memoListContainer.innerHTML = memoListHTML;

        // 메모 아이템에 클릭 이벤트 리스너 추가 (이벤트 버블링 방지)
        const memoItems = memoListContainer.querySelectorAll('.memo-item');
        memoItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const memoId = this.getAttribute('data-memo-id');
                console.log('🖱️ 메모 아이템 클릭 (이벤트 버블링 방지):', memoId);

                // openMemoDetail 함수 호출
                if (window.openMemoDetail && typeof window.openMemoDetail === 'function') {
                    setTimeout(() => {
                        window.openMemoDetail(memoId);
                    }, 10);
                } else {
                    console.log('⚠️ openMemoDetail 함수를 찾을 수 없음');
                }
            }, true); // capture phase에서 처리
        });

        console.log('✅ 메모 리스트 복원 완료:', dateMemos.length + '개');
        console.log('✅ 메모 아이템 클릭 이벤트 리스너 등록 완료:', memoItems.length + '개');

        return true;
    }

    // 현재 선택된 날짜를 가져오는 함수
    function getCurrentSelectedDate() {
        // 여러 방법으로 선택된 날짜 확인

        // 1. window.selectedDate 확인
        if (window.selectedDate) {
            return window.selectedDate;
        }

        // 2. 모달 헤더에서 날짜 추출
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            const header = dateMemoModal.querySelector('h2');
            if (header) {
                const headerText = header.textContent;
                const dateMatch = headerText.match(/(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) {
                    return dateMatch[1];
                }
            }
        }

        // 3. 현재 날짜로 fallback
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // 원본 closeMemoDetail 함수를 확장하여 메모 리스트 복원
    function enhanceCloseMemoDetailForListRestoration() {
        if (window.closeMemoDetail) {
            const originalCloseMemoDetail = window.closeMemoDetail;

            window.closeMemoDetail = function() {
                console.log('📝 메모 리스트 복원 기능이 추가된 closeMemoDetail 호출');

                // 원본 함수 실행
                const result = originalCloseMemoDetail.apply(this, arguments);

                // 메모 리스트 복원 작업
                setTimeout(() => {
                    const success = forceRestoreMemoList();
                    if (success) {
                        console.log('✅ 메모 상세 닫기 후 메모 리스트 복원 완료');
                    } else {
                        console.log('⚠️ 메모 리스트 복원 실패 - 재시도');
                        setTimeout(forceRestoreMemoList, 200);
                    }
                }, 100);

                return result;
            };

            console.log('✅ closeMemoDetail 함수에 메모 리스트 복원 기능 추가 완료');
        } else {
            console.log('⚠️ closeMemoDetail 함수가 없어서 나중에 다시 시도');
            setTimeout(enhanceCloseMemoDetailForListRestoration, 1000);
        }
    }

    // ESC 키 핸들러에도 메모 리스트 복원 추가
    function enhanceEscKeyForListRestoration() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                const memoDetailModal = document.getElementById('memoDetailModal');
                const dateMemoModal = document.getElementById('dateMemoModal');

                // 메모 상세가 열려있고 ESC가 처리된 후
                if (memoDetailModal && memoDetailModal.style.display === 'block') {
                    console.log('📝 ESC 키 감지 - 메모 리스트 복원 예약');

                    // ESC 처리 후 메모 리스트 복원
                    setTimeout(() => {
                        if (dateMemoModal && dateMemoModal.style.display !== 'none') {
                            const success = forceRestoreMemoList();
                            if (success) {
                                console.log('✅ ESC 후 메모 리스트 복원 완료');
                            }
                        }
                    }, 200);
                }
            }
        }, false);

        console.log('✅ ESC 키 메모 리스트 복원 핸들러 등록 완료');
    }

    // 디버깅 함수
    window.debugMemoListRestoration = function() {
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (!dateMemoModal) return 'Modal not found';

        const memoList = dateMemoModal.querySelector('.date-memo-list, #dateMemoList');
        const memoItems = dateMemoModal.querySelectorAll('.memo-item');
        const selectedDate = getCurrentSelectedDate();

        return {
            modalVisible: dateMemoModal.style.display !== 'none',
            memoListExists: !!memoList,
            memoItemCount: memoItems.length,
            selectedDate: selectedDate,
            canRestore: !!selectedDate
        };
    };

    window.forceRestoreMemoList = forceRestoreMemoList;

    // 초기화
    function init() {
        enhanceCloseMemoDetailForListRestoration();
        enhanceEscKeyForListRestoration();

        console.log('✅ 메모 리스트 복원 수정 시스템 초기화 완료');
        console.log('🛠️ 디버깅: debugMemoListRestoration(), forceRestoreMemoList()');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 500);
    });

})();