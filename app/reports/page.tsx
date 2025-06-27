"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Calendar, ArrowLeft, BarChart3 } from "lucide-react"
import { type Transaction, transactionService } from "@/lib/database"
import { formatCurrency, formatDateToDDMMYYYY } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { TRANSACTION_CATEGORIES } from "@/components/add-transaction-dialog"
import { UserButton } from "@/components/user-button"

export default function Reports() {
  const { user, isLoaded } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      loadTransactions()
    }
  }, [user, isLoaded])

  const loadTransactions = async () => {
    if (!user) return
    const userTransactions = await transactionService.getTransactionsByUserId(user.id)
    const sortedTransactions = userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setTransactions(sortedTransactions)
    setFilteredTransactions(sortedTransactions)
  }

  const filterByDateRange = (fromDate: string, toDate: string) => {
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999) // Include the entire end date
      return transactionDate >= from && transactionDate <= to
    })
    setFilteredTransactions(filtered)
  }

  const handleQuickFilter = (days: number) => {
    const today = new Date()
    let fromDate: Date

    if (days === 0) {
      // Today
      fromDate = new Date(today)
      fromDate.setHours(0, 0, 0, 0)
    } else {
      fromDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    }

    const fromStr = fromDate.toISOString().split("T")[0]
    const toStr = today.toISOString().split("T")[0]

    setDateRange({ from: fromStr, to: toStr })
    filterByDateRange(fromStr, toStr)
  }

  const handleCustomDateFilter = () => {
    if (dateRange.from && dateRange.to) {
      filterByDateRange(dateRange.from, dateRange.to)
    }
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const totalCredit = filteredTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
      const totalDebit = filteredTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary-item { display: inline-block; margin-right: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .credit { color: green; }
            .debit { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Transaction Report</h1>
            <p>User: ${user?.firstName} ${user?.lastName}</p>
            <p>Email: ${user?.emailAddresses[0]?.emailAddress}</p>
            <p>Generated on: ${formatDateToDDMMYYYY(new Date())}</p>
            <p>Total Transactions: ${filteredTransactions.length}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Total Credit: ${formatCurrency(totalCredit)}</strong>
            </div>
            <div class="summary-item">
              <strong>Total Debit: ${formatCurrency(totalDebit)}</strong>
            </div>
            <div class="summary-item">
              <strong>Net Balance: ${formatCurrency(totalCredit - totalDebit)}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions
          .map((transaction) => {
            const category = TRANSACTION_CATEGORIES.find((c) => c.value === transaction.category)
            return `
                  <tr>
                    <td>${formatDateToDDMMYYYY(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>${category?.label || "Others"}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.method}</td>
                    <td class="${transaction.type}">${formatCurrency(transaction.amount)}</td>
                  </tr>
                `
          })
          .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `

      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateExcel = async () => {
    setIsGenerating(true)
    try {
      const headers = ["Date", "Description", "Category", "Type", "Method", "Amount"]
      const csvContent = [
        headers.join(","),
        ...filteredTransactions.map((transaction) => {
          const category = TRANSACTION_CATEGORIES.find((c) => c.value === transaction.category)
          return [
            formatDateToDDMMYYYY(transaction.date),
            `"${transaction.description}"`,
            `"${category?.label || "Others"}"`,
            transaction.type,
            transaction.method,
            transaction.amount,
          ].join(",")
        }),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `transaction-report-${user?.firstName}-${formatDateToDDMMYYYY(new Date()).replace(/\//g, "-")}.csv`,
      )
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Error generating Excel file. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

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

  if (!user) {
    return null // Middleware will redirect to sign-in
  }

  const totalCredit = filteredTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = filteredTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-400 ">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Reports</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button className="hover:bg-orange-500 hover:text-white" variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/analytics">
                <Button className="hover:bg-orange-500 hover:text-white" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2 " />
                  Analytics
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 ">
          <h2 className="text-3xl font-bold text-black flex justify-center items-center mb-2">Transaction Reports</h2>
          <p className="text-black flex justify-center items-center">Generate and download detailed transaction reports</p>
        </div>

        {/* Quick Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
            <CardDescription>Filter transactions by predefined time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button className="hover:bg-purple-600 hover:text-white" variant="outline" onClick={() => handleQuickFilter(0)}>
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button className="hover:bg-purple-600 hover:text-white" variant="outline" onClick={() => handleQuickFilter(7)}>
                Last 7 Days
              </Button>
              <Button className="hover:bg-purple-600 hover:text-white" variant="outline" onClick={() => handleQuickFilter(30)}>
                Last 30 Days
              </Button>
              <Button className="hover:bg-purple-600 hover:text-white" variant="outline" onClick={() => handleQuickFilter(90)}>
                Last 90 Days
              </Button>
              <Button
                className="hover:bg-purple-600 hover:text-white"
                variant="outline"
                onClick={() => {
                  setFilteredTransactions(transactions)
                  setDateRange({ from: "", to: "" })
                }}
              >
                All Time
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Date Range */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Date Range</CardTitle>
            <CardDescription>Select a custom date range for your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <div className="flex items-end ">
                <Button onClick={handleCustomDateFilter} className="w-full  hover:bg-orange-500" disabled={!dateRange.from || !dateRange.to}>
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(totalCredit - totalDebit) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(totalCredit - totalDebit)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Download Report</CardTitle>
            <CardDescription>
              Download your filtered transactions ({filteredTransactions.length} transactions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="hover:bg-orange-500 hover:text-white" onClick={generatePDF} disabled={isGenerating || filteredTransactions.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={generateExcel}
                className="bg-black text-white hover:bg-orange-500 hover:text-white"
                variant="outline"
                disabled={isGenerating || filteredTransactions.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Preview</CardTitle>
            <CardDescription>Preview of filtered transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No transactions found for the selected period</p>
                <Link href="/dashboard">
                  <Button>Add Transactions</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTransactions.slice(0, 50).map((transaction) => {
                  const category = TRANSACTION_CATEGORIES.find((c) => c.value === transaction.category)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{transaction.description}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${transaction.type === "credit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {transaction.type}
                          </span>
                          {category && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              {category.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {transaction.method} • {formatDateToDDMMYYYY(transaction.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {filteredTransactions.length > 50 && (
                  <p className="text-center text-gray-500 py-2">
                    Showing first 50 transactions. Download full report to see all {filteredTransactions.length}{" "}
                    transactions.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
