/**
 * 모달 드래그 이동 시스템
 * 모든 모달 창들에 드래그 이동 기능 제공
 */

(function() {
    'use strict';
    
    console.log('🖱️ 모달 드래그 시스템 초기화');
    
    let isDragging = false;
    let currentModal = null;
    let dragOffset = { x: 0, y: 0 };
    let originalPosition = { x: 0, y: 0 };
    
    // ========== 드래그 가능한 모달 목록 ==========
    const draggableModals = [
        'dateMemoModal',  // 날짜 메모 모달 추가
        'memoModal',
        'themeModal',
        'backupMenuModal',
        'editMemoModal',
        'excelExportModal',
        'scheduleModal',
        'cloudSettingsModal',
        'layoutModal'
    ];
    
    // ========== 모달 드래그 기능 초기화 ==========
    function initModalDrag() {
        // DOM 로드 완료 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupDragHandlers);
        } else {
            setupDragHandlers();
        }
        
        // 동적으로 생성되는 모달들을 위한 MutationObserver
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('modal')) {
                            setupModalDrag(node);
                        }
                        // 자식 노드에서 모달 찾기
                        const modals = node.querySelectorAll && node.querySelectorAll('.modal');
                        if (modals) {
                            modals.forEach(setupModalDrag);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ========== 드래그 핸들러 설정 ==========
    function setupDragHandlers() {
        draggableModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                setupModalDrag(modal);
            }
        });
        
        // 전역 이벤트 리스너
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        
        console.log('✅ 모달 드래그 핸들러 설정 완료');
    }
    
    // ========== 개별 모달 드래그 설정 ==========
    function setupModalDrag(modal) {
        if (!modal || modal.dataset.dragSetup === 'true') return;

        modal.dataset.dragSetup = 'true';

        // 날짜 메모 모달의 경우 특별 처리
        if (modal.id === 'dateMemoModal') {
            setupDateMemoModalDrag(modal);
            return;
        }

        // 모달 컨테이너 위치 설정
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'absolute';
            modalContent.style.cursor = 'move';

            // 드래그 헨들 찾기 (헤더 또는 상단 영역)
            const dragHandle = modalContent.querySelector('.modal-header, .modal-title, h3, h2') || modalContent;

            if (dragHandle) {
                dragHandle.style.cursor = 'move';
                dragHandle.style.userSelect = 'none';

                // 드래그 힌트 추가
                dragHandle.title = '드래그하여 이동';

                // 마우스 이벤트
                dragHandle.addEventListener('mousedown', (e) => startDrag(e, modal, modalContent));

                // 터치 이벤트
                dragHandle.addEventListener('touchstart', (e) => startDrag(e, modal, modalContent), { passive: false });
            }

            // 모달이 화면 밖으로 나가지 않도록 초기 위치 조정
            centerModal(modal, modalContent);
        }
    }

    // ========== 날짜 메모 모달 전용 드래그 설정 ==========
    function setupDateMemoModalDrag(modal) {
        const modalContent = modal.querySelector('.memo-modal-content');
        if (!modalContent) return;

        // 헤더를 드래그 핸들로 사용
        const dragHandle = modal.querySelector('.memo-header');
        if (!dragHandle) return;

        dragHandle.style.cursor = 'move';
        dragHandle.style.userSelect = 'none';
        dragHandle.title = '드래그하여 이동';

        // 마우스 이벤트
        dragHandle.addEventListener('mousedown', (e) => startDateMemoDrag(e, modal, modalContent));

        // 터치 이벤트
        dragHandle.addEventListener('touchstart', (e) => startDateMemoDrag(e, modal, modalContent), { passive: false });

        console.log('✅ 날짜 메모 모달 드래그 설정 완료');
    }

    // ========== 날짜 메모 모달 드래그 시작 ==========
    function startDateMemoDrag(e, modal, modalContent) {
        // 닫기 버튼에서는 드래그 비활성화
        if (e.target.classList.contains('close-btn') || e.target.id === 'closeDateMemo') {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        isDragging = true;
        currentModal = modal;

        // 터치 이벤트와 마우스 이벤트 구분
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // 현재 모달 위치 가져오기
        const rect = modalContent.getBoundingClientRect();
        originalPosition.x = rect.left;
        originalPosition.y = rect.top;

        // 드래그 오프셋 계산
        dragOffset.x = clientX - originalPosition.x;
        dragOffset.y = clientY - originalPosition.y;

        // 드래그 중 스타일 적용
        modalContent.style.transition = 'none';
        modalContent.style.zIndex = '1000010';
        modalContent.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
        modalContent.style.transform = 'scale(1.02)';

        // 커서 변경
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';

        console.log('🖱️ 날짜 메모 모달 드래그 시작');
    }
    
    // ========== 드래그 시작 ==========
    function startDrag(e, modal, modalContent) {
        // 닫기 버튼이나 입력 필드에서는 드래그 비활성화
        if (e.target.classList.contains('close') || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'SELECT') {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        currentModal = modal;
        
        // 터치 이벤트와 마우스 이벤트 구분
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 현재 모달 위치 가져오기
        const rect = modalContent.getBoundingClientRect();
        originalPosition.x = rect.left;
        originalPosition.y = rect.top;
        
        // 드래그 오프셋 계산
        dragOffset.x = clientX - originalPosition.x;
        dragOffset.y = clientY - originalPosition.y;
        
        // 드래그 중 스타일 적용
        modalContent.style.transition = 'none';
        modalContent.style.zIndex = '1000010'; // 다른 모달보다 위로
        modalContent.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
        modalContent.style.transform = 'scale(1.02)';
        
        // 커서 변경
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        
        console.log(`🖱️ 드래그 시작: ${modal.id}`);
    }
    
    // ========== 드래그 중 ==========
    function handleMouseMove(e) {
        if (!isDragging || !currentModal) return;
        
        e.preventDefault();
        updateModalPosition(e.clientX, e.clientY);
    }
    
    function handleTouchMove(e) {
        if (!isDragging || !currentModal) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        updateModalPosition(touch.clientX, touch.clientY);
    }
    
    function updateModalPosition(clientX, clientY) {
        // 날짜 메모 모달 특별 처리
        if (currentModal.id === 'dateMemoModal') {
            updateDateMemoModalPosition(clientX, clientY);
            return;
        }

        const modalContent = currentModal.querySelector('.modal-content');
        if (!modalContent) return;

        // 새 위치 계산
        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        // 화면 경계 제한
        const modalRect = modalContent.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 최소 50px은 화면 안에 있도록
        const minVisible = 50;
        newX = Math.max(-modalRect.width + minVisible, Math.min(windowWidth - minVisible, newX));
        newY = Math.max(0, Math.min(windowHeight - minVisible, newY));

        // 위치 적용
        modalContent.style.left = newX + 'px';
        modalContent.style.top = newY + 'px';
        modalContent.style.right = 'auto';
        modalContent.style.bottom = 'auto';
        modalContent.style.margin = '0';

        // 위치 저장 (모달별로)
        saveModalPosition(currentModal.id, newX, newY);
    }

    // ========== 날짜 메모 모달 위치 업데이트 ==========
    function updateDateMemoModalPosition(clientX, clientY) {
        const modalContent = currentModal.querySelector('.memo-modal-content');
        if (!modalContent) return;

        // 새 위치 계산
        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        // 화면 경계 제한
        const modalRect = modalContent.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 최소 50px은 화면 안에 있도록
        const minVisible = 50;
        newX = Math.max(-modalRect.width + minVisible, Math.min(windowWidth - minVisible, newX));
        newY = Math.max(0, Math.min(windowHeight - minVisible, newY));

        // 위치 적용
        modalContent.style.left = newX + 'px';
        modalContent.style.top = newY + 'px';
        modalContent.style.transform = 'none'; // transform 제거

        // 위치 저장
        saveModalPosition(currentModal.id, newX, newY);
    }
    
    // ========== 드래그 종료 ==========
    function handleMouseUp(e) {
        endDrag();
    }
    
    function handleTouchEnd(e) {
        endDrag();
    }
    
    function endDrag() {
        if (!isDragging || !currentModal) return;
        
        const modalContent = currentModal.querySelector('.modal-content');
        if (modalContent) {
            // 드래그 종료 스타일 복원
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.zIndex = '';
            modalContent.style.boxShadow = '';
            modalContent.style.transform = '';
        }
        
        // 커서 복원
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        console.log(`✅ 드래그 완료: ${currentModal.id}`);
        
        isDragging = false;
        currentModal = null;
        dragOffset = { x: 0, y: 0 };
    }
    
    // ========== 모달 중앙 정렬 ==========
    function centerModal(modal, modalContent) {
        if (!modalContent) return;
        
        // 저장된 위치가 있으면 복원
        const savedPosition = getSavedModalPosition(modal.id);
        if (savedPosition) {
            modalContent.style.position = 'absolute';
            modalContent.style.left = savedPosition.x + 'px';
            modalContent.style.top = savedPosition.y + 'px';
            modalContent.style.right = 'auto';
            modalContent.style.bottom = 'auto';
            modalContent.style.margin = '0';
            return;
        }
        
        // 기본 중앙 정렬
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 모달 크기 추정 (실제로 보이기 전이므로)
        modalContent.style.position = 'absolute';
        modalContent.style.left = '50%';
        modalContent.style.top = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
    }
    
    // ========== 위치 저장/복원 ==========
    function saveModalPosition(modalId, x, y) {
        const positions = JSON.parse(localStorage.getItem('modalPositions') || '{}');
        positions[modalId] = { x: x, y: y, timestamp: Date.now() };
        localStorage.setItem('modalPositions', JSON.stringify(positions));
    }
    
    function getSavedModalPosition(modalId) {
        const positions = JSON.parse(localStorage.getItem('modalPositions') || '{}');
        const position = positions[modalId];
        
        // 7일 이상 된 위치 정보는 무시
        if (position && Date.now() - position.timestamp < 7 * 24 * 60 * 60 * 1000) {
            return { x: position.x, y: position.y };
        }
        
        return null;
    }
    
    // ========== 더블클릭으로 중앙 정렬 ==========
    function setupDoubleClickCenter() {
        document.addEventListener('dblclick', function(e) {
            const modal = e.target.closest('.modal');
            const modalContent = modal?.querySelector('.modal-content');
            
            if (modal && modalContent && modal.style.display !== 'none') {
                // 더블클릭 시 중앙으로 이동
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.left = '50%';
                modalContent.style.top = '50%';
                modalContent.style.transform = 'translate(-50%, -50%)';
                modalContent.style.right = 'auto';
                modalContent.style.bottom = 'auto';
                modalContent.style.margin = '0';
                
                // 저장된 위치 제거
                const positions = JSON.parse(localStorage.getItem('modalPositions') || '{}');
                delete positions[modal.id];
                localStorage.setItem('modalPositions', JSON.stringify(positions));
                
                showNotification('모달이 중앙으로 이동되었습니다', 'info');
            }
        });
    }
    
    // ========== 알림 함수 ==========
    function showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`📢 ${message}`);
        }
    }
    
    // ========== 키보드 단축키 ==========
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl + M: 모든 모달 중앙 정렬
            if (e.ctrlKey && e.code === 'KeyM') {
                e.preventDefault();
                centerAllOpenModals();
                showNotification('모든 열린 모달이 중앙으로 이동되었습니다', 'info');
            }
        });
    }
    
    function centerAllOpenModals() {
        draggableModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            const modalContent = modal?.querySelector('.modal-content');
            
            if (modal && modalContent && (modal.style.display === 'flex' || modal.style.display === 'block')) {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.left = '50%';
                modalContent.style.top = '50%';
                modalContent.style.transform = 'translate(-50%, -50%)';
                modalContent.style.right = 'auto';
                modalContent.style.bottom = 'auto';
                modalContent.style.margin = '0';
            }
        });
    }
    
    // ========== 공개 API ==========
    window.ModalDragSystem = {
        centerModal: centerModal,
        centerAllModals: centerAllOpenModals,
        savePosition: saveModalPosition,
        getSavedPosition: getSavedModalPosition
    };
    
    // ========== 초기화 실행 ==========
    initModalDrag();
    setupDoubleClickCenter();
    setupKeyboardShortcuts();
    
    console.log('✅ 모달 드래그 시스템 초기화 완료');
    
})();