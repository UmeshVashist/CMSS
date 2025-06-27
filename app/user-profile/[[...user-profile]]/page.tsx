import { UserProfile } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gray-400">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="hover:bg-orange-500 hover:text-white" variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex justify-between  text-white">Profile Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex justify-center">
        <UserProfile
          appearance={{
            elements: {
              card: "shadow-xl",
            },
          }}
        />
      </main>
    </div>
  )
}
