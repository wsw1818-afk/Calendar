/**
 * 통합 모달 매니저
 * 모든 모달 관련 기능을 중앙에서 관리하는 유틸리티
 * 중복 코드 제거 및 일관된 모달 처리를 위한 리팩터링 버전
 */

(function() {
    'use strict';

    // ===== 상수 정의 =====
    const MODAL_CONFIG = {
        SELECTORS: {
            MODAL: '[id*="modal"], [class*="modal"], [class*="overlay"]',
            SHOW_CLASS: '.show-modal',
            HIGH_Z_INDEX: '*',
            BACKDROP: 'div[style*="background"], div[style*="rgba"], .backdrop'
        },
        STYLES: {
            HIDDEN: {
                display: 'none',
                visibility: 'hidden',
                opacity: '0',
                pointerEvents: 'none'
            },
            VISIBLE: {
                display: 'block',
                visibility: 'visible',
                opacity: '1',
                pointerEvents: 'auto'
            }
        },
        Z_INDEX_THRESHOLD: 1000,
        OBSERVER_CONFIG: {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        }
    };

    // ===== 유틸리티 함수 =====
    const Utils = {
        /**
         * 요소에 스타일 적용
         */
        applyStyles(element, styles) {
            if (!element) return;
            Object.entries(styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        },

        /**
         * 요소가 모달인지 확인
         */
        isModalElement(element) {
            if (!element || element.nodeType !== 1) return false;

            const id = element.id || '';
            const className = element.className || '';

            return id.includes('modal') ||
                   className.includes('modal') ||
                   className.includes('overlay');
        },

        /**
         * 높은 z-index를 가진 요소인지 확인
         */
        hasHighZIndex(element) {
            const zIndex = parseInt(window.getComputedStyle(element).zIndex) || 0;
            return zIndex > MODAL_CONFIG.Z_INDEX_THRESHOLD;
        },

        /**
         * 디버그 로그
         */
        log(message, ...args) {
            console.log(`[Modal Manager] ${message}`, ...args);
        }
    };

    // ===== 모달 제어 클래스 =====
    class ModalManager {
        constructor() {
            this.observer = null;
            this.preventionActive = false;
            this.allowedModals = new Set();
        }

        /**
         * 모든 모달 숨기기
         */
        hideAllModals() {
            let count = 0;

            // 1. 모달 셀렉터로 찾기
            const modals = document.querySelectorAll(MODAL_CONFIG.SELECTORS.MODAL);
            modals.forEach(modal => {
                if (!this.allowedModals.has(modal.id)) {
                    Utils.applyStyles(modal, MODAL_CONFIG.STYLES.HIDDEN);
                    modal.classList.remove('show-modal', 'show');
                    count++;
                }
            });

            // 2. show-modal 클래스 제거
            const showModals = document.querySelectorAll(MODAL_CONFIG.SELECTORS.SHOW_CLASS);
            showModals.forEach(modal => {
                if (!this.allowedModals.has(modal.id)) {
                    modal.classList.remove('show-modal');
                    Utils.applyStyles(modal, MODAL_CONFIG.STYLES.HIDDEN);
                    count++;
                }
            });

            // 3. 높은 z-index 요소 처리
            const allElements = document.querySelectorAll(MODAL_CONFIG.SELECTORS.HIGH_Z_INDEX);
            allElements.forEach(el => {
                if (Utils.hasHighZIndex(el) && !this.allowedModals.has(el.id)) {
                    Utils.applyStyles(el, MODAL_CONFIG.STYLES.HIDDEN);
                    count++;
                }
            });

            Utils.log(`숨긴 모달 수: ${count}`);
            return count;
        }

        /**
         * 특정 모달 표시
         */
        showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                Utils.log(`모달을 찾을 수 없음: ${modalId}`);
                return false;
            }

            Utils.applyStyles(modal, MODAL_CONFIG.STYLES.VISIBLE);
            modal.classList.add('show-modal');
            this.allowedModals.add(modalId);

            Utils.log(`모달 표시됨: ${modalId}`);
            return true;
        }

        /**
         * 특정 모달 숨기기
         */
        hideModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                Utils.log(`모달을 찾을 수 없음: ${modalId}`);
                return false;
            }

            Utils.applyStyles(modal, MODAL_CONFIG.STYLES.HIDDEN);
            modal.classList.remove('show-modal');
            this.allowedModals.delete(modalId);

            Utils.log(`모달 숨김: ${modalId}`);
            return true;
        }

        /**
         * DOM 변화 감지 시작
         */
        startPrevention() {
            if (this.preventionActive) return;

            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (Utils.isModalElement(node) && !this.allowedModals.has(node.id)) {
                            Utils.applyStyles(node, MODAL_CONFIG.STYLES.HIDDEN);
                            Utils.log(`자동 차단: ${node.id || node.className}`);
                        }
                    });
                });
            });

            this.observer.observe(document.body, MODAL_CONFIG.OBSERVER_CONFIG);
            this.preventionActive = true;
            Utils.log('모달 방지 시스템 시작');
        }

        /**
         * DOM 변화 감지 중지
         */
        stopPrevention() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.preventionActive = false;
            Utils.log('모달 방지 시스템 중지');
        }

        /**
         * 모달 토글
         */
        toggleModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return false;

            const isVisible = modal.style.display !== 'none' &&
                            modal.style.visibility !== 'hidden';

            return isVisible ? this.hideModal(modalId) : this.showModal(modalId);
        }

        /**
         * 허용된 모달 목록 초기화
         */
        clearAllowedModals() {
            this.allowedModals.clear();
            Utils.log('허용된 모달 목록 초기화됨');
        }
    }

    // ===== 날짜 메모 모달 관리 클래스 =====
    class DateMemoModalManager {
        constructor(modalManager) {
            this.modalManager = modalManager;
            this.modalId = 'dateMemoModal';
        }

        /**
         * 메모 모달 생성 또는 재생성
         */
        createModal() {
            // 기존 모달 제거
            const existing = document.getElementById(this.modalId);
            if (existing) {
                existing.remove();
            }

            const modal = document.createElement('div');
            modal.id = this.modalId;
            modal.className = 'modal';
            modal.innerHTML = this.getModalTemplate();

            document.body.appendChild(modal);
            this.attachEventListeners(modal);

            Utils.log('날짜 메모 모달 생성됨');
            return modal;
        }

        /**
         * 모달 템플릿
         */
        getModalTemplate() {
            return `
                <div class="modal-content" style="${this.getModalContentStyles()}">
                    <div class="modal-header" style="${this.getModalHeaderStyles()}">
                        <h3 id="modalDateTitle" style="margin: 0;"></h3>
                        <span class="close" style="${this.getCloseButtonStyles()}">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div id="dateMemoList" style="margin-bottom: 20px;"></div>
                        <div>
                            <textarea id="newMemoText"
                                placeholder="새 메모를 입력하세요..."
                                style="${this.getTextareaStyles()}"></textarea>
                            <div style="margin-top: 10px; text-align: right;">
                                <button id="saveMemoBtn" style="${this.getSaveButtonStyles()}">저장</button>
                                <button id="cancelMemoBtn" style="${this.getCancelButtonStyles()}">취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * 스타일 정의 메서드들
         */
        getModalContentStyles() {
            return `
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 500px;
                border-radius: 10px;
                position: relative;
            `.replace(/\s+/g, ' ').trim();
        }

        getModalHeaderStyles() {
            return `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            `.replace(/\s+/g, ' ').trim();
        }

        getCloseButtonStyles() {
            return `
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            `.replace(/\s+/g, ' ').trim();
        }

        getTextareaStyles() {
            return `
                width: 100%;
                min-height: 100px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                resize: vertical;
                font-family: inherit;
            `.replace(/\s+/g, ' ').trim();
        }

        getSaveButtonStyles() {
            return `
                background-color: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 5px;
            `.replace(/\s+/g, ' ').trim();
        }

        getCancelButtonStyles() {
            return `
                background-color: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            `.replace(/\s+/g, ' ').trim();
        }

        /**
         * 이벤트 리스너 연결
         */
        attachEventListeners(modal) {
            const closeBtn = modal.querySelector('.close');
            const cancelBtn = modal.querySelector('#cancelMemoBtn');
            const saveBtn = modal.querySelector('#saveMemoBtn');

            const closeModal = () => {
                this.modalManager.hideModal(this.modalId);
            };

            if (closeBtn) closeBtn.onclick = closeModal;
            if (cancelBtn) cancelBtn.onclick = closeModal;
            if (saveBtn) saveBtn.onclick = () => this.saveMemo();

            // 모달 외부 클릭시 닫기
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        /**
         * 메모 저장
         */
        saveMemo() {
            const textArea = document.getElementById('newMemoText');
            const modalTitle = document.getElementById('modalDateTitle');

            if (!textArea || !modalTitle) return;

            const text = textArea.value.trim();
            if (!text) return;

            const titleText = modalTitle.textContent;
            const dateMatch = titleText.match(/(\d+)년 (\d+)월 (\d+)일/);

            if (!dateMatch) return;

            const year = dateMatch[1];
            const month = dateMatch[2].padStart(2, '0');
            const day = dateMatch[3].padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            const memos = JSON.parse(localStorage.getItem('dateMemos') || '{}');
            if (!memos[dateKey]) {
                memos[dateKey] = [];
            }

            memos[dateKey].push({
                text: text,
                time: new Date().toLocaleString('ko-KR')
            });

            localStorage.setItem('dateMemos', JSON.stringify(memos));
            textArea.value = '';

            // 모달 새로고침
            this.openDateMemoModal(parseInt(year), parseInt(month), parseInt(day));
            Utils.log('메모 저장 완료');
        }

        /**
         * 날짜 메모 모달 열기
         */
        openDateMemoModal(year, month, day) {
            let modal = document.getElementById(this.modalId);
            if (!modal) {
                modal = this.createModal();
            }

            const modalTitle = document.getElementById('modalDateTitle');
            const dateMemoList = document.getElementById('dateMemoList');

            if (modalTitle) {
                modalTitle.textContent = `${year}년 ${month}월 ${day}일 메모`;
            }

            if (dateMemoList) {
                this.loadMemos(dateMemoList, year, month, day);
            }

            // 클릭 위치에 모달 배치
            this.positionModal(modal);

            // 모달 표시
            this.modalManager.showModal(this.modalId);
        }

        /**
         * 메모 로드
         */
        loadMemos(container, year, month, day) {
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const memos = JSON.parse(localStorage.getItem('dateMemos') || '{}');
            const dayMemos = memos[dateKey] || [];

            container.innerHTML = '';

            if (dayMemos.length === 0) {
                container.innerHTML = '<p style="color: #6c757d; text-align: center;">저장된 메모가 없습니다.</p>';
            } else {
                dayMemos.forEach((memo, index) => {
                    const memoDiv = document.createElement('div');
                    memoDiv.style.cssText = `
                        margin-bottom: 10px;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 5px;
                        border-left: 3px solid #007bff;
                    `.replace(/\s+/g, ' ').trim();

                    memoDiv.innerHTML = `
                        <div style="margin-bottom: 5px;">${memo.text}</div>
                        <small style="color: #6c757d;">${memo.time}</small>
                        <button onclick="window.modalManager.deleteMemo('${dateKey}', ${index})"
                            style="float: right; background: #dc3545; color: white;
                                   border: none; padding: 2px 8px; border-radius: 3px;
                                   cursor: pointer;">삭제</button>
                    `;
                    container.appendChild(memoDiv);
                });
            }
        }

        /**
         * 모달 위치 설정
         */
        positionModal(modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (window._lastClickPosition && modalContent) {
                const { x, y } = window._lastClickPosition;
                modalContent.style.position = 'fixed';
                modalContent.style.margin = '0';
                modalContent.style.left = `${Math.min(x, window.innerWidth - 520)}px`;
                modalContent.style.top = `${Math.min(y, window.innerHeight - 300)}px`;
            }
        }

        /**
         * 메모 삭제
         */
        deleteMemo(dateKey, index) {
            const memos = JSON.parse(localStorage.getItem('dateMemos') || '{}');

            if (memos[dateKey]) {
                memos[dateKey].splice(index, 1);
                if (memos[dateKey].length === 0) {
                    delete memos[dateKey];
                }
                localStorage.setItem('dateMemos', JSON.stringify(memos));

                // 모달 새로고침
                const [year, month, day] = dateKey.split('-').map(Number);
                this.openDateMemoModal(year, month, day);
            }
        }
    }

    // ===== 전역 인스턴스 생성 및 노출 =====
    const modalManager = new ModalManager();
    const dateMemoManager = new DateMemoModalManager(modalManager);

    // 전역 함수로 노출
    window.modalManager = {
        // 기본 모달 관리
        hideAll: () => modalManager.hideAllModals(),
        show: (id) => modalManager.showModal(id),
        hide: (id) => modalManager.hideModal(id),
        toggle: (id) => modalManager.toggleModal(id),

        // 방지 시스템
        startPrevention: () => modalManager.startPrevention(),
        stopPrevention: () => modalManager.stopPrevention(),

        // 날짜 메모 관리
        openDateMemo: (year, month, day) => dateMemoManager.openDateMemoModal(year, month, day),
        deleteMemo: (dateKey, index) => dateMemoManager.deleteMemo(dateKey, index),

        // 유틸리티
        clearAllowed: () => modalManager.clearAllowedModals()
    };

    // 기존 함수들과의 호환성을 위한 별칭
    window.blockModalOverlay = window.modalManager.hideAll;
    window.preventModalOverlay = window.modalManager.hideAll;
    window.emergencyOverlayRemover = window.modalManager.hideAll;
    window.clearAllOverlays = window.modalManager.hideAll;
    window.openDateMemoModal = window.modalManager.openDateMemo;

    console.log('✅ 통합 모달 매니저 초기화 완료');
    console.log('사용 가능한 명령어:');
    console.log('- modalManager.hideAll() : 모든 모달 숨기기');
    console.log('- modalManager.show(id) : 특정 모달 표시');
    console.log('- modalManager.hide(id) : 특정 모달 숨기기');
    console.log('- modalManager.openDateMemo(year, month, day) : 날짜 메모 열기');

})();