import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterCredentials } from "../types/user";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorBox from "../components/ui/ErrorBox";
import { validateForm } from "../utils/validation";
import { isApiError, hasValidationErrors } from "../types/error";
import { logger } from "../utils/logger";
import styles from './Register.module.css'

export default function Register() {
  const { register } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors([]);
    
    // Collect all validation errors
    const validationErrors: string[] = [];
    
    // Required fields validation (including password length check)
    const formErrors = validateForm({
      username: credentials.username,
      email: credentials.email,
      password: credentials.password
    });
    
    if (Object.keys(formErrors).length > 0) {
      validationErrors.push(...Object.values(formErrors));
    }
    
    // Password match validation (only done on frontend)
    if (credentials.password !== confirmPassword) {
      validationErrors.push("Passwords don't match. Please make sure both passwords are identical.");
    }
    
    // If there are errors, display them and stop
    if (validationErrors.length > 0) {
      // Deduplicate errors
      const uniqueErrors = [...new Set(validationErrors)];
      setErrors(uniqueErrors);
      return;
    }
    
    // Continue with registration
    setIsLoading(true);
    try {
      await register(credentials);
      navigate("/");
    } catch (error) {
      if (isApiError(error)) {
        if (error.data && hasValidationErrors(error.data)) {
          // Handle validation errors from API - remove duplicates
          const apiErrors = error.data.errors.map(err => err.msg);
          const uniqueApiErrors = [...new Set(apiErrors)];
          setErrors(uniqueApiErrors);
        } else if (error.data && error.data.message) {
          // Handle specific error messages (like "Email already registered")
          setErrors([error.data.message]);
        } else {
          // Handle generic API error
          setErrors([error.message]);
        }
      } else {
        // Handle unknown errors
        setErrors(["An unexpected error occurred. Please try again."]);
      }
      logger.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Apollo</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.length > 0 && <ErrorBox errors={errors} />}

          <Input
            label="Username"
            type="text"
            name="username"
            value={credentials.username}
            onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={(e) =>
                setCredentials((prev) => ({ ...prev, password: e.target.value }))
              }
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
          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              isLoading={isLoading}
              className={styles.button}
            >
              Create Account
            </Button>
          </div>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login">
            <span className={styles.link}>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}