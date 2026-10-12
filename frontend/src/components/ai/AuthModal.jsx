import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/AuthContext";
import { authApi } from "../../api/auth";
import MainLogo from "../common/MainLogo";

const TABS = { LOGIN: "login", SIGNUP: "signup", FORGOT: "forgot" };

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

export default function AuthModal() {
  const { signup, verifyOtp, login } = useUser();
  const [tab, setTab] = useState(TABS.LOGIN);
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [signupStep, setSignupStep] = useState("form"); // "form" | "otp"
  const [signupOtp, setSignupOtp] = useState("");

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email"); // "email" | "reset"
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ---------- Handlers ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({
        name: signupData.name.trim(),
        email: signupData.email.trim(),
        phone: signupData.phone.trim() || null,
        password: signupData.password,
      });
      toast.success("Code sent to your email!");
      setSignupStep("otp");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(signupData.email.trim(), signupOtp.trim());
      toast.success("Welcome to NextraAI!");
    } catch (err) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgot(forgotEmail.trim());
      toast.success("If the email exists, a code has been sent");
      setForgotStep("reset");
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.reset(forgotEmail.trim(), resetOtp.trim(), newPassword);
      toast.success("Password reset! Please log in.");
      setTab(TABS.LOGIN);
      setLoginEmail(forgotEmail.trim());
      setForgotStep("email");
      setResetOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center px-5 py-6"
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/5 border border-leetcode-yellow/30 mb-3">
            <MainLogo size={30} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {tab === TABS.LOGIN && "Welcome back"}
            {tab === TABS.SIGNUP &&
              (signupStep === "form"
                ? "Create your account"
                : "Verify your email")}
            {tab === TABS.FORGOT &&
              (forgotStep === "email"
                ? "Reset password"
                : "Enter new password")}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {tab === TABS.LOGIN && "Log in to use NextraAI"}
            {tab === TABS.SIGNUP &&
              signupStep === "form" &&
              "Signup to unlock NextraAI"}
            {tab === TABS.SIGNUP &&
              signupStep === "otp" &&
              `We sent a 6-digit code to ${signupData.email}`}
            {tab === TABS.FORGOT &&
              forgotStep === "email" &&
              "We'll email you a reset code"}
            {tab === TABS.FORGOT &&
              forgotStep === "reset" &&
              `Enter code sent to ${forgotEmail}`}
          </p>
        </div>

        {/* Tabs (only when not in OTP/reset step) */}
        {(tab === TABS.LOGIN ||
          (tab === TABS.SIGNUP && signupStep === "form") ||
          (tab === TABS.FORGOT && forgotStep === "email")) && (
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-800 rounded-lg mb-4">
            <button
              onClick={() => setTab(TABS.LOGIN)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === TABS.LOGIN
                  ? "bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab(TABS.SIGNUP)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === TABS.SIGNUP
                  ? "bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Signup
            </button>
          </div>
        )}

        {/* ---------- LOGIN ---------- */}
        {tab === TABS.LOGIN && (
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              icon={<FiMail size={16} />}
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              icon={<FiLock size={16} />}
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            <button
              type="button"
              onClick={() => setTab(TABS.FORGOT)}
              className="w-full text-center text-xs text-gray-500 hover:text-leetcode-yellow transition-colors"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* ---------- SIGNUP ---------- */}
        {tab === TABS.SIGNUP && signupStep === "form" && (
          <form onSubmit={handleSignup} className="space-y-3">
            <Input
              icon={<FiUser size={16} />}
              type="text"
              placeholder="Full name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              required
              minLength={2}
              autoComplete="name"
            />
            <Input
              icon={<FiMail size={16} />}
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              required
              autoComplete="email"
            />
            <Input
              icon={<FiPhone size={16} />}
              type="tel"
              placeholder="Phone (optional)"
              value={signupData.phone}
              onChange={(e) =>
                setSignupData({ ...signupData, phone: e.target.value })
              }
              autoComplete="tel"
            />
            <Input
              icon={<FiLock size={16} />}
              type="password"
              placeholder="Password (min 8 chars)"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Create account"}
            </button>
            <p className="text-[11px] text-center text-gray-400">
              Free plan: 25 messages/day · No credit card
            </p>
          </form>
        )}

        {tab === TABS.SIGNUP && signupStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={signupOtp}
              onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
            />
            <button
              type="submit"
              disabled={loading || signupOtp.length !== 6}
              className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => setSignupStep("form")}
              className="flex items-center gap-1 mx-auto text-xs text-gray-500 hover:text-leetcode-yellow transition-colors"
            >
              <FiArrowLeft size={12} /> Change email
            </button>
          </form>
        )}

        {/* ---------- FORGOT ---------- */}
        {tab === TABS.FORGOT && forgotStep === "email" && (
          <form onSubmit={handleForgot} className="space-y-3">
            <Input
              icon={<FiMail size={16} />}
              type="email"
              placeholder="Your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
            <button
              type="button"
              onClick={() => setTab(TABS.LOGIN)}
              className="w-full text-center text-xs text-gray-500 hover:text-leetcode-yellow transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}

        {tab === TABS.FORGOT && forgotStep === "reset" && (
          <form onSubmit={handleReset} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
            />
            <Input
              icon={<FiLock size={16} />}
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="submit"
              disabled={loading || resetOtp.length !== 6}
              className="w-full bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
