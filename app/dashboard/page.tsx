"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, Printer } from "lucide-react"
import { type Transaction, transactionService } from "@/lib/database"
import {
  calculateBalance,
  getCurrentMonthCredit,
  getCurrentMonthDebit,
  getLastMonthClosingBalance,
  formatCurrency,
  canEditTransaction,
  formatDateToDDMMYYYY,
} from "@/lib/utils"
import { AddTransactionDialog, TRANSACTION_CATEGORIES } from "@/components/add-transaction-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { addSampleTransactions } from "@/lib/sample-data"

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [sampleDataAdded, setSampleDataAdded] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isLoaded && user) {
      loadTransactions()
    }
  }, [user, isLoaded, isSignedIn, router])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm])

  const loadTransactions = async () => {
    if (!user) return

    console.log("Loading transactions for user:", user.id)

    try {
      const userTransactions = await transactionService.getTransactionsByUserId(user.id)
      console.log("Loaded transactions:", userTransactions.length)

      const sortedTransactions = userTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setTransactions(sortedTransactions)

      console.log("Transactions set in state:", sortedTransactions.length)
    } catch (error) {
      console.error("Error loading transactions:", error)
      alert("Error loading transactions. Please refresh the page.")
    }
  }

  const handleAddSampleData = async () => {
    if (!user || sampleDataAdded) return
    try {
      await addSampleTransactions(user.id)
      setSampleDataAdded(true)
      loadTransactions()
    } catch (error) {
      console.error("Error adding sample data:", error)
    }
  }

  const filterTransactions = () => {
    if (!searchTerm) {
      setFilteredTransactions(transactions.slice(0, 10))
      return
    }

    const filtered = transactions
      .filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount.toString().includes(searchTerm) ||
          formatDateToDDMMYYYY(transaction.date).includes(searchTerm),
      )
      .slice(0, 10)

    setFilteredTransactions(filtered)
  }

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.deleteTransaction(id)
        loadTransactions()
      } catch (error) {
        console.error("Error deleting transaction:", error)
      }
    }
  }

  const handlePrintTransaction = (transaction: Transaction) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Transaction Receipt</title></head>
          <body>
            <h2>Transaction Receipt</h2>
            <p><strong>Description:</strong> ${transaction.description}</p>
            <p><strong>Amount:</strong> ${formatCurrency(transaction.amount)}</p>
            <p><strong>Type:</strong> ${transaction.type}</p>
            <p><strong>Method:</strong> ${transaction.method}</p>
            <p><strong>Date:</strong> ${formatDateToDDMMYYYY(transaction.date)}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Show loading state
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

  // Redirect if not signed in
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => router.push("/sign-in")}>Go to Sign In</Button>
        </div>
      </div>
    )
  }

  const totalBalance = calculateBalance(transactions)
  const currentMonthCredit = getCurrentMonthCredit(transactions)
  const currentMonthDebit = getCurrentMonthDebit(transactions)
  const lastMonthClosing = getLastMonthClosingBalance(transactions)

  const handleDebugStorage = async () => {
    await transactionService.debugStorage()
  }

  return (
    <div className="min-h-screen bg-gray-400">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthCredit)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(currentMonthDebit)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month Closing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lastMonthClosing >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(lastMonthClosing)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="bg-blue-400 ">
            <div className="flex justify-between  items-center">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription className="text-black">Your last 10 transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                {/* {transactions.length === 0 && !sampleDataAdded && (
                  <Button variant="outline" onClick={handleAddSampleData}>
                    Add Sample Data
                  </Button>
                )} */}
                {process.env.NODE_ENV === "development" && (
                  <Button className="hover:bg-purple-600 hover:text-white " variant="outline" onClick={handleDebugStorage}>
                    Debug Storage 
                  </Button>
                )}
                <Button className="hover:bg-purple-600 hover:text-white bg-white text-black " onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Transaction 
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by amount, date (DD/MM/YYYY), or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <div className="flex gap-2 justify-center">
                    {/* {!sampleDataAdded && (
                      <Button variant="outline" onClick={handleAddSampleData}>
                        Add Sample Data
                      </Button>
                    )} */}
                    <Button className="hover:bg-orange-500 hover:text-white" onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </div>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const category = TRANSACTION_CATEGORIES.find((c) => c.value === transaction.category)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{transaction.description}</h3>
                          <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {transaction.method} • {formatDateToDDMMYYYY(transaction.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (canEditTransaction(transaction.date)) {
                                setEditingTransaction(transaction)
                                setShowEditDialog(true)
                              } else {
                                alert("You can only edit transactions from the current month")
                              }
                            }}
                            disabled={!canEditTransaction(transaction.date)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlePrintTransaction(transaction)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTransaction(transaction.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onTransactionAdded={loadTransactions}
        userId={user.id}
      />

      <TransactionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        transaction={selectedTransaction}
      />

      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        transaction={editingTransaction}
        onTransactionUpdated={loadTransactions}
      />
    </div>
  )
}
