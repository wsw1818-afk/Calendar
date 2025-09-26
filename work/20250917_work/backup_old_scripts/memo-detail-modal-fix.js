// 메모 상세 모달 수정 스크립트
(function() {
    'use strict';

    console.log('메모 상세 모달 수정 스크립트 로드됨');

    // DOM이 완전히 로드된 후 실행
    function initMemoDetailFix() {
        console.log('메모 상세 모달 수정 초기화');

        // 기존 openMemoDetail 함수를 개선된 버전으로 교체
        window.openMemoDetail = function(id) {
            console.log('openMemoDetail 호출됨, ID:', id);
            
            // 메모 데이터 찾기 (여러 변수명 시도)
            let memos = window.memos || window.allMemos || [];
            
            // localStorage에서 메모 데이터 가져오기 (fallback)
            if (!memos || memos.length === 0) {
                try {
                    const stored = localStorage.getItem('memos');
                    if (stored) {
                        memos = JSON.parse(stored);
                        console.log('localStorage에서 메모 데이터를 불러왔습니다:', memos.length, '개');
                    }
                } catch (e) {
                    console.error('localStorage에서 메모 데이터 불러오기 실패:', e);
                }
            }
            
            const memo = memos.find(m => m.id == id); // == 사용 (타입 변환 허용)
            if (!memo) {
                console.error('메모를 찾을 수 없습니다. ID:', id);
                console.log('사용 가능한 메모들:', memos);
                alert('메모를 찾을 수 없습니다. 페이지를 새로고침 해보세요.');
                return;
            }

            console.log('메모 찾음:', memo);

            // currentMemoId 설정
            window.currentMemoId = id;
            
            // 상세 모달에 내용 채우기
            const titleElement = document.getElementById('memoDetailTitle');
            const dateElement = document.getElementById('memoDetailDate');
            const bodyElement = document.getElementById('memoDetailBody');
            
            if (!titleElement || !dateElement || !bodyElement) {
                console.error('메모 상세 모달 요소를 찾을 수 없습니다.');
                return;
            }

            titleElement.textContent = memo.title || '제목 없음';
            dateElement.textContent = `📅 ${memo.date}`;
            bodyElement.textContent = memo.content || '내용 없음';
            
            console.log('모달 내용 설정 완료');
            
            // 상세 모달 가져오기
            const memoDetailModal = document.getElementById('memoDetailModal');
            if (!memoDetailModal) {
                console.error('memoDetailModal 요소를 찾을 수 없습니다.');
                return;
            }

            console.log('모달 요소 찾음');

            // 모달 내용 컨테이너
            const modalContent = memoDetailModal.querySelector('.memo-modal-content');
            if (!modalContent) {
                console.error('memo-modal-content 요소를 찾을 수 없습니다.');
                return;
            }

            // 기존 위치 스타일 초기화
            modalContent.style.position = '';
            modalContent.style.left = '';
            modalContent.style.top = '';
            modalContent.style.margin = 'auto';
            modalContent.style.transform = '';

            // 모달 배경 스타일 설정
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

            // 모달 내용 스타일 설정
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

            // 애니메이션 CSS 추가 (한 번만)
            if (!document.querySelector('#memo-detail-modal-styles')) {
                const styles = document.createElement('style');
                styles.id = 'memo-detail-modal-styles';
                styles.textContent = `
                    @keyframes modalFadeIn {
                        from { 
                            opacity: 0; 
                            transform: scale(0.8);
                        }
                        to { 
                            opacity: 1; 
                            transform: scale(1);
                        }
                    }
                    
                    #memoDetailModal .memo-detail-content {
                        margin-top: 20px;
                    }
                    
                    #memoDetailModal .memo-detail-date {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 15px;
                        padding: 8px 12px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        border-left: 3px solid #667eea;
                    }
                    
                    #memoDetailModal .memo-detail-body {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        padding: 15px;
                        background: #fafafa;
                        border-radius: 8px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        min-height: 100px;
                        border: 1px solid #e9ecef;
                    }
                    
                    #memoDetailModal .memo-detail-actions {
                        display: flex;
                        gap: 10px;
                        justify-content: flex-end;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                    }
                    
                    #memoDetailModal .btn-primary {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    }
                    
                    #memoDetailModal .btn-primary:hover {
                        background: #5a6fd8;
                        transform: translateY(-1px);
                    }
                    
                    #memoDetailModal .btn-secondary {
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    }
                    
                    #memoDetailModal .btn-secondary:hover {
                        background: #c82333;
                        transform: translateY(-1px);
                    }
                    
                    #memoDetailModal .close-btn {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #999;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.2s;
                    }
                    
                    #memoDetailModal .close-btn:hover {
                        background: #f5f5f5;
                        color: #333;
                    }

                    /* 다크모드 대응 */
                    [data-theme="dark"] #memoDetailModal .memo-modal-content {
                        background: #2d3748 !important;
                        color: white;
                    }
                    
                    [data-theme="dark"] #memoDetailModal .memo-detail-date {
                        background: #4a5568;
                        color: #e2e8f0;
                    }
                    
                    [data-theme="dark"] #memoDetailModal .memo-detail-body {
                        background: #4a5568;
                        color: #e2e8f0;
                        border-color: #667eea;
                    }
                    
                    [data-theme="dark"] #memoDetailModal .close-btn:hover {
                        background: #4a5568;
                        color: white;
                    }
                `;
                document.head.appendChild(styles);
            }

            console.log('모달 표시 시작');
            
            // 상세 모달 표시
            memoDetailModal.style.display = 'flex';
            
            console.log('모달 표시 완료');

            // ESC 키로 모달 닫기
            function handleEscKey(e) {
                if (e.key === 'Escape') {
                    closeMemoDetail();
                    document.removeEventListener('keydown', handleEscKey);
                }
            }
            document.addEventListener('keydown', handleEscKey);

            // 모달 외부 클릭으로 닫기
            memoDetailModal.onclick = function(e) {
                if (e.target === memoDetailModal) {
                    closeMemoDetail();
                }
            };
        };

        // closeMemoDetail 함수 개선
        window.closeMemoDetail = function() {
            console.log('closeMemoDetail 호출됨');
            
            const memoDetailModal = document.getElementById('memoDetailModal');
            if (memoDetailModal) {
                memoDetailModal.style.display = 'none';
                memoDetailModal.onclick = null;
            }
            
            window.currentMemoId = null;
            console.log('모달 닫기 완료');
        };

        // 버튼 이벤트 바인딩
        bindModalButtons();
    }

    function bindModalButtons() {
        // 닫기 버튼
        const closeBtn = document.getElementById('closeMemoDetail');
        if (closeBtn) {
            closeBtn.onclick = window.closeMemoDetail;
            console.log('닫기 버튼 바인딩 완료');
        }

        // 편집 버튼
        const editBtn = document.getElementById('editMemoBtn');
        if (editBtn) {
            editBtn.onclick = function() {
                if (window.editMemo) {
                    window.editMemo();
                } else {
                    console.warn('editMemo 함수가 정의되지 않았습니다.');
                }
            };
            console.log('편집 버튼 바인딩 완료');
        }

        // 삭제 버튼
        const deleteBtn = document.getElementById('deleteMemoBtn');
        if (deleteBtn) {
            deleteBtn.onclick = function() {
                if (window.currentMemoId) {
                    if (confirm('이 메모를 삭제하시겠습니까?')) {
                        // 메모 삭제 함수 찾기 (여러 가능성 시도)
                        const deleteFunc = window.deleteMemo || window.deleteMemoFromList || window.removeMemo;
                        if (deleteFunc) {
                            deleteFunc(window.currentMemoId);
                            window.closeMemoDetail();
                            
                            // 달력 및 리스트 업데이트
                            setTimeout(() => {
                                if (window.updateCalendarDisplay) window.updateCalendarDisplay();
                                if (window.displayStickyMemos) window.displayStickyMemos();
                                if (window.updateMemoList) window.updateMemoList();
                            }, 100);
                            
                            console.log('메모 삭제 완료');
                        } else {
                            console.warn('메모 삭제 함수를 찾을 수 없습니다.');
                            alert('메모 삭제 기능을 사용할 수 없습니다.');
                        }
                    }
                }
            };
            console.log('삭제 버튼 바인딩 완료');
        }
    }

    // 페이지 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMemoDetailFix);
    } else {
        initMemoDetailFix();
    }

    // 1초 후 추가 초기화 (기존 스크립트와의 충돌 방지)
    setTimeout(initMemoDetailFix, 1000);

})();