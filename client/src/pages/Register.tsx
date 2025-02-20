import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterCredentials } from "../types/user";
import { apiClient } from "../utils/apiClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input"
import styles from './Register.module.css'

export default function Register() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await apiClient.post("/auth/register", credentials);
      navigate("/login", {
        state: { message: "Account created successfully. Please login." },
      });
    } catch (err) {
      setError("Failed to create account");
      console.error('Register error: ', err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div>{error}</div>}

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

          <Button type="submit">
            Create Account
          </Button>
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
