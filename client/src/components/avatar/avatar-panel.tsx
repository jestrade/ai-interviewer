import { lazy, Suspense, useCallback, useState } from "react";
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

/** The avatar above the chat. Renders nothing (chat only) when it can not run. */
export const AvatarPanel = () => {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(
    (error: unknown) => {
      notifyError("Avatar failed to load: " + error);
      setFailed(true);
    },
    []
  );

  if (failed || !hasWebGL()) return null;

  return (
    <div className="mx-auto h-56 w-full max-w-md shrink-0 overflow-hidden rounded-lg border-2 bg-card sm:h-64">
      <Suspense fallback={null}>
        <InterviewerAvatar onError={handleError} />
      </Suspense>
    </div>
  );
};
