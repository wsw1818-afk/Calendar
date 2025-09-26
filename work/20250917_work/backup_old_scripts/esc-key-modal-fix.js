// ESC 키 모달 복원 로직 수정 스크립트
// 메모 상세 모달에서 ESC 키 사용시 적절한 복원 로직 호출 보장

(function() {
    console.log('🔑 ESC 키 모달 복원 로직 수정 시작');

    // 기존 ESC 키 핸들러들을 찾아서 개선
    function enhanceEscKeyHandling() {
        // 새로운 ESC 키 핸들러 추가 (최고 우선순위)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                console.log('🔑 개선된 ESC 키 핸들러 실행');

                // 1. 메모 상세 모달이 열려있는지 확인
                const memoDetailModal = document.getElementById('memoDetailModal');
                if (memoDetailModal &&
                    memoDetailModal.style.display === 'block' &&
                    !memoDetailModal.hasAttribute('aria-hidden')) {

                    console.log('🔧 메모 상세 모달 ESC 처리 - closeMemoDetail 호출');
                    e.preventDefault();
                    e.stopPropagation();

                    // 적절한 닫기 함수 호출
                    if (window.closeMemoDetail) {
                        window.closeMemoDetail();
                    } else {
                        // 폴백: 수동 닫기
                        memoDetailModal.style.display = 'none';
                        memoDetailModal.style.visibility = 'hidden';
                        memoDetailModal.setAttribute('aria-hidden', 'true');

                        // 날짜 메모 모달 복원
                        const dateMemoModal = document.getElementById('dateMemoModal');
                        if (dateMemoModal) {
                            dateMemoModal.style.display = 'block';
                            dateMemoModal.style.visibility = 'visible';
                            dateMemoModal.removeAttribute('aria-hidden');
                        }
                    }
                    return false; // 다른 핸들러 실행 방지
                }

                // 2. 날짜 메모 모달이 열려있는지 확인
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (dateMemoModal &&
                    dateMemoModal.style.display === 'block' &&
                    !dateMemoModal.hasAttribute('aria-hidden')) {

                    console.log('🔧 날짜 메모 모달 ESC 처리 - closeDateMemoModal 호출');
                    e.preventDefault();
                    e.stopPropagation();

                    if (window.closeDateMemoModal) {
                        window.closeDateMemoModal();
                    } else {
                        // 폴백: 수동 닫기
                        dateMemoModal.style.display = 'none';
                        dateMemoModal.style.visibility = 'hidden';
                        dateMemoModal.setAttribute('aria-hidden', 'true');
                        document.body.classList.remove('modal-open', 'modal-active');
                    }
                    return false;
                }

                // 3. 기타 모달들 처리
                const otherModals = document.querySelectorAll('.modal:not(#memoDetailModal):not(#dateMemoModal)');
                let modalClosed = false;

                otherModals.forEach(modal => {
                    if (modal.style.display === 'block' && !modal.hasAttribute('aria-hidden')) {
                        console.log('🔧 기타 모달 ESC 처리:', modal.id);
                        modal.style.display = 'none';
                        modal.style.visibility = 'hidden';
                        modal.setAttribute('aria-hidden', 'true');
                        modalClosed = true;
                    }
                });

                if (modalClosed) {
                    document.body.classList.remove('modal-open', 'modal-active');
                }
            }
        }, true); // capture phase에서 최우선 처리

        console.log('✅ 개선된 ESC 키 핸들러 등록 완료');
    }

    // 기존 restore-close-buttons.js의 ESC 핸들러 비활성화
    function disableOldEscHandlers() {
        // 기존 이벤트 리스너들을 찾아서 비활성화하는 것은 복잡하므로
        // 대신 이벤트가 capture phase에서 처리되도록 하여 우선순위를 높임
        console.log('🚫 기존 ESC 핸들러들보다 우선 처리되도록 설정됨');
    }

    // 초기화
    function init() {
        disableOldEscHandlers();
        enhanceEscKeyHandling();
        console.log('✅ ESC 키 모달 복원 로직 수정 완료');
    }

    // DOM 로드 상태 확인 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 한번 더 실행 (다른 스크립트들이 로드된 후)
    window.addEventListener('load', function() {
        setTimeout(init, 100);
    });

})();