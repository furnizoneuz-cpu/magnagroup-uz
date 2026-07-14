"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const T = {
  uz: {
    loginTitle: "Kirish", regTitle: "Ro'yxatdan o'tish",
    name: "Ism", email: "Email", password: "Parol",
    login: "Kirish", register: "Ro'yxatdan o'tish",
    fb: "Facebook bilan davom etish", google: "Google bilan davom etish",
    or: "yoki", noAcc: "Akkauntingiz yo'qmi?", haveAcc: "Akkauntingiz bormi?",
    toReg: "Ro'yxatdan o'ting", toLogin: "Kiring",
    errInvalid: "Email yoki parol xato", errExists: "Bu email allaqachon ro'yxatdan o'tgan",
    errWeak: "Parol kamida 6 belgidan iborat bo'lsin", errEmail: "Email noto'g'ri",
    errServer: "Xatolik, qayta urinib ko'ring", fbSoon: "Facebook kirish tez orada ulanadi",
  },
  ru: {
    loginTitle: "Вход", regTitle: "Регистрация",
    name: "Имя", email: "Email", password: "Пароль",
    login: "Войти", register: "Зарегистрироваться",
    fb: "Продолжить с Facebook", google: "Продолжить с Google",
    or: "или", noAcc: "Нет аккаунта?", haveAcc: "Уже есть аккаунт?",
    toReg: "Зарегистрируйтесь", toLogin: "Войдите",
    errInvalid: "Неверный email или пароль", errExists: "Этот email уже зарегистрирован",
    errWeak: "Пароль минимум 6 символов", errEmail: "Некорректный email",
    errServer: "Ошибка, попробуйте снова", fbSoon: "Вход через Facebook скоро подключится",
  },
  en: {
    loginTitle: "Sign in", regTitle: "Create account",
    name: "Name", email: "Email", password: "Password",
    login: "Sign in", register: "Create account",
    fb: "Continue with Facebook", google: "Continue with Google",
    or: "or", noAcc: "No account?", haveAcc: "Have an account?",
    toReg: "Sign up", toLogin: "Sign in",
    errInvalid: "Wrong email or password", errExists: "This email is already registered",
    errWeak: "Password must be at least 6 characters", errEmail: "Invalid email",
    errServer: "Something went wrong, try again", fbSoon: "Facebook login connects soon",
  },
};

export default function AuthForm({ lang = "uz", mode = "login" }) {
  const t = T[lang] || T.uz;
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const isReg = mode === "register";

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const res = await fetch(isReg ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReg ? { name, email, password } : { email, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(t["err" + ({ invalid_credentials: "Invalid", exists: "Exists", weak_password: "Weak", invalid_email: "Email" }[d.error] || "Server")]);
        return;
      }
      await refresh();
      router.push(`/${lang}`);
    } catch {
      setErr(t.errServer);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-14">
      <h1 className="display-head text-3xl text-[#111]">{isReg ? t.regTitle : t.loginTitle}</h1>

      <div className="mt-6 space-y-2">
        <a href={`/api/auth/google?lang=${lang}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white py-3 text-sm font-semibold text-[#111] transition hover:bg-[#f5f5f5]">
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.6-4.8H1.5v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.5a12 12 0 0 0 0 11l3.9-3.1Z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.5 6.5l3.9 3.1C6.4 6.8 9 4.8 12 4.8Z"/></svg>
          {t.google}
        </a>
        <a href={`/api/auth/facebook?lang=${lang}`}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] py-3 text-sm font-semibold text-white transition hover:brightness-95">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>
          {t.fb}
        </a>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-[#757575]">
        <span className="h-px flex-1 bg-black/10" />{t.or}<span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {isReg && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} autoComplete="name"
            className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm outline-none focus:border-[#111]" />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder={t.email} autoComplete="email"
          className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm outline-none focus:border-[#111]" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder={t.password}
          autoComplete={isReg ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm outline-none focus:border-[#111]" />
        {err && <div className="text-sm font-medium text-[#9E3500]">{err}</div>}
        <button disabled={busy} className="btn-pill w-full !py-3 disabled:opacity-50">
          {busy ? "…" : isReg ? t.register : t.login}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-[#757575]">
        {isReg ? t.haveAcc : t.noAcc}{" "}
        <Link href={`/${lang}/${isReg ? "login" : "register"}`} className="font-semibold text-[#111] hover:underline">
          {isReg ? t.toLogin : t.toReg}
        </Link>
      </div>
    </div>
  );
}
