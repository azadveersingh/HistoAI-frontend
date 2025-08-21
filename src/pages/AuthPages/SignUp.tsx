import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | HistoAI"
        description="Create a new account on HistoAI"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
