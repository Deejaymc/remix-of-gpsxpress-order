import { useState, useEffect } from 'react';
import { useCompanySettings, CompanyProfile } from '@/hooks/useCompanySettings';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyInfo } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Upload, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SlotEditor = ({ profile, onSave, onActivate, userId }: {
  profile: CompanyProfile;
  onSave: (info: CompanyInfo, label: string) => Promise<void>;
  onActivate: () => Promise<void>;
  userId: string;
}) => {
  const [info, setInfo] = useState<CompanyInfo>(profile.info);
  const [label, setLabel] = useState(profile.label);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setInfo(profile.info); setLabel(profile.label); }, [profile]);

  const handleChange = (field: keyof CompanyInfo, value: string) => setInfo({ ...info, [field]: value });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/logo-slot${profile.slot}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true });
    if (error) { toast.error('Erro ao enviar logótipo'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(path);
    setInfo({ ...info, logoUrl: urlData.publicUrl });
    toast.success('Logótipo enviado!');
    setUploading(false);
  };

  return (
    <Card className="p-6 bg-card border-border max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="font-display text-sm tracking-wider text-muted-foreground">DADOS FISCAIS E CONTATO</h2>
        </div>
        {profile.isActive && profile.id ? (
          <span className="flex items-center gap-1 text-xs text-primary font-display tracking-wider">
            <CheckCircle2 className="h-4 w-4" /> ATIVA
          </span>
        ) : profile.id ? (
          <Button variant="outline" size="sm" onClick={onActivate} className="font-display tracking-wider">
            ATIVAR EMPRESA
          </Button>
        ) : null}
      </div>

      <div className="mb-4">
        <label className="text-xs font-display tracking-wider text-muted-foreground mb-2 block">RÓTULO (NOME CURTO)</label>
        <Input value={label} onChange={e => setLabel(e.target.value)} className="bg-secondary" placeholder="Ex.: Matriz, Filial..." />
      </div>

      <div className="mb-6">
        <label className="text-xs font-display tracking-wider text-muted-foreground mb-2 block">LOGÓTIPO DA EMPRESA</label>
        <div className="flex items-center gap-4">
          {info.logoUrl ? (
            <div className="relative">
              <img src={info.logoUrl} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain rounded border border-border bg-secondary p-1" />
              <button onClick={() => setInfo({ ...info, logoUrl: '' })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
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
        <Input placeholder="Razão Social" value={info.name} onChange={e => handleChange('name', e.target.value)} className="bg-secondary" />
        <Input placeholder="NIF" value={info.nif} onChange={e => handleChange('nif', e.target.value)} className="bg-secondary" />
        <Input placeholder="Inscrição Estadual" value={info.ie} onChange={e => handleChange('ie', e.target.value)} className="bg-secondary" />
        <Input placeholder="Telefone" value={info.phone} onChange={e => handleChange('phone', e.target.value)} className="bg-secondary" />
        <Input placeholder="E-mail" value={info.email} onChange={e => handleChange('email', e.target.value)} className="bg-secondary" />
        <Input placeholder="Website" value={info.website} onChange={e => handleChange('website', e.target.value)} className="bg-secondary" />
        <Input placeholder="Endereço" value={info.address} onChange={e => handleChange('address', e.target.value)} className="bg-secondary col-span-full" />
        <Input placeholder="Provincia" value={info.provincia} onChange={e => handleChange('provincia', e.target.value)} className="bg-secondary" />
        <Input placeholder="Municipio" value={info.municipio} onChange={e => handleChange('municipio', e.target.value)} className="bg-secondary" />
        <Input placeholder="Rua" value={info.rua} onChange={e => handleChange('rua', e.target.value)} className="bg-secondary" />
      </div>

      <Button onClick={() => onSave(info, label)} className="mt-6 glow-primary font-display tracking-wider">SALVAR DADOS</Button>
    </Card>
  );
};

const CompanySettings = () => {
  const { profiles, saveProfile, setActive } = useCompanySettings();
  const { user } = useAuth();
  const [tab, setTab] = useState('1');

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-wider">
        EMPRE<span className="text-primary">SAS</span>
      </h1>
      <p className="text-sm text-muted-foreground">Cadastre até duas empresas. A empresa <span className="text-primary">ativa</span> será usada nos PDFs.</p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {profiles.map(p => (
            <TabsTrigger key={p.slot} value={String(p.slot)} className="font-display tracking-wider">
              {p.label}{p.isActive && p.id ? ' •' : ''}
            </TabsTrigger>
          ))}
        </TabsList>
        {profiles.map(p => (
          <TabsContent key={p.slot} value={String(p.slot)}>
            <SlotEditor
              profile={p}
              userId={user.id}
              onSave={(info, label) => saveProfile(p.slot, info, label)}
              onActivate={() => setActive(p.slot)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CompanySettings;
