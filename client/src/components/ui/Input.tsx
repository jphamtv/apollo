import { ComponentProps } from "react";
import styles from './Input.module.css';

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input
        className={`
          ${styles.input}
          ${error ? styles.error : ""}
          ${className}
        `.trim()}
        {...props}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
