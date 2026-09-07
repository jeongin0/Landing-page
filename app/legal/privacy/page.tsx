import type { Metadata } from "next";
import LegalShell from "../Shell";
import { BIZ } from "../data";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침">
      <p>{BIZ.service}(운영자: {BIZ.operator})는 이용자의 개인정보를 다음과 같이 처리합니다. 시행일: {BIZ.updated}</p>

      <h2>1. 수집 항목</h2>
      <ul>
        <li>필수: 이메일 주소, 로그인 인증 정보</li>
        <li>결제 시: {BIZ.paymentProcessor}가 처리하며, 운영자는 결제 식별자·플랜 상태·구독 만료일만 전달받습니다. 카드번호 등 결제수단 정보는 보관하지 않습니다.</li>
        <li>자동 수집: 접속 로그, 브라우저·기기 정보, 이용 기록(프로젝트 수, AI 생성 횟수)</li>
        <li>이용자가 프로젝트에 직접 입력한 콘텐츠</li>
      </ul>

      <h2>2. 이용 목적</h2>
      <ul>
        <li>회원 식별, 로그인 유지</li>
        <li>서비스 제공, 프로젝트 저장·게시, 사용량 한도 관리</li>
        <li>유료 기능 권한 부여</li>
        <li>문의 대응, 부정 이용 방지</li>
      </ul>

      <h2>3. 보유 및 파기</h2>
      <ul>
        <li>회원 탈퇴 시 계정·프로젝트 데이터를 지체 없이 파기합니다. 단, 법령상 보존 의무가 있는 결제 기록은 해당 기간 동안 보관합니다.</li>
        <li>접속 로그는 3개월간 보관 후 파기합니다.</li>
      </ul>

      <h2>4. 처리 위탁 및 국외 이전</h2>
      <ul>
        <li>Supabase — 데이터베이스·인증·파일 저장 (국외)</li>
        <li>Vercel — 서비스 호스팅 (국외)</li>
        <li>{BIZ.paymentProcessor} — 결제 처리 (국외)</li>
        <li>Anthropic — AI 카피 생성 시 입력한 상품 정보 전송 (국외)</li>
      </ul>

      <h2>5. 이용자의 권리</h2>
      <p>이용자는 언제든 개인정보 열람·정정·삭제·처리정지를 {BIZ.email} 로 요청할 수 있으며, 지체 없이 조치합니다.</p>

      <h2>6. 쿠키</h2>
      <p>로그인 세션 유지를 위한 필수 쿠키만 사용하며, 광고·추적 쿠키는 사용하지 않습니다.</p>

      <h2>7. 문의</h2>
      <p>{BIZ.operator} / {BIZ.email}</p>
    </LegalShell>
  );
}
