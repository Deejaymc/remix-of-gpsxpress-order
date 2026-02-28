import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CompanyInfo } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

const defaultCompany: CompanyInfo = {
  name: 'GPSXPRESS',
  nif: '',
  ie: '',
  address: '',
  provincia: '',
  municipio: '',
  rua: '',
  phone: '',
  email: '',
  website: '',
};

const CompanySettings = () => {
  const [company, setCompany] = useLocalStorage<CompanyInfo>('gps_company', defaultCompany);

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setCompany({ ...company, [field]: value });
  };

  const handleSave = () => {
    toast.success('Dados da empresa salvos com sucesso!');
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
