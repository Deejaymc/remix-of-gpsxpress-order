import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('gps_products', []);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setProducts(products.map(p => p.id === editing.id ? { ...p, ...form } as Product : p));
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: form.name || '',
        description: form.description || '',
        brand: form.brand || '',
        model: form.model || '',
        price: form.price || 0,
        stock: form.stock || 0,
        createdAt: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
    }
    setForm({});
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (p: Product) => { setForm(p); setEditing(p); setOpen(true); };
  const handleDelete = (id: string) => setProducts(products.filter(p => p.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-wider">
          PRODU<span className="text-primary">TOS</span>
        </h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) { setEditing(null); setForm({}); } }}>
          <DialogTrigger asChild>
            <Button className="glow-primary font-display tracking-wider"><Plus className="h-4 w-4 mr-2" /> NOVO PRODUTO</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider">{editing ? 'EDITAR' : 'NOVO'} <span className="text-primary">PRODUTO</span></DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nome *" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary" />
              <Input placeholder="Marca" value={form.brand || ''} onChange={e => setForm({...form, brand: e.target.value})} className="bg-secondary" />
              <Input placeholder="Modelo" value={form.model || ''} onChange={e => setForm({...form, model: e.target.value})} className="bg-secondary" />
              <Input placeholder="Preço" type="number" value={form.price || ''} onChange={e => setForm({...form, price: Number(e.target.value)})} className="bg-secondary" />
              <Input placeholder="Estoque" type="number" value={form.stock || ''} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="bg-secondary" />
              <Input placeholder="Descrição" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary col-span-full" />
            </div>
            <Button onClick={handleSave} className="w-full mt-2 glow-primary font-display tracking-wider">SALVAR</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary" />
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/50">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Marca</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Modelo</th>
                <th className="text-right py-3 px-4">Preço</th>
                <th className="text-right py-3 px-4">Estoque</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{p.brand}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{p.model}</td>
                  <td className="py-3 px-4 text-right">Ao {p.price?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{p.stock}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default Products;
