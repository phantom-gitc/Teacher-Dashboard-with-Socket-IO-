import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCard from "@/components/AuthCard";
import { useAuthStore } from "@/store";
import { MOCK_USERS, MOCK_JWT } from "@/lib/constants";

// ── Zod validation schema for Login ──
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // ── Auto-redirect if already logged in ──
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboard =
        user.role === "student"
          ? "/student/dashboard"
          : "/teacher/dashboard";
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ── Handle login submission ──
  const onSubmit = async (data) => {
    setAuthError("");

    // Simulate network delay (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Match credentials against mock users
    const matchedUser = MOCK_USERS.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (!matchedUser) {
      setAuthError("Invalid email or password");
      return;
    }

    // Get the mock JWT for the matched role and log the user in
    const token = MOCK_JWT[matchedUser.role];
    login(token);

    // Navigate to the correct dashboard
    const dashboard =
      matchedUser.role === "student"
        ? "/student/dashboard"
        : "/teacher/dashboard";
    navigate(dashboard, { replace: true });
  };

  return (
    <AuthCard
      leftEyebrow="Welcome back"
      leftTagline="Your academic hub is ready and waiting."
    >
      {/* Decorative orange asterisk */}
      <span className="text-[#e8612a] text-3xl font-bold leading-none mb-4 block">
        *
      </span>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Sign in to your account
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your college credentials to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Email Field ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            College Email
          </label>
          <input
            type="email"
            placeholder="you@csit.edu.in"
            {...register("email")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* ── Password Field with visibility toggle ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Password
          </label>
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
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ── Error Alert (wrong credentials) ── */}
        {authError && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-sm">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Submit Button with loading state ── */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* ── Bottom registration links ── */}
      <p className="text-sm text-gray-500 mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link
          to="/register/student"
          className="text-[#e8612a] font-medium hover:underline"
        >
          Register as Student
        </Link>{" "}
        |{" "}
        <Link
          to="/register/teacher"
          className="text-[#e8612a] font-medium hover:underline"
        >
          Register as Teacher
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;
