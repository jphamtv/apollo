import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm onSuccess={() => navigate("/")} />
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
