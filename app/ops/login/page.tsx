import { LoginForm } from "./login-form";

type OpsLoginPageProps = {
  searchParams: Promise<{ expired?: string; error?: string; token?: string }>;
};

export default async function OpsLoginPage({ searchParams }: OpsLoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <LoginForm
        sessionExpired={params.expired === "1"}
        loginError={params.error === "1"}
        demoToken={params.token ?? ""}
      />
    </div>
  );
}
