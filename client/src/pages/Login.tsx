import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateForm } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
    <div className={styles.container}>
      <h1>Messages App</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <Button type="submit" isLoading={isLoading}>
          Log In
        </Button>
      </form>

      <p>
        Don't have an account?{" "}
        <Link to="/register">
          Create one
        </Link>
      </p>
    </div>
  );
}