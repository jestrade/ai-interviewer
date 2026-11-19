import { ReactNode, useEffect, useRef } from "react";
import { AvatarContext } from "./avatar-context";
import { AvatarStore, createAvatarStore } from "./avatar-store";

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<AvatarStore>();
  if (!storeRef.current) storeRef.current = createAvatarStore();
  const store = storeRef.current;

  useEffect(() => () => store.stop(), [store]);

  return <AvatarContext.Provider value={store}>{children}</AvatarContext.Provider>;
};
