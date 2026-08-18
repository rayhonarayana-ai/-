import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoginPanelProps {
  onLoginSuccess?: (user: { name: string; role: "parent" | "child" | "guest" }) => void;
  onClose?: () => void;
}

export default function LoginPanel({ onLoginSuccess, onClose }: LoginPanelProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"parent" | "child">("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!email || !password || (mode === "signup" && !name)) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    onLoginSuccess?.({
      name: name || email.split("@")[0],
      role: role,
    });

    setIsLoading(false);
  };

  const handleGuest = () => {
    onLoginSuccess?.({
      name: "ضيف",
      role: "guest",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dir-rtl"
      >
        {/* رأس الملون */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 text-center text-white">
          <h2 className="text-2xl font-bold">
            {mode === "login" ? "مرحبًا بعودتك!" : "انضم إلينا"}
          </h2>
          <p className="mt-1 text-sm opacity-90">
            مُعلِّمُ الذَّكاء — رحلة الذكاء الاصطناعي للأطفال
          </p>
        </div>

        {/* أزرار التبديل بين الدخول والتسجيل */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-sm font-medium transition cursor-pointer ${
              mode === "login"
                ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-sm font-medium transition cursor-pointer ${
              mode === "signup"
                ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            إنشاء حساب
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* اختيار الدور */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("parent")}
              className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition cursor-pointer ${
                role === "parent"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              👨‍👩‍👧‍👦 ولي أمر
            </button>
            <button
              type="button"
              onClick={() => setRole("child")}
              className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition cursor-pointer ${
                role === "child"
                  ? "border-pink-500 bg-pink-50 text-pink-700 font-bold"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              🧒 طفل
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ياسين أو فاطمة"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              البريد الإلكتروني أو رقم الهاتف
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com أو 06xxxxxxxx"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              dir="ltr"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-500 font-bold"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-medium text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                جاري التحقق...
              </span>
            ) : mode === "login" ? (
              "دخول"
            ) : (
              "إنشاء الحساب"
            )}
          </button>
        </form>

        {/* دخول كضيف */}
        <div className="border-t px-6 py-4 text-center">
          <button
            type="button"
            onClick={handleGuest}
            className="text-sm font-medium text-gray-500 transition hover:text-indigo-600 cursor-pointer"
          >
            الدخول كضيف (بدون حساب) ←
          </button>
        </div>

        {/* زر الإغلاق */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  );
}
