"use client";

import { useLayoutEffect } from "react";

/** 홈 첫 진입 시 브라우저 스크롤을 맨 위로 고정한다. */
export function HomeScrollTop() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
