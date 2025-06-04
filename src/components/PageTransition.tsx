"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// 用于整个页面的过渡
export default function PageTransition({ children }: PageTransitionProps) {
  return <div className="animate-fade-in">{children}</div>;
}

// 用于内容区域的过渡，保持顶部栏静止
export function ContentTransition({ children }: PageTransitionProps) {
  return <div className="animate-fade-in">{children}</div>;
}

// 固定的顶部栏组件，不参与动画
export function StaticHeader() {
  return (
    <div className="w-full flex justify-start items-center relative z-10">
      <div className="text-2xl font-medium text-white tracking-tight font-pacifico">
        melonvocab
      </div>
    </div>
  );
}
