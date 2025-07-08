import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일 경로 구하기 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 간단한 파비콘 생성 함수
 * 기본 패턴을 사용하여 32x32 픽셀의 PNG 파일 헤더를 작성
 */
function createSimplePNG() {
  try {
    // PNG 파일 헤더
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR 청크 (이미지 헤더)
    const width = Buffer.alloc(4);
    width.writeUInt32BE(32, 0); // 32x32 이미지
    
    const height = Buffer.alloc(4);
    height.writeUInt32BE(32, 0);
    
    const ihdrData = Buffer.concat([
      width,
      height,
      Buffer.from([8, 2, 0, 0, 0]) // 비트 깊이, 색상 타입, 압축 방법, 필터 방법, 인터레이스 방법
    ]);
    
    // 청크 길이 (IHDR 데이터 길이)
    const ihdrLength = Buffer.alloc(4);
    ihdrLength.writeUInt32BE(ihdrData.length, 0);
    
    // 청크 이름
    const ihdrName = Buffer.from('IHDR');
    
    // CRC 계산 (간단화를 위해 0으로 설정)
    const ihdrCRC = Buffer.alloc(4);
    
    // 간단한 이미지 데이터 (파란색 배경)
    const pixelData = [];
    for (let i = 0; i < 32 * 32; i++) {
      // R, G, B 값 (하늘색)
      pixelData.push(14, 165, 233);
    }
    
    // IDAT 청크 (이미지 데이터)
    const idatData = Buffer.from(pixelData);
    
    // IDAT 청크 길이
    const idatLength = Buffer.alloc(4);
    idatLength.writeUInt32BE(idatData.length, 0);
    
    // IDAT 청크 이름
    const idatName = Buffer.from('IDAT');
    
    // IDAT CRC (간단화를 위해 0으로 설정)
    const idatCRC = Buffer.alloc(4);
    
    // IEND 청크 (이미지 종료)
    const iendLength = Buffer.alloc(4); // 길이는 0
    const iendName = Buffer.from('IEND');
    const iendCRC = Buffer.alloc(4);
    
    // 모든 청크 합치기
    const pngFile = Buffer.concat([
      pngSignature,
      ihdrLength, ihdrName, ihdrData, ihdrCRC,
      idatLength, idatName, idatData, idatCRC,
      iendLength, iendName, iendCRC
    ]);
    
    // 파일에 저장
    fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), pngFile);
    console.log('favicon.png 생성 완료!');
    
  } catch (error) {
    console.error('PNG 파일 생성 중 오류 발생:', error);
  }
}

createSimplePNG(); 