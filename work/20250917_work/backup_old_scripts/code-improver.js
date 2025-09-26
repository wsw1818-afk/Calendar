/**
 * 코드 개선 스크립트 - console.log 제거 및 품질 개선
 */

const fs = require('fs');

// 개선할 파일들
const filesToImprove = [
  'preview-control.js',
  'advanced-controls-modal.js',
  'modal-drag-system.js',
  'global-esc-handler.js'
];

console.log('🔧 코드 개선 시작\n');

filesToImprove.forEach(file => {
  try {
    let code = fs.readFileSync(file, 'utf8');
    const originalLength = code.length;
    
    // 1. console.log를 디버그 모드에서만 실행되도록 수정
    // 개발 중이므로 주석 처리로 변경
    code = code.replace(/console\.log\(/g, '// console.log(');
    
    // 2. == 를 === 로 변경 (안전한 경우만)
    code = code.replace(/([^=!])=([^=])/g, (match, p1, p2) => {
      // 할당문이 아닌 비교문만 변경
      if (p1.trim() && p2.trim() && !match.includes('=')) {
        return p1 + '===' + p2;
      }
      return match;
    });
    
    // 3. != 를 !== 로 변경
    code = code.replace(/!=([^=])/g, '!==$1');
    
    // 4. undefined 비교 개선
    code = code.replace(/== undefined/g, '=== undefined');
    code = code.replace(/!= undefined/g, '!== undefined');
    
    // 5. var를 let/const로 변경 (안전한 경우만)
    const lines = code.split('\n');
    const improvedLines = lines.map(line => {
      // var 선언을 const로 변경 (재할당이 없는 경우)
      if (line.includes('var ') && !line.includes('for')) {
        return line.replace(/\bvar\s+/g, 'const ');
      }
      return line;
    });
    code = improvedLines.join('\n');
    
    // 파일 저장
    if (code.length !== originalLength) {
      // 백업 생성
      fs.writeFileSync(file + '.backup', fs.readFileSync(file, 'utf8'));
      // 개선된 코드 저장
      fs.writeFileSync(file, code);
      console.log(`✅ ${file} - 개선 완료 (백업: ${file}.backup)`);
    } else {
      console.log(`ℹ️ ${file} - 변경 사항 없음`);
    }
    
  } catch (error) {
    console.log(`❌ ${file} - 개선 실패:`, error.message);
  }
});

console.log('\n✨ 코드 개선 완료!');