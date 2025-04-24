// src/hooks/useDropdown.ts
import { useState, useEffect, useRef, useCallback } from "react";

interface UseDropdownOptions {
  initialState?: boolean;
  closeOnEscape?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useDropdown({
  initialState = false,
  closeOnEscape = true,
  onOpen,
  onClose,
}: UseDropdownOptions = {}) {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const dropdownRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    // Handle escape key press
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && isOpen && event.key === "Escape") {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (closeOnEscape) {
        document.addEventListener("keydown", handleKeyDown);
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeOnEscape) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isOpen, close, closeOnEscape]);

  return {
    isOpen,
    open,
    close,
    toggle,
    dropdownRef,
  };
}
