import { ComponentProps } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = styles[variant];
  const sizeClass = styles[size];

  return (
    <button
      className={`
        ${styles.button}
        ${variantClass}
        ${sizeClass}
        ${disabled || isLoading ? styles.disabled : ''}
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
