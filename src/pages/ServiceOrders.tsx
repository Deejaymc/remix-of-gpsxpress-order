import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ServiceOrder, Client, Product, Technician, CompanyInfo } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ServiceOrders = () => {
  const [orders, setOrders] = useLocalStorage<ServiceOrder[]>('gps_orders', []);
  const [clients] = useLocalStorage<Client[]>('gps_clients', []);
  const [products] = useLocalStorage<Product[]>('gps_products', []);
  const [technicians] = useLocalStorage<Technician[]>('gps_technicians', []);
  const [company] = useLocalStorage<CompanyInfo>('gps_company', { name: 'GPSXPRESS', cnpj: '', ie: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '', website: '' });
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

  const handleSave = () => {
    if (!form.clientId || !form.description) return;
    const client = clients.find(c => c.id === form.clientId);
    const tech = technicians.find(t => t.id === form.technicianId);
    const prod = products.find(p => p.id === form.productId);

    if (editing) {
      setOrders(orders.map(o => o.id === editing.id ? {
        ...o, ...form,
        clientName: client?.name || o.clientName,
        technicianName: tech?.name || o.technicianName,
        productName: prod?.name || o.productName,
      } as ServiceOrder : o));
    } else {
      const newOrder: ServiceOrder = {
        id: crypto.randomUUID(),
        number: String(orders.length + 1).padStart(5, '0'),
        clientId: form.clientId || '',
        clientName: client?.name || '',
        technicianId: form.technicianId || '',
        technicianName: tech?.name || '',
        productId: form.productId || '',
        productName: prod?.name || '',
        description: form.description || '',
        diagnosis: form.diagnosis || '',
        solution: form.solution || '',
        status: form.status as ServiceOrder['status'] || 'open',
        priority: form.priority as ServiceOrder['priority'] || 'medium',
        value: form.value || 0,
        createdAt: new Date().toISOString(),
      };
      setOrders([...orders, newOrder]);
    }
    setForm({ status: 'open', priority: 'medium' });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (o: ServiceOrder) => { setForm(o); setEditing(o); setOpen(true); };
  const handleDelete = (id: string) => setOrders(orders.filter(o => o.id !== id));

  const drawInvoiceHeader = (doc: jsPDF) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(0, 200, 150);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name || 'GPSXPRESS', 14, 18);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    if (company.cnpj) doc.text(`CNPJ: ${company.cnpj}`, 14, 25);
    if (company.ie) doc.text(`IE: ${company.ie}`, 14, 30);
    const rightX = 196;
    doc.text(company.phone || '', rightX, 18, { align: 'right' });
    doc.text(company.email || '', rightX, 23, { align: 'right' });
    doc.text(company.website || '', rightX, 28, { align: 'right' });
    if (company.address) doc.text(`${company.address}, ${company.city}/${company.state} - CEP: ${company.zipCode}`, rightX, 33, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 16, 210, 16, 'F');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`${company.name || 'GPSXPRESS'} — Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, pageHeight - 6, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    drawInvoiceHeader(doc);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE ORDENS DE SERVIÇO', 14, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Total: ${filtered.length} ordens | Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 56);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 62,
      head: [['Nº', 'Cliente', 'Técnico', 'Status', 'Prioridade', 'Valor (R$)']],
      body: filtered.map(o => [
        `#${o.number}`,
        o.clientName,
        o.technicianName || '—',
        o.status === 'open' ? 'Aberta' : o.status === 'in_progress' ? 'Em Andamento' : o.status === 'completed' ? 'Concluída' : 'Cancelada',
        o.priority === 'low' ? 'Baixa' : o.priority === 'medium' ? 'Média' : 'Alta',
        o.value?.toFixed(2) || '0.00',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: [0, 200, 150], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      foot: [['', '', '', '', 'TOTAL', `R$ ${filtered.reduce((s, o) => s + (o.value || 0), 0).toFixed(2)}`]],
      footStyles: { fillColor: [15, 23, 42], textColor: [0, 200, 150], fontStyle: 'bold' },
    });
    drawFooter(doc);
    doc.save('relatorio-os.pdf');
  };

  const exportSinglePDF = (o: ServiceOrder) => {
    const doc = new jsPDF();
    drawInvoiceHeader(doc);
    doc.setFillColor(0, 200, 150);
    doc.rect(14, 44, 182, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`ORDEM DE SERVIÇO  #${o.number}`, 105, 51, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    const statusLabel = o.status === 'open' ? 'Aberta' : o.status === 'in_progress' ? 'Em Andamento' : o.status === 'completed' ? 'Concluída' : 'Cancelada';
    const prioLabel = o.priority === 'low' ? 'Baixa' : o.priority === 'medium' ? 'Média' : 'Alta';
    autoTable(doc, {
      startY: 60,
      body: [
        ['Cliente', o.clientName, 'Data', new Date(o.createdAt).toLocaleDateString('pt-BR')],
        ['Técnico', o.technicianName || '—', 'Status', statusLabel],
        ['Produto', o.productName || '—', 'Prioridade', prioLabel],
      ],
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30, textColor: [100, 100, 100] },
        1: { cellWidth: 65 },
        2: { fontStyle: 'bold', cellWidth: 30, textColor: [100, 100, 100] },
        3: { cellWidth: 57 },
      },
    });
    let curY = (doc as any).lastAutoTable.finalY + 6;
    const sections = [
      { title: 'DESCRIÇÃO DO SERVIÇO', content: o.description },
      { title: 'DIAGNÓSTICO', content: o.diagnosis },
      { title: 'SOLUÇÃO APLICADA', content: o.solution },
    ];
    sections.forEach(sec => {
      if (!sec.content) return;
      doc.setFillColor(240, 240, 245);
      doc.rect(14, curY, 182, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(sec.title, 17, curY + 5);
      curY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(sec.content, 175);
      doc.text(lines, 17, curY + 4);
      curY += lines.length * 5 + 8;
    });
    curY += 4;
    doc.setFillColor(15, 23, 42);
    doc.rect(110, curY, 86, 14, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 200, 150);
    doc.text('VALOR TOTAL:', 114, curY + 9);
    doc.text(`R$ ${o.value?.toFixed(2) || '0.00'}`, 192, curY + 9, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    const sigY = curY + 34;
    doc.setDrawColor(180);
    doc.line(14, sigY, 90, sigY);
    doc.line(120, sigY, 196, sigY);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Assinatura do Cliente', 52, sigY + 5, { align: 'center' });
    doc.text('Assinatura do Técnico', 158, sigY + 5, { align: 'center' });
    drawFooter(doc);
    doc.save(`os-${o.number}.pdf`);
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
                <Input placeholder="Valor R$" type="number" value={form.value || ''} onChange={e => setForm({...form, value: Number(e.target.value)})} className="bg-secondary" />
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
                  <td className="py-3 px-4 text-right hidden sm:table-cell">R$ {o.value?.toFixed(2)}</td>
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
