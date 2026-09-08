import type { Metadata } from "next";
import LegalShell from "../Shell";
import { BIZ } from "../data";

export const metadata: Metadata = { title: "환불정책" };

export default function RefundPage() {
  return (
    <LegalShell title="환불정책">
      <p>{BIZ.service} 유료 플랜 결제에 대한 환불 기준입니다. 시행일: {BIZ.updated}</p>

      <h2>1. 전액 환불</h2>
      <ul>
        <li>결제일로부터 7일 이내이고, AI 카피 생성 등 유료 전용 기능을 사용하지 않은 경우.</li>
        <li>서비스 장애로 정상 이용이 불가능했던 경우.</li>
      </ul>

      <h2>2. 환불이 제한되는 경우</h2>
      <ul>
        <li>결제 후 7일 경과.</li>
        <li>7일 이내라도 AI 카피 생성 등 유료 전용 기능을 이미 사용한 경우(디지털 콘텐츠 제공 개시).</li>
        <li>Lifetime 플랜은 위 7일 경과 후 환불되지 않습니다.</li>
      </ul>

      <h2>3. Pro 구독 해지</h2>
      <p>언제든 해지할 수 있으며, 해지하면 다음 결제일부터 청구가 중단되고 남은 기간까지는 유료 기능을 이용할 수 있습니다. 이미 결제된 주기의 일할 환불은 1항에 해당하지 않는 한 제공되지 않습니다.</p>

      <h2>4. 신청 방법</h2>
      <p>{BIZ.email} 로 가입 이메일과 결제 정보를 보내주시면 3영업일 이내에 처리합니다. 결제·환불은 {BIZ.paymentProcessor}를 통해 이루어지며, 카드사 사정에 따라 반영까지 수일이 걸릴 수 있습니다.</p>
    </LegalShell>
  );
}
