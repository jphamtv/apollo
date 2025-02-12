import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterCredentials } from "../types/authTypes";
import { apiClient } from "../utils/apiClient";
import Button from "../components/ui/Button";

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
    <div>
      <div>
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div>{error}</div>}

          <div>
            <label
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={credentials.email}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>

          <Button type="submit">
            Create Account
          </Button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
