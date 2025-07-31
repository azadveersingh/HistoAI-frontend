import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../pages/AuthPages/AuthPageLayout";
import { api } from "../../api/api";

interface UserInfo {
  fullName: string;
  email: string;
  password: string;
}

interface OtpRegisterProps {
  tempToken: string;
  userInfo: UserInfo;
  onRegisterComplete?: () => void;
}

const OtpRegister: React.FC<OtpRegisterProps> = ({
  tempToken,
  userInfo,
  onRegisterComplete,
}) => {
  const navigate = useNavigate();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 min
  const [resending, setResending] = useState<boolean>(false);

  // ⏱ Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ Handle OTP submit
  const handleOtpVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const otp = otpDigits.join("");

    try {
      const res = await axios.post(`${api}/api/verify-register-otp`, {
        temp_token: tempToken,
        otp,
      });

      toast.success("Email verified successfully! Please login now.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      onRegisterComplete?.() ||
        navigate("/", {
          state: { message: "Email verified. Please login." },
        });
    } catch (err: any) {
      console.error("❌ OTP verify error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // 🔄 Resend OTP
  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await axios.post(`${api}/api/register-init`, userInfo);

      if (res.data?.temp_token) {
        toast.success("OTP resent successfully!", { theme: "colored" });
        setTimeLeft(180); // Reset to 3 min
        setOtpDigits(Array(6).fill(""));
        setError("");
      } else {
        throw new Error("No temp_token received");
      }
    } catch (err) {
      console.error("❌ OTP resend error:", err);
      toast.error("Failed to resend OTP. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  // 🔤 Handle digit change
  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[idx] = value;
    setOtpDigits(updated);

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  // ⌫ Handle backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // 📋 Handle paste (bulk OTP)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("Text").slice(0, 6).split("");
    const updated = Array(6).fill("");
    pasted.forEach((char, i) => {
      if (/\d/.test(char)) updated[i] = char;
    });
    setOtpDigits(updated);
    setTimeout(() => {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }, 0);
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-6 sm:p-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          Verify Your Email
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">{userInfo.email}</span>
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleOtpVerify}>
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                ref={(el) => (inputRefs.current[idx] = el)}
                className="w-12 h-12 text-center text-xl font-medium border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700 dark:text-white"
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Code expires in{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={timeLeft <= 0}
            >
              Verify Code
            </button>

            {timeLeft <= 0 && (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const OtpPage: React.FC<OtpRegisterProps> = (props) => {
  return (
    <AuthLayout>
      <OtpRegister {...props} />
    </AuthLayout>
  );
};

export default OtpRegister;