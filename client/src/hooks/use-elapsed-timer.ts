import { useEffect, useState } from "react";

const MAX_SECONDS = 59 * 60 + 59;

/** Seconds elapsed since mount, capped at 59:59. */
export const useElapsedTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setSeconds((prev) => Math.min(prev + 1, MAX_SECONDS)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  return seconds;
};

export const formatClock = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
