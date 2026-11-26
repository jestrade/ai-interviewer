import { lazy, ReactNode, Suspense, useCallback, useState } from "react";
import { notifyError } from "@/services/sentry";

// three.js is large: load it only when the interview screen needs it.
const InterviewerAvatar = lazy(() => import("./interviewer-avatar"));

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

/** The 3D interviewer. Shows `fallback` (default: nothing) when it can not run. */
export const AvatarPanel = ({ fallback = null }: { fallback?: ReactNode }) => {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(
    (error: unknown) => {
      notifyError("Avatar failed to load: " + error);
      setFailed(true);
    },
    []
  );

  if (failed || !hasWebGL()) return <>{fallback}</>;

  return (
    <div className="mx-auto h-52 w-52 shrink-0 overflow-hidden rounded-lg border-2 bg-card sm:h-64 sm:w-64">
      <Suspense fallback={null}>
        <InterviewerAvatar onError={handleError} />
      </Suspense>
    </div>
  );
};
