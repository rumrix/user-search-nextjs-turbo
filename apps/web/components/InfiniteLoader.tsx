"use client";

import { useEffect, useRef } from "react";

interface Props {
  onLoadMore: () => void;
  hasMore: boolean;
  disabled?: boolean;
}

const InfiniteLoader = ({ onLoadMore, hasMore, disabled }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || disabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        });
      },
      { threshold: 0.5 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, disabled]);

  return <div ref={ref} className="h-10 w-full" aria-hidden />;
};

export default InfiniteLoader;
