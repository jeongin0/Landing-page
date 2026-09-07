// Supabase(GoTrue) 인증 에러를 한국어 메시지로 변환.

const BY_CODE: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_not_confirmed: "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요.",
  user_already_exists: "이미 가입된 이메일입니다. 로그인해 주세요.",
  email_exists: "이미 가입된 이메일입니다. 로그인해 주세요.",
  weak_password: "비밀번호는 6자 이상이어야 합니다.",
  signup_disabled: "현재 신규 가입이 일시적으로 막혀 있습니다.",
  email_provider_disabled: "현재 신규 가입이 일시적으로 막혀 있습니다.",
  over_request_rate_limit: "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
  over_email_send_rate_limit: "메일 전송이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
  validation_failed: "입력한 값을 확인해 주세요.",
  same_password: "이전과 다른 비밀번호를 사용해 주세요.",
};

const BY_TEXT: [RegExp, string][] = [
  [/invalid login credentials/i, "이메일 또는 비밀번호가 올바르지 않습니다."],
  [/email not confirmed/i, "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요."],
  [/already (been )?regist|user already|email.*exists/i, "이미 가입된 이메일입니다. 로그인해 주세요."],
  [/password.*(6|six|at least)/i, "비밀번호는 6자 이상이어야 합니다."],
  [/signups? (not allowed|are disabled|disabled)/i, "현재 신규 가입이 일시적으로 막혀 있습니다."],
  [/email (signups?|logins?) are disabled/i, "현재 신규 가입이 일시적으로 막혀 있습니다."],
  [/rate limit|too many requests|after \d+ seconds/i, "요청이 많습니다. 잠시 후 다시 시도해 주세요."],
  [/invalid format|unable to validate email/i, "이메일 형식이 올바르지 않습니다."],
  [/failed to fetch|networkerror|network request failed/i, "네트워크 오류입니다. 연결을 확인해 주세요."],
];

export function krAuthError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  if (e?.code && BY_CODE[e.code]) return BY_CODE[e.code];
  const msg = e?.message ?? "";
  for (const [re, kr] of BY_TEXT) if (re.test(msg)) return kr;
  return msg || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
