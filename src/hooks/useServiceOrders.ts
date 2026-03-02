import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ServiceOrder } from '@/types';

interface DbServiceOrder {
  id: string;
  number: string;
  client_id: string | null;
  client_name: string;
  technician_id: string | null;
  technician_name: string;
  product_id: string | null;
  product_name: string;
  description: string;
  diagnosis: string;
  solution: string;
  status: string;
  priority: string;
  value: number;
  created_at: string;
  completed_at: string | null;
}

function toServiceOrder(d: DbServiceOrder): ServiceOrder {
  return {
    id: d.id,
    number: d.number,
    clientId: d.client_id || '',
    clientName: d.client_name,
    technicianId: d.technician_id || '',
    technicianName: d.technician_name,
    productId: d.product_id || '',
    productName: d.product_name,
    description: d.description,
    diagnosis: d.diagnosis,
    solution: d.solution,
    status: d.status as ServiceOrder['status'],
    priority: d.priority as ServiceOrder['priority'],
    value: Number(d.value),
    createdAt: d.created_at,
    completedAt: d.completed_at || undefined,
  };
}

export function useServiceOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('service_orders').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar ordens'); } else { setOrders((data || []).map(toServiceOrder)); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getNextNumber = async (): Promise<string> => {
    const { count } = await supabase.from('service_orders').select('*', { count: 'exact', head: true });
    return String((count || 0) + 1).padStart(5, '0');
  };

  const addOrder = async (order: {
    clientId: string; clientName: string; technicianId: string; technicianName: string;
    productId: string; productName: string; description: string; diagnosis: string;
    solution: string; status: string; priority: string; value: number;
  }) => {
    if (!user) return;
    const number = await getNextNumber();
    const { error } = await supabase.from('service_orders').insert({
      user_id: user.id, number,
      client_id: order.clientId || null, client_name: order.clientName,
      technician_id: order.technicianId || null, technician_name: order.technicianName,
      product_id: order.productId || null, product_name: order.productName,
      description: order.description, diagnosis: order.diagnosis, solution: order.solution,
      status: order.status, priority: order.priority, value: order.value,
    });
    if (error) { toast.error('Erro ao salvar OS'); return; }
    toast.success('OS criada!');
    fetchOrders();
  };

  const updateOrder = async (id: string, order: Partial<{
    clientId: string; clientName: string; technicianId: string; technicianName: string;
    productId: string; productName: string; description: string; diagnosis: string;
    solution: string; status: string; priority: string; value: number;
  }>) => {
    const dbUpdate: Record<string, any> = {};
    if (order.clientId !== undefined) dbUpdate.client_id = order.clientId || null;
    if (order.clientName !== undefined) dbUpdate.client_name = order.clientName;
    if (order.technicianId !== undefined) dbUpdate.technician_id = order.technicianId || null;
    if (order.technicianName !== undefined) dbUpdate.technician_name = order.technicianName;
    if (order.productId !== undefined) dbUpdate.product_id = order.productId || null;
    if (order.productName !== undefined) dbUpdate.product_name = order.productName;
    if (order.description !== undefined) dbUpdate.description = order.description;
    if (order.diagnosis !== undefined) dbUpdate.diagnosis = order.diagnosis;
    if (order.solution !== undefined) dbUpdate.solution = order.solution;
    if (order.status !== undefined) {
      dbUpdate.status = order.status;
      if (order.status === 'completed') dbUpdate.completed_at = new Date().toISOString();
    }
    if (order.priority !== undefined) dbUpdate.priority = order.priority;
    if (order.value !== undefined) dbUpdate.value = order.value;

    const { error } = await supabase.from('service_orders').update(dbUpdate).eq('id', id);
    if (error) { toast.error('Erro ao atualizar OS'); return; }
    toast.success('OS atualizada!');
    fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('service_orders').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir OS'); return; }
    fetchOrders();
  };

  return { orders, loading, addOrder, updateOrder, deleteOrder, refetch: fetchOrders };
}
