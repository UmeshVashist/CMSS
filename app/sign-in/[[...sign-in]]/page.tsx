import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  )
}
