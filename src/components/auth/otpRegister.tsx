import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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
  const [timeLeft, setTimeLeft] = useState<number>(60); // 1 min
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
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  // 🔄 Resend OTP
  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await axios.post(`${api}/api/register-init`, userInfo);

      if (res.data?.temp_token) {
        toast.success("OTP resent successfully!", { theme: "colored" });
        setTimeLeft(600);
        setOtpDigits(Array(6).fill(""));
        setError("");
      } else {
        throw new Error("No temp_token received");
      }
    } catch (err) {
      console.error("❌ OTP resend error:", err);
      toast.error("Failed to resend OTP. Try again later.");
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
    <form
      onSubmit={handleOtpVerify}
      className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner"
    >
      <h3 className="text-lg font-semibold text-blue-800 text-center mb-2">
        Verify Your Email
      </h3>
      <p className="text-center text-gray-600 mb-4 text-sm">
        Enter the 6-digit OTP sent to your email.
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
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
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center mb-3">
        OTP expires in{" "}
        <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
      </p>

      <div className="flex flex-col items-center gap-2">
        <button
          type="submit"
          className="w-40 py-2 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          disabled={timeLeft <= 0}
        >
          Verify OTP
        </button>

        {timeLeft <= 0 && (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="text-sm text-blue-600 hover:underline"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        )}
      </div>
    </form>
  );
};

export default OtpRegister;
