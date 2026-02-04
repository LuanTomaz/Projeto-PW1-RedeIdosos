import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  LayoutDashboard,
  Users,
  UserCircle,
  HandHeart,
  Building2,
  CalendarHeart,
  MapPin,
  Star,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const roleLabels: Record<string, string> = {
  pending: 'Cadastro Pendente',
  admin: 'Administrador',
  ong: 'ONG',
  voluntario: 'Voluntário',
  idoso: 'Idoso',
};

const roleColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  admin: 'role-admin',
  ong: 'role-ong',
  voluntario: 'role-voluntario',
  idoso: 'role-idoso',
};

const getNavItems = (role: string) => {
  const baseItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  if (role === 'pending') {
    return [
      ...baseItems,
      { path: '/dashboard/onboarding', icon: UserCircle, label: 'Completar Cadastro' },
      { path: '/dashboard/pending', icon: Shield, label: 'Status da Conta' },
    ];
  }

  const roleItems: Record<string, typeof baseItems> = {
    admin: [
      { path: '/dashboard/users', icon: Users, label: 'Usuários' },
      { path: '/dashboard/elders', icon: UserCircle, label: 'Idosos' },
      { path: '/dashboard/volunteers', icon: HandHeart, label: 'Voluntários' },
      { path: '/dashboard/ongs', icon: Building2, label: 'ONGs' },
      { path: '/dashboard/companionships', icon: CalendarHeart, label: 'Companhias' },
      { path: '/dashboard/verifications', icon: ClipboardCheck, label: 'Verificações' },
      { path: '/dashboard/map', icon: MapPin, label: 'Mapa' },
      { path: '/dashboard/reports', icon: FileText, label: 'Relatórios' },
    ],
    ong: [
      { path: '/dashboard/elders', icon: UserCircle, label: 'Idosos' },
      { path: '/dashboard/volunteers', icon: HandHeart, label: 'Voluntários' },
      { path: '/dashboard/companionships', icon: CalendarHeart, label: 'Companhias' },
      { path: '/dashboard/map', icon: MapPin, label: 'Mapa' },
      { path: '/dashboard/reports', icon: FileText, label: 'Relatórios' },
    ],
    voluntario: [
      { path: '/dashboard/companionships', icon: CalendarHeart, label: 'Companhias' },
      { path: '/dashboard/my-activities', icon: CalendarHeart, label: 'Minhas Atividades' },
      { path: '/dashboard/map', icon: MapPin, label: 'Mapa' },
      { path: '/dashboard/reviews', icon: Star, label: 'Avaliações' },
    ],
    idoso: [
      { path: '/dashboard/my-requests', icon: CalendarHeart, label: 'Minhas Solicitações' },
      { path: '/dashboard/new-request', icon: CalendarHeart, label: 'Nova Solicitação' },
      { path: '/dashboard/reviews', icon: Star, label: 'Avaliações' },
    ],
  };

  return [...baseItems, ...(roleItems[role] || [])];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = getNavItems(user.papel);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 hero-gradient rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">
              Rede de Companhia
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed top-0 left-0 z-50 h-screen w-[280px] bg-sidebar border-r border-sidebar-border',
                'lg:translate-x-0 lg:transition-none'
              )}
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-sidebar-border">
                  <div className="p-2 hero-gradient rounded-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-display font-bold text-sidebar-foreground text-lg">
                    Rede de Companhia
                  </span>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-sidebar-border">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.foto_perfil_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sidebar-foreground truncate">
                        {user.nome}
                      </p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', roleColors[user.papel])}>
                        {roleLabels[user.papel]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-sidebar-border space-y-1">
                  {user.papel !== 'pending' && (
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      location.pathname === '/dashboard/profile'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Configurações</span>
                  </Link>
                )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}





