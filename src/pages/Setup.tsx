import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';

type CheckState =
  | { status: 'loading' }
  | { status: 'exists'; count: number }
  | { status: 'none'; tokenConfigured: boolean }
  | { status: 'error'; message: string };

const Setup = () => {
  const navigate = useNavigate();
  const [check, setCheck] = useState<CheckState>({ status: 'loading' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const runCheck = async () => {
    setCheck({ status: 'loading' });
    const { data, error } = await supabase.functions.invoke('check-admin');
    if (error) {
      setCheck({ status: 'error', message: error.message || 'Falha ao verificar.' });
      return;
    }
    if (data?.exists) {
      setCheck({ status: 'exists', count: data.count ?? 1 });
    } else {
      setCheck({ status: 'none', tokenConfigured: !!data?.setup_token_configured });
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token.trim()) {
      setError('Token de setup é obrigatório.');
      return;
    }

    setSubmitting(true);
    const { data, error: fnError } = await supabase.functions.invoke('setup-admin', {
      body: { email, password, setup_token: token },
    });
    setSubmitting(false);

    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || 'Erro ao criar administrador.');
      return;
    }

    toast({ title: 'Administrador criado', description: 'Entre com as credenciais configuradas.' });
    setTimeout(() => navigate('/login'), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="GPSXpress" className="h-16 mb-3" />
          <h1 className="font-display text-lg font-bold text-foreground tracking-wider text-center">
            CONFIGURAÇÃO DO <span className="text-primary">ADMINISTRADOR</span>
          </h1>
        </div>

        {check.status === 'loading' && (
          <div className="flex flex-col items-center py-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <p className="text-sm">Verificando sistema...</p>
          </div>
        )}

        {check.status === 'error' && (
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-accent mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{check.message}</p>
            <Button variant="outline" onClick={runCheck}>Tentar novamente</Button>
          </div>
        )}

        {check.status === 'exists' && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="font-display tracking-wider text-foreground mb-2">
              ADMINISTRADOR JÁ CONFIGURADO
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              O sistema já possui {check.count} administrador{check.count > 1 ? 'es' : ''} ativo.
              Novos usuários só podem ser criados pelo administrador dentro da plataforma.
            </p>
            <Button className="w-full font-display tracking-wider glow-primary" onClick={() => navigate('/login')}>
              IR PARA LOGIN
            </Button>
          </div>
        )}

        {check.status === 'none' && (
          <>
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-secondary/40 mb-5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Nenhum administrador encontrado. Crie o primeiro para liberar o acesso ao sistema.
              </p>
            </div>

            {!check.tokenConfigured && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-accent/40 bg-accent/5 mb-5">
                <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent font-semibold">ADMIN_SETUP_TOKEN não configurado.</span> Peça ao responsável para cadastrar o secret no backend antes de prosseguir.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-mail do administrador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha (mín. 8 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Token de setup"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>

              {error && <p className="text-accent text-sm text-center">{error}</p>}

              <Button type="submit" className="w-full font-display tracking-wider glow-primary" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CRIAR ADMINISTRADOR'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Setup;
