import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterCredentials } from "../../../shared/types/authTypes";
import { Button } from "../../../shared/components/ui";
import { apiClient } from "../../../shared/utils/apiClient";

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
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-center">{error}</div>}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
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
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={credentials.email}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
