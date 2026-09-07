# 배포 (Vercel)

## 1. Vercel 가입
https://vercel.com → **Continue with GitHub**

## 2. 프로젝트 가져오기
- **Add New → Project**
- `jeongin0/Landing-page` 선택 → Import
- **Root Directory** → **`landing-builder`** 로 설정 ⚠️ (코드가 하위 폴더에 있음)
- Framework Preset: `Next.js` (자동 감지됨)

## 3. 환경변수 입력 (Environment Variables)
| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://kxlmbepvymxhjhikrmvh.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sb_publishable_wH8BIFBUSylXLt2bzSgJTw_U9l1p3Dn |
| `ANTHROPIC_API_KEY` | (있으면 입력, 없으면 생략) |

## 4. Deploy 클릭 → 2분 대기 → `https://xxx.vercel.app` 발급

## 5. 배포 후 Supabase 설정
Supabase → **Authentication → URL Configuration**
- **Site URL**: `https://xxx.vercel.app`
- **Redirect URLs**: `https://xxx.vercel.app/**` 추가

(안 하면 로그인/이메일 확인 링크가 localhost로 감)

## 이후 배포
`git push` 하면 Vercel이 자동으로 다시 배포함.

---

## ⚠️ 판매 전 필수 (아직 안 함)
- 커스텀 SMTP(Resend) 연결 — Supabase 기본 메일은 시간당 2~3통 제한, 판매 불가
