import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorBox from '../components/ui/ErrorBox';
import { isApiError, hasValidationErrors } from '../types/error';
import styles from './ForgotPassword.module.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

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
      validationErrors.push("Passwords don't match. Please make sure both passwords are identical.");
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
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Password Reset Successful</h1>
          <div className={styles.successMessage}>
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </div>
          <p className={styles.footer}>
            <Link to="/login">
              <span className={styles.link}>Go to login</span>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Set New Password</h1>
        
        {!token ? (
          <div className={styles.errorMessage}>
            {errors.length > 0 && <ErrorBox errors={errors} />}
            <p className={styles.footer}>
              <Link to="/forgot-password">
                <span className={styles.link}>Request a new reset link</span>
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.length > 0 && <ErrorBox errors={errors} />}
            
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Button type="submit" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}