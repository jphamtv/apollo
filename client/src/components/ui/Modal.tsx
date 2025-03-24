import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  hideCloseButton?: boolean
}

export default function Modal({ isOpen, onClose, children, hideCloseButton = false }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);
  
  // Store the element that had focus before opening the modal
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Store the current active element
      previousActiveElement.current = document.activeElement;
      
      // Focus the first focusable element after modal opens
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length > 0) {
            firstFocusableElementRef.current = focusableElements[0] as HTMLElement;
            lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
            firstFocusableElementRef.current.focus();
          }
        }
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
      // Return focus to previous element when modal closes
      if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Handle tab key to trap focus inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.key !== 'Tab') return;

    // If shift + tab and on first element, move to last element
    if (e.shiftKey && document.activeElement === firstFocusableElementRef.current) {
      e.preventDefault();
      lastFocusableElementRef.current?.focus();
    } 
    // If tab and on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastFocusableElementRef.current) {
      e.preventDefault();
      firstFocusableElementRef.current?.focus();
    }
  };

  // To close modal when clicking on overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if the actual overlay was clicked (not its children)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;
  
  return (
    <div 
      className={styles.overlay} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {!hideCloseButton && (
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}