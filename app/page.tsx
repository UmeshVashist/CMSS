"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, Shield, Smartphone } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="container  mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cash Management System</h1>
          <div className="flex gap-2">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Manage Your Finances with Ease</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track your income and expenses, generate reports, and take control of your financial future with our
            comprehensive cash management system.
          </p>
          {!isSignedIn ? (
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started Sign Up <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Welcome back, {user.firstName}! Ready to manage your finances?
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Track Transactions & Analytics</CardTitle>
              <CardDescription>
                Monitor all your income and expenses in one place with detailed categorization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your financial data is protected with enterprise-grade security and encryption
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Easy to Use</CardTitle>
              <CardDescription>Intuitive interface designed for users of all technical backgrounds</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Take Control?</h3>
          <p className="text-gray-600 mb-6">Join thousands of users who have simplified their financial management</p>
          {!isSignedIn ? (
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg">Start Managing Your Cash Today</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">
                  Already have an account?
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
