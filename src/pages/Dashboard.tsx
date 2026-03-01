import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ServiceOrder, CompanyInfo } from '@/types';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Users, Package, Wrench, TrendingUp, Clock, CheckCircle, AlertTriangle, FileDown, Eye } from 'lucide-react';
import { exportSingleOrderPDF } from '@/utils/pdfGenerator';

const statusLabels: Record<ServiceOrder['status'], string> = {
  open: 'Aberta',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const priorityLabels: Record<ServiceOrder['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const Dashboard = () => {
  const [orders] = useLocalStorage<ServiceOrder[]>('gps_orders', []);
  const [clients] = useLocalStorage<any[]>('gps_clients', []);
  const [products] = useLocalStorage<any[]>('gps_products', []);
  const [technicians] = useLocalStorage<any[]>('gps_technicians', []);
  const [company] = useLocalStorage<CompanyInfo>('gps_company', { name: 'GPSXPRESS', nif: '', ie: '', address: '', provincia: '', municipio: '', rua: '', phone: '', email: '', website: '' });
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const openOrders = orders.filter(o => o.status === 'open').length;
  const inProgress = orders.filter(o => o.status === 'in_progress').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.value || 0), 0);

  const stats = [
    { label: 'Ordens Abertas', value: openOrders, icon: Clock, color: 'text-warning' },
    { label: 'Em Andamento', value: inProgress, icon: TrendingUp, color: 'text-primary' },
    { label: 'Concluídas', value: completed, icon: CheckCircle, color: 'text-success' },
    { label: 'Faturamento', value: `Ao ${totalValue.toFixed(2)}`, icon: TrendingUp, color: 'text-primary' },
  ];

  const cards = [
    { label: 'Clientes', value: clients.length, icon: Users },
    { label: 'Produtos', value: products.length, icon: Package },
    { label: 'Técnicos', value: technicians.length, icon: Wrench },
    { label: 'Total OS', value: orders.length, icon: FileText },
  ];

  const recentOrders = orders.slice(-5).reverse();

  const statusClass = (status: ServiceOrder['status']) =>
    status === 'open' ? 'bg-warning/20 text-warning' :
    status === 'in_progress' ? 'bg-primary/20 text-primary' :
    status === 'completed' ? 'bg-success/20 text-success' :
    'bg-destructive/20 text-destructive';

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-wider">
        DASH<span className="text-primary">BOARD</span>
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 bg-card border-border hover:glow-primary transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color} opacity-50`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 bg-card border-border text-center">
            <c.icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card className="p-4 bg-card border-border">
        <h2 className="font-display text-sm tracking-wider text-muted-foreground mb-4">ÚLTIMAS ORDENS DE SERVIÇO</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma ordem de serviço cadastrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2">Nº</th>
                  <th className="text-left py-2 px-2">Cliente</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-right py-2 px-2">Valor</th>
                  <th className="text-right py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/50 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    <td className="py-2 px-2 font-display text-primary">#{o.number}</td>
                    <td className="py-2 px-2">{o.clientName}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClass(o.status)}`}>
                        {statusLabels[o.status]}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">Ao {o.value?.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right">
                      <Eye className="h-4 w-4 text-muted-foreground inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">
                  OS <span className="text-primary">#{selectedOrder.number}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusClass(selectedOrder.status)}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Prioridade: {priorityLabels[selectedOrder.priority]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Cliente</p>
                    <p className="font-medium">{selectedOrder.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Técnico</p>
                    <p className="font-medium">{selectedOrder.technicianName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Produto</p>
                    <p className="font-medium">{selectedOrder.productName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Data</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {selectedOrder.description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                    <p className="text-foreground">{selectedOrder.description}</p>
                  </div>
                )}
                {selectedOrder.diagnosis && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Diagnóstico</p>
                    <p className="text-foreground">{selectedOrder.diagnosis}</p>
                  </div>
                )}
                {selectedOrder.solution && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Solução</p>
                    <p className="text-foreground">{selectedOrder.solution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="font-display text-lg font-bold text-primary">Ao {selectedOrder.value?.toFixed(2)}</p>
                  <Button variant="outline" size="sm" onClick={() => exportSingleOrderPDF(selectedOrder, company)}>
                    <FileDown className="h-4 w-4 mr-1" /> Exportar PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
