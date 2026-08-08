import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LearnDepth",
  description: "Sign in to your LearnDepth account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
