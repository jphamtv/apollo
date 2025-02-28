import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-request', { email });
      setIsSubmitted(true);
    } catch {
      // Not setting error here to prevent email enumeration
      // The backend always returns 200 whether the email exists or not
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Reset Password</h1>
        
        {isSubmitted ? (
          <>
            <div className={styles.successMessage}>
              If an account exists with this email, we've sent instructions to reset your password.
            </div>
            <p className={styles.footer}>
              <Link to="/login">
                <span className={styles.link}>Back to login</span>
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
            <Button type="submit" isLoading={isLoading}>
              Send Reset Link
            </Button>
            <p className={styles.footer}>
              Remember your password?{' '}
              <Link to="/login">
                <span className={styles.link}>Log in</span>
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}