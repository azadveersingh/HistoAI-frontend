import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

interface NavigationTransaction {
  retry: () => void;
  // Add other properties as needed
}

export function useNavigationBlocker(blocker: (tx: NavigationTransaction) => void, when: boolean = true) {
  const navigator = useContext(NavigationContext).navigator as any; // Type as any due to UNSAFE_NavigationContext

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx: NavigationTransaction) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
}