// 메모 클릭 이벤트 수정 스크립트
(function() {
    'use strict';

    console.log('메모 클릭 이벤트 수정 스크립트 로드됨');

    // 이벤트 위임을 사용하여 동적으로 생성된 메모 아이템에 클릭 이벤트 바인딩
    function setupMemoClickEvents() {
        console.log('메모 클릭 이벤트 설정 시작');

        // 전역 클릭 이벤트 위임
        document.addEventListener('click', function(event) {
            // 메모 아이템 클릭 확인
            const memoItem = event.target.closest('.memo-item');
            if (!memoItem) return;

            // 삭제 버튼 클릭이면 무시
            if (event.target.closest('.memo-item-delete')) {
                console.log('삭제 버튼 클릭으로 메모 상세 보기 취소됨');
                return;
            }

            // onclick 속성에서 메모 ID 추출
            const onclickValue = memoItem.getAttribute('onclick');
            if (!onclickValue) {
                console.warn('메모 아이템에 onclick 속성이 없습니다:', memoItem);
                return;
            }

            // openMemoDetail(123) 형태에서 ID 추출
            const match = onclickValue.match(/openMemoDetail\((\d+)\)/);
            if (!match) {
                console.warn('onclick 속성에서 메모 ID를 찾을 수 없습니다:', onclickValue);
                return;
            }

            const memoId = parseInt(match[1]);
            console.log('메모 아이템 클릭됨, ID:', memoId);

            // 메모 상세보기 호출
            if (window.openMemoDetail) {
                event.preventDefault();
                event.stopPropagation();
                console.log('openMemoDetail 함수 호출 시도');
                window.openMemoDetail(memoId);
            } else {
                console.error('openMemoDetail 함수가 정의되지 않았습니다.');
                alert('메모를 열 수 없습니다. 페이지를 새로고침 해보세요.');
            }
        });

        console.log('메모 클릭 이벤트 설정 완료');
    }

    // 메모 리스트 업데이트 함수들을 재정의하여 클릭 이벤트가 제대로 동작하도록 보장
    function enhanceMemoListFunctions() {
        console.log('메모 리스트 함수 개선 시작');

        // 원래 함수들을 백업
        const originalDisplayStickyMemos = window.displayStickyMemos;
        const originalDisplayDateMemos = window.displayDateMemos;
        const originalUpdateMemoList = window.updateMemoList;

        // displayStickyMemos 함수 개선
        if (originalDisplayStickyMemos) {
            window.displayStickyMemos = function() {
                console.log('displayStickyMemos 호출됨 (개선된 버전)');
                originalDisplayStickyMemos.apply(this, arguments);
                
                // 메모 아이템에 추가 이벤트 바인딩
                setTimeout(() => {
                    bindMemoItemEvents('#stickyMemoList');
                }, 100);
            };
        }

        // displayDateMemos 함수 개선
        if (originalDisplayDateMemos) {
            window.displayDateMemos = function() {
                console.log('displayDateMemos 호출됨 (개선된 버전)');
                originalDisplayDateMemos.apply(this, arguments);
                
                // 메모 아이템에 추가 이벤트 바인딩
                setTimeout(() => {
                    bindMemoItemEvents('#dateMemoList');
                }, 100);
            };
        }

        // updateMemoList 함수 개선
        if (originalUpdateMemoList) {
            window.updateMemoList = function() {
                console.log('updateMemoList 호출됨 (개선된 버전)');
                originalUpdateMemoList.apply(this, arguments);
                
                // 메모 아이템에 추가 이벤트 바인딩
                setTimeout(() => {
                    bindMemoItemEvents('#memoList');
                }, 100);
            };
        }

        console.log('메모 리스트 함수 개선 완료');
    }

    // 특정 메모 리스트의 아이템들에 이벤트 바인딩
    function bindMemoItemEvents(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn('메모 리스트 컨테이너를 찾을 수 없습니다:', containerSelector);
            return;
        }

        const memoItems = container.querySelectorAll('.memo-item');
        console.log(`${containerSelector}에서 ${memoItems.length}개의 메모 아이템 발견`);

        memoItems.forEach((item, index) => {
            // 이미 이벤트가 바인딩되었는지 확인
            if (item.dataset.clickBound) return;

            // 직접 클릭 이벤트 바인딩 (fallback)
            item.addEventListener('click', function(event) {
                // 삭제 버튼 클릭이면 무시
                if (event.target.closest('.memo-item-delete')) return;

                const onclickValue = this.getAttribute('onclick');
                if (onclickValue) {
                    const match = onclickValue.match(/openMemoDetail\((\d+)\)/);
                    if (match) {
                        const memoId = parseInt(match[1]);
                        console.log(`직접 바인딩된 클릭 이벤트 - 메모 ID: ${memoId}`);
                        
                        if (window.openMemoDetail) {
                            event.preventDefault();
                            event.stopPropagation();
                            window.openMemoDetail(memoId);
                        }
                    }
                }
            });

            // 마우스 오버 효과 추가
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });

            // 바인딩 완료 표시
            item.dataset.clickBound = 'true';
        });
    }

    // 메모 리스트를 주기적으로 검사하여 새로 생성된 아이템에 이벤트 바인딩
    function startMemoListWatcher() {
        console.log('메모 리스트 감시 시작');

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 새로 추가된 노드들 중에서 메모 아이템이 있는지 확인
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 메모 아이템이 직접 추가되었거나
                            if (node.classList && node.classList.contains('memo-item')) {
                                console.log('새로운 메모 아이템 감지됨');
                                bindSingleMemoItem(node);
                            }
                            // 메모 아이템을 포함하는 컨테이너가 업데이트되었거나
                            else {
                                const memoItems = node.querySelectorAll && node.querySelectorAll('.memo-item');
                                if (memoItems && memoItems.length > 0) {
                                    console.log(`새로운 메모 아이템들 ${memoItems.length}개 감지됨`);
                                    memoItems.forEach(bindSingleMemoItem);
                                }
                            }
                        }
                    });
                }
            });
        });

        // 메모 리스트 컨테이너들을 감시
        const containers = ['#stickyMemoList', '#dateMemoList', '#memoList'];
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
                console.log(`${selector} 컨테이너 감시 시작`);
            }
        });
    }

    // 단일 메모 아이템에 이벤트 바인딩
    function bindSingleMemoItem(item) {
        if (!item || item.dataset.clickBound) return;

        item.addEventListener('click', function(event) {
            // 삭제 버튼 클릭이면 무시
            if (event.target.closest('.memo-item-delete')) return;

            const onclickValue = this.getAttribute('onclick');
            if (onclickValue) {
                const match = onclickValue.match(/openMemoDetail\((\d+)\)/);
                if (match) {
                    const memoId = parseInt(match[1]);
                    console.log(`신규 바인딩 클릭 이벤트 - 메모 ID: ${memoId}`);
                    
                    if (window.openMemoDetail) {
                        event.preventDefault();
                        event.stopPropagation();
                        window.openMemoDetail(memoId);
                    } else {
                        console.error('openMemoDetail 함수를 찾을 수 없습니다.');
                    }
                }
            }
        });

        // 바인딩 완료 표시
        item.dataset.clickBound = 'true';
        console.log('메모 아이템 이벤트 바인딩 완료');
    }

    // openMemoDetail 함수가 정의되기를 기다림
    function waitForOpenMemoDetail(callback) {
        if (window.openMemoDetail) {
            console.log('openMemoDetail 함수 발견됨');
            callback();
        } else {
            console.log('openMemoDetail 함수 대기 중...');
            setTimeout(() => waitForOpenMemoDetail(callback), 100);
        }
    }

    // 초기화 함수
    function initialize() {
        console.log('메모 클릭 수정 스크립트 초기화');
        
        // openMemoDetail 함수가 로드되기를 기다림
        waitForOpenMemoDetail(() => {
            // 메모 클릭 이벤트 설정
            setupMemoClickEvents();
            
            // 메모 리스트 함수들 개선
            enhanceMemoListFunctions();
            
            // 기존 메모 아이템들에 이벤트 바인딩
            setTimeout(() => {
                bindMemoItemEvents('#stickyMemoList');
                bindMemoItemEvents('#dateMemoList'); 
                bindMemoItemEvents('#memoList');
            }, 500);
            
            // 메모 리스트 감시 시작
            setTimeout(() => {
                startMemoListWatcher();
            }, 1000);
        });
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 추가 지연 초기화 (기존 스크립트와의 충돌 방지)
    setTimeout(initialize, 1500);

})();