import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Client } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('gps_clients', []);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nif.includes(search)
  );

  const handleSave = () => {
    if (!form.name || !form.nif) return;
    if (editing) {
      setClients(clients.map(c => c.id === editing.id ? { ...c, ...form } as Client : c));
    } else {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: form.name || '',
        nif: form.nif || '',
        phone: form.phone || '',
        email: form.email || '',
        address: form.address || '',
        provincia: form.provincia || '',
        municipio: form.municipio || '',
        rua: form.rua || '',
        createdAt: new Date().toISOString(),
      };
      setClients([...clients, newClient]);
    }
    setForm({});
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (c: Client) => {
    setForm(c);
    setEditing(c);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-wider">
          CLI<span className="text-primary">ENTES</span>
        </h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) { setEditing(null); setForm({}); } }}>
          <DialogTrigger asChild>
            <Button className="glow-primary font-display tracking-wider">
              <Plus className="h-4 w-4 mr-2" /> NOVO CLIENTE
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider">
                {editing ? 'EDITAR' : 'NOVO'} <span className="text-primary">CLIENTE</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nome *" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary" />
              <Input placeholder="NIF *" value={form.nif || ''} onChange={e => setForm({...form, nif: e.target.value})} className="bg-secondary" />
              <Input placeholder="Telefone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="bg-secondary" />
              <Input placeholder="E-mail" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary" />
              <Input placeholder="Endereço" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="bg-secondary col-span-full" />
              <Input placeholder="Provincia" value={form.provincia || ''} onChange={e => setForm({...form, provincia: e.target.value})} className="bg-secondary" />
              <Input placeholder="Municipio" value={form.municipio || ''} onChange={e => setForm({...form, municipio: e.target.value})} className="bg-secondary" />
              <Input placeholder="Rua" value={form.rua || ''} onChange={e => setForm({...form, rua: e.target.value})} className="bg-secondary" />
            </div>
            <Button onClick={handleSave} className="w-full mt-2 glow-primary font-display tracking-wider">SALVAR</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary" />
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/50">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">NIF</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Telefone</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Provincia</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.nif}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{c.phone}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{c.provincia}/{c.municipio}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default Clients;
