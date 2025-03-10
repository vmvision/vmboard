/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://raw.githubusercontent.com/hamster1963/nezha-dash/ac15be6e71ba9804681b1fe760fa245f94912372/components/ServerFlag.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */

import { env } from "@/env";
import { cn } from "@/lib/utils";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { useEffect, useState } from "react";

export default function ServerFlag({
  country_code,
  className,
}: {
  country_code: string;
  className?: string;
}) {
  const [supportsEmojiFlags, setSupportsEmojiFlags] = useState(true);

  useEffect(() => {
    if (env.NEXT_PUBLIC_FORCE_USE_SVG_FLAG) {
      // If the environment variable requires that SVG be used directly, there is no need to check for Emoji support
      setSupportsEmojiFlags(false);
      return;
    }

    const checkEmojiSupport = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const emojiFlag = "🇺🇸"; // Use the American flag as a test
      if (!ctx) return;
      ctx.fillStyle = "#000";
      ctx.textBaseline = "top";
      ctx.font = "32px Arial";
      ctx.fillText(emojiFlag, 0, 0);

      const support = ctx.getImageData(16, 16, 1, 1).data[3] !== 0;
      setSupportsEmojiFlags(support);
    };

    checkEmojiSupport();
  }, []);

  if (!country_code) return null;

  return (
    <span className={cn("text-[12px] text-muted-foreground", className)}>
      {env.NEXT_PUBLIC_FORCE_USE_SVG_FLAG || !supportsEmojiFlags ? (
        <span className={`fi fi-${country_code}`} />
      ) : (
        getUnicodeFlagIcon(country_code)
      )}
    </span>
  );
}
