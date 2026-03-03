import { useState } from 'react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyInfo } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CompanySettings = () => {
  const { company, saveCompany, setCompany } = useCompanySettings();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setCompany({ ...company, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;

    const { error } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true });
    if (error) {
      toast.error('Erro ao enviar logótipo');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(path);
    setCompany({ ...company, logoUrl: urlData.publicUrl });
    toast.success('Logótipo enviado!');
    setUploading(false);
  };

  const removeLogo = () => {
    setCompany({ ...company, logoUrl: '' });
  };

  const handleSave = () => {
    saveCompany(company);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-wider">
        EMPRE<span className="text-primary">SA</span>
      </h1>

      <Card className="p-6 bg-card border-border max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="font-display text-sm tracking-wider text-muted-foreground">DADOS FISCAIS E CONTATO</h2>
        </div>

        {/* Logo upload */}
        <div className="mb-6">
          <label className="text-xs font-display tracking-wider text-muted-foreground mb-2 block">LOGÓTIPO DA EMPRESA</label>
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <div className="relative">
                <img src={company.logoUrl} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain rounded border border-border bg-secondary p-1" />
                <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded border border-dashed border-border hover:border-primary transition-colors bg-secondary text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                {uploading ? 'Enviando...' : 'Enviar logótipo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder="Razão Social" value={company.name} onChange={e => handleChange('name', e.target.value)} className="bg-secondary" />
          <Input placeholder="NIF" value={company.nif} onChange={e => handleChange('nif', e.target.value)} className="bg-secondary" />
          <Input placeholder="Inscrição Estadual" value={company.ie} onChange={e => handleChange('ie', e.target.value)} className="bg-secondary" />
          <Input placeholder="Telefone" value={company.phone} onChange={e => handleChange('phone', e.target.value)} className="bg-secondary" />
          <Input placeholder="E-mail" value={company.email} onChange={e => handleChange('email', e.target.value)} className="bg-secondary" />
          <Input placeholder="Website" value={company.website} onChange={e => handleChange('website', e.target.value)} className="bg-secondary" />
          <Input placeholder="Endereço" value={company.address} onChange={e => handleChange('address', e.target.value)} className="bg-secondary col-span-full" />
          <Input placeholder="Provincia" value={company.provincia} onChange={e => handleChange('provincia', e.target.value)} className="bg-secondary" />
          <Input placeholder="Municipio" value={company.municipio} onChange={e => handleChange('municipio', e.target.value)} className="bg-secondary" />
          <Input placeholder="Rua" value={company.rua} onChange={e => handleChange('rua', e.target.value)} className="bg-secondary" />
        </div>

        <Button onClick={handleSave} className="mt-6 glow-primary font-display tracking-wider">SALVAR DADOS</Button>
      </Card>
    </div>
  );
};

export default CompanySettings;
