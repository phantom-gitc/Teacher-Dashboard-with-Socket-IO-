import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Info, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCard from "@/components/AuthCard";

// ── Zod validation schema for Teacher Registration ──
const teacherRegisterSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  department: z.literal("CSIT"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((val) => val.endsWith("@csit.edu.in"), {
      message: "Must use college email ending with @csit.edu.in",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(teacherRegisterSchema),
    mode: "onChange",
    defaultValues: {
      department: "CSIT",
    },
  });

  // ── Handle teacher registration submission ──
  const onSubmit = async (data) => {
    // Simulate network delay (1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show success message and redirect after 2 seconds
    setSuccessMessage(
      "Request submitted! Pending admin approval. Redirecting..."
    );
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <AuthCard
      leftEyebrow="Educator portal"
      leftTagline="Empower your classroom with smart academic tools."
    >
      {/* Decorative orange asterisk */}
      <span className="text-[#e8612a] text-2xl font-bold leading-none mb-2 block">
        *
      </span>

      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">
        Create teacher account
      </h1>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Register as an educator on the CSIT Hub platform.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* ── Full Name ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Dr. Priya Sharma"
            {...register("fullName")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* ── Teacher ID ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Teacher ID
          </label>
          <input
            type="text"
            placeholder="TCH2024001"
            {...register("teacherId")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8612a] bg-gray-50"
          />
          {errors.teacherId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.teacherId.message}
            </p>
          )}
        </div>

        {/* ── Department (locked to CSIT) ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Department
          </label>
          <div className="relative">
            <select
              disabled
              {...register("department")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed appearance-none pr-10"
            >
              <option value="CSIT">CSIT</option>
            </select>
            <Lock
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* ── College Email ── */}
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
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* ── Password with visibility toggle ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
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

        {/* ── Admin review info box ── */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 py-2">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs">
            Your account will be reviewed by the admin before activation.
            You&apos;ll receive a confirmation email once approved.
          </AlertDescription>
        </Alert>

        {/* ── Success Alert ── */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-400 text-green-700 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Submit Button with loading state ── */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting request...
            </>
          ) : (
            "Request Teacher Account"
          )}
        </button>
      </form>

      {/* ── Bottom login link ── */}
      <p className="text-xs md:text-sm text-gray-500 mt-4 text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#e8612a] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};

export default TeacherRegister;
