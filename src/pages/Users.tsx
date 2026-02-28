import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users as UsersIcon, Shield, User, Loader2 } from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

const Users = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('admin-list-users', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || 'Erro ao carregar usuários', variant: 'destructive' });
    } else {
      setUsers(res.data.users || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('admin-create-user', {
      body: { email: newEmail, password: newPassword, role: newRole },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || 'Erro ao criar usuário', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Usuário criado com sucesso' });
      setDialogOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers();
    }
    setCreating(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('admin-delete-user', {
      body: { userId },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || 'Erro ao remover usuário', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Usuário removido' });
      fetchUsers();
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-wider text-foreground">
            GESTÃO DE <span className="text-primary">USUÁRIOS</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Criar e gerenciar contas de acesso</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glow-primary font-display tracking-wider">
              <Plus className="h-4 w-4 mr-2" /> NOVO USUÁRIO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider text-foreground">Criar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">E-mail</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary border-border"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Função</label>
                <Select value={newRole} onValueChange={(v: 'admin' | 'user') => setNewRole(v)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full glow-primary font-display tracking-wider" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CRIAR USUÁRIO'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/50">
              <TableHead className="text-muted-foreground font-display text-xs tracking-wider">E-MAIL</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs tracking-wider">FUNÇÃO</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs tracking-wider">CRIADO EM</TableHead>
              <TableHead className="text-muted-foreground font-display text-xs tracking-wider text-right">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map(u => (
                <TableRow key={u.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="text-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                      {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {u.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u.id)}
                        className="text-muted-foreground hover:text-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
