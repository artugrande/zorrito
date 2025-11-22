"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RankingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RankingsModal({ open, onOpenChange }: RankingsModalProps) {
  const rankings = [
    { wallet: "0x1234...5678", country: "🇦🇷", streak: 127 },
    { wallet: "0x8765...4321", country: "🇨🇱", streak: 98 },
    { wallet: "0x9876...1234", country: "🇺🇾", streak: 87 },
    { wallet: "0x4567...8901", country: "🇧🇷", streak: 76 },
    { wallet: "0x3456...7890", country: "🇦🇷", streak: 65 },
    { wallet: "0x2345...6789", country: "🇲🇽", streak: 54 },
    { wallet: "0x6789...0123", country: "🇨🇴", streak: 43 },
    { wallet: "0x5678...9012", country: "🇵🇪", streak: 32 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">Streak Rankings 🔥</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead>Rank</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((rank, index) => (
              <TableRow key={index} className="border-zinc-800">
                <TableCell>
                  <Badge variant="outline" className="border-zinc-700">
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{rank.wallet}</TableCell>
                <TableCell className="text-2xl">{rank.country}</TableCell>
                <TableCell className="font-bold text-orange-500">{rank.streak} days 🔥</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
