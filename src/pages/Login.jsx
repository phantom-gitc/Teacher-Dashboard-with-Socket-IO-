// src/pages/Login.jsx — Real backend authentication
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCard from "@/components/AuthCard";
import { useAuthStore } from "@/store";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "student" ? "/student/dashboard" : "/teacher/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setAuthError("");
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(result.role === "student" ? "/student/dashboard" : "/teacher/dashboard", { replace: true });
    } else {
      setAuthError(result.error || "Invalid email or password");
    }
  };

  return (
    <AuthCard leftEyebrow="Welcome back" leftTagline="Your academic hub is ready and waiting.">
      <span className="text-[#e8612a] text-3xl font-bold leading-none mb-4 block">*</span>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
      <p className="text-sm text-gray-500 mb-6">Enter your college credentials to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">College Email</label>
          <input
            type="email"
            placeholder="you@csit.edu.in"
            {...register("email")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {authError && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-sm">{authError}</AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register/student" className="text-[#e8612a] font-medium hover:underline">Register as Student</Link>{" "}|{" "}
        <Link to="/register/teacher" className="text-[#e8612a] font-medium hover:underline">Register as Teacher</Link>
      </p>
      <p className="text-xs text-gray-400 mt-2 text-center">
        <Link to="/forgot-password" className="hover:underline">Forgot password?</Link>
      </p>
    </AuthCard>
  );
};

export default Login;
