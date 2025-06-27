"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/database"
import { formatCurrency, formatDateToDDMMYYYY, formatDateTimeToLocal } from "@/lib/utils"
import { TRANSACTION_CATEGORIES } from "@/components/add-transaction-dialog"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center">Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 ">
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="text-gray-900">{transaction.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Amount</h3>
            <p className={`text-lg font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "credit" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Type</h3>
            <Badge variant={transaction.type === "credit" ? "default" : "destructive"}>{transaction.type}</Badge>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Category</h3>
            <p className="text-gray-900">
              {TRANSACTION_CATEGORIES.find((c) => c.value === transaction.category)?.label || "Others"}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Payment Method</h3>
            <p className="text-gray-900">{transaction.method}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Date</h3>
            <p className="text-gray-900">{formatDateToDDMMYYYY(transaction.date)}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Created</h3>
            <p className="text-gray-900">{formatDateTimeToLocal(transaction.createdAt)}</p>
          </div>

          {transaction.updatedAt !== transaction.createdAt && (
            <div>
              <h3 className="font-medium text-gray-700">Last Updated</h3>
              <p className="text-gray-900">{formatDateTimeToLocal(transaction.updatedAt)}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
