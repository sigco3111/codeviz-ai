
import { GoogleGenAI } from "@google/genai";
import { FileInfo, GeminiAnalysis } from "../types";

const MAX_CONTENT_LENGTH = 10000; // Limit content sent to Gemini to avoid large requests
const MAX_FILES_TO_SEND = 10;

export async function analyzeCodebaseWithGemini(files: FileInfo[], apiKey: string): Promise<{ analysis: GeminiAnalysis, tokenCount: number }> {
  if (!apiKey) {
    throw new Error("Gemini API 키가 제공되지 않았습니다.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const fileStructureString = files.map(f => `- ${f.path} (${f.size} bytes)`).join('\n');

  const importantFiles = files
    .sort((a, b) => {
      if (a.name === 'package.json') return -1;
      if (b.name === 'package.json') return 1;
      if (a.path.startsWith('src/') && !b.path.startsWith('src/')) return -1;
      if (!a.path.startsWith('src/') && b.path.startsWith('src/')) return 1;
      return b.size - a.size;
    })
    .slice(0, MAX_FILES_TO_SEND);

  const fileContentsString = importantFiles
    .map(file => {
      const content = file.content.length > MAX_CONTENT_LENGTH 
        ? `${file.content.substring(0, MAX_CONTENT_LENGTH)}... (잘림)`
        : file.content;
      return `---
File: ${file.path}
\`\`\`${file.extension}
${content}
\`\`\`
---`;
    })
    .join('\n\n');

  const prompt = `
    당신은 세계적인 시니어 소프트웨어 엔지니어이자 코드 아키텍트입니다. 저는 소프트웨어 프로젝트의 파일 구조와 일부 주요 파일의 내용을 제공할 것입니다. 당신의 임무는 높은 수준의 분석을 수행하고 그 결과를 깔끔하고 구조화된 JSON 형식으로 반환하는 것입니다.

    **지침:**
    1.  제공된 파일 구조와 코드 스니펫을 분석합니다.
    2.  프로젝트의 주요 목적, 기술 스택을 식별하고 전반적인 코드 품질을 평가합니다.
    3.  실행 가능한 개선 제안과 잠재적 이슈를 식별합니다.
    4.  전체 응답은 반드시 단일 JSON 객체여야 하며, 주변에 텍스트, 설명 또는 \`\`\`json과 같은 마크다운 울타리가 없어야 합니다.
    5.  모든 텍스트 분석 결과(overview, summary, suggestions, potentialIssues)는 반드시 **한국어**로 작성되어야 합니다.

    **프로젝트 파일 구조:**
    \`\`\`
    ${fileStructureString}
    \`\`\`

    **주요 파일 내용:**
    ${fileContentsString}

    **필수 JSON 출력 구조 (모든 값은 반드시 한국어로 작성):**
    {
      "overview": "이 프로젝트는 리액트를 사용한 간단한 대시보드 애플리케이션으로, AI를 통해 코드베이스를 분석하고 시각화하는 기능을 제공합니다.",
      "techStack": ["React", "TypeScript", "Tailwind CSS", "Gemini API"],
      "codeQuality": {
        "rating": "좋음",
        "summary": "전반적으로 잘 구조화되어 있으며 가독성이 높습니다. 컴포넌트 분리가 잘 되어 있고, 타입스크립트를 효과적으로 사용하여 코드 안정성을 높였습니다.",
        "suggestions": [
          "App.tsx의 상태 관리 로직을 커스텀 훅(custom hook)으로 분리하면 재사용성과 테스트 용이성이 향상될 것입니다.",
          "API 서비스 로직에 대한 에러 처리를 조금 더 상세하게 구현하여 사용자에게 더 나은 피드백을 제공할 수 있습니다."
        ]
      },
      "potentialIssues": [
        "클라이언트 측에서 직접 API 키를 사용하는 것은 보안상 위험합니다. 프로덕션 환경에서는 서버를 통해 API를 호출하는 백엔드-포-프론트엔드(BFF) 패턴을 고려해야 합니다.",
        "대규모 프로젝트의 경우, 모든 파일 내용을 한 번에 메모리에 로드하는 방식은 브라우저 성능에 부담을 줄 수 있습니다. 점진적 파일 처리나 웹 워커(Web Worker) 사용을 고려해볼 수 있습니다."
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const tokenCount = response.usageMetadata?.totalTokenCount ?? 0;

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const analysis = JSON.parse(jsonStr) as GeminiAnalysis;
    return { analysis, tokenCount };

  } catch (error) {
    console.error("Gemini 코드베이스 분석 오류:", error);
    
    const errorString = JSON.stringify(error);
    let friendlyMessage: string;

    if (errorString.includes("429") || (error instanceof Error && error.message.includes("429"))) {
       friendlyMessage = "Gemini API 요청 할당량을 초과했습니다. 무료 등급은 분당 요청이 제한될 수 있습니다. 잠시 후 다시 시도하거나 API 대시보드에서 플랜 및 사용량을 확인하세요.";
    } else if (errorString.includes("API key not valid")) {
        friendlyMessage = "Gemini API 키가 유효하지 않습니다. 입력한 키를 다시 확인해주세요.";
    } else if (error instanceof Error) {
        friendlyMessage = `Gemini API 오류: ${error.message}`;
    } else {
      friendlyMessage = "AI 분석 중 알 수 없는 오류가 발생했습니다. API 키가 유효한지, 네트워크 연결에 문제가 없는지 확인해 주세요.";
    }
    
    throw new Error(friendlyMessage);
  }
}