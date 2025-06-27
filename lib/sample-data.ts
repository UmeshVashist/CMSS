import { transactionService } from "./database"

export async function addSampleTransactions(userId: string) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Generate dates for current month and previous months
  const generateDate = (monthOffset: number, day: number) => {
    const date = new Date(currentYear, currentMonth + monthOffset, day)
    return date.toISOString().split("T")[0]
  }

  const sampleTransactions = [
    // Current Month Transactions
    {
      userId,
      description: "Monthly Salary from Company",
      amount: 50000,
      type: "credit" as const,
      method: "Net Banking" as const,
      category: "salary",
      date: generateDate(0, 1),
    },
    {
      userId,
      description: "Grocery Shopping at Supermarket",
      amount: 2500,
      type: "debit" as const,
      method: "UPI" as const,
      category: "grocery",
      date: generateDate(0, 3),
    },
    {
      userId,
      description: "Fuel Expense - Petrol Station",
      amount: 3000,
      type: "debit" as const,
      method: "UPI" as const,
      category: "fuel",
      date: generateDate(0, 5),
    },
    {
      userId,
      description: "Shopping - Clothes and Accessories",
      amount: 4500,
      type: "debit" as const,
      method: "UPI" as const,
      category: "shopping",
      date: generateDate(0, 7),
    },
    {
      userId,
      description: "Fresh Vegetables from Market",
      amount: 800,
      type: "debit" as const,
      method: "Cash" as const,
      category: "vegetables",
      date: generateDate(0, 9),
    },
    {
      userId,
      description: "Medicine from Pharmacy",
      amount: 1200,
      type: "debit" as const,
      method: "UPI" as const,
      category: "medicine",
      date: generateDate(0, 11),
    },
    {
      userId,
      description: "Movie and Entertainment",
      amount: 1500,
      type: "debit" as const,
      method: "UPI" as const,
      category: "entertainment",
      date: generateDate(0, 13),
    },
    {
      userId,
      description: "Investment in Mutual Funds",
      amount: 10000,
      type: "debit" as const,
      method: "Net Banking" as const,
      category: "investment",
      date: generateDate(0, 15),
    },
    {
      userId,
      description: "Freelance Project Payment",
      amount: 25000,
      type: "credit" as const,
      method: "UPI" as const,
      category: "others",
      date: generateDate(0, 17),
    },
    {
      userId,
      description: "Electricity Bill Payment",
      amount: 2200,
      type: "debit" as const,
      method: "Net Banking" as const,
      category: "others",
      date: generateDate(0, 19),
    },

    // Previous Month Transactions
    {
      userId,
      description: "Monthly Salary from Company",
      amount: 48000,
      type: "credit" as const,
      method: "Net Banking" as const,
      category: "salary",
      date: generateDate(-1, 1),
    },
    {
      userId,
      description: "Grocery Shopping",
      amount: 3200,
      type: "debit" as const,
      method: "UPI" as const,
      category: "grocery",
      date: generateDate(-1, 5),
    },
    {
      userId,
      description: "Fuel Expense",
      amount: 2800,
      type: "debit" as const,
      method: "UPI" as const,
      category: "fuel",
      date: generateDate(-1, 8),
    },
    {
      userId,
      description: "Investment Return from Stocks",
      amount: 15000,
      type: "credit" as const,
      method: "Net Banking" as const,
      category: "investment_return",
      date: generateDate(-1, 12),
    },
    {
      userId,
      description: "Shopping at Mall",
      amount: 5500,
      type: "debit" as const,
      method: "UPI" as const,
      category: "shopping",
      date: generateDate(-1, 15),
    },
    {
      userId,
      description: "Vegetables and Fruits",
      amount: 1200,
      type: "debit" as const,
      method: "Cash" as const,
      category: "vegetables",
      date: generateDate(-1, 18),
    },

    // Two Months Ago Transactions
    {
      userId,
      description: "Monthly Salary",
      amount: 47000,
      type: "credit" as const,
      method: "Net Banking" as const,
      category: "salary",
      date: generateDate(-2, 1),
    },
    {
      userId,
      description: "Grocery Store",
      amount: 2800,
      type: "debit" as const,
      method: "UPI" as const,
      category: "grocery",
      date: generateDate(-2, 4),
    },
    {
      userId,
      description: "Petrol Station",
      amount: 3200,
      type: "debit" as const,
      method: "UPI" as const,
      category: "fuel",
      date: generateDate(-2, 7),
    },
    {
      userId,
      description: "Medical Checkup",
      amount: 2500,
      type: "debit" as const,
      method: "UPI" as const,
      category: "medicine",
      date: generateDate(-2, 10),
    },
    {
      userId,
      description: "Entertainment - Concert",
      amount: 3000,
      type: "debit" as const,
      method: "UPI" as const,
      category: "entertainment",
      date: generateDate(-2, 14),
    },
  ]

  for (const transaction of sampleTransactions) {
    await transactionService.addTransaction(transaction)
  }
}
