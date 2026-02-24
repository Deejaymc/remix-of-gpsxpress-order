import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ordens de Serviço', url: '/ordens', icon: FileText },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Técnicos', url: '/tecnicos', icon: Wrench },
  { title: 'Empresa', url: '/empresa', icon: Building2 },
];

export function AppSidebar() {
  const { logout } = useAuth();

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <div className="p-4 flex items-center justify-center border-b border-border">
        <img src={logo} alt="GPSXpress" className="h-12" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-xs tracking-widest text-muted-foreground">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
