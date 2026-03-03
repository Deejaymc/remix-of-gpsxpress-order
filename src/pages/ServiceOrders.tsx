import { useState } from 'react';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { ServiceOrder } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit, FileDown } from 'lucide-react';
import { exportSingleOrderPDF, exportOrdersReportPDF } from '@/utils/pdfGenerator';

const ServiceOrders = () => {
  const { orders, addOrder, updateOrder, deleteOrder } = useServiceOrders();
  const { clients } = useClients();
  const { products } = useProducts();
  const { technicians } = useTechnicians();
  const { company } = useCompanySettings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceOrder | null>(null);
  const [form, setForm] = useState<Partial<ServiceOrder>>({ status: 'open', priority: 'medium' });

  const filtered = orders.filter(o => {
    const matchSearch = o.number.includes(search) || o.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!form.clientId || !form.description) return;
    const client = clients.find(c => c.id === form.clientId);
    const tech = technicians.find(t => t.id === form.technicianId);
    const prod = products.find(p => p.id === form.productId);

    if (editing) {
      await updateOrder(editing.id, {
        ...form,
        clientName: client?.name || editing.clientName,
        technicianName: tech?.name || editing.technicianName,
        productName: prod?.name || editing.productName,
      });
    } else {
      await addOrder({
        clientId: form.clientId || '',
        clientName: client?.name || '',
        technicianId: form.technicianId || '',
        technicianName: tech?.name || '',
        productId: form.productId || '',
        productName: prod?.name || '',
        description: form.description || '',
        diagnosis: form.diagnosis || '',
        solution: form.solution || '',
        status: form.status || 'open',
        priority: form.priority || 'medium',
        value: form.value || 0,
      });
    }
    setForm({ status: 'open', priority: 'medium' });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (o: ServiceOrder) => { setForm(o); setEditing(o); setOpen(true); };
  const handleDelete = (id: string) => deleteOrder(id);

  const exportPDF = () => exportOrdersReportPDF(filtered, company);
  const exportSinglePDF = (o: ServiceOrder) => {
    const client = clients.find(c => c.id === o.clientId);
    exportSingleOrderPDF(o, company, client);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-wider">
          ORDENS DE <span className="text-primary">SERVIÇO</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF} className="font-display tracking-wider text-xs">
            <FileDown className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) { setEditing(null); setForm({ status: 'open', priority: 'medium' }); } }}>
            <DialogTrigger asChild>
              <Button className="glow-primary font-display tracking-wider"><Plus className="h-4 w-4 mr-2" /> NOVA OS</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">{editing ? 'EDITAR' : 'NOVA'} <span className="text-primary">ORDEM DE SERVIÇO</span></DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={form.clientId || ''} onValueChange={v => setForm({...form, clientId: v})}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Cliente *" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.technicianId || ''} onValueChange={v => setForm({...form, technicianId: v})}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Técnico" /></SelectTrigger>
                  <SelectContent>{technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.productId || ''} onValueChange={v => setForm({...form, productId: v})}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Produto" /></SelectTrigger>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.status || 'open'} onValueChange={v => setForm({...form, status: v as ServiceOrder['status']})}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.priority || 'medium'} onValueChange={v => setForm({...form, priority: v as ServiceOrder['priority']})}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Valor Ao" type="number" value={form.value || ''} onChange={e => setForm({...form, value: Number(e.target.value)})} className="bg-secondary" />
                <Textarea placeholder="Descrição do serviço *" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary col-span-full" />
                <Textarea placeholder="Diagnóstico" value={form.diagnosis || ''} onChange={e => setForm({...form, diagnosis: e.target.value})} className="bg-secondary col-span-full" />
                <Textarea placeholder="Solução" value={form.solution || ''} onChange={e => setForm({...form, solution: e.target.value})} className="bg-secondary col-span-full" />
              </div>
              <Button onClick={handleSave} className="w-full mt-2 glow-primary font-display tracking-wider">SALVAR</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar OS..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-secondary" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-secondary w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/50">
                <th className="text-left py-3 px-4">Nº</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Técnico</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">Valor</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma OS encontrada</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4 font-display text-primary">#{o.number}</td>
                  <td className="py-3 px-4 font-medium">{o.clientName}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{o.technicianName}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      o.status === 'open' ? 'bg-warning/20 text-warning' :
                      o.status === 'in_progress' ? 'bg-primary/20 text-primary' :
                      o.status === 'completed' ? 'bg-success/20 text-success' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {o.status === 'open' ? 'Aberta' : o.status === 'in_progress' ? 'Em Andamento' : o.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right hidden sm:table-cell">Ao {o.value?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => exportSinglePDF(o)} title="PDF"><FileDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(o)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default ServiceOrders;
