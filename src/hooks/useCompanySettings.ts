import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CompanyInfo } from '@/types';

const defaultCompany: CompanyInfo = {
  name: 'GPSXPRESS', nif: '', ie: '', address: '', provincia: '', municipio: '', rua: '', phone: '', email: '', website: '',
};

export function useCompanySettings() {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyInfo>(defaultCompany);
  const [loading, setLoading] = useState(true);
  const [dbId, setDbId] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('company_settings').select('*').eq('user_id', user.id).maybeSingle();
    if (error) { toast.error('Erro ao carregar dados da empresa'); }
    if (data) {
      setDbId(data.id);
      setCompany({ name: data.name, nif: data.nif, ie: data.ie, address: data.address, provincia: data.provincia, municipio: data.municipio, rua: data.rua, phone: data.phone, email: data.email, website: data.website });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const saveCompany = async (info: CompanyInfo) => {
    if (!user) return;
    if (dbId) {
      const { error } = await supabase.from('company_settings').update({ ...info, updated_at: new Date().toISOString() }).eq('id', dbId);
      if (error) { toast.error('Erro ao salvar dados'); return; }
    } else {
      const { error } = await supabase.from('company_settings').insert({ ...info, user_id: user.id });
      if (error) { toast.error('Erro ao salvar dados'); return; }
    }
    toast.success('Dados da empresa salvos com sucesso!');
    setCompany(info);
    fetchCompany();
  };

  return { company, loading, saveCompany, setCompany };
}
