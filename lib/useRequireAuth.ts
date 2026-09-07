"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "./supabase/client";

// 로그인 세션이 없으면 /login 으로 보낸다.
// { checked } 가 true 가 되기 전에는 보호된 화면을 렌더하지 않는 게 좋다.
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabaseBrowser().auth.getSession();
      if (!alive) return;
      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      } else {
        setChecked(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, pathname]);

  return { checked };
}
