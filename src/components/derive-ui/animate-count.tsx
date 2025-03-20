"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AnimateCount({
  count,
  className,
  minDigits = 1,
  ...props
}: {
  count: number;
  className?: string;
  minDigits?: number;
}) {
  const [previousCount, setPreviousCount] = useState(count);

  useEffect(() => {
    if (count !== previousCount) {
      setTimeout(() => {
        setPreviousCount(count);
      }, 300);
    }
  }, [count, previousCount, setPreviousCount]);

  const currentDigits = count.toString().split("");
  const previousDigits = (
    previousCount !== undefined
      ? previousCount.toString()
      : count - 1 >= 0
        ? (count - 1).toString()
        : "0"
  ).split("");

  // Ensure both numbers meet the minimum length requirement and maintain the same length for animation
  const maxLength = Math.max(
    previousDigits.length,
    currentDigits.length,
    minDigits,
  );
  while (previousDigits.length < maxLength) {
    previousDigits.unshift("0");
  }
  while (currentDigits.length < maxLength) {
    currentDigits.unshift("0");
  }

  return (
    <div
      {...props}
      className={cn(
        "flex h-[1em] items-center inline-flex leading-none",
        className,
      )}
      data-issues-count-animation
    >
      {currentDigits.map((digit, index) => {
        const hasChanged = digit !== previousDigits[index];
        return (
          <div
            key={`${index}-${digit}`}
            className={cn(
              "relative flex h-full min-w-[0.6em] items-center text-center",
              {
                "min-w-[0.2em]": digit === ".",
              },
            )}
          >
            <div
              aria-hidden
              data-issues-count-exit
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                hasChanged ? "animate" : "opacity-0",
              )}
            >
              {previousDigits[index]}
            </div>
            <div
              data-issues-count-enter
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                hasChanged && "animate",
              )}
            >
              {digit}
            </div>
          </div>
        );
      })}
    </div>
  );
}
