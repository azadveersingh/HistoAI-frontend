import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn - HistoAI"
        description="This is SignIn Page for the HistoAI Application"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
