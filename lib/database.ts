// Enhanced database with Clerk integration and categories
export interface Transaction {
  id: string
  userId: string // This will be the Clerk user ID
  description: string
  amount: number
  type: "credit" | "debit"
  method: "UPI" | "Cash" | "Net Banking" | "ATM" | "Cheque"
  date: string
  category?: string // Add category field
  createdAt: string
  updatedAt: string
}

// In-memory storage with localStorage backup for persistence
let transactions: Transaction[] = []

// Load transactions from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("cash_management_transactions")
    if (stored) {
      transactions = JSON.parse(stored)
      console.log("Loaded transactions from localStorage:", transactions.length)
    }
  } catch (error) {
    console.error("Error loading transactions from localStorage:", error)
    transactions = []
  }
}

// Save transactions to localStorage
const saveToStorage = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cash_management_transactions", JSON.stringify(transactions))
      console.log("Saved transactions to localStorage:", transactions.length)
    } catch (error) {
      console.error("Error saving transactions to localStorage:", error)
    }
  }
}

export const transactionService = {
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    console.log("Getting transactions for user:", userId)
    const userTransactions = transactions.filter((t) => t.userId === userId)
    console.log("Found transactions:", userTransactions.length)
    return userTransactions
  },

  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    console.log("Adding transaction:", transaction)

    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    transactions.push(newTransaction)
    saveToStorage()

    console.log("Transaction added successfully:", newTransaction)
    console.log("Total transactions now:", transactions.length)

    return newTransaction
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    console.log("Updating transaction:", id, updates)

    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
      console.error("Transaction not found for update:", id)
      return null
    }

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    saveToStorage()
    console.log("Transaction updated successfully:", transactions[index])

    return transactions[index]
  },

  async deleteTransaction(id: string): Promise<boolean> {
    console.log("Deleting transaction:", id)

    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
      console.error("Transaction not found for deletion:", id)
      return false
    }

    transactions.splice(index, 1)
    saveToStorage()

    console.log("Transaction deleted successfully. Remaining:", transactions.length)
    return true
  },

  async deleteUserData(userId: string): Promise<void> {
    console.log("Deleting all data for user:", userId)

    const beforeCount = transactions.length
    transactions = transactions.filter((t) => t.userId !== userId)
    const afterCount = transactions.length

    saveToStorage()
    console.log(`Deleted ${beforeCount - afterCount} transactions for user ${userId}`)
  },

  // Debug method to check storage
  async debugStorage(): Promise<void> {
    console.log("=== TRANSACTION STORAGE DEBUG ===")
    console.log("Total transactions in memory:", transactions.length)
    console.log("Transactions:", transactions)

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cash_management_transactions")
      console.log("LocalStorage data:", stored ? JSON.parse(stored).length : "No data")
    }
    console.log("=== END DEBUG ===")
  },
}
