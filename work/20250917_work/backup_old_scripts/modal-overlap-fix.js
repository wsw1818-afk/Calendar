// 모달 겹침 문제 해결 스크립트
// 메모 편집 후 메모 클릭시 삭제 모달이 사라지는 문제 해결

(function() {
    console.log('🔧 모달 겹침 문제 해결 스크립트 로드됨');

    // 원본 openMemoDetail 함수 백업
    const originalOpenMemoDetail = window.openMemoDetail;

    // openMemoDetail 함수 강화
    window.openMemoDetail = function(memoId) {
        console.log('🔧 강화된 openMemoDetail 호출, 모달 겹침 방지:', memoId);

        // 1. 날짜별 메모 모달을 확실히 닫기
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            console.log('📋 날짜별 메모 모달 강제 닫기');
            dateMemoModal.style.display = 'none';
            dateMemoModal.style.visibility = 'hidden';
            dateMemoModal.style.zIndex = '999';
        }

        // 2. 메모 상세 모달을 확실히 초기화
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            console.log('🔧 메모 상세 모달 초기화');
            memoDetailModal.style.display = 'none';
            memoDetailModal.style.visibility = 'hidden';
            memoDetailModal.style.zIndex = '1001';
        }

        // 3. 짧은 지연 후 원본 함수 실행
        setTimeout(() => {
            try {
                if (originalOpenMemoDetail) {
                    console.log('✅ 원본 openMemoDetail 함수 실행');
                    originalOpenMemoDetail.call(this, memoId);
                } else {
                    console.error('❌ 원본 openMemoDetail 함수를 찾을 수 없음');
                }

                // 4. 메모 상세 모달이 정상적으로 열렸는지 확인
                setTimeout(() => {
                    const modal = document.getElementById('memoDetailModal');
                    if (modal && modal.style.display === 'block') {
                        console.log('✅ 메모 상세 모달 정상 열림');
                        // 날짜별 메모 모달이 다시 나타나지 않도록 재확인
                        const dateModal = document.getElementById('dateMemoModal');
                        if (dateModal && dateModal.style.display === 'block') {
                            console.log('⚠️ 날짜별 메모 모달이 다시 나타남 - 재차 숨김');
                            dateModal.style.display = 'none';
                            dateModal.style.visibility = 'hidden';
                        }
                    }
                }, 100);

            } catch (error) {
                console.error('❌ openMemoDetail 실행 중 오류:', error);
            }
        }, 50);
    };

    // closeMemoDetail 함수도 강화
    const originalCloseMemoDetail = window.closeMemoDetail;

    window.closeMemoDetail = function() {
        console.log('🔧 강화된 closeMemoDetail 호출');

        // 원본 함수 실행
        if (originalCloseMemoDetail) {
            originalCloseMemoDetail.call(this);
        }

        // 메모 상세 모달 확실히 닫기
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            memoDetailModal.style.display = 'none';
            memoDetailModal.style.visibility = 'hidden';
        }

        // 날짜별 메모 모달 다시 표시 (필요한 경우)
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            // 날짜별 메모 모달이 원래 열려있었다면 다시 표시
            const isDateModalNeeded = dateMemoModal.querySelector('.date-memo-list .memo-item');
            if (isDateModalNeeded) {
                console.log('📋 날짜별 메모 모달 다시 표시');
                dateMemoModal.style.display = 'block';
                dateMemoModal.style.visibility = 'visible';
                dateMemoModal.style.zIndex = '1000';
            }
        }
    };

    // 페이지 로드 시 기존 모달 상태 정리
    function cleanupModals() {
        console.log('🧹 모달 상태 정리');

        const modals = ['dateMemoModal', 'memoDetailModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // 모달이 실제로 표시되어야 하는지 확인
                const shouldShow = modal.style.display === 'block';
                if (!shouldShow) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                }
                console.log(`🔧 ${modalId} 상태 정리 완료: ${shouldShow ? '표시' : '숨김'}`);
            }
        });
    }

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanupModals);
    } else {
        cleanupModals();
    }

    console.log('✅ 모달 겹침 문제 해결 스크립트 초기화 완료');
    console.log('🛠️ 이제 메모 편집 후 클릭해도 모달이 정상적으로 표시됩니다');

})();