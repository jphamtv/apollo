import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div>
      <div>
        <h1>Sign In</h1>
        <LoginForm onSuccess={() => navigate("/")} />
        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
