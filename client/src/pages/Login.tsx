import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateForm } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorBox from "../components/ui/ErrorBox";
import { isApiError, hasValidationErrors } from "../types/error";
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [values, setValues] = useState <{ email: string, password: string }>({
    email: "",
    password: "",
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
      navigate("/");
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
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Apollo</h1>
          
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">
              <span className={styles.signUpLink}>Forgot password?</span>
            </Link>
          </div>
          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              isLoading={isLoading}
              className={styles.button}
            >
              Log In
            </Button>
          </div>
        </form>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register">
            <span className={styles.signUpLink}>Sign up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}