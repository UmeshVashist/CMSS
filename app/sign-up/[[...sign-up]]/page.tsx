import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-500">
      <SignUp redirectUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  )
}