# 랜딩페이지 빌더 (v1)

스토어 단일상품 랜딩페이지를 폼 입력 → AI 카피 생성 → 클릭 편집 → HTML 내보내기로 만드는 툴.

## 실행

```bash
npm run dev
```

http://localhost:3000

## AI 카피 생성 켜기

1. `.env.local.example` 를 `.env.local` 로 복사
2. https://console.anthropic.com/settings/keys 에서 키 발급 후 붙여넣기
3. `npm run dev` 재시작

키가 없어도 편집/저장/내보내기는 전부 동작함 (AI 버튼만 비활성).

## 현재 되는 것 (v1)

- 프로젝트 생성 / 목록 / 삭제
- 페이지 글자 클릭해서 바로 수정 (contentEditable)
- 테마 색상 3종 + 이미지 URL 변경 (사이드 패널)
- 0.6초 자동 저장 (브라우저 localStorage)
- AI 카피 생성 (상품 정보 → 히어로/강점/상세/후기/FAQ)
- 독립 실행 HTML 파일로 내보내기

## 구조

```
lib/schema.ts         편집 콘텐츠 타입 (= 나중에 DB projects.content)
lib/defaultContent.ts 새 프로젝트 기본값
lib/storage.ts        저장 레이어 (v2에서 이 파일만 Supabase로 교체)
lib/exportHtml.ts     StoreContent → 정적 HTML
components/Editable.tsx          인라인 편집 텍스트
components/templates/StoreProduct.tsx   템플릿 렌더러
components/GenerateModal.tsx     AI 생성 폼
app/page.tsx                     대시보드
app/editor/[id]/page.tsx         에디터
app/api/generate/route.ts        Claude 호출
app/api/export/route.ts          HTML 내보내기
```

## 다음 (v2 — 판매 구조)

- [ ] Supabase 연결: `storage.ts` 를 DB 호출로 교체
- [ ] 로그인 (Supabase Auth)
- [ ] 이미지 업로드 (Supabase Storage) — 지금은 URL 입력만
- [ ] LemonSqueezy 결제 + 요금제별 권한 (free / pro / lifetime)
- [ ] 배포(publish) 기능 — 서브도메인에 정적 페이지 올리기
- [ ] 템플릿 2~3종 추가 (SaaS, 로컬 서비스)
- [ ] 이 툴 자체의 홍보 랜딩페이지
