import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  enableSearchShortcut?: boolean;
  blockRefresh?: boolean;
}

export const useKeyboardShortcuts = ({
  setIsSearchOpen,
  setGlobalFilter,
  enableSearchShortcut = true,
  blockRefresh = true,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (
        blockRefresh &&
        (e.key === "F5" || (isCtrl && e.key.toLowerCase() === "r"))
      ) {
        e.preventDefault();
        alert("Page refresh is disabled on this screen.");
      }

      if (enableSearchShortcut && isCtrl && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsSearchOpen((prev) => {
          const newState = !prev;
          if (newState) {
            setTimeout(() => {
              const input = document.getElementById("search-input");
              input?.focus();
            }, 100);
          } else {
            setGlobalFilter("");
          }
          return newState;
        });
      }

      if (enableSearchShortcut && isCtrl && e.key.toLowerCase() === "f") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsSearchOpen, setGlobalFilter, enableSearchShortcut, blockRefresh]);
};