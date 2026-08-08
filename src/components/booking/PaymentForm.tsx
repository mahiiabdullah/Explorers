'use client';

import { useState } from 'react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { api, endpoints } from '@/lib/api';
import { APP_URL } from '@/lib/constants';
import type { PaymentChargeResponse } from '@/lib/types';

interface PaymentFormProps {
  bookingId: string;
  totalAmount: number;
}

export function PaymentForm({ bookingId, totalAmount }: PaymentFormProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'wallet'>('upi');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // The backend constructs the webhook callbackUrl from its BACKEND_URL
    // env var (which is `http://backend:5000` in Docker and
    // `http://localhost:5000` in local dev). We just send the user-facing
    // returnUrl so the gateway can bounce them back after the webhook.
    const { data, error } = await api.post<PaymentChargeResponse>(endpoints.initiatePayment(), {
      bookingId,
      amount: totalAmount,
      currency: 'BDT',
      returnUrl: `${APP_URL}/booking/${bookingId}/confirmed`,
    });
    if (error) {
      toast({ type: 'error', title: 'Payment failed', description: error.message });
      setLoading(false);
      return;
    }
    const redirectUrl = data?.gatewayResponse?.redirect_url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    toast({ type: 'error', title: 'Payment failed', description: 'No redirect URL received from gateway' });
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <h3 className="font-display text-2xl text-white">PAYMENT METHOD</h3>

        <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upi"><Smartphone className="mr-1 h-4 w-4" />UPI</TabsTrigger>
            <TabsTrigger value="card"><CreditCard className="mr-1 h-4 w-4" />Card</TabsTrigger>
            <TabsTrigger value="wallet"><Wallet className="mr-1 h-4 w-4" />Wallet</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {method === 'upi' && (
              <div className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input id="upi" placeholder="yourname@bank" />
              </div>
            )}
            {method === 'card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" type="password" placeholder="•••" />
                  </div>
                </div>
              </>
            )}
            {method === 'wallet' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" placeholder="+91 98765 43210" />
              </div>
            )}
          </div>
        </Tabs>

        <div className="flex items-center gap-2 text-xs text-cinema-muted">
          <Lock className="h-3 w-3" />
          Secured by the mock payment gateway
        </div>

        <ShimmerButton onClick={handlePay} disabled={loading} className="w-full h-14 text-lg">
          {loading ? 'Redirecting to gateway…' : `Pay ${formatCurrency(totalAmount)}`}
        </ShimmerButton>
      </CardContent>
    </Card>
  );
}