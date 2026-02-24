import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError('Credenciais inválidas. Use qualquer e-mail e senha com 4+ caracteres.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-accent/5" />
      </div>

      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="GPSXpress" className="h-20 mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground tracking-wider">
            SISTEMA DE <span className="text-primary">ORDEM DE SERVIÇO</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-border focus:border-primary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 bg-secondary border-border focus:border-primary"
              required
            />
          </div>

          {error && <p className="text-accent text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full font-display tracking-wider glow-primary">
            ENTRAR
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
