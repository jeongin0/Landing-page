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

## 완료 (v2~v7)

- [x] Supabase 연결 (storage.ts / auth / 익명세션)
- [x] 로그인 · 요금제 (free / pro / lifetime)
- [x] LemonSqueezy 결제 + webhook
- [x] 게시(publish) + 이미지 내보내기(PNG/JPEG/WEBP)
- [x] 프리셋 3종 (클래식 / 스포트라이트 / 에디토리얼)
- [x] 홍보 랜딩페이지
- [x] 내보내기 워터마크 = 서버에서 요금제 검증 (클라 값 신뢰 안 함)
- [x] AI 생성 = 로그인 필수 + 30일 사용량 한도(free 10 / paid 200) + sonnet
- [x] 법적 페이지 (/legal/terms · privacy · refund)

## 상태

인증 · 결제 · 요금제별 권한 · 게시 · 내보내기 · AI 생성 한도 · 법적 페이지까지
**실제 판매 사이트와 동일하게 동작**한다. 커스텀 도메인만 연결하면 그대로 상용 서비스로 운영 가능
(도메인은 브랜딩 · 메일 도달률용이며 기능 제약 요소가 아님).

## 판매 전 남은 것

- [ ] **커스텀 SMTP 연결** — Brevo 무료(300통/일, 도메인 불필요). Supabase 기본 메일은 시간당 제한으로 가입 막힘. (대시보드 작업)
- [ ] `supabase/schema_v5_ai_usage.sql` 실행 (ai_generations 테이블)
- [ ] `app/legal/data.ts` 의 `operator` 값 교체 (개인 운영이라 사업자번호 불필요)
- [ ] 이미지 업로드 UI (Storage 버킷·`lib/upload.ts` 는 준비됨)
- [ ] 결제 → 권한 반영 E2E 1회 검증
