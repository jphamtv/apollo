import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { validateForm } from "../../utils/validation";
import { Button, Input } from "../../components";

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
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
      onSuccess?.();
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
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Log In
      </Button>
    </form>
  );
};
