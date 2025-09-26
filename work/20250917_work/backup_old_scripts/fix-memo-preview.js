/**
 * 메모 X 버튼 문제 수정 및 첨부파일 미리보기
 */

(function() {
    'use strict';
    
    console.log('🔧 메모 미리보기 수정 스크립트 시작');
    
    // X 버튼을 숨기고 첨부파일 아이콘 클릭 시 미리보기 표시
    function fixMemoDisplay() {
        // 모든 메모 항목 찾기
        const memoItems = document.querySelectorAll('.memo-item, .date-memo-item, [class*="memo"]');
        
        memoItems.forEach(item => {
            // X 버튼 찾아서 숨기기
            const closeButtons = item.querySelectorAll('button[onclick*="delete"], button.close, button:contains("×"), button:contains("X")');
            closeButtons.forEach(btn => {
                if (btn.textContent.trim() === '×' || btn.textContent.trim() === 'X' || btn.textContent.trim() === 'x') {
                    btn.style.display = 'none';
                    console.log('❌ X 버튼 숨김');
                }
            });
            
            // 빨간색 X 버튼 스타일 제거
            const redButtons = item.querySelectorAll('button[style*="background"][style*="red"], button[style*="background-color"][style*="red"], button[style*="background: red"], button[style*="background-color: red"]');
            redButtons.forEach(btn => {
                if (btn.textContent.trim() === '×' || btn.textContent.trim() === 'X') {
                    btn.style.display = 'none';
                }
            });
        });
        
        // 첨부파일 아이콘 찾아서 클릭 이벤트 추가
        const attachmentIcons = document.querySelectorAll('span:contains("📎"), span:contains("📄"), [class*="attachment"]');
        attachmentIcons.forEach(icon => {
            if (!icon.dataset.previewEnabled) {
                icon.style.cursor = 'pointer';
                icon.title = '클릭하여 첨부파일 미리보기';
                icon.dataset.previewEnabled = 'true';
                
                icon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showAttachmentList(icon);
                });
            }
        });
    }
    
    // 첨부파일 목록 표시
    function showAttachmentList(icon) {
        // 메모 컨테이너 찾기
        const memoContainer = icon.closest('.memo-item, .date-memo-item, [class*="memo"]');
        if (!memoContainer) return;
        
        // 메모 제목이나 ID 찾기
        const titleElem = memoContainer.querySelector('.memo-title, h3, h4, strong');
        const memoTitle = titleElem ? titleElem.textContent : 'Unknown';
        
        console.log('📎 첨부파일 목록 표시:', memoTitle);
        
        // IndexedDB에서 첨부파일 검색
        const request = indexedDB.open('DemoDatabase', 2);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('attachments')) {
                alert('첨부파일이 없습니다.');
                return;
            }
            
            const transaction = db.transaction(['attachments'], 'readonly');
            const objectStore = transaction.objectStore('attachments');
            const getAllRequest = objectStore.getAll();
            
            getAllRequest.onsuccess = function(event) {
                const attachments = event.target.result;
                
                // 해당 메모의 첨부파일 필터링
                const memoAttachments = attachments.filter(att => 
                    att.memoId === memoTitle || 
                    att.fileName?.includes(memoTitle) ||
                    attachments.length === 1  // 첨부파일이 하나뿐이면 표시
                );
                
                if (memoAttachments.length > 0) {
                    displayAttachments(memoAttachments);
                } else if (attachments.length > 0) {
                    // 메모 ID 매칭이 안되면 모든 첨부파일 표시
                    displayAttachments(attachments);
                } else {
                    alert('첨부파일이 없습니다.');
                }
            };
        };
    }
    
    // 첨부파일 표시
    function displayAttachments(attachments) {
        // 기존 미리보기 제거
        const existing = document.getElementById('attachmentListModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'attachmentListModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        let content = '<h3 style="margin-top: 0;">📎 첨부파일 목록</h3>';
        content += '<div style="margin-top: 10px;">';
        
        attachments.forEach(att => {
            const fileName = att.fileName || 'unknown';
            const fileType = att.type || 'application/octet-stream';
            
            content += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;">
                    <span>${getFileIcon(fileType)} ${fileName}</span>
                    <button onclick="showSingleAttachment('${fileName}')" style="padding: 4px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        👁️ 미리보기
                    </button>
                </div>
            `;
        });
        
        content += '</div>';
        content += `<button onclick="document.getElementById('attachmentListModal').remove()" style="margin-top: 10px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>`;
        
        modal.innerHTML = content;
        document.body.appendChild(modal);
    }
    
    // 파일 아이콘 가져오기
    function getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎬';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('text')) return '📝';
        if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
        return '📎';
    }
    
    // 단일 첨부파일 미리보기
    window.showSingleAttachment = function(fileName) {
        const request = indexedDB.open('DemoDatabase', 2);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['attachments'], 'readonly');
            const objectStore = transaction.objectStore('attachments');
            const getRequest = objectStore.get(fileName);
            
            getRequest.onsuccess = function(event) {
                const attachment = event.target.result;
                if (attachment && attachment.data) {
                    // 리스트 모달 닫기
                    const listModal = document.getElementById('attachmentListModal');
                    if (listModal) listModal.remove();
                    
                    // 미리보기 표시
                    displayPreview(attachment);
                }
            };
        };
    };
    
    // 미리보기 표시
    function displayPreview(attachment) {
        const blob = new Blob([attachment.data], { type: attachment.type });
        const url = URL.createObjectURL(blob);
        
        const modal = document.createElement('div');
        modal.id = 'attachmentPreview';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        let content = '';
        const fileType = attachment.type || '';
        
        if (fileType.startsWith('image/')) {
            content = `<img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
        } else if (fileType.startsWith('video/')) {
            content = `<video src="${url}" controls style="max-width: 90%; max-height: 90%;"></video>`;
        } else if (fileType.startsWith('audio/')) {
            content = `<audio src="${url}" controls style="background: white; padding: 20px; border-radius: 8px;"></audio>`;
        } else if (fileType === 'application/pdf') {
            content = `<iframe src="${url}" style="width: 90vw; height: 90vh; border: none; background: white;"></iframe>`;
        } else {
            content = `
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>${attachment.fileName}</h3>
                    <p>미리보기를 지원하지 않는 파일 형식입니다.</p>
                    <button onclick="downloadFile('${url}', '${attachment.fileName}')" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">다운로드</button>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div style="position: relative;">
                ${content}
                <button onclick="document.getElementById('attachmentPreview').remove()" style="position: absolute; top: -40px; right: 0; background: white; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 16px;">✕ 닫기</button>
            </div>
        `;
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
    
    // 파일 다운로드
    window.downloadFile = function(url, fileName) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    };
    
    // DOM 변경 감지
    const observer = new MutationObserver(function(mutations) {
        fixMemoDisplay();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
    
    // 초기 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixMemoDisplay);
    } else {
        fixMemoDisplay();
    }
    
    // 주기적 체크
    setInterval(fixMemoDisplay, 1000);
    
    console.log('✅ 메모 미리보기 수정 완료');
})();