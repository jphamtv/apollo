import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorBox from '../components/ui/ErrorBox';
import { validateEmail } from '../utils/validation';
import { isApiError } from '../types/error';
import sharedStyles from './authPage.module.css';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors([emailError]);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-request', { email });
      setIsSubmitted(true);
    } catch (error) {
      // Not setting validation errors here to prevent email enumeration
      // The backend should always return 200 whether the email exists or not

      // But we should handle unexpected errors
      if (isApiError(error) && error.status !== 200) {
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={sharedStyles.wrapper}>
      <div className={`${sharedStyles.container} ${styles.forgotPasswordContainer}`}>
        <Link to="/login">
          <h1 className={sharedStyles.logo}><Logo height='5rem' /></h1>
        </Link>

        {isSubmitted ? (
          <>
            <div className={styles.successMessage}>
              If an account exists with this email, we've sent instructions to
              reset your password.
            </div>
            <p className={styles.footer}>
              <Link to="/login">
                <Button type="submit" >Back to Login</Button>
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.length > 0 && <ErrorBox errors={errors} />}

            <p>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div className={styles.buttonContainer}>
              <Button type="submit" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
