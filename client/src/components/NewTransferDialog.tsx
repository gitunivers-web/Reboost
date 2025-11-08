import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/queryClient';

interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewTransferDialog({ open, onOpenChange }: NewTransferDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(getApiUrl('/api/transfers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create transfer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transfers'] });
      toast({
        title: t.dialogs.transfer.transferSuccess,
        description: t.dialogs.transfer.transferSuccessDesc,
      });
      onOpenChange(false);
      setFormData({ amount: '', recipient: '' });
    },
    onError: () => {
      toast({
        title: t.dialogs.transfer.transferError,
        description: t.dialogs.transfer.transferErrorDesc,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransferMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.dashboard.transferFunds}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">{t.dialogs.transfer.recipient}</Label>
            <Input
              id="recipient"
              type="text"
              placeholder={t.dialogs.transfer.recipientPlaceholder}
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{t.dialogs.transfer.amount}</Label>
            <Input
              id="amount"
              type="number"
              placeholder="50000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="bg-muted p-4 rounded-md text-sm">
            <p className="text-muted-foreground">
              {t.dialogs.transfer.feesDescription}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.dialogs.transfer.cancel}
            </Button>
            <Button type="submit" disabled={createTransferMutation.isPending}>
              {createTransferMutation.isPending ? t.dialogs.transfer.creating : t.dialogs.transfer.createTransfer}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
