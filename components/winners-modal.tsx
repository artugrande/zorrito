"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WinnersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WinnersModal({ open, onOpenChange }: WinnersModalProps) {
  const winners = [
    { wallet: "0x1234...5678", date: "2024-11-15", prize: "333 cUSD", country: "🇦🇷" },
    { wallet: "0x8765...4321", date: "2024-10-15", prize: "298 cUSD", country: "🇨🇱" },
    { wallet: "0x9876...1234", date: "2024-09-15", prize: "275 cUSD", country: "🇺🇾" },
    { wallet: "0x4567...8901", date: "2024-08-15", prize: "312 cUSD", country: "🇧🇷" },
    { wallet: "0x3456...7890", date: "2024-07-15", prize: "289 cUSD", country: "🇦🇷" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">Last Winners 🏆</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead>Wallet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.map((winner, index) => (
              <TableRow key={index} className="border-zinc-800">
                <TableCell className="font-mono">{winner.wallet}</TableCell>
                <TableCell>{winner.date}</TableCell>
                <TableCell className="font-bold text-green-500">{winner.prize}</TableCell>
                <TableCell className="text-2xl">{winner.country}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
