import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Sparkles, Crown, Church, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const SUGGESTED_AMOUNTS = [
  { value: 10, label: '$10', icon: Heart, description: 'Supporter' },
  { value: 25, label: '$25', icon: Sparkles, description: 'Believer' },
  { value: 50, label: '$50', icon: Crown, description: 'Champion' },
  { value: 100, label: '$100', icon: Church, description: 'Pillar' },
];

export default function Donations() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = () => {
    const amount = customAmount 
      ? parseFloat(customAmount) 
      : selectedAmount;

    if (!amount || amount < 1) {
      toast.error('Minimum donation is $1.00');
      return;
    }

    // Open Cash App with the selected amount
    window.open(`https://cash.app/$AlRosebruch/${amount}`, '_blank');
    toast.success('Opening Cash App — thank you for your generosity!');
  };

  const displayAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Support Our Ministry</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your generous contribution helps us build a thriving faith community, 
          connect believers worldwide, and spread the message of hope and love.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Make a Donation
          </CardTitle>
          <CardDescription>
            Choose your donation amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base mb-4 block">Select Amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SUGGESTED_AMOUNTS.map((amount) => {
                const Icon = amount.icon;
                return (
                  <Card
                    key={amount.value}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedAmount === amount.value && !customAmount
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedAmount(amount.value);
                      setCustomAmount('');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{amount.label}</div>
                      <div className="text-sm text-muted-foreground">{amount.description}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                className="pl-8"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
              />
            </div>
          </div>

          <a
            href={`https://cash.app/$AlRosebruch/${displayAmount || 25}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.success('Opening Cash App — thank you for your generosity!')}
            className="block"
          >
            <Button
              size="lg"
              className="w-full"
              type="button"
            >
              Donate {displayAmount ? `$${displayAmount}` : 'Now'} via Cash App
            </Button>
          </a>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment via Cash App ($AlRosebruch). Your donation supports building God's kingdom.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardContent className="pt-6">
            <Heart className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Build Community</h3>
            <p className="text-sm text-muted-foreground">
              Connect believers and strengthen faith bonds
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Spread Hope</h3>
            <p className="text-sm text-muted-foreground">
              Share testimonies and inspire others
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Church className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Grow Together</h3>
            <p className="text-sm text-muted-foreground">
              Support spiritual growth and discipleship
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
