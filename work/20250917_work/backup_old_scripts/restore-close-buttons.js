// 메모 모달 닫기 버튼 복원 스크립트
// X 버튼 제거 스크립트들을 무력화하고 닫기 버튼을 다시 추가

(function() {
    console.log('🔄 닫기 버튼 복원 시작');

    // X 버튼 제거 함수들을 무력화
    function disableXButtonRemoval() {
        // 기존 X 버튼 제거 함수들을 무력화
        const functionsToDisable = [
            'removeXButtons',
            'removeCloseButtons',
            'hideCloseButtons'
        ];

        functionsToDisable.forEach(funcName => {
            if (window[funcName]) {
                window[funcName] = function() {
                    console.log(`🚫 ${funcName} 차단됨`);
                    return false;
                };
            }
        });
    }

    // 닫기 버튼 추가 함수
    function addCloseButtons() {
        // 날짜 메모 모달에 닫기 버튼 추가
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            let closeBtn = dateMemoModal.querySelector('.modal-close-btn');

            if (!closeBtn) {
                closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close-btn';
                closeBtn.innerHTML = '❌';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    z-index: 1000;
                    color: #666;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                `;

                // 호버 효과
                closeBtn.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    this.style.color = '#333';
                });

                closeBtn.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                    this.style.color = '#666';
                });

                // 클릭 이벤트 - 모달 닫기
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ 닫기 버튼 클릭됨');

                    // 다양한 닫기 방법 시도
                    if (window.closeDateMemoModal) {
                        window.closeDateMemoModal();
                    } else {
                        // 직접 모달 숨기기
                        dateMemoModal.style.display = 'none';
                        dateMemoModal.style.visibility = 'hidden';
                        dateMemoModal.classList.remove('show', 'active');
                        dateMemoModal.setAttribute('aria-hidden', 'true');

                        // body에서 modal-open 클래스 제거
                        document.body.classList.remove('modal-open', 'modal-active');
                    }
                });

                // 모달 헤더나 모달 컨텐츠에 추가
                const modalContent = dateMemoModal.querySelector('.memo-modal-content');
                if (modalContent) {
                    modalContent.style.position = 'relative';
                    modalContent.appendChild(closeBtn);
                    console.log('✅ 날짜 메모 모달에 닫기 버튼 추가됨');
                }
            }
        }

        // 메모 상세 모달에도 닫기 버튼 추가
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            let closeBtn = memoDetailModal.querySelector('.modal-close-btn');

            if (!closeBtn) {
                closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close-btn';
                closeBtn.innerHTML = '❌';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    z-index: 1000;
                    color: #666;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                `;

                // 호버 효과
                closeBtn.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    this.style.color = '#333';
                });

                closeBtn.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                    this.style.color = '#666';
                });

                // 클릭 이벤트
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ 메모 상세 닫기 버튼 클릭됨');

                    if (window.closeMemoDetail) {
                        window.closeMemoDetail();
                    } else {
                        memoDetailModal.style.display = 'none';
                        memoDetailModal.style.visibility = 'hidden';
                        memoDetailModal.classList.remove('show', 'active');
                        memoDetailModal.setAttribute('aria-hidden', 'true');

                        document.body.classList.remove('modal-open', 'modal-active');
                    }
                });

                const modalContent = memoDetailModal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.position = 'relative';
                    modalContent.appendChild(closeBtn);
                    console.log('✅ 메모 상세 모달에 닫기 버튼 추가됨');
                }
            }
        }
    }

    // ESC 키 이벤트 강화
    function enhanceKeyboardSupport() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                console.log('🔑 ESC 키로 모달 닫기 시도');

                // 열린 모달들 확인하고 닫기
                const openModals = document.querySelectorAll('.memo-modal, .modal');
                openModals.forEach(modal => {
                    if (modal.style.display !== 'none' && !modal.hasAttribute('aria-hidden')) {
                        modal.style.display = 'none';
                        modal.style.visibility = 'hidden';
                        modal.classList.remove('show', 'active');
                        modal.setAttribute('aria-hidden', 'true');
                        console.log('✅ ESC로 모달 닫힘:', modal.id);
                    }
                });

                document.body.classList.remove('modal-open', 'modal-active');
            }
        });
    }

    // 초기화 함수
    function init() {
        disableXButtonRemoval();
        addCloseButtons();
        enhanceKeyboardSupport();

        // DOM 변경 감시하여 동적으로 추가된 모달에도 닫기 버튼 추가
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    addCloseButtons();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ 닫기 버튼 복원 시스템 초기화 완료');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 페이지 로드 후에도 실행
    window.addEventListener('load', function() {
        setTimeout(init, 500); // 다른 스크립트들이 실행된 후
    });

})();