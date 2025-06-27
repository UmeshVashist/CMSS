import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Transaction } from "./database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    return transaction.type === "credit" ? balance + transaction.amount : balance - transaction.amount
  }, 0)
}

export function getMonthlyTransactions(transactions: Transaction[], month: number, year: number): Transaction[] {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getMonth() === month && transactionDate.getFullYear() === year
  })
}

export function getCurrentMonthCredit(transactions: Transaction[]): number {
  const now = new Date()
  const currentMonth = getMonthlyTransactions(transactions, now.getMonth(), now.getFullYear())
  return currentMonth.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
}

export function getCurrentMonthDebit(transactions: Transaction[]): number {
  const now = new Date()
  const currentMonth = getMonthlyTransactions(transactions, now.getMonth(), now.getFullYear())
  return currentMonth.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)
}

export function getLastMonthClosingBalance(transactions: Transaction[]): number {
  const now = new Date()
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const lastMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate <= new Date(lastMonthYear, lastMonth + 1, 0)
  })

  return calculateBalance(lastMonthTransactions)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export function canEditTransaction(transactionDate: string): boolean {
  const transactionMonth = new Date(transactionDate).getMonth()
  const currentMonth = new Date().getMonth()
  return transactionMonth === currentMonth
}

// Date formatting functions
export function formatDateToDDMMYYYY(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const day = dateObj.getDate().toString().padStart(2, "0")
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0")
  const year = dateObj.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateTimeToLocal(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const day = dateObj.getDate().toString().padStart(2, "0")
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0")
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours().toString().padStart(2, "0")
  const minutes = dateObj.getMinutes().toString().padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function convertDDMMYYYYToISO(ddmmyyyy: string): string {
  const [day, month, year] = ddmmyyyy.split("/")
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

export function convertISOToDDMMYYYY(isoDate: string): string {
  return formatDateToDDMMYYYY(new Date(isoDate))
}
