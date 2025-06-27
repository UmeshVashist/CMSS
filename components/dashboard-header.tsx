"use client"

import { Button } from "@/components/ui/button"
import { FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { UserButton } from "@/components/user-button"

export function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="bg-blue-600 shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Cash Management System</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/analytics">
              <Button className="hover:bg-orange-500 hover:text-white" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="hover:bg-orange-500 hover:text-white" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-white">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}