import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { isApiError, hasValidationErrors } from '../types/error';
import Logo from '../components/ui/common/Logo';
import Button from '../components/ui/common/Button';
import Input from '../components/ui/common/Input';
import ErrorBox from '../components/ui/common/ErrorBox';
import sharedStyles from './authPage.module.css';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Extract token from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setErrors(['Invalid reset link. Please request a new password reset.']);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    const validationErrors: string[] = [];

    // Check password length
    if (newPassword.length < 8) {
      validationErrors.push('Password must be at least 8 characters long');
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      validationErrors.push(
        "Passwords don't match. Please make sure both passwords are identical."
      );
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-confirm', { token, newPassword });
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      if (isApiError(error)) {
        if (error.data && hasValidationErrors(error.data)) {
          // Handle validation errors from API
          setErrors(error.data.errors.map(err => err.msg));
        } else if (error.data && error.data.message) {
          // Handle specific error message
          setErrors([error.data.message]);
        } else {
          // Handle generic API error
          setErrors(['Password reset failed. The link may have expired.']);
        }
      } else {
        // Handle unknown errors
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={sharedStyles.wrapper}>
        <div className={sharedStyles.container}>
          <Link to="/login">
            <h1 className={sharedStyles.logo}>
              <Logo height="80px" />
            </h1>
          </Link>
          <div className={sharedStyles.successMessage}>
            Your password has been reset successfully. You will be redirected to
            the login page shortly.
          </div>
          <p className={sharedStyles.centeredButton}>
            <Link to="/login">
              <Button type="submit">Go to login page</Button>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={sharedStyles.wrapper}>
      <div className={sharedStyles.container}>
        <Link to="/login">
          <h1 className={sharedStyles.logo}>
            <Logo height="80px" />
          </h1>
        </Link>

        {!token ? (
          <div>
            {errors.length > 0 && <ErrorBox errors={errors} />}
            <div className={sharedStyles.centeredButton}>
              <Link to="/forgot-password">
                <Button type="submit">Request a new reset link</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={sharedStyles.form}>
            <h2 className={styles.title}>Set New Password</h2>
            {errors.length > 0 && <ErrorBox errors={errors} />}

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <div
              className={`${sharedStyles.buttonContainer} ${styles.resetButton}`}
            >
              <Button type="submit" isLoading={isLoading}>
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
