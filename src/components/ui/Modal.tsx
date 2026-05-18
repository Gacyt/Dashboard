"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ModalVariant = "dialog" | "sheet" | "fullscreen";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: ModalVariant;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])'
].join(",");

const INITIAL_FOCUS_SELECTOR = [
  '[data-autofocus="true"]',
  'input:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])'
].join(",");

export default function Modal({
  open,
  onClose,
  title,
  description,
  variant = "dialog",
  footer,
  children
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (!current || !panelRef.current.contains(current)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const rafId = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && panel.contains(activeEl)) {
        return;
      }

      const preferred = panel.querySelector<HTMLElement>(INITIAL_FOCUS_SELECTOR);
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const fallback = focusable.find((element) => element.dataset.modalClose !== "true") ?? null;

      (preferred ?? fallback ?? panel).focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(rafId);
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [open, requestClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="nx-modal-overlay"
          onMouseDown={requestClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`nx-modal-panel nx-modal-${variant}`}
            onMouseDown={(event) => event.stopPropagation()}
            initial={variant === "sheet" ? { opacity: 0, y: 38 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={variant === "sheet" ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={variant === "sheet" ? { opacity: 0, y: 26 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.8 }}
          >
            <header className="nx-modal-header">
              <div>
                <h2 id={titleId} className="nx-modal-title">
                  {title}
                </h2>
                {description ? (
                  <p id={descId} className="nx-modal-description">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="nx-modal-close"
                onClick={requestClose}
                aria-label="Close dialog"
                data-modal-close="true"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            <div className="nx-modal-body">{children}</div>
            {footer ? <footer className="nx-modal-footer">{footer}</footer> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
