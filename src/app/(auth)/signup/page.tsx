import { SignUpForm } from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | LearnDepth",
  description: "Create your LearnDepth account.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
