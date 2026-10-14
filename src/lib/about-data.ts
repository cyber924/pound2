export type FeaturedService = {
  name: string;
  description: string;
  keyFeature: string;
  integrated: boolean;
  imageUrl: string;
  imageHint: string;
};

// This data is no longer used in the new about page,
// but kept for potential future use or reference.
export const featuredServices: FeaturedService[] = [
  {
    name: 'StoreGenie',
    description: '스마트스토어/카페24 상품 상세페이지 자동 생성 SaaS',
    keyFeature: '상품 설명/리뷰/이미지 자동 생성, HTML 복사 기능',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/storegenie/600/400',
    imageHint: 'ecommerce product page',
  },
  {
    name: 'FormGenie',
    description: '업무/보고서/제안서 등 자동 문서 생성 SaaS',
    keyFeature: 'AI 양식 생성, HTML+React 템플릿 제공',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/formgenie/600/400',
    imageHint: 'document editor interface',
  },
  {
    name: 'GenStudio',
    description: 'AI 텍스트 비교·생성 플랫폼',
    keyFeature: 'GPT/Claude 결과 비교, PRO 프롬프트 지원',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/genstudio/600/400',
    imageHint: 'side-by-side text comparison',
  },
  {
    name: 'BrandForge',
    description: '브랜드 콘텐츠 자동 생성 도구',
    keyFeature: '마케팅 문구·광고 카피 자동 생성',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/brandforge/600/400',
    imageHint: 'brand identity moodboard',
  },
  {
    name: 'LUNAI',
    description: 'AI 운세 및 감성형 조언 서비스',
    keyFeature: '별자리·MBTI 기반 맞춤 운세 및 상담',
    integrated: false,
    imageUrl: 'https://picsum.photos/seed/lunai/600/400',
    imageHint: 'moon stars animation',
  },
  {
    name: 'LifeAI',
    description: 'AI 여행·쇼핑 추천 플랫폼',
    keyFeature: 'Gemini 기반 여행 추천 및 쇼핑 분석',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/lifeai/600/400',
    imageHint: 'travel search interface',
  },
  {
    name: 'AI Market',
    description: '생성형 AI 도구 큐레이션 포털',
    keyFeature: 'AI 툴 비교, iframe 실행 지원',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/aimarket/600/400',
    imageHint: 'grid of application cards',
  },
  {
    name: 'ShinStory',
    description: 'AI 창작 릴레이·스토리 거래소',
    keyFeature: '창작 스토리 자동 이어쓰기 + PDF 변환',
    integrated: true,
    imageUrl: 'https://picsum.photos/seed/shinstory/600/400',
    imageHint: 'branching story tree',
  },
];
