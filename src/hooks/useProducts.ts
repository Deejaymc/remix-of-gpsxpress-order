import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  created_at: string;
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar produtos'); } else { setProducts(data || []); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (product: Omit<DbProduct, 'id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('products').insert({ ...product, user_id: user.id });
    if (error) { toast.error('Erro ao salvar produto'); return; }
    toast.success('Produto salvo!');
    fetchProducts();
  };

  const updateProduct = async (id: string, product: Partial<DbProduct>) => {
    const { error } = await supabase.from('products').update(product).eq('id', id);
    if (error) { toast.error('Erro ao atualizar produto'); return; }
    toast.success('Produto atualizado!');
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir produto'); return; }
    fetchProducts();
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
