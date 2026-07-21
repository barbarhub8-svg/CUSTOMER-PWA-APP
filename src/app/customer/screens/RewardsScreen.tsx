import { ArrowDownLeft, ArrowUpRight, Gift, Sparkles } from 'lucide-react'
import { useCustomerStore } from '../store'

export default function RewardsScreen() {
  const { rewards, loading } = useCustomerStore()
  return <main className="page"><header className="top-title"><p className="eyebrow">NEXORA REWARDS</p><h1>Rewards wallet</h1></header><section className="wallet"><div><small>Available balance</small><strong>₹{loading ? '—' : rewards.available}</strong><p>Earn more every time you book</p></div><Sparkles/></section><div className="stats"><div><span><ArrowDownLeft/></span><b>₹{rewards.earned}</b><small>Lifetime earned</small></div><div><span><ArrowUpRight/></span><b>₹{rewards.redeemed}</b><small>Redeemed</small></div></div><div className="empty"><Gift/><h3>Your live rewards activity</h3><p>Rewards earned from completed bookings will appear here.</p></div></main>
}
