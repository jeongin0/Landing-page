# 랜딩페이지 빌더 (v1)

스토어 단일상품 랜딩페이지를 폼 입력 → AI 카피 생성 → 클릭 편집 → HTML 내보내기로 만드는 툴.

## 실행

```bash
npm run dev
```

http://localhost:3000

## AI 카피 생성 켜기 (Google Gemini — 무료)

1. https://aistudio.google.com/apikey 에서 API 키 발급 (카드 등록 불필요)
2. `.env.local` 에 `GEMINI_API_KEY=발급받은키` 추가
3. `npm run dev` 재시작 / 배포 시 Vercel 환경변수에도 추가

키가 없어도 편집/저장/내보내기는 전부 동작함 (AI 생성만 에러).

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

## 완료

- [x] Supabase 연결 · 로그인 (익명세션 제거, 로그인 필수)
- [x] 요금제 free / pro / lifetime + 요금제별 권한
- [x] LemonSqueezy 결제 + webhook
- [x] 게시(publish) + 이미지 내보내기(PNG/JPEG/WEBP) + HTML 내보내기
- [x] 프리셋 3종 (클래식 / 스포트라이트 / 에디토리얼)
- [x] 홍보 랜딩페이지 + 법적 페이지 (/legal/terms · privacy · refund)
- [x] 내보내기 워터마크 완전 제거 (모든 플랜 동일)
- [x] AI 카피 생성 = Pro / Lifetime 전용 + 30일 사용량 한도(200회)
- [x] 이미지 크기 조절 = Pro / Lifetime 전용
- [x] 헤더에 현재 플랜 뱃지 표시
- [x] 이미지 크기 조절 (드래그 + 슬라이더)
- [x] 인증 에러 메시지 한국어화
- [x] GEMINI_API_KEY (Vercel + 로컬), schema_v5 적용, Storage 버킷 생성

## 판매 전 체크리스트

### Supabase 대시보드
- [ ] Authentication → Providers → Email → **"Allow new users to sign up" ON** (가입 열기)
- [ ] Confirm email OFF 유지 (또는 나중에 Brevo SMTP 연결 후 ON)
- [ ] Authentication → Providers → **Anonymous sign-ins OFF** (권장)
- [ ] Authentication → URL Configuration → Site URL / Redirect URLs = 배포 도메인

### LemonSqueezy
- [ ] Store currency = USD, Pro / Lifetime 가격 확인
- [ ] 두 상품 상태 = Published (draft 아님)
- [ ] Settings → Webhooks → URL = `https://<배포도메인>/api/lemon/webhook`, 시크릿이 `LEMONSQUEEZY_WEBHOOK_SECRET` 와 일치, 이벤트 `order_created` · `subscription_created` · `subscription_updated` · `subscription_cancelled` · `subscription_expired` 체크
- [ ] 테스트 모드로 Pro 1건 결제 → profiles.plan 이 pro 로 바뀌는지 확인
- [ ] 결제 완료 후 뜨는 "주문해 주셔서 감사합니다" 모달은 LemonSqueezy 화면임 → 문구는 상품 설정 > Confirmation 에서 수정 (우리 사이트에서 뜨는 완료 안내는 `components/UpgradedBanner.tsx`)

#### 테스트 결제 카드 (Store = Test mode 일 때만)
| 항목 | 값 |
|---|---|
| 카드번호 | `4242 4242 4242 4242` |
| 만료일 | 미래 아무 날짜 (예: `12/34`) |
| CVC | 아무 3자리 (예: `123`) |
| 이름 · 우편번호 | 아무 값 |

- Live 모드에서는 위 카드 안 먹음. 실제 카드로 확인했으면 대시보드에서 refund.
- 테스트 결제는 **테스트 모드 webhook 시크릿**을 `LEMONSQUEEZY_WEBHOOK_SECRET` 에 넣어야 반영됨.

### 최종 E2E (배포 도메인에서)
- [ ] 가입 → 로그인 → 프로젝트 생성 → 편집 → 자동저장
- [ ] AI 카피 생성 1회 성공
- [ ] 게시 → `/p/<id>` 공개 확인
- [ ] HTML 내보내기 (모든 플랜 워터마크 없음)
- [ ] Free 계정: AI 카피 생성 · 이미지 크기 조절 막히는지 확인
- [ ] Pro 계정: AI 카피 생성 · 이미지 크기 조절 되는지 확인
- [ ] 이미지 업로드 (파일 올리기)

### 나중 (선택)
- [ ] 커스텀 도메인 연결
- [ ] Brevo SMTP → 이메일 인증 다시 켜기
- [ ] 요금제 페이지에 실제 금액 표기
- [ ] 이미지 업로드시 기존 URL 정리 / 용량 관리
