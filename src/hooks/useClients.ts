import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DbClient {
  id: string;
  name: string;
  nif: string;
  phone: string;
  email: string;
  address: string;
  provincia: string;
  municipio: string;
  rua: string;
  created_at: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<DbClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar clientes');
    } else {
      setClients(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const addClient = async (client: Omit<DbClient, 'id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('clients').insert({ ...client, user_id: user.id });
    if (error) { toast.error('Erro ao salvar cliente'); return; }
    toast.success('Cliente salvo!');
    fetchClients();
  };

  const updateClient = async (id: string, client: Partial<DbClient>) => {
    const { error } = await supabase.from('clients').update(client).eq('id', id);
    if (error) { toast.error('Erro ao atualizar cliente'); return; }
    toast.success('Cliente atualizado!');
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir cliente'); return; }
    fetchClients();
  };

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
}
