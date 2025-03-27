import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateForm } from '../utils/validation';
import Logo from '../components/ui/common/Logo';
import Button from '../components/ui/common/Button';
import Input from '../components/ui/common/Input';
import ErrorBox from '../components/ui/common/ErrorBox';
import { isApiError, hasValidationErrors } from '../types/error';
import sharedStyles from './authPage.module.css';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [values, setValues] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors([]);

    // Validate form
    const validationErrors: string[] = [];
    const formErrors = validateForm(values);

    if (Object.keys(formErrors).length > 0) {
      validationErrors.push(...Object.values(formErrors));
    }

    // If there are errors, display them and stop
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      if (isApiError(error)) {
        if (error.data && hasValidationErrors(error.data)) {
          // Handle validation errors from API
          setErrors(error.data.errors.map(err => err.msg));
        } else {
          // Handle general API error
          setErrors([error.message]);
        }
      } else {
        // Handle unknown errors
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={sharedStyles.wrapper}>
      <div className={sharedStyles.container}>
        <h1 className={sharedStyles.logo}>
          <Logo height="5rem" />
        </h1>

        <form onSubmit={handleSubmit} className={sharedStyles.form}>
          {errors.length > 0 && <ErrorBox errors={errors} />}

          <Input
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <div className={styles.forgotPasswordLink}>
            <Link to="/forgot-password">
              <span className={sharedStyles.link}>Forgot password?</span>
            </Link>
          </div>
          <div className={sharedStyles.buttonContainer}>
            <Button
              type="submit"
              isLoading={isLoading}
              className={sharedStyles.button}
            >
              Log In
            </Button>
          </div>
        </form>

        <p className={sharedStyles.footer}>
          Don't have an account?{' '}
          <Link to="/register">
            <span className={sharedStyles.link}>Sign up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
