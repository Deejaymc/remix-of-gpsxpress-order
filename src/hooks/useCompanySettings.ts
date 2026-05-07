import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CompanyInfo } from '@/types';

const defaultCompany = (slot: 1 | 2): CompanyProfile => ({
  id: null,
  slot,
  label: `Empresa ${slot}`,
  isActive: slot === 1,
  info: { name: slot === 1 ? 'GPSXPRESS' : '', nif: '', ie: '', address: '', provincia: '', municipio: '', rua: '', phone: '', email: '', website: '', logoUrl: '' },
});

export interface CompanyProfile {
  id: string | null;
  slot: 1 | 2;
  label: string;
  isActive: boolean;
  info: CompanyInfo;
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<CompanyProfile[]>([defaultCompany(1), defaultCompany(2)]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('company_settings').select('*').eq('user_id', user.id).order('slot');
    if (error) { toast.error('Erro ao carregar empresas'); setLoading(false); return; }

    const next: CompanyProfile[] = [defaultCompany(1), defaultCompany(2)];
    (data || []).forEach((d: any) => {
      const idx = d.slot === 2 ? 1 : 0;
      next[idx] = {
        id: d.id, slot: d.slot, label: d.label || `Empresa ${d.slot}`, isActive: d.is_active,
        info: { name: d.name, nif: d.nif, ie: d.ie, address: d.address, provincia: d.provincia, municipio: d.municipio, rua: d.rua, phone: d.phone, email: d.email, website: d.website, logoUrl: d.logo_url || '' },
      };
    });
    // Ensure exactly one active
    if (!next.some(p => p.isActive && p.id)) {
      const first = next.find(p => p.id);
      if (first) first.isActive = true;
    }
    setProfiles(next);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const saveProfile = async (slot: 1 | 2, info: CompanyInfo, label: string) => {
    if (!user) return;
    const existing = profiles.find(p => p.slot === slot);
    const { logoUrl, ...rest } = info;
    const payload: any = { ...rest, logo_url: logoUrl, label, slot, user_id: user.id };

    if (existing?.id) {
      const { error } = await supabase.from('company_settings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) { toast.error('Erro ao salvar dados'); return; }
    } else {
      payload.is_active = !profiles.some(p => p.id && p.isActive);
      const { error } = await supabase.from('company_settings').insert(payload);
      if (error) { toast.error('Erro ao salvar dados'); return; }
    }
    toast.success('Empresa salva!');
    fetchCompanies();
  };

  const setActive = async (slot: 1 | 2) => {
    if (!user) return;
    const target = profiles.find(p => p.slot === slot);
    if (!target?.id) { toast.error('Cadastre os dados da empresa primeiro'); return; }
    const { error } = await supabase.from('company_settings').update({ is_active: true }).eq('id', target.id);
    if (error) { toast.error('Erro ao alternar empresa'); return; }
    toast.success(`${target.label} ativada`);
    fetchCompanies();
  };

  const activeProfile = profiles.find(p => p.isActive && p.id) || profiles[0];

  return {
    profiles,
    activeProfile,
    company: activeProfile.info,
    loading,
    saveProfile,
    setActive,
    refresh: fetchCompanies,
  };
}
