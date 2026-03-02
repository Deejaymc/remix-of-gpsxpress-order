import { useState } from 'react';
import { useTechnicians, DbTechnician } from '@/hooks/useTechnicians';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

const Technicians = () => {
  const { technicians, addTechnician, updateTechnician, deleteTechnician } = useTechnicians();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DbTechnician | null>(null);
  const [form, setForm] = useState<Partial<DbTechnician>>({});

  const filtered = technicians.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name) return;
    if (editing) {
      await updateTechnician(editing.id, form);
    } else {
      await addTechnician({
        name: form.name || '',
        phone: form.phone || '',
        email: form.email || '',
        specialty: form.specialty || '',
        active: true,
      });
    }
    setForm({});
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (t: DbTechnician) => { setForm(t); setEditing(t); setOpen(true); };
  const handleDelete = (id: string) => deleteTechnician(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-wider">
          TÉCNI<span className="text-primary">COS</span>
        </h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) { setEditing(null); setForm({}); } }}>
          <DialogTrigger asChild>
            <Button className="glow-primary font-display tracking-wider"><Plus className="h-4 w-4 mr-2" /> NOVO TÉCNICO</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider">{editing ? 'EDITAR' : 'NOVO'} <span className="text-primary">TÉCNICO</span></DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nome *" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary" />
              <Input placeholder="Especialidade" value={form.specialty || ''} onChange={e => setForm({...form, specialty: e.target.value})} className="bg-secondary" />
              <Input placeholder="Telefone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="bg-secondary" />
              <Input placeholder="E-mail" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary" />
            </div>
            <Button onClick={handleSave} className="w-full mt-2 glow-primary font-display tracking-wider">SALVAR</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar técnico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary" />
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/50">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Especialidade</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Telefone</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">E-mail</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum técnico encontrado</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4 font-medium">{t.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{t.specialty}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{t.phone}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{t.email}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Technicians;
