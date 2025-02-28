import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  hideCloseButton?: boolean
}

export default function Modal({ isOpen, onClose, children, hideCloseButton = false }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {!hideCloseButton && (
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}