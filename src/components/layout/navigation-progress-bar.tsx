import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function NavigationProgressBar() {
  const isLoading = useRouterState({
    select: (s) => s.status === "pending" || s.isLoading,
  });
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress(15);
      timer1 = setTimeout(() => setProgress(45), 60);
      timer2 = setTimeout(() => setProgress(80), 180);
    } else {
      setProgress(100);
      timer3 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 150);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isLoading]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2.5px] overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-teal via-secondary to-brand-lime shadow-[0_0_10px_rgba(138,238,53,0.8)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "120ms" : "250ms",
        }}
      />
    </div>
  );
}
