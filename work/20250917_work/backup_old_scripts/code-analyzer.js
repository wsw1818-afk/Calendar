/**
 * 코드 분석 및 오류 검사 스크립트
 */

const fs = require('fs');
const path = require('path');

// 검사할 JavaScript 파일들
const jsFiles = [
  'preview-control.js',
  'advanced-controls-modal.js',
  'modal-drag-system.js',
  'global-esc-handler.js',
  'unified-calendar-system.js'
];

console.log('🔍 JavaScript 파일 오류 검사 시작\n');

let totalErrors = 0;
let totalWarnings = 0;
const detailedIssues = {};

jsFiles.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const fileIssues = [];
    
    // 1. 구문 검사
    try {
      new Function(code);
      console.log('✅', file, '- 구문 오류 없음');
    } catch (syntaxError) {
      console.log('❌', file, '- 구문 오류:', syntaxError.message);
      totalErrors++;
      fileIssues.push({
        type: 'error',
        message: `구문 오류: ${syntaxError.message}`
      });
    }
    
    // 2. 잠재적 문제 검사
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // console.log 사용 확인
      if (line.includes('console.log') && !line.trim().startsWith('//')) {
        fileIssues.push({
          type: 'warning',
          line: lineNum,
          message: 'console.log 사용 (프로덕션에서 제거 권장)',
          code: line.trim()
        });
        totalWarnings++;
      }
      
      // TODO/FIXME 주석
      if (line.includes('TODO') || line.includes('FIXME')) {
        fileIssues.push({
          type: 'info',
          line: lineNum,
          message: 'TODO/FIXME 주석 발견',
          code: line.trim()
        });
      }
      
      // == 대신 === 사용 권장
      if (line.match(/[^=!]==[^=]/)) {
        fileIssues.push({
          type: 'warning',
          line: lineNum,
          message: '== 사용 발견 (=== 사용 권장)',
          code: line.trim()
        });
        totalWarnings++;
      }
      
      // != 대신 !== 사용 권장
      if (line.match(/!=[^=]/)) {
        fileIssues.push({
          type: 'warning',
          line: lineNum,
          message: '!= 사용 발견 (!== 사용 권장)',
          code: line.trim()
        });
        totalWarnings++;
      }
      
      // undefined 직접 비교
      if (line.includes('== undefined') || line.includes('!= undefined')) {
        fileIssues.push({
          type: 'warning',
          line: lineNum,
          message: 'undefined 직접 비교 (typeof 사용 권장)',
          code: line.trim()
        });
        totalWarnings++;
      }
      
      // 중복 변수 선언 체크
      if (line.match(/\b(var|let|const)\s+\w+/)) {
        const varMatch = line.match(/\b(var|let|const)\s+(\w+)/);
        if (varMatch && varMatch[1] === 'var') {
          fileIssues.push({
            type: 'warning',
            line: lineNum,
            message: 'var 사용 발견 (let/const 사용 권장)',
            code: line.trim()
          });
          totalWarnings++;
        }
      }
      
      // 세미콜론 누락 체크 (간단한 체크)
      if (line.trim() && 
          !line.trim().endsWith(';') && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') && 
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('*') &&
          !line.trim().startsWith('/*') &&
          !line.includes('if') &&
          !line.includes('else') &&
          !line.includes('for') &&
          !line.includes('while') &&
          !line.includes('function') &&
          !line.includes('=>') &&
          line.includes('=')) {
        // 너무 많은 false positive가 있을 수 있으므로 주석 처리
        // fileIssues.push({
        //   type: 'info',
        //   line: lineNum,
        //   message: '세미콜론 누락 가능성',
        //   code: line.trim()
        // });
      }
    });
    
    // 3. 복잡도 분석
    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    const arrowFunctionCount = (code.match(/=>/g) || []).length;
    const totalFunctions = functionCount + arrowFunctionCount;
    
    if (totalFunctions > 30) {
      fileIssues.push({
        type: 'info',
        message: `파일에 함수가 많음 (${totalFunctions}개) - 리팩토링 고려`
      });
    }
    
    // 4. 파일 크기 체크
    const fileSizeKB = Buffer.byteLength(code, 'utf8') / 1024;
    if (fileSizeKB > 100) {
      fileIssues.push({
        type: 'info',
        message: `파일 크기가 큼 (${fileSizeKB.toFixed(2)}KB) - 분할 고려`
      });
    }
    
    if (fileIssues.length > 0) {
      detailedIssues[file] = fileIssues;
      const warningCount = fileIssues.filter(i => i.type === 'warning').length;
      const infoCount = fileIssues.filter(i => i.type === 'info').length;
      if (warningCount > 0) {
        console.log(`⚠️  ${file} - 경고: ${warningCount}개, 정보: ${infoCount}개`);
      }
    }
    
  } catch (error) {
    console.log('❌', file, '- 파일 읽기 오류:', error.message);
    totalErrors++;
  }
});

// 상세 결과 출력
console.log('\n📊 검사 완료 요약:');
console.log('  ✅ 검사한 파일:', jsFiles.length, '개');
console.log('  ❌ 오류:', totalErrors, '개');
console.log('  ⚠️  경고:', totalWarnings, '개');

// 주요 문제점만 출력
if (Object.keys(detailedIssues).length > 0) {
  console.log('\n📋 주요 발견 사항:');
  for (const [file, issues] of Object.entries(detailedIssues)) {
    const errors = issues.filter(i => i.type === 'error');
    const warnings = issues.filter(i => i.type === 'warning');
    
    if (errors.length > 0 || warnings.length > 0) {
      console.log(`\n  ${file}:`);
      errors.forEach(issue => {
        console.log(`    ❌ ${issue.message}`);
      });
      warnings.slice(0, 3).forEach(issue => {
        console.log(`    ⚠️  Line ${issue.line}: ${issue.message}`);
      });
      if (warnings.length > 3) {
        console.log(`    ... 그 외 ${warnings.length - 3}개 경고`);
      }
    }
  }
}

console.log('\n✨ 분석 완료!');