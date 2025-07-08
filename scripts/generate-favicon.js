import { promises as fs } from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 디렉터리 경로 구하기
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

/**
 * SVG 파일을 다양한 크기의 PNG로 변환하는 함수
 */
async function generateFavicons() {
  try {
    const svgPath = path.join(publicDir, 'favicon.svg');
    const svgBuffer = await fs.readFile(svgPath);
    
    // 다양한 크기의 파비콘 생성
    const sizes = [16, 32, 48, 64, 128, 192, 512];
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `favicon-${size}.png`));
      
      console.log(`${size}x${size} PNG 파비콘 생성 완료`);
    }
    
    // favicon.ico 파일 생성 (16x16, 32x32 포함)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('favicon.ico 생성 완료');
    
  } catch (error) {
    console.error('파비콘 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
generateFavicons(); 