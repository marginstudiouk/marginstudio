import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function CustomersList() {
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
      if (purchasesError) throw purchasesError;

      const userIds = [...new Set(purchases.map((p) => p.user_id))];

      const { data: profiles, error: profilesError } = userIds.length
        ? await supabase.from('profiles').select('id, email, organisation, audience').in('id', userIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;

      const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      return purchases.map((p) => ({ ...p, customer: profileById[p.user_id] }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="font-mono text-xs text-destructive">
        Couldn't load customers: {error.message}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="font-mono text-xs text-muted-foreground">No purchases yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="font-mono text-xs tracking-widest uppercase text-muted-foreground py-2 pr-4">Customer</th>
            <th className="font-mono text-xs tracking-widest uppercase text-muted-foreground py-2 pr-4">Product</th>
            <th className="font-mono text-xs tracking-widest uppercase text-muted-foreground py-2 pr-4">Paid</th>
            <th className="font-mono text-xs tracking-widest uppercase text-muted-foreground py-2 pr-4">Downloads</th>
            <th className="font-mono text-xs tracking-widest uppercase text-muted-foreground py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              <td className="py-3 pr-4">
                <p className="font-sans text-foreground">{r.customer?.email || 'Unknown'}</p>
                {r.customer?.organisation && (
                  <p className="font-mono text-xs text-muted-foreground">{r.customer.organisation}</p>
                )}
              </td>
              <td className="py-3 pr-4 font-sans text-foreground">{r.product_name}</td>
              <td className="py-3 pr-4 font-mono text-xs text-primary">£{r.amount_paid}</td>
              <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{r.download_count} / {r.max_downloads}</td>
              <td className="py-3 font-mono text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString('en-GB')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
