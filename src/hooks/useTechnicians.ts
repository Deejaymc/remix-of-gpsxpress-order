import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DbTechnician {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  active: boolean;
  created_at: string;
}

export function useTechnicians() {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<DbTechnician[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTechnicians = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('technicians').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar técnicos'); } else { setTechnicians(data || []); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const addTechnician = async (tech: Omit<DbTechnician, 'id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('technicians').insert({ ...tech, user_id: user.id });
    if (error) { toast.error('Erro ao salvar técnico'); return; }
    toast.success('Técnico salvo!');
    fetchTechnicians();
  };

  const updateTechnician = async (id: string, tech: Partial<DbTechnician>) => {
    const { error } = await supabase.from('technicians').update(tech).eq('id', id);
    if (error) { toast.error('Erro ao atualizar técnico'); return; }
    toast.success('Técnico atualizado!');
    fetchTechnicians();
  };

  const deleteTechnician = async (id: string) => {
    const { error } = await supabase.from('technicians').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir técnico'); return; }
    fetchTechnicians();
  };

  return { technicians, loading, addTechnician, updateTechnician, deleteTechnician, refetch: fetchTechnicians };
}
