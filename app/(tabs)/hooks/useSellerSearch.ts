import { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axiosInstance';

type SellerItem = {
  id: string;
  name: string;
  avatar?: string;
  subtitle?: string;
  city?: string;
  raw?: any;
};

export function useSellerSearch(query: string, page = 1, limit = 20) {
  const [data, setData] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const ctl = new AbortController();
    const run = async () => {
      if (!q) { setData([]); setError(null); return; }
      setLoading(true);
      try {
        const res = await api.get('/api/sellers', {
          params: { search: q, page, limit, section: 'search' },
          signal: ctl.signal as any,
        });
        const arr: any[] = res.data?.data || [];
        const normalized: SellerItem[] = arr.map((s: any) => {
          const id = s.id; // Already string
          const name = s.name || 'Unknown'; // Use transformed full name
          const avatar = s.image || 'https://placehold.co/80x80';
          const subtitle = s.description || ''; // Short desc only
          const city = s.location?.split(',')[0]?.trim() || ''; // Parse from location
          return { id, name, avatar, subtitle, city, raw: s };
        }).filter(x => x.id); // Drop length check
        setData(normalized);
        setError(null);
      } catch (e: any) {
        if (e.name !== 'CanceledError') setError(e.message || 'Failed to search');
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(run, 250); // debounce
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q, page, limit]);

  return { sellers: data, loading, error };
}