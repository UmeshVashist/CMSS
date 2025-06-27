"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, BarChart3, FileText } from "lucide-react"
import { type Transaction, transactionService } from "@/lib/database"
import { formatCurrency, formatDateToDDMMYYYY } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { addSampleTransactions } from "@/lib/sample-data"
import { UserButton } from "@/components/user-button"

// Transaction categories with proper mapping
const CATEGORIES = [
  { value: "fuel", label: "Fuel Expense", color: "#D926ED" },
  { value: "grocery", label: "Grocery", color: "#94BBE9" },
  { value: "shopping", label: "Shopping", color: "#26EDEA" },
  { value: "salary", label: "Salary Payment", color: "#ED26ED" },
  { value: "vegetables", label: "Vegetables", color: "#7FFF00" },
  { value: "investment", label: "Investment", color: "#F23350" },
  { value: "investment_return", label: "Investment Return", color: "#2626ED" },
  { value: "medicine", label: "Medicine", color: "#FAE01B" },
  { value: "entertainment", label: "Entertainment", color: "#FF7F50" },
  { value: "emi", label: "EMI Payment", color: "#2C9BC7" },
  { value: "credit_card_bill", label: "Credit Card Bill", color: "#F5A02A" },
  { value: "insurance", label: "Insurance Premium", color: "#7F1BC2" },
  { value: "utilities", label: "Utilities", color: "#D2691E" },
  { value: "rent", label: "Rent Payment", color: "#A52A2A" },
  { value: "education", label: "Education & Training", color: "#E9967A" },
  { value: "travel", label: "Travel & Transportation", color: "#8FBC8F" },
  { value: "food_dining", label: "Food & Dining", color: "#ADFF2F" },
  { value: "healthcare", label: "Healthcare & Medical", color: "#20B2AA" },
  { value: "subscription", label: "Subscriptions & Memberships", color: "#800000" },
  { value: "others", label: "Others", color: "#af25d1" },
]

const COLORS = [
  "#F23350",
  "#D2691E",
  "#FF7F50",
  "#7F1BC2",
  "#7FFF00",
  "#94BBE9",
  "#D926ED",
  "#26EDEA",
  "#ED26ED",
  "#2626ED",
  "#FAE01B",
  "#2C9BC7",
  "#F5A02A",
  "#EF1BFA",
  "#A52A2A",
  "#E9967A",
  "#8FBC8F",
  "#ADFF2F",
  "#20B2AA",
  "#800000",
  "#af25d1",
]

export default function Analytics() {
  const { user, isLoaded } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [expenseAnalysis, setExpenseAnalysis] = useState<any>({})
  const [last3MonthsAnalysis, setLast3MonthsAnalysis] = useState<any>({})
  const [sampleDataAdded, setSampleDataAdded] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      loadTransactions()
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (transactions.length > 0) {
      filterTransactionsByMonth()
    }
  }, [transactions, selectedMonth, selectedYear])

  useEffect(() => {
    generateCategoryData()
    generateMonthlyData()
    generateExpenseAnalysis()
    generateLast3MonthsAnalysis()
  }, [filteredTransactions, transactions])

  const loadTransactions = async () => {
    if (!user) return
    try {
      const userTransactions = await transactionService.getTransactionsByUserId(user.id)
      setTransactions(userTransactions)
      console.log("Loaded transactions:", userTransactions.length)
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  const handleAddSampleData = async () => {
    if (!user || sampleDataAdded) return
    try {
      await addSampleTransactions(user.id)
      setSampleDataAdded(true)
      await loadTransactions()
    } catch (error) {
      console.error("Error adding sample data:", error)
    }
  }

  const filterTransactionsByMonth = () => {
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const isMatchingMonth = transactionDate.getMonth() === selectedMonth
      const isMatchingYear = transactionDate.getFullYear() === selectedYear
      return isMatchingMonth && isMatchingYear
    })
    setFilteredTransactions(filtered)
    console.log(`Filtered transactions for ${selectedMonth}/${selectedYear}:`, filtered.length)
  }

  const generateCategoryData = () => {
    const categoryTotals = CATEGORIES.map((category) => {
      const categoryTransactions = filteredTransactions.filter(
        (t) => t.type === "debit" && t.category === category.value,
      )
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      return {
        name: category.label,
        value: total,
        color: category.color,
        count: categoryTransactions.length,
        category: category.value,
      }
    }).filter((item) => item.value > 0)

    setCategoryData(categoryTotals)
    console.log("Category data:", categoryTotals)
  }

  const generateMonthlyData = () => {
    const last3Months = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year
      })

      const credit = monthTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
      const debit = monthTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

      last3Months.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        credit,
        debit,
        net: credit - debit,
      })
    }
    setMonthlyData(last3Months)
  }

  const generateExpenseAnalysis = () => {
    const debitTransactions = filteredTransactions.filter((t) => t.type === "debit")
    const currentMonthExpenses = debitTransactions.reduce((sum, t) => sum + t.amount, 0)

    const avgExpense = debitTransactions.length > 0 ? currentMonthExpenses / debitTransactions.length : 0

    const highExpenses = debitTransactions.filter((t) => t.amount > avgExpense)
    const lowExpenses = debitTransactions.filter((t) => t.amount <= avgExpense)

    setExpenseAnalysis({
      total: currentMonthExpenses,
      average: avgExpense,
      high: {
        count: highExpenses.length,
        total: highExpenses.reduce((sum, t) => sum + t.amount, 0),
      },
      low: {
        count: lowExpenses.length,
        total: lowExpenses.reduce((sum, t) => sum + t.amount, 0),
      },
    })
  }

  const generateLast3MonthsAnalysis = () => {
    const last3MonthsTransactions = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year
      })

      last3MonthsTransactions.push(...monthTransactions)
    }

    const debitTransactions = last3MonthsTransactions.filter((t) => t.type === "debit")
    const totalExpenses = debitTransactions.reduce((sum, t) => sum + t.amount, 0)
    const avgExpense = debitTransactions.length > 0 ? totalExpenses / debitTransactions.length : 0

    const highExpenses = debitTransactions.filter((t) => t.amount > avgExpense)
    const lowExpenses = debitTransactions.filter((t) => t.amount <= avgExpense)

    setLast3MonthsAnalysis({
      total: totalExpenses,
      average: avgExpense,
      high: {
        count: highExpenses.length,
        total: highExpenses.reduce((sum, t) => sum + t.amount, 0),
      },
      low: {
        count: lowExpenses.length,
        total: lowExpenses.reduce((sum, t) => sum + t.amount, 0),
      },
    })
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
    return null
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="min-h-screen bg-gray-400">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <h1 className="text-2xl font-bold text-white">Transaction Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button className="hover:bg-orange-500 hover:text-white" variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="hover:bg-orange-500 hover:text-white" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
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
        {/* Month/Year Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Period
            </CardTitle>
            <CardDescription>Select month and year to analyze your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* {transactions.length === 0 && !sampleDataAdded && (
                <Button variant="outline" onClick={handleAddSampleData}>
                  Add Sample Data
                </Button>
              )} */}
            </div>
          </CardContent>
        </Card>

        {/* Show message if no data */}
        {/* {transactions.length === 0 && (
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No transaction data available</p>
              <Button onClick={handleAddSampleData}>Add Sample Data to Get Started</Button>
            </CardContent>
          </Card>
        )} */}

        {/* Summary Cards - Current Month */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-black mb-3">
            Current Period Analysis ({months[selectedMonth]} {selectedYear})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(expenseAnalysis.total || 0)}</div>
                <p className="text-xs text-muted-foreground">Selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(expenseAnalysis.average || 0)}</div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{expenseAnalysis.high?.count || 0}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(expenseAnalysis.high?.total || 0)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{expenseAnalysis.low?.count || 0}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(expenseAnalysis.low?.total || 0)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last 3 Months Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Last 3 Months Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(last3MonthsAnalysis.total || 0)}</div>
                <p className="text-xs text-muted-foreground">Last 3 months</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(last3MonthsAnalysis.average || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{last3MonthsAnalysis.high?.count || 0}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(last3MonthsAnalysis.high?.total || 0)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{last3MonthsAnalysis.low?.count || 0}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(last3MonthsAnalysis.low?.total || 0)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Expenses by Category
              </CardTitle>
              <CardDescription>
                {months[selectedMonth]} {selectedYear} - Category breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm">Amount: {formatCurrency(data.value)}</p>
                                <p className="text-sm">Transactions: {data.count}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                  <p className="mb-4">No expense data for selected period</p>
                  {transactions.length === 0 && (
                    <Button variant="outline" onClick={handleAddSampleData}>
                      Add Sample Data
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D-style Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Last 3 Months Trend (3D View)</CardTitle>
              <CardDescription>Income vs Expenses comparison with depth</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  credit: {
                    label: "Income",
                    color: "hsl(var(--chart-1))",
                  },
                  debit: {
                    label: "Expenses",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="credit"
                      stackId="1"
                      stroke="#10b981"
                      fillOpacity={0.6}
                      fill="url(#colorCredit)"
                      name="Income"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="debit"
                      stackId="2"
                      stroke="#ef4444"
                      fillOpacity={0.6}
                      fill="url(#colorDebit)"
                      name="Expenses"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of expenses by category for {months[selectedMonth]} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count} transactions</Badge>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(category.value)}</div>
                    <div className="text-sm text-gray-500">
                      {((category.value / (expenseAnalysis.total || 1)) * 100).toFixed(1)}% of total expenses
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No category data available for the selected period</p>
                {/* {transactions.length === 0 && (
                  <Button variant="outline" onClick={handleAddSampleData}>
                    Add Sample Data
                  </Button>
                )} */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Transactions for {months[selectedMonth]} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No transactions found for the selected period</p>
                {/* {transactions.length === 0 && (
                  <Button variant="outline" onClick={handleAddSampleData}>
                    Add Sample Data
                  </Button>
                )} */}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTransactions.slice(0, 20).map((transaction) => {
                  const category = CATEGORIES.find((c) => c.value === transaction.category)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category?.color || "#6b7280" }}
                          ></div>
                          <h3 className="font-medium">{transaction.description}</h3>
                          <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                          <Badge variant="outline">{category?.label || "Others"}</Badge>
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
