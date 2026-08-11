import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

export default function SubscribersList() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = q
    ? subscribers.filter(
        (s) =>
          s.email?.toLowerCase().includes(q.toLowerCase()) ||
          s.name?.toLowerCase().includes(q.toLowerCase())
      )
    : subscribers;

  const remove = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    await supabase.from('subscribers').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-subscribers'] });
  };

  return (
    <div className="space-y-5">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by email or name"
        className="w-full bg-background border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-primary"
      />

      {isLoading ? (
        <p className="font-mono text-xs text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground">
          {q ? 'No matches.' : 'No subscribers yet.'}
        </p>
      ) : (
        <div className="space-y-1">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground pb-2">
            {filtered.length} {filtered.length === 1 ? 'subscriber' : 'subscribers'}
          </p>
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3"
            >
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-foreground truncate">
                  {s.email}
                </p>
                {s.name && (
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {s.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(s.id)}
                className="text-muted-foreground hover:text-destructive transition-colors ml-4 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}