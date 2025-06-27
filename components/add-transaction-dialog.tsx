"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { transactionService } from "@/lib/database"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionAdded: () => void
  userId: string
}

export const TRANSACTION_CATEGORIES = [
  { value: "fuel", label: "Fuel Expense" },
  { value: "grocery", label: "Grocery" },
  { value: "shopping", label: "Shopping" },
  { value: "salary", label: "Salary Payment" },
  { value: "vegetables", label: "Vegetables" },
  { value: "investment", label: "Investment" },
  { value: "investment_return", label: "Investment Return" },
  { value: "medicine", label: "Medicine" },
  { value: "entertainment", label: "Entertainment" },
  { value: "emi", label: "EMI Payment" },
  { value: "credit_card_bill", label: "Credit Card Bill" },
  { value: "insurance", label: "Insurance Premium" },
  { value: "utilities", label: "Utilities (Electricity, Water, Gas)" },
  { value: "rent", label: "Rent Payment" },
  { value: "education", label: "Education & Training" },
  { value: "travel", label: "Travel & Transportation" },
  { value: "food_dining", label: "Food & Dining" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "subscription", label: "Subscriptions & Memberships" },
  { value: "others", label: "Others" },
]

export function AddTransactionDialog({ open, onOpenChange, onTransactionAdded, userId }: AddTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "" as "credit" | "debit" | "",
    method: "" as "UPI" | "Cash" | "Net Banking" | "ATM" | "Cheque" | "",
    category: "" as string,
    date: new Date().toISOString().split("T")[0], // Keep ISO format for input
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.type || !formData.method || !formData.category) {
      alert("Please fill in all required fields")
      return
    }

    if (!formData.description.trim()) {
      alert("Please enter a description")
      return
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    console.log("Submitting transaction:", formData)
    setLoading(true)

    try {
      const transactionData = {
        userId: userId,
        description: formData.description.trim(),
        amount: Number.parseFloat(formData.amount),
        type: formData.type,
        method: formData.method,
        category: formData.category,
        date: formData.date, // Store as ISO format
      }

      console.log("Transaction data to save:", transactionData)

      const savedTransaction = await transactionService.addTransaction(transactionData)
      console.log("Transaction saved successfully:", savedTransaction)

      // Reset form
      setFormData({
        description: "",
        amount: "",
        type: "",
        method: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      })

      // Call the callback to refresh the list
      onTransactionAdded()
      onOpenChange(false)

      // Show success message
      alert("Transaction added successfully!")
    } catch (error) {
      console.error("Error adding transaction:", error)
      alert("Error adding transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 columns-2">
          <div className="space-y-1 ">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "credit" | "debit") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={formData.method} onValueChange={(value: any) => setFormData({ ...formData, method: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Net Banking">Net Banking</SelectItem>
                <SelectItem value="ATM">ATM</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date (DD/MM/YYYY)</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button className="hover:bg-orange-500 hover:text-white" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
            <Button className="hover:bg-red-500 hover:text-white" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
