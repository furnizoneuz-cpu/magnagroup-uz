import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Ro'yxatdan o'tish | Magna Group" };

export default function RegisterPage({ params }) {
  return (
    <div className="container-x">
      <AuthForm lang={params.lang} mode="register" />
    </div>
  );
}
