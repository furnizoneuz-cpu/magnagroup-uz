import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Kirish | Magna Group" };

export default function LoginPage({ params }) {
  return (
    <div className="container-x">
      <AuthForm lang={params.lang} mode="login" />
    </div>
  );
}
