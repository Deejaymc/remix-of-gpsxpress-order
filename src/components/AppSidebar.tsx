import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Wrench,
  Building2,
  LogOut,
  Shield,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ordens de Serviço', url: '/ordens', icon: FileText },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Técnicos', url: '/tecnicos', icon: Wrench },
  { title: 'Empresa', url: '/empresa', icon: Building2 },
  { title: 'Usuários', url: '/usuarios', icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const { logout, isAdmin } = useAuth();
  const { profiles, activeProfile, setActive } = useCompanySettings();
  const cadastradas = profiles.filter(p => p.id);

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <div className="p-4 flex items-center justify-center border-b border-border">
        <img src={logo} alt="GPSXpress" className="h-12" />
      </div>

      {cadastradas.length > 0 && (
        <div className="px-3 py-3 border-b border-border">
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-1.5">EMPRESA ATIVA</label>
          <div className="flex flex-col gap-1">
            {profiles.map(p => {
              const disabled = !p.id;
              const isActive = activeProfile?.slot === p.slot && !!p.id;
              return (
                <button
                  key={p.slot}
                  disabled={disabled}
                  onClick={() => setActive(p.slot)}
                  className={`text-left text-xs px-2 py-1.5 rounded border transition-colors ${
                    isActive
                      ? 'border-primary text-primary bg-primary/10 glow-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                  } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {p.label}{disabled ? ' (vazia)' : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-xs tracking-widest text-muted-foreground">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => !('adminOnly' in item) || isAdmin)
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-primary glow-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:text-accent hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </Sidebar>
  );
}
